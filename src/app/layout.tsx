import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CosmicBackground } from "@/components/cosmic-background";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "STEPs - 积分兑换系统",
  description: "每日签到赚取积分，兑换心仪商品",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${spaceGrotesk.variable} ${outfit.variable}`}>
      <body className={`${outfit.className} antialiased bg-[#0a0a1a] text-white`}>
        <CosmicBackground />
        <div className="cosmic-content">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
