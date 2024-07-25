/*import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

// Replace with your actual WebSocket URL
const wsUrl = 'ws://localhost:3000/sdk/stream';
const videoFilePath = path.join(__dirname, 'elephants-dream.webm');
console.log(videoFilePath)

// Create WebSocket connection.
const ws = new WebSocket(wsUrl);

// When the connection is open, send video data
ws.on('open', () => {
    console.log('WebSocket connection opened');
    
    fs.readFile(videoFilePath, (err, data) => {
        if (err) {
            console.error('Error reading video file:', err);
            ws.close();
            return;
        }
  
       // Check the length of the buffer
       const bufferLength = data.length; // or Buffer.byteLength(data)
       console.log(`Buffer length: ${bufferLength} bytes`);

        
       ws.send(data, (error) => {
        if (error) {
            console.error('Error sending video file:', error);
        } else {
            console.log('Video file sent successfully');
        }
        
        // After sending the data, send the 'end' message
        ws.send('end', (error) => {
            if (error) {
                console.error('Error sending "end" message:', error);
            } else {
                console.log('End message sent successfully');
            }
            
            // After sending 'end' message, close the WebSocket
            ws.close();
        });
    });

        console.log("hi")
    });
});

// Log any errors
ws.on('error', (err) => {
    console.error('WebSocket error:', err);
});

// Log when the connection is closed
ws.on('close', () => {
    console.log('WebSocket connection closed');
});*/

import WebSocket from "ws";
import fs from "fs";
import path from "path";

// Replace with your actual WebSocket URL
const wsUrl = "ws://localhost:3000/sdk/stream";
const videoFilePath = path.join(__dirname, "elephants-dream.webm");

// Create WebSocket connection.
const ws = new WebSocket(wsUrl);

// When the connection is open, start streaming video data
ws.on("open", () => {
  console.log("WebSocket connection opened");

  // Open a read stream to the video file
  const readStream = fs.createReadStream(videoFilePath);

  // Handle errors in reading the file
  readStream.on("error", (err) => {
    console.error("Error reading video file:", err);
    ws.close();
  });

  // Send chunks of video data as they become available
  readStream.on("data", (chunk) => {
    // Send each chunk of data
    ws.send(chunk, (error) => {
      if (error) {
        console.error("Error sending video data:", error);
        ws.close();
      }
      // Optionally log successful chunk sending
      console.log(`Sent ${chunk.length} bytes`);
    });
  });

  // When the entire file has been read, send the 'end' message
  readStream.on("end", () => {
    ws.send("end", (error) => {
      if (error) {
        console.error('Error sending "end" message:', error);
      } else {
        console.log("End message sent successfully");
      }
      // After sending 'end' message, close the WebSocket
      ws.close();
    });
  });
});

// Log any errors
ws.on("error", (err) => {
  console.error("WebSocket error:", err);
});

// Log when the connection is closed
ws.on("close", () => {
  console.log("WebSocket connection closed");
});
