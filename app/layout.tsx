import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karachi Transit Guide & Live Reports",
  description: "Official bus routes, fare calculator, nearest stop finder, and crowdsourced delay updates for Karachi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased font-sans">{children}</body>
    </html>
  );
}