import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { AuthStoreProvider } from "@/providers/auth-store-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Just In Chat",
  description: "Your Secure and Private Live Chat Space",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthStoreProvider>{children}</AuthStoreProvider>
      </body>
    </html>
  );
}
