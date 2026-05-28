import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'KidSpark ⭐ 兒童學習遊戲',
  description: '邊玩邊學！適合2-5歲兒童的互動教育遊戲，訓練生活習慣、英文學習與認知能力',
  manifest: '/manifest.json',
  themeColor: '#ffd93d',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${nunito.className} min-h-full`}>{children}</body>
    </html>
  )
}
