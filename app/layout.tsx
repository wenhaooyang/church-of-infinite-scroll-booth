import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Church of Infinite Scroll",
  description: "We are all still doomscrolling. We've just unionized.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;1,300&family=UnifrakturMaguntia&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
