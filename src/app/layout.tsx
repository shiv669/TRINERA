import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google"; // 1. Global Theme: Font
import "./globals.css";
import Navbar from "@/components/Navbar"; // 1. Global Theme: Navbar
import FloatingActions from "@/components/FloatingActions";
import { LanguageProvider } from "@/context/LanguageContext";

// Configuring Noto Sans for English, Devanagari (Hindi)
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "devanagari"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TRINERA - AI-Powered Live Farming Assistant",
  description: "Real-time pest detection with voice interaction. Talk to AI, show your crops, get instant treatment advice. Powered by Ollama, HuggingFace & Edge TTS. Built with ❤️ for farmers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${notoSans.variable} ${notoSans.className} antialiased flex flex-col min-h-screen`}
      >
        <LanguageProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <FloatingActions />
        </LanguageProvider>
      </body>
    </html>
  );
}
