import { Purchases, LOG_LEVEL } from "@revenuecat/purchases-capacitor";
import { Capacitor } from "@capacitor/core";

const API_KEY = "test_qdRTXzfTPhJHKTJSpzNRlPgchRZ";

export async function initRevenueCat() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({ apiKey: API_KEY });
  } catch (e) {
    console.error("RevenueCat init error:", e);
  }
}

export async function checkPremium(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active["premium"] !== undefined;
  } catch {
    return false;
  }
}

export async function purchasePremium(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current || !current.availablePackages.length) return false;
    const pkg = current.availablePackages[0];
    const result = await Purchases.purchasePackage({ aPackage: pkg });
    // En modo test, verifica si hay algún entitlement activo
    const entitlements = result.customerInfo.entitlements.active;
    return Object.keys(entitlements).length > 0;
  } catch {
    return false;
  }
}