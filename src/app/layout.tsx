import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "STEMiks – Gamified STEM Learning",
  description:
    "Master Science, Technology, Engineering & Mathematics through competitive quiz games. Earn XP, climb leaderboards, unlock achievements!",
  keywords: ["STEM", "learning", "quiz", "gamification", "education", "science", "mathematics"],
  openGraph: {
    title: "STEMiks – Gamified STEM Learning",
    description: "Compete, learn, and master STEM subjects",
    type: "website",
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#111827",
                color: "#f1f5f9",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
