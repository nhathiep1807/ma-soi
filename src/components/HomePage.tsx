"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Users, QrCode } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card } from "./ui/Card";
import { getSocket, saveSession } from "@/hooks/useSocket";
import { QRScanner } from "./QRScanner";

export function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");

  const handleCreate = () => {
    if (!name.trim()) {
      setError("Vui lòng nhập tên của bạn");
      return;
    }
    setLoading(true);
    setError("");
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("createRoom", name.trim(), ({ roomCode: code, playerId }) => {
      saveSession(code, playerId, name.trim());
      router.push(`/room/${code}`);
    });
  };

  const handleJoin = () => {
    if (!name.trim()) {
      setError("Vui lòng nhập tên của bạn");
      return;
    }
    if (!roomCode.trim()) {
      setError("Vui lòng nhập mã phòng");
      return;
    }
    setLoading(true);
    setError("");
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("joinRoom", roomCode.trim().toUpperCase(), name.trim(), ({ success, playerId, error: err }) => {
      setLoading(false);
      if (!success) {
        setError(err ?? "Không thể tham gia phòng");
        return;
      }
      saveSession(roomCode.trim().toUpperCase(), playerId!, name.trim());
      router.push(`/room/${roomCode.trim().toUpperCase()}`);
    });
  };

  const handleQRScan = (code: string) => {
    setRoomCode(code);
    setShowScanner(false);
    setMode("join");
  };

  return (
    <main className="safe-top safe-bottom flex flex-col min-h-dvh max-w-md mx-auto px-4 py-8">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="text-7xl animate-pulse-glow rounded-full p-4">🐺</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
            Ma Sói
          </h1>
          <p className="text-white/60 text-sm">Board game trực tuyến cho nhóm bạn</p>
        </div>

        {mode === "menu" && (
          <div className="w-full space-y-3">
            <Button size="lg" className="w-full" onClick={() => setMode("create")}>
              <Moon className="w-5 h-5" />
              Tạo phòng mới
            </Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={() => setMode("join")}>
              <Users className="w-5 h-5" />
              Tham gia phòng
            </Button>
            <Button size="lg" variant="ghost" className="w-full" onClick={() => setShowScanner(true)}>
              <QrCode className="w-5 h-5" />
              Quét mã QR
            </Button>
          </div>
        )}

        {(mode === "create" || mode === "join") && (
          <Card className="w-full space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-center">
              {mode === "create" ? "Tạo phòng mới" : "Tham gia phòng"}
            </h2>

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

            {mode === "join" && (
              <div className="space-y-2">
                <label className="text-sm text-white/60">Mã phòng</label>
                <Input
                  placeholder="VD: ABC123"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest uppercase"
                />
              </div>
            )}

            {error && (
              <p className="text-danger text-sm text-center">{error}</p>
            )}

            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => { setMode("menu"); setError(""); }}>
                Quay lại
              </Button>
              <Button
                className="flex-1"
                disabled={loading}
                onClick={mode === "create" ? handleCreate : handleJoin}
              >
                {loading ? "Đang xử lý..." : mode === "create" ? "Tạo phòng" : "Vào phòng"}
              </Button>
            </div>
          </Card>
        )}

        <div className="text-center text-white/30 text-xs space-y-1">
          <p>2–20 người · 20 loại nhân vật</p>
          <p>Trưởng phòng điều hành & ghi chú ván chơi</p>
        </div>
      </div>

      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}
    </main>
  );
}
