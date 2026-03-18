import type { Metadata } from 'next'
import { Roboto, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Humand Ascend',
  description: 'Herramienta de inteligencia conversacional por voz para mapear competencias de empleados',
  generator: 'v0.app',
  icons: {
    icon: '/humand.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
