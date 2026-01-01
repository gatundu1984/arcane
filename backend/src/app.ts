import express from "express";
import { createServer } from "http";
import { WebSocketManager } from "./websocket/websocket_manager";
import { ICONS } from "./constants/icons";

const app = express();
const httpServer = createServer(app);
const wsManager = new WebSocketManager({ httpServer });

export function initializeServer(): void {
  const PORT = process.env.PORT ?? 4000;

  try {
    wsManager.initialize();
    httpServer.listen(PORT, () => {
      console.log(`${ICONS.SUCCESS} Server is listening on port ${PORT}`);
    });
  } catch (err) {
    console.error(`${ICONS.FAILED} Failed to start server:`, err);
    process.exit(1);
  }
}
