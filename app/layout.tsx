import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UI Fidelity Checker",
  description: "Compare design mockups with implementation screenshots",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
