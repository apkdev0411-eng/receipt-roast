"use client";

import { useState } from "react";
import type { Language } from "@/lib/i18n";

interface Props {
  onComplete: () => void;
}

function getDeviceLanguage(): Language {
  if (typeof navigator === "undefined") return "es";
  const lang = navigator.language || navigator.languages?.[0] || "es";
  return lang.toLowerCase().startsWith("en") ? "en" : "es";
}

const STEPS = [
  {
    emoji: "📸",
    title: { es: "Sube tu ticket", en: "Upload your receipt" },
    desc: { es: "Toma una foto de tu ticket de compra.", en: "Take a photo of your receipt." },
  },
  {
    emoji: "🔥",
    title: { es: "Elige tu modo", en: "Choose your mode" },
    desc: {
      es: "Roast Duro para humor sin anestesia, o Coach Sarcástico para consejos disfrazados de broma.",
      en: "Hard Roast for no-anesthesia humor, or Sarcastic Coach for advice disguised as jokes.",
    },
  },
  {
    emoji: "🏆",
    title: { es: "Gana badges", en: "Earn badges" },
    desc: {
      es: "Desbloquea badges, sube de nivel y comparte tu perfil con tus amigos.",
      en: "Unlock badges, level up, and share your profile with friends.",
    },
  },
];

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const lang = getDeviceLanguage();
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[#111] p-8 text-center">
        <p className="text-6xl">{current.emoji}</p>
        <h2 className="mt-6 text-2xl font-bold text-white">{current.title[lang]}</h2>
        <p className="mt-3 text-white/60">{current.desc[lang]}</p>

        <div className="mt-6 flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition ${i === step ? "bg-ember" : "bg-white/20"}`}
            />
          ))}
        </div>

        <button
          onClick={() => (isLast ? onComplete() : setStep(step + 1))}
          className="mt-8 w-full rounded-2xl bg-ember py-4 font-bold text-black"
        >
          {isLast ? (lang === "en" ? "Let's go!" : "¡Vamos!") : lang === "en" ? "Next" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}