import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketManager } from "./websocket/websocket_manager";
import { ICONS } from "./constants/icons";
import { connectDb } from "./database/postgres/connet_db";

const app = express();
const httpServer = createServer(app);
const wsManager = new WebSocketManager({ httpServer });

export async function initializeServer(): Promise<void> {
  const PORT = process.env.PORT ?? 4000;

  try {
    await connectDb();
    wsManager.initialize();
    httpServer.listen(PORT, () => {
      console.log(`${ICONS.SUCCESS} Server is listening on port ${PORT}`);
    });
  } catch (err) {
    console.error(`${ICONS.FAILED} Failed to start server:`, err);
    process.exit(1);
  }
}
