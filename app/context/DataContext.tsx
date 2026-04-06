'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

// Default data - using Google Drive URLs provided by user
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
    secondary: '#DC2626',
    accent: '#C9A227',
    background: '#FFFFFF',
    text: '#333333',
  },
  hero: {
    title: 'Explore World Whiskies',
    subtitle: 'Premium selection from Scotland, Japan, Taiwan and beyond.',
    ctaText: 'Shop Now'
  },
  navigation: [],
  footer: {}
}

// Load from localStorage helper
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // For products, validate that data has been properly initialized
        // If all products have the SAME img URL, it's uninitialized (using placeholder)
        // If products have DIFFERENT img URLs, it means user has customized them
        if (key === 'wishliquor_products') {
          const uniqueUrls = new Set(parsed.map((p: any) => p.img))
          if (uniqueUrls.size > 1) {
            // Multiple unique URLs - user has customized, use this data
            return parsed as T
          }
        } else {
          return parsed as T
        }
      }
      if (!Array.isArray(parsed) && Object.keys(parsed).length > 0) return parsed as T
    }
  } catch (e) {}
  // If invalid or empty, save defaults and return them
  localStorage.setItem(key, JSON.stringify(defaultValue))
  return defaultValue
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProductsState] = useState<Product[]>(() => loadFromStorage('wishliquor_products', defaultProducts))
  const [filters, setFiltersState] = useState<FilterOption[]>(() => loadFromStorage('wishliquor_filters', defaultFilters))
  const [settings, setSettingsState] = useState<SiteSettings>(() => loadFromStorage('wishliquor_site_settings', defaultSettings))
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Listen for storage changes from other tabs/pages
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'wishliquor_products' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) {
            setProductsState(parsed)
          }
        } catch (err) {}
      }
      if (e.key === 'wishliquor_filters' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) {
            setFiltersState(parsed)
          }
        } catch (err) {}
      }
      if (e.key === 'wishliquor_site_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Object.keys(parsed).length > 0) {
            setSettingsState(parsed)
          }
        } catch (err) {}
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Also poll for changes every second (for same-page updates)
  useEffect(() => {
    const interval = setInterval(() => {
      const savedProducts = loadFromStorage<Product[]>('wishliquor_products', [])
      const savedFilters = loadFromStorage<FilterOption[]>('wishliquor_filters', [])
      const savedSettings = loadFromStorage<SiteSettings>('wishliquor_site_settings', {} as SiteSettings)
      
      // Check if localStorage has different data than state
      if (savedProducts.length > 0 && JSON.stringify(savedProducts) !== JSON.stringify(products)) {
        setProductsState(savedProducts)
      }
      if (savedFilters.length > 0 && JSON.stringify(savedFilters) !== JSON.stringify(filters)) {
        setFiltersState(savedFilters)
      }
      if (savedSettings && Object.keys(savedSettings).length > 0 && JSON.stringify(savedSettings) !== JSON.stringify(settings)) {
        setSettingsState(savedSettings)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [products, filters, settings])

  const setProducts = (newProducts: Product[]) => {
    localStorage.setItem('wishliquor_products', JSON.stringify(newProducts))
    setProductsState(newProducts)
  }

  const setFilters = (newFilters: FilterOption[]) => {
    localStorage.setItem('wishliquor_filters', JSON.stringify(newFilters))
    setFiltersState(newFilters)
  }

  const setSettings = (newSettings: SiteSettings) => {
    localStorage.setItem('wishliquor_site_settings', JSON.stringify(newSettings))
    setSettingsState(newSettings)
  }

  return (
    <DataContext.Provider value={{ products, setProducts, filters, setFilters, settings, setSettings, isLoaded }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}

export { defaultProducts, defaultFilters, defaultSettings }
