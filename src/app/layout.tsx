import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Receipt Roast — Sube tu ticket, sobrevive al roast",
  description:
    "Sube una foto de tu ticket o extracto y deja que la IA te destruya con elegancia. Roast duro o coach sarcástico, más un insight útil.",
  applicationName: "Receipt Roast",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07070a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff6b35" />
      </head>
      <body>{children}</body>
    </html>
  );
}
