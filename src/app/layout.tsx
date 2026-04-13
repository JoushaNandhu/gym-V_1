import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GymV1 - AI Powered Fitness Tracking",
  description: "Track your health and gym progress with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
