import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Minesweeper Game - Classic Puzzle with Modern Design",
    template: "%s | Minesweeper"
  },
  description: "Play the classic Minesweeper puzzle game with a beautiful modern interface. Features dark/light mode, save/resume functionality, and smooth animations. Clear the minefield without hitting a mine!",
  keywords: [
    "minesweeper",
    "puzzle game",
    "classic game", 
    "browser game",
    "mine sweeper",
    "logic game",
    "strategy game",
    "free game",
    "online game",
    "web game"
  ],
  authors: [{ name: "Minesweeper Game" }],
  creator: "Minesweeper Game",
  publisher: "Minesweeper Game",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://minesweeper.sugarandcoffee.co.uk"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Minesweeper Game - Classic Puzzle with Modern Design",
    description: "Play the classic Minesweeper puzzle game with a beautiful modern interface. Features dark/light mode, save/resume functionality, and smooth animations.",
    siteName: "Minesweeper Game",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Minesweeper Game - Classic Puzzle Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Minesweeper Game - Classic Puzzle with Modern Design",
    description: "Play the classic Minesweeper puzzle game with a beautiful modern interface.",
    images: ["/og-image.svg"],
    creator: "@minesweepergame",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "games",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml", sizes: "180x180" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icon.svg",
        color: "#374151",
      },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          defaultTheme="system"
          storageKey="minesweeper-theme"
        >
          {children}
        </ThemeProvider>
        <GoogleAnalytics gaId="G-KHKPTY44K0" />
      </body>
    </html>
  );
}
