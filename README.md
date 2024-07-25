# PlayAI Twitch POC

## Description

The PlayAI Twitch POC provides an authentication flow with Twitch, handling video stream reception via WebSocket, and live stream transcoding using FFmpeg.This is aimed to be part of the Stream to Earn campaign of PlayAI.

## Setup

1. Clone the repository.
2. Install dependencies using Bun:

    ```sh
    bun install
    ```

3. Create a `.env` file in the root directory and add the following variables:

    ```env
    TWITCH_CLIENT_ID=<your_twitch_client_id>
    TWITCH_CLIENT_SECRET=<your_twitch_client_secret>
    TWITCH_REDIRECT_URI=<your_twitch_redirect_uri>
    ```

4. Start the server:

    ```sh
    bun run start
    ```

## API Endpoints

### Twitch Authentication

- **GET `/auth/twitch`**

  Redirects to Twitch OAuth2 authorization URL.

- **GET `/auth/twitch/callback`**

  Handles Twitch OAuth2 callback, exchanges the authorization code for an access token, and retrieves the stream key.

  **Query Parameters:**
  
  - `code` (string): The authorization code received from Twitch.

### WebSocket for Video Streaming

- **WebSocket `/twitch/stream`**

  - **Message Types:**
    - **Buffer:** Receives video stream chunks.
    - **"end":** Indicates the end of the video stream and closes the connection.
  - **Behavior:**
    - Pipes received video stream chunks to FFmpeg for transcoding and relays the stream to Twitch using RTMP.

## Running the WebSocket Client

To connect to the WebSocket server, use a WebSocket client and connect to the `/twitch/stream` endpoint.

```javascript
const ws = new WebSocket('ws://your-server-address/twitch/stream');

ws.onopen = () => {
    console.log('WebSocket connection opened');
};

ws.onmessage = (event) => {
    if (event.data instanceof Blob) {
        // Handle video stream chunk
    } else {
        console.log('Received message:', event.data);
    }
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};

// To send video stream data
ws.send(videoStreamChunk);

// To indicate the end of the video stream
ws.send("end");
