import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { serverTiming } from "@elysiajs/server-timing";
import { cors } from "@elysiajs/cors";
import Router from "./route";
import { ErrorUtil } from "./util";
import { createId } from "@paralleldrive/cuid2";
import os from "os";

const PORT = Bun.env.PORT || 3000;
console.log(createId().slice(0, 24));

const app = new Elysia()
  .onStart((app) => {
    console.log(`Server started on port ${app.server?.port}`);
  })
  .use(cors())
  .use(
    serverTiming({
      enabled: Bun.env.ENV !== "production"
    })
  )
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "PlayAI Twitch",
          version: "1.0.0"
        }
      }
    })
  )
  .use(Router)
  .onError(({ error }) => {
    console.error(error);

    if (error instanceof ErrorUtil.HttpException) {
      const message = JSON.stringify({
        message: error.message
      });

      return new Response(message, {
        status: error.status,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }

    throw error;
  })
  .listen(PORT);
