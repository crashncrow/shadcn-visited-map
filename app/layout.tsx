import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { SiteHeader } from "@/components/site/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { siteUrl } from "@/lib/site"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Visited Map — shadcn/ui registry",
    template: "%s — Visited Map",
  },
  description:
    "An SVG world map for shadcn/ui that highlights the countries you've visited, pins cities and counts how much of the world you've seen.",
  metadataBase: new URL(siteUrl),
  applicationName: "Visited Map",
  authors: [{ name: "@_nnaro_", url: "https://x.com/_nnaro_" }],
  keywords: [
    "shadcn",
    "shadcn/ui",
    "registry",
    "world map",
    "visited countries",
    "travel map",
    "React",
    "Next.js",
    "SVG",
  ],
  alternates: { canonical: "/" },
  // Each page's title and description fill og:* and twitter:* on their own;
  // the image comes from app/opengraph-image.tsx.
  openGraph: {
    type: "website",
    siteName: "Visited Map",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@_nnaro_",
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col [--header-height:3.5rem]">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SiteHeader />
            <div className="flex flex-1 flex-col">{children}</div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
