export interface BadgeEntry {
  name: string;
  currency?: string;
}

export interface UserStats {
  points: number;
  level: string;
  badges: BadgeEntry[];
  lastRoastDate: string | null;
  streak: number;
  totalRoasts: number;
  modesUsed: string[];
  todayRoasts: number;
  lastRoastDay: string | null;
  sharesCount: number;
  categoryTotals: Record<string, number>;
}

const POINTS_KEY = "receipt-roast-points";

const ROAST_COUNT_BADGES = [
  { count: 1, name: "Primer Roast" },
  { count: 5, name: "Habitual" },
  { count: 15, name: "Adicto" },
  { count: 30, name: "Veterano" },
  { count: 50, name: "Leyenda del Roast" },
];

const STREAK_BADGES = [
  { days: 3, name: "Constante" },
  { days: 7, name: "Comprometido" },
  { days: 14, name: "Imparable" },
  { days: 30, name: "Máquina" },
];

const CATEGORY_BADGES: Record<string, string> = {
  café: "Cafetero",
  cafe: "Cafetero",
  comida: "Foodie",
  restaurante: "Foodie",
  compras: "Shopaholic",
  ropa: "Shopaholic",
  tecnología: "Tech Lover",
  tecnologia: "Tech Lover",
  viajes: "Viajero",
  suscripciones: "Suscriptor",
  transporte: "Conductor",
  gasolina: "Conductor",
  hogar: "Casero",
};

function hasBadge(badges: BadgeEntry[], name: string): boolean {
  return badges.some((b) => b.name === name);
}

export function loadStats(): UserStats {
  const defaults: UserStats = {
    points: 0,
    level: "Principiante",
    badges: [],
    lastRoastDate: null,
    streak: 0,
    totalRoasts: 0,
    modesUsed: [],
    todayRoasts: 0,
    lastRoastDay: null,
    sharesCount: 0,
    categoryTotals: {},
  };
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(POINTS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    // Migrar badges viejos (strings) a objetos
    if (Array.isArray(parsed.badges) && parsed.badges.length > 0 && typeof parsed.badges[0] === "string") {
      parsed.badges = parsed.badges.map((b: string) => ({ name: b }));
    }
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function saveStats(stats: UserStats) {
  localStorage.setItem(POINTS_KEY, JSON.stringify(stats));
}

export function getLevel(points: number): string {
  if (points >= 700) return "Leyenda";
  if (points >= 300) return "Maestro";
  if (points >= 100) return "Roaster";
  return "Principiante";
}

export function getLevelEmoji(level: string): string {
  const map: Record<string, string> = {
    Principiante: "🔥",
    Roaster: "🎯",
    Maestro: "👑",
    Leyenda: "💀",
  };
  return map[level] || "🔥";
}

export function getLevelName(level: string, lang: "es" | "en"): string {
  const map: Record<string, Record<string, string>> = {
    Principiante: { es: "Principiante", en: "Beginner" },
    Roaster: { es: "Roaster", en: "Roaster" },
    Maestro: { es: "Maestro", en: "Master" },
    Leyenda: { es: "Leyenda", en: "Legend" },
  };
  return map[level]?.[lang] || level;
}

export function getBadgeEmoji(badge: string): string {
  const map: Record<string, string> = {
    Gastador: "💸",
    "Gran Gastador": "💰",
    Magnate: "🏆",
    "Leyenda del Gasto": "👑",
    "Primer Roast": "🎉",
    Habitual: "🔁",
    Adicto: "🔥",
    Veterano: "⭐",
    "Leyenda del Roast": "🏆",
    Constante: "📅",
    Comprometido: "💪",
    Imparable: "🚀",
    Máquina: "⚡",
    Cafetero: "☕",
    Foodie: "🍔",
    Shopaholic: "🛍️",
    "Tech Lover": "💻",
    Viajero: "✈️",
    Suscriptor: "📱",
    Conductor: "🚗",
    Casero: "🏠",
    Madrugador: "🌅",
    Nocturno: "🌙",
    "Ticket Gigante": "💎",
    "Micro Gasto": "🪙",
    Internacional: "🌍",
    Coleccionista: "🎖️",
    Completista: "🏅",
    Analítico: "🔍",
    "Multi-ticket": "📋",
    "Año Nuevo": "🎆",
    "Black Friday": "🛒",
    Compartidor: "📤",
  };
  return map[badge] || "🎖️";
}

export function getBadgeName(badge: string, lang: "es" | "en"): string {
  const map: Record<string, Record<string, string>> = {
    Gastador: { es: "Gastador", en: "Spender" },
    "Gran Gastador": { es: "Gran Gastador", en: "Big Spender" },
    Magnate: { es: "Magnate", en: "Tycoon" },
    "Leyenda del Gasto": { es: "Leyenda del Gasto", en: "Spending Legend" },
    "Primer Roast": { es: "Primer Roast", en: "First Roast" },
    Habitual: { es: "Habitual", en: "Regular" },
    Adicto: { es: "Adicto", en: "Addict" },
    Veterano: { es: "Veterano", en: "Veteran" },
    "Leyenda del Roast": { es: "Leyenda del Roast", en: "Roast Legend" },
    Constante: { es: "Constante", en: "Consistent" },
    Comprometido: { es: "Comprometido", en: "Committed" },
    Imparable: { es: "Imparable", en: "Unstoppable" },
    Máquina: { es: "Máquina", en: "Machine" },
    Cafetero: { es: "Cafetero", en: "Coffee Lover" },
    Foodie: { es: "Foodie", en: "Foodie" },
    Shopaholic: { es: "Shopaholic", en: "Shopaholic" },
    "Tech Lover": { es: "Tech Lover", en: "Tech Lover" },
    Viajero: { es: "Viajero", en: "Traveler" },
    Suscriptor: { es: "Suscriptor", en: "Subscriber" },
    Conductor: { es: "Conductor", en: "Driver" },
    Casero: { es: "Casero", en: "Homebody" },
    Madrugador: { es: "Madrugador", en: "Early Bird" },
    Nocturno: { es: "Nocturno", en: "Night Owl" },
    "Ticket Gigante": { es: "Ticket Gigante", en: "Giant Ticket" },
    "Micro Gasto": { es: "Micro Gasto", en: "Micro Spend" },
    Internacional: { es: "Internacional", en: "International" },
    Coleccionista: { es: "Coleccionista", en: "Collector" },
    Completista: { es: "Completista", en: "Completionist" },
    Analítico: { es: "Analítico", en: "Analytical" },
    "Multi-ticket": { es: "Multi-ticket", en: "Multi-ticket" },
    "Año Nuevo": { es: "Año Nuevo", en: "New Year" },
    "Black Friday": { es: "Black Friday", en: "Black Friday" },
    Compartidor: { es: "Compartidor", en: "Sharer" },
  };
  return map[badge]?.[lang] || badge;
}

export function getFavoriteCategory(stats: UserStats): string | null {
  const entries = Object.entries(stats.categoryTotals || {});
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export function getRoastCountBadges(totalRoasts: number): string[] {
  return ROAST_COUNT_BADGES.filter((b) => totalRoasts >= b.count).map((b) => b.name);
}

export function getStreakBadges(streak: number): string[] {
  return STREAK_BADGES.filter((b) => streak >= b.days).map((b) => b.name);
}

export function getCategoryBadge(expenses: { category: string; amount: number }[]): string | null {
  const totals: Record<string, number> = {};
  expenses.forEach((e) => {
    const cat = e.category.toLowerCase();
    totals[cat] = (totals[cat] || 0) + e.amount;
  });
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;
  return CATEGORY_BADGES[top[0]] || null;
}

export function getTimeBadge(): string | null {
  const hour = new Date().getHours();
  if (hour < 8) return "Madrugador";
  if (hour >= 23) return "Nocturno";
  return null;
}

export function getDateBadges(): string[] {
  const badges: string[] = [];
  const now = new Date();
  if (now.getMonth() === 0 && now.getDate() === 1) badges.push("Año Nuevo");
  if (now.getMonth() === 10) badges.push("Black Friday");
  return badges;
}

export function checkMultiTicket(todayRoasts: number): string | null {
  if (todayRoasts >= 3) return "Multi-ticket";
  return null;
}

export function checkAnalitico(modesUsed: string[]): string | null {
  if (modesUsed.includes("duro") && modesUsed.includes("coach")) return "Analítico";
  return null;
}

export function getSpecialBadges(total: number, currency: string, currentBadgeCount: number): string[] {
  const badges: string[] = [];
  const rate = currency === "USD" ? 20 : currency === "EUR" ? 22 : currency === "GBP" ? 25 : 1;
  const mxn = total * rate;

  if (mxn >= 20000) badges.push("Ticket Gigante");
  if (mxn > 0 && mxn < 50) badges.push("Micro Gasto");
  if (currency !== "MXN") badges.push("Internacional");
  if (currentBadgeCount >= 10) badges.push("Coleccionista");
  if (currentBadgeCount >= 32) badges.push("Completista");

  return badges;
}

export function checkAmountBadges(total: number, currency: string): { badge: string; currency: string }[] {
  const badges: { badge: string; currency: string }[] = [];
  const rate = currency === "USD" ? 20 : currency === "EUR" ? 22 : currency === "GBP" ? 25 : 1;
  const mxn = total * rate;

  if (mxn >= 50000) badges.push({ badge: "Leyenda del Gasto", currency });
  else if (mxn >= 10000) badges.push({ badge: "Magnate", currency });
  else if (mxn >= 5000) badges.push({ badge: "Gran Gastador", currency });
  else if (mxn >= 1000) badges.push({ badge: "Gastador", currency });

  return badges;
}

export function addShare(): { stats: UserStats; newBadge: string | null } {
  const stats = loadStats();
  stats.sharesCount = (stats.sharesCount || 0) + 1;
  let newBadge: string | null = null;

  if (stats.sharesCount >= 3 && !hasBadge(stats.badges, "Compartidor")) {
    stats.badges.push({ name: "Compartidor" });
    newBadge = "Compartidor";
  }

  saveStats(stats);
  return { stats, newBadge };
}

export function addRoastPoints(
  total: number,
  currency: string,
  expenses?: { category: string; amount: number }[],
  mode?: string,
): { stats: UserStats; newBadges: string[] } {
  const stats = loadStats();
  const today = new Date().toISOString().split("T")[0];
  const newBadges: string[] = [];

  if (stats.lastRoastDate) {
    const last = new Date(stats.lastRoastDate);
    const diff = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) stats.streak += 1;
    else if (diff > 1) stats.streak = 1;
  } else {
    stats.streak = 1;
  }

  stats.points += 10;
  if (stats.streak >= 7) stats.points += 50;
  else if (stats.streak >= 3) stats.points += 15;

  stats.lastRoastDate = today;
  stats.level = getLevel(stats.points);
  stats.totalRoasts = (stats.totalRoasts || 0) + 1;

  if (mode && !stats.modesUsed.includes(mode)) {
    stats.modesUsed.push(mode);
  }

  if (stats.lastRoastDay !== today) {
    stats.todayRoasts = 1;
    stats.lastRoastDay = today;
  } else {
    stats.todayRoasts = (stats.todayRoasts || 0) + 1;
  }

  if (expenses) {
    expenses.forEach((e) => {
      const cat = e.category.toLowerCase();
      stats.categoryTotals[cat] = (stats.categoryTotals[cat] || 0) + e.amount;
    });
  }

  const amountBadges = checkAmountBadges(total, currency);
  for (const b of amountBadges) {
    if (!hasBadge(stats.badges, b.badge)) {
      stats.badges.push({ name: b.badge, currency: b.currency });
      newBadges.push(b.badge);
    }
  }

  const countBadges = getRoastCountBadges(stats.totalRoasts);
  for (const b of countBadges) {
    if (!hasBadge(stats.badges, b)) {
      stats.badges.push({ name: b });
      newBadges.push(b);
    }
  }

  const streakBadges = getStreakBadges(stats.streak);
  for (const b of streakBadges) {
    if (!hasBadge(stats.badges, b)) {
      stats.badges.push({ name: b });
      newBadges.push(b);
    }
  }

  if (expenses) {
    const catBadge = getCategoryBadge(expenses);
    if (catBadge && !hasBadge(stats.badges, catBadge)) {
      stats.badges.push({ name: catBadge });
      newBadges.push(catBadge);
    }
  }

  const timeBadge = getTimeBadge();
  if (timeBadge && !hasBadge(stats.badges, timeBadge)) {
    stats.badges.push({ name: timeBadge });
    newBadges.push(timeBadge);
  }

  const multiBadge = checkMultiTicket(stats.todayRoasts);
  if (multiBadge && !hasBadge(stats.badges, multiBadge)) {
    stats.badges.push({ name: multiBadge });
    newBadges.push(multiBadge);
  }

  const analiticoBadge = checkAnalitico(stats.modesUsed);
  if (analiticoBadge && !hasBadge(stats.badges, analiticoBadge)) {
    stats.badges.push({ name: analiticoBadge });
    newBadges.push(analiticoBadge);
  }

  const dateBadges = getDateBadges();
  for (const b of dateBadges) {
    if (!hasBadge(stats.badges, b)) {
      stats.badges.push({ name: b });
      newBadges.push(b);
    }
  }

  const specialBadges = getSpecialBadges(total, currency, stats.badges.length);
  for (const b of specialBadges) {
    if (!hasBadge(stats.badges, b)) {
      stats.badges.push({ name: b, currency });
      newBadges.push(b);
    }
  }

  saveStats(stats);
  return { stats, newBadges };
}