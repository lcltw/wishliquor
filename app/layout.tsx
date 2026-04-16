import fs from 'fs'
import path from 'path'
import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"

const DATA_FILE = path.join(process.cwd(), '.wishliquor-data.json')

function getServerMetadata() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    const data = JSON.parse(raw)
    const pageTitle = data?.settings?.content?.pageTitle
    const pageDescription = data?.settings?.content?.pageDescription
    return {
      title: pageTitle || 'wishliquor.co | Premium Whiskies Curated From Around The World',
      description: pageDescription || "Australia's largest online whisky store with exclusive bottlings and Whisky Lover's perks.",
    }
  } catch {
    return {
      title: 'wishliquor.co | Premium Whiskies Curated From Around The World',
      description: "Australia's largest online whisky store with exclusive bottlings and Whisky Lover's perks.",
    }
  }
}

const serverMeta = getServerMetadata()

export const metadata = {
  title: serverMeta.title,
  description: serverMeta.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen">
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
