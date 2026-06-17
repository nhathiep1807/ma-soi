export type RoleId =
  | "werewolf"
  | "villager"
  | "seer"
  | "witch"
  | "hunter"
  | "bodyguard"
  | "cupid"
  | "idiot"
  | "alpha_wolf"
  | "wolf_cub"
  | "guard"
  | "mayor"
  | "medium"
  | "cursed"
  | "tanner"
  | "piper"
  | "angel"
  | "traitor"
  | "serial_killer"
  | "fool";

export type Team = "werewolf" | "villager" | "neutral";

export type GamePhase = "lobby" | "playing";

export interface RoleDefinition {
  id: RoleId;
  name: string;
  nameEn: string;
  team: Team;
  description: string;
  emoji: string;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  role?: RoleId;
}

export type RoleConfig = Record<RoleId, number>;

export interface RoundNote {
  id: string;
  roundNumber: number;
  content: string;
  timestamp: number;
}

export interface Room {
  code: string;
  hostId: string;
  players: Player[];
  roleConfig: RoleConfig;
  phase: GamePhase;
  roundNotes: RoundNote[];
  createdAt: number;
}

export interface ClientRoom {
  code: string;
  hostId: string;
  players: Player[];
  roleConfig: RoleConfig;
  phase: GamePhase;
  roundNotes: RoundNote[];
  createdAt: number;
}

export interface ServerToClientEvents {
  roomUpdate: (room: ClientRoom, playerId: string) => void;
  error: (message: string) => void;
  gameStarted: () => void;
}

export interface ClientToServerEvents {
  createRoom: (playerName: string, callback: (data: { roomCode: string; playerId: string }) => void) => void;
  joinRoom: (roomCode: string, playerName: string, callback: (data: { success: boolean; playerId?: string; error?: string }) => void) => void;
  updateRoleConfig: (roleConfig: RoleConfig) => void;
  startGame: () => void;
  addRound: () => void;
  updateRoundNote: (roundId: string, content: string) => void;
  kickPlayer: (playerId: string) => void;
  leaveRoom: () => void;
  reconnect: (roomCode: string, playerId: string, callback: (data: { success: boolean }) => void) => void;
}
