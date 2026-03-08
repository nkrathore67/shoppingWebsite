import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StyleHub — Fashion for Everyone",
    template: "%s | StyleHub",
  },
  description:
    "Shop the latest trends in men's, women's, and kids' fashion. Ethnic wear, western wear, casual wear, and more.",
  keywords: ["fashion", "clothing", "men", "women", "kids", "ethnic wear", "western wear"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "StyleHub",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
