"use client";

import { useState } from "react";
import type { Room } from "@/lib/types";
import { ROLES } from "@/lib/roles";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface Props {
  room: Room;
  playerId: string;
  onLeave: () => void;
}

export function PlayerPlayingView({ room, playerId, onLeave }: Props) {
  const [showRole, setShowRole] = useState(true);
  const me = room.players.find((p) => p.id === playerId);
  const myRole = me?.role;

  return (
    <main className="safe-top safe-bottom min-h-dvh max-w-md mx-auto px-4 py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Đang chơi</h1>
        <Button variant="ghost" size="sm" onClick={onLeave}>
          Rời phòng
        </Button>
      </div>

      {myRole && showRole && (
        <Card
          className="border-primary/30 bg-primary/10 animate-fade-in cursor-pointer"
          onClick={() => setShowRole(false)}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl">{ROLES[myRole].emoji}</span>
            <div>
              <p className="text-white/50 text-sm">Vai trò của bạn</p>
              <p className="font-bold text-2xl">{ROLES[myRole].name}</p>
              <p className="text-sm text-white/60 mt-1">{ROLES[myRole].description}</p>
              <p className="text-xs text-white/30 mt-2">Chạm để ẩn</p>
            </div>
          </div>
        </Card>
      )}

      {myRole && !showRole && (
        <button
          onClick={() => setShowRole(true)}
          className="text-center text-white/30 text-sm py-4 border border-dashed border-white/10 rounded-xl"
        >
          Chạm để xem vai trò
        </button>
      )}

      <Card className="mt-auto">
        <p className="text-center text-white/50 text-sm">
          Trưởng phòng đang điều hành ván chơi. Hãy giữ bí mật vai trò của bạn!
        </p>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {room.players
            .filter((p) => !p.isHost)
            .map((p) => (
              <span
                key={p.id}
                className={`text-xs px-2 py-1 rounded-full ${
                  p.id === playerId ? "bg-primary/30 text-primary" : "bg-white/10"
                }`}
              >
                {p.name}
                {p.id === playerId && " (bạn)"}
              </span>
            ))}
        </div>
      </Card>
    </main>
  );
}
