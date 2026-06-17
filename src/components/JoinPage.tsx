"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { getSocket, saveSession } from "@/hooks/useSocket";

interface Props {
  code: string;
}

export function JoinPage({ code }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = () => {
    if (!name.trim()) {
      setError("Vui lòng nhập tên");
      return;
    }
    setLoading(true);
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("joinRoom", code, name.trim(), ({ success, playerId, error: err }) => {
      setLoading(false);
      if (!success) {
        setError(err ?? "Không thể tham gia");
        return;
      }
      saveSession(code, playerId!, name.trim());
      router.push(`/room/${code}`);
    });
  };

  return (
    <main className="safe-top safe-bottom flex flex-col min-h-dvh max-w-md mx-auto px-4 py-8 justify-center">
      <Card className="space-y-4 animate-fade-in">
        <div className="text-center">
          <div className="text-4xl mb-2">🐺</div>
          <h1 className="text-xl font-bold">Tham gia phòng</h1>
          <p className="text-3xl font-mono tracking-widest text-primary mt-2">{code}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/60">Tên của bạn</label>
          <Input
            placeholder="Nhập tên..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoFocus
          />
        </div>

        {error && <p className="text-danger text-sm text-center">{error}</p>}

        <Button className="w-full" size="lg" disabled={loading} onClick={handleJoin}>
          {loading ? "Đang vào phòng..." : "Vào phòng"}
        </Button>
      </Card>
    </main>
  );
}
