import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Willst du mit mir gehen?',
  description: 'Eine besondere Frage an einen besonderen Menschen',
  icons: {
    icon: '/favicon.ico',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#fdf2f8', // pink-50
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  )
}
