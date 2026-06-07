import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";
import { ParticleBackground } from "@/components/particle-background";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "TypeFlow — Modern Typing Test",
    template: "%s · TypeFlow",
  },
  description:
    "A modern, customizable typing test with real-time statistics, themes, leaderboards and detailed analytics. Test and improve your typing speed.",
  keywords: ["typing test", "wpm", "typing speed", "monkeytype", "10fastfingers"],
  openGraph: {
    title: "TypeFlow — Modern Typing Test",
    description: "Test and improve your typing speed with real-time stats and analytics.",
    type: "website",
    url: appUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen font-sans antialiased`}
      >
        <ParticleBackground />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="container flex flex-1 flex-col py-6">{children}</main>
            <footer className="container py-6 text-center text-xs text-muted-foreground">
              <p>
                TypeFlow — built with Next.js, Prisma & Tailwind.{" "}
                <span className="opacity-70">Press Ctrl+K for commands.</span>
              </p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
