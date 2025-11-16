import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mobilien - All-in-One EV Töltési Megoldás Magyarországon",
  icons: "/mobilien5.png",
  description:
    "Érje el az összes töltőállomást Magyarországon egyetlen alkalmazással. Valós idejű adatok, megbízható információk és MI-alapú asszisztencia.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <CookieBanner />
      </body>
    </html>
  );
}

import "./globals.css";
