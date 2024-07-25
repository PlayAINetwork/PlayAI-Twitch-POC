import { Elysia, t } from "elysia";
import path from "path";
import { createWriteStream, appendFileSync } from "fs";
import ffmpeg from "fluent-ffmpeg";
import { isCuid } from "@paralleldrive/cuid2";
import axios from "axios";
import { config as dotenvConfig } from "dotenv";
import { PassThrough, Readable } from "stream";
import type { connect } from "bun";
import { ErrorUtil } from "../util";

dotenvConfig();

const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI } = process.env;

if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET || !TWITCH_REDIRECT_URI) {
  throw new Error("Environment variables TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, and TWITCH_REDIRECT_URI must be set");
}

const app = new Elysia({
  name: "AUTH ROUTER"
});

let streamKey = "";

const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}&response_type=code&scope=user:read:email+channel:read:stream_key`;

app.group(
  "/auth",
  {
    detail: {
      tags: ["AUTH"]
    }
  },
  (app) =>
    app
      .get("/twitch", async () => {
        console.log("hi");
        console.log(twitchAuthUrl);
        return Response.redirect(twitchAuthUrl);
      })
      .get("/twitch/callback", async ({ query: { code } }) => await connectTwitch(code), {
        query: t.Object({
          code: t.String()
        })
      })
);

let passThrough: PassThrough | null = null;

app.ws("/twitch/stream", {
  async message(ws, message) {
    console.log(message);
    if (message instanceof Buffer) {
      console.log("Buffer message received of length:", message.length);

      // Pipe the incoming message directly to passThrough
      if (passThrough) passThrough.write(message);
      //console.log(passThrough)
      // Write to a temporary file for verification
      appendFileSync("./temp_received.webm", message);
    } else if (message === "end") {
      console.log("End message received");
      // (ws as any).ffmpegStream?.end();
      ws.close();
      if (passThrough) passThrough.end();
    } else {
      console.log("Unknown message received, closing connection");
      ws.close();
    }
  },

  async open(ws) {
    // console.log(passThrough)

   
    const rtmpUrl = "rtmp://maa01.contribute.live-video.net/app/";
    passThrough = new PassThrough();
    ffmpeg()
      .input(passThrough)
      .inputOptions("-re")
      .outputOptions([
        "-pix_fmt yuvj420p",
        "-x264-params keyint=48:min-keyint=48:scenecut=-1",
        "-b:v 4500k",
        "-b:a 128k",
        "-ar 44100",
        "-acodec aac",
        "-vcodec libx264",
        "-preset medium",
        "-crf 28",
        "-threads 4",
        "-f flv"
      ])
      .output(rtmpUrl)
      .on("start", (commandLine) => {
        console.log("Spawned FFmpeg with command: " + commandLine);
      })
      .on("error", (err, stdout, stderr) => {
        console.log("Error: " + err.message);
        console.log("ffmpeg stderr: " + stderr);
      })
      .on("end", () => {
        console.log("Transcoding succeeded!");
      })
      .run();
  },

  async close(ws) {
    console.log("WebSocket connection closed");
    if (passThrough) {
      passThrough.end();
    }
  }
});

const connectTwitch = async (code: string) => {
  console.log("bye");

  try {
    const tokenResponse = await axios.post("https://id.twitch.tv/oauth2/token", null, {
      params: {
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: TWITCH_REDIRECT_URI
      }
    });

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get("https://api.twitch.tv/helix/users", {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${access_token}`
      }
    });

    const userId = userResponse.data.data[0].id;

    const streamKeyResponse = await axios.get(`https://api.twitch.tv/helix/streams/key?broadcaster_id=${userId}`, {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${access_token}`
      }
    });
    console.log(streamKeyResponse.data.data[0]);
    streamKey = streamKeyResponse.data.data[0].stream_key;
    console.log(streamKey);
    // Save streamKey and access_token in your database for later use
    console.log(`Twitch authentication successful. Stream key: ${streamKey}`);

    const ingestServerResponse = await axios.get("https://ingest.twitch.tv/ingests");
    console.log(ingestServerResponse.data.ingests[0].url_template);

    return { streamKey: streamKey };
  } catch (error) {
    console.error("Error during Twitch authentication:", error);
    console.log("authntication failed");
    throw new ErrorUtil.HttpException(500, "Auth Failed");
  }
};

export default app;

/*ffmpeg -re -i temp_received.webm -pix_fmt yuvj420p -x264-params keyint=48:min-keyint=48:scenecut=-1 -b:v 4500k -b:a 128k -ar 44100 -acodec aac -vcodec libx264 -preset medium -crf 28 -threads 4 -f flv "rtmp://maa01.contribute.live-video.net/app/live_1071550234_IAif697oH0K5QGTu0D532fCloU31gA"
 */
