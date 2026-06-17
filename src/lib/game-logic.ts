import { v4 as uuidv4 } from "uuid";
import type { Player, RoleConfig, RoleId, Room } from "./types";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function buildRolePool(roleConfig: RoleConfig): RoleId[] {
  const roles: RoleId[] = [];
  (Object.keys(roleConfig) as RoleId[]).forEach((roleId) => {
    for (let i = 0; i < roleConfig[roleId]; i++) {
      roles.push(roleId);
    }
  });
  return shuffle(roles);
}

export function assignRoles(players: Player[], roleConfig: RoleConfig): Player[] {
  const shuffledRoles = buildRolePool(roleConfig);

  let roleIndex = 0;
  return players.map((player) => {
    if (player.isHost) {
      return { ...player, role: undefined };
    }
    return { ...player, role: shuffledRoles[roleIndex++] };
  });
}

export function validateRoleConfig(config: RoleConfig, nonHostPlayerCount: number): string | null {
  const total = Object.values(config).reduce((s, n) => s + n, 0);
  if (total === 0) return "Chọn ít nhất 1 nhân vật";
  if (total !== nonHostPlayerCount) {
    return `Tổng nhân vật (${total}) phải bằng số người chơi (${nonHostPlayerCount})`;
  }
  return null;
}

export function createRoundNote(roundNumber: number) {
  return {
    id: uuidv4(),
    roundNumber,
    content: "",
    timestamp: Date.now(),
  };
}

function stripRole(player: Player): Player {
  const copy = { ...player };
  delete copy.role;
  return copy;
}

export function sanitizeRoomForClient(room: Room, playerId: string): Room {
  const me = room.players.find((p) => p.id === playerId);
  const isHost = me?.isHost ?? false;
  const gameStarted = room.phase !== "lobby";

  const players = room.players.map((p) => {
    if (!gameStarted) return stripRole(p);
    if (isHost) return p;
    if (p.id === playerId) return p;
    return stripRole(p);
  });

  return { ...room, players };
}
