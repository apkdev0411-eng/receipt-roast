"use client";

import { useEffect, useState } from "react";
import type { Language } from "@/lib/i18n";

interface Props {
  lang: Language;
  onComplete: () => void;
}

export function AdModal({ lang, onComplete }: Props) {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[#1a1a1a] p-8 text-center">
        <p className="text-4xl">📺</p>
        <p className="mt-4 text-lg font-bold text-white">
          {lang === "en" ? "Ad" : "Anuncio"}
        </p>
        <p className="mt-2 text-white/50">
          {lang === "en" ? "Your roast is loading..." : "Tu roast está cargando..."}
        </p>
        <div className="mt-6 text-3xl font-bold text-ember">{seconds}</div>
        <p className="mt-2 text-xs text-white/40">
          {lang === "en" ? "Remove ads with Premium" : "Elimina anuncios con Premium"}
        </p>
      </div>
    </div>
  );
}