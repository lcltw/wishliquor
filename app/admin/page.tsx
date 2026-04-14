'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'next-auth/react'
import { useData } from '../context/DataContext'

interface Product {
  id: number
  name: string
  brand: string
  country: string
  category: string
  age: string
  alcohol?: string
  volume: string
  price: number
  img: string
  description?: string
  barcode?: string
  sku?: string
  stock?: number
}

interface FilterOption {
  id: string
  label: string
  values: string[]
}

// Icons
const Icons = {
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  Save: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  ),
  Cart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  Package: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  Filter: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
}

// Default data
const categoryMap: Record<string, string[]> = {
  Whisky: ['Single Malt', 'Blended', 'Bourbon'],
  Brandy: ['Brandy'],
  Rum: ['Rum'],
  Gin: ['Gin'],
  Baijiu: ['Baijiu'],
  Wine: ['Wine'],
  Goods: ['Goods'],
  Contact: ['Contact'],
}
function productMatchesNavCategory(productCategory: string, navLabel: string): boolean {
  const mapped = categoryMap[navLabel]
  if (!mapped) return false
  return mapped.includes(productCategory)
}
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
]

// Load from localStorage (client only - returns defaults during SSR)
function loadProductsFromStorage(): Product[] {
  if (typeof window === 'undefined') return defaultProducts
  try {
    const saved = localStorage.getItem('wishliquor_products')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length === defaultProducts.length) {
        // Check if data has been properly initialized by user
        // If all products have the SAME img URL, it's uninitialized (using placeholder)
        // If products have DIFFERENT img URLs, it means user has customized them
        const uniqueUrls = new Set(parsed.map(p => p.img))
        if (uniqueUrls.size > 1) {
          // Multiple unique URLs - user has customized, use this data
          return parsed
        }
      }
    }
  } catch (e) {}
  // If localStorage is empty, corrupted, or uninitialized, use defaults and save them
  localStorage.setItem('wishliquor_products', JSON.stringify(defaultProducts))
  return defaultProducts
}

function loadFiltersFromStorage(): FilterOption[] {
  if (typeof window === 'undefined') return defaultFilters
  try {
    const saved = localStorage.getItem('wishliquor_filters')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {}
  return defaultFilters
}

export default function AdminPage() {
  const { products, setProducts, filters, setFilters, isLoaded, settings } = useData()
  const [activeTab, setActiveTab] = useState<'products' | 'filters' | 'settings'>('products')
  const [activeCategory, setActiveCategory] = useState<string>(settings?.navigation?.[0]?.label || '')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [toast, setToast] = useState('')
  const [editingCell, setEditingCell] = useState<{ productId: number; field: string } | null>(null)

  // Close editing cell on outside click
  useEffect(() => {
    if (!editingCell) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Don't close if clicking inside the same editing cell
      if (target.closest(`[data-cell="${editingCell.productId}-${editingCell.field}"]`)) return
      // Also don't close if clicking sub-fields inside the Name cell
      if (['category', 'volume', 'age', 'alcohol'].includes(editingCell.field)) {
        const nameCell = target.closest(`[data-cell="${editingCell.productId}-name"]`)
        if (nameCell && (nameCell as HTMLElement).dataset.cellFields?.includes(editingCell.field)) return
      }
      setEditingCell(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [editingCell])
  
  // Don't render until data is loaded from context
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-gray-500">載入中...</div></div>
  }

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 2500)
  }

  // Save - sync context state to API
  const handleSave = async () => {
    if (products.length === 0) {
      showToast('沒有資料需要儲存')
      return
    }
    
    // DataContext already saves to localStorage via useEffect
    // Just sync to API so incognito mode can access
    try {
      await fetch('/api/shared-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: products,
          filters: filters
        })
      })
    } catch (err) {
      console.error('Failed to sync to API:', err)
    }
    
    showToast('Saved')
    setHasChanges(false)
  }

  const handleAddProduct = () => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1
    const newProduct: Product = {
      id: newId,
      name: "New Product",
      brand: "Brand",
      country: "Scotland",
      category: categoryMap[activeCategory]?.[0] || 'Single Malt',
      age: "NAS",
      volume: "700ml",
      price: 99,
      img: "https://lh3.googleusercontent.com/u/0/d/15ij09mVuQVvTMVEwq0eQ7-0q80VLKjTm",
      description: "",
      stock: 0
    }
    const newProducts = [...products, newProduct]
    setProducts(newProducts)
    setHasChanges(true)
    setEditingProduct(newProduct)
    setIsAddingProduct(true)
  }

  const handleUpdateProduct = (updated: Product) => {
    const newProducts = products.map(p => p.id === updated.id ? updated : p)
    setProducts(newProducts)
    setHasChanges(true)
    setEditingProduct(null)
    setIsAddingProduct(false)
  }

  const handleDeleteProduct = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const newProducts = products.filter(p => p.id !== id)
      setProducts(newProducts)
      setHasChanges(true)
    }
  }

  const handleAddFilterValue = (filterId: string, value: string) => {
    const newFilters = filters.map(f => {
      if (f.id === filterId && !f.values.includes(value)) {
        return { ...f, values: [...f.values, value] }
      }
      return f
    })
    setFilters(newFilters)
    setHasChanges(true)
  }

  const handleRemoveFilterValue = (filterId: string, value: string) => {
    const newFilters = filters.map(f => {
      if (f.id === filterId) {
        return { ...f, values: f.values.filter(v => v !== value) }
      }
      return f
    })
    setFilters(newFilters)
    setHasChanges(true)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/Logo.png" alt="logo" className="h-8" />
              <h1 className="text-xl font-bold text-gray-800">Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              {hasChanges && (
                <span className="text-sm text-orange-500">Unsaved changes</span>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Logout
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  hasChanges 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Icons.Save />
                Save
              </button>
              <a href="/" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                View Site
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {(settings?.navigation || []).map((navItem) => {
              const count = products.filter(p => productMatchesNavCategory(p.category, navItem.label)).length
              return (
                <button
                  key={navItem.label}
                  onClick={() => { setActiveTab('products'); setActiveCategory(navItem.label); }}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'products' && activeCategory === navItem.label
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icons.Package />
                  {navItem.label} ({count})
                </button>
              )
            })}
            <button
              onClick={() => setActiveTab('filters')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'filters'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icons.Filter />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Manage Products</h2>
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                <Icons.Plus />
                Add Product
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Brand</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Country</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.filter(p => productMatchesNavCategory(p.category, activeCategory)).map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <label className="relative cursor-pointer group block">
                            <img src={product.img} alt={product.name} className="w-12 h-12 object-cover border border-gray-200 rounded group-hover:border-amber-400 transition-colors" suppressHydrationWarning />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const fd = new FormData()
                                fd.append('file', file)
                                try {
                                  const res = await fetch('/api/upload', { method: 'POST', body: fd })
                                  const data = await res.json()
                                  if (data.url) {
                                    const updated = products.map(p => p.id === product.id ? { ...p, img: data.url } : p)
                                    setProducts(updated)
                                  }
                                } catch (_) {}
                                e.target.value = ''
                              }}
                            />
                          </label>
                        </td>
                        <td data-cell={`${product.id}-brand`} className="px-4 py-3">
                          {editingCell?.productId === product.id && editingCell?.field === 'brand' ? (
                            <select
                              autoFocus
                              value={product.brand}
                              onChange={(e) => {
                                const updated = products.map(p => p.id === product.id ? { ...p, brand: e.target.value } : p)
                                setProducts(updated)
                                setEditingCell(null)
                              }}
                              onBlur={() => setEditingCell(null)}
                              onKeyDown={(e) => { if (e.key === 'Escape') setEditingCell(null) }}
                              className="w-full px-2 py-1 text-sm border border-amber-400 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                            >
                              {(settings?.brands || filters?.find(f => f.id === 'brand')?.values || []).map(b => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          ) : (
                            <button
                              onClick={() => setEditingCell({ productId: product.id, field: 'brand' })}
                              className="text-sm text-gray-600 hover:text-amber-600 hover:underline cursor-pointer text-left w-full"
                              title="點擊編輯"
                            >{product.brand}</button>
                          )}
                        </td>
                        <td data-cell={`${product.id}-name`} data-cell-fields="category volume age alcohol" className="px-4 py-3">
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => {
                              const updated = products.map(p => p.id === product.id ? { ...p, name: e.target.value } : p)
                              setProducts(updated)
                            }}
                            className="w-full px-2 py-1 text-sm font-medium text-gray-800 border border-transparent hover:border-amber-300 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-100 rounded cursor-text"
                          />
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {/* Category */}
                            {editingCell?.productId === product.id && editingCell?.field === 'category' ? (
                              <select
                                autoFocus
                                value={product.category}
                                onChange={(e) => {
                                  const updated = products.map(p => p.id === product.id ? { ...p, category: e.target.value } : p)
                                  setProducts(updated)
                                  setEditingCell(null)
                                }}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => { if (e.key === 'Escape') setEditingCell(null) }}
                                className="px-1 py-0.5 text-xs border border-amber-400 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                              >
                                {(settings?.categories || filters?.find(f => f.id === 'category')?.values || []).map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            ) : (
                              <button
                                onClick={() => setEditingCell({ productId: product.id, field: 'category' })}
                                className="text-xs px-1 py-0.5 bg-gray-100 hover:bg-amber-50 hover:text-amber-700 rounded cursor-pointer"
                                title="點擊編輯 Category"
                              >{product.category}</button>
                            )}
                            {/* Age */}
                            <input
                              type="text"
                              value={product.age || ''}
                              placeholder="Age"
                              onChange={(e) => {
                                const updated = products.map(p => p.id === product.id ? { ...p, age: e.target.value } : p)
                                setProducts(updated)
                              }}
                              className="w-14 px-1 py-0.5 text-xs text-gray-600 border border-transparent hover:border-amber-300 focus:border-amber-400 focus:outline-none rounded cursor-text"
                            />
                            {/* Alcohol */}
                            <input
                              type="text"
                              value={product.alcohol || ''}
                              placeholder=" Alc.%"
                              onChange={(e) => {
                                const updated = products.map(p => p.id === product.id ? { ...p, alcohol: e.target.value } : p)
                                setProducts(updated)
                              }}
                              className="w-14 px-1 py-0.5 text-xs text-gray-600 border border-transparent hover:border-amber-300 focus:border-amber-400 focus:outline-none rounded cursor-text"
                            />
                            {/* Volume */}
                            {editingCell?.productId === product.id && editingCell?.field === 'volume' ? (
                              <select
                                autoFocus
                                value={product.volume}
                                onChange={(e) => {
                                  const updated = products.map(p => p.id === product.id ? { ...p, volume: e.target.value } : p)
                                  setProducts(updated)
                                  setEditingCell(null)
                                }}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => { if (e.key === 'Escape') setEditingCell(null) }}
                                className="px-1 py-0.5 text-xs border border-amber-400 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                              >
                                {(settings?.volumes || filters?.find(f => f.id === 'volume')?.values || ['50ml', '700ml', '750ml', '1000ml']).map(v => (
                                  <option key={v} value={v}>{v}</option>
                                ))}
                              </select>
                            ) : (
                              <button
                                onClick={() => setEditingCell({ productId: product.id, field: 'volume' })}
                                className="text-xs px-1 py-0.5 bg-gray-100 hover:bg-amber-50 hover:text-amber-700 rounded cursor-pointer"
                                title="點擊編輯 Volume"
                              >{product.volume}</button>
                            )}
                          </div>
                        </td>
                        <td data-cell={`${product.id}-country`} className="px-4 py-3">
                          {editingCell?.productId === product.id && editingCell?.field === 'country' ? (
                            <select
                              autoFocus
                              value={product.country}
                              onChange={(e) => {
                                const updated = products.map(p => p.id === product.id ? { ...p, country: e.target.value } : p)
                                setProducts(updated)
                                setEditingCell(null)
                              }}
                              onBlur={() => setEditingCell(null)}
                              onKeyDown={(e) => { if (e.key === 'Escape') setEditingCell(null) }}
                              className="w-full px-2 py-1 text-sm border border-amber-400 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                            >
                              {(settings?.countries || filters?.find(f => f.id === 'country')?.values || []).map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <button
                              onClick={() => setEditingCell({ productId: product.id, field: 'country' })}
                              className="text-sm text-gray-600 hover:text-amber-600 hover:underline cursor-pointer text-left w-full"
                              title="點擊編輯"
                            >{product.country}</button>
                          )}
                        </td>
                        <td data-cell={`${product.id}-stock`} className="px-4 py-3">
                          <input
                            type="number"
                            value={product.stock ?? 0}
                            min={0}
                            onChange={(e) => {
                              const updated = products.map(p => p.id === product.id ? { ...p, stock: Number(e.target.value) } : p)
                              setProducts(updated)
                            }}
                            className="w-16 px-2 py-1 text-sm text-gray-800 border border-transparent hover:border-amber-300 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-100 rounded cursor-text"
                          />
                        </td>
                        <td data-cell={`${product.id}-price`} className="px-4 py-3">
                          {editingCell?.productId === product.id && editingCell?.field === 'price' ? (
                            <input
                              autoFocus
                              type="number"
                              value={product.price}
                              onChange={(e) => {
                                const updated = products.map(p => p.id === product.id ? { ...p, price: Number(e.target.value) } : p)
                                setProducts(updated)
                                setEditingCell(null)
                              }}
                              onBlur={() => setEditingCell(null)}
                              onKeyDown={(e) => { if (e.key === 'Escape') setEditingCell(null) }}
                              className="w-20 px-2 py-1 text-sm border border-amber-400 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                              min="0"
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCell({ productId: product.id, field: 'price' })}
                              className="text-sm font-semibold text-gray-800 hover:text-amber-600 cursor-pointer text-left"
                              title="點擊編輯 Price"
                            >${product.price}</button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-2 text-blue-500 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Icons.Edit />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Filters Tab */}
        {activeTab === 'filters' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Manage Filters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filters.map(filter => (
                <div key={filter.id} className="bg-white rounded border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">{filter.label}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {filter.values.map(value => (
                      <span
                        key={value}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-sm text-gray-700 border border-gray-200"
                      >
                        {value}
                        <button
                          onClick={() => handleRemoveFilterValue(filter.id, value)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Icons.Close />
                        </button>
                      </span>
                    ))}
                  </div>
                  <AddFilterValueForm onAdd={(value) => handleAddFilterValue(filter.id, value)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <EditProductModal
            key={editingProduct?.id}
            product={editingProduct}
            isNew={isAddingProduct}
            onSave={handleUpdateProduct}
            onClose={() => {
              setEditingProduct(null)
              setIsAddingProduct(false)
            }}
            countries={settings?.countries || filters?.find(f => f.id === 'country')?.values || ['Scotland', 'Japan', 'Taiwan', 'USA']}
            brands={settings?.brands || filters?.find(f => f.id === 'brand')?.values || ['Macallan', 'Glenfiddich', 'Yamazaki']}
            categories={settings?.categories || filters?.find(f => f.id === 'category')?.values || ['Single Malt', 'Blended', 'Bourbon', 'Rye', 'Cognac']}
            volumes={settings?.volumes || filters?.find(f => f.id === 'volume')?.values || ['50ml', '700ml', '750ml', '1000ml']}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Icons.Check />
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Add Filter Value Form Component
function AddFilterValueForm({ onAdd }: { onAdd: (value: string) => void }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onAdd(value.trim())
      setValue('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add value..."
        className="flex-1 px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-amber-500"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="px-3 py-2 bg-amber-500 text-white text-sm hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add
      </button>
    </form>
  )
}

// Edit Product Modal Component
function EditProductModal({ 
  product, 
  isNew, 
  onSave, 
  onClose,
  countries,
  brands,
  categories,
  volumes,
}: { 
  product: Product
  isNew: boolean
  onSave: (product: Product) => void
  onClose: () => void
  countries: string[]
  brands: string[]
  categories: string[]
  volumes: string[]
}) {
  const [form, setForm] = useState(product)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-bold text-gray-800">
              {isNew ? 'Add New Product' : 'Edit Product'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <Icons.Close />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                >
                  {(brands || []).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onBlur={(e) => {
                    const trimmed = e.target.value.trim()
                    if (trimmed === '') {
                      setForm(prev => ({ ...prev, name: '' }))
                    } else {
                      setForm(prev => ({ ...prev, name: trimmed }))
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                >
                  {(countries || ['Scotland', 'Japan', 'Taiwan', 'USA']).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                >
                  {(categories || ['Single Malt', 'Blended', 'Bourbon', 'Rye', 'Cognac', 'Gin', 'Rum', 'Wine', 'Other']).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="text"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alc. (%)</label>
                <input
                  type="number"
                  value={form.alcohol || ''}
                  onChange={(e) => setForm({ ...form, alcohol: e.target.value })}
                  placeholder="e.g. 43"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume</label>
                <select
                  value={form.volume}
                  onChange={(e) => setForm({ ...form, volume: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                >
                  {(volumes || ['50ml', '700ml', '750ml', '1000ml']).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input
                  type="number"
                  value={form.stock ?? 0}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                <input
                  type="text"
                  value={form.barcode || ''}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={form.sku || ''}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={form.img}
                  onChange={(e) => setForm({ ...form, img: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                />
                <label className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg cursor-pointer hover:bg-amber-600 transition-colors">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const fd = new FormData()
                      fd.append('file', file)
                      try {
                        const res = await fetch('/api/upload', { method: 'POST', body: fd })
                        const data = await res.json()
                        if (data.url) setForm({ ...form, img: data.url })
                      } catch (_) {}
                    }}
                  />
                </label>
              </div>
            </div>

            {form.img && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                <img src={form.img} alt={form.name} className="w-32 h-32 object-cover border border-gray-200" suppressHydrationWarning />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Enter product description..."
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-white text-sm font-medium hover:bg-amber-600"
              >
                {isNew ? 'Add Product' : 'Save'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </>
  )
}
