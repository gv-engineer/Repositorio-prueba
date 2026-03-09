import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebGIS Sísmico | Plataforma Multimodelo de Análisis Espacio-Temporal",
  description: "Sistema WebGIS para visualización y análisis espacio-temporal de eventos sísmicos utilizando Next.js y tecnologías geoespaciales.",
  keywords: ["WebGIS", "Sismos", "Next.js", "SIG", "Análisis Espacio-Temporal"],
  authors: [{ name: "Gustavo Vidaurre" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "WebGIS Sísmico",
    description: "Plataforma interactiva para el análisis y visualización de eventos sísmicos.",
    url: "http://localhost:3000",
    siteName: "WebGIS Sísmico",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WebGIS Sísmico",
    description: "Visualización y análisis geoespacial de eventos sísmicos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}