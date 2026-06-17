import type { Room, RoleConfig } from "./types";
import { DEFAULT_ROLE_CONFIG } from "./roles";
import { generateRoomCode } from "./game-logic";

const rooms = new Map<string, Room>();
const playerToRoom = new Map<string, string>();

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function getRoomByPlayer(playerId: string): Room | undefined {
  const code = playerToRoom.get(playerId);
  return code ? rooms.get(code) : undefined;
}

export function createRoom(hostId: string, hostName: string): Room {
  let code = generateRoomCode();
  while (rooms.has(code)) {
    code = generateRoomCode();
  }

  const room: Room = {
    code,
    hostId,
    players: [
      {
        id: hostId,
        name: hostName,
        isHost: true,
        isConnected: true,
      },
    ],
    roleConfig: { ...DEFAULT_ROLE_CONFIG },
    phase: "lobby",
    roundNotes: [],
    createdAt: Date.now(),
  };

  rooms.set(code, room);
  playerToRoom.set(hostId, code);
  return room;
}

export function joinRoom(code: string, playerId: string, playerName: string): Room | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  if (room.phase !== "lobby") return null;
  if (room.players.length >= 20) return null;
  if (room.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())) return null;

  room.players.push({
    id: playerId,
    name: playerName,
    isHost: false,
    isConnected: true,
  });

  playerToRoom.set(playerId, code.toUpperCase());
  return room;
}

export function updateRoom(code: string, room: Room): void {
  rooms.set(code.toUpperCase(), room);
}

export function removePlayer(playerId: string): Room | null {
  const code = playerToRoom.get(playerId);
  if (!code) return null;

  const room = rooms.get(code);
  if (!room) return null;

  room.players = room.players.filter((p) => p.id !== playerId);
  playerToRoom.delete(playerId);

  if (room.players.length === 0) {
    rooms.delete(code);
    return null;
  }

  if (room.hostId === playerId) {
    room.hostId = room.players[0].id;
    room.players[0].isHost = true;
  }

  rooms.set(code, room);
  return room;
}

export function setPlayerConnected(playerId: string, connected: boolean): Room | null {
  const room = getRoomByPlayer(playerId);
  if (!room) return null;

  const idx = room.players.findIndex((p) => p.id === playerId);
  if (idx >= 0) {
    room.players[idx].isConnected = connected;
    rooms.set(room.code, room);
  }
  return room;
}

export function updateRoleConfig(code: string, config: RoleConfig): Room | null {
  const room = rooms.get(code.toUpperCase());
  if (!room || room.phase !== "lobby") return null;
  room.roleConfig = config;
  rooms.set(code.toUpperCase(), room);
  return room;
}

setInterval(() => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  rooms.forEach((room, code) => {
    if (now - room.createdAt > ONE_HOUR && room.phase === "lobby") {
      room.players.forEach((p) => playerToRoom.delete(p.id));
      rooms.delete(code);
    }
  });
}, 60 * 60 * 1000);
