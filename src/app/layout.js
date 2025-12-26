import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "WhatTime.Works",
  description: "Simple meeting coordination for groups.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
