import "./server-globals";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import type { ClientToServerEvents, RoleConfig, ServerToClientEvents } from "./src/lib/types";
import {
  assignRoles,
  createRoundNote,
  sanitizeRoomForClient,
  validateRoleConfig,
} from "./src/lib/game-logic";
import {
  createRoom,
  getRoom,
  joinRoom,
  removePlayer,
  setPlayerConnected,
  updateRoom,
  updateRoleConfig,
} from "./src/lib/room-store";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function emitRoomUpdate(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  roomCode: string
) {
  const room = getRoom(roomCode);
  if (!room) return;

  const sockets = io.sockets.sockets;
  sockets.forEach((socket) => {
    const data = socket.data as { playerId?: string; roomCode?: string };
    if (data.roomCode === roomCode && data.playerId) {
      socket.emit("roomUpdate", sanitizeRoomForClient(room, data.playerId), data.playerId);
    }
  });
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: "*" },
    path: "/api/socket",
  });

  io.on("connection", (socket) => {
    socket.on("createRoom", (playerName, callback) => {
      const playerId = uuidv4();
      const room = createRoom(playerId, playerName.trim());
      socket.data = { playerId, roomCode: room.code };
      socket.join(room.code);
      callback({ roomCode: room.code, playerId });
      emitRoomUpdate(io, room.code);
    });

    socket.on("joinRoom", (roomCode, playerName, callback) => {
      const room = getRoom(roomCode);
      if (!room) {
        callback({ success: false, error: "Phòng không tồn tại" });
        return;
      }
      if (room.phase !== "lobby") {
        callback({ success: false, error: "Game đã bắt đầu" });
        return;
      }

      const playerId = uuidv4();
      const updated = joinRoom(roomCode, playerId, playerName.trim());
      if (!updated) {
        callback({ success: false, error: "Không thể tham gia phòng" });
        return;
      }

      socket.data = { playerId, roomCode: updated.code };
      socket.join(updated.code);
      callback({ success: true, playerId });
      emitRoomUpdate(io, updated.code);
    });

    socket.on("reconnect", (roomCode, playerId, callback) => {
      const room = getRoom(roomCode);
      const player = room?.players.find((p) => p.id === playerId);
      if (!room || !player) {
        callback({ success: false });
        return;
      }
      setPlayerConnected(playerId, true);
      socket.data = { playerId, roomCode: room.code };
      socket.join(room.code);
      callback({ success: true });
      emitRoomUpdate(io, room.code);
    });

    socket.on("updateRoleConfig", (roleConfig: RoleConfig) => {
      const { playerId, roomCode } = socket.data as { playerId?: string; roomCode?: string };
      if (!playerId || !roomCode) return;

      const room = getRoom(roomCode);
      if (!room || room.hostId !== playerId) return;

      updateRoleConfig(roomCode, roleConfig);
      emitRoomUpdate(io, roomCode);
    });

    socket.on("startGame", () => {
      const { playerId, roomCode } = socket.data as { playerId?: string; roomCode?: string };
      if (!playerId || !roomCode) return;

      const room = getRoom(roomCode);
      if (!room || room.hostId !== playerId) return;

      const nonHostCount = room.players.filter((p) => !p.isHost).length;
      if (nonHostCount < 1) {
        socket.emit("error", "Cần ít nhất 1 người chơi khác trưởng phòng");
        return;
      }

      const error = validateRoleConfig(room.roleConfig, nonHostCount);
      if (error) {
        socket.emit("error", error);
        return;
      }

      room.players = assignRoles(room.players, room.roleConfig);
      room.phase = "playing";
      room.roundNotes = [createRoundNote(1)];
      updateRoom(roomCode, room);
      io.to(roomCode).emit("gameStarted");
      emitRoomUpdate(io, roomCode);
    });

    socket.on("addRound", () => {
      const { playerId, roomCode } = socket.data as { playerId?: string; roomCode?: string };
      if (!playerId || !roomCode) return;

      const room = getRoom(roomCode);
      if (!room || room.hostId !== playerId || room.phase !== "playing") return;

      const nextRound = room.roundNotes.length + 1;
      room.roundNotes.push(createRoundNote(nextRound));
      updateRoom(roomCode, room);
      emitRoomUpdate(io, roomCode);
    });

    socket.on("updateRoundNote", (roundId: string, content: string) => {
      const { playerId, roomCode } = socket.data as { playerId?: string; roomCode?: string };
      if (!playerId || !roomCode) return;

      const room = getRoom(roomCode);
      if (!room || room.hostId !== playerId || room.phase !== "playing") return;

      const note = room.roundNotes.find((n) => n.id === roundId);
      if (!note) return;

      note.content = content;
      updateRoom(roomCode, room);
      emitRoomUpdate(io, roomCode);
    });

    socket.on("kickPlayer", (targetId: string) => {
      const { playerId, roomCode } = socket.data as { playerId?: string; roomCode?: string };
      if (!playerId || !roomCode) return;

      const room = getRoom(roomCode);
      if (!room || room.hostId !== playerId || room.phase !== "lobby") return;

      removePlayer(targetId);
      const sockets = io.sockets.sockets;
      sockets.forEach((s) => {
        const data = s.data as { playerId?: string };
        if (data.playerId === targetId) {
          s.leave(roomCode);
          s.data = {};
        }
      });
      emitRoomUpdate(io, roomCode);
    });

    socket.on("leaveRoom", () => {
      const { playerId, roomCode } = socket.data as { playerId?: string; roomCode?: string };
      if (!playerId || !roomCode) return;

      removePlayer(playerId);
      socket.leave(roomCode);
      socket.data = {};
      emitRoomUpdate(io, roomCode);
    });

    socket.on("disconnect", () => {
      const { playerId, roomCode } = socket.data as { playerId?: string; roomCode?: string };
      if (playerId && roomCode) {
        setPlayerConnected(playerId, false);
        emitRoomUpdate(io, roomCode);
      }
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> Ma Sói server running on http://${hostname}:${port}`);
  });
});
