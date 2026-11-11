"use client";

import { useCallback, useEffect, useState } from "react";
import type { RoastApiResponse, RoastMode, RoastResult } from "@/lib/types";
import { HomeScreen } from "./HomeScreen";
import { LoadingScreen } from "./LoadingScreen";
import { ResultScreen } from "./ResultScreen";
import { FlameBackground } from "./FlameBackground";
import { Onboarding } from "./Onboarding";
import type { Language } from "@/lib/i18n";
import { loadStats, addRoastPoints, type UserStats } from "@/lib/points";
import { isPremium, setPremium } from "@/lib/premium";
import { initRevenueCat, checkPremium } from "@/lib/revenuecat";
import { initAds, showInterstitial } from "@/lib/ads";

type Step = "home" | "loading" | "result";

const HISTORY_KEY = "receipt-roast-history";
const LANG_KEY = "receipt-roast-lang";
const ONBOARDING_KEY = "receipt-roast-onboarding";
const MAX_HISTORY = 8;
const API_URL = "https://receipt-roast-rho.vercel.app/api/roast";

function loadHistory(): RoastResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as RoastResult[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: RoastResult[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch {}
}

function loadLanguage(): Language {
  if (typeof window === "undefined") return "es";
  const saved = localStorage.getItem(LANG_KEY);
  return saved === "en" ? "en" : "es";
}

export function ReceiptRoastApp() {
  const [step, setStep] = useState<Step>("home");
  const [mode, setMode] = useState<RoastMode>("duro");
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RoastResult[]>([]);
  const [lang, setLang] = useState<Language>("es");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [premium, setPremiumState] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    setLang(loadLanguage());
    setStats(loadStats());
    setPremiumState(isPremium());
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) setShowOnboarding(true);

    initRevenueCat().then(() => {
      checkPremium().then((isPrem) => {
        if (isPrem) {
          setPremium(true);
          setPremiumState(true);
        }
      });
    });

    initAds();
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const changeLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  }, []);

  const reset = useCallback(() => {
    setStep("home");
    setResult(null);
    setError(null);
    setNewBadges([]);
  }, []);

  const openFromHistory = useCallback((item: RoastResult) => {
    setResult(item);
    setStep("result");
    setNewBadges([]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  const showError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setNewBadges([]);
      setStep("loading");

      const body = new FormData();
      body.append("image", file);
      body.append("mode", mode);
      body.append("lang", lang);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          body,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const text = await res.text();

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = JSON.parse(text) as RoastApiResponse;

        if (!data.ok) {
          let friendly = data.error || "Algo salió mal.";
          if (data.code === "NOT_A_RECEIPT") {
            friendly = lang === "en" ? "This doesn't look like a receipt." : "No parece un ticket o extracto.";
          } else if (data.code === "BAD_IMAGE") {
            friendly = lang === "en" ? "Invalid image." : "La imagen no es válida.";
          } else if (data.code === "API_ERROR") {
            friendly = lang === "en" ? "There was a problem. Try again." : "Hubo un problema. Inténtalo de nuevo.";
          }
          showError(friendly);
          setStep("home");
          return;
        }

        const newResult = data.result;
        setResult(newResult);

        if (isPremium()) {
          const { stats: newStats, newBadges: badges } = addRoastPoints(
            newResult.total,
            newResult.currency,
            newResult.expenses,
            mode,
          );
          setStats(newStats);
          setNewBadges(badges);

          setHistory((prev) => {
            const next = [newResult, ...prev.filter((h) => h.roast !== newResult.roast)].slice(0, MAX_HISTORY);
            saveHistory(next);
            return next;
          });
        } else {
          setNewBadges([]);
          await showInterstitial();
        }

        setStep("result");
      } catch (err) {
  clearTimeout(timeoutId);
  console.error("Roast error:", err);
  const errorMessage = err instanceof Error ? err.message : String(err);
  showError(`Error: ${errorMessage}`);
  setStep("home");
}
    },
    [mode, lang, showError],
  );

  const onFileSelected = useCallback(
    (file: File) => {
      processFile(file);
    },
    [processFile],
  );

  const unlockPremium = useCallback(() => {
    setPremium(true);
    setPremiumState(true);
    alert(lang === "en" ? "Premium unlocked!" : "¡Premium desbloqueado!");
  }, [lang]);

  return (
    <main className="relative min-h-dvh overflow-x-hidden">
      <FlameBackground />

      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}

      {step === "home" && (
        <HomeScreen
          mode={mode}
          onModeChange={setMode}
          onFileSelected={onFileSelected}
          error={error}
          history={history}
          onOpenHistory={openFromHistory}
          onClearHistory={clearHistory}
          lang={lang}
          onChangeLanguage={changeLanguage}
          stats={stats}
          premium={premium}
          onUnlockPremium={unlockPremium}
        />
      )}
      {step === "loading" && <LoadingScreen lang={lang} />}
      {step === "result" && result && (
        <ResultScreen result={result} onReset={reset} lang={lang} newBadges={newBadges} />
      )}

      <footer className="pb-8 text-center text-xs text-white/30">
        Receipt Roast · roast de hábitos, nunca de identidad
      </footer>
    </main>
  );
}