import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SparkForge — AI Marketing Co-Founder for Solana",
  description: "The AI marketing copilot built exclusively for early-stage Solana builders. Ship killer marketing in minutes.",
  openGraph: {
    title: "SparkForge — AI Marketing Co-Founder for Solana",
    description: "Generate tweets, Pump.fun descriptions, mascots, launch announcements and more with AI.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <meta name="theme-color" content="#0A0A1F" />
      </head>
      <body className="h-screen overflow-hidden bg-[#0A0A1F]">
        {children}
      </body>
    </html>
  );
}
