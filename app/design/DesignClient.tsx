"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";

// Navigation: 3 層結構
// Layer 1: 最上層導航（Whisky, Other Drinks, Gin...）
// Layer 2: 國家/類別分組（Scotland, Japanese...），無分組則為直接連結
// Layer 3: 品牌連結（Macallan, Yamazaki...），掛在 Layer 2 底下
interface NavLayer3 {
  label: string;
  href: string;
  enabled?: boolean;
}
interface NavLayer2 {
  label: string;
  href?: string;
  enabled?: boolean;
  sub?: NavLayer3[];
}
interface NavItem {
  label: string;
  href: string;
  enabled?: boolean;
  sub?: NavLayer2[];
}

interface SiteSettings {
  siteName: string;
  logo: string;
  logoUrl: string;
  contactEmail: string;
  ubn: string;
  colors: Record<string, string>;
  hero: { title: string; subtitle: string; ctaText: string };
  navigation: NavItem[];
  content: {
    pageTitle: string;
    pageDescription: string;
    featuredTitle: string;
    featuredSubtitle: string;
    aboutTitle: string;
    aboutText: string;
  };
  footer: {
    brand: string;
    description: string;
    logoUrl: string;
    logoWidth: number;
    logoHeight: number;
    logoAspectLocked: boolean;
    copyright: string;
    columns: Array<{ title: string; links: string[] }>;
    modalWidth?: number;
    ubn?: string;
  };
  filterSidebarWidth?: number;
  countries: string[];
  brands: string[];
  categories: string[];
  volumes: string[];
  filterOrder: string[];
}

// 每個大項的顏色 key → 區塊 id
const BLOCK_META: Record<
  string,
  { id: string; label: string; labelZh: string }
> = {
  background: { id: "general", label: "General", labelZh: "General" },
  text: { id: "general", label: "General", labelZh: "General" },
  cardBackground: { id: "general", label: "General", labelZh: "General" },
  cardBorder: { id: "general", label: "General", labelZh: "General" },
  primary: { id: "primary", label: "Primary", labelZh: "Primary" },
  secondary: { id: "secondary", label: "Secondary", labelZh: "Secondary" },
  accent: { id: "accent", label: "Accent", labelZh: "Accent" },
  navBackground: { id: "nav", label: "Navigation", labelZh: "Navigation" },
  navText: { id: "nav", label: "Navigation", labelZh: "Navigation" },
  navHover: { id: "nav", label: "Navigation", labelZh: "Navigation" },
  navDropdownBg: { id: "dropdown", label: "Dropdown", labelZh: "Dropdown" },
  navDropdownText: { id: "dropdown", label: "Dropdown", labelZh: "Dropdown" },
  navDropdownHover: { id: "dropdown", label: "Dropdown", labelZh: "Dropdown" },
  navDropdownLabel: { id: "dropdown", label: "Dropdown", labelZh: "Dropdown" },
  buttonPrimary: { id: "buttons", label: "Buttons", labelZh: "Buttons" },
  footerBackground: { id: "footer", label: "Footer", labelZh: "Footer" },
  footerText: { id: "footer", label: "Footer", labelZh: "Footer" },
  footerMuted: { id: "footer", label: "Footer", labelZh: "Footer" },
  heroBackground: { id: "hero", label: "Hero", labelZh: "Hero" },
  heroText: { id: "hero", label: "Hero", labelZh: "Hero" },
  heroAccent: { id: "hero", label: "Hero", labelZh: "Hero" },
  filterClearText: { id: "clearAll", label: "Clear All", labelZh: "Clear All" },
};

// 顏色 key 用途對照表（用於提示）
const COLOR_KEY_HINTS: Record<string, string> = {
  background: "頁面背景",
  text: "內文文字",
  cardBackground: "卡片背景",
  cardBorder: "卡片邊框",
  primary: "主要強調（國家標籤）",
  secondary: "次要強調（按鈕邊框）",
  accent: "點綴色彩（價格、強調）",
  navBackground: "導航列背景",
  navText: "導航列文字",
  navHover: "導航列懸停",
  navDropdownBg: "下拉選單背景",
  navDropdownText: "下拉選單連結",
  navDropdownHover: "下拉選單懸停",
  navDropdownLabel: "下拉選單標題",
  buttonPrimary: "主要按鈕",
  buttonAccent: "次要按鈕",
  footerBackground: "頁腳背景",
  footerText: "頁腳標題",
  footerMuted: "頁腳次要文字",
  heroBackground: "Hero 區塊背景",
  heroText: "Hero 標題文字",
  heroAccent: "Hero 按鈕",
  filterClearText: "Clear All（清除所有）",
};

// 固定附掛在BLOCK_META的key（不可刪）
const FIXED_KEYS = Object.keys(BLOCK_META);

interface Block {
  id: string;
  label: string;
  labelZh: string;
}

const defaultColors: Record<string, string> = {
  background: "#FFFFFF",
  text: "#333333",
  cardBackground: "#FFFFFF",
  cardBorder: "#E5E7EB",
  primary: "#DC2626",
  secondary: "#6B7280",
  accent: "#C9A227",
  navBackground: "#DC2626",
  navText: "#FFFFFF",
  navHover: "#FCD34D",
  navDropdownBg: "#DC2626",
  navDropdownText: "#FFFFFF",
  navDropdownHover: "#FCD34D",
  navDropdownLabel: "#FFFFFF",
  buttonPrimary: "#C9A227",
  buttonAccent: "#DC2626",
  footerBackground: "#F9FAFB",
  footerText: "#333333",
  footerMuted: "#6B7280",
  heroBackground: "#FFFFFF",
  heroText: "#333333",
  heroAccent: "#C9A227",
  filterClearText: "#6B7280",
};

const defaultSettings: SiteSettings = {
  siteName: "wishliquor.co",
  logo: "W",
  logoUrl: "/Logo.png",
  contactEmail: "wishliquor@outlook.com",
  ubn: "83120142",
  colors: { ...defaultColors },
  hero: {
    title: "Explore World Whiskies",
    subtitle:
      "Premium selection of fine whiskies from Scotland, Japan, Taiwan and beyond — delivered to your door",
    ctaText: "Shop Now",
  },
  navigation: [
    {
      label: "Whisky",
      href: "/shop",
      sub: [
        {
          label: "Scotland",
          sub: [
            { label: "Macallan", href: "/shop?brand=macallan", enabled: true },
            { label: "Octomore", href: "/shop?brand=octomore", enabled: true },
            {
              label: "Johnnie Walker",
              href: "/shop?brand=johnnie-walker",
              enabled: true,
            },
            {
              label: "Royal Salute",
              href: "/shop?brand=royal-salute",
              enabled: true,
            },
          ],
        },
        {
          label: "Japanese",
          sub: [
            { label: "Yamazaki", href: "/shop?brand=yamazaki", enabled: true },
            { label: "Hakushu", href: "/shop?brand=hakushu", enabled: true },
            { label: "Hibiki", href: "/shop?brand=hibiki", enabled: true },
          ],
        },
        {
          label: "American",
          sub: [
            {
              label: "W.L. Weller",
              href: "/shop?brand=w-l-weller",
              enabled: true,
            },
            {
              label: "Jack Daniel's",
              href: "/shop?brand=jack-daniels",
              enabled: true,
            },
          ],
        },
        {
          label: "Taiwan",
          sub: [
            { label: "Kavalan", href: "/shop?brand=kavalan", enabled: true },
            { label: "Omar", href: "/shop?brand=omar", enabled: true },
          ],
        },
      ],
    },
    { label: "Other Drinks", href: "/shop?category=other-drinks" },
    { label: "Gin", href: "/shop?category=gin" },
    { label: "Rum", href: "/shop?category=rum" },
    { label: "Wine", href: "/shop?category=wine" },
    { label: "Baijiu", href: "/shop?category=baijiu" },
    { label: "Goods", href: "/shop?category=goods" },
    { label: "Contact", href: "/contact" },
  ],
  footer: {
    brand: "wishliquor.co",
    description: "Premium whiskies curated from around the world.",
    logoUrl: "/Logo.png",
    logoWidth: 120,
    logoHeight: 40,
    logoAspectLocked: true,
    copyright: "© 2026 wishliquor.co All rights reserved.",
    columns: [
      {
        title: "Featured",
        links: ["Bars", "The Whisky Map", "Reviews", "News", "Events"],
      },
      {
        title: "Whisky Type",
        links: [
          "Single Malt",
          "Sherry Cask",
          "Peated",
          "Bourbon Cask",
          "Independent",
        ],
      },
      {
        title: "About",
        links: ["Shipping", "Privacy", "Terms", "About Us", "Contact Us"],
      },
    ],
  },
  content: {
    pageTitle: "wishliquor.co | Your Whiskey Wishes",
    pageDescription: "Find the dram you've been wishing for",
    featuredTitle: "Featured Products",
    featuredSubtitle: "From your Wishlist to your Collection",
    aboutTitle: "About Us",
    aboutText:
      "Wishliquor.co curates the finest whiskies from Scotland, Japan, Taiwan and beyond — delivered straight to your door.",
  },
  countries: ["Scotland", "Japan", "Taiwan", "USA"],
  brands: [
    "Macallan",
    "Glenfiddich",
    "Yamazaki",
    "Kavalan",
    "Octomore",
    "Hibiki",
    "Hakushu",
    "Glenlivet",
    "Talisker",
    "W.L. Weller",
    "Jack Daniel's",
    "Omar",
  ],
  categories: [
    "Single Malt",
    "Blended",
    "Bourbon",
    "Rye",
    "Cognac",
    "Gin",
    "Rum",
    "Wine",
    "Other",
  ],
  volumes: ["50ml", "700ml", "750ml", "1000ml"],
  filterOrder: ["category", "country", "brand", "volume"],
};

const defaultBlocks: Block[] = [
  { id: "general", label: "General", labelZh: "General" },
  { id: "primary", label: "Primary", labelZh: "Primary" },
  { id: "secondary", label: "Secondary", labelZh: "Secondary" },
  { id: "accent", label: "Accent", labelZh: "Accent" },
  { id: "nav", label: "Navigation", labelZh: "Navigation" },
  { id: "dropdown", label: "Dropdown", labelZh: "Dropdown" },
  { id: "buttons", label: "Buttons", labelZh: "Buttons" },
  { id: "footer", label: "Footer", labelZh: "Footer" },
  { id: "hero", label: "Hero", labelZh: "Hero" },
  { id: "filter", label: "Filter", labelZh: "Filter" },
  { id: "clearAll", label: "Clear All", labelZh: "Clear All" },
];

const defaultAssignments: Record<string, string> = (() => {
  const a: Record<string, string> = {};
  FIXED_KEYS.forEach((k) => {
    a[k] = BLOCK_META[k].id;
  });
  return a;
})();

const defaultBlockColors: Record<string, string> = (() => {
  const bc: Record<string, string> = {};
  defaultBlocks.forEach(({ id }) => {
    const firstKey = FIXED_KEYS.find((k) => BLOCK_META[k].id === id);
    bc[id] = firstKey ? defaultColors[firstKey] : "#CCCCCC";
  });
  return bc;
})();

const Icons = {
  Save: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Check: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Close: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Plus: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  Edit: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
};

interface DesignClientProps {
  initialData: {
    settings?: Partial<SiteSettings>;
    blocks?: Block[];
    assignments?: Record<string, string>;
    blockColors?: Record<string, string>;
  } | null;
}

// FilterEditor: a single editor with draggable items inside
interface FilterEditorProps {
  section: string;
  label: string;
  items: string[];
  bg: string;
  border: string;
  text: string;
  focusColor: string;
  draggingTag: { section: string; item: string } | null;
  overTag: string | null;
  onDragStart: (item: string) => void;
  onDragOver: (item: string) => void;
  onDrop: (item: string) => void;
  onDragEnd: () => void;
  onRemove: (item: string) => void;
  onAdd: (val: string) => void;
  placeholder: string;
}

function FilterEditor({
  label,
  items,
  bg,
  border,
  text,
  focusColor,
  draggingTag,
  overTag,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove,
  onAdd,
  placeholder,
}: FilterEditorProps) {
  // Tailwind JIT needs static class names; use explicit focusColor prop
  const focusClass =
    focusColor === "amber"
      ? "focus:border-amber-500"
      : focusColor === "blue"
        ? "focus:border-blue-500"
        : focusColor === "green"
          ? "focus:border-green-500"
          : focusColor === "purple"
            ? "focus:border-purple-500"
            : "focus:border-amber-500";
  const btnClass =
    focusColor === "amber"
      ? "bg-amber-500 hover:bg-amber-600"
      : focusColor === "blue"
        ? "bg-blue-500 hover:bg-blue-600"
        : focusColor === "green"
          ? "bg-green-500 hover:bg-green-600"
          : focusColor === "purple"
            ? "bg-purple-500 hover:bg-purple-600"
            : "bg-amber-500 hover:bg-amber-600";
  return (
    <div className={`${bg} border ${border} rounded-lg p-3`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-xs font-semibold ${text}`}>{label}</p>
        <span className={`text-xs ${text.replace("700", "600")}`}>
          {items.length} 個
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item) => {
          const isDraggingThis = draggingTag?.item === item;
          const isOverThis = overTag === item && draggingTag?.item !== item;
          return (
            <span
              key={item}
              draggable
              onDragStart={() => onDragStart(item)}
              onDragOver={(e) => {
                e.preventDefault();
                onDragOver(item);
              }}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(item);
              }}
              onDragEnd={onDragEnd}
              className={`inline-flex items-center gap-1 px-2 py-0.5 bg-white border ${border} text-xs ${text.replace("700", "800")} rounded cursor-grab select-none transition-all ${isDraggingThis ? "opacity-30" : ""} ${isOverThis ? "ring-2 ring-amber-400" : ""}`}
            >
              <span className="text-gray-300 text-xs">⠿</span>
              {item}
              <button
                onClick={() => onRemove(item)}
                className={`${text.replace("700", "400")} hover:text-red-500 leading-none ml-0.5`}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={placeholder}
          className={`flex-1 px-2 py-1 text-xs border ${border.replace("200", "300")} focus:outline-none ${focusClass} rounded`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = (e.target as HTMLInputElement).value.trim();
              if (val && !items.includes(val)) {
                onAdd(val);
                (e.target as HTMLInputElement).value = "";
              }
            }
          }}
        />
        <button
          onClick={(e) => {
            const input = e.currentTarget
              .previousElementSibling as HTMLInputElement;
            const val = input.value.trim();
            if (val && !items.includes(val)) {
              onAdd(val);
              input.value = "";
            }
          }}
          className={`px-3 py-1 text-xs ${btnClass} text-white rounded`}
        >
          新增
        </button>
      </div>
    </div>
  );
}

export default function DesignClient({ initialData }: DesignClientProps) {
  // Footer L2 links modal state
  const [footerLinksModal, setFooterLinksModal] = useState<{
    colIndex: number;
    linkIndex: number;
    colTitle: string;
    linkLabel: string;
  } | null>(null);

  // Initial state from server-side disk read — no flash on mount
  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (initialData?.settings) {
      return {
        ...defaultSettings,
        ...initialData.settings,
        colors: { ...defaultColors, ...(initialData.settings.colors || {}) },
      };
    }
    return defaultSettings;
  });

  const [activeTab, setActiveTab] = useState<
    "general" | "colors" | "hero" | "navigation" | "footer" | "content"
  >("navigation");
  const [toast, setToast] = useState("");
  const [filterSidebarWidth, setFilterSidebarWidth] = useState(
    settings.filterSidebarWidth || 256,
  );
  // 動態區塊列表
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (initialData?.blocks?.length) return initialData.blocks;
    return defaultBlocks;
  });

  // key → blockId 對應關係
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    if (initialData?.assignments) return initialData.assignments;
    return defaultAssignments;
  });

  // 每個 block 的統一顏色
  const [blockColors, setBlockColors] = useState<Record<string, string>>(() => {
    if (initialData?.blockColors) return initialData.blockColors;
    return defaultBlockColors;
  });

  // refs 永遠抓最新值
  const assignmentsRef = useRef(assignments);
  const blockColorsRef = useRef(blockColors);
  const blocksRef = useRef(blocks);
  const settingsRef = useRef(settings);

  useEffect(() => {
    assignmentsRef.current = assignments;
  }, [assignments]);
  useEffect(() => {
    blockColorsRef.current = blockColors;
  }, [blockColors]);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dragOverBlock, setDragOverBlock] = useState<string | null>(null);
  // Drag state for filter tag items within each editor
  const [draggingTag, setDraggingTag] = useState<{
    section: string;
    item: string;
  } | null>(null);
  const [overTag, setOverTag] = useState<string | null>(null);
  // Drag state for payment icons
  const [draggingIcon, setDraggingIcon] = useState<string | null>(null);
  const [overIcon, setOverIcon] = useState<string | null>(null);

  // Track if initial load from localStorage is complete
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Sync from localStorage if user has saved work (handles returning users)
  useEffect(() => {
    const savedSettings = localStorage.getItem("wishliquor_site_settings");
    const savedAssignments = localStorage.getItem("wishliquor_assignments");
    const savedBlockColors = localStorage.getItem("wishliquor_block_colors");
    const savedBlocks = localStorage.getItem("wishliquor_blocks");

    // localStorage wins over server disk data (user's unsaved work in this browser)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          ...defaultSettings,
          ...parsed,
          colors: { ...defaultColors, ...parsed.colors },
        });
      } catch {}
    }
    if (savedAssignments) {
      try {
        setAssignments(JSON.parse(savedAssignments));
      } catch {}
    }
    if (savedBlockColors) {
      try {
        setBlockColors(JSON.parse(savedBlockColors));
      } catch {}
    }
    if (savedBlocks) {
      try {
        setBlocks(JSON.parse(savedBlocks));
      } catch {}
    }

    // Note: no API fetch here — useState initializers already have correct server disk data
    setInitialLoadComplete(true);
  }, []);

  // Sync settings to localStorage whenever they change
  useEffect(() => {
    if (initialLoadComplete && settings && Object.keys(settings).length > 0) {
      localStorage.setItem(
        "wishliquor_site_settings",
        JSON.stringify(settings),
      );
    }
  }, [settings, initialLoadComplete]);

  useEffect(() => {
    if (initialLoadComplete) {
      localStorage.setItem(
        "wishliquor_assignments",
        JSON.stringify(assignments),
      );
    }
  }, [assignments, initialLoadComplete]);

  useEffect(() => {
    if (initialLoadComplete) {
      localStorage.setItem(
        "wishliquor_block_colors",
        JSON.stringify(blockColors),
      );
    }
  }, [blockColors, initialLoadComplete]);

  useEffect(() => {
    if (initialLoadComplete) {
      localStorage.setItem("wishliquor_blocks", JSON.stringify(blocks));
    }
  }, [blocks, initialLoadComplete]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  };

  // Save - use refs to ensure we get the latest state
  const handleSave = async () => {
    const currentSettings = settingsRef.current;
    const currentAssignments = assignmentsRef.current;
    const currentBlockColors = blockColorsRef.current;
    const currentBlocks = blocksRef.current;

    // Build colors from block colors
    const colors: Record<string, string> = {};
    FIXED_KEYS.forEach((key) => {
      const blockId = currentAssignments[key];
      if (blockId === "clearAll" && currentBlockColors["clearAll"]) {
        // clearAll block: always use its block color directly
        colors[key] = currentBlockColors["clearAll"];
      } else {
        colors[key] = currentBlockColors[blockId] || "#CCCCCC";
      }
    });

    const newSettings = {
      ...currentSettings,
      colors,
      navigation: currentSettings.navigation,
      hero: currentSettings.hero,
      footer: currentSettings.footer,
      siteName: currentSettings.siteName,
      logo: currentSettings.logo,
      logoUrl: currentSettings.logoUrl,
      contactEmail: currentSettings.contactEmail,
      ubn: currentSettings.ubn,
    };

    localStorage.setItem(
      "wishliquor_site_settings",
      JSON.stringify(newSettings),
    );
    localStorage.setItem(
      "wishliquor_assignments",
      JSON.stringify(currentAssignments),
    );
    localStorage.setItem(
      "wishliquor_block_colors",
      JSON.stringify(currentBlockColors),
    );
    localStorage.setItem("wishliquor_blocks", JSON.stringify(currentBlocks));

    try {
      await fetch("/api/shared-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: newSettings,
          assignments: currentAssignments,
          blockColors: currentBlockColors,
          blocks: currentBlocks,
        }),
      });
    } catch (err) {
      console.error("Failed to save to API:", err);
    }

    showToast("Saved");
  };

  const updateBlockColor = (blockId: string, color: string) => {
    setBlockColors((prev) => ({ ...prev, [blockId]: color }));
  };

  const handleKeyDragStart = (key: string) => {
    setDraggingKey(key);
  };

  const handleBlockDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    setDragOverBlock(blockId);
  };

  const handleBlockDrop = (blockId: string) => {
    if (!draggingKey) return;
    const blockLabel =
      blocksRef.current.find((b: Block) => b.id === blockId)?.labelZh ||
      blockId;
    setAssignments((prev) => ({ ...prev, [draggingKey]: blockId }));
    showToast(`「${draggingKey}」已移至 ${blockLabel}`);
    setDraggingKey(null);
    setDragOverBlock(null);
  };

  const handleDragLeave = () => {
    setDragOverBlock(null);
  };

  // Block CRUD
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingBlockName, setEditingBlockName] = useState("");

  const startEditBlock = (block: Block) => {
    setEditingBlockId(block.id);
    setEditingBlockName(block.labelZh);
  };

  const saveEditBlock = (blockId: string) => {
    const newId = editingBlockName.toLowerCase().replace(/\s+/g, "");
    if (newId !== blockId) {
      // ID changed — migrate all references
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? {
                ...b,
                id: newId,
                label: editingBlockName,
                labelZh: editingBlockName,
              }
            : b,
        ),
      );
      // Update assignments: old blockId → newId
      setAssignments((prev) => {
        const next: Record<string, string> = {};
        Object.entries(prev).forEach(([k, v]) => {
          next[k] = v === blockId ? newId : v;
        });
        return next;
      });
      // Update blockColors: rename key
      setBlockColors((prev) => {
        const next: Record<string, string> = {};
        Object.entries(prev).forEach(([k, v]) => {
          next[k === blockId ? newId : k] = v;
        });
        return next;
      });
      showToast(`已更新為「${editingBlockName}」`);
    } else {
      // Just rename label
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? { ...b, label: editingBlockName, labelZh: editingBlockName }
            : b,
        ),
      );
    }
    setEditingBlockId(null);
  };

  const deleteBlock = (blockId: string) => {
    const firstBlockId = blocks.find((b) => b.id !== blockId)?.id || "general";
    setAssignments((prev) => {
      const next = { ...prev };
      FIXED_KEYS.forEach((k) => {
        if (next[k] === blockId) next[k] = firstBlockId;
      });
      return next;
    });
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    showToast("Block 已刪除");
  };

  const addBlock = () => {
    const id = "custom_" + Date.now();
    const existingNewBlocks = blocks.filter((b) =>
      b.labelZh.startsWith("New Block"),
    ).length;
    const nextNum = existingNewBlocks + 1;
    const label = nextNum === 1 ? "New Block" : `New Block ${nextNum}`;
    const newBlock: Block = { id, label, labelZh: label };
    setBlocks((prev) => [...prev, newBlock]);
    setBlockColors((prev) => ({ ...prev, [id]: "#CCCCCC" }));
    setEditingBlockId(id);
    setEditingBlockName(label);
  };

  // 根據 assignments 分組
  const keysByBlock = blocks.map((b) => ({
    ...b,
    keys: FIXED_KEYS.filter((k) => assignments[k] === b.id),
  }));

  const s = settings.colors;

  const tabs = [
    { id: "general", label: "General" },
    { id: "colors", label: "Colors" },
    { id: "hero", label: "Hero" },
    { id: "navigation", label: "Navigation" },
    { id: "footer", label: "Footer" },
    { id: "content", label: "Content" },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src="/Logo.png" alt="logo" className="h-8" />
          <h1 className="text-lg font-bold text-gray-800">Design Studio</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Logout
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-green-500 text-white hover:bg-green-600"
          >
            <Icons.Save /> Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-amber-500 text-amber-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
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
            {activeTab === "colors" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 mb-2">
                  拖移 Color Key 到不同 Block，即可將該 Color Key
                  的顏色切換為目標 Block 的顏色。
                </p>

                {/* Dynamic Blocks */}
                {keysByBlock.map((block) => (
                  <div
                    key={block.id}
                    className={`border-2 rounded-lg overflow-hidden transition-all ${dragOverBlock === block.id ? "border-amber-400 bg-amber-50 shadow-md" : "border-gray-200 hover:border-amber-300"}`}
                    onDragOver={(e) => handleBlockDragOver(e, block.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={() => handleBlockDrop(block.id)}
                  >
                    {/* Block Header */}
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
                      <div
                        className="w-10 h-10 border-2 border-gray-300 cursor-grab flex-shrink-0 rounded flex items-center justify-center"
                        style={{
                          backgroundColor: blockColors[block.id] || "#CCCCCC",
                        }}
                        title={`${block.labelZh} 主色`}
                      />
                      <div className="flex-1">
                        {editingBlockId === block.id ? (
                          <input
                            type="text"
                            value={editingBlockName}
                            onChange={(e) =>
                              setEditingBlockName(e.target.value)
                            }
                            onBlur={() => saveEditBlock(block.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEditBlock(block.id);
                            }}
                            autoFocus
                            className="w-full px-2 py-0.5 border border-amber-400 text-sm font-bold focus:outline-none rounded"
                          />
                        ) : (
                          <h3
                            className="text-sm font-bold text-gray-800 cursor-pointer hover:text-amber-600"
                            onClick={() => startEditBlock(block)}
                            title="點擊編輯名稱"
                          >
                            {block.labelZh}
                          </h3>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={blockColors[block.id] || "#CCCCCC"}
                          onChange={(e) =>
                            updateBlockColor(block.id, e.target.value)
                          }
                          className="w-7 h-7 border border-gray-300 cursor-pointer rounded"
                        />
                        <input
                          type="text"
                          value={blockColors[block.id] || "#CCCCCC"}
                          onChange={(e) =>
                            updateBlockColor(block.id, e.target.value)
                          }
                          className="w-20 px-1 py-1 border border-gray-300 text-xs focus:outline-none focus:border-amber-500 rounded"
                        />
                      </div>
                      <button
                        onClick={() => deleteBlock(block.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="刪除 Block"
                      >
                        <Icons.Trash />
                      </button>
                    </div>

                    {/* Keys inside this block — draggable */}
                    <div className="px-3 py-2 flex flex-wrap gap-1.5 min-h-[36px]">
                      {block.keys.map((key) => (
                        <div
                          key={key}
                          className={`flex items-center gap-1 border rounded-full px-2.5 py-1 cursor-grab transition-all text-xs font-medium
                            ${
                              draggingKey === key
                                ? "opacity-40 border-amber-400 bg-amber-100"
                                : "border-gray-200 bg-white text-gray-700 hover:border-amber-400 hover:bg-amber-50"
                            }`}
                          draggable
                          onDragStart={() => handleKeyDragStart(key)}
                          title={`${key}：${COLOR_KEY_HINTS[key] || "拖移到其他 Block"}`}
                        >
                          <div
                            className="w-3 h-3 border border-gray-300 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                blockColors[block.id] || "#CCCCCC",
                            }}
                          />
                          <span>{key}</span>
                        </div>
                      ))}
                      {block.keys.length === 0 && (
                        <p className="text-xs text-gray-400 italic py-1">
                          拖移 Color Key 到這裡
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Block Button */}
                <button
                  onClick={addBlock}
                  className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium rounded-lg"
                >
                  <Icons.Plus /> 新增 Block
                </button>

                {/* Drag hint */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-xs text-amber-800 font-medium mb-1">
                    💡 拖移說明
                  </p>
                  <p className="text-xs text-amber-700">
                    拖移任一 Color Key 標籤（如 primary）到其他 Block，該 Color
                    Key 就會套用該 Block 的統一顏色。點擊 Block
                    名稱可重新命名。按 💾 儲存。
                  </p>
                </div>
              </div>
            )}

            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        siteName: e.target.value,
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.logoUrl}
                      onChange={(e) => {
                        setSettings((prev) => ({
                          ...prev,
                          logoUrl: e.target.value,
                        }));
                      }}
                      placeholder="/Logo.png"
                      className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                    />
                    <label className="px-4 py-2 bg-amber-500 text-white text-sm font-medium cursor-pointer hover:bg-amber-600 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mr-1"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      上傳
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              body: formData,
                            });
                            const data = await res.json();
                            if (data.url) {
                              setSettings((prev) => ({
                                ...prev,
                                logoUrl: data.url,
                              }));
                              showToast("Logo 已上傳！");
                            } else {
                              showToast("上傳失敗：" + data.error);
                            }
                          } catch {
                            showToast("上傳失敗");
                          }
                        }}
                      />
                    </label>
                  </div>
                  {settings.logoUrl && (
                    <div className="mt-2 border border-gray-200 rounded p-2 bg-gray-50">
                      <img
                        src={settings.logoUrl}
                        alt="logo preview"
                        className="h-12"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        contactEmail: e.target.value,
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Hero Tab */}
            {activeTab === "hero" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={settings.hero.title}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, title: e.target.value },
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <textarea
                    value={settings.hero.subtitle}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, subtitle: e.target.value },
                      }));
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={settings.hero.ctaText}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, ctaText: e.target.value },
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Navigation Tab — 3 Layer Editor */}
            {activeTab === "navigation" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Layer 1 / 2 / 3 三層導航編輯器
                </p>

                {/* Filter Section Editors — ordered by filterOrder, draggable */}
                <div className="flex items-center gap-3 mb-2 px-2 py-1.5 bg-gray-100 rounded-lg">
                  <span className="text-xs text-gray-500">側邊欄寬度：</span>
                  <input
                    type="number"
                    value={settings.filterSidebarWidth || 256}
                    onChange={(e) => {
                      const v = Math.min(
                        400,
                        Math.max(200, Number(e.target.value)),
                      );
                      setSettings((prev) => ({
                        ...prev,
                        filterSidebarWidth: v,
                      }));
                      setFilterSidebarWidth(v);
                    }}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-gray-500">px</span>
                </div>
                {/* Countries Editor */}
                <FilterEditor
                  section="country"
                  label="Countries（國家選項）"
                  items={settings.countries || []}
                  bg="bg-amber-50"
                  border="border-amber-200"
                  text="text-amber-700"
                  focusColor="amber"
                  draggingTag={draggingTag}
                  overTag={overTag}
                  onDragStart={(item) =>
                    setDraggingTag({ section: "country", item })
                  }
                  onDragOver={(item) => setOverTag(item)}
                  onDrop={(item) => {
                    if (draggingTag && draggingTag.item !== item) {
                      const arr = [...(settings.countries || [])];
                      const fromIdx = arr.indexOf(draggingTag.item);
                      const toIdx = arr.indexOf(item);
                      if (fromIdx !== -1 && toIdx !== -1) {
                        arr.splice(fromIdx, 1);
                        arr.splice(toIdx, 0, draggingTag.item);
                        setSettings((prev) => ({ ...prev, countries: arr }));
                      }
                    }
                    setDraggingTag(null);
                    setOverTag(null);
                  }}
                  onDragEnd={() => {
                    setDraggingTag(null);
                    setOverTag(null);
                  }}
                  onRemove={(item) =>
                    setSettings((prev) => ({
                      ...prev,
                      countries: (prev.countries || []).filter(
                        (x) => x !== item,
                      ),
                    }))
                  }
                  onAdd={(val) =>
                    setSettings((prev) => ({
                      ...prev,
                      countries: [...(prev.countries || []), val],
                    }))
                  }
                  placeholder="新增國家..."
                />

                {/* Brands Editor */}
                <FilterEditor
                  section="brand"
                  label="Brands（品牌選項）"
                  items={settings.brands || []}
                  bg="bg-blue-50"
                  border="border-blue-200"
                  text="text-blue-700"
                  focusColor="blue"
                  draggingTag={draggingTag}
                  overTag={overTag}
                  onDragStart={(item) =>
                    setDraggingTag({ section: "brand", item })
                  }
                  onDragOver={(item) => setOverTag(item)}
                  onDrop={(item) => {
                    if (draggingTag && draggingTag.item !== item) {
                      const arr = [...(settings.brands || [])];
                      const fromIdx = arr.indexOf(draggingTag.item);
                      const toIdx = arr.indexOf(item);
                      if (fromIdx !== -1 && toIdx !== -1) {
                        arr.splice(fromIdx, 1);
                        arr.splice(toIdx, 0, draggingTag.item);
                        setSettings((prev) => ({ ...prev, brands: arr }));
                      }
                    }
                    setDraggingTag(null);
                    setOverTag(null);
                  }}
                  onDragEnd={() => {
                    setDraggingTag(null);
                    setOverTag(null);
                  }}
                  onRemove={(item) =>
                    setSettings((prev) => ({
                      ...prev,
                      brands: (prev.brands || []).filter((x) => x !== item),
                    }))
                  }
                  onAdd={(val) =>
                    setSettings((prev) => ({
                      ...prev,
                      brands: [...(prev.brands || []), val],
                    }))
                  }
                  placeholder="新增品牌..."
                />

                {/* Categories Editor */}
                <FilterEditor
                  section="category"
                  label="Categories（類別選項）"
                  items={settings.categories || []}
                  bg="bg-green-50"
                  border="border-green-200"
                  text="text-green-700"
                  focusColor="green"
                  draggingTag={draggingTag}
                  overTag={overTag}
                  onDragStart={(item) =>
                    setDraggingTag({ section: "category", item })
                  }
                  onDragOver={(item) => setOverTag(item)}
                  onDrop={(item) => {
                    if (draggingTag && draggingTag.item !== item) {
                      const arr = [...(settings.categories || [])];
                      const fromIdx = arr.indexOf(draggingTag.item);
                      const toIdx = arr.indexOf(item);
                      if (fromIdx !== -1 && toIdx !== -1) {
                        arr.splice(fromIdx, 1);
                        arr.splice(toIdx, 0, draggingTag.item);
                        setSettings((prev) => ({ ...prev, categories: arr }));
                      }
                    }
                    setDraggingTag(null);
                    setOverTag(null);
                  }}
                  onDragEnd={() => {
                    setDraggingTag(null);
                    setOverTag(null);
                  }}
                  onRemove={(item) =>
                    setSettings((prev) => ({
                      ...prev,
                      categories: (prev.categories || []).filter(
                        (x) => x !== item,
                      ),
                    }))
                  }
                  onAdd={(val) =>
                    setSettings((prev) => ({
                      ...prev,
                      categories: [...(prev.categories || []), val],
                    }))
                  }
                  placeholder="新增類別..."
                />

                {/* Volumes Editor */}
                <FilterEditor
                  section="volume"
                  label="Volumes（容量選項）"
                  items={settings.volumes || []}
                  bg="bg-purple-50"
                  border="border-purple-200"
                  text="text-purple-700"
                  focusColor="purple"
                  draggingTag={draggingTag}
                  overTag={overTag}
                  onDragStart={(item) =>
                    setDraggingTag({ section: "volume", item })
                  }
                  onDragOver={(item) => setOverTag(item)}
                  onDrop={(item) => {
                    if (draggingTag && draggingTag.item !== item) {
                      const arr = [...(settings.volumes || [])];
                      const fromIdx = arr.indexOf(draggingTag.item);
                      const toIdx = arr.indexOf(item);
                      if (fromIdx !== -1 && toIdx !== -1) {
                        arr.splice(fromIdx, 1);
                        arr.splice(toIdx, 0, draggingTag.item);
                        setSettings((prev) => ({ ...prev, volumes: arr }));
                      }
                    }
                    setDraggingTag(null);
                    setOverTag(null);
                  }}
                  onDragEnd={() => {
                    setDraggingTag(null);
                    setOverTag(null);
                  }}
                  onRemove={(item) =>
                    setSettings((prev) => ({
                      ...prev,
                      volumes: (prev.volumes || []).filter((x) => x !== item),
                    }))
                  }
                  onAdd={(val) =>
                    setSettings((prev) => ({
                      ...prev,
                      volumes: [...(prev.volumes || []), val],
                    }))
                  }
                  placeholder="新增容量..."
                />

                {settings.navigation.map((item, l1Index) => (
                  <div
                    key={l1Index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Layer 1 */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
                      <span className="text-xs font-bold text-gray-400 w-8 flex-shrink-0">
                        L1
                      </span>
                      <button
                        onClick={() => {
                          const n = settings.navigation.filter(
                            (_, i) => i !== l1Index,
                          );
                          setSettings((prev) => ({ ...prev, navigation: n }));
                        }}
                        className="p-0.5 text-gray-400 hover:text-red-500 shrink-0"
                      >
                        <Icons.Trash />
                      </button>
                      <button
                        onClick={() => {
                          const n = [...settings.navigation];
                          n[l1Index].enabled = !n[l1Index].enabled;
                          setSettings((prev) => ({ ...prev, navigation: n }));
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${item.enabled !== false ? "bg-amber-500" : "bg-gray-300"}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${item.enabled !== false ? "translate-x-4" : "translate-x-1"}`}
                        />
                      </button>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const n = [...settings.navigation];
                          n[l1Index].label = e.target.value;
                          setSettings((prev) => ({ ...prev, navigation: n }));
                        }}
                        className={`flex-1 px-2 py-1 border text-sm font-medium focus:outline-none focus:border-amber-500 rounded ${item.enabled !== false ? "border-gray-300" : "border-gray-200 bg-gray-50 opacity-50"}`}
                      />
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => {
                          const n = [...settings.navigation];
                          n[l1Index].href = e.target.value;
                          setSettings((prev) => ({ ...prev, navigation: n }));
                        }}
                        className={`w-40 px-2 py-1 border text-xs focus:outline-none focus:border-amber-500 rounded ${item.enabled !== false ? "border-gray-300" : "border-gray-200 bg-gray-50 opacity-50"}`}
                      />
                    </div>

                    {/* Layer 2 */}
                    {item.sub &&
                      item.sub.map((l2, l2Index) => (
                        <div key={l2Index} className="border-t border-gray-100">
                          <div className="flex items-center gap-2 px-3 py-1.5 pl-8 bg-gray-25">
                            <span className="text-xs font-bold text-gray-400 w-8 flex-shrink-0">
                              L2
                            </span>
                            <button
                              onClick={() => {
                                const n = [...settings.navigation];
                                n[l1Index].sub = n[l1Index].sub!.filter(
                                  (_, i) => i !== l2Index,
                                );
                                setSettings((prev) => ({
                                  ...prev,
                                  navigation: n,
                                }));
                              }}
                              className="p-0.5 text-gray-400 hover:text-red-500 shrink-0"
                            >
                              <Icons.Trash />
                            </button>
                            <button
                              onClick={() => {
                                const n = [...settings.navigation];
                                n[l1Index].sub![l2Index].enabled =
                                  !n[l1Index].sub![l2Index].enabled;
                                setSettings((prev) => ({
                                  ...prev,
                                  navigation: n,
                                }));
                              }}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${l2.enabled !== false ? "bg-amber-500" : "bg-gray-300"}`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${l2.enabled !== false ? "translate-x-4" : "translate-x-1"}`}
                              />
                            </button>
                            <input
                              type="text"
                              value={l2.label}
                              onChange={(e) => {
                                const n = [...settings.navigation];
                                n[l1Index].sub![l2Index].label = e.target.value;
                                setSettings((prev) => ({
                                  ...prev,
                                  navigation: n,
                                }));
                              }}
                              className={`flex-1 px-2 py-1 border text-xs font-medium focus:outline-none focus:border-amber-500 rounded ${l2.enabled !== false ? "border-gray-200" : "border-gray-200 bg-gray-50 opacity-50"}`}
                            />
                            <input
                              type="text"
                              value={l2.href || ""}
                              onChange={(e) => {
                                const n = [...settings.navigation];
                                n[l1Index].sub![l2Index].href = e.target.value;
                                setSettings((prev) => ({
                                  ...prev,
                                  navigation: n,
                                }));
                              }}
                              className={`w-40 px-2 py-1 border text-xs focus:outline-none focus:border-amber-500 rounded ${l2.enabled !== false ? "border-gray-200" : "border-gray-200 bg-gray-50 opacity-50"}`}
                            />
                          </div>

                          {/* Layer 3 */}
                          {l2.sub &&
                            l2.sub.map((l3, l3Index) => (
                              <div
                                key={l3Index}
                                className="flex items-center gap-2 px-3 py-1 pl-16 border-t border-gray-50"
                              >
                                <span className="text-xs font-bold text-gray-400 w-8 flex-shrink-0">
                                  L3
                                </span>
                                <button
                                  onClick={() => {
                                    const n = [...settings.navigation];
                                    n[l1Index].sub![l2Index].sub = n[
                                      l1Index
                                    ].sub![l2Index].sub!.filter(
                                      (_, i) => i !== l3Index,
                                    );
                                    setSettings((prev) => ({
                                      ...prev,
                                      navigation: n,
                                    }));
                                  }}
                                  className="p-0.5 text-gray-400 hover:text-red-500 shrink-0"
                                >
                                  <Icons.Trash />
                                </button>
                                <button
                                  onClick={() => {
                                    const n = [...settings.navigation];
                                    n[l1Index].sub![l2Index].sub![
                                      l3Index
                                    ].enabled =
                                      !n[l1Index].sub![l2Index].sub![l3Index]
                                        .enabled;
                                    setSettings((prev) => ({
                                      ...prev,
                                      navigation: n,
                                    }));
                                  }}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${l3.enabled !== false ? "bg-amber-500" : "bg-gray-300"}`}
                                >
                                  <span
                                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${l3.enabled !== false ? "translate-x-4" : "translate-x-1"}`}
                                  />
                                </button>
                                <input
                                  type="text"
                                  value={l3.label}
                                  onChange={(e) => {
                                    const n = [...settings.navigation];
                                    n[l1Index].sub![l2Index].sub![
                                      l3Index
                                    ].label = e.target.value;
                                    setSettings((prev) => ({
                                      ...prev,
                                      navigation: n,
                                    }));
                                  }}
                                  className={`flex-1 px-2 py-0.5 border text-xs focus:outline-none focus:border-amber-500 rounded ${l3.enabled !== false ? "border-gray-200" : "border-gray-200 bg-gray-50 opacity-50"}`}
                                />
                                <input
                                  type="text"
                                  value={l3.href}
                                  onChange={(e) => {
                                    const n = [...settings.navigation];
                                    n[l1Index].sub![l2Index].sub![
                                      l3Index
                                    ].href = e.target.value;
                                    setSettings((prev) => ({
                                      ...prev,
                                      navigation: n,
                                    }));
                                  }}
                                  className={`w-40 px-2 py-0.5 border text-xs focus:outline-none focus:border-amber-500 rounded ${l3.enabled !== false ? "border-gray-200" : "border-gray-200 bg-gray-50 opacity-50"}`}
                                />
                              </div>
                            ))}
                          <div className="px-3 pl-16 py-1 border-t border-gray-50">
                            <button
                              onClick={() => {
                                const n = [...settings.navigation];
                                if (!n[l1Index].sub![l2Index].sub)
                                  n[l1Index].sub![l2Index].sub = [];
                                n[l1Index].sub![l2Index].sub!.push({
                                  label: "New Brand",
                                  href: "/shop?brand=new-brand",
                                });
                                setSettings((prev) => ({
                                  ...prev,
                                  navigation: n,
                                }));
                              }}
                              className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
                            >
                              <Icons.Plus /> 新增 L3 品牌
                            </button>
                          </div>
                        </div>
                      ))}

                    <div className="px-3 py-1.5 pl-8 border-t border-gray-100">
                      <button
                        onClick={() => {
                          const n = [...settings.navigation];
                          if (!n[l1Index].sub) n[l1Index].sub = [];
                          n[l1Index].sub!.push({
                            label: "New Group",
                            href: "",
                            sub: [],
                          });
                          setSettings((prev) => ({ ...prev, navigation: n }));
                        }}
                        className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
                      >
                        <Icons.Plus /> 新增 L2 分組
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      navigation: [
                        ...prev.navigation,
                        { label: "New Item", href: "#", sub: [] },
                      ],
                    }));
                  }}
                  className="w-full py-2 text-sm text-amber-600 border border-amber-300 hover:bg-amber-50 flex items-center justify-center gap-1 rounded-lg"
                >
                  <Icons.Plus /> 新增 L1 導航
                </button>
              </div>
            )}

            {/* Footer Tab */}
            {activeTab === "footer" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings?.footer?.logoUrl || ""}
                      onChange={(e) => {
                        setSettings((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, logoUrl: e.target.value },
                        }));
                      }}
                      placeholder="/Logo.png"
                      className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                    />
                    <label className="px-4 py-2 bg-amber-500 text-white text-sm font-medium cursor-pointer hover:bg-amber-600 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mr-1"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      上傳
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              body: formData,
                            });
                            const data = await res.json();
                            if (data.url) {
                              setSettings((prev) => ({
                                ...prev,
                                footer: { ...prev.footer, logoUrl: data.url },
                              }));
                              showToast("Logo 已上傳！");
                            } else {
                              showToast("上傳失敗：" + data.error);
                            }
                          } catch {
                            showToast("上傳失敗");
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                {settings?.footer?.logoUrl && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Logo 尺寸（px）
                        </label>
                        <button
                          onClick={() => {
                            setSettings((prev) => ({
                              ...prev,
                              footer: {
                                ...prev.footer,
                                logoAspectLocked: !prev.footer.logoAspectLocked,
                              },
                            }));
                          }}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${settings?.footer?.logoAspectLocked ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}
                          title={
                            settings?.footer?.logoAspectLocked
                              ? "已鎖定比例，點擊解鎖"
                              : "未鎖定比例，點擊鎖定"
                          }
                        >
                          {settings?.footer?.logoAspectLocked ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                              />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                              />
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            </svg>
                          )}
                          {settings?.footer?.logoAspectLocked
                            ? "比例鎖定"
                            : "比例解鎖"}
                        </button>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">W</span>
                          <input
                            type="number"
                            value={settings?.footer?.logoWidth || 120}
                            min={20}
                            max={400}
                            onChange={(e) => {
                              const newW = Number(e.target.value);
                              setSettings((prev) => {
                                const aspectRatio =
                                  (prev.footer.logoWidth || 120) /
                                  (prev.footer.logoHeight || 40);
                                return {
                                  ...prev,
                                  footer: {
                                    ...prev.footer,
                                    logoWidth: newW,
                                    logoHeight: prev.footer.logoAspectLocked
                                      ? Math.round(newW / aspectRatio)
                                      : prev.footer.logoHeight,
                                  },
                                };
                              });
                            }}
                            className="w-20 px-2 py-2 border border-gray-300 focus:outline-none focus:border-amber-500 text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">H</span>
                          <input
                            type="number"
                            value={settings?.footer?.logoHeight || 40}
                            min={20}
                            max={200}
                            onChange={(e) => {
                              const newH = Number(e.target.value);
                              setSettings((prev) => {
                                const aspectRatio =
                                  (prev.footer.logoWidth || 120) /
                                  (prev.footer.logoHeight || 40);
                                return {
                                  ...prev,
                                  footer: {
                                    ...prev.footer,
                                    logoHeight: newH,
                                    logoWidth: prev.footer.logoAspectLocked
                                      ? Math.round(newH * aspectRatio)
                                      : prev.footer.logoWidth,
                                  },
                                };
                              });
                            }}
                            className="w-20 px-2 py-2 border border-gray-300 focus:outline-none focus:border-amber-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        預覽
                      </label>
                      <div
                        className="border border-gray-200 rounded p-3 bg-gray-50 flex items-center justify-center"
                        style={{ minHeight: 60 }}
                      >
                        <img
                          src={settings.footer.logoUrl}
                          alt="footer logo preview"
                          style={{
                            width: settings.footer.logoWidth || 120,
                            height: settings.footer.logoHeight || 40,
                            objectFit: "contain",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={settings?.footer?.brand}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, brand: e.target.value },
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={settings?.footer?.description}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, description: e.target.value },
                      }));
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Footer Columns — L1 + L2 hierarchical editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Footer 欄位（分層）
                    </label>
                    <button
                      onClick={() => {
                        setSettings((prev) => {
                          const cols = [...(prev.footer.columns || [])];
                          const nextNum = cols.length + 1;
                          return {
                            ...prev,
                            footer: {
                              ...prev.footer,
                              columns: [
                                ...cols,
                                {
                                  title: `New Column ${nextNum}`,
                                  links: [
                                    {
                                      label: `New Link ${nextNum}-1`,
                                      content: "",
                                    },
                                  ],
                                },
                              ],
                            },
                          };
                        });
                        showToast("已新增欄位");
                      }}
                      className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded hover:bg-amber-200 transition-colors"
                    >
                      + 新增欄位
                    </button>
                  </div>
                  {/* L2 編輯彈窗寬度調整 */}
                  <div className="flex items-center gap-3 mb-2 px-2 py-1.5 bg-gray-100 rounded-lg">
                    <span className="text-xs text-gray-500">彈窗寬度：</span>
                    <input
                      type="number"
                      value={settings.footer.modalWidth || 600}
                      onChange={(e) => {
                        const v = Math.min(
                          900,
                          Math.max(400, Number(e.target.value)),
                        );
                        setSettings((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, modalWidth: v },
                        }));
                      }}
                      className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-xs text-gray-500">px</span>
                  </div>
                  <div className="space-y-4">
                    {(settings?.footer?.columns || []).map((col, ci) => (
                      <div
                        key={ci}
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                      >
                        {/* L1: Column title — display only */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-medium">
                              L1
                            </span>
                            <input
                              type="text"
                              value={col.title}
                              onChange={(e) => {
                                setSettings((prev) => {
                                  const cols = [...(prev.footer.columns || [])];
                                  cols[ci] = {
                                    ...cols[ci],
                                    title: e.target.value,
                                  };
                                  return {
                                    ...prev,
                                    footer: { ...prev.footer, columns: cols },
                                  };
                                });
                              }}
                              className="flex-1 px-2 py-1 text-sm font-semibold border border-gray-200 rounded focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <button
                            onClick={() => {
                              setSettings((prev) => {
                                const cols = [...(prev.footer.columns || [])];
                                cols.splice(ci, 1);
                                return {
                                  ...prev,
                                  footer: { ...prev.footer, columns: cols },
                                };
                              });
                              showToast("欄位已移除");
                            }}
                            className="px-2 py-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>
                        {/* L2: Individual link buttons */}
                        <div className="mt-2">
                          <div className="flex items-center gap-1 mb-2">
                            <span className="text-xs text-gray-400 font-medium">
                              L2
                            </span>
                            <span className="text-xs text-gray-400">
                              （點擊編輯）
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(col.links || []).map(
                              (linkItem: any, li: number) => (
                                <button
                                  key={li}
                                  onClick={() =>
                                    setFooterLinksModal({
                                      colIndex: ci,
                                      linkIndex: li,
                                      colTitle: col.title,
                                      linkLabel: linkItem.label,
                                    })
                                  }
                                  className="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs rounded-lg hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center gap-1.5"
                                >
                                  <span className="max-w-20 truncate">
                                    {linkItem.label}
                                  </span>
                                  {linkItem.content && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSettings((prev) => {
                                        const cols = [
                                          ...(prev.footer.columns || []),
                                        ];
                                        const newLinks = [
                                          ...(cols[ci].links || []),
                                        ];
                                        newLinks.splice(li, 1);
                                        cols[ci] = {
                                          ...cols[ci],
                                          links: newLinks,
                                        };
                                        return {
                                          ...prev,
                                          footer: {
                                            ...prev.footer,
                                            columns: cols,
                                          },
                                        };
                                      });
                                      showToast("已移除");
                                    }}
                                    className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="11"
                                      height="11"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                  </button>
                                </button>
                              ),
                            )}
                            <button
                              onClick={() => {
                                setSettings((prev) => {
                                  const cols = [...(prev.footer.columns || [])];
                                  const newLinks = [...(cols[ci].links || [])];
                                  const nextLinkNum = newLinks.length + 1;
                                  newLinks.push({
                                    label: `New Link ${ci + 1}-${nextLinkNum}`,
                                    content: "",
                                  });
                                  cols[ci] = { ...cols[ci], links: newLinks };
                                  return {
                                    ...prev,
                                    footer: { ...prev.footer, columns: cols },
                                  };
                                });
                                showToast("已新增連結");
                              }}
                              className="px-2.5 py-1.5 border border-dashed border-gray-300 text-gray-400 text-xs rounded-lg hover:border-amber-400 hover:text-amber-600 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* UBN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UBN
                  </label>
                  <input
                    type="text"
                    value={settings.footer.ubn || ""}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, ubn: e.target.value },
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Copyright */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Copyright 文字
                  </label>
                  <input
                    type="text"
                    value={settings?.footer?.copyright || ""}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, copyright: e.target.value },
                      }));
                    }}
                    placeholder="© 2026 wishliquor.co All rights reserved."
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Payment Icons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Icons 支付圖示
                  </label>
                  <div className="space-y-2">
                    {(settings.footer?.paymentIcons || [])
                      .sort((a, b) => a.order - b.order)
                      .map((icon, idx) => (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                          <div
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData("text/plain", icon.id);
                              setDraggingIcon(icon.id);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                              setOverIcon(icon.id);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const draggedId =
                                e.dataTransfer.getData("text/plain");
                              if (!draggedId || draggedId === icon.id) return;
                              setSettings((prev) => {
                                const icons = [
                                  ...(prev.footer?.paymentIcons || []),
                                ];
                                const fromIdx = icons.findIndex(
                                  (i) => i.id === draggedId,
                                );
                                const toIdx = icons.findIndex(
                                  (i) => i.id === icon.id,
                                );
                                if (fromIdx < 0 || toIdx < 0) return prev;
                                const temp = icons[fromIdx].order;
                                icons[fromIdx].order = icons[toIdx].order;
                                icons[toIdx].order = temp;
                                return {
                                  ...prev,
                                  footer: {
                                    ...prev.footer,
                                    paymentIcons: icons,
                                  },
                                };
                              });
                              setDraggingIcon(null);
                              setOverIcon(null);
                            }}
                            onDragEnd={() => {
                              setDraggingIcon(null);
                              setOverIcon(null);
                            }}
                            className={`flex items-center gap-1 cursor-grab select-none transition-all ${draggingIcon === icon.id ? "opacity-30" : ""} ${overIcon === icon.id && draggingIcon !== icon.id ? "ring-2 ring-amber-400 rounded" : ""}`}
                          >
                            <span className="text-gray-300 text-xs">⠿</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSettings((prev) => {
                                  const icons = [
                                    ...(prev.footer?.paymentIcons || []),
                                  ];
                                  icons[
                                    icons.findIndex((i) => i.id === icon.id)
                                  ] = { ...icon, visible: !icon.visible };
                                  return {
                                    ...prev,
                                    footer: {
                                      ...prev.footer,
                                      paymentIcons: icons,
                                    },
                                  };
                                });
                              }}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${icon.visible ? "bg-amber-500" : "bg-gray-300"}`}
                              title={icon.visible ? "隱藏" : "顯示"}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${icon.visible ? "translate-x-4" : "translate-x-0.5"}`}
                              ></span>
                            </button>
                            <img
                              src={icon.src}
                              alt={icon.id}
                              className="h-6 w-auto"
                            />
                            <input
                              type="number"
                              min="10"
                              max="200"
                              value={icon.width}
                              onChange={(e) => {
                                setSettings((prev) => {
                                  const icons = [
                                    ...(prev.footer?.paymentIcons || []),
                                  ];
                                  const idx = icons.findIndex(
                                    (i) => i.id === icon.id,
                                  );
                                  const newWidth = Math.max(
                                    10,
                                    Math.min(200, Number(e.target.value)),
                                  );
                                  icons[idx] = {
                                    ...icon,
                                    width: newWidth,
                                    height: icon.aspectLocked
                                      ? Math.round(newWidth * 0.4)
                                      : icon.height,
                                  };
                                  return {
                                    ...prev,
                                    footer: {
                                      ...prev.footer,
                                      paymentIcons: icons,
                                    },
                                  };
                                });
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-16 px-2 py-1 text-sm border rounded"
                              title="寬度"
                            />
                            <span className="text-xs text-gray-500">x</span>
                            <input
                              type="number"
                              min="10"
                              max="200"
                              value={
                                icon.height || Math.round(icon.width * 0.4)
                              }
                              onChange={(e) => {
                                if (icon.aspectLocked) return;
                                setSettings((prev) => {
                                  const icons = [
                                    ...(prev.footer?.paymentIcons || []),
                                  ];
                                  const idx = icons.findIndex(
                                    (i) => i.id === icon.id,
                                  );
                                  icons[idx] = {
                                    ...icon,
                                    height: Math.max(
                                      10,
                                      Math.min(200, Number(e.target.value)),
                                    ),
                                  };
                                  return {
                                    ...prev,
                                    footer: {
                                      ...prev.footer,
                                      paymentIcons: icons,
                                    },
                                  };
                                });
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={`w-16 px-2 py-1 text-sm border rounded ${icon.aspectLocked ? "bg-gray-100 cursor-not-allowed" : ""}`}
                              disabled={icon.aspectLocked}
                              title="高度"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSettings((prev) => {
                                  const icons = [
                                    ...(prev.footer?.paymentIcons || []),
                                  ];
                                  const idx = icons.findIndex(
                                    (i) => i.id === icon.id,
                                  );
                                  icons[idx] = {
                                    ...icon,
                                    aspectLocked: !icon.aspectLocked,
                                    height: !icon.aspectLocked
                                      ? Math.round(icon.width * 0.4)
                                      : icon.height,
                                  };
                                  return {
                                    ...prev,
                                    footer: {
                                      ...prev.footer,
                                      paymentIcons: icons,
                                    },
                                  };
                                });
                              }}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${icon.aspectLocked ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}`}
                              title={
                                icon.aspectLocked
                                  ? "已鎖定比例，點擊解鎖"
                                  : "鎖定比例"
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect
                                  x="3"
                                  y="11"
                                  width="18"
                                  height="11"
                                  rx="2"
                                  ry="2"
                                ></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                              </svg>
                              比例
                            </button>
                            <label
                              className="px-2 py-1 bg-amber-500 text-white text-xs font-medium cursor-pointer hover:bg-amber-600 flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="mr-1"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                              </svg>
                              上傳
                              <input
                                accept="image/*"
                                className="hidden"
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      setSettings((prev) => {
                                        const icons = [
                                          ...(prev.footer?.paymentIcons || []),
                                        ];
                                        const idx = icons.findIndex(
                                          (i) => i.id === icon.id,
                                        );
                                        icons[idx] = {
                                          ...icon,
                                          src: ev.target?.result as string,
                                        };
                                        return {
                                          ...prev,
                                          footer: {
                                            ...prev.footer,
                                            paymentIcons: icons,
                                          },
                                        };
                                      });
                                      reader.readAsDataURL(file);
                                    };
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Title（Browser Tab）
                  </label>
                  <input
                    type="text"
                    value={settings?.content?.pageTitle || ""}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        content: { ...prev.content, pageTitle: e.target.value },
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Description（SEO Meta）
                  </label>
                  <textarea
                    value={settings?.content?.pageDescription || ""}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          pageDescription: e.target.value,
                        },
                      }));
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Featured Section Title
                  </label>
                  <input
                    type="text"
                    value={settings?.content?.featuredTitle || ""}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          featuredTitle: e.target.value,
                        },
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Featured Section Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings?.content?.featuredSubtitle || ""}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          featuredSubtitle: e.target.value,
                        },
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About Section Title
                  </label>
                  <input
                    type="text"
                    value={settings?.content?.aboutTitle || ""}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          aboutTitle: e.target.value,
                        },
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About Section Text
                  </label>
                  <textarea
                    value={settings?.content?.aboutText || ""}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        content: { ...prev.content, aboutText: e.target.value },
                      }));
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview (2/3) */}
        <div
          className="w-2/3 overflow-y-auto"
          style={{ backgroundColor: "#E5E7EB" }}
        >
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Live Preview — {tabs.find((t) => t.id === activeTab)?.label}
            </span>
            <div className="flex gap-3">
              <a
                href="/"
                target="_blank"
                className="text-sm text-amber-600 hover:underline"
              >
                Open Site ↗
              </a>
              <a
                href="/admin"
                target="_blank"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Admin ↗
              </a>
            </div>
          </div>

          <div
            style={{
              backgroundColor: s.background,
              color: s.text,
              minHeight: "calc(100vh - 110px)",
            }}
          >
            {/* Header */}
            <header
              style={{
                backgroundColor: s.background,
                borderBottom: `1px solid ${s.cardBorder || "#E5E7EB"}`,
              }}
            >
              <div className="max-w-6xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <a href="/" className="flex items-center gap-3">
                    <img src={settings.logoUrl} alt="logo" className="h-10" />
                  </a>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button
                      title="buttonPrimary"
                      style={{
                        backgroundColor: s.buttonPrimary,
                        color: "#fff",
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>
              <nav
                title="navBackground"
                style={{ backgroundColor: s.navBackground }}
              >
                <div className="max-w-6xl mx-auto px-4">
                  <div className="flex gap-1 py-2 overflow-x-auto">
                    {settings.navigation.map((item, i) => (
                      <a
                        key={i}
                        href={item.href}
                        title="navText"
                        className="px-3 py-1 text-sm whitespace-nowrap transition-colors"
                        style={{ color: s.navText }}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
                <div
                  title="navDropdownBg"
                  className="max-w-6xl mx-auto px-4 pb-3"
                >
                  <div
                    className="grid grid-cols-5 gap-4 py-2"
                    style={{ backgroundColor: s.navDropdownBg }}
                  >
                    {[
                      {
                        label: "Scotland",
                        brands: [
                          "Macallan",
                          "Octomore",
                          "Johnnie Walker",
                          "Royal Salute",
                        ],
                      },
                      {
                        label: "Japanese",
                        brands: ["Yamazaki", "Hakushu", "Hibiki"],
                      },
                      {
                        label: "American",
                        brands: ["W.L. Weller", "Jack Daniel's"],
                      },
                      { label: "Taiwan", brands: ["Kavalan", "Omar"] },
                      { label: "More", brands: ["Gin", "Rum", "Wine"] },
                    ].map((col, i) => (
                      <div key={i}>
                        <h4
                          title="navDropdownLabel"
                          className="text-xs font-bold uppercase tracking-wide mb-2"
                          style={{ color: s.navDropdownLabel }}
                        >
                          {col.label}
                        </h4>
                        {col.brands.map((brand, j) => (
                          <a
                            key={j}
                            href="#"
                            title="navDropdownText"
                            className="block px-2 py-1 text-sm"
                            style={{ color: s.navDropdownText }}
                          >
                            {brand}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </nav>
            </header>

            {/* Hero */}
            <section
              title="heroBackground"
              className="text-center py-12 px-4"
              style={{ backgroundColor: s.heroBackground || s.background }}
            >
              <h1
                title="heroText"
                className="text-2xl lg:text-3xl font-bold mb-3"
                style={{ color: s.heroText || s.text }}
              >
                {settings.hero.title}
              </h1>
              <p
                className="max-w-xl mx-auto mb-6"
                style={{ color: s.footerMuted }}
              >
                {settings.hero.subtitle}
              </p>
              <button
                title="heroAccent"
                style={{
                  backgroundColor: s.heroAccent || s.buttonPrimary,
                  color: "#fff",
                }}
                className="px-6 py-3 font-semibold"
              >
                {settings.hero.ctaText}
              </button>
            </section>

            {/* Products */}
            <section className="px-4 pb-8">
              <div className="max-w-6xl mx-auto">
                <h3
                  title="text"
                  className="text-sm font-semibold mb-4"
                  style={{ color: s.text }}
                >
                  Featured Products
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { name: "Macallan 12Y", country: "Scotland", price: 169 },
                    { name: "Yamazaki 18Y", country: "Japan", price: 399 },
                    { name: "Kavalan Concert", country: "Taiwan", price: 89 },
                    { name: "Glenlivet 15Y", country: "Scotland", price: 149 },
                  ].map((p, i) => (
                    <div
                      key={i}
                      title="cardBackground/cardBorder"
                      className="border"
                      style={{
                        backgroundColor: s.cardBackground,
                        borderColor: s.cardBorder,
                      }}
                    >
                      <div className="aspect-square bg-gray-100" />
                      <div className="p-3">
                        <p
                          title="accent"
                          className="text-xs font-semibold"
                          style={{ color: s.accent }}
                        >
                          {p.country}
                        </p>
                        <p
                          title="text"
                          className="text-sm font-medium truncate"
                          style={{ color: s.text }}
                        >
                          {p.name}
                        </p>
                        <p
                          title="text"
                          className="text-sm font-bold"
                          style={{ color: s.text }}
                        >
                          ${p.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer
              title="footerBackground"
              style={{
                backgroundColor: s.footerBackground,
                borderTop: `1px solid ${s.cardBorder || "#E5E7EB"}`,
              }}
              className="px-4 py-8 mt-8"
            >
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-4 gap-8">
                  {/* Logo + Brand Info */}
                  <div className="text-left">
                    {settings?.footer?.logoUrl && (
                      <img
                        src={settings.footer.logoUrl}
                        alt="footer logo"
                        className="h-auto w-full lg:w-auto mb-3"
                        style={{
                          height: settings.footer.logoHeight || 40,
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <h4
                      title="footerText"
                      className="font-semibold mb-1"
                      style={{ color: s.footerText }}
                    >
                      {settings?.footer?.brand}
                    </h4>
                    <p
                      title="footerMuted"
                      className="text-sm"
                      style={{ color: s.footerMuted }}
                    >
                      {settings?.footer?.description}
                    </p>
                    <p
                      title="footerMuted"
                      className="text-sm mt-1"
                      style={{ color: s.footerMuted }}
                    >
                      {settings.contactEmail}
                    </p>
                  </div>
                  {(settings?.footer?.columns || []).map((col, i) => (
                    <div key={i}>
                      <h4
                        title="footerText"
                        className="text-sm font-semibold mb-2"
                        style={{ color: s.footerText }}
                      >
                        {col.title}
                      </h4>
                      {(col.links || []).map((linkItem: any, li: number) => (
                        <p
                          key={li}
                          title="footerMuted"
                          className="text-sm"
                          style={{ color: s.footerMuted }}
                        >
                          {linkItem.label}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
                <p
                  title="footerMuted"
                  className="text-center text-sm mt-8"
                  style={{ color: s.footerMuted }}
                >
                  {settings.footer.copyright ||
                    `© 2026 ${settings.siteName} All rights reserved.`}
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Footer Links Modal */}
      <AnimatePresence>
        {footerLinksModal !== null &&
          (() => {
            const colIndex = footerLinksModal.colIndex;
            const linkIndex = footerLinksModal.linkIndex;
            const col = settings?.footer?.columns?.[colIndex];
            const linkItem = col?.links?.[linkIndex];
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="relative rounded-none shadow-2xl overflow-hidden"
                  style={{
                    backgroundColor: s.background || "#ffffff",
                    width: settings.footer.modalWidth || 600,
                    maxWidth: "90vw",
                    maxHeight: "85vh",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setFooterLinksModal(null)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: s.cardBackground || "#ffffff" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 256 256"
                      fill="currentColor"
                    >
                      <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
                    </svg>
                  </button>

                  {/* Modal body */}
                  <div className="p-6 md:p-8 flex flex-col justify-center overflow-y-auto">
                    {/* L2 Label */}
                    <div className="mb-4">
                      <label
                        className="block text-xs font-semibold uppercase tracking-wide mb-2"
                        style={{ color: s.primary || "#DC2626" }}
                      >
                        L2 標題
                      </label>
                      <input
                        type="text"
                        value={linkItem?.label || ""}
                        onChange={(e) => {
                          setSettings((prev) => {
                            const cols = [...(prev.footer.columns || [])];
                            const newLinks = [...(cols[colIndex].links || [])];
                            newLinks[linkIndex] = {
                              ...newLinks[linkIndex],
                              label: e.target.value,
                            };
                            cols[colIndex] = {
                              ...cols[colIndex],
                              links: newLinks,
                            };
                            return {
                              ...prev,
                              footer: { ...prev.footer, columns: cols },
                            };
                          });
                        }}
                        className="w-full px-4 py-2.5 border-2 rounded-lg text-sm font-semibold outline-none"
                        style={{
                          borderColor: s.primary || "#DC2626",
                          color: s.text,
                        }}
                      />
                    </div>

                    {/* Rich Text Editor Toolbar */}
                    <div
                      className="flex items-center gap-1 mb-2 p-2 border rounded-lg"
                      style={{
                        borderColor: s.cardBorder || "#D1D5DB",
                        backgroundColor: s.cardBackground || "#F9FAFB",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => document.execCommand("bold", false)}
                        className="p-1.5 rounded hover:bg-gray-200 font-bold"
                        title="粗體"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => document.execCommand("italic", false)}
                        className="p-1.5 rounded hover:bg-gray-200 italic"
                        title="斜體"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => document.execCommand("underline", false)}
                        className="p-1.5 rounded hover:bg-gray-200 underline"
                        title="底線"
                      >
                        U
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1" />
                      <input
                        type="color"
                        id="rt-color-picker"
                        className="w-8 h-8 rounded cursor-pointer"
                        title="文字顏色"
                        defaultValue="#000000"
                        onChange={(e) =>
                          document.execCommand(
                            "foreColor",
                            false,
                            e.target.value,
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt("輸入連結網址:");
                          if (url)
                            document.execCommand("createLink", false, url);
                        }}
                        className="p-1.5 rounded hover:bg-gray-200"
                        title="加入連結"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 256 256"
                          fill="currentColor"
                        >
                          <path d="M137.54,186.36a8,8,0,0,1,0,11.31l-9.94,10A56,56,0,0,1,48.38,128.4L72.5,104.28A56,56,0,0,1,149.31,102a8,8,0,1,1-10.64,12,40,40,0,0,0-54.85,1.63L59.7,139.72a40,40,0,0,0,56.58,56.58l9.94-9.94A8,8,0,0,1,137.54,186.36Zm70.08-138a56.08,56.08,0,0,0-79.22,0l-9.94,9.95a8,8,0,0,0,11.32,11.31l9.94-9.94a40,40,0,0,1,56.58,56.58L172.18,140a40,40,0,0,1-54.85,1.63,8,8,0,1,0-10.64,12,56,56,0,0,0,76.81-2.63l24.12-24.12A56.08,56.08,0,0,0,207.62,48.38Z" />
                        </svg>
                      </button>
                    </div>
                    {/* Rich Text Area */}
                    <div
                      ref={(el) => {
                        if (el) {
                          el.innerHTML = linkItem?.content || "";
                          el.addEventListener("input", () => {
                            setSettings((prev) => {
                              const cols = [...(prev.footer.columns || [])];
                              const newLinks = [
                                ...(cols[colIndex].links || []),
                              ];
                              newLinks[linkIndex] = {
                                ...newLinks[linkIndex],
                                content: el.innerHTML,
                              };
                              cols[colIndex] = {
                                ...cols[colIndex],
                                links: newLinks,
                              };
                              return {
                                ...prev,
                                footer: { ...prev.footer, columns: cols },
                              };
                            });
                          });
                          el.contentEditable = "true";
                        }
                      }}
                      className="w-full min-h-[200px] max-h-60 px-3 py-2.5 border rounded-lg text-sm outline-none leading-relaxed overflow-y-auto"
                      style={{
                        borderColor: s.cardBorder || "#D1D5DB",
                        color: s.text,
                      }}
                      suppressContentEditableWarning
                    />
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium shadow-lg flex items-center gap-2"
          >
            <Icons.Check /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
