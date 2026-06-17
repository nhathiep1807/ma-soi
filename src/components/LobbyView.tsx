"use client";

import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Share2, UserMinus, Crown } from "lucide-react";
import { useState } from "react";
import type { Room, RoleConfig } from "@/lib/types";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { RoleConfigPanel } from "./RoleConfigPanel";
import { getSocket } from "@/hooks/useSocket";
import { getTotalRoles } from "@/lib/roles";

interface Props {
  room: Room;
  playerId: string;
  isHost: boolean;
  error: string;
  onLeave: () => void;
}

export function LobbyView({ room, playerId, isHost, error, onLeave }: Props) {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join/${room.code}`
    : `/join/${room.code}`;

  const nonHostCount = room.players.filter((p) => !p.isHost).length;

  const copyCode = async () => {
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareRoom = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Ma Sói - Tham gia phòng",
        text: `Tham gia phòng Ma Sói với mã: ${room.code}`,
        url: joinUrl,
      });
    } else {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = () => {
    setStarting(true);
    getSocket().emit("startGame");
    setTimeout(() => setStarting(false), 2000);
  };

  const handleKick = (targetId: string) => {
    getSocket().emit("kickPlayer", targetId);
  };

  const handleRoleConfig = (config: RoleConfig) => {
    getSocket().emit("updateRoleConfig", config);
  };

  const totalRoles = getTotalRoles(room.roleConfig);
  const canStart = nonHostCount >= 1 && totalRoles === nonHostCount;

  return (
    <main className="safe-top safe-bottom min-h-dvh max-w-md mx-auto px-4 py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/50 text-sm">Phòng</p>
          <h1 className="text-2xl font-mono font-bold tracking-widest text-primary">{room.code}</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={onLeave}>
          Rời phòng
        </Button>
      </div>

      <Card className="flex flex-col items-center gap-3">
        <QRCodeSVG value={joinUrl} size={160} bgColor="transparent" fgColor="#c4b5fd" level="M" />
        <p className="text-white/50 text-xs text-center">Quét mã QR hoặc chia sẻ link để mời bạn bè</p>
        <div className="flex gap-2 w-full">
          <Button variant="secondary" size="sm" className="flex-1" onClick={copyCode}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Đã copy" : "Copy mã"}
          </Button>
          <Button variant="secondary" size="sm" className="flex-1" onClick={shareRoom}>
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Người chơi ({room.players.length}/20)</h2>
          {isHost && (
            <span className="text-xs text-white/50">Trưởng phòng không nhận vai</span>
          )}
        </div>
        <div className="space-y-2">
          {room.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5"
            >
              <div className="flex items-center gap-2">
                {player.isHost && <Crown className="w-4 h-4 text-accent" />}
                <span className={player.id === playerId ? "text-primary font-medium" : ""}>
                  {player.name}
                  {player.id === playerId && " (bạn)"}
                  {player.isHost && " — Trưởng phòng"}
                </span>
                {!player.isConnected && (
                  <span className="text-xs text-white/30">(offline)</span>
                )}
              </div>
              {isHost && !player.isHost && (
                <button
                  onClick={() => handleKick(player.id)}
                  className="text-danger/60 hover:text-danger p-1"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {isHost && (
        <RoleConfigPanel
          config={room.roleConfig}
          playerCount={nonHostCount}
          onChange={handleRoleConfig}
        />
      )}

      {error && <p className="text-danger text-sm text-center">{error}</p>}

      {isHost && (
        <div className="mt-auto space-y-2">
          {!canStart && (
            <p className="text-center text-white/40 text-sm">
              {nonHostCount < 1
                ? "Cần ít nhất 1 người chơi khác"
                : `Tổng nhân vật (${totalRoles}) phải bằng ${nonHostCount} người chơi`}
            </p>
          )}
          <Button
            size="lg"
            className="w-full"
            disabled={!canStart || starting}
            onClick={handleStart}
          >
            {starting ? "Đang bắt đầu..." : "🎮 Bắt đầu chơi"}
          </Button>
        </div>
      )}

      {!isHost && (
        <div className="mt-auto text-center text-white/40 text-sm py-4">
          Đang chờ trưởng phòng bắt đầu game...
        </div>
      )}
    </main>
  );
}
