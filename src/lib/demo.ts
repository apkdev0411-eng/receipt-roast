/**
 * Realistic mock data used when XAI_API_KEY is missing or DEMO_MODE=true.
 * Lets anyone try the full UI without calling xAI.
 */

import type { RoastMode, RoastResult } from "./types";

const DEMO_EXPENSES = [
  { name: "Flat white artesanal x3", amount: 285, category: "café" },
  { name: "Croissant de mantequilla", amount: 95, category: "comida" },
  { name: "Suscripción streaming premium", amount: 229, category: "suscripciones" },
  { name: "Delivery sushi 22:40", amount: 620, category: "comida" },
  { name: "Uber corto (8 cuadras)", amount: 78, category: "transporte" },
];

const DEMO_TOTAL = DEMO_EXPENSES.reduce((s, e) => s + e.amount, 0);

const ROASTS: Record<RoastMode, { roast: string; insight: string }> = {
  duro: {
    roast:
      "Trescientos ochenta pesos en café artesanal y croissants. En serio: estás patrocinando la maestría del barista mientras tu cuenta de ahorros se declara en huelga. El sushi a las 22:40 es el plot twist… de una tragedia financiera en tres actos. Y ese Uber de ocho cuadras? Tus piernas presentaron su renuncia hace rato.",
    insight:
      "Si bajas el café de especialidad a la mitad y caminas esos trayectos cortos, podrías ahorrar unos $450–550 MXN al mes. Suficiente para un mes de streaming… o para dejar de financiar el delivery nocturno.",
  },
  coach: {
    roast:
      "El flat white está rico, lo admito. Pero tu extracto parece el diario de alguien que negoció la paz con el delivery y perdió. Tres cafés artesanales + sushi a deshora + Uber de ocho cuadras: tu billetera no está enojada, está haciendo terapia.",
    insight:
      "Prueba preparar un café decente en casa tres días a la semana y camina los trayectos de menos de 1 km. Diferencia estimada: ~$480 MXN/mes. Destínalos a un fondo de 'no-emergency delivery' — tu yo del futuro aplaudirá en silencio.",
  },
};

export function getDemoResult(mode: RoastMode): RoastResult {
  const copy = ROASTS[mode];
  return {
    mode,
    roast: copy.roast,
    insight: copy.insight,
    merchant: "Café & Co. / Mixto (demo)",
    currency: "MXN",
    date: "2026-10-28",
    expenses: DEMO_EXPENSES,
    total: DEMO_TOTAL,
    demo: true,
  };
}
