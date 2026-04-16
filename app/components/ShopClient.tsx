'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Icons
const Icons = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg>,
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/></svg>,
  Filter: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
}

interface Product { id: number; name: string; brand: string; country: string; category: string; age: string; alcohol?: string; volume: string; price: number; img: string; description?: string; stock?: number; }
interface CartItem extends Product { qty: number }

const filterOptions = {
  price: [
    { label: '$0 - $150', min: 0, max: 150 },
    { label: '$150 - $300', min: 150, max: 300 },
    { label: '$300 - $500', min: 300, max: 500 },
    { label: '$500+', min: 500, max: 99999 },
  ],
}

interface ShopClientProps {
  initialProducts: Product[]
  initialSettings: any
}

export default function ShopClient({ initialProducts, initialSettings }: ShopClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [selectedQty, setSelectedQty] = useState(1)
  const [toast, setToast] = useState('')
  const [footerModalCol, setFooterModalCol] = useState<{ colIndex: number; linkIndex: number } | null>(null)
  const [wishModalProduct, setWishModalProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [settings, setSettings] = useState(initialSettings)
  const [expandedSections, setExpandedSections] = useState<string[]>(['Category', 'Country', 'Brand'])
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({ category: [], country: [], brand: [], volume: [], price: [] })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpts, setFilterOpts] = useState({
    country: initialSettings?.countries || ['Scotland', 'Japan', 'Taiwan', 'USA'],
    brand: initialSettings?.brands || ['Macallan', 'Glenfiddich'],
    volume: initialSettings?.volumes || ['700ml', '750ml', '1000ml'],
    category: initialSettings?.categories || ['Single Malt', 'Blended'],
    price: filterOptions.price,
  })

  // Sync filterOpts when settings change
  useEffect(() => {
    if (settings?.countries) setFilterOpts(prev => ({ ...prev, country: settings.countries }))
    if (settings?.brands) setFilterOpts(prev => ({ ...prev, brand: settings.brands }))
    if (settings?.volumes) setFilterOpts(prev => ({ ...prev, volume: settings.volumes }))
    if (settings?.categories) setFilterOpts(prev => ({ ...prev, category: settings.categories }))
  }, [settings])

  // Live update from API on mount (freshest data)
  useEffect(() => {
    fetch('/api/shared-data')
      .then(r => r.json())
      .then(data => {
        if (!data) return
        const mergedSettings = { ...initialSettings, ...(data.settings || {}),
          colors: { ...initialSettings.colors, ...((data.settings || {}).colors || {}) },
          footer: (data.settings || {}).footer || initialSettings.footer,
          navigation: (data.settings || {}).navigation || initialSettings.navigation,
          hero: (data.settings || {}).hero || initialSettings.hero,
          countries: (data.settings || {}).countries || initialSettings.countries,
          brands: (data.settings || {}).brands || initialSettings.brands,
          categories: (data.settings || {}).categories || initialSettings.categories,
          volumes: (data.settings || {}).volumes || initialSettings.volumes,
        }
        if (data.products?.length) setProducts(data.products)
        setSettings(mergedSettings)
      })
      .catch(() => {})
  }, [])

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
    setSelectedFilters({ category: [], country: [], brand: [], volume: [], price: [] })
    setSearchQuery('')
  }

  const filteredProducts = products.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.brand.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (selectedFilters.category.length > 0 && !selectedFilters.category.some(cat => p.category?.toLowerCase() === cat?.toLowerCase())) return false
    if (selectedFilters.country.length > 0 && !selectedFilters.country.some(l2 => p.country?.toLowerCase() === l2?.toLowerCase())) return false
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

  const addToCart = (product: any, qty?: number) => {
    const qtyToAdd = qty ?? 1
    const cartItem = cart.find(item => item.id === product.id)
    const currentCartQty = cartItem?.qty ?? 0
    const availableStock = product.stock ?? Infinity
    if (currentCartQty + qtyToAdd > availableStock) {
      setToast(`Only ${availableStock - currentCartQty > 0 ? availableStock - currentCartQty : 0} left`)
      setTimeout(() => setToast(''), 2500); return
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qtyToAdd } : item)
      return [...prev, { ...product, qty: qtyToAdd }]
    })
    setToast(`${product.name} added to cart`); setTimeout(() => setToast(''), 2500)
  }

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta
        if (newQty <= 0) return null
        const maxStock = item.stock ?? Infinity
        if (newQty > maxStock) { setToast(`Only ${maxStock} available`); setTimeout(() => setToast(''), 2500); return { ...item, qty: maxStock } }
        return { ...item, qty: newQty }
      }
      return item
    }).filter(Boolean) as CartItem[])
  }

  const removeFromCart = (id: number) => setCart(prev => prev.filter(item => item.id !== id))
  const cartTotal = cart.reduce((sum, item) => sum + item.qty, 0)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  const s = settings.colors

  return (
    <div style={{ backgroundColor: s.background, color: s.text, minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ backgroundColor: s.background, borderBottom: `1px solid ${s.cardBorder}` }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2" style={{ color: s.text }}>{mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}</button>
              <a href="/" className="flex items-center gap-3"><img src={settings.logoUrl} alt="logo" className="h-10" /></a>
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
        {searchOpen && <div className="md:hidden px-4 pb-3"><input type="text" placeholder="Find your wish bottle" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 text-sm border" style={{ backgroundColor: '#F3F4F6', borderColor: '#D1D5DB', color: s.text }} /></div>}
        <nav style={{ backgroundColor: s.navBackground }} className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block`}>
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex flex-col md:flex-row md:items-center md:gap-1 py-2">
              {(settings.navigation || []).filter((item: any) => item.enabled !== false).map((item: any, i: number) => (
                <li key={i} className="relative group">
                  {item.sub && item.sub.filter((l2: any) => l2.enabled !== false).length > 0 ? (
                    <>
                      <a href={item.href || '#'} onClick={(e) => { e.preventDefault(); setSelectedFilters({ category: [item.label], country: [], brand: [], volume: [], price: [] }); }}
                        className="flex items-center justify-between w-full md:w-auto px-4 py-2 text-sm md:pr-2" style={{ color: s.navText }}>
                        {item.label}<span className="md:hidden ml-2">›</span>
                      </a>
                      <div className="absolute left-0 top-full shadow-xl min-w-[640px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40" style={{ backgroundColor: s.navDropdownBg }}>
                        <div className="grid grid-cols-5 gap-4 px-4 py-3">
                          {item.sub.filter((l2: any) => l2.enabled !== false).map((l2: any, l2i: number) => (
                            <div key={l2i}>
                              <button onClick={() => setSelectedFilters({ category: [item.label], country: [l2.label], brand: [], volume: [], price: [] })}
                                className="text-xs font-bold tracking-wide mb-2 text-left w-full hover:underline" style={{ color: s.navDropdownLabel }}>{l2.label}</button>
                              {(l2.sub || []).filter((l3: any) => l3.enabled !== false).map((l3: any, l3i: number) => (
                                <button key={l3i} onClick={() => { const params = new URLSearchParams(); params.set('brand', l3.label); window.history.pushState({}, '', `/shop?${params.toString()}`); setSelectedFilters({ category: [item.label], country: [l2.label], brand: [l3.label], volume: [], price: [] }); }}
                                  className="block px-2 py-1 text-sm hover:underline text-left w-full" style={{ color: s.navDropdownText }}>{l3.label}</button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <a href={item.href} onClick={() => setSelectedFilters({ category: [item.label], country: [], brand: [], volume: [], price: [] })} className="block px-4 py-2 text-sm" style={{ color: s.navText }}>{item.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: s.text }}>{settings.hero.title}</h1>
          <p className="max-w-xl mx-auto" style={{ color: '#6B7280' }}>{settings.hero.subtitle}</p>
        </section>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block flex-shrink-0" style={{ width: settings.filterSidebarWidth || 256 }}>
            <div className="sticky top-32 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold" style={{ color: s.text }}>Filters</h3>
                <button onClick={clearFilters} className="text-sm" style={{ color: s.filterClearText || s.secondary }}>Clear All</button>
              </div>
              {['Category', 'Country', 'Brand', 'Volume', 'Price'].map(section => (
                <div key={section} className="border" style={{ borderColor: s.cardBorder }}>
                  <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between px-4 py-3 text-left font-medium" style={{ color: s.text }}>
                    {section}<span className={`transform transition-transform ${expandedSections.includes(section) ? 'rotate-180' : ''}`}><Icons.ChevronDown /></span>
                  </button>
                  {expandedSections.includes(section) && (
                    <div className="px-4 pb-3 space-y-2">
                      {section === 'Category' ? (settings.categories || []).map((option: string) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={selectedFilters.category.includes(option)} onChange={() => toggleFilter('category', option)} className="w-4 h-4" style={{ accentColor: s.primary }} />
                          <span className="text-sm" style={{ color: s.footerMuted }}>{option}</span>
                        </label>
                      )) : section === 'Country' ? (settings.countries || []).map((option: string) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={selectedFilters.country.includes(option)} onChange={() => toggleFilter('country', option)} className="w-4 h-4" style={{ accentColor: s.primary }} />
                          <span className="text-sm" style={{ color: s.footerMuted }}>{option}</span>
                        </label>
                      )) : section === 'Price' ? filterOptions.price.map((p: any) => (
                        <label key={p.label} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={selectedFilters.price.includes(p.label)} onChange={() => toggleFilter('price', p.label)} className="w-4 h-4" style={{ accentColor: s.primary }} />
                          <span className="text-sm" style={{ color: s.footerMuted }}>{p.label}</span>
                        </label>
                      )) : (filterOpts[section.toLowerCase() as keyof typeof filterOpts] as string[])?.map((option: string) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={selectedFilters[section.toLowerCase()].includes(option)} onChange={() => toggleFilter(section.toLowerCase(), option)} className="w-4 h-4" style={{ accentColor: s.primary }} />
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
              <button onClick={() => setMobileFiltersOpen(true)} className="md:hidden flex items-center gap-2 px-4 py-2 text-sm" style={{ backgroundColor: s.text, color: s.background }}><Icons.Filter /> Filters</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <motion.div key={product.id} whileHover={{ y: -4 }} onClick={() => { setSelectedProduct(product); setSelectedQty(1); }}
                  className="border cursor-pointer transition-all" style={{ backgroundColor: s.cardBackground, borderColor: s.cardBorder }}>
                  <div className="aspect-square overflow-hidden"><img src={product.img} alt={product.name} className="w-full h-full object-cover" /></div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: s.primary }}>{product.country}</p>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: s.text }}>{product.brand}</p>
                    <h3 className="font-semibold line-clamp-1 mb-1" style={{ color: s.text }}>{product.name}</h3>
                    <p className="text-xs mb-3" style={{ color: '#6B7280' }}>{product.category}{product.age ? ` ${product.age}` : ''}{product.alcohol ? ` ${product.alcohol}%` : ''}{product.volume ? ` ${product.volume}` : ''}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-lg font-bold" style={{ color: s.text }}>${product.price}</span>
                      {(product.stock != null && product.stock <= 0) ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1" style={{ color: '#DC2626', backgroundColor: '#FEE2E2' }}>Out of stock</span>
                          <button onClick={(e) => { e.stopPropagation(); setWishModalProduct(product); }}
                            className="px-3 py-2 text-xs font-semibold" style={{ color: s.accent, border: `1px solid ${s.accent}` }}>Wish for It</button>
                        </div>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
                          className="px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: s.buttonPrimary }}>Add</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filter */}
      <button onClick={() => setMobileFiltersOpen(true)} className="md:hidden fixed bottom-6 left-6 px-5 py-3 text-sm font-semibold shadow-lg flex items-center gap-2 z-40" style={{ backgroundColor: s.text, color: s.background }}><Icons.Filter /> Filters</button>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileFiltersOpen(false)} />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed top-0 left-0 bottom-0 z-50 overflow-y-auto" style={{ backgroundColor: s.background, width: settings.filterSidebarWidth || 256, maxWidth: '85vw' }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold" style={{ color: s.text }}>Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-2" style={{ color: s.text }}><Icons.Close /></button>
                </div>
                {['Category', 'Country', 'Brand', 'Volume', 'Price'].map(section => (
                  <div key={section} className="border mb-4" style={{ borderColor: s.cardBorder }}>
                    <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between px-4 py-3 text-left font-medium" style={{ color: s.text }}>
                      {section}<span className={`transform transition-transform ${expandedSections.includes(section) ? 'rotate-180' : ''}`}><Icons.ChevronDown /></span>
                    </button>
                    {expandedSections.includes(section) && (
                      <div className="px-4 pb-3 space-y-2">
                        {section === 'Category' ? (settings.categories || []).map((option: string) => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={selectedFilters.category.includes(option)} onChange={() => toggleFilter('category', option)} className="w-4 h-4" style={{ accentColor: s.primary }} />
                            <span className="text-sm" style={{ color: s.footerMuted }}>{option}</span>
                          </label>
                        )) : section === 'Price' ? filterOptions.price.map((p: any) => (
                          <label key={p.label} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={selectedFilters.price.includes(p.label)} onChange={() => toggleFilter('price', p.label)} className="w-4 h-4" style={{ accentColor: s.primary }} />
                            <span className="text-sm" style={{ color: s.footerMuted }}>{p.label}</span>
                          </label>
                        )) : (filterOpts[section.toLowerCase() as keyof typeof filterOpts] as string[])?.map((option: string) => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={selectedFilters[section.toLowerCase()].includes(option)} onChange={() => toggleFilter(section.toLowerCase(), option)} className="w-4 h-4" style={{ accentColor: s.primary }} />
                            <span className="text-sm" style={{ color: s.footerMuted }}>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={clearFilters} className="w-full py-3 text-sm border" style={{ borderColor: s.filterClearText || s.secondary, color: s.filterClearText || s.secondary }}>Clear All Filters</button>
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
                  <div className="p-6 md:p-8 flex flex-col justify-center relative" style={{ backgroundColor: s.cardBackground }}>
                    <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 md:top-4 md:right-4 p-2" style={{ backgroundColor: s.cardBackground }}><Icons.Close /></button>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: s.primary }}>{selectedProduct.country}</p>
                    <p className="text-sm font-semibold mb-1" style={{ color: s.text }}>{selectedProduct.brand}</p>
                    <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: s.text }}>{selectedProduct.name}</h2>
                    <p className="mb-1" style={{ color: s.secondary }}>{selectedProduct.category}{selectedProduct.age ? ` ${selectedProduct.age}` : ''}{selectedProduct.alcohol ? ` ${selectedProduct.alcohol}%` : ''}{selectedProduct.volume ? ` ${selectedProduct.volume}` : ''}</p>
                    <p className="mb-4 text-sm leading-relaxed" style={{ color: s.secondary }}>{selectedProduct.description}</p>
                    <p className="text-2xl md:text-3xl font-bold mb-3" style={{ color: s.text }}>${selectedProduct.price}</p>
                    {(() => {
                      const cartItem = cart.find(item => item.id === selectedProduct.id)
                      const cartQty = cartItem?.qty ?? 0
                      const availableStock = (selectedProduct.stock ?? Infinity) - cartQty
                      if (availableStock <= 0) return (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2" style={{ color: '#DC2626' }}>Out of stock</p>
                          <button onClick={() => setWishModalProduct(selectedProduct)}
                            className="w-full py-3 font-semibold" style={{ color: s.accent, border: `1px solid ${s.accent}` }}>Wish for It</button>
                        </div>
                      )
                      return (
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-sm font-medium" style={{ color: '#16A34A' }}>{availableStock} in stock</span>
                          <select value={selectedQty} onChange={(e) => setSelectedQty(Math.min(Number(e.target.value), availableStock))}
                            className="px-2 py-1 border text-sm" style={{ borderColor: s.cardBorder, color: s.text }}>
                            {Array.from({ length: Math.min(availableStock, 10) }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                      )
                    })()}
                    <button onClick={() => { addToCart(selectedProduct, selectedQty); setSelectedProduct(null); setSelectedQty(1); }}
                      disabled={(selectedProduct.stock ?? Infinity) - (cart.find(i => i.id === selectedProduct.id)?.qty ?? 0) <= 0}
                      className="w-full py-3 md:py-4 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: s.buttonPrimary }}>Add to Cart</button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-start">
            {/* 左1: Logo */}
            <div className="flex justify-center md:justify-start">
              {settings.footer?.logoUrl && <img src={settings.footer.logoUrl} alt="footer logo" style={{ height: settings.footer.logoHeight || 40, objectFit: 'contain' }} />}
            </div>
            {/* 左2: Brand info */}
            <div>
              <h4 className="font-semibold mb-2" style={{ color: s.footerText }}>{settings.footer?.brand || settings.siteName}</h4>
              <p className="text-sm mb-3" style={{ color: s.footerMuted }}>{settings.footer?.description}</p>
              <div className="text-sm" style={{ color: s.footerMuted }}>
                <p className="mb-1">{settings.contactEmail}</p>
                <p>UBN {settings.ubn}</p>
              </div>
            </div>
            {/* All columns from settings.footer.columns */}
            {(settings.footer?.columns || []).map((col: any, i: number) => (
              <div key={i}>
                <p className="text-sm font-semibold mb-4" style={{ color: s.footerText }}>{col.title}</p>
                <ul className="space-y-2">
                  {(col.links || []).map((linkItem: any, li: number) => {
                    const label = typeof linkItem === 'string' ? linkItem : linkItem.label
                    const isWishForIt = label === 'Wish for It' || label === 'Corporate & Bulk'
                    return (
                      <li key={li}>
                        <button onClick={() => isWishForIt ? setWishModalProduct({} as any) : setFooterModalCol({ colIndex: i, linkIndex: li })}
                          className="text-sm text-left hover:opacity-70 transition-opacity" style={{ color: s.footerMuted }}>{label}</button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: s.cardBorder }}>
            <div className="flex items-center gap-3">
              {['Amex', 'Apple Pay', 'Google Pay', 'Mastercard', 'PayPal', 'Visa'].map(pm => (
                <div key={pm} className="px-2 py-1 text-xs" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>{pm}</div>
              ))}
            </div>
            <p className="text-sm" style={{ color: s.footerMuted }}>{settings.footer?.copyright || `© 2026 ${settings.siteName} All rights reserved.`}</p>
          </div>
        </div>
      </footer>

      {/* Footer Links Modal */}
      <AnimatePresence>
        {footerModalCol !== null && footerModalCol !== undefined && (() => {
          const col = settings.footer?.columns?.[footerModalCol.colIndex]
          const linkItem = col?.links?.[footerModalCol.linkIndex]
          if (!col || !linkItem) return null
          return (
            <motion.div key="footer-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              onClick={(e) => { if (e.target === e.currentTarget) setFooterModalCol(null) }}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md shadow-2xl overflow-hidden" style={{ backgroundColor: s.background || '#ffffff' }}>
                <button onClick={() => setFooterModalCol(null)} className="absolute top-3 right-3 p-1.5 rounded-lg" style={{ backgroundColor: s.cardBackground || '#ffffff' }}><Icons.Close /></button>
                <div className="p-6 md:p-10 flex flex-col justify-center max-h-[85vh] overflow-y-auto">
                  <h3 className="text-base font-bold mb-4" style={{ color: s.text }}>{typeof linkItem === 'string' ? linkItem : linkItem?.label}</h3>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: s.secondary || '#6B7280' }}
                    dangerouslySetInnerHTML={{ __html: (typeof linkItem === 'string' ? '' : (linkItem?.content || '').replace(/\n/g, '<br/>')) || '（無內容）' }} />
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Wish for It Modal */}
      <AnimatePresence>
        {wishModalProduct !== null && (() => {
          // Find Wish for It content from footer settings
          const contactCol = settings.footer?.columns?.find((col: any) => col.title === 'Contact')
          const wishLink = contactCol?.links?.find((link: any) => link.label === 'Wish for It')
          const wishContent = wishLink?.content || '（無內容）'
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              onClick={() => setWishModalProduct(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md shadow-2xl overflow-hidden"
                style={{ backgroundColor: s.background || '#ffffff' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setWishModalProduct(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg"
                  style={{ backgroundColor: s.cardBackground || '#ffffff' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>
                </button>
                <div className="p-6 md:p-10 flex flex-col justify-center max-h-[85vh] overflow-y-auto">
                  <h3 className="text-base font-bold mb-4" style={{ color: s.text }}>Wish for It</h3>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: s.secondary }}
                    dangerouslySetInnerHTML={{ __html: wishContent.replace(/\n/g, '<br/>') }} />
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
