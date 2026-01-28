import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

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
        className="antialiased font-sans"
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
