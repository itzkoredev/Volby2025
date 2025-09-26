import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const libreBaskerville = localFont({
  src: [
    {
      path: "./fonts/Libre_Baskerville/LibreBaskerville-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Libre_Baskerville/LibreBaskerville-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/Libre_Baskerville/LibreBaskerville-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-libre-baskerville",
});

export const metadata: Metadata = {
  title: "Volby 2025 - Hlavní rozcestník",
  description: "Kompletní volební portál pro české volby 2025. Volební kalkulačka, AI chatbot, profily stran, mapa a další nástroje pro informované rozhodování.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body
        className={`min-h-screen font-serif antialiased ${libreBaskerville.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
