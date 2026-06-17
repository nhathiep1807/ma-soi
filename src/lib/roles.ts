import type { RoleConfig, RoleDefinition, RoleId } from "./types";

export const ROLES: Record<RoleId, RoleDefinition> = {
  werewolf: {
    id: "werewolf",
    name: "Ma Sói",
    nameEn: "Werewolf",
    team: "werewolf",
    description: "Ban đêm cùng sói khác chọn giết một người.",
    emoji: "🐺",
  },
  alpha_wolf: {
    id: "alpha_wolf",
    name: "Sói Alpha",
    nameEn: "Alpha Wolf",
    team: "werewolf",
    description: "Thủ lĩnh bầy sói, có quyền quyết định mục tiêu.",
    emoji: "👑",
  },
  wolf_cub: {
    id: "wolf_cub",
    name: "Sói Con",
    nameEn: "Wolf Cub",
    team: "werewolf",
    description: "Nếu bị loại, sói sẽ giết hai người đêm tiếp theo.",
    emoji: "🐾",
  },
  traitor: {
    id: "traitor",
    name: "Kẻ Phản Đồ",
    nameEn: "Traitor",
    team: "werewolf",
    description: "Phe dân nhưng thắng cùng Ma Sói.",
    emoji: "🎭",
  },
  villager: {
    id: "villager",
    name: "Dân Làng",
    nameEn: "Villager",
    team: "villager",
    description: "Không có kỹ năng đặc biệt.",
    emoji: "👨‍🌾",
  },
  seer: {
    id: "seer",
    name: "Tiên Tri",
    nameEn: "Seer",
    team: "villager",
    description: "Ban đêm soi một người để biết phe.",
    emoji: "🔮",
  },
  witch: {
    id: "witch",
    name: "Phù Thủy",
    nameEn: "Witch",
    team: "villager",
    description: "Có 1 lọ cứu và 1 lọ độc.",
    emoji: "🧪",
  },
  hunter: {
    id: "hunter",
    name: "Thợ Săn",
    nameEn: "Hunter",
    team: "villager",
    description: "Khi bị loại có thể bắn chết một người.",
    emoji: "🏹",
  },
  bodyguard: {
    id: "bodyguard",
    name: "Bảo Vệ",
    nameEn: "Bodyguard",
    team: "villager",
    description: "Ban đêm bảo vệ một người khỏi sói.",
    emoji: "🛡️",
  },
  guard: {
    id: "guard",
    name: "Cảnh Vệ",
    nameEn: "Guard",
    team: "villager",
    description: "Bảo vệ một người, nếu bị tấn công cả hai có thể chết.",
    emoji: "⚔️",
  },
  mayor: {
    id: "mayor",
    name: "Thị Trưởng",
    nameEn: "Mayor",
    team: "villager",
    description: "Phiếu bầu có trọng số gấp đôi.",
    emoji: "🏛️",
  },
  medium: {
    id: "medium",
    name: "Thầy Bói",
    nameEn: "Medium",
    team: "villager",
    description: "Có thể hỏi người đã chết.",
    emoji: "🔯",
  },
  cupid: {
    id: "cupid",
    name: "Thần Tình Yêu",
    nameEn: "Cupid",
    team: "neutral",
    description: "Ghép đôi 2 người, chết cùng nhau.",
    emoji: "💘",
  },
  idiot: {
    id: "idiot",
    name: "Kẻ Ngốc",
    nameEn: "Idiot",
    team: "villager",
    description: "Bị treo cổ lần đầu không chết.",
    emoji: "🤡",
  },
  fool: {
    id: "fool",
    name: "Kẻ Khờ",
    nameEn: "Fool",
    team: "neutral",
    description: "Thắng nếu bị treo cổ.",
    emoji: "🃏",
  },
  cursed: {
    id: "cursed",
    name: "Người Bị Nguyền",
    nameEn: "Cursed",
    team: "villager",
    description: "Nếu bị sói cắn sẽ hóa thành Ma Sói.",
    emoji: "🌑",
  },
  tanner: {
    id: "tanner",
    name: "Kẻ Phản Bội",
    nameEn: "Tanner",
    team: "neutral",
    description: "Thắng nếu bị treo cổ.",
    emoji: "🧥",
  },
  piper: {
    id: "piper",
    name: "Người Thổi Sáo",
    nameEn: "Piper",
    team: "neutral",
    description: "Ru ngủ hai người, thắng khi tất cả bị ru.",
    emoji: "🎵",
  },
  angel: {
    id: "angel",
    name: "Thiên Sứ",
    nameEn: "Angel",
    team: "neutral",
    description: "Phải bị loại sớm để thắng.",
    emoji: "👼",
  },
  serial_killer: {
    id: "serial_killer",
    name: "Kẻ Giết Người",
    nameEn: "Serial Killer",
    team: "neutral",
    description: "Giết một người mỗi đêm, thắng khi còn sống cuối cùng.",
    emoji: "🔪",
  },
};

export const ROLE_LIST: RoleDefinition[] = Object.values(ROLES);

export const ROLE_IDS: RoleId[] = ROLE_LIST.map((r) => r.id);

export const DEFAULT_ROLE_CONFIG: RoleConfig = Object.fromEntries(
  ROLE_IDS.map((id) => [id, id === "werewolf" ? 1 : id === "villager" ? 2 : 0])
) as RoleConfig;

export function getTotalRoles(config: RoleConfig): number {
  return Object.values(config).reduce((sum, n) => sum + n, 0);
}

export function getRoleConfigForPlayerCount(count: number): RoleConfig {
  const config = Object.fromEntries(ROLE_IDS.map((id) => [id, 0])) as RoleConfig;
  if (count <= 0) return config;

  const wolves = Math.max(1, Math.floor(count / 4));
  config.werewolf = wolves;
  let remaining = count - wolves;

  if (remaining > 0) {
    config.seer = 1;
    remaining--;
  }
  if (remaining > 0) {
    config.witch = 1;
    remaining--;
  }
  config.villager = remaining;
  return config;
}

export function isWerewolfTeam(role: RoleId): boolean {
  return ROLES[role].team === "werewolf";
}

export function isVillagerTeam(role: RoleId): boolean {
  return ROLES[role].team === "villager";
}
