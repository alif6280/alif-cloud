import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alif Cloud — Your Personal Cloud Storage",
  description: "Secure, fast, and beautiful personal cloud storage.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}