import { WebSocketServer } from "ws";
import { Server } from "http";
import { ICONS } from "../constants/icons";

interface WebSocketDep {
  httpServer: Server;
}

export class WebSocketManager {
  private ws: WebSocketServer;
  private isInitialized: boolean;

  constructor({ httpServer }: WebSocketDep) {
    this.ws = new WebSocketServer({ server: httpServer });
    this.isInitialized = false;
  }

  public initialize(): void {
    if (this.isInitialized) {
      console.warn(`${ICONS.WARNING} WebSocket is already initialized`);
      return;
    }

    this.ws.on("connection", (ws) => {
      ws.on("message", (data) => {
        console.log("Received data:", data);
      });

      ws.send("Connection is good");
    });

    this.isInitialized = true;
    console.log(`${ICONS.SUCCESS} WebSocket initialized`);
  }
}
