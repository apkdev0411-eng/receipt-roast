"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { RoastResult } from "@/lib/types";
import { ShareCard } from "./ShareCard";
import type { Language } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import { getBadgeEmoji, getBadgeName, addShare } from "@/lib/points";
import { playRoastSound, playBadgeSound } from "@/lib/sounds";

interface Props {
  result: RoastResult;
  onReset: () => void;
  lang: Language;
  newBadges?: string[];
}

function formatMoney(amount: number, currency: string, lang: Language) {
  try {
    return new Intl.NumberFormat(lang === "en" ? "en-US" : "es-MX", {
      style: "currency",
      currency: currency || "MXN",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)} ${currency}`;
  }
}

export function ResultScreen({ result, onReset, lang, newBadges = [] }: Props) {
  const t = getTranslations(lang);
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (newBadges.length > 0) {
      playBadgeSound();
    } else {
      playRoastSound();
    }
  }, []);

  useEffect(() => {
    if (newBadges.length > 0) {
      setCurrentBadgeIndex(0);
      setShowBadge(true);
    }
  }, [newBadges]);

  useEffect(() => {
    if (showBadge && currentBadgeIndex < newBadges.length) {
      const timer = setTimeout(() => {
        if (currentBadgeIndex < newBadges.length - 1) {
          setCurrentBadgeIndex((i) => i + 1);
          playBadgeSound();
        } else {
          setShowBadge(false);
        }
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showBadge, currentBadgeIndex, newBadges]);

  async function generateCard() {
    if (!cardRef.current || busy) return;
    setBusy(true);
    setShareHint(null);
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        width: 1080,
        height: 1350,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "receipt-roast.png", { type: "image/png" });

      const canShare =
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        (!navigator.canShare || navigator.canShare({ files: [file] }));

      if (canShare) {
        try {
          await navigator.share({
            title: "Receipt Roast",
            text: lang === "en" ? "My receipt just got roasted." : "Mi ticket acaba de ser destruido con elegancia.",
            files: [file],
          });
          addShare();
          setShareHint(lang === "en" ? "Shared!" : "¡Compartido!");
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            setShareHint(lang === "en" ? "Share cancelled." : "Compartir cancelado.");
            return;
          }
        }
      }

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "receipt-roast.png";
      a.click();
      addShare();
      setShareHint(lang === "en" ? "Card downloaded." : "Tarjeta descargada.");
    } catch {
      setShareHint(lang === "en" ? "Could not generate the card." : "No se pudo generar la tarjeta.");
    } finally {
      setBusy(false);
    }
  }

  const modeLabel =
    result.mode === "duro"
      ? lang === "en"
        ? "🔥 Hard Roast"
        : "🔥 Roast Duro"
      : lang === "en"
        ? "🧠 Sarcastic Coach"
        : "🧠 Coach Sarcástico";

  const currentBadge = newBadges[currentBadgeIndex];

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8">
      {result.demo && (
        <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {lang === "en" ? "Demo mode." : "Modo demo."}
        </div>
      )}

      <p className="text-sm uppercase tracking-[0.2em] text-ember">{modeLabel}</p>
      {result.merchant && (
        <p className="mt-2 text-sm text-white/50">
          {result.merchant}
          {result.date ? ` · ${result.date}` : ""}
        </p>
      )}

      {showBadge && currentBadge && (
        <div className="mt-4 flex animate-bounce items-center justify-center gap-2 rounded-2xl bg-ember px-4 py-3 text-sm font-bold text-black shadow-xl">
          <span className="text-lg">{getBadgeEmoji(currentBadge)}</span>
          <span>{lang === "en" ? "Badge unlocked!" : "¡Badge desbloqueado!"}</span>
          <span className="text-xs opacity-80">· {getBadgeName(currentBadge, lang)}</span>
        </div>
      )}

      <blockquote className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-ember/20 via-white/5 to-transparent p-6 sm:p-8">
        <p className="text-2xl font-bold leading-snug text-white sm:text-3xl">“{result.roast}”</p>
      </blockquote>

      {result.insight && (
        <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            {result.mode === "duro" ? t.extraComment : t.insight}
          </p>
          <p className="mt-2 text-base leading-relaxed text-emerald-50 sm:text-lg">{result.insight}</p>
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="font-semibold text-white">{t.breakdown}</h3>
          <span className="text-sm font-bold text-ember">{formatMoney(result.total, result.currency, lang)}</span>
        </div>
        <ul className="divide-y divide-white/5">
          {result.expenses.map((e, i) => (
            <li key={`${e.name}-${i}`} className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-white/90">{e.name}</p>
                <p className="text-xs uppercase tracking-wide text-white/40">{e.category}</p>
              </div>
              <p className="shrink-0 font-mono text-sm text-white/80">{formatMoney(e.amount, result.currency, lang)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={generateCard}
          disabled={busy}
          className="flex-1 rounded-2xl bg-ember px-5 py-4 text-center text-base font-bold text-black shadow-lg shadow-ember/30 transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? (lang === "en" ? "Generating…" : "Generando…") : t.shareCard}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex-1 rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-center text-base font-semibold text-white transition hover:bg-white/10"
        >
          {t.tryAnother}
        </button>
      </div>

      {shareHint && <p className="mt-3 text-center text-sm text-white/60">{shareHint}</p>}

      <div aria-hidden className="pointer-events-none fixed left-[-10000px] top-0">
        <ShareCard ref={cardRef} result={result} />
      </div>
    </section>
  );
}