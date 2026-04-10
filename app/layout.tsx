import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { I18nProvider } from '@/components/providers/I18nProvider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _playfairDisplay = Playfair_Display({ subsets: ["latin"] });
const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Nobilified - See Yourself as Royalty. Free Preview, No Credit Card.',
  description: 'Become a timeless masterpiece. Upload your photo and get an instant AI-generated 18th-century oil portrait. Download digital or order a hand-painted print.',
  generator: 'v0.app',
  icons: {
    icon: '/nobilified_favicon.png',
    shortcut: '/nobilified_favicon.png',
    apple: '/nobilified_favicon.png',
  },
}

const isDarkMode = false; // Internal variable to quickly switch between dark and light mode

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${isDarkMode ? 'dark' : ''}`} suppressHydrationWarning>
        <I18nProvider>
          {children}
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
