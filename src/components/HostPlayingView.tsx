"use client";

import { useState } from "react";
import { Plus, Crown } from "lucide-react";
import type { Room } from "@/lib/types";
import { ROLES } from "@/lib/roles";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { getSocket } from "@/hooks/useSocket";

interface Props {
  room: Room;
  onLeave: () => void;
}

export function HostPlayingView({ room, onLeave }: Props) {
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});

  const getNoteContent = (id: string, serverContent: string) =>
    localNotes[id] !== undefined ? localNotes[id] : serverContent;

  const handleNoteChange = (roundId: string, content: string) => {
    setLocalNotes((prev) => ({ ...prev, [roundId]: content }));
  };

  const handleNoteBlur = (roundId: string) => {
    const content = localNotes[roundId];
    if (content !== undefined) {
      getSocket().emit("updateRoundNote", roundId, content);
    }
  };

  const handleAddRound = () => {
    getSocket().emit("addRound");
  };

  const playersWithRoles = room.players.filter((p) => !p.isHost);

  return (
    <main className="safe-top safe-bottom min-h-dvh max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/50 text-sm">Trưởng phòng</p>
          <h1 className="text-xl font-bold">Phòng {room.code}</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={onLeave}>
          Rời phòng
        </Button>
      </div>

      <Card>
        <h2 className="font-semibold mb-3">Nhân vật đã chia</h2>
        <div className="space-y-2">
          {playersWithRoles.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5"
            >
              <span className="font-medium">{player.name}</span>
              {player.role ? (
                <span className="flex items-center gap-1.5 text-sm">
                  <span>{ROLES[player.role].emoji}</span>
                  <span className="text-primary">{ROLES[player.role].name}</span>
                </span>
              ) : (
                <span className="text-white/40 text-sm">Chưa có vai</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Ghi chú ván chơi</h2>
          <Button variant="secondary" size="sm" onClick={handleAddRound}>
            <Plus className="w-4 h-4" />
            Thêm ván
          </Button>
        </div>

        <div className="space-y-3">
          {room.roundNotes.map((note) => (
            <div key={note.id} className="space-y-1">
              <label className="text-sm text-white/60 font-medium">
                Ván {note.roundNumber}
              </label>
              <textarea
                value={getNoteContent(note.id, note.content)}
                onChange={(e) => handleNoteChange(note.id, e.target.value)}
                onBlur={() => handleNoteBlur(note.id)}
                placeholder="Ghi chú kết quả ván, ai chết, ai bị treo cổ..."
                className="w-full min-h-[80px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm resize-y focus:outline-none focus:border-primary/50 placeholder:text-white/30"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs text-white/40 mb-2">Tất cả người chơi</p>
        <div className="flex flex-wrap gap-2">
          {room.players.map((p) => (
            <span
              key={p.id}
              className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                p.isHost ? "bg-accent/20 text-accent" : "bg-white/10"
              }`}
            >
              {p.isHost && <Crown className="w-3 h-3" />}
              {p.name}
            </span>
          ))}
        </div>
      </Card>
    </main>
  );
}
