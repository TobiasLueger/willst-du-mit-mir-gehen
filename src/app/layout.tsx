import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Willst du mit mir gehen?',
  description: 'Eine besondere Frage an einen besonderen Menschen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
