import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terra Analog — Yerda Oy va Marsni kashf qiling",
  description: "Yerning Mars va Oyga o‘xshash real hududlari interaktiv atlasi.",
  applicationName: "Terra Analog",
  openGraph: { title: "Terra Analog", description: "Yerda Oy va Marsga o‘xshash joylarni toping.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz-Latn">
      <body>{children}</body>
    </html>
  );
}
