import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Media Downloader - Descarga Multimedia",
  description: "Aplicación web moderna para descargar contenido multimedia desde múltiples plataformas como YouTube, TikTok, Instagram y más.",
  keywords: ["descargador", "multimedia", "YouTube", "TikTok", "Instagram", "video", "audio"],
  authors: [{ name: "Media Downloader Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Media Downloader",
    description: "Descarga contenido multimedia desde múltiples plataformas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media Downloader",
    description: "Descarga contenido multimedia desde múltiples plataformas",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
