import { defaultProducts, defaultSettings } from './context/DataContext'
import ShopClient from './components/ShopClient'

async function getInitialData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/shared-data`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default async function HomePage() {
  const data = await getInitialData()

  // Merge API data over defaults
  const apiProducts = data?.products || []
  const apiSettings = data?.settings || {}

  const mergedSettings = {
    ...defaultSettings,
    ...apiSettings,
    colors: { ...defaultSettings.colors, ...(apiSettings.colors || {}) },
    footer: apiSettings.footer || defaultSettings.footer,
    navigation: apiSettings.navigation || defaultSettings.navigation,
    hero: apiSettings.hero || defaultSettings.hero,
    countries: apiSettings.countries || defaultSettings.countries,
    brands: apiSettings.brands || defaultSettings.brands,
    categories: apiSettings.categories || defaultSettings.categories,
    volumes: apiSettings.volumes || defaultSettings.volumes,
  }

  const products = apiProducts.length > 0 ? apiProducts : defaultProducts

  return <ShopClient initialProducts={products} initialSettings={mergedSettings} />
}
