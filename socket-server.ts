import { createServer } from "http";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "./src/lib/types";
import { attachSocketHandlers } from "./src/lib/socket-handlers";

const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3001", 10);
const corsOrigin = process.env.CORS_ORIGIN || "*";

const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
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
