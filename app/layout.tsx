import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Reading Ale Trail 2026 | CAMRA",
  description:
    "Track your progress on the Reading & Mid-Berkshire CAMRA Ale Trail 2026. Visit all 24 pubs before 17 May 2026!",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍺</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark text-primary min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
