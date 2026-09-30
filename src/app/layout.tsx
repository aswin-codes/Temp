import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { preconnect, preload } from "react-dom";
import { BRAND } from "@/site/config";
import "./globals.css";

const TITLE = "Otaku Bharat · India's First Short-Form Anime Studio";
const SITE_URL = BRAND.url;
// Archivo's width axis (62–125%) drives the wide display type, so it loads as
// the full variable font rather than through next/font.
const FONTS =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Devanagari:wght@500;700&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description:
    "Otaku Bharat is India's first short-form anime studio. Original Indian anime, starting with an alt-history drama set in 1757.",
  alternates: { canonical: SITE_URL },
  icons: {
    icon: { url: "/assets/logo.png", type: "image/png" },
    apple: "/assets/logo-180.png",
  },
  openGraph: {
    title: TITLE,
    description: "Original Indian anime, built for the scroll. 1757. One queen. One Silver Tongue. Six mohras.",
    type: "website",
    url: SITE_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07061a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  preconnect("https://fonts.googleapis.com");
  preconnect("https://fonts.gstatic.com", { crossOrigin: "anonymous" });
  // The hero carousel opens on these three stills; video2 is the focused one.
  preload("/assets/videos/posters/video2.webp", { as: "image", type: "image/webp", fetchPriority: "high" });
  preload("/assets/videos/posters/video4.webp", { as: "image", type: "image/webp" });
  preload("/assets/videos/posters/video3.webp", { as: "image", type: "image/webp" });

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
