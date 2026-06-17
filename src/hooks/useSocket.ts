"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, Room, ServerToClientEvents } from "@/lib/types";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SOCKET_PATH = "/api/socket";
const CONNECT_TIMEOUT_MS = 10_000;

let socket: GameSocket | null = null;

function getSocketUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  return url || undefined;
}

export function getSocket(): GameSocket {
  if (!socket) {
    socket = io(getSocketUrl(), {
      path: SOCKET_PATH,
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function ensureSocketConnected(timeoutMs = CONNECT_TIMEOUT_MS): Promise<GameSocket> {
  const s = getSocket();
  if (s.connected) return Promise.resolve(s);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Không thể kết nối server game. Vui lòng thử lại sau."));
    }, timeoutMs);

    const onConnect = () => {
      cleanup();
      resolve(s);
    };

    const onConnectError = () => {
      cleanup();
      reject(new Error("Không thể kết nối server game. Kiểm tra cấu hình NEXT_PUBLIC_SOCKET_URL."));
    };

    const cleanup = () => {
      clearTimeout(timer);
      s.off("connect", onConnect);
      s.off("connect_error", onConnectError);
    };

    s.on("connect", onConnect);
    s.on("connect_error", onConnectError);
    s.connect();
  });
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
