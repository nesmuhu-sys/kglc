import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KGLC - Task Platform',
  description: 'Complete tasks and earn rewards',
  icons: { icon: '/fav.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="rw">
      <body className={inter.className}>{children}</body>
    </html>
  )
}