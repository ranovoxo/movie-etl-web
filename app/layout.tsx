import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movie Pipeline Reports",
  description: "Public reporting dashboard for Airflow-powered movie data products."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
