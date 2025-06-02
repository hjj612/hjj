import React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Korea Forex Bot',
  description: 'Real-time forex rates and predictions for Korean market',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <main className="container mx-auto px-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 