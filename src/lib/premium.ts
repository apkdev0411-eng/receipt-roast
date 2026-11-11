const PREMIUM_KEY = "receipt-roast-premium";

export function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PREMIUM_KEY) === "true";
}

export function setPremium(value: boolean) {
  localStorage.setItem(PREMIUM_KEY, value ? "true" : "false");
}