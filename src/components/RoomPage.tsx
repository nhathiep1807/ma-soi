"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ensureSocketConnected, getSocket, loadSession, clearSession } from "@/hooks/useSocket";
import type { Room } from "@/lib/types";
import { LobbyView } from "./LobbyView";
import { HostPlayingView } from "./HostPlayingView";
import { PlayerPlayingView } from "./PlayerPlayingView";

interface Props {
  code: string;
}

export function RoomPage({ code }: Props) {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const setupSocket = useCallback(() => {
    let cancelled = false;

    const onRoomUpdate = (updatedRoom: Room, pid: string) => {
      setRoom(updatedRoom);
      setPlayerId(pid);
      setLoading(false);
    };

    const onError = (msg: string) => setError(msg);

    void ensureSocketConnected()
      .then((socket) => {
        if (cancelled) return;

        const session = loadSession();
        socket.on("roomUpdate", onRoomUpdate);
        socket.on("error", onError);

        if (session && session.roomCode === code) {
          socket.emit("reconnect", code, session.playerId, ({ success }) => {
            if (cancelled) return;
            if (success) {
              setPlayerId(session.playerId);
            } else {
              clearSession();
              setLoading(false);
              setError("Phiên đã hết hạn. Vui lòng tham gia lại.");
            }
          });
        } else {
          setLoading(false);
          setError("Bạn chưa tham gia phòng này");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setError("Không thể kết nối server game");
        }
      });

    return () => {
      cancelled = true;
      const socket = getSocket();
      socket.off("roomUpdate", onRoomUpdate);
      socket.off("error", onError);
    };
  }, [code]);

  useEffect(() => {
    return setupSocket();
  }, [setupSocket]);

  const handleLeave = () => {
    getSocket().emit("leaveRoom");
    clearSession();
    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-pulse">🐺</div>
          <p className="text-white/60">Đang kết nối...</p>
        </div>
      </main>
    );
  }

  if (error && !room) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-danger">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="text-primary underline"
          >
            Về trang chủ
          </button>
        </div>
      </main>
    );
  }

  if (!room) return null;

  const me = room.players.find((p) => p.id === playerId);
  const isHost = me?.isHost ?? false;

  if (room.phase === "lobby") {
    return (
      <LobbyView
        room={room}
        playerId={playerId}
        isHost={isHost}
        error={error}
        onLeave={handleLeave}
      />
    );
  }

  if (isHost) {
    return <HostPlayingView room={room} onLeave={handleLeave} />;
  }

  return (
    <PlayerPlayingView
      room={room}
      playerId={playerId}
      onLeave={handleLeave}
    />
  );
}
