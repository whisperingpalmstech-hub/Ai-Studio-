
import { Server as HttpServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { parse } from "url";
import { config } from "../config/index.js";
import { supabaseAdmin } from "./supabase.js";

interface ExtWebSocket extends WebSocket {
    userId?: string;
    isAlive: boolean;
}

class WebSocketService {
    private wss: WebSocketServer | null = null;
    private clients: Map<string, Set<ExtWebSocket>> = new Map(); // userId -> Set<WebSocket>

    initialize(server: HttpServer) {
        this.wss = new WebSocketServer({ server });

        if (this.wss) {
            this.wss.on("connection", async (ws: WebSocket, req) => {
                const extWs = ws as any;
                extWs.isAlive = true;

                ws.on("pong", () => { extWs.isAlive = true; });

                const { query } = parse(req.url || "", true);
                const token = query.token as string;

                if (!token) {
                    console.warn("WebSocket connection attempt without token");
                    ws.close(1008, "Token required");
                    return;
                }

                try {
                    // Verify JWT using Supabase
                    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

                    if (error || !user) {
                        console.warn("WebSocket auth failed: invalid or expired token");
                        ws.close(1008, "Invalid token");
                        return;
                    }

                    const userId = user.id;
                    extWs.userId = userId;
                    this.addClient(userId, extWs);

                    console.log(`WebSocket connected for user: ${userId}`);

                    ws.onclose = () => {
                        this.removeClient(userId, extWs);
                    };

                    ws.on("error", (err) => {
                        console.error(`WebSocket error for user ${userId}:`, err);
                    });
                } catch (err: any) {
                    console.error("WebSocket auth error:", err.message);
                    ws.close(1008, "Auth error");
                }
            });
        }

        // Heartbeat to keep connections alive
        const interval = setInterval(() => {
            this.wss?.clients.forEach((ws) => {
                const extWs = ws as ExtWebSocket;
                if (!extWs.isAlive) return ws.terminate();
                extWs.isAlive = false;
                ws.ping();
            });
        }, 30000);

        this.wss.on("close", () => {
            clearInterval(interval);
        });

        console.log("WebSocket server initialized");
    }

    private addClient(userId: string, ws: ExtWebSocket) {
        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }
        this.clients.get(userId)?.add(ws);

        // Send initial connection success message
        ws.send(JSON.stringify({ type: "connection", status: "connected", userId }));
    }

    private removeClient(userId: string, ws: ExtWebSocket) {
        const userClients = this.clients.get(userId);
        if (userClients) {
            userClients.delete(ws);
            if (userClients.size === 0) {
                this.clients.delete(userId);
            }
        }
    }

    public sendToUser(userId: string, message: any) {
        const userClients = this.clients.get(userId);
        if (userClients) {
            const data = JSON.stringify(message);
            userClients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        }
    }

    public broadcast(message: any) {
        if (!this.wss) return;
        const data = JSON.stringify(message);
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
}

export const webSocketService = new WebSocketService();
