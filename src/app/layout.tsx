import type { Metadata } from "next";
import { Bricolage_Grotesque, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CosmicBackground } from "@/components/cosmic-background";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
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
    <html lang="zh-CN" className={`${bricolageGrotesque.variable} ${outfit.variable}`}>
      <body className={`${outfit.className} antialiased bg-[#0a0a0f] text-white`}>
        <CosmicBackground />
        <div className="cosmic-content">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
