import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Church - Gestion Digitale pour Paroisses",
  description:
    "Plateforme SaaS complète pour la gestion digitale des paroisses catholiques. Gestion des fidèles, sacrements, finances, communication et plus.",
  keywords: [
    "My Church",
    "paroisse",
    "gestion digitale",
    "église catholique",
    "sacrements",
    "gestion paroissiale",
    "SaaS",
  ],
  authors: [{ name: "My Church Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "My Church - Gestion Digitale pour Paroisses",
    description:
      "Plateforme SaaS pour la gestion digitale des paroisses catholiques",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Church - Gestion Digitale pour Paroisses",
    description:
      "Plateforme SaaS pour la gestion digitale des paroisses catholiques",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
