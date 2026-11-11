"use client";

import { useRef, useState } from "react";
import type { RoastMode, RoastResult } from "@/lib/types";
import { ModeSelector } from "./ModeSelector";
import type { Language } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import type { UserStats } from "@/lib/points";
import { getLevelEmoji, getLevelName } from "@/lib/points";
import { BadgesModal } from "./BadgesModal";
import { PremiumModal } from "./PremiumModal";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

interface Props {
  mode: RoastMode;
  onModeChange: (mode: RoastMode) => void;
  onFileSelected: (file: File) => void;
  error: string | null;
  history: RoastResult[];
  onOpenHistory: (item: RoastResult) => void;
  onClearHistory: () => void;
  lang: Language;
  onChangeLanguage: (lang: Language) => void;
  stats: UserStats | null;
  premium?: boolean;
  onUnlockPremium?: () => void;
}

const ACCEPT = "image/jpeg,image/jpg,image/png";

function formatMoney(amount: number, currency: string, lang: Language) {
  try {
    return new Intl.NumberFormat(lang === "en" ? "en-US" : "es-MX", {
      style: "currency",
      currency: currency || "MXN",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(0)}`;
  }
}

function isCurrentMonth(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function HomeScreen({
  mode,
  onModeChange,
  onFileSelected,
  error,
  history,
  onOpenHistory,
  onClearHistory,
  lang,
  onChangeLanguage,
  stats,
  premium,
  onUnlockPremium,
}: Props) {
  const t = getTranslations(lang);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  async function openCamera() {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      if (photo.webPath) {
        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
        onFileSelected(file);
      }
    } catch (e) {
      console.error("Camera error:", e);
    }
  }

  function validateAndSend(file: File | undefined | null) {
    if (!file) return;
    const okType = file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png";
    if (!okType) {
      alert(lang === "en" ? "Only JPG or PNG." : "Solo JPG o PNG.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      alert(lang === "en" ? "Image exceeds 12 MB." : "La imagen supera 12 MB.");
      return;
    }
    onFileSelected(file);
  }

  const thisMonth = history.filter((h) => isCurrentMonth(h.date));
  const monthTotal = thisMonth.reduce((sum, h) => sum + (h.total || 0), 0);
  const categoryTotals: Record<string, number> = {};
  thisMonth.forEach((h) => {
    h.expenses?.forEach((e) => {
      const cat = e.category || "otros";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
    });
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  return (
    <section className="relative mx-auto flex w-full max-w-xl flex-col px-4 pb-16 pt-10 sm:pt-16">
      <div className="absolute left-4 top-4">
        {stats && premium && (
          <button
            onClick={() => setShowBadges(true)}
            className="flex h-10 items-center justify-center rounded-xl bg-ember px-3 text-xs font-bold text-black shadow-md transition hover:brightness-110"
          >
            {lang === "en" ? "Profile" : "Perfil"}
          </button>
        )}
      </div>

      {!premium && onUnlockPremium && (
        <button
          onClick={() => setShowPremiumModal(true)}
          className="absolute left-4 top-16 rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-black shadow-md transition hover:brightness-110"
        >
          ⭐ Premium
        </button>
      )}

      <div className="absolute right-4 top-4 flex gap-2">
        <button
          onClick={() => onChangeLanguage("es")}
          className={`rounded-lg px-3 py-1 text-sm font-medium transition ${lang === "es" ? "bg-ember text-black" : "bg-white/10 text-white/60"}`}
        >
          ES
        </button>
        <button
          onClick={() => onChangeLanguage("en")}
          className={`rounded-lg px-3 py-1 text-sm font-medium transition ${lang === "en" ? "bg-ember text-black" : "bg-white/10 text-white/60"}`}
        >
          EN
        </button>
      </div>

      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-ember/20 text-3xl shadow-[0_0_40px_rgba(255,107,53,0.35)] animate-pulse">
          🔥
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Receipt <span className="text-ember">Roast</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-white/70 sm:text-lg">{t.subtitle}</p>

        {stats && premium && (
          <div className="mt-4 flex items-center justify-center gap-3 text-sm">
            <span className="rounded-full bg-white/10 px-3 py-1">
              {getLevelEmoji(stats.level)} {getLevelName(stats.level, lang)}
            </span>
            <span className="text-white/60">{stats.points} pts</span>
            {stats.streak > 1 && <span className="text-ember">🔥 {stats.streak}</span>}
          </div>
        )}
      </div>

      <div className="mt-10">
        <p className="mb-3 text-sm font-medium text-white/60">{t.chooseMode}</p>
        <ModeSelector value={mode} onChange={onModeChange} lang={lang} />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); validateAndSend(e.dataTransfer.files?.[0]); }}
        className={`mt-8 rounded-3xl border-2 border-dashed p-6 transition ${dragOver ? "border-ember bg-ember/10" : "border-white/15 bg-white/[0.03]"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => { validateAndSend(e.target.files?.[0]); e.target.value = ""; }}
        />
        <button
          type="button"
          onClick={openCamera}
          className="w-full rounded-2xl bg-ember px-6 py-5 text-lg font-bold text-black shadow-xl shadow-ember/30 transition hover:brightness-110 active:scale-[0.99]"
        >
          {t.uploadButton}
        </button>
        <p className="mt-3 text-center text-xs text-white/40">{t.uploadHint}</p>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {thisMonth.length > 0 && premium && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-medium text-white/60">{t.thisMonth}</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {formatMoney(monthTotal, thisMonth[0]?.currency || "MXN", lang)}
          </p>
          {topCategory && (
            <p className="mt-1 text-sm text-white/50">
              {t.mostSpent}: <span className="text-ember">{topCategory[0]}</span> ({formatMoney(topCategory[1], thisMonth[0]?.currency || "MXN", lang)})
            </p>
          )}
          <p className="mt-1 text-xs text-white/40">{thisMonth.length} {t.ticketsAnalyzed}</p>
        </div>
      )}

      {history.length > 0 && premium && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-white/60">{t.previousRoasts}</p>
            <button type="button" onClick={onClearHistory} className="text-xs text-white/40 underline hover:text-white/70">
              {t.clearHistory}
            </button>
          </div>
          <div className="space-y-2">
            {history.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onOpenHistory(item)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="line-clamp-2 text-sm text-white/80">{item.roast}</p>
                  <span className="shrink-0 text-sm font-semibold text-ember">{formatMoney(item.total, item.currency, lang)}</span>
                </div>
                {item.merchant && <p className="mt-1 text-xs text-white/40">{item.merchant}</p>}
              </button>
            ))}
          </div>
        </div>
      )}

      {showBadges && stats && (
        <BadgesModal stats={stats} lang={lang} onClose={() => setShowBadges(false)} />
      )}

      {showPremiumModal && onUnlockPremium && (
        <PremiumModal
          lang={lang}
          onClose={() => setShowPremiumModal(false)}
          onUnlock={() => {
            setShowPremiumModal(false);
            onUnlockPremium();
          }}
        />
      )}
    </section>
  );
}