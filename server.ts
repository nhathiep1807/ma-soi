import "./server-globals";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "./src/lib/types";
import { attachSocketHandlers } from "./src/lib/socket-handlers";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: "*" },
    path: "/api/socket",
  });

  attachSocketHandlers(io);

  httpServer.listen(port, hostname, () => {
    console.log(`> Ma Sói server running on http://${hostname}:${port}`);
  });
});
