"use client";

import type { Language } from "@/lib/i18n";
import { purchasePremium } from "@/lib/revenuecat";

interface Props {
  lang: Language;
  onClose: () => void;
  onUnlock: () => void;
}

export function PremiumModal({ lang, onClose, onUnlock }: Props) {
  const features = lang === "en"
    ? ["No ads", "Badges and levels", "Profile and stats", "Full history"]
    : ["Sin anuncios", "Badges y niveles", "Perfil y estadísticas", "Historial completo"];

  async function handlePurchase() {
    const success = await purchasePremium();
    if (success) {
      onUnlock();
    } else {
      alert(lang === "en" ? "Purchase failed or cancelled" : "Compra fallida o cancelada");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl bg-[#111] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <p className="text-4xl">⭐</p>
          <h2 className="mt-2 text-xl font-bold text-white">Premium</h2>
        </div>
        <ul className="mt-6 space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-white/80">
              <span className="text-ember">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={handlePurchase}
          className="mt-6 w-full rounded-2xl bg-amber-500 py-4 font-bold text-black"
        >
          {lang === "en" ? "Unlock Premium $4.99 USD" : "Desbloquear Premium $4.99 USD"}
        </button>
        <button onClick={onClose} className="mt-3 w-full text-sm text-white/50">
          {lang === "en" ? "Not now" : "Ahora no"}
        </button>
      </div>
    </div>
  );
}