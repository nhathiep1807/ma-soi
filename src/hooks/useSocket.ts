"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, Room, ServerToClientEvents } from "@/lib/types";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: GameSocket | null = null;

export function getSocket(): GameSocket {
  if (!socket) {
    socket = io({
      path: "/api/socket",
      autoConnect: false,
    });
  }
  return socket;
}

export function useSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();
    if (!s.connected) s.connect();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    setConnected(s.connected);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, []);

  return { socket: getSocket(), connected };
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  if (typeof localStorage?.getItem !== "function") return null;
  return localStorage;
}

export function saveSession(roomCode: string, playerId: string, playerName: string) {
  getStorage()?.setItem("masoi_session", JSON.stringify({ roomCode, playerId, playerName }));
}

export function loadSession(): { roomCode: string; playerId: string; playerName: string } | null {
  const raw = getStorage()?.getItem("masoi_session");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  getStorage()?.removeItem("masoi_session");
}

export type { Room };
