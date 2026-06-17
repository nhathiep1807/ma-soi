"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";
import { Button } from "./ui/Button";

interface Props {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const scannerId = "qr-reader";
    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const match = decodedText.match(/\/join\/([A-Z0-9]{6})/i) ||
            decodedText.match(/\/room\/([A-Z0-9]{6})/i) ||
            decodedText.match(/^([A-Z0-9]{6})$/i);
          if (match) {
            scanner.stop().catch(() => {});
            onScan(match[1].toUpperCase());
          }
        },
        () => {}
      )
      .then(() => {
        startedRef.current = true;
      })
      .catch(() => {
        onClose();
      });

    return () => {
      if (startedRef.current && scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col safe-top safe-bottom">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Quét mã QR</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div id="qr-reader" className="w-full max-w-sm rounded-2xl overflow-hidden" />
      </div>
      <p className="text-center text-white/50 text-sm pb-6">
        Hướng camera vào mã QR của phòng
      </p>
    </div>
  );
}
