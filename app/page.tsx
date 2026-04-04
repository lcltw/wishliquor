'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Icons
const Icons = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg>,
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/></svg>,
  Filter: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor"><path d="M200,136a8,8,0,0,1-8,8H64a8,8,0,0,1,0-16H192A8,8,0,0,1,200,136Zm32-56H24a8,8,0,0,0-8,8v64a8,8,0,0,0,16,0V96H208v56a8,8,0,0,0,16,0V88A8,8,0,0,0,232,80Z"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
}

// Product data
const products = [
  { id: 1, name: "Macallan 12Y", brand: "Macallan", country: "Scotland", category: "Single Malt", age: "12Y", volume: "700ml", price: 169, img: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop", description: "Rich sherry cask maturation with notes of dried fruits, chocolate, and oak." },
  { id: 2, name: "Macallan 18Y", brand: "Macallan", country: "Scotland", category: "Single Malt", age: "18Y", volume: "700ml", price: 499, img: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop", description: "Complex and elegant with rich dried fruits, spices, and chocolate orange." },
  { id: 3, name: "Glenfiddich 15Y", brand: "Glenfiddich", country: "Scotland", category: "Single Malt", age: "15Y", volume: "700ml", price: 129, img: "https://images.unsplash.com/photo-1571104508999-893933ded431?w=400&h=400&fit=crop", description: "Unique Solera vatting delivers rich notes of honey, vanilla, and warm spices." },
  { id: 4, name: "Octomore 10.3", brand: "Octomore", country: "Scotland", category: "Single Malt", age: "NAS", volume: "700ml", price: 299, img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop", description: "Heavy peat and exceptional balance. 167ppm phenol." },
  { id: 5, name: "Yamazaki 12Y", brand: "Yamazaki", country: "Japan", category: "Single Malt", age: "12Y", volume: "700ml", price: 199, img: "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400&h=400&fit=crop", description: "Delicate and complex with citrus, grapefruit, and Japanese oak notes." },
  { id: 6, name: "Yamazaki 18Y", brand: "Yamazaki", country: "Japan", category: "Single Malt", age: "18Y", volume: "700ml", price: 399, img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=400&fit=crop", description: "Rich and graceful with dried fruit, Mizunara oak, and subtle spices." },
  { id: 7, name: "Hibiki 21Y", brand: "Hibiki", country: "Japan", category: "Blended", age: "21Y", volume: "700ml", price: 459, img: "https://images.unsplash.com/photo-1549439602-43ebca2327af?w=400&h=400&fit=crop", description: "Harmonious blend with aged grain and malt, offering dried fruit and honey." },
  { id: 8, name: "Hakushu 12Y", brand: "Hakushu", country: "Japan", category: "Single Malt", age: "12Y", volume: "700ml", price: 189, img: "https://images.unsplash.com/photo-1562601579-599dec564e06?w=400&h=400&fit=crop", description: "Fresh and herbal with citrus, pine, and smoky undertones." },
  { id: 9, name: "Kavalan Concert", brand: "Kavalan", country: "Taiwan", category: "Single Malt", age: "NAS", volume: "700ml", price: 89, img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=400&fit=crop", description: "Award-winning Taiwanese single malt with tropical fruit notes." },
  { id: 10, name: "Kavalan Solo", brand: "Kavalan", country: "Taiwan", category: "Single Malt", age: "NAS", volume: "700ml", price: 69, img: "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?w=400&h=400&fit=crop", description: "Smooth and accessible with butterscotch and vanilla sweetness." },
  { id: 11, name: "Omar Sherry", brand: "Omar", country: "Taiwan", category: "Single Malt", age: "NAS", volume: "700ml", price: 99, img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop", description: "Rich sherry cask influence with dried fruits and dark chocolate." },
  { id: 12, name: "W.L. Weller 12Y", brand: "W.L. Weller", country: "USA", category: "Bourbon", age: "12Y", volume: "750ml", price: 79, img: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=400&fit=crop", description: "Wheated bourbon with soft, sweet notes of caramel and oak." },
  { id: 13, name: "Jack Daniel's No.7", brand: "Jack Daniel's", country: "USA", category: "Bourbon", age: "NAS", volume: "1000ml", price: 59, img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=400&fit=crop", description: "Iconic Tennessee whiskey mellowed through charcoal filtering." },
  { id: 14, name: "Glenlivet 15Y", brand: "Glenlivet", country: "Scotland", category: "Single Malt", age: "15Y", volume: "700ml", price: 149, img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop", description: "Refined Speyside character with citrus, pear, and creamy vanilla." },
  { id: 15, name: "Talisker 18Y", brand: "Talisker", country: "Scotland", category: "Single Malt", age: "18Y", volume: "700ml", price: 229, img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop", description: "Bold Island character with smoke, pepper, and maritime salt." },
]

// Filter options
const filterOptions = {
  country: ['Scotland', 'Japan', 'Taiwan', 'USA'],
  brand: ['Macallan', 'Glenfiddich', 'Yamazaki', 'Kavalan', 'Octomore', 'Hibiki', 'Hakushu', 'Glenlivet', 'Talisker', 'W.L. Weller', "Jack Daniel's", 'Omar'],
  volume: ['700ml', '750ml', '1000ml'],
  price: [
    { label: '$0 - $150', min: 0, max: 150 },
    { label: '$150 - $300', min: 150, max: 300 },
    { label: '$300 - $500', min: 300, max: 500 },
    { label: '$500+', min: 500, max: 99999 },
  ],
}

interface CartItem {
  id: number; name: string; brand: string; country: string; category: string; age: string; volume: string; price: number; img: string; qty: number; description?: string;
}

interface FilterOption {
  id: string; label: string; values: string[];
}

// Default site settings
const defaultSiteSettings = {
  siteName: 'wishliquor.co',
  logo: 'W',
  logoUrl: '/Logo.png',
  contactEmail: 'wishliquor@outlook.com',
  ubn: '83120142',
  colors: {
    primary: '#C9A227',
    secondary: '#DC2626',
    accent: '#C9A227',
    background: '#FFFFFF',
    text: '#333333',
    navBackground: '#DC2626',
    navText: '#FFFFFF',
    navHover: '#FCD34D',
    navLabel: '#6B7280',
    navDropdownBg: '#1F2937',
    navDropdownText: '#FFFFFF',
    navDropdownHover: '#FCD34D',
    navDropdownLabel: '#9CA3AF',
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
    ctaText: 'Shop Now',
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
}

// Helper to load data from localStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return fallback
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null)
  const [toast, setToast] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  
  // Load initial data from localStorage (stable across server restarts)
  const [productList, setProductList] = useState<Product[]>(() => loadFromStorage('wishliquor_products', products))
  const [siteSettings, setSiteSettings] = useState<typeof defaultSiteSettings>(() => loadFromStorage('wishliquor_site_settings', defaultSiteSettings))
  const [filterOpts, setFilterOpts] = useState<typeof filterOptions>(() => {
    const saved = loadFromStorage<FilterOption[]>('wishliquor_filters', [])
    if (saved.length > 0) {
      return {
        country: saved.find(f => f.id === 'country')?.values || ['Scotland', 'Japan', 'Taiwan', 'USA'],
        brand: saved.find(f => f.id === 'brand')?.values || ['Macallan', 'Glenfiddich'],
        volume: saved.find(f => f.id === 'volume')?.values || ['700ml', '750ml', '1000ml'],
        price: filterOptions.price,
      }
    }
    return filterOptions
  })

  const [expandedSections, setExpandedSections] = useState<string[]>(['Country', 'Brand'])
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({ country: [], brand: [], volume: [], price: [] })
  const [searchQuery, setSearchQuery] = useState('')

  const toggleSection = (title: string) => {
    setExpandedSections(prev => prev.includes(title) ? prev.filter(s => s !== title) : [...prev, title])
  }

  const toggleFilter = (category: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value) ? prev[category].filter(v => v !== value) : [...prev[category], value]
    }))
  }

  const clearFilters = () => {
    setSelectedFilters({ country: [], brand: [], volume: [], price: [] })
    setSearchQuery('')
  }

  const filteredProducts = productList.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.brand.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (selectedFilters.country.length > 0 && !selectedFilters.country.includes(p.country)) return false
    if (selectedFilters.brand.length > 0 && !selectedFilters.brand.includes(p.brand)) return false
    if (selectedFilters.volume.length > 0 && !selectedFilters.volume.includes(p.volume)) return false
    if (selectedFilters.price.length > 0) {
      const matchesPrice = selectedFilters.price.some(label => {
        const option = filterOptions.price.find(p => p.label === label)
        return option ? p.price >= option.min && p.price <= option.max : false
      })
      if (!matchesPrice) return false
    }
    return true
  })

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      return [...prev, { ...product, qty: 1 }]
    })
    showToast(`${product.name} added to cart`)
  }

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta
        if (newQty <= 0) return null
        return { ...item, qty: newQty }
      }
      return item
    }).filter(Boolean) as CartItem[])
  }

  const removeFromCart = (id: number) => setCart(prev => prev.filter(item => item.id !== id))
  const cartTotal = cart.reduce((sum, item) => sum + item.qty, 0)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 2500)
  }

  const s = siteSettings.colors

  return (
    <div style={{ backgroundColor: s.background, color: s.text, minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ backgroundColor: s.background, borderBottom: `1px solid ${s.cardBorder}` }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2" style={{ color: s.text }}>
                {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
              </button>
              <a href="/" className="flex items-center gap-3">
                <img src={siteSettings.logoUrl} alt="logo" className="h-10" />
              </a>
            </div>
            <div className="flex-1 max-w-xl hidden md:block">
              <div className="relative">
                <input type="text" placeholder="Find your wish bottle" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 text-sm border" style={{ backgroundColor: '#F3F4F6', borderColor: '#D1D5DB', color: s.text }} />
                <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}><Icons.Search /></button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden p-2" style={{ color: s.text }}><Icons.Search /></button>
              <button style={{ backgroundColor: s.buttonPrimary, color: '#fff' }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium">Login</button>
              <button onClick={() => setCartOpen(true)} className="relative p-2" style={{ color: s.text }}>
                <Icons.Cart />
                {cartTotal > 0 && <span className="absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center font-bold" style={{ backgroundColor: s.buttonPrimary, color: '#fff' }}>{cartTotal}</span>}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3">
            <input type="text" placeholder="Find your wish bottle" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-sm border" style={{ backgroundColor: '#F3F4F6', borderColor: '#D1D5DB', color: s.text }} />
          </div>
        )}
        {/* Navigation */}
        <nav style={{ backgroundColor: s.navBackground }} className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block`}>
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex flex-col md:flex-row md:items-center md:gap-1 py-2">
              {siteSettings.navigation.map((item, i) => (
                <li key={i} className="relative group">
                  {/* Layer 1 — top level */}
                  {item.sub && item.sub.length > 0 ? (
                    <>
                      <button className="flex items-center justify-between w-full md:w-auto px-4 py-2 text-sm md:pr-2" style={{ color: s.navText }}>
                        {item.label}<span className="md:hidden ml-2">›</span>
                      </button>
                      {/* Dropdown: 3-layer mega menu */}
                      <div className="absolute left-0 top-full shadow-xl min-w-[640px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40" style={{ backgroundColor: s.navDropdownBg }}>
                        <div className="grid grid-cols-5 gap-4 px-4 py-3">
                          {item.sub.map((l2, l2i) => (
                            <div key={l2i}>
                              {/* L2 label (always shown as section header) */}
                              <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: s.navDropdownLabel }}>
                                {l2.label}
                              </h4>
                              {/* L3 brand links */}
                              {l2.sub && l2.sub.map((l3, l3i) => (
                                <a key={l3i} href={l3.href} className="block px-2 py-1 text-sm hover:underline" style={{ color: s.navDropdownText }}>
                                  {l3.label}
                                </a>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <a href={item.href} className="block px-4 py-2 text-sm" style={{ color: s.navText }}>{item.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <section className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: s.text }}>{siteSettings.hero.title}</h1>
          <p className="max-w-xl mx-auto" style={{ color: '#6B7280' }}>{siteSettings.hero.subtitle}</p>
        </section>

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-32 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold" style={{ color: s.text }}>Filters</h3>
                <button onClick={clearFilters} className="text-sm" style={{ color: s.secondary }}>Clear All</button>
              </div>
              {['Country', 'Brand', 'Volume', 'Price'].map(section => (
                <div key={section} className="border" style={{ borderColor: s.cardBorder }}>
                  <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between px-4 py-3 text-left font-medium" style={{ color: s.text }}>
                    {section}
                    <span className={`transform transition-transform ${expandedSections.includes(section) ? 'rotate-180' : ''}`}><Icons.ChevronDown /></span>
                  </button>
                  {expandedSections.includes(section) && (
                    <div className="px-4 pb-3 space-y-2">
                      {(filterOpts[section.toLowerCase() as keyof typeof filterOpts] as string[])?.map((option: string) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={selectedFilters[section.toLowerCase()].includes(option)} onChange={() => toggleFilter(section.toLowerCase(), option)}
                            className="w-4 h-4" style={{ accentColor: s.primary }} />
                          <span className="text-sm" style={{ color: s.footerMuted }}>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: '#6B7280' }}>Showing {filteredProducts.length} products</p>
              <button onClick={() => setMobileFiltersOpen(true)} className="md:hidden flex items-center gap-2 px-4 py-2 text-sm" style={{ backgroundColor: s.text, color: s.background }}>
                <Icons.Filter /> Filters
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <motion.div key={product.id} whileHover={{ y: -4 }} onClick={() => setSelectedProduct(product)}
                  className="border cursor-pointer transition-all" style={{ backgroundColor: s.cardBackground, borderColor: s.cardBorder }}>
                  <div className="aspect-square overflow-hidden"><img src={product.img} alt={product.name} className="w-full h-full object-cover" /></div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: s.primary }}>{product.country}</p>
                    <h3 className="font-semibold line-clamp-1 mb-1" style={{ color: s.text }}>{product.name}</h3>
                    <p className="text-xs mb-3" style={{ color: '#6B7280' }}>{product.category} • {product.age} • {product.volume}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold" style={{ color: s.text }}>${product.price}</span>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        className="px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: s.buttonPrimary }}>Add</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filter Button */}
      <button onClick={() => setMobileFiltersOpen(true)}
        className="md:hidden fixed bottom-6 left-6 px-5 py-3 text-sm font-semibold shadow-lg flex items-center gap-2 z-40"
        style={{ backgroundColor: s.text, color: s.background }}>
        <Icons.Filter /> Filters
      </button>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileFiltersOpen(false)} />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-50 overflow-y-auto" style={{ backgroundColor: s.background }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold" style={{ color: s.text }}>Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-2" style={{ color: s.text }}><Icons.Close /></button>
                </div>
                {['Country', 'Brand', 'Volume', 'Price'].map(section => (
                  <div key={section} className="border mb-4" style={{ borderColor: s.cardBorder }}>
                    <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between px-4 py-3 text-left font-medium" style={{ color: s.text }}>
                      {section}
                      <span className={`transform transition-transform ${expandedSections.includes(section) ? 'rotate-180' : ''}`}><Icons.ChevronDown /></span>
                    </button>
                    {expandedSections.includes(section) && (
                      <div className="px-4 pb-3 space-y-2">
                        {(filterOpts[section.toLowerCase() as keyof typeof filterOpts] as string[])?.map((option: string) => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={selectedFilters[section.toLowerCase()].includes(option)} onChange={() => toggleFilter(section.toLowerCase(), option)}
                              className="w-4 h-4" style={{ accentColor: s.primary }} />
                            <span className="text-sm" style={{ color: s.footerMuted }}>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={clearFilters} className="w-full py-3 text-sm border" style={{ borderColor: s.secondary, color: s.secondary }}>Clear All Filters</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none" style={{ zIndex: 51 }}>
              <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden pointer-events-auto" style={{ backgroundColor: s.cardBackground }}>
                <div className="grid md:grid-cols-2">
                  <div className="aspect-square"><img src={selectedProduct.img} alt={selectedProduct.name} className="w-full h-full object-cover" /></div>
                  <div className="p-6 md:p-8 flex flex-col justify-center relative">
                    <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 md:top-4 md:right-4 p-2" style={{ backgroundColor: '#F3F4F6' }}><Icons.Close /></button>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: s.primary }}>{selectedProduct.country}</p>
                    <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: s.text }}>{selectedProduct.name}</h2>
                    <p className="mb-4" style={{ color: '#6B7280' }}>{selectedProduct.category} • {selectedProduct.age} • {selectedProduct.volume}</p>
                    <p className="text-2xl md:text-3xl font-bold mb-6" style={{ color: s.text }}>${selectedProduct.price}</p>
                    <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                      className="w-full py-3 md:py-4 text-white font-semibold" style={{ backgroundColor: s.buttonPrimary }}>Add to Cart</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 flex flex-col" style={{ backgroundColor: s.background }}>
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: s.cardBorder }}>
                <h2 className="text-lg font-bold" style={{ color: s.text }}>Cart</h2>
                <button onClick={() => setCartOpen(false)} className="p-2" style={{ color: s.text }}><Icons.Close /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-16" style={{ color: '#9CA3AF' }}><p>Your cart is empty</p></div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b" style={{ borderColor: s.cardBorder }}>
                        <div className="w-20 h-20 overflow-hidden"><img src={item.img} alt={item.name} className="w-full h-full object-cover" /></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm" style={{ color: s.text }}>{item.name}</h4>
                          <p className="text-xs mb-2" style={{ color: '#6B7280' }}>${item.price} × {item.qty}</p>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 border text-sm" style={{ borderColor: s.cardBorder }}>−</button>
                            <span className="text-sm">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 border text-sm" style={{ borderColor: s.cardBorder }}>+</button>
                            <button onClick={() => removeFromCart(item.id)} className="ml-auto text-xs" style={{ color: '#9CA3AF' }}>Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-6 border-t" style={{ backgroundColor: '#F9FAFB', borderColor: s.cardBorder }}>
                  <div className="flex items-center justify-between mb-4">
                    <span style={{ color: '#6B7280' }}>Subtotal</span>
                    <span className="text-xl font-bold" style={{ color: s.text }}>${cartSubtotal}</span>
                  </div>
                  <button className="w-full py-4 text-white font-semibold" style={{ backgroundColor: s.buttonPrimary }}>Checkout</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 text-white font-medium shadow-lg flex items-center gap-2" style={{ backgroundColor: s.text, zIndex: 60 }}>
            <Icons.Check /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer style={{ backgroundColor: s.footerBackground, borderTop: `1px solid ${s.cardBorder}` }} className="mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4" style={{ color: s.footerText }}>{siteSettings.footer.brand}</h4>
              <p className="text-sm mb-4" style={{ color: s.footerMuted }}>{siteSettings.footer.description}</p>
              <p className="text-sm mb-4" style={{ color: s.footerMuted }}>Your trusted online selection.</p>
              <div className="text-sm" style={{ color: s.footerMuted }}>
                <p className="mb-1">{siteSettings.contactEmail}</p>
                <p>UBN: {siteSettings.ubn}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4" style={{ color: s.footerText }}>Featured</h4>
              <ul className="space-y-2">
                {siteSettings.footer.featuredLinks.map(link => (
                  <li key={link}><a href="#" className="text-sm" style={{ color: s.footerMuted }}>{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4" style={{ color: s.footerText }}>Whisky Type</h4>
              <ul className="space-y-2">
                {siteSettings.footer.whiskyTypes.map(link => (
                  <li key={link}><a href="#" className="text-sm" style={{ color: s.footerMuted }}>{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4" style={{ color: s.footerText }}>About</h4>
              <ul className="space-y-2">
                {siteSettings.footer.aboutLinks.map(link => (
                  <li key={link}><a href="#" className="text-sm" style={{ color: s.footerMuted }}>{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: s.cardBorder }}>
            <div className="flex items-center gap-3">
              {['Amex', 'Apple Pay', 'Google Pay', 'Mastercard', 'PayPal', 'Visa'].map(pm => (
                <div key={pm} className="px-2 py-1 text-xs" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>{pm}</div>
              ))}
            </div>
            <p className="text-sm" style={{ color: s.footerMuted }}>© 2026 {siteSettings.siteName} All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
