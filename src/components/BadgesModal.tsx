"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { Language } from "@/lib/i18n";
import type { UserStats, BadgeEntry } from "@/lib/points";
import { getLevelEmoji, getLevelName, getBadgeEmoji, getBadgeName, getFavoriteCategory } from "@/lib/points";

interface Props {
  stats: UserStats;
  lang: Language;
  onClose: () => void;
}

const CATEGORY_NAMES: Record<string, Record<string, string>> = {
  café: { es: "café", en: "coffee" },
  cafe: { es: "café", en: "coffee" },
  comida: { es: "comida", en: "food" },
  restaurante: { es: "restaurante", en: "restaurant" },
  compras: { es: "compras", en: "shopping" },
  ropa: { es: "ropa", en: "clothes" },
  tecnología: { es: "tecnología", en: "tech" },
  tecnologia: { es: "tecnología", en: "tech" },
  viajes: { es: "viajes", en: "travel" },
  suscripciones: { es: "suscripciones", en: "subscriptions" },
  transporte: { es: "transporte", en: "transport" },
  gasolina: { es: "gasolina", en: "gas" },
  hogar: { es: "hogar", en: "home" },
  ferretería: { es: "ferretería", en: "hardware" },
  otros: { es: "otros", en: "other" },
};

function translateCategory(cat: string, lang: Language): string {
  return CATEGORY_NAMES[cat.toLowerCase()]?.[lang] || cat;
}

const ALL_BADGES = [
  "Gastador",
  "Gran Gastador",
  "Magnate",
  "Leyenda del Gasto",
  "Primer Roast",
  "Habitual",
  "Adicto",
  "Veterano",
  "Leyenda del Roast",
  "Constante",
  "Comprometido",
  "Imparable",
  "Máquina",
  "Cafetero",
  "Foodie",
  "Shopaholic",
  "Tech Lover",
  "Viajero",
  "Suscriptor",
  "Conductor",
  "Casero",
  "Madrugador",
  "Nocturno",
  "Ticket Gigante",
  "Micro Gasto",
  "Internacional",
  "Coleccionista",
  "Completista",
  "Analítico",
  "Multi-ticket",
  "Año Nuevo",
  "Black Friday",
  "Compartidor",
];

const STATIC_BADGE_INFO: Record<string, Record<string, string>> = {
  "Primer Roast": { es: "Analizaste tu primer ticket", en: "Analyzed your first receipt" },
  Habitual: { es: "Analizaste 5 tickets", en: "Analyzed 5 receipts" },
  Adicto: { es: "Analizaste 15 tickets", en: "Analyzed 15 receipts" },
  Veterano: { es: "Analizaste 30 tickets", en: "Analyzed 30 receipts" },
  "Leyenda del Roast": { es: "Analizaste 50 tickets", en: "Analyzed 50 receipts" },
  Constante: { es: "Racha de 3 días", en: "3-day streak" },
  Comprometido: { es: "Racha de 7 días", en: "7-day streak" },
  Imparable: { es: "Racha de 14 días", en: "14-day streak" },
  Máquina: { es: "Racha de 30 días", en: "30-day streak" },
  Cafetero: { es: "Más gastado en café", en: "Most spent on coffee" },
  Foodie: { es: "Más gastado en comida", en: "Most spent on food" },
  Shopaholic: { es: "Más gastado en compras", en: "Most spent on shopping" },
  "Tech Lover": { es: "Más gastado en tecnología", en: "Most spent on tech" },
  Viajero: { es: "Más gastado en viajes", en: "Most spent on travel" },
  Suscriptor: { es: "Más gastado en suscripciones", en: "Most spent on subscriptions" },
  Conductor: { es: "Más gastado en transporte", en: "Most spent on transport" },
  Casero: { es: "Más gastado en hogar", en: "Most spent on home" },
  Madrugador: { es: "Roast antes de las 8 AM", en: "Roast before 8 AM" },
  Nocturno: { es: "Roast después de las 11 PM", en: "Roast after 11 PM" },
  Internacional: { es: "Ticket en moneda extranjera", en: "Receipt in foreign currency" },
  Coleccionista: { es: "Desbloqueaste 10 badges", en: "Unlocked 10 badges" },
  Completista: { es: "Desbloqueaste todos los badges", en: "Unlocked all badges" },
  Analítico: { es: "Usaste ambos modos (Duro y Coach)", en: "Used both modes (Hard and Coach)" },
  "Multi-ticket": { es: "Analizaste 3 tickets el mismo día", en: "Analyzed 3 receipts in one day" },
  "Año Nuevo": { es: "Roast el 1 de enero", en: "Roast on January 1st" },
  "Black Friday": { es: "Roast en noviembre", en: "Roast in November" },
  Compartidor: { es: "Compartiste 3 tarjetas", en: "Shared 3 cards" },
};

function getBadgeDescription(badge: string, currency: string | undefined, lang: Language): string {
  const curr = currency || "MXN";
  const rate = curr === "USD" ? 20 : curr === "EUR" ? 22 : curr === "GBP" ? 25 : 1;

  const thresholds: Record<string, number> = {
    Gastador: 1000,
    "Gran Gastador": 5000,
    Magnate: 10000,
    "Leyenda del Gasto": 50000,
    "Ticket Gigante": 20000,
    "Micro Gasto": 50,
  };

  const mxnAmount = thresholds[badge];
  if (mxnAmount) {
    const converted = Math.round(mxnAmount / rate);
    const isMicro = badge === "Micro Gasto";
    if (isMicro) {
      return lang === "en"
        ? `A receipt under $${converted} ${curr}`
        : `Un ticket menor a $${converted} ${curr}`;
    }
    return lang === "en"
      ? `Spent more than $${converted} ${curr} in one receipt`
      : `Gastaste más de $${converted} ${curr} en un ticket`;
  }

  return STATIC_BADGE_INFO[badge]?.[lang] || "";
}

const LEVELS = [
  { name: "Principiante", points: 0 },
  { name: "Roaster", points: 100 },
  { name: "Maestro", points: 300 },
  { name: "Leyenda", points: 700 },
];

function getNextLevel(points: number) {
  for (const lvl of LEVELS) {
    if (points < lvl.points) return lvl;
  }
  return null;
}

export function BadgesModal({ stats, lang, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const next = getNextLevel(stats.points);
  const currentLevelPoints = LEVELS.find((l) => l.name === stats.level)?.points ?? 0;
  const progress = next
    ? Math.min(100, ((stats.points - currentLevelPoints) / (next.points - currentLevelPoints)) * 100)
    : 100;
  const favoriteCategory = getFavoriteCategory(stats);

  const unlockedNames = stats.badges.map((b) => b.name);
  const getBadgeEntry = (name: string): BadgeEntry | undefined => stats.badges.find((b) => b.name === name);

  async function shareProfile() {
    const text =
      lang === "en"
        ? `I'm a ${getLevelName(stats.level, "en")} on Receipt Roast with ${stats.points} points! 🔥`
        : `Soy ${getLevelName(stats.level, "es")} en Receipt Roast con ${stats.points} puntos! 🔥`;

    const lockedElements = document.querySelectorAll('[data-locked="true"]');
    lockedElements.forEach((el) => ((el as HTMLElement).style.display = "none"));

    const scrollContainer = cardRef.current;
    const originalOverflow = scrollContainer?.style.overflow;
    const originalMaxHeight = scrollContainer?.style.maxHeight;
    if (scrollContainer) {
      scrollContainer.style.overflow = "visible";
      scrollContainer.style.maxHeight = "none";
    }

    let file: File | null = null;
    if (scrollContainer) {
      try {
        await new Promise((r) => setTimeout(r, 150));
        const dataUrl = await toPng(scrollContainer, {
          cacheBust: true,
          pixelRatio: 2,
          height: scrollContainer.scrollHeight,
        });
        const blob = await (await fetch(dataUrl)).blob();
        file = new File([blob], "receipt-roast-profile.png", { type: "image/png" });
      } catch {}
    }

    lockedElements.forEach((el) => ((el as HTMLElement).style.display = ""));
    if (scrollContainer) {
      scrollContainer.style.overflow = originalOverflow || "";
      scrollContainer.style.maxHeight = originalMaxHeight || "";
    }

    if (navigator.share) {
      const shareData: ShareData = { title: "Receipt Roast", text };
      if (file && navigator.canShare?.({ files: [file] })) {
        shareData.files = [file];
      }
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert(lang === "en" ? "Copied!" : "¡Copiado!");
    }
  }

  const unlockedCount = unlockedNames.length;
  const totalCount = ALL_BADGES.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-t-3xl bg-[#111] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="text-xl font-bold text-white">{lang === "en" ? "Your Profile" : "Tu Perfil"}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            ✕
          </button>
        </div>

        <div ref={cardRef} className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 text-center">
            <p className="text-3xl">{getLevelEmoji(stats.level)}</p>
            <p className="mt-1 text-lg font-semibold text-white">{getLevelName(stats.level, lang)}</p>
            <p className="text-sm text-white/50">{stats.points} pts</p>
            {favoriteCategory && (
              <p className="mt-2 text-sm text-white/50">
                {lang === "en" ? "Favorite category" : "Categoría favorita"}:{" "}
                <span className="capitalize text-ember">{translateCategory(favoriteCategory, lang)}</span>
              </p>
            )}
            {next && (
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-ember transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-white/40">
                  {lang === "en"
                    ? `${next.points - stats.points} pts to ${getLevelName(next.name, lang)}`
                    : `${next.points - stats.points} pts para ${getLevelName(next.name, lang)}`}
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-white/60">
              {lang === "en" ? "Unlocked Badges" : "Badges desbloqueados"} ({unlockedCount} de {totalCount})
            </p>
            <div className="grid grid-cols-2 gap-3">
              {ALL_BADGES.map((badge) => {
                const unlocked = unlockedNames.includes(badge);
                return (
                  <div
                    key={badge}
                    data-locked={!unlocked}
                    onClick={() => unlocked && setSelectedBadge(badge)}
                    className={`cursor-pointer rounded-2xl border p-3 text-center transition ${
                      unlocked ? "border-ember/40 bg-ember/10 hover:bg-ember/20" : "border-white/10 bg-white/5 opacity-40"
                    }`}
                  >
                    <p className={`text-2xl ${unlocked ? "" : "grayscale"}`}>{getBadgeEmoji(badge)}</p>
                    <p className="mt-1 text-xs text-white/70">
                      {unlocked ? getBadgeName(badge, lang) : lang === "en" ? "Locked" : "Bloqueado"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-4">
          <button onClick={shareProfile} className="w-full rounded-2xl bg-ember py-3 text-center font-bold text-black">
            {lang === "en" ? "Share Profile" : "Compartir Perfil"}
          </button>
        </div>
      </div>

      {selectedBadge && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setSelectedBadge(null)}>
          <div className="mx-4 max-w-xs rounded-2xl bg-[#1a1a1a] p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-3xl">{getBadgeEmoji(selectedBadge)}</p>
            <p className="mt-2 font-bold text-white">{getBadgeName(selectedBadge, lang)}</p>
            <p className="mt-2 text-sm text-white/60">
              {getBadgeDescription(selectedBadge, getBadgeEntry(selectedBadge)?.currency, lang) ||
                (lang === "en" ? "Unlocked" : "Desbloqueado")}
            </p>
            <button
              onClick={() => setSelectedBadge(null)}
              className="mt-4 rounded-xl bg-ember px-4 py-2 text-sm font-bold text-black"
            >
              {lang === "en" ? "Close" : "Cerrar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}