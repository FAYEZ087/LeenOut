import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./layout-client";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Leenout — Collaborative Coding Marketplace for Strangers",
  description: "A public marketplace where strangers build together, gated by project owners, coordinated by structured edit windows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmMono.variable} h-full antialiased`}
    >
      <head />
      <RootLayoutClient>{children}</RootLayoutClient>
    </html>
  );
}
