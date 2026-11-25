import type { Metadata, Viewport } from "next";
import { Newsreader, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import OfflineStatus from "@/components/offline-status";

// Headlines in Newsreader (an editorial serif, upright only), interface text in Hanken Grotesk.
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal"], axes: ["opsz"], variable: "--font-head" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-ui" });

export const metadata: Metadata = {
  title: "Grove: ask anything, privately",
  description: "Grove is a free assistant that runs on your own device. No account, nothing sent anywhere, and it works offline.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${hanken.variable}`}>
      <body>
        {children}
        <OfflineStatus />
      </body>
    </html>
  );
}
