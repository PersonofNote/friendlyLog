import type { Metadata } from "next";
import Link from 'next/link';
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FriendlyLog",
  description: "CloudWatch Logs for Humans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="corporate">
      <head>
        <title>FriendlyLog</title>
        <meta name="description" content="Daily AWS logs made human." />
        <link rel="icon" href="/friendlylog-favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="p-2 text-xs"> 
          Copyright 2025 <Link href="/terms">Privacy Policy</Link> <Link href="/terms">Terms </Link>
          <div>Questions? Concerns? Cool stories? Email us! </div>
        </footer>
        <Analytics/>
      </body>
    </html>
  );
}
