import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Linking,
  useWindowDimensions,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  CheckCircle2,
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
  SlidersHorizontal,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react-native';
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
import { SellerProfileModal } from '../../components/shared/SellerProfileModal';
import { Listing, Order, OrderStatus } from '../../types';

// ===================== 1. BUYER HOME SCREEN =====================
export const BuyerHomeScreen: React.FC = () => {
  const { listings, setTab, goToSubScreen, addToCart } = useApp();
  const { width: windowWidth } = useWindowDimensions();

  // Responsive Grid Calculations
  const isTablet = windowWidth >= 768;
  const numColumns = isTablet ? 3 : 2;
  const horizontalPadding = 16;
  const cardGap = 12;
  const totalGaps = (numColumns - 1) * cardGap;
  const availableWidth = windowWidth - horizontalPadding * 2;
  const cardWidth = Math.floor((availableWidth - totalGaps) / numColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter state
  const [maxPrice, setMaxPrice] = useState<number>(800);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [onlyOrganic, setOnlyOrganic] = useState<boolean>(false);
  const [minOrderFilter, setMinOrderFilter] = useState<'all' | 'small' | 'medium' | 'bulk'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'qty_desc'>('rating');

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

  const normalizeWord = (w: string) => {
    let s = w.toLowerCase().trim();
    if (s.endsWith('ies')) s = s.slice(0, -3) + 'y';
    else if (s.endsWith('es') && !s.endsWith('pes')) s = s.slice(0, -2);
    else if (s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
    return s;
  };

  const CROP_SYNONYMS: Record<string, string[]> = {
    carrot: ['carrot', 'carrots', 'karat'],
    onion: ['onion', 'onions', 'shallot', 'shallots', 'lunu'],
    tomato: ['tomato', 'tomatoes', 'thakkali'],
    leek: ['leek', 'leeks'],
    chilli: ['chilli', 'chillies', 'chili', 'chilis', 'miris'],
    brinjal: ['brinjal', 'brinjals', 'eggplant', 'wambatu'],
    okra: ['okra', 'bandakka'],
    gourd: ['gourd', 'pathola', 'snake gourd'],
    mukunuwenna: ['mukunuwenna', 'gotukola', 'leafy', 'greens'],
    papaya: ['papaya', 'papaw'],
  };

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
      if (targetText.includes(token) || targetText.includes(normToken)) {
        return true;
      }
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

  return (
    <ScrollView style={s.mainScroll} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Search Bar & Filter Header */}
      <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search carrots, leeks, onions, farmers, regions..."
            />
          </View>
          <Pressable
            onPress={() => setIsFilterOpen(true)}
            style={[
              s.filterBtn,
              activeFiltersCount > 0
                ? { backgroundColor: '#1F5C3A', borderColor: '#1F5C3A' }
                : { backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' },
            ]}
          >
            <SlidersHorizontal size={16} color={activeFiltersCount > 0 ? '#ffffff' : '#1A1A1A'} />
            {activeFiltersCount > 0 && (
              <View style={s.filterBadge}>
                <Text style={s.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Popular Produce Shortcuts */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10 }}
          contentContainerStyle={{ paddingVertical: 4, gap: 6 }}
        >
          {popularProduceSearches.map(item => {
            const isSelected = searchQuery.toLowerCase().includes(item.query);
            return (
              <Pressable
                key={item.label}
                onPress={() => {
                  if (isSelected) setSearchQuery('');
                  else setSearchQuery(item.query);
                }}
                style={[
                  s.produceChip,
                  isSelected
                    ? { backgroundColor: '#1F5C3A', borderColor: '#1F5C3A' }
                    : { backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' },
                ]}
              >
                <Text style={{ fontSize: 12 }}>{item.emoji}</Text>
                <Text style={[s.produceChipText, isSelected ? { color: '#fff' } : { color: '#374151' }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
          contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
        >
          {categories.map(cat => (
            <View key={cat}>
              <Chip
                label={cat}
                selected={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Featured Promo Banner */}
      {!searchQuery && (
        <View style={{ paddingHorizontal: horizontalPadding, marginTop: 12 }}>
          <View style={s.promoBanner}>
            <View style={s.promoTag}>
              <Text style={s.promoTagText}>Direct From Hill Country</Text>
            </View>
            <Text style={s.promoTitle}>
              Nuwara Eliya & Dambulla Fresh Harvest
            </Text>
            <Text style={s.promoSubtitle}>
              Up to 35% cheaper than Pettah retail brokers. Picked today.
            </Text>
            <Pressable
              onPress={() => setSearchQuery('carrots')}
              style={s.promoBtn}
            >
              <Text style={s.promoBtnText}>🥕 View Carrots</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Product Grid */}
      <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#1A1A1A' }}>
            Available Harvest ({filteredListings.length})
          </Text>
          <Pressable
            onPress={() => goToSubScreen('market_prices')}
            style={s.benchmarkBtn}
          >
            <TrendingUp size={12} color="#1F5C3A" />
            <Text style={s.benchmarkBtnText}>Wholesale Benchmarks</Text>
          </Pressable>
        </View>

        {filteredListings.length === 0 ? (
          <EmptyState
            title="No Produce Found"
            description="Try changing your crop search or reset your filter criteria."
            actionLabel="Reset All Filters"
            onAction={() => {
              setSearchQuery('');
              resetAllFilters();
            }}
          />
        ) : (
          <View style={[s.productGrid, { gap: cardGap }]}>
            {filteredListings.map(listing => (
              <View key={listing._id} style={{ width: cardWidth }}>
                <ProductCard listing={listing} />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Filter BottomSheet */}
      <BottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Produce Listings"
        footer={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button variant="outline" className="flex-1" onPress={resetAllFilters}>
              Reset
            </Button>
            <Button variant="primary" className="flex-1" onPress={() => setIsFilterOpen(false)}>
              {`Show Results (${filteredListings.length})`}
            </Button>
          </View>
        }
      >
        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>
            {`Max Price: LKR ${maxPrice}/kg`}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[200, 400, 600, 800].map(p => (
              <Pressable
                key={p}
                onPress={() => setMaxPrice(p)}
                style={[
                  s.priceChip,
                  maxPrice === p
                    ? { backgroundColor: '#E6F2E8', borderColor: '#1F5C3A' }
                    : { backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' },
                ]}
              >
                <Text style={{ fontSize: 12, fontWeight: '700' }}>{`LKR ${p}`}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>
            District Origin
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {['All', 'Nuwara Eliya', 'Matale', 'Kandy', 'Jaffna', 'Badulla', 'Colombo'].map(d => (
              <Pressable
                key={d}
                onPress={() => setSelectedDistrict(d)}
                style={[
                  s.optionChip,
                  selectedDistrict === d
                    ? { backgroundColor: '#1F5C3A', borderColor: '#1F5C3A' }
                    : { backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' },
                ]}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: selectedDistrict === d ? '#fff' : '#1A1A1A' }}>
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => setOnlyOrganic(!onlyOrganic)}
            style={s.checkboxRow}
          >
            <View style={[s.checkbox, onlyOrganic && s.checkboxChecked]}>
              {onlyOrganic && <Check size={12} color="#ffffff" />}
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#1A1A1A' }}>
              Organic Certified Only
            </Text>
          </Pressable>
        </View>
      </BottomSheet>
    </ScrollView>
  );
};

// ===================== 2. BUYER PRODUCT DETAIL SCREEN =====================
export const BuyerProductDetailScreen: React.FC = () => {
  const { navState, listings, addToCart, goBack, getOrCreateConversation, goToSubScreen } = useApp();
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState<number>(10);
  const [justAdded, setJustAdded] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  const listing = listings.find(l => l._id === navState.selectedListingId) || listings[0];
  if (!listing) return null;

  const minOrder = listing.minOrderKg || 5;
  const currentQty = Math.max(quantity, minOrder);
  const totalPrice = currentQty * listing.pricePerKg;

  const handleAddToCart = () => {
    addToCart(listing, currentQty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(listing, currentQty);
    goToSubScreen('checkout');
  };

  const handleChat = () => {
    const convId = getOrCreateConversation(listing.farmerId, listing.farmerName, listing.cropName, 'farmer');
    goToSubScreen('chat_detail', { conversationId: convId });
  };

  const hasPhoto =
    listing.photos &&
    listing.photos.length > 0 &&
    (listing.photos[0].startsWith('data:image') || listing.photos[0].startsWith('http'));

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F7F5' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Media Header */}
        <View style={s.detailHeroMedia}>
          {hasPhoto ? (
            <Image
              source={{ uri: listing.photos[0] }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <ProduceVisual type={listing.cropName} size="xl" />
          )}

          <Pressable onPress={goBack} style={s.detailBackBtn}>
            <ArrowLeft size={20} color="#1A1A1A" />
          </Pressable>

          {listing.isOrganic && (
            <View style={s.detailOrganicPill}>
              <Text style={s.detailOrganicText}>100% Organic Certified</Text>
            </View>
          )}
        </View>

        {/* Content Body */}
        <View style={{ padding: 16, gap: 14 }}>
          {/* Main Info Card */}
          <Card padding="md">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F5C3A', textTransform: 'uppercase' }}>
                {listing.category}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#1A1A1A' }}>
                  {listing.farmerRating.toFixed(1)}
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginTop: 4 }}>
              {listing.cropName}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#1F5C3A' }}>
                {`LKR ${listing.pricePerKg.toLocaleString()}`}
              </Text>
              <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '500' }}>/ kg wholesale</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0EE' }}>
              <MapPin size={14} color="#1F5C3A" />
              <Text style={{ fontSize: 12, color: '#4B6B56', fontWeight: '500' }}>
                {listing.location.town}, {listing.location.district} District
              </Text>
            </View>
          </Card>

          {/* Quantity Selector Card */}
          <Card padding="md">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>Order Quantity</Text>
                <Text style={{ fontSize: 11, color: '#6B7280' }}>{`Minimum order: ${minOrder} kg`}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable
                  onPress={() => setQuantity(Math.max(minOrder, currentQty - 5))}
                  style={s.qtyControlBtn}
                >
                  <Minus size={16} color="#1A1A1A" />
                </Pressable>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', minWidth: 44, textAlign: 'center' }}>
                  {`${currentQty} kg`}
                </Text>
                <Pressable
                  onPress={() => setQuantity(currentQty + 5)}
                  style={s.qtyControlBtn}
                >
                  <Plus size={16} color="#1A1A1A" />
                </Pressable>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0EE' }}>
              <Text style={{ fontSize: 13, color: '#6B7280' }}>Estimated Total:</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#1F5C3A' }}>
                {`LKR ${totalPrice.toLocaleString()}`}
              </Text>
            </View>
          </Card>

          {/* Farmer Profile Card */}
          <Card padding="md">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar name={listing.farmerName} size="md" role="farmer" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>
                  {listing.farmerName}
                </Text>
                <Text style={{ fontSize: 11, color: '#6B7280' }}>
                  Verified Producer · {listing.location.town}
                </Text>
              </View>
              <Pressable
                onPress={() => setIsSellerModalOpen(true)}
                style={s.viewProfileBtn}
              >
                <Text style={s.viewProfileText}>Farm Info</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Pressable
                onPress={handleChat}
                style={[s.farmerActionBtn, { backgroundColor: '#E6F2E8', borderColor: '#CDE5D2' }]}
              >
                <MessageSquare size={14} color="#1F5C3A" />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F5C3A' }}>Message Farmer</Text>
              </Pressable>
              <Pressable
                onPress={() => Linking.openURL(`tel:${listing.farmerPhone}`)}
                style={[s.farmerActionBtn, { backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }]}
              >
                <Phone size={14} color="#1A1A1A" />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1A1A1A' }}>Call Farm</Text>
              </Pressable>
            </View>
          </Card>

          {/* Freshness & Harvest Guarantee */}
          <Card padding="md" variant="mint">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <ShieldCheck size={18} color="#1F5C3A" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1F5C3A' }}>
                100% Direct Farm Gate Assurance
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: '#4B6B56', lineHeight: 18 }}>
              Harvested upon order placement at early dawn. Delivered via climate-adapted crates with direct electronic LankaPay settlement to the farmer.
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Floating Bottom CTA Bar */}
      <View style={[s.detailFloatingBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: '#6B7280' }}>Total for {currentQty} kg</Text>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#1F5C3A' }}>
            {`LKR ${totalPrice.toLocaleString()}`}
          </Text>
        </View>

        <Pressable
          onPress={handleAddToCart}
          style={[s.ctaAddBtn, justAdded && { backgroundColor: '#1F5C3A' }]}
        >
          {justAdded ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Added!</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Plus size={16} color="#1F5C3A" strokeWidth={2.5} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#1F5C3A' }}>Add to Cart</Text>
            </View>
          )}
        </Pressable>

        <Pressable onPress={handleBuyNow} style={s.ctaBuyBtn}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Buy Now</Text>
        </Pressable>
      </View>

      <SellerProfileModal
        farmerId={listing.farmerId}
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        initialCropName={listing.cropName}
      />
    </View>
  );
};

// ===================== 3. BUYER NEARBY SCREEN =====================
export const BuyerNearbyScreen: React.FC = () => {
  const { listings } = useApp();
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);

  const markers = listings.map(l => ({
    id: l._id,
    name: l.cropName,
    crop: l.cropName,
    district: l.location.district,
    town: l.location.town,
    lat: l.location.lat,
    lng: l.location.lng,
    type: 'farmer' as const,
  }));

  return (
    <ScrollView style={s.mainScroll} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ padding: 16, gap: 14 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#1A1A1A' }}>
          Nearby Agrarian Hubs & Farm Gates
        </Text>
        <SriLankaMap
          markers={markers}
          selectedId={selectedFarmerId}
          onSelectMarker={id => setSelectedFarmerId(id)}
        />
        <View style={{ gap: 10, marginTop: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A' }}>
            Active Farm Gate Harvests
          </Text>
          {listings.slice(0, 8).map(listing => (
            <ProductCard key={listing._id} listing={listing} compact />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// ===================== 4. BUYER CART SCREEN =====================
export const BuyerCartScreen: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, goToSubScreen } = useApp();
  const subtotal = cart.reduce((acc, item) => acc + item.listing.pricePerKg * item.quantityKg, 0);
  const deliveryFee = cart.length > 0 ? 1500 : 0;
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F6F7F5', padding: 16, alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          title="Your Cart is Empty"
          description="Add fresh produce directly from Sri Lankan farmers to start your order."
          actionLabel="Explore Marketplace"
          onAction={() => goToSubScreen(null)}
        />
      </View>
    );
  }

  return (
    <ScrollView style={s.mainScroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#1A1A1A' }}>Your Harvest Cart</Text>
          <Pressable onPress={clearCart}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#DC2626' }}>Clear All</Text>
          </Pressable>
        </View>

        <View style={{ gap: 8 }}>
          {cart.map(item => (
            <Card key={item.listing._id} padding="md">
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>
                    {item.listing.cropName}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    {`LKR ${item.listing.pricePerKg}/kg · ${item.listing.farmerName}`}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#1F5C3A', marginTop: 4 }}>
                    {`LKR ${(item.listing.pricePerKg * item.quantityKg).toLocaleString()}`}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Pressable
                    onPress={() => updateCartQuantity(item.listing._id, item.quantityKg - 5)}
                    style={s.qtyBtn}
                  >
                    <Minus size={14} color="#1A1A1A" />
                  </Pressable>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#1A1A1A', minWidth: 40, textAlign: 'center' }}>
                    {`${item.quantityKg}kg`}
                  </Text>
                  <Pressable
                    onPress={() => updateCartQuantity(item.listing._id, item.quantityKg + 5)}
                    style={s.qtyBtn}
                  >
                    <Plus size={14} color="#1A1A1A" />
                  </Pressable>
                  <Pressable
                    onPress={() => removeFromCart(item.listing._id)}
                    style={[s.qtyBtn, { backgroundColor: '#FEF2F2', marginLeft: 4 }]}
                  >
                    <Trash2 size={14} color="#DC2626" />
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Cost Breakdown */}
        <Card padding="md">
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#6B7280' }}>Harvest Subtotal</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>{`LKR ${subtotal.toLocaleString()}`}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#6B7280' }}>Logistics Fleet Delivery</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>{`LKR ${deliveryFee.toLocaleString()}`}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E5E5' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#1A1A1A' }}>Total Amount</Text>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#1F5C3A' }}>{`LKR ${total.toLocaleString()}`}</Text>
            </View>
          </View>
        </Card>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          onPress={() => goToSubScreen('checkout')}
        >
          {`Proceed to Checkout (LKR ${total.toLocaleString()})`}
        </Button>
      </View>
    </ScrollView>
  );
};

// ===================== 5. BUYER CHECKOUT SCREEN =====================
export const BuyerCheckoutScreen: React.FC = () => {
  const { cart, currentUser, placeOrder, goToSubScreen, goBack } = useApp();
  const insets = useSafeAreaInsets();

  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [buyerName, setBuyerName] = useState(currentUser?.name || 'Commercial Buyer');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '+94 77 123 4567');
  const [address, setAddress] = useState('No. 42/3, Havelock Road, Colombo 05');
  const [district, setDistrict] = useState('Colombo');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'card' | 'mobile_wallet'>('cash_on_delivery');
  const [notes, setNotes] = useState('Call recipient upon arrival');

  const subtotal = cart.reduce((acc, item) => acc + item.listing.pricePerKg * item.quantityKg, 0);
  const deliveryFee = deliveryMode === 'pickup' ? 0 : 1500;
  const total = subtotal + deliveryFee;

  const handleConfirmOrder = () => {
    if (!buyerName || !buyerPhone || !address) {
      Alert.alert('Required Info', 'Please enter your name, phone number, and delivery address.');
      return;
    }

    try {
      const order = placeOrder({
        deliveryType: deliveryMode,
        deliveryAddress: address,
        district,
        paymentMethod,
        notes,
        buyerName,
        buyerPhone,
      });
      goToSubScreen('order_confirmation', { orderId: order._id });
    } catch (e: any) {
      Alert.alert('Order Error', e?.message || 'Failed to place order.');
    }
  };

  return (
    <ScrollView style={s.mainScroll} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <View style={{ gap: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable onPress={goBack} style={s.qtyBtn}>
            <ArrowLeft size={18} color="#1A1A1A" />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#1A1A1A' }}>
            Checkout & Confirmation
          </Text>
        </View>

        {/* Fulfillment Mode Toggle */}
        <Card padding="sm">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => setDeliveryMode('delivery')}
              style={[
                s.segmentTab,
                deliveryMode === 'delivery' && s.segmentTabActive,
              ]}
            >
              <Truck size={16} color={deliveryMode === 'delivery' ? '#ffffff' : '#4B5563'} />
              <Text style={[s.segmentTabText, deliveryMode === 'delivery' && s.segmentTabTextActive]}>
                Doorstep Delivery
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setDeliveryMode('pickup')}
              style={[
                s.segmentTab,
                deliveryMode === 'pickup' && s.segmentTabActive,
              ]}
            >
              <MapPin size={16} color={deliveryMode === 'pickup' ? '#ffffff' : '#4B5563'} />
              <Text style={[s.segmentTabText, deliveryMode === 'pickup' && s.segmentTabTextActive]}>
                Farm Gate Pickup
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Delivery Details Card */}
        <Card padding="md">
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 }}>
            Recipient Information
          </Text>
          <View style={{ gap: 10 }}>
            <Input
              label="Recipient Name"
              value={buyerName}
              onChangeText={setBuyerName}
              placeholder="e.g. Dinesh Wickramasinghe"
            />
            <Input
              label="Contact Phone"
              value={buyerPhone}
              onChangeText={setBuyerPhone}
              keyboardType="phone-pad"
              placeholder="+94 77 ..."
            />
            {deliveryMode === 'delivery' && (
              <>
                <Input
                  label="Delivery Address"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Street address, city"
                />
                <Input
                  label="District"
                  value={district}
                  onChangeText={setDistrict}
                  placeholder="e.g. Colombo, Kandy"
                />
              </>
            )}
            <Input
              label="Delivery Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Gate code, crate placement..."
            />
          </View>
        </Card>

        {/* Payment Methods */}
        <Card padding="md">
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 }}>
            Payment Method
          </Text>
          <View style={{ gap: 8 }}>
            {[
              { id: 'cash_on_delivery', label: 'Cash on Delivery (Farm Gate / Doorstep)', icon: Banknote },
              { id: 'card', label: 'LankaPay / Visa / Mastercard', icon: CreditCard },
              { id: 'mobile_wallet', label: 'Mobile Wallet (Genie / eZ Cash)', icon: Smartphone },
            ].map(m => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setPaymentMethod(m.id as any)}
                  style={[
                    s.paymentOption,
                    isSelected && { backgroundColor: '#E6F2E8', borderColor: '#1F5C3A' },
                  ]}
                >
                  <Icon size={18} color={isSelected ? '#1F5C3A' : '#6B7280'} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? '#1F5C3A' : '#1A1A1A', flex: 1 }}>
                    {m.label}
                  </Text>
                  <View style={[s.radioCircle, isSelected && s.radioCircleActive]}>
                    {isSelected && <View style={s.radioDot} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Order Summary */}
        <Card padding="md">
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#1A1A1A', marginBottom: 10 }}>
            Order Summary ({cart.length} produce types)
          </Text>
          <View style={{ gap: 6 }}>
            {cart.map(item => (
              <View key={item.listing._id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: '#4B5563' }}>
                  {`${item.listing.cropName} (${item.quantityKg}kg)`}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#1A1A1A' }}>
                  {`LKR ${(item.listing.pricePerKg * item.quantityKg).toLocaleString()}`}
                </Text>
              </View>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0EE' }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Delivery Logistics:</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#1A1A1A' }}>
                {deliveryMode === 'pickup' ? 'FREE (Self-Pickup)' : `LKR ${deliveryFee.toLocaleString()}`}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#E5E5E5' }}>
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#1A1A1A' }}>Grand Total</Text>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#1F5C3A' }}>
                {`LKR ${total.toLocaleString()}`}
              </Text>
            </View>
          </View>
        </Card>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          onPress={handleConfirmOrder}
        >
          Confirm & Place Order
        </Button>
      </View>
    </ScrollView>
  );
};

// ===================== 6. BUYER ORDER CONFIRMATION SCREEN =====================
export const BuyerOrderConfirmationScreen: React.FC = () => {
  const { navState, orders, goToSubScreen } = useApp();
  const order = orders.find(o => o._id === navState.selectedOrderId) || orders[0];

  return (
    <ScrollView style={s.mainScroll} contentContainerStyle={{ padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: '80%' }}>
      <View style={s.confirmIconCircle}>
        <CheckCircle2 size={48} color="#1F5C3A" />
      </View>

      <Text style={{ fontSize: 22, fontWeight: '900', color: '#1A1A1A', marginTop: 16, textAlign: 'center' }}>
        Order Placed Successfully!
      </Text>

      <Text style={{ fontSize: 13, color: '#4B6B56', textAlign: 'center', marginTop: 6 }}>
        Direct notification sent to the farmer to begin fresh dawn harvesting.
      </Text>

      {order && (
        <Card padding="md" style={{ width: '100%', marginTop: 20 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Order Tracking No:</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1F5C3A' }}>{order.orderNumber}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Produce:</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1A1A1A' }}>
                {order.items.map(i => `${i.cropName} (${i.quantityKg}kg)`).join(', ')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Total Paid/Payable:</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1A1A1A' }}>{`LKR ${order.total.toLocaleString()}`}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Delivery To:</Text>
              <Text style={{ fontSize: 12, color: '#1A1A1A', flex: 1, textAlign: 'right', marginLeft: 8 }} numberOfLines={1}>
                {order.deliveryAddress}
              </Text>
            </View>
          </View>
        </Card>
      )}

      <View style={{ width: '100%', gap: 10, marginTop: 24 }}>
        <Button
          variant="primary"
          fullWidth
          size="lg"
          leftIcon={<Truck size={18} color="#ffffff" />}
          onPress={() => goToSubScreen('order_tracking', { orderId: order?._id })}
        >
          Track Live Shipment
        </Button>

        <Button
          variant="outline"
          fullWidth
          size="md"
          onPress={() => goToSubScreen(null)}
        >
          Back to Marketplace
        </Button>
      </View>
    </ScrollView>
  );
};

// ===================== 7. BUYER ORDER TRACKING / MY ORDERS SCREEN =====================
export const BuyerOrderTrackingScreen: React.FC = () => {
  const { orders, navState, goToSubScreen, goBack } = useApp();

  const myOrders = orders;
  const activeOrder = navState.selectedOrderId
    ? orders.find(o => o._id === navState.selectedOrderId)
    : myOrders[0];

  const STATUS_STEPS: OrderStatus[] = [
    'pending',
    'accepted',
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
  ];

  const getStepIndex = (status: OrderStatus) => STATUS_STEPS.indexOf(status);

  return (
    <ScrollView style={s.mainScroll} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable onPress={goBack} style={s.qtyBtn}>
            <ArrowLeft size={18} color="#1A1A1A" />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#1A1A1A' }}>
            My Orders & Live Tracking
          </Text>
        </View>

        {/* Active Selected Order Tracker */}
        {activeOrder && (
          <Card padding="md" variant="mint">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 11, color: '#4B6B56', fontWeight: '700' }}>ACTIVE SHIPMENT</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A' }}>{activeOrder.orderNumber}</Text>
              </View>
              <StatusPill status={activeOrder.status} />
            </View>

            <View style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 }}>
                Harvest & Dispatch Stepper
              </Text>
              <View style={{ gap: 10 }}>
                {[
                  { label: 'Order Placed & Verified', desc: 'Received at farm gate' },
                  { label: 'Farmer Accepted', desc: 'Dawn harvesting assigned' },
                  { label: 'Graded & Crated', desc: 'Packed into ventilated crates' },
                  { label: 'Handed to Logistics Fleet', desc: 'Loaded on Goviya truck' },
                  { label: 'Out for Final Delivery', desc: 'Driver en route' },
                  { label: 'Delivered & Inspected', desc: 'Handover complete' },
                ].map((step, idx) => {
                  const currentIdx = getStepIndex(activeOrder.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <View key={step.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View
                        style={[
                          s.trackerNode,
                          isDone && { backgroundColor: '#1F5C3A' },
                          isCurrent && { borderWidth: 3, borderColor: '#86EFAC' },
                        ]}
                      >
                        {isDone && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: isDone ? '700' : '500', color: isDone ? '#1A1A1A' : '#9CA3AF' }}>
                          {step.label}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#6B7280' }}>{step.desc}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </Card>
        )}

        {/* All Past Orders List */}
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#1A1A1A' }}>
          All Orders ({myOrders.length})
        </Text>

        <View style={{ gap: 8 }}>
          {myOrders.map(order => (
            <Card
              key={order._id}
              padding="md"
              variant="interactive"
              onPress={() => goToSubScreen('order_tracking', { orderId: order._id })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#1A1A1A' }}>
                  {order.orderNumber}
                </Text>
                <StatusPill status={order.status} />
              </View>

              <Text style={{ fontSize: 12, color: '#4B6B56', marginTop: 4 }}>
                {order.items.map(i => `${i.cropName} (${i.quantityKg}kg)`).join(' · ')}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0EE' }}>
                <Text style={{ fontSize: 11, color: '#6B7280' }}>
                  {order.deliveryAddress}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#1F5C3A' }}>
                  {`LKR ${order.total.toLocaleString()}`}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// ===================== 8. BUYER CHAT SCREEN =====================
export const BuyerChatScreen: React.FC = () => {
  const { navState, conversations, messages, sendMessage, goBack } = useApp();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');

  const conv = conversations.find(c => c._id === navState.selectedConversationId) || conversations[0];
  const convMessages = messages.filter(m => m.conversationId === conv?._id);

  const handleSend = () => {
    if (!inputText.trim() || !conv) return;
    sendMessage(conv._id, inputText.trim(), 'text');
    setInputText('');
  };

  const quickReplies = [
    'Is produce ready for dawn pickup tomorrow?',
    'Can you supply 100kg bulk crates?',
    'Is this 100% GAP organic certified?',
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F7F5' }}>
      {/* Chat Header */}
      <View style={s.chatHeader}>
        <Pressable onPress={goBack} style={s.qtyBtn}>
          <ArrowLeft size={18} color="#1A1A1A" />
        </Pressable>
        <Avatar name={conv?.participants?.find(p => p.role === 'farmer')?.name || 'Farmer'} size="sm" role="farmer" />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }} numberOfLines={1}>
            {conv?.participants?.find(p => p.role === 'farmer')?.name || 'Farmer Partner'}
          </Text>
          <Text style={{ fontSize: 10, color: '#1F5C3A', fontWeight: '600' }}>
            Direct Producer Line · {conv?.relatedCropName || 'Fresh Produce'}
          </Text>
        </View>
      </View>

      {/* Message List */}
      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ gap: 10, paddingBottom: 20 }}>
        {convMessages.map(msg => {
          const isMe = msg.senderRole === 'buyer';
          return (
            <View
              key={msg._id}
              style={[
                s.chatBubble,
                isMe ? s.chatBubbleBuyer : s.chatBubbleFarmer,
              ]}
            >
              <Text style={[s.chatBubbleText, isMe && { color: '#FFFFFF' }]}>
                {msg.content}
              </Text>
              <Text style={[s.chatBubbleTime, isMe && { color: 'rgba(255,255,255,0.7)' }]}>
                {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Quick Inquiries */}
      <View style={{ paddingHorizontal: 12, paddingBottom: 6 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {quickReplies.map(q => (
            <Pressable
              key={q}
              onPress={() => setInputText(q)}
              style={s.quickReplyChip}
            >
              <Text style={{ fontSize: 11, color: '#1F5C3A', fontWeight: '600' }}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Chat Input Bar */}
      <View style={[s.chatInputBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message farmer directly..."
          placeholderTextColor="#9CA3AF"
          style={s.chatInput}
        />
        <Pressable onPress={handleSend} style={s.chatSendBtn}>
          <Send size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
};

// ===================== 9. MARKET PRICES WHOLESALE SCREEN =====================
export const MarketPricesScreen: React.FC = () => {
  const { marketPrices, goBack } = useApp();
  const [marketFilter, setMarketFilter] = useState<string>('All');

  const filteredPrices = marketPrices.filter(p =>
    marketFilter === 'All' || p.marketName.toLowerCase().includes(marketFilter.toLowerCase())
  );

  return (
    <ScrollView style={s.mainScroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable onPress={goBack} style={s.qtyBtn}>
            <ArrowLeft size={18} color="#1A1A1A" />
          </Pressable>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1A1A1A' }}>
              Wholesale Market Rates
            </Text>
            <Text style={{ fontSize: 11, color: '#6B7280' }}>
              Official Agrarian Development Economic Centre Benchmark
            </Text>
          </View>
        </View>

        {/* Market Filter Chips */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {['All', 'Dambulla', 'Pettah', 'Nuwara Eliya'].map(m => (
            <Pressable
              key={m}
              onPress={() => setMarketFilter(m)}
              style={[
                s.optionChip,
                marketFilter === m
                  ? { backgroundColor: '#1F5C3A', borderColor: '#1F5C3A' }
                  : { backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' },
              ]}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: marketFilter === m ? '#ffffff' : '#1A1A1A' }}>
                {m}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Pricing Cards */}
        <View style={{ gap: 8 }}>
          {filteredPrices.map(item => (
            <Card key={item.id} padding="md">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#1A1A1A' }}>
                    {item.crop}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
                    {item.marketName}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 15, fontWeight: '900', color: '#1F5C3A' }}>
                    {`LKR ${item.retailAvgLkr}/kg`}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                    {item.trend === 'up' ? (
                      <TrendingUp size={12} color="#DC2626" />
                    ) : (
                      <TrendingDown size={12} color="#16A34A" />
                    )}
                    <Text style={{ fontSize: 10, fontWeight: '700', color: item.trend === 'up' ? '#DC2626' : '#16A34A' }}>
                      {`Range: ${item.wholesaleMinLkr} - ${item.wholesaleMaxLkr}`}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// ===================== 10. BUYER PROFILE SCREEN =====================
export const BuyerProfileScreen: React.FC = () => {
  const { currentUser, logout, openAuth, goToSubScreen } = useApp();

  return (
    <ScrollView style={s.mainScroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={{ gap: 16 }}>
        <Card padding="md" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={currentUser?.name || 'Guest User'} size="lg" role="buyer" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1A1A' }}>
              {currentUser?.name || 'Guest Buyer'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              {currentUser?.phone || 'No phone registered'}
            </Text>
          </View>
        </Card>

        <Card padding="none">
          <Pressable
            onPress={() => goToSubScreen('my_orders')}
            style={s.profileRow}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ShoppingBag size={18} color="#1F5C3A" />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>
                My Orders & Trackers
              </Text>
            </View>
            <ChevronRight size={16} color="#9CA3AF" />
          </Pressable>

          <View style={s.profileDivider} />

          <Pressable
            onPress={() => goToSubScreen('chat_list')}
            style={s.profileRow}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={18} color="#1F5C3A" />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>
                Direct Farmer Messages
              </Text>
            </View>
            <ChevronRight size={16} color="#9CA3AF" />
          </Pressable>

          <View style={s.profileDivider} />

          <Pressable
            onPress={() => goToSubScreen('market_prices')}
            style={s.profileRow}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <FileText size={18} color="#1F5C3A" />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>
                Live Wholesale Market Benchmarks
              </Text>
            </View>
            <ChevronRight size={16} color="#9CA3AF" />
          </Pressable>
        </Card>

        {currentUser ? (
          <Button variant="destructive" fullWidth size="md" onPress={logout}>
            Sign Out
          </Button>
        ) : (
          <Button variant="primary" fullWidth size="md" onPress={() => openAuth('buyer')}>
            Sign In / Register
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

// ===================== MAIN BUYER SCREEN ROUTER =====================
export const BuyerScreens: React.FC = () => {
  const { navState } = useApp();

  // Route sub-screens
  switch (navState.subScreen) {
    case 'product_detail':
      return <BuyerProductDetailScreen />;
    case 'cart':
      return <BuyerCartScreen />;
    case 'checkout':
      return <BuyerCheckoutScreen />;
    case 'order_confirmation':
      return <BuyerOrderConfirmationScreen />;
    case 'order_tracking':
    case 'my_orders':
      return <BuyerOrderTrackingScreen />;
    case 'chat_detail':
    case 'chat_list':
      return <BuyerChatScreen />;
    case 'market_prices':
      return <MarketPricesScreen />;
    default:
      break;
  }

  // Route tabs
  switch (navState.activeTab) {
    case 'nearby':
      return <BuyerNearbyScreen />;
    case 'cart':
      return <BuyerCartScreen />;
    case 'profile':
      return <BuyerProfileScreen />;
    case 'home':
    default:
      return <BuyerHomeScreen />;
  }
};

// ===================== STYLES =====================
const s = StyleSheet.create({
  mainScroll: {
    flex: 1,
    backgroundColor: '#F6F7F5',
  },
  filterBtn: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  filterBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F5C3A',
  },
  produceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  produceChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  promoBanner: {
    borderRadius: 16,
    backgroundColor: '#1F5C3A',
    padding: 16,
  },
  promoTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  promoTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  promoSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  promoBtn: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  promoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F5C3A',
  },
  benchmarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F2E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  benchmarkBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F5C3A',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priceChip: {
    flex: 1,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1F5C3A',
    borderColor: '#1F5C3A',
  },
  qtyBtn: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  // Detail screen styles
  detailHeroMedia: {
    width: '100%',
    height: 240,
    backgroundColor: '#EAF2EC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  detailBackBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  detailOrganicPill: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#1F5C3A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  detailOrganicText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  qtyControlBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileBtn: {
    backgroundColor: '#E6F2E8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  viewProfileText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F5C3A',
  },
  farmerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  detailFloatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaAddBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#E6F2E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBuyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1F5C3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Checkout styles
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  segmentTabActive: {
    backgroundColor: '#1F5C3A',
  },
  segmentTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  segmentTabTextActive: {
    color: '#FFFFFF',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#1F5C3A',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1F5C3A',
  },
  confirmIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F2E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackerNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Chat styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 14,
  },
  chatBubbleBuyer: {
    alignSelf: 'flex-end',
    backgroundColor: '#1F5C3A',
    borderBottomRightRadius: 2,
  },
  chatBubbleFarmer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  chatBubbleText: {
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 18,
  },
  chatBubbleTime: {
    fontSize: 9.5,
    color: '#9CA3AF',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  quickReplyChip: {
    backgroundColor: '#E6F2E8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1A1A1A',
  },
  chatSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1F5C3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
