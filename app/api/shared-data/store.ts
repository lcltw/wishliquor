import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), '.wishliquor-data.json')

export interface Product {
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

export interface FilterOption {
  id: string
  label: string
  values: string[]
}

export interface SiteSettings {
  siteName: string
  logo: string
  logoUrl: string
  contactEmail: string
  ubn: string
  colors: Record<string, string>
  hero: { title: string; subtitle: string; ctaText: string }
  navigation: Array<{ label: string; href?: string; sub?: Array<{ label: string; href?: string; sub?: Array<{ label: string; href: string }> }> }>
  footer: { brand: string; description: string; logoUrl: string; logoWidth: number; logoHeight: number; logoAspectLocked: boolean; copyright: string; featuredLinks: string[]; whiskyTypes: string[]; aboutLinks: string[] }
}

export interface DesignBlock { id: string; label: string; labelZh: string }

interface DataRecord {
  products?: Product[]
  filters?: FilterOption[]
  settings?: SiteSettings
  assignments?: Record<string, string>
  blockColors?: Record<string, string>
  blocks?: DesignBlock[]
}

const defaultProducts: Product[] = [
  { id: 1, name: "Macallan 12Y", brand: "Macallan", country: "Scotland", category: "Single Malt", age: "12Y", volume: "700ml", price: 169, img: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop", description: "Rich sherry cask maturation with notes of dried fruits, chocolate, and oak." },
  { id: 2, name: "Macallan 18Y", brand: "Macallan", country: "Scotland", category: "Single Malt", age: "18Y", volume: "700ml", price: 499, img: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop", description: "Complex and elegant with rich dried fruits, spices, and chocolate orange." },
  { id: 3, name: "Glenfiddich 15Y", brand: "Glenfiddich", country: "Scotland", category: "Single Malt", age: "15Y", volume: "700ml", price: 129, img: "https://images.unsplash.com/photo-1571104508999-893933ded431?w=400&h=400&fit=crop", description: "Unique Solera vatting delivers rich notes of honey, vanilla, and warm spices." },
  { id: 4, name: "Octomore 10.3", brand: "Octomore", country: "Scotland", category: "Single Malt", age: "NAS", volume: "700ml", price: 299, img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop", description: "Heavy peat and exceptional balance. 167ppm phenol." },
  { id: 5, name: "Yamazaki 12Y", brand: "Yamazaki", country: "Japan", category: "Single Malt", age: "12Y", volume: "700ml", price: 199, img: "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400&h=400&fit=crop", description: "Delicate and complex with citrus, grapefruit, and Japanese oak notes." },
  { id: 6, name: "Yamazaki 18Y", brand: "Yamazaki", country: "Japan", category: "Single Malt", age: "18Y", volume: "700ml", price: 399, img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=400&fit=crop", description: "Rich and graceful with dried fruit, Mizunara oak, and subtle spices." },
  { id: 7, name: "Hibiki 21Y", brand: "Hibiki", country: "Japan", category: "Blended", age: "21Y", volume: "700ml", price: 459, img: "https://images.unsplash.com/photo-1549439602-43ebca2327af?w=400&h=400&fit=crop", description: "Harmonious blend with aged grain and malt, offering dried fruit and honey." },
  { id: 8, name: "Hakushu 12Y", brand: "Hakushu", country: "Japan", category: "Single Malt", age: "12Y", volume: "700ml", price: 189, img: "https://images.unsplash.com/photo-1562601579-599dec564e06?w=400&h=400&fit=crop", description: "Fresh and herbal with notes of grapefruit, pear, and subtle peat." },
  { id: 9, name: "Kavalan Concert", brand: "Kavalan", country: "Taiwan", category: "Single Malt", age: "NAS", volume: "700ml", price: 89, img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=400&fit=crop", description: "Smooth and fruity with notes of tropical fruits, vanilla, and oak." },
  { id: 10, name: "Kavalan Solo", brand: "Kavalan", country: "Taiwan", category: "Single Malt", age: "NAS", volume: "700ml", price: 69, img: "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?w=400&h=400&fit=crop", description: "Light and refreshing with citrus, honey, and gentle spices." },
  { id: 11, name: "Omar Sherry", brand: "Omar", country: "Taiwan", category: "Single Malt", age: "NAS", volume: "700ml", price: 99, img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop", description: "Rich sherry cask influence with dried fruits and spices." },
  { id: 12, name: "W.L. Weller 12Y", brand: "W.L. Weller", country: "USA", category: "Bourbon", age: "12Y", volume: "750ml", price: 79, img: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=400&fit=crop", description: "Sweet and smooth with notes of caramel, vanilla, and wheat." },
  { id: 13, name: "Jack Daniel's No.7", brand: "Jack Daniel's", country: "USA", category: "Bourbon", age: "NAS", volume: "1000ml", price: 59, img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=400&fit=crop", description: "Classic Tennessee whiskey with charcoal mellowing, sweet oak, and vanilla." },
  { id: 14, name: "Glenlivet 15Y", brand: "Glenlivet", country: "Scotland", category: "Single Malt", age: "15Y", volume: "700ml", price: 149, img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop", description: "Rich and fruity with French oak spice and honey sweetness." },
  { id: 15, name: "Talisker 18Y", brand: "Talisker", country: "Scotland", category: "Single Malt", age: "18Y", volume: "700ml", price: 229, img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop", description: "Full-bodied with coastal smoke, pepper, and dark chocolate." },
]

const defaultFilters: FilterOption[] = [
  { id: 'country', label: 'Country', values: ['Scotland', 'Japan', 'Taiwan', 'USA'] },
  { id: 'brand', label: 'Brand', values: ['Macallan', 'Glenfiddich', 'Yamazaki', 'Kavalan', 'Octomore', 'Hibiki', 'Hakushu', 'Glenlivet', 'Talisker', 'W.L. Weller', "Jack Daniel's", 'Omar'] },
  { id: 'volume', label: 'Volume', values: ['700ml', '750ml', '1000ml'] },
  { id: 'price', label: 'Price', values: [] },
]

const defaultSettings: SiteSettings = {
  siteName: 'wishliquor.co', logo: 'W', logoUrl: '/Logo.png',
  contactEmail: 'wishliquor@outlook.com', ubn: '83120142',
  colors: { background: '#FFFFFF', text: '#333333', cardBackground: '#FFFFFF', cardBorder: '#E5E7EB', primary: '#DC2626', secondary: '#6B7280', accent: '#C9A227', navBackground: '#DC2626', navText: '#FFFFFF', navHover: '#FCD34D', navDropdownBg: '#DC2626', navDropdownText: '#FFFFFF', navDropdownHover: '#FCD34D', navDropdownLabel: '#FFFFFF', buttonPrimary: '#C9A227', buttonAccent: '#DC2626', footerBackground: '#F9FAFB', footerText: '#333333', footerMuted: '#6B7280', heroBackground: '#FFFFFF', heroText: '#333333', heroAccent: '#C9A227' },
  hero: { title: 'Explore World Whiskies', subtitle: 'Premium selection of fine whiskies from Scotland, Japan, Taiwan and beyond — delivered to your door', ctaText: 'Shop Now' },
  navigation: [
    { label: 'Whisky', href: '/shop', sub: [
      { label: 'Scotland', sub: [{ label: 'Macallan', href: '/shop?brand=macallan' }, { label: 'Octomore', href: '/shop?brand=octomore' }, { label: 'Johnnie Walker', href: '/shop?brand=johnnie-walker' }, { label: 'Royal Salute', href: '/shop?brand=royal-salute' }] },
      { label: 'Japanese', sub: [{ label: 'Yamazaki', href: '/shop?brand=yamazaki' }, { label: 'Hakushu', href: '/shop?brand=hakushu' }, { label: 'Hibiki', href: '/shop?brand=hibiki' }] },
      { label: 'American', sub: [{ label: 'W.L. Weller', href: '/shop?brand=w-l-weller' }, { label: "Jack Daniel's", href: '/shop?brand=jack-daniels' }] },
      { label: 'Taiwan', sub: [{ label: 'Kavalan', href: '/shop?brand=kavalan' }, { label: 'Omar', href: '/shop?brand=omar' }] },
    ]},
    { label: 'Other Drinks', href: '/shop?category=other-drinks' }, { label: 'Gin', href: '/shop?category=gin' },
    { label: 'Rum', href: '/shop?category=rum' }, { label: 'Wine', href: '/shop?category=wine' },
    { label: 'Baijiu', href: '/shop?category=baijiu' }, { label: 'Goods', href: '/shop?category=goods' }, { label: 'Contact', href: '/contact' },
  ],
  footer: { brand: 'wishliquor.co', description: 'Premium whiskies curated from around the world.', logoUrl: '/Logo.png', logoWidth: 120, logoHeight: 40, logoAspectLocked: true, copyright: '© 2026 wishliquor.co All rights reserved.', featuredLinks: ['Bars', 'The Whisky Map', 'Reviews', 'News', 'Events'], whiskyTypes: ['Single Malt', 'Sherry Cask', 'Peated', 'Bourbon Cask', 'Independent'], aboutLinks: ['Shipping', 'Privacy', 'Terms', 'Contact'] },
}

const defaultDesignData = {
  assignments: {},
  blockColors: {},
  blocks: [] as DesignBlock[],
}

class PersistentStore {
  private data: DataRecord = {}

  constructor() {
    this.load()
  }

  private load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8')
        this.data = JSON.parse(raw)
      }
    } catch (e) {
      this.data = {}
    }
  }

  private save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (e) {
      console.error('Failed to save data:', e)
    }
  }

  getAll() {
    return {
      products: this.data.products ?? defaultProducts,
      filters: this.data.filters ?? defaultFilters,
      settings: this.data.settings ?? defaultSettings,
      assignments: this.data.assignments ?? defaultDesignData.assignments,
      blockColors: this.data.blockColors ?? defaultDesignData.blockColors,
      blocks: this.data.blocks ?? defaultDesignData.blocks,
    }
  }

  setProducts(products: Product[]) { this.data.products = products; this.save() }
  setFilters(filters: FilterOption[]) { this.data.filters = filters; this.save() }
  setSettings(settings: SiteSettings) { this.data.settings = settings; this.save() }
  setAssignments(assignments: Record<string, string>) { this.data.assignments = assignments; this.save() }
  setBlockColors(blockColors: Record<string, string>) { this.data.blockColors = blockColors; this.save() }
  setBlocks(blocks: DesignBlock[]) { this.data.blocks = blocks; this.save() }
}

export const dataStore = new PersistentStore()
