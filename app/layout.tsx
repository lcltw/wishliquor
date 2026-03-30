import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'wishliquor.co | Premium Whiskies Curated From Around The World',
  description: 'Australia\'s largest online whisky store with exclusive bottlings and Whisky Lover\'s perks.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
