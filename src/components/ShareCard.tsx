"use client";

/**
 * Off-screen share card rendered for capture via html-to-image.
 * Fixed 1080×1350 canvas (4:5) looks good on Instagram / WhatsApp stories.
 */

import { forwardRef } from "react";
import type { RoastResult } from "@/lib/types";

interface Props {
  result: RoastResult;
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency || "MXN",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(0)} ${currency}`;
  }
}

export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  { result },
  ref,
) {
  const modeLabel = result.mode === "duro" ? "Roast Duro" : "Coach Sarcástico";
  const modeEmoji = result.mode === "duro" ? "🔥" : "😏";

  return (
    <div
      ref={ref}
      style={{ width: 1080, height: 1350 }}
      className="relative overflow-hidden bg-[#0a0a0c] text-white"
    >
      {/* Background effects */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(255,107,53,0.6) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-20 h-[550px] w-[550px] rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(255,60,90,0.5) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex h-full flex-col px-16 py-16">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-4xl font-black tracking-tight">
              Receipt <span style={{ color: "#ff6b35" }}>Roast</span>
            </p>
            <p className="mt-2 flex items-center gap-2 text-xl text-white/60">
              <span>{modeEmoji}</span>
              <span>{modeLabel}</span>
            </p>
          </div>
          <div className="text-right">
            <div
              className="rounded-2xl px-6 py-3 text-2xl font-bold"
              style={{ background: "rgba(255,107,53,0.15)", color: "#ff6b35" }}
            >
              {formatMoney(result.total, result.currency)}
            </div>
            {result.merchant && (
              <p className="mt-2 text-lg text-white/50">{result.merchant}</p>
            )}
          </div>
        </div>

        {/* Roast */}
        <div className="mt-20 flex-1">
          <p className="text-xl font-medium uppercase tracking-[0.3em] text-white/40">
            El roast
          </p>
          <p className="mt-8 text-[48px] font-bold leading-[1.15] tracking-tight">
            “{result.roast}”
          </p>
        </div>

        {/* Insight */}
        <div
          className="mt-12 rounded-3xl border border-white/10 p-10"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <p className="text-lg font-semibold uppercase tracking-[0.25em]" style={{ color: "#ff6b35" }}>
            Insight útil
          </p>
          <p className="mt-4 text-[28px] leading-snug text-white/90">
            {result.insight}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xl text-white/40">
            receiptroast.app
          </p>
          <p className="mt-1 text-lg text-white/30">
            Sube tu ticket. Sobrevive al roast.
          </p>
        </div>
      </div>
    </div>
  );
});