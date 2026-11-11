"use client";

import type { RoastMode } from "@/lib/types";
import type { Language } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

interface Props {
  value: RoastMode;
  onChange: (mode: RoastMode) => void;
  lang: Language;
}

export function ModeSelector({ value, onChange, lang }: Props) {
  const t = getTranslations(lang);

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange("duro")}
        className={`rounded-2xl border p-4 text-left transition ${
          value === "duro"
            ? "border-ember bg-ember/15"
            : "border-white/10 bg-white/5 hover:bg-white/10"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${value === "duro" ? "bg-ember" : "bg-white/30"}`} />
          <span className="font-semibold text-white">{t.roastDuro}</span>
        </div>
        <p className="mt-1 text-sm text-white/50">{t.roastDuroDesc}</p>
      </button>

      <button
        type="button"
        onClick={() => onChange("coach")}
        className={`rounded-2xl border p-4 text-left transition ${
          value === "coach"
            ? "border-ember bg-ember/15"
            : "border-white/10 bg-white/5 hover:bg-white/10"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${value === "coach" ? "bg-white" : "bg-white/30"}`} />
          <span className="font-semibold text-white">{t.coach}</span>
        </div>
        <p className="mt-1 text-sm text-white/50">{t.coachDesc}</p>
      </button>
    </div>
  );
}