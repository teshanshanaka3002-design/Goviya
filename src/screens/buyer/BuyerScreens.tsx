import React, { useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Star,
  Plus,
  Minus,
  Trash2,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  Truck,
  ArrowRight,
  Send,
  CreditCard,
  Banknote,
  Smartphone,
  Info,
  Calendar,
  Layers,
  Check,
  Clock,
  Navigation,
  X,
  ShoppingBag,
  Sparkles,
  Compass,
  Crosshair,
  ChevronDown,
  ChevronUp,
  User,
  ChevronRight,
  Bell,
  Globe,
  HelpCircle,
  AlertTriangle,
  FileText,
  Heart,
  Receipt,
  LogOut,
  LogIn,
  Edit3,
  Lock,
  Package,
  Download,
  CheckCircle2,
  Mail,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../services/store';
import { ProductCard } from '../../components/shared/ProductCard';
import { SriLankaMap } from '../../components/shared/SriLankaMap';
import { Input, SearchBar } from '../../components/ui/Input';
import { Chip } from '../../components/ui/Chip';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusPill } from '../../components/ui/StatusPill';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProduceVisual } from '../../components/ui/ProduceVisual';
import { Avatar } from '../../components/ui/Avatar';
import { GoviyaLogo } from '../../components/shared/GoviyaLogo';
import { SellerProfileModal } from '../../components/shared/SellerProfileModal';
import { Listing } from '../../types';

// ===================== 1. BUYER HOME SCREEN =====================
export const BuyerHomeScreen: React.FC = () => {
  const { listings, setTab, goToSubScreen, addToCart } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter state
  const [maxPrice, setMaxPrice] = useState<number>(800);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [onlyOrganic, setOnlyOrganic] = useState<boolean>(false);
  const [minOrderFilter, setMinOrderFilter] = useState<'all' | 'small' | 'medium' | 'bulk'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'qty_desc'>('rating');

  // Quick produce search shortcuts
  const popularProduceSearches = [
    { label: 'Carrots', emoji: '🥕', query: 'carrots' },
    { label: 'Red Onions', emoji: '🧅', query: 'onions' },
    { label: 'Tomatoes', emoji: '🍅', query: 'tomatoes' },
    { label: 'Leeks', emoji: '🥬', query: 'leeks' },
    { label: 'Brinjal', emoji: '🍆', query: 'brinjal' },
    { label: 'Green Chillies', emoji: '🌶️', query: 'chillies' },
    { label: 'Tender Okra', emoji: '🥒', query: 'okra' },
    { label: 'Mukunuwenna', emoji: '🌱', query: 'mukunuwenna' },
    { label: 'Snake Gourd', emoji: '🌿', query: 'gourd' },
  ];

  const categories = ['All', 'Vegetables', 'Fruits', 'Spices & Herbs', 'Grains & Rice', 'Tubers'];

  // Word normalization helper for plural/singular and common Sri Lankan crop names
  const normalizeWord = (w: string) => {
    let s = w.toLowerCase().trim();
    if (s.endsWith('ies')) s = s.slice(0, -3) + 'y';
    else if (s.endsWith('es') && !s.endsWith('pes')) s = s.slice(0, -2);
    else if (s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
    return s;
  };

  // Synonyms map for English and Sinhala/Tamil transliterations
  const CROP_SYNONYMS: Record<string, string[]> = {
    carrot: ['carrot', 'carrots', 'karat', 'කැරට්'],
    onion: ['onion', 'onions', 'shallot', 'shallots', 'lunu', 'රතුලූනු', 'ලූනු'],
    tomato: ['tomato', 'tomatoes', 'thakkali', 'තක්කාලි'],
    leek: ['leek', 'leeks', 'ලීක්ස්'],
    chilli: ['chilli', 'chillies', 'chili', 'chilis', 'miris', 'amu miris', 'මිරිස්'],
    brinjal: ['brinjal', 'brinjals', 'eggplant', 'wambatu', 'aubergine', 'වම්බටු'],
    okra: ['okra', 'bandakka', 'ladyfinger', 'බණ්ඩක්කා'],
    gourd: ['gourd', 'pathola', 'snake gourd', 'පතෝල'],
    mukunuwenna: ['mukunuwenna', 'gotukola', 'leafy', 'greens', 'කොළ'],
    papaya: ['papaya', 'papaw', 'pawpaw', 'පැපොල්'],
  };

  // Multi-token and synonym-aware search
  const isMatchingSearch = (listing: Listing, query: string) => {
    if (!query.trim()) return true;

    const rawTokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const targetText = [
      listing.cropName,
      listing.description,
      listing.category,
      listing.farmerName,
      listing.location.district,
      listing.location.town,
    ].join(' ').toLowerCase();

    return rawTokens.every(token => {
      const normToken = normalizeWord(token);

      // Direct match
      if (targetText.includes(token) || targetText.includes(normToken)) {
        return true;
      }

      // Check synonyms (e.g. if searching 'carrots', match 'carrot' or 'karat')
      for (const [key, synonyms] of Object.entries(CROP_SYNONYMS)) {
        if (synonyms.some(s => s.includes(normToken) || normToken.includes(normalizeWord(s)))) {
          if (targetText.includes(key) || synonyms.some(s => targetText.includes(normalizeWord(s)))) {
            return true;
          }
        }
      }

      return false;
    });
  };

  // Filter listings
  const filteredListings = listings.filter(l => {
    const matchCategory = selectedCategory === 'All' || l.category === selectedCategory;
    const matchSearch = isMatchingSearch(l, searchQuery);
    const matchPrice = l.pricePerKg <= maxPrice;
    const matchDistrict = selectedDistrict === 'All' || l.location.district === selectedDistrict;
    const matchOrganic = !onlyOrganic || l.isOrganic;

    let matchMinOrder = true;
    if (minOrderFilter === 'small') matchMinOrder = l.minOrderKg <= 5;
    else if (minOrderFilter === 'medium') matchMinOrder = l.minOrderKg <= 10;
    else if (minOrderFilter === 'bulk') matchMinOrder = l.minOrderKg >= 15;

    return matchCategory && matchSearch && matchPrice && matchDistrict && matchOrganic && matchMinOrder && l.status === 'active';
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.pricePerKg - b.pricePerKg;
    if (sortBy === 'price_desc') return b.pricePerKg - a.pricePerKg;
    if (sortBy === 'qty_desc') return b.quantityKg - a.quantityKg;
    return b.farmerRating - a.farmerRating;
  });

  // Calculate active filter count
  const activeFiltersCount =
    (selectedDistrict !== 'All' ? 1 : 0) +
    (onlyOrganic ? 1 : 0) +
    (maxPrice < 800 ? 1 : 0) +
    (minOrderFilter !== 'all' ? 1 : 0) +
    (sortBy !== 'rating' ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSelectedDistrict('All');
    setMaxPrice(800);
    setOnlyOrganic(false);
    setMinOrderFilter('all');
    setSortBy('rating');
  };

  const isCarrotSearch = searchQuery.toLowerCase().includes('carrot');

  return (
    <div className="space-y-4 pb-20 text-left">
      {/* Search Bar & Filter Button Header */}
      <div className="px-4 pt-2 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search carrots, leeks, onions, farmers, regions..."
            />
          </div>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className={`h-11 min-w-[46px] px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all relative cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-[#1F5C3A] text-white border-[#1F5C3A] shadow-xs'
                : 'bg-white border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F6F7F5]'
            }`}
            aria-label="Open Filters"
            title="Filter produce options"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="text-xs font-extrabold bg-white text-[#1F5C3A] w-5 h-5 rounded-full flex items-center justify-center shadow-2xs">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Popular Search Shortcuts (One-tap Carrots, Onions, etc.) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider shrink-0 mr-0.5">
            Quick:
          </span>
          {popularProduceSearches.map(item => {
            const isSelected = searchQuery.toLowerCase().includes(item.query);
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSearchQuery('');
                  } else {
                    setSearchQuery(item.query);
                  }
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1F5C3A] text-white border-[#1F5C3A] shadow-xs'
                    : 'bg-white text-[#374151] border-[#E5E5E5] hover:border-[#1F5C3A]/50 hover:bg-[#F9FAF8]'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
                {isSelected && <X className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
          {categories.map(cat => (
            <Chip
              key={cat}
              label={cat}
              selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>

        {/* Active Search & Filter Feedback Banner */}
        {(searchQuery.trim() || activeFiltersCount > 0) && (
          <div className="bg-[#E6F2E8] border border-[#CDE5D2] rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{isCarrotSearch ? '🥕' : '🔍'}</span>
                <div>
                  <h4 className="text-xs font-extrabold text-[#1F5C3A]">
                    {isCarrotSearch
                      ? `All Listed Carrots (${filteredListings.length} available)`
                      : searchQuery
                      ? `Search results for "${searchQuery}" (${filteredListings.length})`
                      : `Filtered Produce (${filteredListings.length} items)`}
                  </h4>
                  <p className="text-[10px] text-[#4B6B56]">
                    Direct farm harvest available with active filter options
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(true)}
                  className="px-2.5 py-1 bg-white text-[#1F5C3A] border border-[#CDE5D2] rounded-xl text-xs font-bold shadow-2xs hover:bg-[#F4F9F5] flex items-center gap-1 cursor-pointer"
                >
                  <Filter className="w-3 h-3" />
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
                {(searchQuery || activeFiltersCount > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      resetAllFilters();
                    }}
                    className="p-1 text-[#6B7280] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer"
                    title="Clear search and reset filters"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Removable Active Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-[#1F5C3A] px-2 py-0.5 rounded-lg border border-[#CDE5D2]">
                  Query: "{searchQuery}"
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-[#DC2626]"
                    onClick={() => setSearchQuery('')}
                  />
                </span>
              )}
              {selectedDistrict !== 'All' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-[#1F5C3A] px-2 py-0.5 rounded-lg border border-[#CDE5D2]">
                  District: {selectedDistrict}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-[#DC2626]"
                    onClick={() => setSelectedDistrict('All')}
                  />
                </span>
              )}
              {maxPrice < 800 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-[#1F5C3A] px-2 py-0.5 rounded-lg border border-[#CDE5D2]">
                  ≤ LKR {maxPrice}/kg
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-[#DC2626]"
                    onClick={() => setMaxPrice(800)}
                  />
                </span>
              )}
              {onlyOrganic && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-[#1F5C3A] px-2 py-0.5 rounded-lg border border-[#CDE5D2]">
                  🌱 Organic Only
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-[#DC2626]"
                    onClick={() => setOnlyOrganic(false)}
                  />
                </span>
              )}
              {minOrderFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-[#1F5C3A] px-2 py-0.5 rounded-lg border border-[#CDE5D2]">
                  Min: {minOrderFilter === 'small' ? '≤ 5kg' : minOrderFilter === 'medium' ? '≤ 10kg' : '≥ 15kg bulk'}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-[#DC2626]"
                    onClick={() => setMinOrderFilter('all')}
                  />
                </span>
              )}
              {sortBy !== 'rating' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-[#1F5C3A] px-2 py-0.5 rounded-lg border border-[#CDE5D2]">
                  Sort: {sortBy === 'price_asc' ? 'Price Low-High' : sortBy === 'price_desc' ? 'Price High-Low' : 'Stock'}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-[#DC2626]"
                    onClick={() => setSortBy('rating')}
                  />
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Featured Direct Farmers Promo Banner (shown when not in full search mode) */}
      {!searchQuery && (
        <div className="px-4">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1F5C3A] to-[#2D7A4D] text-white p-4 shadow-sm">
            <div className="max-w-[260px]">
              <span className="inline-block text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full mb-1">
                Direct From Hill Country
              </span>
              <h3 className="text-base font-bold leading-snug">
                Nuwara Eliya & Dambulla Fresh Harvest
              </h3>
              <p className="text-xs text-white/80 mt-1">
                Up to 35% cheaper than Pettah retail brokers. Picked today.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setSearchQuery('carrots')}
                  className="inline-flex items-center gap-1 text-xs font-bold bg-white text-[#1F5C3A] px-3 py-1.5 rounded-xl shadow-xs hover:bg-[#E6F2E8] active:scale-95 transition-all cursor-pointer"
                >
                  <span>🥕 View Carrots</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab('nearby')}
                  className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 text-white px-3 py-1.5 rounded-xl hover:bg-white/30 transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Nearby Map</span>
                </button>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-6 w-32 h-32 opacity-25 pointer-events-none">
              <ProduceVisual type="carrot" size="lg" />
            </div>
          </div>
        </div>
      )}

      {/* Product Listings Section */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1A1A1A]">
              {isCarrotSearch
                ? `Carrot Harvest Offerings (${filteredListings.length})`
                : searchQuery
                ? `Search Results (${filteredListings.length})`
                : 'Available Harvest'}
            </h3>
            <p className="text-[11px] text-[#6B7280]">
              {isCarrotSearch
                ? 'Highland & organic sweet carrots from Nuwara Eliya, Dambulla & Colombo'
                : `${filteredListings.length} direct farmer listings available for islandwide delivery`}
            </p>
          </div>
          <span className="text-xs font-semibold text-[#1F5C3A] bg-[#E6F2E8] px-2 py-0.5 rounded-full border border-[#CDE5D2]">
            Wholesale & Retail
          </span>
        </div>

        {filteredListings.length === 0 ? (
          <EmptyState
            title={isCarrotSearch ? "No carrots match these filters" : "No produce found"}
            description={
              isCarrotSearch
                ? `We have carrots listed in Nuwara Eliya, Matale, and Colombo. Adjust your maximum price (LKR ${maxPrice}) or district filter to view all listed carrots.`
                : "Try clearing your search query or adjusting your filters to find fresh harvest produce."
            }
            actionLabel={isCarrotSearch ? "Show All 5 Listed Carrots" : "Reset All Filters"}
            onAction={() => {
              if (isCarrotSearch) {
                resetAllFilters();
              } else {
                setSearchQuery('');
                resetAllFilters();
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredListings.map(listing => (
              <ProductCard
                key={listing._id}
                listing={listing}
                onSelect={() => goToSubScreen('product_detail', { listingId: listing._id })}
              />
            ))}
          </div>
        )}
      </div>

      {/* COMPREHENSIVE FILTER OPTIONS BOTTOM SHEET */}
      <BottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Produce & Vegetables"
      >
        <div className="p-4 space-y-5 text-left overflow-y-auto max-h-[75vh]">
          {/* Active Filter Header Summary & Reset */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
            <span className="text-xs font-bold text-[#6B7280]">
              {activeFiltersCount > 0 ? `${activeFiltersCount} filters active` : 'No filters applied'}
            </span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-bold text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            )}
          </div>

          {/* 1. Quick Produce / Vegetable Selection */}
          <div>
            <label className="text-xs font-bold text-[#1A1A1A] block mb-2">
              Popular Vegetable / Crop
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  !searchQuery
                    ? 'bg-[#1F5C3A] text-white border-[#1F5C3A]'
                    : 'bg-white text-[#6B7280] border-[#E5E5E5] hover:bg-[#F9FAF8]'
                }`}
              >
                All Produce
              </button>
              {popularProduceSearches.map(crop => {
                const isSelected = searchQuery.toLowerCase().includes(crop.query);
                return (
                  <button
                    key={crop.label}
                    type="button"
                    onClick={() => {
                      if (isSelected) setSearchQuery('');
                      else setSearchQuery(crop.query);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1F5C3A] text-white border-[#1F5C3A]'
                        : 'bg-white text-[#6B7280] border-[#E5E5E5] hover:bg-[#F9FAF8]'
                    }`}
                  >
                    <span>{crop.emoji}</span>
                    <span>{crop.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Farm Region / District Filter */}
          <div>
            <label className="text-xs font-bold text-[#1A1A1A] block mb-2">
              Farm Region / District
            </label>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1A1A1A] font-medium focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/20"
            >
              <option value="All">All Sri Lanka Districts</option>
              <option value="Nuwara Eliya">Nuwara Eliya (Highlands / Carrots & Leeks)</option>
              <option value="Colombo">Colombo (Pannipitiya / Western)</option>
              <option value="Matale">Matale / Dambulla (Central Wholesale Hub)</option>
              <option value="Jaffna">Jaffna (Northern Red Onions & Chillies)</option>
              <option value="Kurunegala">Kurunegala (North Western)</option>
              <option value="Kandy">Kandy (Central Province)</option>
            </select>
          </div>

          {/* 3. Price Filter (LKR / kg) with Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#1A1A1A]">
                Maximum Price: <span className="text-[#1F5C3A] font-extrabold">LKR {maxPrice} / kg</span>
              </label>
              <span className="text-[10px] text-[#6B7280]">Per kilogram wholesale</span>
            </div>
            <input
              type="range"
              min="150"
              max="800"
              step="10"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#1F5C3A]"
            />
            <div className="flex justify-between text-[11px] text-[#6B7280] mt-1">
              <span>LKR 150</span>
              <span>LKR 800+</span>
            </div>

            {/* Quick Price Buttons */}
            <div className="grid grid-cols-4 gap-1.5 mt-2.5">
              {[
                { label: '≤ 250', val: 250 },
                { label: '≤ 300', val: 300 },
                { label: '≤ 400', val: 400 },
                { label: 'All (800)', val: 800 },
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setMaxPrice(p.val)}
                  className={`py-1.5 px-1 text-[11px] rounded-lg border font-bold text-center transition-colors cursor-pointer ${
                    maxPrice === p.val
                      ? 'bg-[#1F5C3A] text-white border-[#1F5C3A]'
                      : 'bg-white text-[#6B7280] border-[#E5E5E5] hover:bg-[#F9FAF8]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Minimum Order Requirement */}
          <div>
            <label className="text-xs font-bold text-[#1A1A1A] block mb-2">
              Minimum Order Quantity
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'all', label: 'Any Min' },
                { id: 'small', label: '≤ 5 kg' },
                { id: 'medium', label: '≤ 10 kg' },
                { id: 'bulk', label: '≥ 15 kg' },
              ].map(mo => (
                <button
                  key={mo.id}
                  type="button"
                  onClick={() => setMinOrderFilter(mo.id as any)}
                  className={`py-2 px-1 text-xs rounded-xl border text-center font-bold transition-colors cursor-pointer ${
                    minOrderFilter === mo.id
                      ? 'border-[#1F5C3A] bg-[#E6F2E8] text-[#1F5C3A]'
                      : 'border-[#E5E5E5] bg-white text-[#6B7280] hover:bg-[#F9FAF8]'
                  }`}
                >
                  {mo.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Sort By */}
          <div>
            <label className="text-xs font-bold text-[#1A1A1A] block mb-2">
              Sort Produce By
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'rating', label: '★ Top Rated Farmers' },
                { id: 'price_asc', label: 'Price: Low to High' },
                { id: 'price_desc', label: 'Price: High to Low' },
                { id: 'qty_desc', label: 'Highest Stock Available' },
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSortBy(s.id as any)}
                  className={`py-2 px-2.5 text-xs rounded-xl border text-center font-bold transition-colors cursor-pointer ${
                    sortBy === s.id
                      ? 'border-[#1F5C3A] bg-[#E6F2E8] text-[#1F5C3A]'
                      : 'border-[#E5E5E5] bg-white text-[#6B7280] hover:bg-[#F9FAF8]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Organic Practice Checkbox */}
          <label className="flex items-center gap-3 p-3 bg-[#F6F7F5] rounded-xl cursor-pointer hover:bg-[#EEF0EC] transition-colors">
            <input
              type="checkbox"
              checked={onlyOrganic}
              onChange={e => setOnlyOrganic(e.target.checked)}
              className="w-4 h-4 rounded text-[#1F5C3A] accent-[#1F5C3A] cursor-pointer"
            />
            <div>
              <div className="text-xs font-bold text-[#1A1A1A]">Organic Certified Only</div>
              <div className="text-[11px] text-[#6B7280]">
                Shows produce grown without chemical pesticides or artificial fertilizers
              </div>
            </div>
          </label>

          {/* Filter Modal Action Buttons */}
          <div className="pt-2 border-t border-[#F0F0EE] flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                resetAllFilters();
              }}
            >
              Reset Filters
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => setIsFilterOpen(false)}
            >
              Apply ({filteredListings.length} Produce Available)
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

// ===================== 2. BUYER NEARBY MAP SCREEN =====================
export const BuyerNearbyScreen: React.FC = () => {
  const { listings, users, goToSubScreen, getOrCreateConversation, setTab, addToCart } = useApp();
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [selectionFilter, setSelectionFilter] = useState<'all' | 'farmers' | 'vegetables'>('all');
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState<boolean>(true);
  const [expandedFarmIds, setExpandedFarmIds] = useState<Record<string, boolean>>({});
  const [selectedProfileFarmerId, setSelectedProfileFarmerId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const toggleExpandFarm = (farmId: string) => {
    setExpandedFarmIds(prev => ({
      ...prev,
      [farmId]: !prev[farmId],
    }));
  };

  const query = locationSearch.trim().toLowerCase();
  const farmerUsers = users.filter(u => u.role === 'farmer');

  // Filter farmers by location query
  const matchingFarmers = farmerUsers.filter(f => {
    if (!query) return true;
    const matchTown = f.location?.town?.toLowerCase().includes(query);
    const matchDistrict = f.location?.district?.toLowerCase().includes(query);
    const matchAddress = f.location?.address?.toLowerCase().includes(query);
    const matchFarmName = f.farmName?.toLowerCase().includes(query);
    const matchName = f.name?.toLowerCase().includes(query);
    const hasMatchingCrop = listings.some(l =>
      l.farmerId === f._id && (
        l.location.town.toLowerCase().includes(query) ||
        l.location.district.toLowerCase().includes(query) ||
        l.cropName.toLowerCase().includes(query)
      )
    );
    return matchTown || matchDistrict || matchAddress || matchFarmName || matchName || hasMatchingCrop;
  });

  // Filter vegetables / produce by location query
  const matchingVegetables = listings.filter(l => {
    if (l.status !== 'active') return false;
    if (!query) return true;
    const matchTown = l.location.town.toLowerCase().includes(query);
    const matchDistrict = l.location.district.toLowerCase().includes(query);
    const matchCrop = l.cropName.toLowerCase().includes(query);
    const matchFarmer = l.farmerName.toLowerCase().includes(query);
    const matchCategory = l.category.toLowerCase().includes(query);
    const matchDesc = l.description.toLowerCase().includes(query);
    return matchTown || matchDistrict || matchCrop || matchFarmer || matchCategory || matchDesc;
  });

  // Unique map markers for matched farmers
  const uniqueFarmerMarkers = new Map<string, {
    id: string;
    name: string;
    crop?: string;
    district: string;
    town: string;
    lat: number;
    lng: number;
    type: 'farmer';
  }>();

  matchingFarmers.forEach(f => {
    if (f.location) {
      uniqueFarmerMarkers.set(f._id, {
        id: f._id,
        name: f.farmName || f.name,
        crop: listings.find(l => l.farmerId === f._id)?.cropName || 'Fresh Harvest',
        district: f.location.district,
        town: f.location.town || f.location.address.split(',')[0],
        lat: f.location.lat,
        lng: f.location.lng,
        type: 'farmer',
      });
    }
  });

  matchingVegetables.forEach(l => {
    if (!uniqueFarmerMarkers.has(l.farmerId)) {
      uniqueFarmerMarkers.set(l.farmerId, {
        id: l.farmerId,
        name: l.farmerName,
        crop: l.cropName,
        district: l.location.district,
        town: l.location.town,
        lat: l.location.lat,
        lng: l.location.lng,
        type: 'farmer',
      });
    }
  });

  const markers = Array.from(uniqueFarmerMarkers.values());

  const popularLocations = [
    { label: '🌟 Pannipitiya', value: 'Pannipitiya' },
    { label: 'Nuwara Eliya', value: 'Nuwara Eliya' },
    { label: 'Matale / Dambulla', value: 'Matale' },
    { label: 'Jaffna', value: 'Jaffna' },
    { label: 'Kurunegala', value: 'Kurunegala' },
    { label: 'All Sri Lanka', value: '' },
  ];

  return (
    <div className="flex flex-col h-full space-y-4 px-4 pt-2 pb-24 text-left">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1F5C3A] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setTab('cart')}
            className="ml-1 underline font-bold text-emerald-200 hover:text-white"
          >
            View Cart
          </button>
        </div>
      )}

      {/* Screen Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Nearby Farmers & Produce</h2>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="text-xs font-semibold text-[#1F5C3A] hover:text-[#16452B] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E6F2E8]"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          </button>
        </div>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Search by location to discover local farmers and fresh harvest with zero middleman markup
        </p>
      </div>

      {/* 1. Location Search Input with GPS shortcut */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <MapPin className="w-4 h-4 text-[#1F5C3A] absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={locationSearch}
            onChange={e => setLocationSearch(e.target.value)}
            placeholder="Search location (e.g. Pannipitiya, Nuwara Eliya, Jaffna...)"
            className="w-full h-11 pl-9 pr-9 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/30 focus:border-[#1F5C3A] shadow-2xs"
          />
          {locationSearch && (
            <button
              type="button"
              onClick={() => setLocationSearch('')}
              className="absolute right-3 p-1 text-[#9CA3AF] hover:text-[#1A1A1A]"
              aria-label="Clear location search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick GPS Location Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setLocationSearch('Pannipitiya')}
            className="inline-flex items-center gap-1.5 text-xs text-[#1F5C3A] font-semibold hover:underline bg-[#E6F2E8]/70 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#1F5C3A]" />
            <span>Use Current Location: <strong>Pannipitiya, Colombo</strong></span>
          </button>
          {locationSearch && (
            <span className="text-[11px] text-[#6B7280]">
              Filtering by: <strong>"{locationSearch}"</strong>
            </span>
          )}
        </div>

        {/* Quick Location Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          {popularLocations.map(loc => {
            const isSelected =
              loc.value === '' ? locationSearch === '' : locationSearch.toLowerCase() === loc.value.toLowerCase();
            return (
              <button
                key={loc.label}
                type="button"
                onClick={() => setLocationSearch(loc.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1F5C3A] text-white shadow-xs'
                    : 'bg-white text-[#6B7280] border border-[#E5E5E5] hover:border-[#1F5C3A] hover:text-[#1F5C3A]'
                }`}
              >
                {loc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Select by Farmers or Vegetables Toggle */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
          Filter Results By
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#EAECE9] rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectionFilter('all')}
            className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectionFilter === 'all'
                ? 'bg-white text-[#1F5C3A] shadow-xs font-bold'
                : 'text-[#6B7280] hover:text-[#1A1A1A]'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectionFilter === 'all' ? 'bg-[#E6F2E8] text-[#1F5C3A]' : 'bg-[#DDD] text-[#666]'
              }`}
            >
              {matchingFarmers.length + matchingVegetables.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectionFilter('farmers')}
            className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectionFilter === 'farmers'
                ? 'bg-white text-[#1F5C3A] shadow-xs font-bold'
                : 'text-[#6B7280] hover:text-[#1A1A1A]'
            }`}
          >
            <span>👨‍🌾 Farmers</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectionFilter === 'farmers' ? 'bg-[#E6F2E8] text-[#1F5C3A]' : 'bg-[#DDD] text-[#666]'
              }`}
            >
              {matchingFarmers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectionFilter('vegetables')}
            className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectionFilter === 'vegetables'
                ? 'bg-white text-[#1F5C3A] shadow-xs font-bold'
                : 'text-[#6B7280] hover:text-[#1A1A1A]'
            }`}
          >
            <span>🥕 Vegetables</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectionFilter === 'vegetables' ? 'bg-[#E6F2E8] text-[#1F5C3A]' : 'bg-[#DDD] text-[#666]'
              }`}
            >
              {matchingVegetables.length}
            </span>
          </button>
        </div>
      </div>

      {/* Sri Lanka Interactive Map (Collapsible) */}
      {showMap && (
        <div className="space-y-1">
          <SriLankaMap
            markers={markers}
            selectedId={selectedFarmId}
            onSelectMarker={id => {
              setSelectedFarmId(id);
              // Auto-expand that farmer's card
              setExpandedFarmIds(prev => ({ ...prev, [id]: true }));
            }}
            className="h-56"
          />
          <div className="flex items-center justify-between text-[11px] text-[#6B7280] px-1">
            <span>
              Showing {markers.length} farm pins in{' '}
              {locationSearch ? `"${locationSearch}"` : 'Sri Lanka'}
            </span>
            {selectedFarmId && (
              <button
                type="button"
                onClick={() => setSelectedFarmId(null)}
                className="text-[#1F5C3A] font-semibold hover:underline"
              >
                Clear Pin Selection
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Search Context Indicator */}
      {locationSearch && (
        <div className="p-2.5 rounded-xl bg-[#E6F2E8] border border-[#C5E4CC] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1F5C3A] animate-pulse" />
            <span className="text-[#1F5C3A] font-medium">
              Location: <strong>{locationSearch}</strong> — {matchingFarmers.length} Farmers &{' '}
              {matchingVegetables.length} Vegetables listed
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLocationSearch('')}
            className="text-xs font-bold text-[#1F5C3A] hover:underline"
          >
            Reset
          </button>
        </div>
      )}

      {/* Empty State when no match */}
      {matchingFarmers.length === 0 && matchingVegetables.length === 0 && (
        <EmptyState
          title={`No farmers or produce found in "${locationSearch}"`}
          description="Try searching for another Sri Lankan agricultural area such as Pannipitiya, Nuwara Eliya, Jaffna, or Dambulla."
          actionLabel="Show Pannipitiya Harvest"
          onAction={() => setLocationSearch('Pannipitiya')}
        />
      )}

      {/* SECTION 1: FARMERS (Visible when 'all' or 'farmers' is selected) */}
      {(selectionFilter === 'all' || selectionFilter === 'farmers') && matchingFarmers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-sm font-extrabold text-[#1A1A1A] flex items-center gap-1.5">
              <span>👨‍🌾</span>
              <span>
                Farmers in {locationSearch ? locationSearch : 'Nearby Regions'}
              </span>
              <span className="text-xs text-[#1F5C3A] font-bold bg-[#E6F2E8] px-2 py-0.5 rounded-full">
                {matchingFarmers.length}
              </span>
            </h3>
            {selectionFilter === 'all' && (
              <button
                type="button"
                onClick={() => setSelectionFilter('farmers')}
                className="text-xs text-[#1F5C3A] font-semibold hover:underline"
              >
                View all ({matchingFarmers.length})
              </button>
            )}
          </div>

          <div className="space-y-3">
            {matchingFarmers.map(farmer => {
              const farmListings = listings.filter(l => l.farmerId === farmer._id && l.status === 'active');
              const isSelected = selectedFarmId === farmer._id;
              const isExpanded = expandedFarmIds[farmer._id] ?? isSelected;

              return (
                <Card
                  key={farmer._id}
                  variant={isSelected ? 'mint' : 'default'}
                  padding="md"
                  className={`transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-[#1F5C3A] shadow-md' : 'hover:border-[#1F5C3A]/50'
                  }`}
                >
                  {/* Top Farmer Profile Header */}
                  <div
                    className="flex items-start justify-between cursor-pointer group"
                    onClick={() => setSelectedProfileFarmerId(farmer._id)}
                    title="Click to view full seller profile & chat"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={farmer.name} size="md" role="farmer" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A] transition-colors">
                            {farmer.farmName || farmer.name}
                          </h4>
                          {farmer.verified && (
                            <span title="Agrarian Verified">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#1F5C3A] shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#4B6B56] font-medium mt-0.5">
                          Grower: {farmer.name} · <span className="underline">View Profile</span>
                        </p>
                        <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#1F5C3A] shrink-0" />
                          <span>{farmer.location?.address || `${farmer.location?.town}, ${farmer.location?.district}`}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-[#FEF8EA] text-[#B45309] px-2 py-0.5 rounded-full text-xs font-bold shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{farmer.rating?.toFixed(1) || '4.9'}</span>
                    </div>
                  </div>

                  {/* Farm Size & Features */}
                  <div className="mt-2.5 pt-2 border-t border-[#F0F0EE] flex flex-wrap items-center gap-2 text-[11px] text-[#6B7280]">
                    <span className="bg-[#F6F7F5] px-2 py-0.5 rounded-md font-medium text-[#1A1A1A]">
                      🌾 {farmer.farmSizeAcres || 3.0} Acres Farm
                    </span>
                    <span className="bg-[#E6F2E8] text-[#1F5C3A] px-2 py-0.5 rounded-md font-semibold">
                      ✓ Direct Farm Gate
                    </span>
                    <span className="bg-[#F6F7F5] px-2 py-0.5 rounded-md font-medium text-[#6B7280]">
                      {farmListings.length} active harvest crops
                    </span>
                  </div>

                  {/* Actions: Chat, Call, and Toggle Produce */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                        onClick={() => {
                          const convId = getOrCreateConversation(
                            farmer._id,
                            farmer.name,
                            farmListings[0]?.cropName || 'Fresh Harvest',
                            'farmer'
                          );
                          goToSubScreen('chat_detail', { conversationId: convId });
                        }}
                      >
                        Chat with Seller
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Phone className="w-3.5 h-3.5 text-[#1F5C3A]" />}
                        onClick={() => {
                          window.location.href = `tel:${farmer.phone}`;
                        }}
                      >
                        Call
                      </Button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleExpandFarm(farmer._id)}
                      className="text-xs font-bold text-[#1F5C3A] hover:text-[#16452B] flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#E6F2E8] transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Crops' : `View Crops (${farmListings.length})`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Expanded Crops from this Farmer */}
                  {isExpanded && farmListings.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#F0F0EE] space-y-2">
                      <div className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">
                        Available Harvest from {farmer.farmName || farmer.name}:
                      </div>
                      <div className="space-y-2">
                        {farmListings.map(listing => (
                          <div
                            key={listing._id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6F7F5] hover:bg-[#E6F2E8] transition-colors border border-transparent hover:border-[#D5EAD8]"
                          >
                            <div
                              onClick={() => goToSubScreen('product_detail', { listingId: listing._id })}
                              className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                            >
                              <ProduceVisual type={listing.cropName} size="sm" className="shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#1A1A1A] truncate">
                                  {listing.cropName}
                                </div>
                                <div className="text-[10px] text-[#6B7280]">
                                  Min {listing.minOrderKg}kg · {listing.quantityKg}kg available
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <div className="text-xs font-extrabold text-[#1F5C3A]">
                                  LKR {listing.pricePerKg.toLocaleString()}
                                </div>
                                <div className="text-[9px] text-[#9CA3AF]">/kg</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  addToCart(listing, listing.minOrderKg || 5);
                                  showToast(`Added ${listing.cropName} to Cart!`);
                                }}
                                className="p-2 rounded-xl bg-[#1F5C3A] text-white hover:bg-[#16452B] transition-transform active:scale-95 shadow-xs cursor-pointer"
                                title="Add to Cart"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: VEGETABLES & PRODUCE (Visible when 'all' or 'vegetables' is selected) */}
      {(selectionFilter === 'all' || selectionFilter === 'vegetables') && matchingVegetables.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#1A1A1A] flex items-center gap-1.5">
              <span>🥕</span>
              <span>
                Fresh Vegetables in {locationSearch ? locationSearch : 'Nearby Farms'}
              </span>
              <span className="text-xs text-[#1F5C3A] font-bold bg-[#E6F2E8] px-2 py-0.5 rounded-full">
                {matchingVegetables.length}
              </span>
            </h3>
            {selectionFilter === 'all' && (
              <button
                type="button"
                onClick={() => setSelectionFilter('vegetables')}
                className="text-xs text-[#1F5C3A] font-semibold hover:underline"
              >
                View all ({matchingVegetables.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {matchingVegetables.map(listing => (
              <ProductCard
                key={listing._id}
                listing={listing}
                onSelect={() => goToSubScreen('product_detail', { listingId: listing._id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Seller Profile & Chat Modal */}
      <SellerProfileModal
        farmerId={selectedProfileFarmerId}
        isOpen={!!selectedProfileFarmerId}
        onClose={() => setSelectedProfileFarmerId(null)}
      />
    </div>
  );
};

// ===================== 3. PRODUCT DETAILS SCREEN =====================
export const BuyerProductDetailScreen: React.FC = () => {
  const { navState, listings, addToCart, goBack, getOrCreateConversation, goToSubScreen, setTab } = useApp();
  const [quantity, setQuantity] = useState<number>(10);
  const [showAddedSheet, setShowAddedSheet] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  const listing = listings.find(l => l._id === navState.selectedListingId) || listings[0];
  if (!listing) return null;

  const handleAddToCart = () => {
    addToCart(listing, quantity);
    setShowAddedSheet(true);
  };

  const totalPrice = quantity * listing.pricePerKg;

  return (
    <div className="flex flex-col min-h-full bg-[#F6F7F5] pb-6 text-left">
      {/* Product Hero Media */}
      <div className="relative w-full h-72 bg-[#EAF2EC] flex items-center justify-center overflow-hidden border-b border-[#E5E5E5]">
        {listing.photos && listing.photos.length > 0 && (listing.photos[0].startsWith('data:image') || listing.photos[0].startsWith('http')) ? (
          <img
            src={listing.photos[0]}
            alt={listing.cropName}
            className="w-full h-full object-cover"
          />
        ) : (
          <ProduceVisual type={listing.cropName} size="xl" className="max-w-[280px] drop-shadow-lg" />
        )}
        {listing.isOrganic && (
          <span className="absolute top-4 left-4 bg-[#1F5C3A] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
            100% Organic Certified
          </span>
        )}
      </div>

      {/* Main Details Body */}
      <div className="p-4 space-y-4">
        {/* Title & Price Header */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
            <span className="font-semibold text-[#1F5C3A]">{listing.category}</span>
            <div className="flex items-center gap-1 font-bold text-[#1A1A1A]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{listing.farmerRating.toFixed(1)}</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#1A1A1A]">{listing.cropName}</h2>

          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-[#1F5C3A]">
              LKR {listing.pricePerKg.toLocaleString()}
            </span>
            <span className="text-xs text-[#6B7280]">/ kg</span>
            <span className="text-xs text-[#9CA3AF] line-through ml-2">
              LKR {Math.round(listing.pricePerKg * 1.35)} / kg
            </span>
            <span className="ml-1 text-[10px] font-bold text-[#C8452D] bg-[#FDEEEB] px-1.5 py-0.5 rounded">
              -35% Farm Gate Direct
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F0F0EE] text-xs text-[#6B7280]">
            <div>
              <span className="font-bold text-[#1A1A1A]">{listing.quantityKg} kg</span> in stock
            </div>
            <div>
              <span className="font-bold text-[#1A1A1A]">{listing.minOrderKg} kg</span> min order
            </div>
            <div>
              Harvested: <span className="font-semibold text-[#1A1A1A]">{listing.harvestDate}</span>
            </div>
          </div>
        </div>

        {/* Farmer Storefront Card */}
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-3">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setIsSellerModalOpen(true)}
              title="Click to view full seller profile & chat"
            >
              <Avatar name={listing.farmerName} size="md" role="farmer" />
              <div>
                <h4 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1 group-hover:text-[#1F5C3A] transition-colors">
                  {listing.farmerName}
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1F5C3A]" />
                </h4>
                <p className="text-xs text-[#6B7280] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#1F5C3A]" />
                  <span>
                    {listing.location.town}, {listing.location.district}
                  </span>
                </p>
                <span className="text-[10px] text-[#1F5C3A] font-semibold underline">
                  View Seller Profile →
                </span>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              onClick={() => {
                const convId = getOrCreateConversation(
                  listing.farmerId,
                  listing.farmerName,
                  listing.cropName,
                  'farmer'
                );
                goToSubScreen('chat_detail', { conversationId: convId });
              }}
            >
              Chat with Seller
            </Button>
          </div>
          <p
            onClick={() => setIsSellerModalOpen(true)}
            className="text-xs text-[#6B7280] bg-[#F6F7F5] p-2.5 rounded-xl cursor-pointer hover:bg-[#EEF8FA] transition-colors"
          >
            "Verified smallholder producer in Sri Lanka. Direct transport to Western & Central provinces guaranteed within 24 hours of harvest."
          </p>
        </Card>

        {/* Seller Profile & Chat Modal */}
        <SellerProfileModal
          farmerId={listing.farmerId}
          isOpen={isSellerModalOpen}
          onClose={() => setIsSellerModalOpen(false)}
          initialCropName={listing.cropName}
        />

        {/* Produce Description */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] space-y-2">
          <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
            Harvest Specifications
          </h4>
          <p className="text-xs text-[#4B5563] leading-relaxed">
            {listing.description}
          </p>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] p-3 shadow-lg w-full mt-auto">
        <div className="w-full flex items-center justify-between gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-[#F6F7F5] border border-[#E5E5E5] rounded-xl px-2 py-1">
            <button
              type="button"
              onClick={() => setQuantity(prev => Math.max(listing.minOrderKg, prev - 5))}
              className="w-8 h-8 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center text-[#1A1A1A] hover:bg-[#F3F4F6] cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="text-center min-w-[50px]">
              <span className="text-sm font-bold text-[#1A1A1A]">{quantity}</span>
              <span className="text-[10px] text-[#6B7280] block -mt-1">kg</span>
            </div>
            <button
              type="button"
              onClick={() => setQuantity(prev => Math.min(listing.quantityKg, prev + 5))}
              className="w-8 h-8 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center text-[#1A1A1A] hover:bg-[#F3F4F6] cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={handleAddToCart}
          >
            Add to Cart · LKR {totalPrice.toLocaleString()}
          </Button>
        </div>
      </div>

      {/* Added to Cart Overlay BottomSheet */}
      <BottomSheet
        isOpen={showAddedSheet}
        onClose={() => setShowAddedSheet(false)}
        title="Added to Cart"
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#E6F2E8] text-[#1F5C3A] flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#1A1A1A]">
              {quantity} kg of {listing.cropName}
            </h4>
            <p className="text-xs text-[#6B7280] mt-1">
              Direct from {listing.farmerName} ({listing.location.town})
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowAddedSheet(false);
                goBack();
              }}
            >
              Keep Shopping
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                setShowAddedSheet(false);
                goToSubScreen(null);
                setTab('cart');
              }}
            >
              View Cart
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

// ===================== 4. BUYER CART SCREEN =====================
export const BuyerCartScreen: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, goToSubScreen, setTab } = useApp();

  const subtotal = cart.reduce((acc, item) => acc + item.listing.pricePerKg * item.quantityKg, 0);
  const deliveryFee = cart.length > 0 ? 1500 : 0;
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="px-4 py-8">
        <EmptyState
          title="Your Farm Cart is Empty"
          description="Browse freshest vegetables, fruits and spices directly from verified Sri Lankan growers."
          actionLabel="Browse Produce"
          onAction={() => setTab('home')}
        />
      </div>
    );
  }

  // Group items by farmer holding
  const farmerGroups = cart.reduce((acc, item) => {
    const fId = item.listing.farmerId;
    if (!acc[fId]) {
      acc[fId] = {
        farmerId: fId,
        farmerName: item.listing.farmerName,
        town: item.listing.location.town,
        district: item.listing.location.district,
        items: [],
      };
    }
    acc[fId].items.push(item);
    return acc;
  }, {} as Record<string, { farmerId: string; farmerName: string; town: string; district: string; items: typeof cart }>);

  return (
    <div className="space-y-4 px-4 pt-2 pb-24 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Your Harvest Cart</h2>
          <p className="text-xs text-[#6B7280]">
            Items grouped by direct producer holding
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-[#C8452D] font-semibold hover:underline cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Cart Items Grouped by Farmer */}
      <div className="space-y-4">
        {Object.values(farmerGroups).map(group => (
          <div key={group.farmerId} className="space-y-2">
            {/* Farmer Holding Header */}
            <div className="flex items-center justify-between bg-[#E6F2E8] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1F5C3A]">
              <div className="flex items-center gap-1.5">
                <span className="font-bold">Farm: {group.farmerName}</span>
              </div>
              <span className="text-[11px] text-[#4B6B56]">
                {group.town}, {group.district}
              </span>
            </div>

            {/* Items from this farmer */}
            <div className="space-y-2">
              {group.items.map(item => (
                <Card key={item.listing._id} variant="default" padding="sm">
                  <div className="flex items-center gap-3">
                    <ProduceVisual type={item.listing.cropName} size="sm" className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#1A1A1A] truncate">
                        {item.listing.cropName}
                      </h4>
                      <p className="text-[10px] text-[#6B7280]">
                        Min order: {item.listing.minOrderKg} kg
                      </p>
                      <div className="text-xs font-bold text-[#1F5C3A] mt-0.5">
                        LKR {item.listing.pricePerKg} / kg
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-1.5 bg-[#F6F7F5] rounded-xl px-2 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(
                            item.listing._id,
                            item.quantityKg - (item.listing.minOrderKg || 5)
                          )
                        }
                        className="p-1 text-[#6B7280] hover:text-[#1A1A1A] cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#1A1A1A] min-w-[32px] text-center">
                        {item.quantityKg}kg
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(
                            item.listing._id,
                            item.quantityKg + (item.listing.minOrderKg || 5)
                          )
                        }
                        className="p-1 text-[#6B7280] hover:text-[#1A1A1A] cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.listing._id)}
                      className="p-2 text-[#9CA3AF] hover:text-[#C8452D] cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary Card */}
      <Card variant="default" padding="md" className="space-y-2">
        <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
          Order Summary (LKR)
        </h3>
        <div className="flex justify-between text-xs text-[#6B7280]">
          <span>Produce Subtotal</span>
          <span className="font-semibold text-[#1A1A1A]">
            LKR {subtotal.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-xs text-[#6B7280]">
          <span>Islandwide Delivery Fee</span>
          <span className="font-semibold text-[#1A1A1A]">
            LKR {deliveryFee.toLocaleString()}
          </span>
        </div>
        <div className="pt-2 border-t border-[#F0F0EE] flex justify-between text-sm font-extrabold text-[#1A1A1A]">
          <span>Total Order Value</span>
          <span className="text-[#1F5C3A] text-base">
            LKR {total.toLocaleString()}
          </span>
        </div>
      </Card>

      {/* Proceed Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        rightIcon={<ArrowRight className="w-4 h-4" />}
        onClick={() => goToSubScreen('checkout')}
      >
        Proceed to Checkout · LKR {total.toLocaleString()}
      </Button>
    </div>
  );
};

// ===================== 5. BUYER CHECKOUT SCREEN (DELIVERY & PAYMENT) =====================
export const BuyerCheckoutScreen: React.FC = () => {
  const { cart, currentUser, placeOrder, goToSubScreen, getOrCreateConversation } = useApp();

  // Screen Sub-step: 'delivery' | 'payment'
  const [checkoutStep, setCheckoutStep] = useState<'delivery' | 'payment'>('delivery');

  // Fulfillment Mode: Doorstep Delivery vs Direct Farm Gate Self-Pickup
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');

  // Target Farmer & Location Details from Cart
  const targetItem = cart[0]?.listing;
  const targetFarmerName = targetItem?.farmerName || 'S. Weerasinghe';
  const targetFarmerPhone = targetItem?.farmerPhone || '+94 71 892 3456';
  const targetFarmLocation = targetItem?.location || {
    district: 'Nuwara Eliya',
    town: 'Hakgala',
    lat: 6.9200,
    lng: 80.8200,
  };
  const targetFarmAddress = `${targetFarmerName}'s Organic Farm Estate, Badulla Road, ${targetFarmLocation.town}, ${targetFarmLocation.district}`;

  // Step 2: Delivery / Pickup Details State
  const [buyerName, setBuyerName] = useState(currentUser?.name || 'Dinesh Wickramasinghe');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '+94 77 345 6789');
  const [address, setAddress] = useState('No. 42/3, Havelock Road, Colombo 05');
  const [district, setDistrict] = useState('Colombo');
  const [deliveryTimeChoice, setDeliveryTimeChoice] = useState<'today' | 'tomorrow' | 'custom'>('tomorrow');
  const [customDate, setCustomDate] = useState('2026-10-08');
  const [notes, setNotes] = useState('Call gate upon arrival, delivery reception at back door');
  const [gpsDetected, setGpsDetected] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Step 3 & 4 & 5: Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'card' | 'mobile_wallet'>('cash_on_delivery');

  // COD State
  const [needChangeOption, setNeedChangeOption] = useState<string>('exact');
  const [customChangeAmount, setCustomChangeAmount] = useState<string>('5000');
  const [codAgreed, setCodAgreed] = useState<boolean>(true);

  // Card State
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 8824');
  const [cardHolder, setCardHolder] = useState('Dinesh Wickramasinghe');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('742');
  const [saveCard, setSaveCard] = useState(true);
  const [cardErrors, setCardErrors] = useState<{ number?: string; expiry?: string; cvv?: string }>({});

  // Mobile Wallet State
  const [walletProvider, setWalletProvider] = useState<'FriMi' | 'eZ Cash' | 'Genie'>('FriMi');
  const [walletPhone, setWalletPhone] = useState(buyerPhone);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Consistent Totals across the flow
  const subtotal = cart.reduce((acc, item) => acc + item.listing.pricePerKg * item.quantityKg, 0);
  const deliveryFee = deliveryMode === 'pickup' ? 0 : 1500;
  const total = subtotal + deliveryFee;

  const handleUseGps = () => {
    setIsDetectingGps(true);
    setTimeout(() => {
      setAddress('No. 42/3, Havelock Road, Colombo 05');
      setDistrict('Colombo');
      setGpsDetected(true);
      setIsDetectingGps(false);
    }, 500);
  };

  const getDeliveryTimeSlotLabel = () => {
    if (deliveryMode === 'pickup') {
      if (deliveryTimeChoice === 'today') return 'Today (Farm Gate Pickup in ~2 Hours)';
      if (deliveryTimeChoice === 'tomorrow') return 'Tomorrow (Morning Fresh Farm Pickup: 8:00 AM - 12:00 PM)';
      return `Scheduled Farm Pickup on ${customDate}`;
    }
    if (deliveryTimeChoice === 'today') return 'Today (Express Dispatch: within 3-4 hours)';
    if (deliveryTimeChoice === 'tomorrow') return 'Tomorrow (Morning 8:00 AM - 12:00 PM)';
    return `Scheduled for ${customDate} (Morning Harvest)`;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim()) {
      return;
    }
    if (deliveryMode === 'delivery' && !address.trim()) {
      return;
    }
    setCheckoutStep('payment');
  };

  const handleCompleteOrder = () => {
    // Validate card if card payment
    if (paymentMethod === 'card') {
      const errors: { number?: string; expiry?: string; cvv?: string } = {};
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 12) {
        errors.number = 'Please enter a valid 16-digit card number';
      }
      if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
        errors.expiry = 'Valid MM/YY format required';
      }
      if (cardCvv.length < 3) {
        errors.cvv = '3-digit CVV required';
      }
      if (Object.keys(errors).length > 0) {
        setCardErrors(errors);
        return;
      }
    }

    if (paymentMethod === 'cash_on_delivery' && !codAgreed) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      let cashChangeDetails = 'Exact change ready';
      if (needChangeOption === '5000') cashChangeDetails = 'Need change for LKR 5,000 note';
      else if (needChangeOption === '10000') cashChangeDetails = 'Need change for LKR 10,000 note';
      else if (needChangeOption === 'custom') cashChangeDetails = `Need change for LKR ${customChangeAmount}`;

      const cardDetails =
        paymentMethod === 'card'
          ? {
              cardLast4: cardNumber.replace(/\s+/g, '').slice(-4) || '8824',
              cardHolder,
            }
          : undefined;

      const newOrder = placeOrder({
        deliveryType: deliveryMode,
        deliveryAddress: deliveryMode === 'pickup' ? targetFarmAddress : address,
        district: deliveryMode === 'pickup' ? targetFarmLocation.district : district,
        paymentMethod,
        notes: deliveryMode === 'pickup' ? `Direct Buyer Farm Gate Pickup. ${notes}` : notes,
        buyerName,
        buyerPhone,
        deliveryTimeSlot: getDeliveryTimeSlotLabel(),
        cashChangeDetails: paymentMethod === 'cash_on_delivery' ? cashChangeDetails : undefined,
        cardDetails,
      });

      setIsSubmitting(false);
      // Navigate to Step 6: Order Confirmation Screen
      goToSubScreen('order_confirmation', { orderId: newOrder._id });
    }, 600);
  };

  return (
    <div className="p-4 space-y-4 pb-20 text-left animate-fadeIn">
      {/* Checkout Progress Stepper */}
      <div className="flex items-center justify-between pb-1 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (checkoutStep === 'payment') setCheckoutStep('delivery');
              else goToSubScreen(null);
            }}
            className="text-xs font-bold text-[#1F5C3A] hover:underline cursor-pointer"
          >
            {checkoutStep === 'payment' ? '← Back to Fulfillment' : '← Back to Cart'}
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span
            className={`px-2 py-0.5 rounded-full ${
              checkoutStep === 'delivery'
                ? 'bg-[#1F5C3A] text-white'
                : 'bg-[#E6F2E8] text-[#1F5C3A]'
            }`}
          >
            1. Fulfillment
          </span>
          <span className="text-[#9CA3AF]">→</span>
          <span
            className={`px-2 py-0.5 rounded-full ${
              checkoutStep === 'payment'
                ? 'bg-[#1F5C3A] text-white'
                : 'bg-[#F3F4F6] text-[#6B7280]'
            }`}
          >
            2. Payment
          </span>
        </div>
      </div>

      {/* STEP 1: FULFILLMENT DETAILS */}
      {checkoutStep === 'delivery' && (
        <form onSubmit={handleProceedToPayment} className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">Fulfillment Options</h2>
            <p className="text-xs text-[#6B7280]">
              Choose Doorstep Delivery or Self-Pickup directly from the farmer
            </p>
          </div>

          {/* FULFILLMENT MODE SEGMENTED TOGGLE (Uber Eats style) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#EEF0EB] rounded-2xl border border-[#E0E4DC]">
            <button
              type="button"
              onClick={() => setDeliveryMode('delivery')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                deliveryMode === 'delivery'
                  ? 'bg-white text-[#1F5C3A] shadow-xs ring-1 ring-black/5'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Doorstep Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMode('pickup')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                deliveryMode === 'pickup'
                  ? 'bg-[#1F5C3A] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Direct Farm Pickup</span>
            </button>
          </div>

          {/* Recipient / Collector Contact Card */}
          <Card variant="default" padding="md" className="space-y-3">
            <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              {deliveryMode === 'pickup' ? 'Collector Contact Information' : 'Recipient Contact'}
            </h3>
            <Input
              label={deliveryMode === 'pickup' ? 'Collector Full Name' : 'Recipient Full Name'}
              type="text"
              value={buyerName}
              onChange={e => setBuyerName(e.target.value)}
              required
            />
            <Input
              label="Contact Phone (+94)"
              type="tel"
              value={buyerPhone}
              onChange={e => setBuyerPhone(e.target.value)}
              placeholder="+94 7X XXX XXXX"
              required
            />
          </Card>

          {/* CONDITIONAL FULFILLMENT OPTION: SELF-PICKUP FROM FARM */}
          {deliveryMode === 'pickup' ? (
            <Card variant="mint" padding="md" className="space-y-3.5 border border-[#CDE5D2]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#1F5C3A] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1F5C3A]" />
                  <span>Farm Location & Direct Contact</span>
                </span>
                <span className="text-[10px] font-bold bg-[#1F5C3A] text-white px-2 py-0.5 rounded-full">
                  LKR 0 Fee
                </span>
              </div>

              {/* Farmer Profile & Direct Call Info */}
              <div className="bg-white p-3 rounded-xl border border-[#CDE5D2] space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1A1A]">{targetFarmerName}</h4>
                    <p className="text-xs text-[#1F5C3A] font-semibold">
                      Verified Direct Producer · {targetFarmLocation.district}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${targetFarmerPhone}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1F5C3A] hover:bg-[#16452B] text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                      title="Direct call to farmer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Farmer</span>
                    </a>
                  </div>
                </div>

                {/* Farm Address Details */}
                <div className="text-xs space-y-1 pt-1 border-t border-[#F0F0EE]">
                  <div className="text-[#6B7280]">
                    <span className="font-semibold text-[#1A1A1A]">Farm Address: </span>
                    {targetFarmAddress}
                  </div>
                  <div className="text-[#6B7280]">
                    <span className="font-semibold text-[#1A1A1A]">Direct Contact Phone: </span>
                    <strong className="text-[#1F5C3A] font-mono">{targetFarmerPhone}</strong>
                  </div>
                  <div className="text-[#6B7280]">
                    <span className="font-semibold text-[#1A1A1A]">GPS Coordinates: </span>
                    <span className="font-mono text-[11px] bg-[#F6F7F5] px-1.5 py-0.5 rounded">
                      {targetFarmLocation.lat.toFixed(4)}° N, {targetFarmLocation.lng.toFixed(4)}° E ({targetFarmLocation.town})
                    </span>
                  </div>
                </div>
              </div>

              {/* Pickup Instructions */}
              <div className="p-3 bg-white/80 rounded-xl border border-[#CDE5D2] text-xs text-[#374151] space-y-1">
                <div className="font-bold text-[#1F5C3A] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1F5C3A]" />
                  <span>How Direct Farm Pickup Works:</span>
                </div>
                <ul className="list-disc pl-4 text-[11px] space-y-0.5 text-[#4B6B56]">
                  <li>Farmer receives your order & harvests the fresh crop.</li>
                  <li>When packed, farmer marks "Ready" and you receive a notification.</li>
                  <li>Drive to the farm gate, present your Order ID/PIN, and collect your fresh crates.</li>
                  <li>Farm gate open 7:00 AM – 6:00 PM daily.</li>
                </ul>
              </div>

              <div>
                <label className="text-xs text-[#6B7280] block mb-1">Pickup Notes for Farmer (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Arriving in white van around 10:00 AM, need crates loaded"
                  className="w-full h-10 px-3 bg-white border border-[#CDE5D2] rounded-xl text-xs text-[#1A1A1A]"
                />
              </div>
            </Card>
          ) : (
            /* CONDITIONAL FULFILLMENT OPTION: DOORSTEP DELIVERY VIA LOGISTICS DRIVER */
            <Card variant="default" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1F5C3A]" />
                  <span>Delivery Address</span>
                </h3>
                <button
                  type="button"
                  onClick={handleUseGps}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1F5C3A] bg-[#E6F2E8] hover:bg-[#D5EAD8] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{isDetectingGps ? 'Locating...' : 'Use Current GPS'}</span>
                </button>
              </div>

              {gpsDetected && (
                <div className="flex items-center gap-1.5 text-xs text-[#1F5C3A] bg-[#E6F2E8] p-2 rounded-xl font-medium">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>GPS Location Detected (Colombo 05, Western Province)</span>
                </div>
              )}

              <div>
                <label className="text-xs text-[#6B7280] block mb-1">Province / District</label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/20"
                >
                  <option value="Colombo">Colombo (Western Province)</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Kalutara">Kalutara</option>
                  <option value="Kandy">Kandy (Central Province)</option>
                  <option value="Nuwara Eliya">Nuwara Eliya</option>
                  <option value="Galle">Galle (Southern Province)</option>
                  <option value="Matale">Matale</option>
                  <option value="Kurunegala">Kurunegala</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#6B7280] block mb-1">Street Address</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#6B7280] block mb-1">Driver Handover Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Call upon arrival at gate, drop at back store"
                  className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A]"
                />
              </div>
            </Card>
          )}

          {/* Delivery / Pickup Time Picker */}
          <Card variant="default" padding="md" className="space-y-3">
            <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#1F5C3A]" />
              <span>{deliveryMode === 'pickup' ? 'Preferred Pickup Time' : 'Choose Delivery Time'}</span>
            </h3>

            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  deliveryTimeChoice === 'today'
                    ? 'border-[#1F5C3A] bg-[#E6F2E8]'
                    : 'border-[#E5E5E5] bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="delivery_time"
                  checked={deliveryTimeChoice === 'today'}
                  onChange={() => setDeliveryTimeChoice('today')}
                  className="mt-0.5 text-[#1F5C3A] focus:ring-[#1F5C3A]"
                />
                <div>
                  <div className="text-xs font-bold text-[#1A1A1A]">
                    {deliveryMode === 'pickup' ? 'Today (Ready in ~2 Hours)' : 'Today (Express Dispatch)'}
                  </div>
                  <div className="text-[11px] text-[#6B7280]">
                    {deliveryMode === 'pickup'
                      ? 'Farmer packs directly for afternoon farm collection'
                      : 'Dispatch within 3-4 hours via regional express logistics partner'}
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  deliveryTimeChoice === 'tomorrow'
                    ? 'border-[#1F5C3A] bg-[#E6F2E8]'
                    : 'border-[#E5E5E5] bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="delivery_time"
                  checked={deliveryTimeChoice === 'tomorrow'}
                  onChange={() => setDeliveryTimeChoice('tomorrow')}
                  className="mt-0.5 text-[#1F5C3A] focus:ring-[#1F5C3A]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      {deliveryMode === 'pickup' ? 'Tomorrow Morning (Fresh Farm Gate)' : 'Tomorrow (Morning Harvest)'}
                    </span>
                    <span className="text-[10px] bg-[#1F5C3A] text-white px-1.5 py-0.2 rounded font-bold">
                      Recommended
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B7280]">
                    Morning 8:00 AM - 12:00 PM (optimal mountain dew freshness)
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  deliveryTimeChoice === 'custom'
                    ? 'border-[#1F5C3A] bg-[#E6F2E8]'
                    : 'border-[#E5E5E5] bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="delivery_time"
                  checked={deliveryTimeChoice === 'custom'}
                  onChange={() => setDeliveryTimeChoice('custom')}
                  className="mt-0.5 text-[#1F5C3A] focus:ring-[#1F5C3A]"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#1A1A1A]">Choose a Specific Date</div>
                  {deliveryTimeChoice === 'custom' && (
                    <input
                      type="date"
                      value={customDate}
                      onChange={e => setCustomDate(e.target.value)}
                      className="mt-2 w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A]"
                    />
                  )}
                </div>
              </label>
            </div>
          </Card>

          {/* Consistent Summary Bar */}
          <div className="bg-[#E6F2E8] p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[11px] text-[#4B6B56]">
                Subtotal: LKR {subtotal.toLocaleString()} + {deliveryMode === 'pickup' ? 'Pickup: Free' : `Delivery: LKR ${deliveryFee.toLocaleString()}`}
              </div>
              <div className="text-base font-black text-[#1F5C3A]">
                Total: LKR {total.toLocaleString()}
              </div>
            </div>
            <Button type="submit" variant="primary" size="md">
              Continue to Payment →
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: PAYMENT METHOD SELECTION & METHOD SPECIFIC FORMS */}
      {checkoutStep === 'payment' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">Select Payment Method</h2>
            <p className="text-xs text-[#6B7280]">
              Choose how you wish to pay for your direct farm delivery
            </p>
          </div>

          {/* Prominent Exact Total Banner */}
          <div className="bg-gradient-to-r from-[#1F5C3A] to-[#2D7A4D] text-white p-4 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/80">Total Order Amount</span>
              <div className="text-2xl font-black">LKR {total.toLocaleString()}</div>
              <div className="text-[11px] text-white/80 mt-0.5">
                Produce Subtotal: LKR {subtotal.toLocaleString()} · Delivery: LKR {deliveryFee.toLocaleString()}
              </div>
            </div>
            <ShieldCheck className="w-8 h-8 text-white/80" />
          </div>

          {/* Method Radios */}
          <Card variant="default" padding="md" className="space-y-3">
            <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              Payment Mode
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-[#1F5C3A] bg-[#E6F2E8] text-[#1F5C3A] font-bold shadow-xs'
                    : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                }`}
              >
                <Banknote className="w-5 h-5 mx-auto mb-1 text-[#1F5C3A]" />
                <span className="text-xs">Cash on Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-[#1F5C3A] bg-[#E6F2E8] text-[#1F5C3A] font-bold shadow-xs'
                    : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-[#1F5C3A]" />
                <span className="text-xs">Card Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('mobile_wallet')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'mobile_wallet'
                    ? 'border-[#1F5C3A] bg-[#E6F2E8] text-[#1F5C3A] font-bold shadow-xs'
                    : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1 text-[#1F5C3A]" />
                <span className="text-xs">Mobile Wallet</span>
              </button>
            </div>
          </Card>

          {/* PATH A: CASH ON DELIVERY FORM */}
          {paymentMethod === 'cash_on_delivery' && (
            <Card variant="default" padding="md" className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#F0F0EE] pb-2">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Cash on Delivery Details
                </span>
                <span className="text-xs font-extrabold text-[#1F5C3A]">
                  LKR {total.toLocaleString()}
                </span>
              </div>

              {/* Delivery Tips Box */}
              <div className="bg-[#FEF8EA] border border-[#FCE7C2] p-3.5 rounded-xl space-y-2 text-xs text-[#B45309]">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#E8A317] shrink-0" />
                  <span>Important Delivery Instructions</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-[#854D0E] list-disc list-inside">
                  <li>Keep exact cash ready for a swift, contactless handover with the driver.</li>
                  <li>Check item freshness and weigh crates before handing payment to the delivery rider.</li>
                  <li>Receipt and confirmation SMS will be sent immediately upon payment handover.</li>
                </ul>
              </div>

              {/* Optional Need Change Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1A1A1A] block">
                  Need Change for Cash Payment? (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNeedChangeOption('exact')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      needChangeOption === 'exact'
                        ? 'border-[#1F5C3A] bg-[#E6F2E8] text-[#1F5C3A] font-bold'
                        : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                    }`}
                  >
                    Exact change ready
                  </button>

                  <button
                    type="button"
                    onClick={() => setNeedChangeOption('5000')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      needChangeOption === '5000'
                        ? 'border-[#1F5C3A] bg-[#E6F2E8] text-[#1F5C3A] font-bold'
                        : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                    }`}
                  >
                    Need change for LKR 5,000
                  </button>

                  <button
                    type="button"
                    onClick={() => setNeedChangeOption('10000')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      needChangeOption === '10000'
                        ? 'border-[#1F5C3A] bg-[#E6F2E8] text-[#1F5C3A] font-bold'
                        : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                    }`}
                  >
                    Need change for LKR 10,000
                  </button>

                  <button
                    type="button"
                    onClick={() => setNeedChangeOption('custom')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      needChangeOption === 'custom'
                        ? 'border-[#1F5C3A] bg-[#E6F2E8] text-[#1F5C3A] font-bold'
                        : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                    }`}
                  >
                    Custom amount
                  </button>
                </div>

                {needChangeOption === 'custom' && (
                  <div className="pt-2">
                    <Input
                      label="Custom Note Amount (LKR)"
                      type="number"
                      value={customChangeAmount}
                      onChange={e => setCustomChangeAmount(e.target.value)}
                      placeholder="e.g. 20000"
                    />
                  </div>
                )}
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-2.5 p-3 bg-[#F6F7F5] rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={codAgreed}
                  onChange={e => setCodAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#1F5C3A] focus:ring-[#1F5C3A]"
                />
                <span className="text-xs text-[#4B5563]">
                  I confirm that I will inspect the produce and pay <strong>LKR {total.toLocaleString()}</strong> in cash upon delivery at {address}.
                </span>
              </label>

              {/* Complete Button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!codAgreed}
                isLoading={isSubmitting}
                onClick={handleCompleteOrder}
              >
                Confirm Order · LKR {total.toLocaleString()}
              </Button>
            </Card>
          )}

          {/* PATH B: CREDIT / DEBIT CARD FORM */}
          {paymentMethod === 'card' && (
            <Card variant="default" padding="md" className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#F0F0EE] pb-2">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Card Details
                </span>
                <span className="text-xs font-extrabold text-[#1F5C3A]">
                  LKR {total.toLocaleString()}
                </span>
              </div>

              <div className="space-y-3">
                <Input
                  label="Card Number"
                  value={cardNumber}
                  onChange={e => {
                    setCardNumber(e.target.value);
                    if (cardErrors.number) setCardErrors(prev => ({ ...prev, number: undefined }));
                  }}
                  placeholder="4532 8901 2345 8824"
                  error={cardErrors.number}
                  leftIcon={<CreditCard className="w-4 h-4" />}
                  maxLength={19}
                  required
                />

                <Input
                  label="Cardholder Name"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value)}
                  placeholder="Dinesh Wickramasinghe"
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Expiry Date"
                    value={cardExpiry}
                    onChange={e => {
                      setCardExpiry(e.target.value);
                      if (cardErrors.expiry) setCardErrors(prev => ({ ...prev, expiry: undefined }));
                    }}
                    placeholder="MM/YY"
                    error={cardErrors.expiry}
                    maxLength={5}
                    required
                  />
                  <Input
                    label="CVV / CVC"
                    type="password"
                    value={cardCvv}
                    onChange={e => {
                      setCardCvv(e.target.value);
                      if (cardErrors.cvv) setCardErrors(prev => ({ ...prev, cvv: undefined }));
                    }}
                    placeholder="123"
                    error={cardErrors.cvv}
                    maxLength={4}
                    required
                  />
                </div>

                <label className="flex items-center gap-2.5 text-xs text-[#4B5563] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={e => setSaveCard(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1F5C3A] focus:ring-[#1F5C3A]"
                  />
                  <span>Save this card securely for future harvest orders (PCI-DSS Encrypted)</span>
                </label>
              </div>

              {/* Complete Card Pay Button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                onClick={handleCompleteOrder}
              >
                Pay LKR {total.toLocaleString()} & Complete Order
              </Button>
            </Card>
          )}

          {/* PATH C: MOBILE WALLET FORM */}
          {paymentMethod === 'mobile_wallet' && (
            <Card variant="default" padding="md" className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#F0F0EE] pb-2">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Mobile Wallet Checkout
                </span>
                <span className="text-xs font-extrabold text-[#1F5C3A]">
                  LKR {total.toLocaleString()}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#1A1A1A] block mb-1">
                    Select Wallet Provider
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['FriMi', 'eZ Cash', 'Genie'] as const).map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWalletProvider(w)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                          walletProvider === w
                            ? 'border-[#1F5C3A] bg-[#E6F2E8] text-[#1F5C3A]'
                            : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Registered Mobile Phone Number"
                  value={walletPhone}
                  onChange={e => setWalletPhone(e.target.value)}
                  placeholder="+94 77 XXX XXXX"
                  required
                />

                <p className="text-[11px] text-[#6B7280] bg-[#F6F7F5] p-2.5 rounded-xl">
                  An authorization push prompt will be sent to your {walletProvider} app upon tapping Pay.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                onClick={handleCompleteOrder}
              >
                Pay via {walletProvider} · LKR {total.toLocaleString()}
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// ===================== 6. BUYER ORDER CONFIRMATION SCREEN =====================
export const BuyerOrderConfirmationScreen: React.FC = () => {
  const { navState, orders, goToSubScreen, setTab } = useApp();
  const order = orders.find(o => o._id === navState.selectedOrderId) || orders[0];

  if (!order) {
    return (
      <div className="p-4">
        <EmptyState
          title="Order Not Found"
          description="We could not locate this order confirmation."
          actionLabel="Back to Home"
          onAction={() => goToSubScreen(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-20 text-left animate-fadeIn">
      {/* Confirmation Success Hero */}
      <div className="bg-[#E6F2E8] border border-[#CDE5D2] rounded-3xl p-5 text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-[#1F5C3A] text-white flex items-center justify-center mx-auto shadow-sm">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>
        <h2 className="text-xl font-black text-[#1F5C3A]">Order Placed Successfully!</h2>
        <p className="text-xs text-[#4B6B56]">
          Farmer <strong>{order.farmerName}</strong> has been notified automatically.
        </p>
        <div className="inline-block bg-white px-3 py-1 rounded-full text-xs font-mono font-bold text-[#1F5C3A] border border-[#CDE5D2] mt-1 shadow-2xs">
          Order ID: {order.orderNumber}
        </div>
      </div>

      {/* Estimated Delivery Banner */}
      <Card variant="mint" padding="md" className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-[#1F5C3A] shrink-0" />
          <div>
            <div className="text-[10px] text-[#4B6B56] font-bold uppercase tracking-wider">
              Estimated Delivery Window
            </div>
            <div className="text-xs font-bold text-[#1A1A1A]">
              {order.deliveryTimeSlot || 'Tomorrow (Morning 8:00 AM - 12:00 PM)'}
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#1F5C3A] bg-white px-2 py-0.5 rounded-full shadow-2xs">
          On Schedule
        </span>
      </Card>

      {/* Farmer Producer Details */}
      <Card variant="default" padding="md">
        <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
          Assigned Producer Holding
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={order.farmerName} size="md" role="farmer" />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-[#1A1A1A]">{order.farmerName}</h4>
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F5C3A]" />
              </div>
              <p className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#1F5C3A]" />
                <span>{order.farmerAddress}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              window.location.href = `tel:${order.farmerPhone}`;
            }}
            className="p-2 rounded-xl bg-[#E6F2E8] text-[#1F5C3A] hover:bg-[#D5EAD8] cursor-pointer"
            aria-label="Call farmer"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Ordered Produce Items */}
      <Card variant="default" padding="md" className="space-y-3">
        <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
          Ordered Produce Items ({order.items.length})
        </h4>
        <div className="space-y-2">
          {order.items.map(item => (
            <div
              key={item.listingId}
              className="flex items-center justify-between text-xs py-1.5 border-b border-[#F0F0EE] last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <ProduceVisual type={item.cropName} size="sm" />
                <div>
                  <div className="font-bold text-[#1A1A1A]">{item.cropName}</div>
                  <div className="text-[10px] text-[#6B7280]">
                    {item.quantityKg} kg @ LKR {item.pricePerKg}/kg
                  </div>
                </div>
              </div>
              <span className="font-extrabold text-[#1F5C3A]">
                LKR {(item.pricePerKg * item.quantityKg).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Financial Summary (Strictly Identical across screens!) */}
      <Card variant="default" padding="md" className="space-y-2">
        <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
          Payment & Charges Summary
        </h4>
        <div className="flex justify-between text-xs text-[#6B7280]">
          <span>Produce Subtotal:</span>
          <span className="font-semibold text-[#1A1A1A]">
            LKR {order.subtotal.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-xs text-[#6B7280]">
          <span>Islandwide Delivery Fee:</span>
          <span className="font-semibold text-[#1A1A1A]">
            LKR {order.deliveryFee.toLocaleString()}
          </span>
        </div>
        <div className="pt-2 border-t border-[#F0F0EE] flex justify-between text-sm font-extrabold text-[#1A1A1A]">
          <span>Total Paid / Payable:</span>
          <span className="text-[#1F5C3A] text-base">
            LKR {order.total.toLocaleString()}
          </span>
        </div>

        <div className="pt-2 mt-2 border-t border-[#F0F0EE] text-[11px] text-[#6B7280] space-y-1">
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="font-bold text-[#1A1A1A] uppercase">
              {order.paymentMethod.replace(/_/g, ' ')}
            </span>
          </div>
          {order.cashChangeDetails && (
            <div className="flex justify-between text-[#B45309]">
              <span>Change Request:</span>
              <span className="font-semibold">{order.cashChangeDetails}</span>
            </div>
          )}
          {order.cardDetails && (
            <div className="flex justify-between text-[#1F5C3A]">
              <span>Card:</span>
              <span className="font-semibold">•••• •••• •••• {order.cardDetails.cardLast4}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Delivery Recipient Info */}
      <Card variant="default" padding="md" className="space-y-1.5 text-xs">
        <h4 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
          Destination & Recipient
        </h4>
        <div className="font-bold text-[#1A1A1A]">
          {order.buyerName} · {order.buyerPhone}
        </div>
        <div className="text-[#6B7280]">{order.deliveryAddress}</div>
        {order.deliveryNotes && (
          <div className="text-[11px] text-[#4B6B56] bg-[#F6F7F5] p-2 rounded-lg mt-1">
            Note: {order.deliveryNotes}
          </div>
        )}
      </Card>

      {/* Initial Status Timeline (Starts at Pending) */}
      <Card variant="default" padding="md" className="space-y-3">
        <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
          Fulfillment Status
        </h4>
        <div className="flex items-center gap-3 bg-[#FEF8EA] p-3 rounded-xl border border-[#FCE7C2]">
          <span className="w-3 h-3 rounded-full bg-[#E8A317] animate-pulse shrink-0" />
          <div className="text-xs text-[#B45309]">
            <div className="font-bold">Pending Farmer Acceptance</div>
            <div className="text-[10px] text-[#854D0E] mt-0.5">
              Sunil Bandara is reviewing batch volume in Kandapola. The status updates automatically in real time.
            </div>
          </div>
        </div>
      </Card>

      {/* Primary Actions */}
      <div className="space-y-2 pt-1">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-4 h-4" />}
          onClick={() => goToSubScreen('order_tracking', { orderId: order._id })}
        >
          Track Order in Real Time →
        </Button>
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={() => {
            goToSubScreen(null);
            setTab('home');
          }}
        >
          Return to Marketplace
        </Button>
      </div>
    </div>
  );
};

// ===================== 7. BUYER ORDER TRACKING SCREEN =====================
export const BuyerOrderTrackingScreen: React.FC = () => {
  const { navState, orders, advanceOrderStatus, goToSubScreen, setTab, getOrCreateConversation } = useApp();
  const order = orders.find(o => o._id === navState.selectedOrderId) || orders[0];

  if (!order) {
    return (
      <div className="p-4">
        <EmptyState
          title="Order not found"
          description="We couldn't locate this order."
          actionLabel="Go to Orders"
          onAction={() => setTab('profile')}
        />
      </div>
    );
  }

  const isPickup = order.deliveryType === 'pickup';

  const markers = [
    {
      id: 'farmer_loc',
      name: order.farmerName,
      district: 'Central',
      town: order.farmerAddress,
      lat: order.pickupLocation?.lat || 6.9697,
      lng: order.pickupLocation?.lng || 80.7891,
      type: 'farmer' as const,
    },
    ...(!isPickup && order.status === 'out_for_delivery'
      ? [
          {
            id: 'driver_loc',
            name: order.driverName || 'Logistics Driver',
            district: 'Transit',
            town: 'Kadawatha A1 Highway',
            lat: 7.084,
            lng: 80.0098,
            type: 'driver' as const,
          },
        ]
      : []),
    {
      id: 'buyer_loc',
      name: order.buyerName,
      district: order.deliveryDistrict,
      town: order.deliveryAddress,
      lat: 6.9271,
      lng: 79.8612,
      type: 'buyer' as const,
    },
  ];

  return (
    <div className="p-4 space-y-4 pb-20 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#6B7280] font-mono">{order.orderNumber}</span>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                isPickup
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {isPickup ? '🏪 Direct Farm Pickup' : '🚚 Doorstep Delivery'}
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Live Order Tracking</h2>
        </div>
        <StatusPill status={order.status} />
      </div>

      {/* Real-Time Live Status Simulator Bar */}
      {order.status !== 'delivered' && (
        <Card variant="mint" padding="sm" className="space-y-2 border border-[#CDE5D2]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1F5C3A] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1F5C3A] animate-ping" />
              <span>Real-Time Status Simulator</span>
            </span>
            <span className="text-[10px] text-[#4B6B56] font-mono">Uber-Eats style sync</span>
          </div>
          <p className="text-[11px] text-[#4B6B56]">
            {isPickup
              ? 'Follow live milestones as the farmer prepares your harvest at the farm gate:'
              : 'Follow live milestones as farmer packs and fleet driver delivers to your door:'}
          </p>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => advanceOrderStatus(order._id)}
          >
            Advance to Next Milestone: {
              order.status === 'pending'
                ? 'Farmer Accepts Order →'
                : order.status === 'accepted'
                ? 'Harvest & Pack in Crates →'
                : order.status === 'preparing'
                ? (isPickup ? 'Farmer Marks Ready for Pickup →' : 'Farmer Marks Ready for Driver →')
                : order.status === 'ready_for_pickup'
                ? (isPickup ? 'Confirm Farm Gate Handover →' : 'Driver Roshan Dispatches →')
                : 'Confirm Handover & Deliver →'
            }
          </Button>
        </Card>
      )}

      {/* SPECIAL CARD: SELF-PICKUP FARM GATE PASS & LOCATION */}
      {isPickup ? (
        <Card variant="mint" padding="md" className="space-y-3 border border-[#CDE5D2]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#1F5C3A] uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#1F5C3A]" />
              <span>Farm Gate Pickup Pass</span>
            </span>
            <span className="text-xs font-mono font-extrabold bg-[#1F5C3A] text-white px-2 py-0.5 rounded-lg shadow-2xs">
              PIN: #{order.pickupPin || '4821'}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#CDE5D2] space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1A1A1A]">{order.farmerName}</h4>
                <p className="text-xs text-[#1F5C3A] font-medium">Direct Producer Farm Estate</p>
              </div>
              <div className="flex gap-1.5">
                <a
                  href={`tel:${order.farmerPhone}`}
                  className="p-2 rounded-xl bg-[#E6F2E8] hover:bg-[#D5EAD8] text-[#1F5C3A] flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer"
                  title="Call farmer directly"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const convId = getOrCreateConversation(order.farmerId, order.farmerName, order.items[0]?.cropName);
                    goToSubScreen('chat_detail', { conversationId: convId });
                  }}
                  className="p-2 rounded-xl bg-[#F6F7F5] hover:bg-[#EAEAEA] text-[#1A1A1A] flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
                  title="Message farmer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
              </div>
            </div>

            <div className="text-xs space-y-1 pt-1.5 border-t border-[#F0F0EE]">
              <div className="text-[#4B5563]">
                <strong className="text-[#1A1A1A]">Farm Address: </strong>
                {order.farmerAddress}
              </div>
              <div className="text-[#4B5563]">
                <strong className="text-[#1A1A1A]">Farmer Phone: </strong>
                <span className="font-mono font-bold text-[#1F5C3A]">{order.farmerPhone}</span>
              </div>
              {order.pickupLocation?.directions && (
                <div className="text-[11px] text-[#6B7280] italic">
                  Directions: {order.pickupLocation.directions}
                </div>
              )}
            </div>
          </div>

          {/* Current Pickup State Highlight */}
          <div className="p-3 bg-white/90 rounded-xl border border-[#CDE5D2] text-xs space-y-1">
            {order.status === 'ready_for_pickup' ? (
              <div className="text-[#1F5C3A] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F5C3A] shrink-0" />
                <span>Your harvest is PACKED and waiting at the farm gate!</span>
              </div>
            ) : order.status === 'preparing' ? (
              <div className="text-[#2E8C9F] font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2E8C9F] shrink-0" />
                <span>Farmer is harvesting & packing your crops right now.</span>
              </div>
            ) : order.status === 'delivered' ? (
              <div className="text-[#1F5C3A] font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#1F5C3A] shrink-0" />
                <span>Harvest collected and handed over at farm gate!</span>
              </div>
            ) : (
              <div className="text-[#B45309] font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#B45309] shrink-0" />
                <span>Farmer reviewing order. You will be notified once harvest is packed.</span>
              </div>
            )}
          </div>
        </Card>
      ) : null}

      {/* Live Map Route */}
      <SriLankaMap
        markers={markers}
        showRoute={!isPickup && order.status === 'out_for_delivery'}
        routeTitle={
          isPickup
            ? `Self-Pickup at ${order.farmerAddress.split(',')[0]}`
            : `${order.farmerAddress.split(',')[0]} ➔ ${order.deliveryDistrict}`
        }
        className="h-56"
      />

      {/* Driver Card (for Doorstep Delivery) */}
      {!isPickup && (order.status === 'out_for_delivery' || order.status === 'delivered') && order.driverName && (
        <Card variant="mint" padding="md" className="border border-[#CDE5D2]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={order.driverName} size="md" role="driver" />
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A]">{order.driverName}</h4>
                <p className="text-[10px] text-[#4B6B56]">{order.driverVehicle}</p>
                <div className="text-[10px] text-[#1F5C3A] font-semibold mt-0.5">
                  {order.status === 'delivered'
                    ? `Delivered parcel successfully at ${order.deliveredAt || 'destination'}`
                    : 'Goviya Fleet Partner · En route to your address'}
                </div>
              </div>
            </div>
            <a
              href={`tel:${order.driverPhone}`}
              className="p-2.5 bg-white text-[#1F5C3A] rounded-xl border border-[#CDE5D2] hover:bg-[#E6F2E8] shadow-2xs transition-colors cursor-pointer"
              aria-label="Call driver"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </Card>
      )}

      {/* Milestone Timeline */}
      <Card variant="default" padding="md" className="space-y-4">
        <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
          Fulfillment Milestones
        </h3>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E5E5]">
          {order.timeline.map((step, idx) => (
            <div key={idx} className="relative">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#1F5C3A] ring-4 ring-white" />
              <div>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-xs font-bold text-[#1A1A1A]">{step.label}</h4>
                  <span className="text-[10px] text-[#9CA3AF] font-mono">{step.timestamp}</span>
                </div>
                {step.note && (
                  <p className="text-[11px] text-[#6B7280] mt-0.5">{step.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Order Produce Items & Strictly Identical Summary */}
      <Card variant="default" padding="md">
        <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
          Ordered Crops ({order.items.length})
        </h3>
        <div className="space-y-2">
          {order.items.map(i => (
            <div key={i.listingId} className="flex items-center justify-between text-xs py-1 border-b border-[#F0F0EE]">
              <div className="flex items-center gap-2">
                <ProduceVisual type={i.cropName} size="sm" />
                <div>
                  <div className="font-bold text-[#1A1A1A]">{i.cropName}</div>
                  <div className="text-[10px] text-[#6B7280]">{i.quantityKg} kg</div>
                </div>
              </div>
              <span className="font-bold text-[#1F5C3A]">
                LKR {(i.pricePerKg * i.quantityKg).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 mt-3 border-t border-[#F0F0EE] space-y-1 text-xs">
          <div className="flex justify-between text-[#6B7280]">
            <span>Produce Subtotal:</span>
            <span className="font-semibold text-[#1A1A1A]">LKR {order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[#6B7280]">
            <span>{isPickup ? 'Direct Farm Pickup Fee:' : 'Islandwide Delivery Fee:'}</span>
            <span className="font-semibold text-[#1A1A1A]">
              {isPickup ? 'LKR 0 (Free)' : `LKR ${order.deliveryFee.toLocaleString()}`}
            </span>
          </div>
          <div className="pt-2 border-t border-[#F0F0EE] flex justify-between font-extrabold text-[#1A1A1A]">
            <span>Total Value:</span>
            <span className="text-[#1F5C3A] text-sm">LKR {order.total.toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ===================== 7. BUYER CHAT INBOX & CONVERSATION =====================
export const BuyerChatScreen: React.FC = () => {
  const { conversations, messages, currentUser, navState, sendMessage, goToSubScreen } = useApp();
  const [inputText, setInputText] = useState('');

  const activeConvId = navState.selectedConversationId || conversations[0]?._id;
  const activeConv = conversations.find(c => c._id === activeConvId);
  const activeMessages = messages.filter(m => m.conversationId === activeConvId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;
    sendMessage(activeConvId, inputText);
    setInputText('');
  };

  const otherParticipant = activeConv?.participants.find(
    p => p.userId !== currentUser?._id
  ) || activeConv?.participants[1];

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] text-left">
      {/* Top Conversation Header */}
      {otherParticipant && (
        <div className="p-3 bg-white border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar name={otherParticipant.name} size="sm" role={otherParticipant.role} />
            <div>
              <h4 className="text-xs font-bold text-[#1A1A1A]">{otherParticipant.name}</h4>
              <p className="text-[10px] text-[#1F5C3A] font-medium">
                Verified Producer · Active Now
              </p>
            </div>
          </div>
          <span className="text-[10px] text-[#6B7280] bg-[#F6F7F5] px-2 py-1 rounded-full">
            {activeConv?.relatedCropName}
          </span>
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F6F7F5]">
        {activeMessages.map(msg => {
          const isMe = msg.senderId === currentUser?._id;

          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {msg.type === 'product' && msg.listingData && (
                <div className="max-w-xs mb-1 p-2.5 bg-white rounded-2xl border border-[#E5E5E5] shadow-xs flex items-center gap-2">
                  <ProduceVisual type={msg.listingData.cropName} size="sm" />
                  <div>
                    <div className="text-xs font-bold text-[#1A1A1A]">
                      {msg.listingData.cropName}
                    </div>
                    <div className="text-[10px] text-[#1F5C3A] font-extrabold">
                      LKR {msg.listingData.pricePerKg} / kg
                    </div>
                  </div>
                </div>
              )}

              {msg.type === 'order_request' && msg.orderRequestData && (
                <div className="max-w-xs mb-1 p-3 bg-[#E6F2E8] border border-[#CDE5D2] rounded-2xl text-left">
                  <span className="text-[10px] font-bold uppercase text-[#1F5C3A]">
                    Order Request
                  </span>
                  <div className="text-xs font-bold text-[#1A1A1A] mt-0.5">
                    {msg.orderRequestData.cropName}
                  </div>
                  <div className="text-[11px] text-[#4B6B56]">
                    Quantity: {msg.orderRequestData.quantityKg} kg @ LKR {msg.orderRequestData.offerPricePerKg}/kg
                  </div>
                </div>
              )}

              <div
                className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                  isMe
                    ? 'bg-[#1F5C3A] text-white rounded-br-xs'
                    : 'bg-white text-[#1A1A1A] border border-[#E5E5E5] rounded-bl-xs'
                }`}
              >
                {msg.content}
              </div>

              <span className="text-[9px] text-[#9CA3AF] mt-1 px-1 font-mono">
                {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#E5E5E5] flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Ask farmer about harvest, dispatch time..."
          className="flex-1 h-11 px-4 bg-[#F6F7F5] border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/20"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="shrink-0"
          disabled={!inputText.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

// ===================== 8. BUYER PROFILE & ORDERS SCREEN =====================
export const BuyerProfileScreen: React.FC = () => {
  const {
    currentUser,
    orders,
    logout,
    goToSubScreen,
    setTab,
    loginAsRole,
    openAuth,
    switchRole,
    getOrCreateConversation,
    updateCurrentUser,
    fileComplaint,
    addToCart,
    listings,
  } = useApp();

  // Active / Filter states
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'si' | 'ta'>('en');

  // Interactive Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isSavedFarmsOpen, setIsSavedFarmsOpen] = useState(false);
  const [isInvoicesOpen, setIsInvoicesOpen] = useState(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Selected Invoice modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Profile Form State
  const [editName, setEditName] = useState(currentUser?.name || 'Dinesh Wickramasinghe');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '+94 77 345 6789');
  const [editEmail, setEditEmail] = useState(currentUser?.email || 'dinesh.w@colombofresh.lk');
  const [editBusiness, setEditBusiness] = useState('Colombo Fresh Supermarkets (Pvt) Ltd');
  const [editAddress, setEditAddress] = useState(currentUser?.location?.address || 'No. 42/3, Havelock Road, Colombo 05');
  const [editDistrict, setEditDistrict] = useState(currentUser?.location?.district || 'Colombo');
  const [editTaxNumber, setEditTaxNumber] = useState('PV-00294182 / VAT 1142981');

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 'addr_1',
      label: 'Primary Supermarket Hub',
      street: 'No. 42/3, Havelock Road',
      town: 'Colombo 05',
      district: 'Colombo',
      isDefault: true,
      phone: '+94 77 345 6789',
      notes: 'Unloading ramp available at back entrance, open 6 AM - 9 PM',
    },
    {
      id: 'addr_2',
      label: 'Pannipitiya Central Depot',
      street: 'No. 114, High Level Road, Moraketiya',
      town: 'Pannipitiya',
      district: 'Colombo',
      isDefault: false,
      phone: '+94 77 889 1234',
      notes: 'Cold crate receiving warehouse, notify supervisor prior to dispatch',
    },
    {
      id: 'addr_3',
      label: 'Mount Lavinia Retail Outlet',
      street: 'No. 88, Galle Road',
      town: 'Mount Lavinia',
      district: 'Colombo',
      isDefault: false,
      phone: '+94 71 234 5678',
      notes: 'Direct shop delivery, call storefront bell upon arrival',
    },
  ]);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrDistrict, setNewAddrDistrict] = useState('Colombo');
  const [newAddrPhone, setNewAddrPhone] = useState('+94 77 345 6789');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'pay_card_1',
      type: 'card',
      title: 'Commercial Bank Visa Platinum',
      brand: 'Visa',
      last4: '8824',
      expiry: '08/28',
      holder: 'Dinesh Wickramasinghe',
      isDefault: true,
    },
    {
      id: 'pay_wallet_1',
      type: 'wallet',
      title: 'LankaPay Direct Debit',
      brand: 'LankaPay / CEFTS',
      last4: '5519',
      expiry: 'Direct Link',
      holder: 'Colombo Fresh Supermarkets',
      isDefault: false,
    },
    {
      id: 'pay_cod',
      type: 'cod',
      title: 'Cash on Delivery (Exact Change)',
      brand: 'COD',
      last4: 'Cash',
      expiry: 'On Arrival',
      holder: 'Store Receptionist',
      isDefault: false,
    },
  ]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    pushOrders: true,
    smsHarvest: true,
    whatsappDriver: true,
    priceAlerts: false,
    weeklyMarketDigest: true,
  });

  // Favorite Farms
  const [favoriteFarms, setFavoriteFarms] = useState([
    {
      id: 'user_farmer_4',
      name: 'Bandula Wijesinghe',
      farmName: 'Pannipitiya Organic Green Agro',
      district: 'Colombo',
      town: 'Pannipitiya',
      rating: 4.9,
      crops: ['Fresh Brinjals (Wambatu)', 'Organic Mukunuwenna', 'Gotukola'],
      certified: true,
    },
    {
      id: 'user_farmer_5',
      name: 'Kusumawathi Jayasinghe',
      farmName: 'Pannipitiya Lowland Harvest Farm',
      district: 'Colombo',
      town: 'Pannipitiya',
      rating: 4.8,
      crops: ['Tender Okra (Bandakka)', 'Snake Gourd (Pathola)'],
      certified: true,
    },
    {
      id: 'user_farmer_1',
      name: 'Sunil Bandara',
      farmName: 'Kandapola Highland Eco Farm',
      district: 'Nuwara Eliya',
      town: 'Kandapola',
      rating: 4.9,
      crops: ['Highland Carrots', 'Green Cabbage', 'Leeks'],
      certified: true,
    },
    {
      id: 'user_farmer_2',
      name: 'Sivakumar Nadarajah',
      farmName: 'Jaffna Red Onion & Chili Agro',
      district: 'Jaffna',
      town: 'Kopay',
      rating: 4.8,
      crops: ['Jaffna Red Onions', 'Green Chili'],
      certified: true,
    },
  ]);

  // Dispute / Report a Problem State
  const [disputeOrderId, setDisputeOrderId] = useState(orders[0]?._id || '');
  const [disputeCategory, setDisputeCategory] = useState<'quality' | 'weight' | 'delay' | 'price' | 'packaging'>('quality');
  const [disputeSeverity, setDisputeSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [disputeSuccessId, setDisputeSuccessId] = useState<string | null>(null);

  // FAQ Accordion
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Filtered orders
  const myOrders = orders.filter(o => o.buyerId === currentUser?._id || o.buyerPhone === currentUser?.phone);
  const activeOrders = myOrders.filter(o => !['delivered', 'rejected', 'cancelled'].includes(o.status));
  const completedOrders = myOrders.filter(o => o.status === 'delivered');

  const displayedOrders = myOrders.filter(o => {
    if (orderFilter === 'active') return !['delivered', 'rejected', 'cancelled'].includes(o.status);
    if (orderFilter === 'completed') return o.status === 'delivered';
    return true;
  });

  const totalSpent = myOrders.reduce((acc, o) => acc + (o.total || 0), 0);

  // Handlers
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name: editName,
      phone: editPhone,
      email: editEmail,
      location: {
        lat: currentUser?.location?.lat || 6.9271,
        lng: currentUser?.location?.lng || 79.8612,
        district: editDistrict,
        address: editAddress,
      },
    });
    setIsEditProfileOpen(false);
    showToast('Profile information updated successfully!');
  };

  const handleSetDefaultAddress = (id: string) => {
    setSavedAddresses(prev =>
      prev.map(a => ({ ...a, isDefault: a.id === id }))
    );
    showToast('Default delivery address updated!');
  };

  const handleDeleteAddress = (id: string) => {
    if (savedAddresses.length <= 1) {
      showToast('You must keep at least one saved delivery address.');
      return;
    }
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
    showToast('Address removed.');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet.trim()) return;
    const newAddress = {
      id: `addr_${Date.now()}`,
      label: newAddrLabel || 'New Delivery Location',
      street: newAddrStreet,
      town: newAddrDistrict,
      district: newAddrDistrict,
      isDefault: false,
      phone: newAddrPhone,
      notes: 'Scheduled receiving point',
    };
    setSavedAddresses(prev => [...prev, newAddress]);
    setNewAddrStreet('');
    setNewAddrLabel('');
    setIsAddingAddress(false);
    showToast('New delivery address saved!');
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(p => ({ ...p, isDefault: p.id === id }))
    );
    showToast('Default payment method set!');
  };

  const handleDeletePayment = (id: string) => {
    if (paymentMethods.length <= 1) {
      showToast('You must keep at least one payment method.');
      return;
    }
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
    showToast('Payment method removed.');
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = newCardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 12) {
      showToast('Please enter a valid card number.');
      return;
    }
    const newCard = {
      id: `pay_card_${Date.now()}`,
      type: 'card',
      title: 'Commercial Card',
      brand: cleanNum.startsWith('4') ? 'Visa' : 'Mastercard',
      last4: cleanNum.slice(-4),
      expiry: newCardExpiry || '12/28',
      holder: newCardHolder || editName,
      isDefault: false,
    };
    setPaymentMethods(prev => [newCard, ...prev]);
    setIsAddingCard(false);
    setNewCardNumber('');
    setNewCardHolder('');
    setNewCardExpiry('');
    setNewCardCvv('');
    showToast('New card successfully added and verified!');
  };

  const handleReorder = (order: any) => {
    let countAdded = 0;
    order.items.forEach((item: any) => {
      const matchListing = listings.find(l => l._id === item.listingId || l.cropName === item.cropName);
      if (matchListing) {
        addToCart(matchListing, item.quantityKg);
        countAdded++;
      }
    });
    showToast(`Added ${countAdded} produce items from ${order.farmerName} to cart!`);
    setIsOrdersModalOpen(false);
    setTab('cart');
  };

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDetails.trim()) {
      showToast('Please provide a brief description of the issue.');
      return;
    }
    const relatedOrder = myOrders.find(o => o._id === disputeOrderId) || myOrders[0];
    const newComplaint = fileComplaint({
      complainantId: currentUser?._id || 'user_buyer_1',
      complainantName: currentUser?.name || 'Dinesh Wickramasinghe',
      targetId: relatedOrder?.farmerId || 'user_farmer_1',
      targetName: relatedOrder?.farmerName || 'Agricultural Producer',
      targetType: 'farmer',
      reason: `${disputeCategory.toUpperCase()}: ${disputeDetails.slice(0, 40)}`,
      details: disputeDetails,
      severity: disputeSeverity,
    });
    setDisputeSuccessId(newComplaint._id);
    setDisputeDetails('');
    showToast('Dispute ticket registered. Agrarian resolution team assigned.');
  };

  return (
    <div className="p-4 space-y-4 pb-24 text-left max-w-lg mx-auto animate-fadeIn">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1F5C3A] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-[#A3D9A5] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">Profile</h1>
          <p className="text-xs text-[#6B7280]">
            Commercial Buyer Account · Verified Direct Trade
          </p>
        </div>
        <span className="text-[10px] font-bold text-[#1F5C3A] bg-[#E6F2E8] px-2.5 py-1 rounded-full border border-[#CDE5D2]">
          Islandwide Fleet Active
        </span>
      </div>

      {/* 1. Main Profile Card (or Guest Card when unauthenticated) */}
      {!currentUser ? (
        <div className="bg-[#E6F2E8] border border-[#CDE5D2] rounded-2xl p-4 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1F5C3A] text-white flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
              🛒
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1A1A1A]">Browsing as Guest</h2>
                <span className="text-[10px] font-bold text-[#1F5C3A] bg-white px-2 py-0.5 rounded-full border border-[#CDE5D2]">
                  No Login Required
                </span>
              </div>
              <p className="text-xs text-[#4B6B56] mt-0.5">
                Explore local harvests, Dambulla price benchmarks & verified farms freely.
              </p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#D5EAD8] text-xs space-y-1.5 text-[#374151]">
            <div className="font-bold text-[#1F5C3A] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#1F5C3A]" />
              <span>Sign in to unlock full marketplace features:</span>
            </div>
            <ul className="list-disc pl-4 text-[11px] text-[#4B6B56] space-y-0.5">
              <li>Place orders with doorstep delivery or direct farm gate pickup</li>
              <li>Live real-time delivery tracking (Uber Eats style)</li>
              <li>Direct chat with local farmers in Nuwara Eliya, Jaffna & Kandy</li>
              <li>Save delivery addresses & tax registration numbers</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => openAuth('buyer', 'login')}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => openAuth('buyer', 'register')}
            >
              Create Account
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4 shadow-2xs space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="relative">
              <Avatar name={currentUser?.name || 'Buyer'} size="lg" role="buyer" />
              <span
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1F5C3A] text-white flex items-center justify-center border-2 border-white shadow-xs cursor-pointer hover:bg-[#18482D]"
                onClick={() => setIsEditProfileOpen(true)}
                title="Edit Profile Picture"
              >
                <Edit3 className="w-3 h-3" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base font-extrabold text-[#1A1A1A] truncate">
                  {currentUser?.name || 'Dinesh Wickramasinghe'}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1F5C3A] bg-[#E6F2E8] px-2 py-0.5 rounded-full border border-[#CDE5D2]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1F5C3A]" />
                  Verified Buyer
                </span>
              </div>

              <p className="text-xs font-medium text-[#4B6B56] mt-0.5 truncate">
                {editBusiness}
              </p>

              <div className="flex flex-col gap-0.5 mt-2 text-[11px] text-[#6B7280]">
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                  <span>{currentUser?.phone || '+94 77 345 6789'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                  <span className="truncate">{currentUser?.email || 'dinesh.w@colombofresh.lk'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                  <span className="truncate">{currentUser?.location?.address || 'Colombo 05, Western Province'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Edit Profile Action */}
          <div className="pt-2 border-t border-[#F0F0EE] flex items-center justify-between">
            <span className="text-[11px] text-[#6B7280]">
              Tax Reg: <strong className="text-[#1A1A1A] font-mono text-[10px]">PV-00294182</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1F5C3A] hover:text-[#18482D] hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>
        </div>
      )}

      {/* 2. Key Metrics & Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => {
            setOrderFilter('all');
            setIsOrdersModalOpen(true);
          }}
          className="p-3 bg-white rounded-2xl border border-[#E5E5E5] text-left hover:border-[#1F5C3A]/50 transition-all shadow-2xs group cursor-pointer"
        >
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
            Orders Placed
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-[#1A1A1A]">{myOrders.length}</span>
            <span className="text-[10px] text-[#6B7280]">total</span>
          </div>
          <span className="text-[10px] font-semibold text-[#1F5C3A] group-hover:underline mt-1 block">
            View orders →
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setOrderFilter('active');
            setIsOrdersModalOpen(true);
          }}
          className="p-3 bg-white rounded-2xl border border-[#E5E5E5] text-left hover:border-[#1F5C3A]/50 transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
              In Transit
            </span>
            <span className="w-2 h-2 rounded-full bg-[#1F5C3A] animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-[#1F5C3A]">{activeOrders.length}</span>
            <span className="text-[10px] text-[#4B6B56]">live</span>
          </div>
          <span className="text-[10px] font-semibold text-[#1F5C3A] group-hover:underline mt-1 block">
            Track now →
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsSavedFarmsOpen(true)}
          className="p-3 bg-white rounded-2xl border border-[#E5E5E5] text-left hover:border-[#1F5C3A]/50 transition-all shadow-2xs group cursor-pointer"
        >
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
            Saved Farms
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-[#1A1A1A]">{favoriteFarms.length}</span>
            <span className="text-[10px] text-[#6B7280]">producers</span>
          </div>
          <span className="text-[10px] font-semibold text-[#1F5C3A] group-hover:underline mt-1 block">
            Direct chat →
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsInvoicesOpen(true)}
          className="p-3 bg-white rounded-2xl border border-[#E5E5E5] text-left hover:border-[#1F5C3A]/50 transition-all shadow-2xs group cursor-pointer"
        >
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
            Total Spend
          </span>
          <div className="mt-1 truncate">
            <span className="text-sm font-black text-[#1A1A1A] truncate block">
              LKR {totalSpent.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-[#1F5C3A] group-hover:underline mt-1 block">
            Tax receipts →
          </span>
        </button>
      </div>

      {/* 3. GROUPED ACTION MENUS (iOS/Android Modern Profile Sections) */}

      {/* SECTION A: ORDERS & HARVEST ACTIVITY */}
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider px-1">
          Orders & Direct Farm Trade
        </h3>
        <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden divide-y divide-[#F0F0EE] shadow-2xs">
          {/* My Orders Button */}
          <button
            type="button"
            onClick={() => {
              setOrderFilter('all');
              setIsOrdersModalOpen(true);
            }}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9FAF8] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E6F2E8] text-[#1F5C3A] flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A]">
                    My Orders
                  </h4>
                  <span className="text-[10px] font-bold text-[#1F5C3A] bg-[#E6F2E8] px-2 py-0.2 rounded-full">
                    {myOrders.length}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Real-time GPS tracking, status timeline & receipts
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1F5C3A] transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Saved Farms Button */}
          <button
            type="button"
            onClick={() => setIsSavedFarmsOpen(true)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9FAF8] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-[#DC2626]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A]">
                    Saved & Favorite Farms
                  </h4>
                  <span className="text-[10px] font-bold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.2 rounded-full">
                    {favoriteFarms.length} Farms
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Pannipitiya, Nuwara Eliya & Jaffna direct producers
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1F5C3A] transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Invoices & Receipts Button */}
          <button
            type="button"
            onClick={() => setIsInvoicesOpen(true)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9FAF8] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A]">
                    Order Invoices & Receipts
                  </h4>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Download digital VAT & Agrarian Development receipts
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1F5C3A] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* SECTION B: ACCOUNT & DELIVERY PREFERENCES */}
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider px-1">
          Account & Delivery Preferences
        </h3>
        <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden divide-y divide-[#F0F0EE] shadow-2xs">
          {/* Saved Delivery Addresses */}
          <button
            type="button"
            onClick={() => setIsAddressesOpen(true)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9FAF8] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A]">
                    Delivery Addresses
                  </h4>
                  <span className="text-[10px] font-bold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.2 rounded-full">
                    {savedAddresses.length} saved
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Primary: Havelock Road, Colombo 05
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1F5C3A] transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Payment Methods & LankaPay */}
          <button
            type="button"
            onClick={() => setIsPaymentsOpen(true)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9FAF8] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A]">
                    Payment Methods & LankaPay
                  </h4>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Visa •••• 8824, LankaPay Direct Debit, Cash on Delivery
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1F5C3A] transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Personal & Business Info */}
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9FAF8] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A]">
                    Personal & Business Information
                  </h4>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Business tax registration, phone & buyer authentication
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1F5C3A] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* SECTION C: PREFERENCES & ALERTS */}
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider px-1">
          Preferences & Alerts
        </h3>
        <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden divide-y divide-[#F0F0EE] shadow-2xs">
          {/* Notification Settings */}
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9FAF8] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A]">
                    Notification Settings
                  </h4>
                  <span className="text-[10px] font-bold text-[#1F5C3A] bg-[#E6F2E8] px-2 py-0.2 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Real-time dispatch, SMS harvest alerts & WhatsApp
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1F5C3A] transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Language Selection */}
          <button
            type="button"
            onClick={() => setIsLanguageOpen(true)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9FAF8] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A]">
                    Language Selection
                  </h4>
                  <span className="text-[10px] font-bold text-[#1F5C3A] bg-[#E6F2E8] px-2 py-0.2 rounded-full">
                    {selectedLanguage === 'en' ? 'English' : selectedLanguage === 'si' ? 'සිංහල' : 'தமிழ்'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  English · සිංහල · தமிழ்
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1F5C3A] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* SECTION D: SUPPORT & COMMUNITY */}
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider px-1">
          Support & Trust
        </h3>
        <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden divide-y divide-[#F0F0EE] shadow-2xs">
          {/* Help & FAQ Center */}
          <button
            type="button"
            onClick={() => setIsFaqOpen(true)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9FAF8] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A]">
                  Help & FAQ Center
                </h4>
                <p className="text-[11px] text-[#6B7280]">
                  Delivery guidelines, quality guarantees & bulk pricing
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1F5C3A] transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Contact Support & WhatsApp */}
          <button
            type="button"
            onClick={() => setIsSupportOpen(true)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9FAF8] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E6F2E8] text-[#1F5C3A] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A]">
                  Government Agrarian Hotline & WhatsApp
                </h4>
                <p className="text-[11px] text-[#6B7280]">
                  Direct 24/7 hotline (011-2345678) & buyer liaison
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1F5C3A] transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Report a Problem / Dispute */}
          <button
            type="button"
            onClick={() => setIsDisputeOpen(true)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9FAF8] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#DC2626]">
                  Report a Problem / Quality Dispute
                </h4>
                <p className="text-[11px] text-[#6B7280]">
                  Resolve damaged crates, delays or price mismatches
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#DC2626] transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* About Goviya */}
          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9FAF8] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A]">
                    About Goviya
                  </h4>
                  <span className="text-[10px] font-mono text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.2 rounded">
                    v2.4.1
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Sri Lanka Agrarian Development Department Certified
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1F5C3A] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* SECTION E: ROLE SWITCHING & LOGOUT */}
      <div className="space-y-3 pt-2">
        {/* Role Demo Switcher Box */}
        <div className="bg-[#FEF8EA] border border-[#FCE7C2] p-3.5 rounded-2xl text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B45309] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Demo Role Portal Switcher
            </span>
            <span className="text-[10px] text-[#854D0E] font-semibold">Simulate other views</span>
          </div>
          <p className="text-[11px] text-[#854D0E] leading-relaxed">
            Switch instantaneously between the different stakeholder experiences:
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => switchRole('farmer')}
              className="py-2 px-2.5 bg-white text-[#B45309] border border-[#FDE6B8] rounded-xl text-xs font-bold shadow-2xs hover:bg-[#FEF8EA] transition-colors cursor-pointer text-center"
            >
              🌱 Farmer {currentUser?.role === 'farmer' ? '✓' : '🔒'}
            </button>
            <button
              type="button"
              onClick={() => switchRole('driver')}
              className="py-2 px-2.5 bg-white text-[#19768A] border border-[#D0EEF5] rounded-xl text-xs font-bold shadow-2xs hover:bg-[#EEF8FA] transition-colors cursor-pointer text-center"
            >
              🚚 Driver {currentUser?.role === 'driver' ? '✓' : '🔒'}
            </button>
            <button
              type="button"
              onClick={() => switchRole('admin')}
              className="py-2 px-2.5 bg-white text-[#7C3AED] border border-[#E9D5FF] rounded-xl text-xs font-bold shadow-2xs hover:bg-[#F3E8FF] transition-colors cursor-pointer text-center"
            >
              🛡️ Admin {currentUser?.role === 'admin' ? '✓' : '🔒'}
            </button>
          </div>
        </div>

        {/* Log Out / Sign In Button */}
        {currentUser ? (
          <Button
            variant="destructive"
            fullWidth
            size="lg"
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={() => setIsLogoutConfirmOpen(true)}
          >
            Sign Out (Continue as Guest)
          </Button>
        ) : (
          <Button
            variant="primary"
            fullWidth
            size="lg"
            leftIcon={<LogIn className="w-4 h-4" />}
            onClick={() => openAuth('buyer')}
          >
            Sign In / Create Account
          </Button>
        )}
      </div>

      {/* ===================== MODALS & SHEETS ===================== */}

      {/* 1. EDIT PROFILE BOTTOM SHEET */}
      <BottomSheet
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Buyer Profile"
      >
        <form onSubmit={handleSaveProfile} className="p-5 space-y-4 text-left overflow-y-auto max-h-[75vh]">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1A1A1A]">Full Name</label>
            <Input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="e.g. Dinesh Wickramasinghe"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1A1A1A]">Registered Business Name</label>
            <Input
              value={editBusiness}
              onChange={e => setEditBusiness(e.target.value)}
              placeholder="e.g. Colombo Fresh Supermarkets"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A1A1A]">Phone Number</label>
              <Input
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                placeholder="+94 77 000 0000"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A1A1A]">Email Address</label>
              <Input
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                placeholder="buyer@domain.lk"
                type="email"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1A1A1A]">Tax Registration (BRN / VAT)</label>
            <Input
              value={editTaxNumber}
              onChange={e => setEditTaxNumber(e.target.value)}
              placeholder="PV-XXXXXXX"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1A1A1A]">Primary Delivery Address</label>
            <Input
              value={editAddress}
              onChange={e => setEditAddress(e.target.value)}
              placeholder="No. 42/3, Havelock Road, Colombo 05"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1A1A1A]">Province / District</label>
            <select
              value={editDistrict}
              onChange={e => setEditDistrict(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A] font-medium focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/20"
            >
              <option value="Colombo">Colombo (Western)</option>
              <option value="Gampaha">Gampaha</option>
              <option value="Kalutara">Kalutara</option>
              <option value="Kandy">Kandy (Central)</option>
              <option value="Galle">Galle (Southern)</option>
              <option value="Kurunegala">Kurunegala (North Western)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#F0F0EE] flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" fullWidth>
              Save Changes
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* 2. MY ORDERS BOTTOM SHEET */}
      <BottomSheet
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        title="My Orders & Harvest History"
      >
        <div className="p-4 space-y-3 overflow-y-auto max-h-[75vh] text-left">
          {/* Filter Pills */}
          <div className="flex gap-2 pb-1 border-b border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => setOrderFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                orderFilter === 'all'
                  ? 'bg-[#1F5C3A] text-white'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E5E5]'
              }`}
            >
              All Orders ({myOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setOrderFilter('active')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                orderFilter === 'active'
                  ? 'bg-[#1F5C3A] text-white'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E5E5]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active ({activeOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setOrderFilter('completed')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                orderFilter === 'completed'
                  ? 'bg-[#1F5C3A] text-white'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E5E5]'
              }`}
            >
              Completed ({completedOrders.length})
            </button>
          </div>

          {displayedOrders.length === 0 ? (
            <EmptyState
              title="No orders found"
              description="You have no orders matching this filter."
            />
          ) : (
            <div className="space-y-3">
              {displayedOrders.map(order => (
                <div
                  key={order._id}
                  className="bg-white border border-[#E5E5E5] rounded-2xl p-3.5 space-y-2.5 shadow-2xs hover:border-[#1F5C3A]/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#6B7280] font-bold">
                        {order.orderNumber}
                      </span>
                      <h4 className="text-xs font-bold text-[#1A1A1A]">
                        Farmer: {order.farmerName}
                      </h4>
                    </div>
                    <StatusPill status={order.status} />
                  </div>

                  <div className="p-2 bg-[#F9FAF8] rounded-xl text-xs space-y-1">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between text-[#1A1A1A]">
                        <span>
                          {i.cropName} · <strong>{i.quantityKg} kg</strong>
                        </span>
                        <span className="font-semibold text-[#1F5C3A]">
                          LKR {(i.pricePerKg * i.quantityKg).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="pt-1 border-t border-[#E5E5E5] flex justify-between font-bold text-[#1A1A1A]">
                      <span>Total Amount:</span>
                      <span className="text-[#1F5C3A]">LKR {order.total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                    <span>Date: {order.createdAt.slice(0, 10)}</span>
                    <span>Payment: {order.paymentMethod.replace(/_/g, ' ')}</span>
                  </div>

                  <div className="pt-2 border-t border-[#F0F0EE] flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setIsOrdersModalOpen(false);
                        goToSubScreen('order_tracking', { orderId: order._id });
                      }}
                    >
                      Track Live Order
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(order)}
                      title="Reorder this batch"
                    >
                      Reorder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedInvoiceOrder(order);
                        setIsOrdersModalOpen(false);
                        setIsInvoicesOpen(true);
                      }}
                    >
                      Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>

      {/* 3. SAVED & FAVORITE FARMS BOTTOM SHEET */}
      <BottomSheet
        isOpen={isSavedFarmsOpen}
        onClose={() => setIsSavedFarmsOpen(false)}
        title="Saved & Favorite Direct Farms"
      >
        <div className="p-4 space-y-3 overflow-y-auto max-h-[75vh] text-left">
          <p className="text-xs text-[#6B7280]">
            Bookmarked Sri Lankan farmers offering organic and verified harvest crops directly to your store:
          </p>

          <div className="space-y-3">
            {favoriteFarms.map(farm => (
              <div
                key={farm.id}
                className="bg-white border border-[#E5E5E5] rounded-2xl p-3.5 space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={farm.name} size="md" role="farmer" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-[#1A1A1A]">{farm.farmName}</h4>
                        {farm.certified && (
                          <span title="Agrarian Certified">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#1F5C3A]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B7280]">
                        Farmer: {farm.name} · {farm.town}, {farm.district}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-[#FEF8EA] px-2 py-0.5 rounded-full border border-[#FCE7C2] text-[10px] font-bold text-[#B45309]">
                    <Star className="w-3 h-3 fill-[#E8A317] text-[#E8A317]" />
                    <span>{farm.rating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {farm.crops.map((crop, cIdx) => (
                    <span
                      key={cIdx}
                      className="text-[10px] font-semibold text-[#1F5C3A] bg-[#E6F2E8] px-2 py-0.5 rounded-lg border border-[#CDE5D2]"
                    >
                      {crop}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#F0F0EE] flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                    onClick={() => {
                      const convId = getOrCreateConversation(farm.id, farm.name, farm.crops[0]);
                      setIsSavedFarmsOpen(false);
                      goToSubScreen('chat_detail', { conversationId: convId });
                    }}
                  >
                    Chat with Farmer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsSavedFarmsOpen(false);
                      setTab('nearby');
                    }}
                  >
                    View on Map
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* 4. INVOICES & RECEIPTS BOTTOM SHEET */}
      <BottomSheet
        isOpen={isInvoicesOpen}
        onClose={() => {
          setIsInvoicesOpen(false);
          setSelectedInvoiceOrder(null);
        }}
        title="Commercial Tax Invoices & Receipts"
      >
        <div className="p-4 space-y-3 overflow-y-auto max-h-[75vh] text-left">
          <p className="text-xs text-[#6B7280]">
            Digital Agrarian Trade receipts certified for corporate expense reporting and VAT exemption under Agricultural Produce Act:
          </p>

          <div className="space-y-3">
            {myOrders.map(order => (
              <div
                key={order._id}
                className="bg-white border border-[#E5E5E5] rounded-2xl p-3.5 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#1F5C3A] bg-[#E6F2E8] px-2 py-0.5 rounded">
                      TAX-INV-2026-{order._id.slice(-4).toUpperCase()}
                    </span>
                    <h4 className="text-xs font-bold text-[#1A1A1A] mt-1">
                      Batch from {order.farmerName}
                    </h4>
                  </div>
                  <span className="text-xs font-extrabold text-[#1F5C3A]">
                    LKR {order.total.toLocaleString()}
                  </span>
                </div>

                <div className="text-[11px] text-[#6B7280] space-y-0.5 border-t border-[#F0F0EE] pt-2">
                  <div className="flex justify-between">
                    <span>Order Date:</span>
                    <span className="font-medium text-[#1A1A1A]">{order.createdAt.slice(0, 10)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-medium text-[#1A1A1A]">{order.paymentMethod.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Destination:</span>
                    <span className="font-medium text-[#1A1A1A] truncate max-w-[200px]">{order.deliveryAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (Agrarian Produce Exempt 0%):</span>
                    <span className="font-medium text-[#1A1A1A]">LKR 0.00</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F0F0EE] flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => {
                      showToast(`Downloading TAX-INV-2026-${order._id.slice(-4).toUpperCase()}.pdf...`);
                    }}
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      showToast('Receipt sent to your registered company email.');
                    }}
                  >
                    Email Receipt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* 5. SAVED DELIVERY ADDRESSES BOTTOM SHEET */}
      <BottomSheet
        isOpen={isAddressesOpen}
        onClose={() => {
          setIsAddressesOpen(false);
          setIsAddingAddress(false);
        }}
        title="Saved Delivery Addresses"
      >
        <div className="p-4 space-y-4 overflow-y-auto max-h-[75vh] text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">
              Manage stores, depots & receiving points:
            </span>
            {!isAddingAddress && (
              <button
                type="button"
                onClick={() => setIsAddingAddress(true)}
                className="text-xs font-bold text-[#1F5C3A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Address
              </button>
            )}
          </div>

          {/* Add Address Form */}
          {isAddingAddress && (
            <form onSubmit={handleAddAddress} className="p-3.5 bg-[#F9FAF8] border border-[#CDE5D2] rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-[#1F5C3A]">Add New Delivery Point</h4>
              <Input
                value={newAddrLabel}
                onChange={e => setNewAddrLabel(e.target.value)}
                placeholder="Label (e.g. Branch Outlet #4)"
                required
              />
              <Input
                value={newAddrStreet}
                onChange={e => setNewAddrStreet(e.target.value)}
                placeholder="Street Address & Town"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newAddrDistrict}
                  onChange={e => setNewAddrDistrict(e.target.value)}
                  className="h-10 px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A]"
                >
                  <option value="Colombo">Colombo</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Kalutara">Kalutara</option>
                  <option value="Kandy">Kandy</option>
                </select>
                <Input
                  value={newAddrPhone}
                  onChange={e => setNewAddrPhone(e.target.value)}
                  placeholder="Gate Phone"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setIsAddingAddress(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" fullWidth>
                  Save Address
                </Button>
              </div>
            </form>
          )}

          {/* List of Saved Addresses */}
          <div className="space-y-3">
            {savedAddresses.map(addr => (
              <div
                key={addr.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  addr.isDefault
                    ? 'bg-[#F4F9F5] border-[#1F5C3A] shadow-xs'
                    : 'bg-white border-[#E5E5E5]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#1A1A1A]">{addr.label}</h4>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-white bg-[#1F5C3A] px-2 py-0.2 rounded-full">
                          Default Receiving
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#4B6B56] mt-1 font-medium">{addr.street}</p>
                    <p className="text-[11px] text-[#6B7280]">
                      {addr.town}, {addr.district} · Phone: {addr.phone}
                    </p>
                    {addr.notes && (
                      <p className="text-[10px] text-[#854D0E] bg-[#FEF8EA] px-2 py-1 rounded-lg mt-1.5 border border-[#FCE7C2]">
                        Note: {addr.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-[#E5E5E5] flex items-center justify-between">
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className="text-xs font-bold text-[#1F5C3A] hover:underline cursor-pointer"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#1F5C3A] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Active for checkout
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-xs text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* 6. PAYMENT METHODS BOTTOM SHEET */}
      <BottomSheet
        isOpen={isPaymentsOpen}
        onClose={() => {
          setIsPaymentsOpen(false);
          setIsAddingCard(false);
        }}
        title="Payment Methods & LankaPay"
      >
        <div className="p-4 space-y-4 overflow-y-auto max-h-[75vh] text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">
              Pre-authorized corporate payment options:
            </span>
            {!isAddingCard && (
              <button
                type="button"
                onClick={() => setIsAddingCard(true)}
                className="text-xs font-bold text-[#1F5C3A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Card
              </button>
            )}
          </div>

          {/* Add Card Form */}
          {isAddingCard && (
            <form onSubmit={handleAddCard} className="p-3.5 bg-[#F9FAF8] border border-[#CDE5D2] rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-[#1F5C3A]">Add Verified Card</h4>
              <Input
                value={newCardNumber}
                onChange={e => setNewCardNumber(e.target.value)}
                placeholder="Card Number (16 Digits)"
                required
              />
              <Input
                value={newCardHolder}
                onChange={e => setNewCardHolder(e.target.value)}
                placeholder="Cardholder Name"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={newCardExpiry}
                  onChange={e => setNewCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  required
                />
                <Input
                  value={newCardCvv}
                  onChange={e => setNewCardCvv(e.target.value)}
                  placeholder="CVV"
                  type="password"
                  required
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setIsAddingCard(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" fullWidth>
                  Verify & Save Card
                </Button>
              </div>
            </form>
          )}

          {/* Payment Methods List */}
          <div className="space-y-3">
            {paymentMethods.map(pay => (
              <div
                key={pay.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  pay.isDefault
                    ? 'bg-[#F4F9F5] border-[#1F5C3A] shadow-xs'
                    : 'bg-white border-[#E5E5E5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F2E8] text-[#1F5C3A] flex items-center justify-center font-black text-xs">
                      {pay.brand === 'Visa' ? 'VISA' : pay.brand === 'COD' ? 'LKR' : 'LP'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#1A1A1A]">{pay.title}</h4>
                        {pay.isDefault && (
                          <span className="text-[10px] font-bold text-white bg-[#1F5C3A] px-2 py-0.2 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B7280]">
                        {pay.type === 'card'
                          ? `Ending in •••• ${pay.last4} · Expires ${pay.expiry}`
                          : pay.type === 'wallet'
                          ? 'Central Bank approved LankaPay CEFTS direct'
                          : 'Pre-ordered exact change preparation'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-[#E5E5E5] flex items-center justify-between">
                  {!pay.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultPayment(pay.id)}
                      className="text-xs font-bold text-[#1F5C3A] hover:underline cursor-pointer"
                    >
                      Make Default
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#1F5C3A] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Active for 1-Tap Checkout
                    </span>
                  )}
                  {pay.id !== 'pay_cod' && (
                    <button
                      type="button"
                      onClick={() => handleDeletePayment(pay.id)}
                      className="text-xs text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* 7. NOTIFICATIONS PREFERENCES BOTTOM SHEET */}
      <BottomSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        title="Notification Preferences"
      >
        <div className="p-4 space-y-4 overflow-y-auto max-h-[75vh] text-left">
          <p className="text-xs text-[#6B7280]">
            Customize alerts regarding your daily produce dispatches and farm market trends:
          </p>

          <div className="space-y-3 bg-white border border-[#E5E5E5] rounded-2xl p-4 divide-y divide-[#F0F0EE]">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between pb-3">
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A]">Order & Delivery GPS Push</h4>
                <p className="text-[11px] text-[#6B7280]">
                  Immediate milestone updates (Accepted → Harvested → Out for Delivery)
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.pushOrders}
                onChange={e => {
                  setNotifications(prev => ({ ...prev, pushOrders: e.target.checked }));
                  showToast('Order push alerts updated');
                }}
                className="w-4 h-4 accent-[#1F5C3A] cursor-pointer"
              />
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A]">Morning Harvest SMS Alerts</h4>
                <p className="text-[11px] text-[#6B7280]">
                  SMS alert when farmers in your district publish fresh morning yields
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.smsHarvest}
                onChange={e => {
                  setNotifications(prev => ({ ...prev, smsHarvest: e.target.checked }));
                  showToast('Morning harvest SMS updated');
                }}
                className="w-4 h-4 accent-[#1F5C3A] cursor-pointer"
              />
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A]">WhatsApp Dispatch Link</h4>
                <p className="text-[11px] text-[#6B7280]">
                  Receive live driver WhatsApp tracking when order enters transit
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.whatsappDriver}
                onChange={e => {
                  setNotifications(prev => ({ ...prev, whatsappDriver: e.target.checked }));
                  showToast('WhatsApp dispatch link updated');
                }}
                className="w-4 h-4 accent-[#1F5C3A] cursor-pointer"
              />
            </div>

            {/* Toggle 4 */}
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A]">Market Price Drops</h4>
                <p className="text-[11px] text-[#6B7280]">
                  Alert when wholesale vegetables drop below Dambulla Economic Index
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.priceAlerts}
                onChange={e => {
                  setNotifications(prev => ({ ...prev, priceAlerts: e.target.checked }));
                  showToast('Price drop alerts updated');
                }}
                className="w-4 h-4 accent-[#1F5C3A] cursor-pointer"
              />
            </div>

            {/* Toggle 5 */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A]">Weekly Agricultural Digest</h4>
                <p className="text-[11px] text-[#6B7280]">
                  Harvest forecast and planting forecasts for Sri Lankan agro-zones
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.weeklyMarketDigest}
                onChange={e => {
                  setNotifications(prev => ({ ...prev, weeklyMarketDigest: e.target.checked }));
                  showToast('Weekly digest updated');
                }}
                className="w-4 h-4 accent-[#1F5C3A] cursor-pointer"
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => {
              setIsNotificationsOpen(false);
              showToast('Notification preferences successfully saved.');
            }}
          >
            Done
          </Button>
        </div>
      </BottomSheet>

      {/* 8. LANGUAGE SELECTION BOTTOM SHEET */}
      <BottomSheet
        isOpen={isLanguageOpen}
        onClose={() => setIsLanguageOpen(false)}
        title="Language Selection / භාෂාව තෝරන්න"
      >
        <div className="p-4 space-y-3 overflow-y-auto max-h-[75vh] text-left">
          <p className="text-xs text-[#6B7280]">
            Select your preferred interface language for Goviya:
          </p>

          <div className="space-y-2">
            {[
              { code: 'en', label: 'English', sub: 'Sri Lankan Commercial Standard', flag: '🇱🇰' },
              { code: 'si', label: 'සිංහල (Sinhala)', sub: 'ගොවි සහ වෙළඳ ප්‍රජාව සඳහා', flag: '🌾' },
              { code: 'ta', label: 'தமிழ் (Tamil)', sub: 'விவசாயிகள் மற்றும் வர்த்தகர்கள்', flag: '🌱' },
            ].map(lang => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setSelectedLanguage(lang.code as any);
                  setIsLanguageOpen(false);
                  showToast(`Language switched to ${lang.label}`);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedLanguage === lang.code
                    ? 'bg-[#F4F9F5] border-[#1F5C3A] ring-2 ring-[#1F5C3A]/20'
                    : 'bg-white border-[#E5E5E5] hover:bg-[#F9FAF8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A1A]">{lang.label}</h4>
                    <p className="text-[11px] text-[#6B7280]">{lang.sub}</p>
                  </div>
                </div>
                {selectedLanguage === lang.code && (
                  <CheckCircle2 className="w-5 h-5 text-[#1F5C3A]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* 9. HELP & FAQ CENTER BOTTOM SHEET */}
      <BottomSheet
        isOpen={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
        title="Help & FAQ Center"
      >
        <div className="p-4 space-y-3 overflow-y-auto max-h-[75vh] text-left">
          <p className="text-xs text-[#6B7280]">
            Frequently asked questions by supermarket buyers, restaurant managers and wholesalers:
          </p>

          <div className="space-y-2">
            {[
              {
                q: 'How does direct farm-to-table delivery work in Sri Lanka?',
                a: 'Once you confirm your order, the registered farmer receives real-time notification to harvest and pack in agrarian crates. A verified Goviya logistics driver collects the crates directly at the farm and transports them straight to your designated receiving address without middleman storage.',
              },
              {
                q: 'What is Goviya’s Produce Freshness Guarantee?',
                a: 'If vegetables arrive damaged or do not meet agrarian quality standards, buyers can immediately file a dispute via the Profile page. Our support team verifies with photos and credits your account or issues an instant replacement batch within 2 hours.',
              },
              {
                q: 'Can I schedule recurring weekly or daily bulk deliveries?',
                a: 'Yes. Commercial buyers can chat directly with farmers through the built-in messaging inbox to schedule fixed harvest days, customized crate counts, and long-term wholesale pricing.',
              },
              {
                q: 'How are delivery fees structured islandwide?',
                a: 'We maintain a transparent islandwide delivery fee of LKR 1,500 per harvest order. This covers temperature-controlled crating, driver compensation, and doorstep delivery from regional agricultural hubs (Nuwara Eliya, Jaffna, Pannipitiya, Matale) to your store.',
              },
              {
                q: 'How do digital payments and Cash on Delivery work?',
                a: 'You can pay instantly with LankaPay direct bank debit, Visa/Mastercard, or Cash on Delivery. When choosing Cash on Delivery, you can select whether you need change for LKR 5,000 or LKR 10,000 notes so drivers arrive prepared.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-2 hover:bg-[#F9FAF8] transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#1A1A1A]">{faq.q}</span>
                  {expandedFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#1F5C3A] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                  )}
                </button>
                {expandedFaq === idx && (
                  <div className="px-3.5 pb-3.5 text-xs text-[#4B6B56] leading-relaxed border-t border-[#F0F0EE] pt-2.5 bg-[#FAFBF9]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              leftIcon={<Phone className="w-4 h-4" />}
              onClick={() => {
                setIsFaqOpen(false);
                setIsSupportOpen(true);
              }}
            >
              Need more help? Contact Support
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* 10. AGRARIAN SUPPORT & WHATSAPP BOTTOM SHEET */}
      <BottomSheet
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        title="Agrarian Support & Hotline"
      >
        <div className="p-4 space-y-4 overflow-y-auto max-h-[75vh] text-left">
          <div className="bg-[#E6F2E8] border border-[#CDE5D2] p-3.5 rounded-2xl space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1F5C3A]" />
              <h4 className="text-xs font-bold text-[#1F5C3A]">
                Ministry of Agriculture & Agrarian Services Partner
              </h4>
            </div>
            <p className="text-[11px] text-[#4B6B56] leading-relaxed">
              Our dedicated buyer support team operates 24/7 during harvest seasons to coordinate logistics, quality inspections, and farmer communications.
            </p>
          </div>

          <div className="space-y-2.5">
            {/* Call Hotline */}
            <a
              href="tel:+94112345678"
              className="p-3.5 bg-white border border-[#E5E5E5] rounded-2xl flex items-center justify-between hover:border-[#1F5C3A] hover:bg-[#F9FAF8] transition-all group block text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6F2E8] text-[#1F5C3A] flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A]">
                    National Agrarian Hotline
                  </h4>
                  <p className="text-[11px] text-[#6B7280]">011-234-5678 (Toll Free)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#1F5C3A] bg-[#E6F2E8] px-3 py-1 rounded-full">
                Call Now
              </span>
            </a>

            {/* WhatsApp Buyer Liaison */}
            <a
              href="https://wa.me/94773456789?text=Hello%20Goviya%20Buyer%20Support"
              target="_blank"
              rel="noreferrer"
              className="p-3.5 bg-white border border-[#E5E5E5] rounded-2xl flex items-center justify-between hover:border-[#1F5C3A] hover:bg-[#F9FAF8] transition-all group block text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#16A34A]">
                    WhatsApp Buyer Liaison
                  </h4>
                  <p className="text-[11px] text-[#6B7280]">+94 77 345 6789 (Instant Response)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-3 py-1 rounded-full">
                Chat on WhatsApp
              </span>
            </a>

            {/* Email Support */}
            <a
              href="mailto:support@goviya.lk"
              className="p-3.5 bg-white border border-[#E5E5E5] rounded-2xl flex items-center justify-between hover:border-[#1F5C3A] hover:bg-[#F9FAF8] transition-all group block text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#2563EB]">
                    Email Support Desk
                  </h4>
                  <p className="text-[11px] text-[#6B7280]">support@goviya.lk</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-3 py-1 rounded-full">
                Send Email
              </span>
            </a>
          </div>
        </div>
      </BottomSheet>

      {/* 11. REPORT A PROBLEM / QUALITY DISPUTE BOTTOM SHEET */}
      <BottomSheet
        isOpen={isDisputeOpen}
        onClose={() => {
          setIsDisputeOpen(false);
          setDisputeSuccessId(null);
        }}
        title="Report a Problem / Quality Dispute"
      >
        <div className="p-4 space-y-4 overflow-y-auto max-h-[75vh] text-left">
          {disputeSuccessId ? (
            <div className="p-4 bg-[#F4F9F5] border border-[#1F5C3A] rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#1F5C3A] mx-auto" />
              <h4 className="text-sm font-bold text-[#1A1A1A]">
                Dispute Registered Successfully
              </h4>
              <p className="text-xs text-[#4B6B56]">
                Reference ID: <strong className="font-mono text-[#1F5C3A]">#{disputeSuccessId}</strong>
              </p>
              <p className="text-[11px] text-[#6B7280]">
                An Agrarian Inspector has been assigned to your order. You will receive an SMS and WhatsApp update within 30 minutes.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setIsDisputeOpen(false);
                    setDisputeSuccessId(null);
                  }}
                >
                  Close & Back to Profile
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitDispute} className="space-y-3">
              <p className="text-xs text-[#6B7280]">
                Please describe the issue with your harvest shipment. Our team will review crate photos and mediate directly with the farmer:
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A1A1A]">Select Related Order</label>
                <select
                  value={disputeOrderId}
                  onChange={e => setDisputeOrderId(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A] font-medium"
                >
                  {myOrders.map(order => (
                    <option key={order._id} value={order._id}>
                      {order.orderNumber} · {order.farmerName} (LKR {order.total.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A1A1A]">Problem Category</label>
                <select
                  value={disputeCategory}
                  onChange={e => setDisputeCategory(e.target.value as any)}
                  className="w-full h-11 px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A] font-medium"
                >
                  <option value="quality">Damaged / Substandard Produce</option>
                  <option value="weight">Quantity / Weight Discrepancy</option>
                  <option value="delay">Excessive Delivery Delay</option>
                  <option value="price">Billing / Overcharge Mismatch</option>
                  <option value="packaging">Poor Crate Packaging</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A1A1A]">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(sev => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setDisputeSeverity(sev)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer border ${
                        disputeSeverity === sev
                          ? sev === 'high'
                            ? 'bg-[#FEF2F2] border-[#DC2626] text-[#DC2626]'
                            : 'bg-[#E6F2E8] border-[#1F5C3A] text-[#1F5C3A]'
                          : 'bg-white border-[#E5E5E5] text-[#6B7280]'
                      }`}
                    >
                      {sev} Priority
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A1A1A]">Detailed Description</label>
                <textarea
                  value={disputeDetails}
                  onChange={e => setDisputeDetails(e.target.value)}
                  rows={3}
                  placeholder="Describe the condition upon arrival, crate numbers, or batch discrepancy..."
                  required
                  className="w-full p-3 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/20"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => setIsDisputeOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" size="md" fullWidth>
                  Submit Dispute Ticket
                </Button>
              </div>
            </form>
          )}
        </div>
      </BottomSheet>

      {/* 12. ABOUT GOVIYA BOTTOM SHEET */}
      <BottomSheet
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        title="About Goviya Agricultural Platform"
      >
        <div className="p-4 space-y-4 overflow-y-auto max-h-[75vh] text-left">
          <div className="text-center space-y-2 py-2 border-b border-[#F0F0EE]">
            <div className="flex justify-center mx-auto mb-2 drop-shadow-sm">
              <GoviyaLogo size="xl" />
            </div>
            <h3 className="text-base font-extrabold text-[#1A1A1A]">Goviya (ගොවියා)</h3>
            <p className="text-xs text-[#6B7280]">
              Sri Lanka’s Direct Farm-to-Table Agricultural Marketplace
            </p>
            <span className="inline-block text-[10px] font-mono text-[#1F5C3A] bg-[#E6F2E8] px-2.5 py-0.5 rounded-full font-bold">
              Version 2.4.1 (Build 2026.10-LKA)
            </span>
          </div>

          <div className="text-xs text-[#4B6B56] leading-relaxed space-y-2">
            <p>
              <strong>Our Mission:</strong> Eliminating exploitative middlemen margins to ensure Sri Lankan farmers in Nuwara Eliya, Jaffna, Pannipitiya, Matale, and Kurunegala receive fair wholesale compensation while commercial buyers receive freshly harvested vegetables at transparent islandwide rates.
            </p>
            <p>
              Certified by the Department of Agrarian Development, Ministry of Agriculture Sri Lanka.
            </p>
          </div>

          <div className="p-3 bg-[#F9FAF8] rounded-xl border border-[#E5E5E5] text-[11px] text-[#6B7280] space-y-1.5">
            <div className="flex justify-between">
              <span>Fair Farmer Remittance:</span>
              <strong className="text-[#1A1A1A]">92% Direct to Producer</strong>
            </div>
            <div className="flex justify-between">
              <span>Logistics Partner:</span>
              <strong className="text-[#1A1A1A]">Goviya Fleet Islandwide</strong>
            </div>
            <div className="flex justify-between">
              <span>Payment Switch:</span>
              <strong className="text-[#1A1A1A]">LankaPay & Central Bank Approved</strong>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => showToast('Terms of Service: Full farmer protection terms accepted.')}
              className="flex-1 py-2 text-xs font-bold text-[#1F5C3A] bg-[#E6F2E8] rounded-xl hover:bg-[#D6EBD9] transition-colors cursor-pointer text-center"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => showToast('Privacy Policy: All customer and banking data encrypted.')}
              className="flex-1 py-2 text-xs font-bold text-[#1F5C3A] bg-[#E6F2E8] rounded-xl hover:bg-[#D6EBD9] transition-colors cursor-pointer text-center"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* 13. LOGOUT CONFIRMATION MODAL */}
      <BottomSheet
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        title="Confirm Log Out"
      >
        <div className="p-5 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1A1A1A]">
              Log out of your Commercial Buyer Account?
            </h4>
            <p className="text-xs text-[#6B7280] mt-1">
              You will need to sign in again to place orders, track live shipments, or message farmers.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setIsLogoutConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="md"
              fullWidth
              onClick={() => {
                setIsLogoutConfirmOpen(false);
                logout();
              }}
            >
              Yes, Log Out
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
