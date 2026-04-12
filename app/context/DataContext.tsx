'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface Product {
  id: number
  name: string
  brand: string
  country: string
  category: string
  age: string
  volume: string
  price: number
  img: string
  description?: string
}

interface FilterOption {
  id: string
  label: string
  values: string[]
}

interface SiteSettings {
  siteName: string
  logoUrl: string
  contactEmail: string
  ubn: string
  colors: Record<string, string>
  hero: { title: string; subtitle: string; ctaText: string }
  navigation: any[]
  footer: any
  content: {
    pageTitle: string
    pageDescription: string
    featuredTitle: string
    featuredSubtitle: string
    aboutTitle: string
    aboutText: string
  }
}

interface DataContextType {
  products: Product[]
  setProducts: (products: Product[]) => void
  filters: FilterOption[]
  setFilters: (filters: FilterOption[]) => void
  settings: SiteSettings
  setSettings: (settings: SiteSettings) => void
  isLoaded: boolean
}

const DataContext = createContext<DataContextType | null>(null)

const defaultProducts: Product[] = [
  { id: 1, name: "Macallan 12Y", brand: "Macallan", country: "Scotland", category: "Single Malt", age: "12Y", volume: "700ml", price: 169, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Rich sherry cask maturation with notes of dried fruits, chocolate, and oak." },
  { id: 2, name: "Macallan 18Y", brand: "Macallan", country: "Scotland", category: "Single Malt", age: "18Y", volume: "700ml", price: 499, img: "https://lh3.googleusercontent.com/u/0/d/1MfCqLv5hzNeMNxsI95vdEw-xuYc7V3h8", description: "Complex and elegant with rich dried fruits, spices, and chocolate orange." },
  { id: 3, name: "Glenfiddich 15Y", brand: "Glenfiddich", country: "Scotland", category: "Single Malt", age: "15Y", volume: "700ml", price: 129, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Unique Solera vatting delivers rich notes of honey, vanilla, and warm spices." },
  { id: 4, name: "Octomore 10.3", brand: "Octomore", country: "Scotland", category: "Single Malt", age: "NAS", volume: "700ml", price: 299, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Heavy peat and exceptional balance. 167ppm phenol." },
  { id: 5, name: "Yamazaki 12Y", brand: "Yamazaki", country: "Japan", category: "Single Malt", age: "12Y", volume: "700ml", price: 199, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Delicate and complex with citrus, grapefruit, and Japanese oak notes." },
  { id: 6, name: "Yamazaki 18Y", brand: "Yamazaki", country: "Japan", category: "Single Malt", age: "18Y", volume: "700ml", price: 399, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Rich and graceful with dried fruit, Mizunara oak, and subtle spices." },
  { id: 7, name: "Hibiki 21Y", brand: "Hibiki", country: "Japan", category: "Blended", age: "21Y", volume: "700ml", price: 459, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Harmonious blend with aged grain and malt, offering dried fruit and honey." },
  { id: 8, name: "Hakushu 12Y", brand: "Hakushu", country: "Japan", category: "Single Malt", age: "12Y", volume: "700ml", price: 189, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Fresh and herbal with citrus, pine, and smoky undertones." },
  { id: 9, name: "Kavalan Concert", brand: "Kavalan", country: "Taiwan", category: "Single Malt", age: "NAS", volume: "700ml", price: 89, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Award-winning Taiwanese single malt with tropical fruit notes." },
  { id: 10, name: "Kavalan Solo", brand: "Kavalan", country: "Taiwan", category: "Single Malt", age: "NAS", volume: "700ml", price: 69, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Smooth and accessible with butterscotch and vanilla sweetness." },
  { id: 11, name: "Omar Sherry", brand: "Omar", country: "Taiwan", category: "Single Malt", age: "NAS", volume: "700ml", price: 99, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Rich sherry cask influence with dried fruits and dark chocolate." },
  { id: 12, name: "W.L. Weller 12Y", brand: "W.L. Weller", country: "USA", category: "Bourbon", age: "12Y", volume: "750ml", price: 79, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Wheated bourbon with soft, sweet notes of caramel and oak." },
  { id: 13, name: "Jack Daniel's No.7", brand: "Jack Daniel's", country: "USA", category: "Bourbon", age: "NAS", volume: "1000ml", price: 59, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Iconic Tennessee whiskey mellowed through charcoal filtering." },
  { id: 14, name: "Glenlivet 15Y", brand: "Glenlivet", country: "Scotland", category: "Single Malt", age: "15Y", volume: "700ml", price: 149, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Refined Speyside character with citrus, pear, and creamy vanilla." },
  { id: 15, name: "Talisker 18Y", brand: "Talisker", country: "Scotland", category: "Single Malt", age: "18Y", volume: "700ml", price: 229, img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm", description: "Bold Island character with smoke, pepper, and maritime salt." },
]

const defaultFilters: FilterOption[] = [
  { id: 'country', label: 'Country', values: ['Scotland', 'Japan', 'Taiwan', 'USA'] },
  { id: 'brand', label: 'Brand', values: ['Macallan', 'Glenfiddich', 'Yamazaki', 'Kavalan', 'Octomore', 'Hibiki', 'Hakushu', 'Glenlivet', 'Talisker', 'W.L. Weller', "Jack Daniel's", 'Omar'] },
  { id: 'volume', label: 'Volume', values: ['700ml', '750ml', '1000ml'] },
  { id: 'price', label: 'Price', values: [] },
]

const defaultSettings: SiteSettings = {
  siteName: 'wishliquor.co',
  logoUrl: '/Logo.png',
  contactEmail: 'wishliquor@outlook.com',
  ubn: '83120142',
  colors: {
    background: '#FFFFFF',
    text: '#0a0a0a',
    cardBackground: '#FFFFFF',
    cardBorder: '#6B7280',
    primary: '#DC2626',
    secondary: '#6B7280',
    accent: '#C9A227',
    navBackground: '#DC2626',
    navText: '#FFFFFF',
    navHover: '#DC2626',
    navDropdownBg: '#DC2626',
    navDropdownText: '#FFFFFF',
    navDropdownHover: '#DC2626',
    navDropdownLabel: '#C9A227',
    buttonPrimary: '#C9A227',
    footerBackground: '#FFFFFF',
    footerText: '#0a0a0a',
    footerMuted: '#6B7280',
    heroBackground: '#FFFFFF',
    heroText: '#6B7280',
    heroAccent: '#C9A227',
  },
  hero: {
    title: 'Explore World Whiskies',
    subtitle: 'Premium selection from Scotland, Japan, Taiwan and beyond.',
    ctaText: 'Shop Now'
  },
  navigation: [],
  footer: {
    brand: 'wishliquor.co',
    description: 'Premium whiskies curated from around the world.',
    logoUrl: '/Logo.png',
    logoWidth: 120,
    logoHeight: 40,
    copyright: '© 2026 wishliquor.co All rights reserved.',
    featuredLinks: ['Bars', 'The Whisky Map', 'Reviews', 'News', 'Events'],
    whiskyTypes: ['Single Malt', 'Sherry Cask', 'Peated', 'Bourbon Cask', 'Independent'],
    aboutLinks: ['Shipping', 'Privacy', 'Terms', 'Contact'],
  },
  content: {
    pageTitle: 'wishliquor.co | Premium Whiskies Curated From Around The World',
    pageDescription: "Australia's largest online whisky store with exclusive bottlings and Whisky Lover's perks.",
    featuredTitle: 'Featured Products',
    featuredSubtitle: 'Handpicked selections from our finest collection',
    aboutTitle: 'About Us',
    aboutText: 'Wishliquor.co curates the finest whiskies from Scotland, Japan, Taiwan and beyond — delivered straight to your door.',
  },
}

// Read from localStorage synchronously — call this only client-side
function readProducts(): Product[] {
  if (typeof window === 'undefined') return defaultProducts
  try {
    const raw = localStorage.getItem('wishliquor_products')
    if (!raw) return defaultProducts
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch (_) {}
  return defaultProducts
}

function readFilters(): FilterOption[] {
  if (typeof window === 'undefined') return defaultFilters
  try {
    const raw = localStorage.getItem('wishliquor_filters')
    if (!raw) return defaultFilters
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch (_) {}
  return defaultFilters
}

function readSettings(): SiteSettings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const raw = localStorage.getItem('wishliquor_site_settings')
    if (!raw) return defaultSettings
    const parsed = JSON.parse(raw)
    if (parsed && Object.keys(parsed).length > 0) return parsed
  } catch (_) {}
  return defaultSettings
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => readProducts())
  const [filters, setFilters] = useState<FilterOption[]>(() => readFilters())
  const [settings, setSettings] = useState<SiteSettings>(() => readSettings())
  const [isLoaded, setIsLoaded] = useState(false)

  // Always fetch latest from API and merge with localStorage; mark loaded when done
  useEffect(() => {
    fetch('/api/shared-data')
      .then(r => r.json())
      .then(data => {
        if (!data) { setIsLoaded(true); return }
        // Merge API data over defaults
        const mergedSettings = { ...defaultSettings, ...(data.settings || {}),
          colors: { ...defaultSettings.colors, ...((data.settings || {}).colors || {}) },
          footer: (data.settings || {}).footer || defaultSettings.footer,
          content: (data.settings || {}).content || defaultSettings.content,
          navigation: (data.settings || {}).navigation || defaultSettings.navigation,
          hero: (data.settings || {}).hero || defaultSettings.hero,
        }
        // localStorage is source of truth for products/filters; only fill if empty
        const storedProducts = localStorage.getItem('wishliquor_products')
        const storedFilters = localStorage.getItem('wishliquor_filters')
        const storedSettings = localStorage.getItem('wishliquor_site_settings')

        if (!storedProducts && data.products && data.products.length > 0) {
          setProducts(data.products)
          localStorage.setItem('wishliquor_products', JSON.stringify(data.products))
        }
        if (!storedFilters && data.filters && data.filters.length > 0) {
          setFilters(data.filters)
          localStorage.setItem('wishliquor_filters', JSON.stringify(data.filters))
        }
        if (!storedSettings) {
          setSettings(mergedSettings)
          localStorage.setItem('wishliquor_site_settings', JSON.stringify(mergedSettings))
        } else if (data.settings && Object.keys(data.settings).length > 0) {
          // LocalStorage has data — merge on top of API data (localStorage wins for custom colors)
          const localParsed = JSON.parse(storedSettings)
          const finalSettings = { ...mergedSettings, ...localParsed,
            colors: { ...mergedSettings.colors, ...(localParsed.colors || {}) },
          }
          setSettings(finalSettings)
          localStorage.setItem('wishliquor_site_settings', JSON.stringify(finalSettings))
        }
        setIsLoaded(true)
      })
      .catch(() => setIsLoaded(true))
  }, [])

  // Sync across tabs via storage event
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'wishliquor_products' && e.newValue) {
        try { setProducts(JSON.parse(e.newValue)) } catch (_) {}
      }
      if (e.key === 'wishliquor_filters' && e.newValue) {
        try { setFilters(JSON.parse(e.newValue)) } catch (_) {}
      }
      if (e.key === 'wishliquor_site_settings' && e.newValue) {
        try { setSettings(JSON.parse(e.newValue)) } catch (_) {}
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const saveProducts = useCallback((next: Product[]) => {
    setProducts(next)
    localStorage.setItem('wishliquor_products', JSON.stringify(next))
  }, [])

  const saveFilters = useCallback((next: FilterOption[]) => {
    setFilters(next)
    localStorage.setItem('wishliquor_filters', JSON.stringify(next))
  }, [])

  const saveSettings = useCallback((next: SiteSettings) => {
    setSettings(next)
    localStorage.setItem('wishliquor_site_settings', JSON.stringify(next))
  }, [])

  return (
    <DataContext.Provider value={{
      products,
      setProducts: saveProducts,
      filters,
      setFilters: saveFilters,
      settings,
      setSettings: saveSettings,
      isLoaded,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be inside DataProvider')
  return ctx
}

export { defaultProducts, defaultFilters, defaultSettings }
