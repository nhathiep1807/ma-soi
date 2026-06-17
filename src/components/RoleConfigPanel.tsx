"use client";

import { Minus, Plus, Wand2 } from "lucide-react";
import type { RoleConfig } from "@/lib/types";
import { ROLE_LIST, getRoleConfigForPlayerCount, getTotalRoles } from "@/lib/roles";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

interface Props {
  config: RoleConfig;
  playerCount: number;
  onChange: (config: RoleConfig) => void;
}

export function RoleConfigPanel({ config, playerCount, onChange }: Props) {
  const total = getTotalRoles(config);

  const updateRole = (roleId: keyof RoleConfig, delta: number) => {
    const newValue = Math.max(0, config[roleId] + delta);
    onChange({ ...config, [roleId]: newValue });
  };

  const autoConfig = () => {
    onChange(getRoleConfigForPlayerCount(playerCount));
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Cấu hình nhân vật (20 loại)</h2>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${total === playerCount ? "text-success" : "text-danger"}`}>
            {total}/{playerCount}
          </span>
          <Button variant="ghost" size="sm" onClick={autoConfig} disabled={playerCount === 0}>
            <Wand2 className="w-4 h-4" />
            Tự động
          </Button>
        </div>
      </div>

      <p className="text-xs text-white/40 mb-3">
        Chọn số lượng từng nhân vật. Có thể chọn nhiều nhân vật giống nhau.
      </p>

      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
        {ROLE_LIST.map((role) => (
          <div
            key={role.id}
            className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xl shrink-0">{role.emoji}</span>
              <div className="min-w-0">
                <p className="font-medium text-sm">{role.name}</p>
                <p className="text-xs text-white/40 truncate">{role.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <button
                onClick={() => updateRole(role.id, -1)}
                disabled={config[role.id] <= 0}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-mono font-bold">{config[role.id]}</span>
              <button
                onClick={() => updateRole(role.id, 1)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
