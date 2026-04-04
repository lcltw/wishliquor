import { NextResponse } from 'next/server'

// Default settings - used as fallback
const defaultSettings = {
  siteName: 'wishliquor.co',
  logo: 'W',
  logoUrl: '/Logo.png',
  contactEmail: 'wishliquor@outlook.com',
  ubn: '83120142',
  colors: {
    secondary: '#DC2626',
    accent: '#C9A227',
    background: '#FFFFFF',
    text: '#333333',
    navBackground: '#DC2626',
    navText: '#FFFFFF',
    navHover: '#FCD34D',
    navLabel: '#6B7280',
    navDropdownBg: '#DC2626',
    navDropdownText: '#FFFFFF',
    navDropdownHover: '#FCD34D',
    navDropdownLabel: '#6B7280',
    buttonPrimary: '#C9A227',
    buttonAccent: '#DC2626',
    footerBackground: '#FFFFFF',
    footerText: '#333333',
    footerMuted: '#6B7280',
    cardBackground: '#FFFFFF',
    cardBorder: '#E5E7EB',
    heroBackground: '#FFFFFF',
    heroText: '#333333',
    heroAccent: '#C9A227',
  },
  hero: {
    title: 'Explore World Whiskies',
    subtitle: 'Premium selection of fine whiskies from Scotland, Japan, Taiwan and beyond — delivered to your door',
    ctaText: 'Shop Now'
  },
  navigation: [
    {
      label: 'Whisky', href: '/shop', sub: [
        {
          label: 'Scotland', sub: [
            { label: 'Macallan', href: '/shop?brand=macallan' },
            { label: 'Octomore', href: '/shop?brand=octomore' },
            { label: 'Johnnie Walker', href: '/shop?brand=johnnie-walker' },
            { label: 'Royal Salute', href: '/shop?brand=royal-salute' },
          ],
        },
        {
          label: 'Japanese', sub: [
            { label: 'Yamazaki', href: '/shop?brand=yamazaki' },
            { label: 'Hakushu', href: '/shop?brand=hakushu' },
            { label: 'Hibiki', href: '/shop?brand=hibiki' },
          ],
        },
        {
          label: 'American', sub: [
            { label: 'W.L. Weller', href: '/shop?brand=w-l-weller' },
            { label: "Jack Daniel's", href: '/shop?brand=jack-daniels' },
          ],
        },
        {
          label: 'Taiwan', sub: [
            { label: 'Kavalan', href: '/shop?brand=kavalan' },
            { label: 'Omar', href: '/shop?brand=omar' },
          ],
        },
      ],
    },
    { label: 'Other Drinks', href: '/shop?category=other-drinks' },
    { label: 'Gin', href: '/shop?category=gin' },
    { label: 'Rum', href: '/shop?category=rum' },
    { label: 'Wine', href: '/shop?category=wine' },
    { label: 'Baijiu', href: '/shop?category=baijiu' },
    { label: 'Goods', href: '/shop?category=goods' },
    { label: 'Contact', href: '/contact' },
  ],
  footer: {
    brand: 'wishliquor.co',
    description: 'Premium whiskies curated from around the world.',
    featuredLinks: ['Bars', 'The Whisky Map', 'Reviews', 'News', 'Events'],
    whiskyTypes: ['Single Malt', 'Sherry Cask', 'Peated', 'Bourbon Cask', 'Independent'],
    aboutLinks: ['Shipping', 'Privacy', 'Terms', 'Contact'],
  },
  updatedAt: null,
}

// In-memory store (persists during serverless warm-up, but not across cold starts)
// For true persistence, you'd need Vercel KV, PostgreSQL, etc.
let cachedSettings: typeof defaultSettings | null = null

export async function GET() {
  if (cachedSettings) {
    return NextResponse.json(cachedSettings)
  }
  return NextResponse.json(defaultSettings)
}

export async function POST(request: Request) {
  try {
    const settings = await request.json()
    cachedSettings = {
      ...defaultSettings,
      ...settings,
      updatedAt: new Date().toISOString()
    }
    return NextResponse.json({ success: true, message: 'Settings saved (in-memory)' })
  } catch (e) {
    console.error('Error saving settings:', e)
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
