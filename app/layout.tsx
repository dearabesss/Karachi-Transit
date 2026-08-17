import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karachi Transit Guide & Live Navigation",
  description: "Accurate Karachi Bus Route Planner, Fare Calculation, Station Finding, and Real-Time Delay Reporting.",
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
