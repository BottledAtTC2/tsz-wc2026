import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TSZ World Cup 2026",
  description: "Fantasy league tracker for the 2026 FIFA World Cup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-navy text-ink">
        <Nav />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
