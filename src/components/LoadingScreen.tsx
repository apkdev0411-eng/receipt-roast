"use client";

import { useEffect, useState } from "react";
import type { Language } from "@/lib/i18n";

const PHRASES = {
  es: [
    "Analizando tus decisiones financieras…",
    "Contando cuántos cafés artesanales caben en un sueldo…",
    "Calibrando el nivel de sarcasmo…",
    "Preguntándole a tu billetera cómo se siente…",
    "Traduciendo el ticket a drama…",
    "Buscando el gasto más indefendible…",
    "Preparando el insight útil…",
    "Revisando si ese gasto era realmente necesario…",
    "Calculando el daño a tu futuro yo…",
    "Calculando cuántas pizzas equivalen a tu renta…",
    "Tu cuenta bancaria acaba de pedir asilo…",
    "Detectando compras impulsivas con precisión quirúrgica…",
    "El algoritmo está juzgando tus prioridades…",
    "Convirtiendo números en vergüenza elegante…",
    "Buscando el gasto que tu yo del futuro va a odiar…",
    "Midiendo el daño en unidades de café…",
    "Tu ticket está a punto de ser destruido con estilo…",
    "Analizando si esto cuenta como necesidad o capricho…",
    "Consultando con tu yo del futuro… ya está decepcionado.",
  ],
  en: [
    "Analyzing your financial decisions…",
    "Counting how many artisanal coffees fit in a salary…",
    "Calibrating sarcasm levels…",
    "Asking your wallet how it feels…",
    "Translating the receipt into drama…",
    "Looking for the most indefensible expense…",
    "Preparing the useful insight…",
    "Checking if that expense was really necessary…",
    "Calculating the damage to your future self…",
    "Consulting your future self… they're already disappointed.",
  ],
};

interface Props {
  lang: Language;
}

export function LoadingScreen({ lang }: Props) {
  const [index, setIndex] = useState(0);
  const [dots, setDots] = useState("");
  const phrases = PHRASES[lang];

  useEffect(() => {
    const phraseId = window.setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, 2400);

    const dotsId = window.setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);

    return () => {
      window.clearInterval(phraseId);
      window.clearInterval(dotsId);
    };
  }, [phrases.length]);

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8">
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-white/10 border-t-ember" />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">🔥</div>
      </div>

      <p className="text-sm uppercase tracking-[0.25em] text-ember">
        {lang === "en" ? "Processing" : "Procesando"}{dots}
      </p>

      <h2 className="mt-4 max-w-md text-2xl font-bold text-white sm:text-3xl">
        {phrases[index]}
      </h2>

      <p className="mt-6 text-sm text-white/45">
        {lang === "en" 
          ? "This usually takes a few seconds. We don't store your image."
          : "Esto suele tomar unos segundos. No guardamos tu imagen."}
      </p>
    </section>
  );
}