'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut, useSession } from 'next-auth/react'

// Navigation: 3 層結構
// Layer 1: 最上層導航（Whisky, Other Drinks, Gin...）
// Layer 2: 國家/類別分組（Scotland, Japanese...），無分組則為直接連結
// Layer 3: 品牌連結（Macallan, Yamazaki...），掛在 Layer 2 底下
interface NavLayer3 { label: string; href: string }
interface NavLayer2 { label: string; href?: string; sub?: NavLayer3[] }
interface NavItem { label: string; href: string; sub?: NavLayer2[] }

interface SiteSettings {
  siteName: string
  logo: string
  logoUrl: string
  contactEmail: string
  ubn: string
  colors: Record<string, string>
  hero: { title: string; subtitle: string; ctaText: string }
  navigation: NavItem[]
  footer: { brand: string; description: string; featuredLinks: string[]; whiskyTypes: string[]; aboutLinks: string[] }
}

// 每個大項的顏色 key → 區塊 id
const BLOCK_META: Record<string, { id: string; label: string; labelZh: string }> = {
  secondary:      { id: 'general',    label: 'General',    labelZh: 'General' },
  accent:         { id: 'general',    label: 'General',    labelZh: 'General' },
  background:     { id: 'general',    label: 'General',    labelZh: 'General' },
  text:           { id: 'general',    label: 'General',    labelZh: 'General' },
  navBackground:  { id: 'nav',        label: 'Navigation', labelZh: 'Navigation' },
  navText:        { id: 'nav',        label: 'Navigation', labelZh: 'Navigation' },
  navHover:       { id: 'nav',        label: 'Navigation', labelZh: 'Navigation' },
  navLabel:       { id: 'nav',       label: 'Navigation', labelZh: 'Navigation' },
  navDropdownBg:   { id: 'dropdown', label: 'Dropdown',    labelZh: 'Dropdown' },
  navDropdownText: { id: 'dropdown', label: 'Dropdown',    labelZh: 'Dropdown' },
  navDropdownHover:{ id: 'dropdown', label: 'Dropdown',    labelZh: 'Dropdown' },
  navDropdownLabel:{ id: 'dropdown', label: 'Dropdown',    labelZh: 'Dropdown' },
  buttonPrimary:  { id: 'buttons',    label: 'Buttons',    labelZh: 'Buttons' },
  buttonAccent:   { id: 'buttons',    label: 'Buttons',    labelZh: 'Buttons' },
  footerBackground: { id: 'footer',   label: 'Footer',     labelZh: 'Footer' },
  footerText:     { id: 'footer',     label: 'Footer',     labelZh: 'Footer' },
  footerMuted:    { id: 'footer',     label: 'Footer',     labelZh: 'Footer' },
  cardBackground: { id: 'cards',      label: 'Cards',      labelZh: 'Cards' },
  cardBorder:     { id: 'cards',      label: 'Cards',      labelZh: 'Cards' },
  heroBackground: { id: 'hero',       label: 'Hero',       labelZh: 'Hero' },
  heroText:       { id: 'hero',       label: 'Hero',       labelZh: 'Hero' },
  heroAccent:     { id: 'hero',       label: 'Hero',       labelZh: 'Hero' },
}

// 固定附掛在BLOCK_META的key（不可刪）
const FIXED_KEYS = Object.keys(BLOCK_META)

interface Block {
  id: string
  label: string
  labelZh: string
}

const defaultColors: Record<string, string> = {
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
}

const defaultSettings: SiteSettings = {
  siteName: 'wishliquor.co',
  logo: 'W',
  logoUrl: '/Logo.png',
  contactEmail: 'wishliquor@outlook.com',
  ubn: '83120142',
  colors: { ...defaultColors },
  hero: { title: 'Explore World Whiskies', subtitle: 'Premium selection of fine whiskies from Scotland, Japan, Taiwan and beyond — delivered to your door', ctaText: 'Shop Now' },
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


const Icons = {
  Save: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
}

export default function DesignPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState<'general' | 'colors' | 'hero' | 'navigation' | 'footer'>('colors')
  const [toast, setToast] = useState('')

  // 動態區塊列表
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 'general',  label: 'General',    labelZh: 'General' },
    { id: 'nav',      label: 'Navigation',   labelZh: 'Navigation' },
    { id: 'dropdown', label: 'Dropdown',     labelZh: 'Dropdown' },
    { id: 'buttons',  label: 'Buttons',      labelZh: 'Buttons' },
    { id: 'footer',   label: 'Footer',       labelZh: 'Footer' },
    { id: 'cards',    label: 'Cards',         labelZh: 'Cards' },
    { id: 'hero',     label: 'Hero',          labelZh: 'Hero' },
    { id: 'text1',    label: 'Text 1',        labelZh: 'Text 1' },
    { id: 'text2',    label: 'Text 2',        labelZh: 'Text 2' },
    { id: 'text3',    label: 'Text 3',        labelZh: 'Text 3' },
  ])

  // key → blockId 對應關係（只針對 FIXED_KEYS）
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    const a: Record<string, string> = {}
    FIXED_KEYS.forEach(k => { a[k] = BLOCK_META[k].id })
    return a
  })

  // 每個 block 的統一顏色
  const [blockColors, setBlockColors] = useState<Record<string, string>>(() => {
    const bc: Record<string, string> = {}
    ;[
      { id: 'general' },
      { id: 'nav' },
      { id: 'dropdown' },
      { id: 'buttons' },
      { id: 'footer' },
      { id: 'cards' },
      { id: 'hero' },
      { id: 'text1' },
      { id: 'text2' },
      { id: 'text3' },
    ].forEach(({ id }) => {
      const firstKey = FIXED_KEYS.find(k => BLOCK_META[k].id === id)
      bc[id] = firstKey ? defaultColors[firstKey] : '#CCCCCC'
    })
    return bc
  })

  // refs 永遠抓最新值（宣告在 state 之後）
  const assignmentsRef = useRef(assignments)
  const blockColorsRef = useRef(blockColors)
  const blocksRef = useRef(blocks)

  useEffect(() => { assignmentsRef.current = assignments }, [assignments])
  useEffect(() => { blockColorsRef.current = blockColors }, [blockColors])
  useEffect(() => { blocksRef.current = blocks }, [blocks])

  const [draggingKey, setDraggingKey] = useState<string | null>(null)
  const [dragOverBlock, setDragOverBlock] = useState<string | null>(null)

  useEffect(() => {
    // Fetch settings from API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings({
          ...defaultSettings,
          ...data,
          colors: { ...defaultColors, ...(data.colors || {}) }
        })
      })
      .catch(err => {
        console.error('Failed to load settings:', err)
        // Fallback to localStorage
        const saved = localStorage.getItem('wishliquor_site_settings')
        if (saved) {
          const parsed = JSON.parse(saved)
          setSettings({
            ...defaultSettings,
            ...parsed,
            colors: { ...defaultColors, ...parsed.colors }
          })
        }
      })

    // Load local-only data (assignments, blockColors, blocks)
    const savedAssignments = localStorage.getItem('wishliquor_assignments')
    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments))
    }
    const savedBlockColors = localStorage.getItem('wishliquor_block_colors')
    if (savedBlockColors) {
      setBlockColors(JSON.parse(savedBlockColors))
    }
    const savedBlocks = localStorage.getItem('wishliquor_blocks')
    if (savedBlocks) {
      setBlocks(JSON.parse(savedBlocks))
    }
  }, [])

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 2000)
  }

  const handleSave = useCallback(async () => {
    const currentAssignments = assignmentsRef.current
    const currentBlockColors = blockColorsRef.current
    const currentBlocks = blocksRef.current

    const colors: Record<string, string> = {}
    FIXED_KEYS.forEach(key => {
      const blockId = currentAssignments[key]
      colors[key] = currentBlockColors[blockId] || '#CCCCCC'
    })
    const newSettings = { ...settings, colors, navigation: settings.navigation }

    // Save to localStorage (always, as backup)
    localStorage.setItem('wishliquor_site_settings', JSON.stringify(newSettings))
    localStorage.setItem('wishliquor_assignments', JSON.stringify(currentAssignments))
    localStorage.setItem('wishliquor_block_colors', JSON.stringify(currentBlockColors))
    localStorage.setItem('wishliquor_blocks', JSON.stringify(currentBlocks))

    // Try to save to API
    let apiSuccess = false
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })
      if (res.ok) {
        apiSuccess = true
      }
    } catch (err) {
      console.error('API save failed:', err)
    }

    setSettings(newSettings)
    if (apiSuccess) {
      showToast('✅ 已儲存（雲端 + 本地）！')
    } else {
      showToast('✅ 已儲存（本地）！')
    }
  }, [settings])

  const updateBlockColor = (blockId: string, color: string) => {
    setBlockColors(prev => ({ ...prev, [blockId]: color }))
  }

  const handleKeyDragStart = (key: string) => {
    setDraggingKey(key)
  }

  const handleBlockDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault()
    setDragOverBlock(blockId)
  }

  const handleBlockDrop = (blockId: string) => {
    if (!draggingKey) return
    setAssignments(prev => ({ ...prev, [draggingKey]: blockId }))
    showToast(`「${draggingKey}」已移至 ${blocks.find((b: Block) => b.id === blockId)?.labelZh}`)
    setDraggingKey(null)
    setDragOverBlock(null)
  }

  const handleDragLeave = () => {
    setDragOverBlock(null)
  }

  // Block CRUD
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const [editingBlockName, setEditingBlockName] = useState('')

  const startEditBlock = (block: Block) => {
    setEditingBlockId(block.id)
    setEditingBlockName(block.labelZh)
  }

  const saveEditBlock = (blockId: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, label: editingBlockName, labelZh: editingBlockName } : b))
    setEditingBlockId(null)
  }

  const deleteBlock = (blockId: string) => {
    // 重新分配 keys 到第一個區塊
    const firstBlockId = blocks.find(b => b.id !== blockId)?.id || 'general'
    setAssignments(prev => {
      const next = { ...prev }
      FIXED_KEYS.forEach(k => { if (next[k] === blockId) next[k] = firstBlockId })
      return next
    })
    setBlocks(prev => prev.filter(b => b.id !== blockId))
    showToast('區塊已刪除')
  }

  const addBlock = () => {
    const id = 'custom_' + Date.now()
    const newBlock: Block = { id, label: 'New Block', labelZh: 'New Block' }
    setBlocks(prev => [...prev, newBlock])
    setBlockColors(prev => ({ ...prev, [id]: '#CCCCCC' }))
    setEditingBlockId(id)
    setEditingBlockName('New Block')
  }

  // 根據 assignments 分組
  const keysByBlock = blocks.map(b => ({
    ...b,
    keys: FIXED_KEYS.filter(k => assignments[k] === b.id)
  }))

  const s = settings.colors

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'colors', label: 'Colors' },
    { id: 'hero', label: 'Hero' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'footer', label: 'Footer' },
  ]

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src="/Logo.png" alt="logo" className="h-8" />
          <h1 className="text-lg font-bold text-gray-800">Design Studio</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
            登出
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-green-500 text-white hover:bg-green-600">
            <Icons.Save /> 儲存
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-200">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Settings (1/3) */}
        <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">

            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 mb-2">拖移細項到不同區塊，即可將該細項的顏色切換為目標區塊的顏色。</p>

                {/* Dynamic Blocks */}
                {keysByBlock.map(block => (
                  <div
                    key={block.id}
                    className={`border-2 rounded-lg overflow-hidden transition-all ${dragOverBlock === block.id ? 'border-amber-400 bg-amber-50 shadow-md' : 'border-gray-200 hover:border-amber-300'}`}
                    onDragOver={(e) => handleBlockDragOver(e, block.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={() => handleBlockDrop(block.id)}
                  >
                    {/* Block Header */}
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
                      <div
                        className="w-10 h-10 border-2 border-gray-300 cursor-grab flex-shrink-0 rounded flex items-center justify-center"
                        style={{ backgroundColor: blockColors[block.id] || '#CCCCCC' }}
                        title={`${block.labelZh} 主色`}
                      />
                      <div className="flex-1">
                        {editingBlockId === block.id ? (
                          <input
                            type="text"
                            value={editingBlockName}
                            onChange={(e) => setEditingBlockName(e.target.value)}
                            onBlur={() => saveEditBlock(block.id)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEditBlock(block.id) }}
                            autoFocus
                            className="w-full px-2 py-0.5 border border-amber-400 text-sm font-bold focus:outline-none rounded"
                          />
                        ) : (
                          <h3
                            className="text-sm font-bold text-gray-800 cursor-pointer hover:text-amber-600"
                            onClick={() => startEditBlock(block)}
                            title="點擊編輯名稱"
                          >{block.labelZh}</h3>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={blockColors[block.id] || '#CCCCCC'}
                          onChange={(e) => updateBlockColor(block.id, e.target.value)}
                          className="w-7 h-7 border border-gray-300 cursor-pointer rounded"
                        />
                        <input
                          type="text"
                          value={blockColors[block.id] || '#CCCCCC'}
                          onChange={(e) => updateBlockColor(block.id, e.target.value)}
                          className="w-20 px-1 py-1 border border-gray-300 text-xs focus:outline-none focus:border-amber-500 rounded"
                        />
                      </div>
                      <button
                        onClick={() => deleteBlock(block.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="刪除區塊"
                      >
                        <Icons.Trash />
                      </button>
                    </div>

                    {/* Keys inside this block — draggable */}
                    <div className="px-3 py-2 flex flex-wrap gap-1.5 min-h-[36px]">
                      {block.keys.map(key => (
                        <div
                          key={key}
                          className={`flex items-center gap-1 border rounded-full px-2.5 py-1 cursor-grab transition-all text-xs font-medium
                            ${draggingKey === key
                              ? 'opacity-40 border-amber-400 bg-amber-100'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-amber-400 hover:bg-amber-50'
                            }`}
                          draggable
                          onDragStart={() => handleKeyDragStart(key)}
                          title={`拖移「${key}」到其他區塊`}
                        >
                          <div className="w-3 h-3 border border-gray-300 rounded-full flex-shrink-0" style={{ backgroundColor: blockColors[block.id] || '#CCCCCC' }} />
                          <span>{key}</span>
                        </div>
                      ))}
                      {block.keys.length === 0 && (
                        <p className="text-xs text-gray-400 italic py-1">拖移細項到這裡</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Block Button */}
                <button
                  onClick={addBlock}
                  className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium rounded-lg"
                >
                  <Icons.Plus /> 新增區塊
                </button>

                {/* Drag hint */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-xs text-amber-800 font-medium mb-1">💡 拖移說明</p>
                  <p className="text-xs text-amber-700">拖移任一細項標籤（如 primary）到其他區塊，該細項就會套用該區塊的統一顏色。點擊區塊名稱可重新命名。按 💾 儲存。</p>
                </div>
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                  <input type="text" value={settings.siteName} onChange={(e) => { setSettings({...settings, siteName: e.target.value}); }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                  <div className="flex gap-2">
                    <input type="text" value={settings.logoUrl} onChange={(e) => { setSettings({...settings, logoUrl: e.target.value}); }}
                      placeholder="/Logo.png"
                      className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500" />
                    <label className="px-4 py-2 bg-amber-500 text-white text-sm font-medium cursor-pointer hover:bg-amber-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      上傳
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const formData = new FormData()
                        formData.append('file', file)
                        try {
                          const res = await fetch('/api/upload', { method: 'POST', body: formData })
                          const data = await res.json()
                          if (data.url) {
                            setSettings({...settings, logoUrl: data.url})
                            showToast('✅ Logo 已上傳！')
                          } else {
                            showToast('❌ 上傳失敗：' + data.error)
                          }
                        } catch (err) {
                          showToast('❌ 上傳失敗')
                        }
                      }} />
                    </label>
                  </div>
                  {settings.logoUrl && (
                    <div className="mt-2 border border-gray-200 rounded p-2 bg-gray-50">
                      <img src={settings.logoUrl} alt="logo preview" className="h-12" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input type="email" value={settings.contactEmail} onChange={(e) => { setSettings({...settings, contactEmail: e.target.value}); }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UBN</label>
                  <input type="text" value={settings.ubn} onChange={(e) => { setSettings({...settings, ubn: e.target.value}); }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500" />
                </div>
              </div>
            )}

            {/* Hero Tab */}
            {activeTab === 'hero' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={settings.hero.title} onChange={(e) => { setSettings({...settings, hero: {...settings.hero, title: e.target.value}}); }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <textarea value={settings.hero.subtitle} onChange={(e) => { setSettings({...settings, hero: {...settings.hero, subtitle: e.target.value}}); }}
                    rows={3} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                  <input type="text" value={settings.hero.ctaText} onChange={(e) => { setSettings({...settings, hero: {...settings.hero, ctaText: e.target.value}}); }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500" />
                </div>
              </div>
            )}

            {/* Navigation Tab — 3 Layer Editor */}
            {activeTab === 'navigation' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Layer 1 / 2 / 3 三層導航編輯器</p>
                </div>

                {settings.navigation.map((item, l1Index) => (
                  <div key={l1Index} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* ── Layer 1: Top-level item ── */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
                      <span className="text-xs font-bold text-gray-400 w-12 flex-shrink-0">L1</span>
                      <input type="text" value={item.label}
                        onChange={(e) => {
                          const n = [...settings.navigation]
                          n[l1Index].label = e.target.value
                          setSettings({ ...settings, navigation: n })
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 text-sm font-medium focus:outline-none focus:border-amber-500 rounded" />
                      <input type="text" value={item.href}
                        onChange={(e) => {
                          const n = [...settings.navigation]
                          n[l1Index].href = e.target.value
                          setSettings({ ...settings, navigation: n })
                        }}
                        className="w-40 px-2 py-1 border border-gray-300 text-xs focus:outline-none focus:border-amber-500 rounded" />
                      <button onClick={() => {
                        const n = settings.navigation.filter((_, i) => i !== l1Index)
                        setSettings({ ...settings, navigation: n })
                      }} className="p-1 text-gray-400 hover:text-red-500"><Icons.Trash /></button>
                    </div>

                    {/* ── Layer 2: Country / category groups ── */}
                    {item.sub && item.sub.map((l2, l2Index) => (
                      <div key={l2Index} className="border-t border-gray-100">
                        <div className="flex items-center gap-2 px-3 py-1.5 pl-8 bg-gray-25">
                          <span className="text-xs font-bold text-gray-400 w-12 flex-shrink-0">L2</span>
                          <input type="text" value={l2.label}
                            onChange={(e) => {
                              const n = [...settings.navigation]
                              n[l1Index].sub![l2Index].label = e.target.value
                              setSettings({ ...settings, navigation: n })
                            }}
                            className="flex-1 px-2 py-1 border border-gray-200 text-xs font-medium focus:outline-none focus:border-amber-500 rounded" />
                          <button onClick={() => {
                            const n = [...settings.navigation]
                            n[l1Index].sub = n[l1Index].sub!.filter((_, i) => i !== l2Index)
                            setSettings({ ...settings, navigation: n })
                          }} className="p-0.5 text-gray-400 hover:text-red-500"><Icons.Trash /></button>
                        </div>

                        {/* ── Layer 3: Brand links ── */}
                        {l2.sub && l2.sub.map((l3, l3Index) => (
                          <div key={l3Index} className="flex items-center gap-2 px-3 py-1 pl-16 border-t border-gray-50">
                            <span className="text-xs font-bold text-gray-400 w-12 flex-shrink-0">L3</span>
                            <input type="text" value={l3.label}
                              onChange={(e) => {
                                const n = [...settings.navigation]
                                n[l1Index].sub![l2Index].sub![l3Index].label = e.target.value
                                setSettings({ ...settings, navigation: n })
                              }}
                              className="flex-1 px-2 py-0.5 border border-gray-200 text-xs focus:outline-none focus:border-amber-500 rounded" />
                            <input type="text" value={l3.href}
                              onChange={(e) => {
                                const n = [...settings.navigation]
                                n[l1Index].sub![l2Index].sub![l3Index].href = e.target.value
                                setSettings({ ...settings, navigation: n })
                              }}
                              className="w-40 px-2 py-0.5 border border-gray-200 text-xs focus:outline-none focus:border-amber-500 rounded" />
                            <button onClick={() => {
                              const n = [...settings.navigation]
                              n[l1Index].sub![l2Index].sub = n[l1Index].sub![l2Index].sub!.filter((_, i) => i !== l3Index)
                              setSettings({ ...settings, navigation: n })
                            }} className="p-0.5 text-gray-400 hover:text-red-500"><Icons.Trash /></button>
                          </div>
                        ))}

                        {/* Add L3 brand */}
                        <div className="px-3 pl-16 py-1 border-t border-gray-50">
                          <button
                            onClick={() => {
                              const n = [...settings.navigation]
                              if (!n[l1Index].sub![l2Index].sub) n[l1Index].sub![l2Index].sub = []
                              n[l1Index].sub![l2Index].sub!.push({ label: 'New Brand', href: '/shop?brand=new-brand' })
                              setSettings({ ...settings, navigation: n })
                            }}
                            className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                            <Icons.Plus /> 新增 L3 品牌
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add L2 group */}
                    <div className="px-3 py-1.5 pl-8 border-t border-gray-100">
                      <button
                        onClick={() => {
                          const n = [...settings.navigation]
                          if (!n[l1Index].sub) n[l1Index].sub = []
                          n[l1Index].sub!.push({ label: 'New Group', sub: [] })
                          setSettings({ ...settings, navigation: n })
                        }}
                        className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                        <Icons.Plus /> 新增 L2 分組
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add L1 top-level item */}
                <button
                  onClick={() => {
                    setSettings({
                      ...settings,
                      navigation: [...settings.navigation, { label: 'New Item', href: '#', sub: [] }]
                    })
                  }}
                  className="w-full py-2 text-sm text-amber-600 border border-amber-300 hover:bg-amber-50 flex items-center justify-center gap-1 rounded-lg">
                  <Icons.Plus /> 新增 L1 導航
                </button>
              </div>
            )}

            {/* Footer Tab */}
            {activeTab === 'footer' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                  <input type="text" value={settings.footer.brand} onChange={(e) => { setSettings({...settings, footer: {...settings.footer, brand: e.target.value}}); }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={settings.footer.description} onChange={(e) => { setSettings({...settings, footer: {...settings.footer, description: e.target.value}}); }}
                    rows={3} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview (2/3) */}
        <div className="w-2/3 overflow-y-auto" style={{ backgroundColor: '#E5E7EB' }}>
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">Live Preview — {tabs.find(t => t.id === activeTab)?.label}</span>
            <div className="flex gap-3">
              <a href="/" target="_blank" className="text-sm text-amber-600 hover:underline">Open Site ↗</a>
              <a href="/admin" target="_blank" className="text-sm text-gray-500 hover:text-gray-700">Admin ↗</a>
            </div>
          </div>

          <div style={{ backgroundColor: s.background, color: s.text, minHeight: 'calc(100vh - 110px)' }}>
            {/* Header */}
            <header style={{ backgroundColor: s.background, borderBottom: `1px solid ${s.cardBorder || '#E5E7EB'}` }}>
              <div className="max-w-6xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={settings.logoUrl} alt="logo" className="h-10" />
                    <span className="font-semibold hidden sm:block" style={{ color: s.text }}>{settings.siteName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button style={{ backgroundColor: s.buttonPrimary, color: '#fff' }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium">Login</button>
                  </div>
                </div>
              </div>
              <nav style={{ backgroundColor: s.navBackground }}>
                <div className="max-w-6xl mx-auto px-4">
                  <div className="flex gap-1 py-2 overflow-x-auto">
                    {settings.navigation.map((item, i) => (
                      <a key={i} href={item.href} className="px-3 py-1 text-sm whitespace-nowrap transition-colors" style={{ color: s.navText }}>{item.label}</a>
                    ))}
                  </div>
                </div>
              </nav>
            </header>

            {/* Hero */}
            <section className="text-center py-12 px-4" style={{ backgroundColor: s.heroBackground || s.background }}>
              <h1 className="text-2xl lg:text-3xl font-bold mb-3" style={{ color: s.heroText || s.text }}>{settings.hero.title}</h1>
              <p className="max-w-xl mx-auto mb-6" style={{ color: s.footerMuted }}>{settings.hero.subtitle}</p>
              <button style={{ backgroundColor: s.heroAccent || s.buttonPrimary, color: '#fff' }} className="px-6 py-3 font-semibold">{settings.hero.ctaText}</button>
            </section>

            {/* Products */}
            <section className="px-4 pb-8">
              <div className="max-w-6xl mx-auto">
                <h3 className="text-sm font-semibold mb-4" style={{ color: s.text }}>Featured Products</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { name: 'Macallan 12Y', country: 'Scotland', price: 169 },
                    { name: 'Yamazaki 18Y', country: 'Japan', price: 399 },
                    { name: 'Kavalan Concert', country: 'Taiwan', price: 89 },
                    { name: 'Glenlivet 15Y', country: 'Scotland', price: 149 },
                  ].map((p, i) => (
                    <div key={i} className="border" style={{ backgroundColor: s.cardBackground, borderColor: s.cardBorder }}>
                      <div className="aspect-square bg-gray-100" />
                      <div className="p-3">
                        <p className="text-xs font-semibold" style={{ color: s.accent }}>{p.country}</p>
                        <p className="text-sm font-medium truncate" style={{ color: s.text }}>{p.name}</p>
                        <p className="text-sm font-bold" style={{ color: s.text }}>${p.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer style={{ backgroundColor: s.footerBackground, borderTop: `1px solid ${s.cardBorder || '#E5E7EB'}` }} className="px-4 py-8 mt-8">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <h4 className="font-semibold mb-2" style={{ color: s.footerText }}>{settings.footer.brand}</h4>
                    <p className="text-sm" style={{ color: s.footerMuted }}>{settings.footer.description}</p>
                    <p className="text-sm mt-2" style={{ color: s.footerMuted }}>{settings.contactEmail}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: s.footerText }}>Featured</h4>
                    {settings.footer.featuredLinks.slice(0, 3).map((link, i) => (
                      <p key={i} className="text-sm" style={{ color: s.footerMuted }}>{link}</p>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: s.footerText }}>About</h4>
                    {settings.footer.aboutLinks.slice(0, 3).map((link, i) => (
                      <p key={i} className="text-sm" style={{ color: s.footerMuted }}>{link}</p>
                    ))}
                  </div>
                </div>
                <p className="text-center text-sm mt-8" style={{ color: s.footerMuted }}>© 2026 {settings.siteName} All rights reserved.</p>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium shadow-lg flex items-center gap-2">
            <Icons.Check /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
