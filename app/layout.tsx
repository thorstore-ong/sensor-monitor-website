import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sensor Monitor",
  description: "Live view of battery, generator and rectifier telemetry",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
