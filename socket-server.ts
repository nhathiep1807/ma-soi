import { createServer } from "http";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "./src/lib/types";
import { attachSocketHandlers } from "./src/lib/socket-handlers";

const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3001", 10);
const corsOrigin = process.env.CORS_ORIGIN || "*";

function isHealthCheck(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.split("?")[0];
  return path === "/" || path === "/health";
}

const httpServer = createServer((req, res) => {
  if (isHealthCheck(req.url)) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: corsOrigin },
  path: "/api/socket",
});

attachSocketHandlers(io);

httpServer.listen(port, hostname, () => {
  console.log(`> Ma Sói socket server running on http://${hostname}:${port}`);
});

httpServer.on("error", (err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});
