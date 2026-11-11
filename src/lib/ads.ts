import { AdMob, InterstitialAdPluginEvents } from "@capacitor-community/admob";
import { Capacitor } from "@capacitor/core";

const AD_UNIT_ID = "ca-app-pub-7945689672185988/7297064644";

export async function initAds() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.initialize();
  } catch (e) {
    console.error("AdMob init error:", e);
  }
}

export async function showInterstitial(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.prepareInterstitial({
      adId: AD_UNIT_ID,
    });
    await AdMob.showInterstitial();
  } catch (e) {
    console.error("Interstitial error:", e);
  }
}