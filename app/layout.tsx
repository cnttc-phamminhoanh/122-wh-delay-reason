import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-be-vietnam',
})
const mono = JetBrains_Mono({ subsets: ['latin', 'vietnamese'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'Stock Delay Reason',
  description: 'Nhập và tra cứu Delay Reason theo Goods No / Lot',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}