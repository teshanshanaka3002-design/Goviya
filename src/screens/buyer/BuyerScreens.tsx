import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  TextInput,
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
  Calendar,
  Layers,
  Check,
  Clock,
  Navigation,
  X,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  FileText,
  LogOut,
  LogIn,
  SlidersHorizontal,
  ArrowLeft,
  Lock,
  TrendingUp,
  TrendingDown,
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
import { Listing, OrderStatus } from '../../types';

// ===================== 1. BUYER HOME SCREEN =====================
export const BuyerHomeScreen: React.FC = () => {
  const { listings, goToSubScreen } = useApp();
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
            style={({ pressed }) => [
              s.filterBtn,
              activeFiltersCount > 0
                ? { backgroundColor: '#1F5C3A', borderColor: '#1F5C3A' }
                : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
              pressed && s.btnPressed,
            ]}
          >
            <SlidersHorizontal size={17} color={activeFiltersCount > 0 ? '#ffffff' : '#1E293B'} />
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
          contentContainerStyle={{ paddingVertical: 4, gap: 7 }}
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
                style={({ pressed }) => [
                  s.produceChip,
                  isSelected
                    ? { backgroundColor: '#1F5C3A', borderColor: '#1F5C3A' }
                    : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                  pressed && s.btnPressed,
                ]}
              >
                <Text style={{ fontSize: 13 }}>{item.emoji}</Text>
                <Text style={[s.produceChipText, isSelected ? { color: '#fff' } : { color: '#334155' }]}>
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
              <Sparkles size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={s.promoTagText}>Hill Country Harvest</Text>
            </View>
            <Text style={s.promoTitle}>
              Nuwara Eliya & Dambulla Direct Farm Gate
            </Text>
            <Text style={s.promoSubtitle}>
              Up to 35% lower than Pettah broker margins. Freshly picked at dawn.
            </Text>
            <Pressable
              onPress={() => setSearchQuery('carrots')}
              style={({ pressed }) => [s.promoBtn, pressed && s.btnPressed]}
            >
              <Text style={s.promoBtnText}>Explore Fresh Carrots →</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Product Grid */}
      <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>
            Available Harvest ({filteredListings.length})
          </Text>
          <Pressable
            onPress={() => goToSubScreen('market_prices')}
            style={({ pressed }) => [s.benchmarkBtn, pressed && s.btnPressed]}
          >
            <View style={s.liveGreenDot} />
            <TrendingUp size={13} color="#1F5C3A" />
            <Text style={s.benchmarkBtnText}>Wholesale Rates</Text>
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
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button variant="outline" style={{ flex: 1 }} onPress={resetAllFilters}>
              Reset
            </Button>
            <Button variant="primary" style={{ flex: 1 }} onPress={() => setIsFilterOpen(false)}>
              {`Show (${filteredListings.length})`}
            </Button>
          </View>
        }
      >
        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
            {`Max Price: LKR ${maxPrice}/kg`}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[200, 400, 600, 800].map(p => (
              <Pressable
                key={p}
                onPress={() => setMaxPrice(p)}
                style={({ pressed }) => [
                  s.priceChip,
                  maxPrice === p
                    ? { backgroundColor: '#E6F2E8', borderColor: '#1F5C3A' }
                    : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                  pressed && s.btnPressed,
                ]}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: maxPrice === p ? '#1F5C3A' : '#1E293B' }}>
                  {`LKR ${p}`}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
            District Origin
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['All', 'Nuwara Eliya', 'Matale', 'Kandy', 'Jaffna', 'Badulla', 'Colombo'].map(d => (
              <Pressable
                key={d}
                onPress={() => setSelectedDistrict(d)}
                style={({ pressed }) => [
                  s.optionChip,
                  selectedDistrict === d
                    ? { backgroundColor: '#1F5C3A', borderColor: '#1F5C3A' }
                    : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                  pressed && s.btnPressed,
                ]}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: selectedDistrict === d ? '#ffffff' : '#334155' }}>
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
              {onlyOrganic && <Check size={12} color="#ffffff" strokeWidth={3} />}
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F172A' }}>
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
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  const listing = listings.find(l => l._id === navState.selectedListingId) || listings[0];
  if (!listing) return null;

  const currentQty = Math.max(1, quantity);
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
    <View style={{ flex: 1, backgroundColor: '#F8FAF8' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}>
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

          <Pressable
            onPress={goBack}
            style={({ pressed }) => [s.detailBackBtn, pressed && s.btnPressed]}
          >
            <ArrowLeft size={19} color="#1E293B" strokeWidth={2.5} />
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
              <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#1F5C3A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {listing.category}
              </Text>
              <View style={s.ratingPill}>
                <Star size={13} color="#F59E0B" fill="#F59E0B" />
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#1E293B' }}>
                  {listing.farmerRating.toFixed(1)}
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 22, fontWeight: '900', color: '#0F172A', marginTop: 6 }}>
              {listing.cropName}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#1F5C3A' }}>
                {`LKR ${listing.pricePerKg.toLocaleString()}`}
              </Text>
              <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '600' }}>/ kg wholesale rate</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
              <MapPin size={15} color="#1F5C3A" />
              <Text style={{ fontSize: 13, color: '#4B6B56', fontWeight: '500' }}>
                {listing.location.town}, {listing.location.district} District
              </Text>
            </View>
          </Card>

          {/* Quantity Selector Card */}
          <Card padding="md">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#0F172A' }}>Order Quantity</Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>Starting from 1 kg</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Pressable
                  onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                  style={({ pressed }) => [s.qtyControlBtn, pressed && s.btnPressed]}
                >
                  <Minus size={16} color="#1E293B" strokeWidth={2.5} />
                </Pressable>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#0F172A', minWidth: 48, textAlign: 'center' }}>
                  {`${currentQty} kg`}
                </Text>
                <Pressable
                  onPress={() => setQuantity(prev => prev + 1)}
                  style={({ pressed }) => [s.qtyControlBtn, pressed && s.btnPressed]}
                >
                  <Plus size={16} color="#1E293B" strokeWidth={2.5} />
                </Pressable>
              </View>
            </View>

            {/* Quick Presets */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              {[1, 2, 5, 10, 25].map(kg => (
                <Pressable
                  key={kg}
                  onPress={() => setQuantity(kg)}
                  style={({ pressed }) => [
                    {
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: currentQty === kg ? '#1F5C3A' : '#E2E8F0',
                      backgroundColor: currentQty === kg ? '#E6F2E8' : '#F8FAF8',
                    },
                    pressed && s.btnPressed,
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: currentQty === kg ? '#1F5C3A' : '#475569',
                    }}
                  >
                    {`${kg}kg`}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
              <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>Estimated Batch Total:</Text>
              <Text style={{ fontSize: 17, fontWeight: '900', color: '#1F5C3A' }}>
                {`LKR ${totalPrice.toLocaleString()}`}
              </Text>
            </View>
          </Card>

          {/* Farmer Profile Card */}
          <Card padding="md">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar name={listing.farmerName} size="md" role="farmer" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>
                  {listing.farmerName}
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>
                  Verified Producer · {listing.location.town}
                </Text>
              </View>
              <Pressable
                onPress={() => setIsSellerModalOpen(true)}
                style={({ pressed }) => [s.viewProfileBtn, pressed && s.btnPressed]}
              >
                <Text style={s.viewProfileText}>Farm Details</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Pressable
                onPress={handleChat}
                style={({ pressed }) => [
                  s.farmerActionBtn,
                  { backgroundColor: '#E6F2E8', borderColor: '#CDE5D2' },
                  pressed && s.btnPressed,
                ]}
              >
                <MessageSquare size={15} color="#1F5C3A" />
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#1F5C3A' }}>Message Farmer</Text>
              </Pressable>
              <Pressable
                onPress={() => Linking.openURL(`tel:${listing.farmerPhone}`)}
                style={({ pressed }) => [
                  s.farmerActionBtn,
                  { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                  pressed && s.btnPressed,
                ]}
              >
                <Phone size={15} color="#1E293B" />
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#1E293B' }}>Call Farm</Text>
              </Pressable>
            </View>
          </Card>

          {/* Freshness & Harvest Guarantee */}
          <Card padding="md" variant="mint">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <ShieldCheck size={19} color="#1F5C3A" />
              <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#1F5C3A' }}>
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
        <View style={s.detailPriceSummary}>
          <Text style={s.detailPriceLabel}>TOTAL PRICE</Text>
          <Text style={s.detailPriceValue} numberOfLines={1}>
            {`LKR ${totalPrice.toLocaleString()}`}
          </Text>
          <Text style={s.detailPriceSub}>{`${currentQty} kg harvest`}</Text>
        </View>

        <View style={s.detailCtaGroup}>
          <Button
            variant={justAdded ? 'primary' : 'secondary'}
            size="md"
            leftIcon={justAdded ? <Check size={16} color="#FFFFFF" strokeWidth={2.5} /> : <ShoppingBag size={16} color="#1F5C3A" />}
            onPress={handleAddToCart}
          >
            {justAdded ? 'Added' : 'Add to Cart'}
          </Button>

          <Button
            variant="primary"
            size="md"
            rightIcon={<ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />}
            onPress={handleBuyNow}
          >
            Buy Now
          </Button>
        </View>
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
  const { users, listings, getOrCreateConversation, goToSubScreen } = useApp();
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'farmers' | 'vegetables'>('all');
  const [selectedFarmerModalId, setSelectedFarmerModalId] = useState<string | null>(null);
  const [selectedMapMarkerId, setSelectedMapMarkerId] = useState<string | null>(null);

  const presetLocations = [
    { label: 'All Island', value: '' },
    { label: 'Pannipitiya', value: 'Pannipitiya' },
    { label: 'Nuwara Eliya', value: 'Nuwara Eliya' },
    { label: 'Dambulla', value: 'Dambulla' },
    { label: 'Jaffna', value: 'Jaffna' },
    { label: 'Colombo', value: 'Colombo' },
  ];

  const trimmedQuery = searchLocation.trim().toLowerCase();
  const searchTokens = trimmedQuery ? trimmedQuery.split(/\s+/).filter(Boolean) : [];

  // All farmer accounts
  const allFarmers = useMemo(() => {
    return users.filter(u => u.role === 'farmer');
  }, [users]);

  // Filter farmers by searched location, town, district, or produce name
  const filteredFarmers = useMemo(() => {
    if (searchTokens.length === 0) return allFarmers;
    return allFarmers.filter(farmer => {
      const farmerListings = listings.filter(l => l.farmerId === farmer._id);
      const combinedText = [
        farmer.name,
        farmer.farmName || '',
        farmer.location?.town || '',
        farmer.location?.district || '',
        farmer.location?.address || '',
        ...farmerListings.map(l => `${l.cropName} ${l.category} ${l.location.town} ${l.location.district}`),
      ]
        .join(' ')
        .toLowerCase();

      return searchTokens.every(token => combinedText.includes(token));
    });
  }, [allFarmers, listings, searchTokens]);

  // Filter vegetables/crops by searched location, town, district, or crop name
  const filteredVegetables = useMemo(() => {
    return listings.filter(l => {
      if (l.status === 'removed') return false;
      if (searchTokens.length === 0) return true;

      const combinedText = [
        l.cropName,
        l.category,
        l.farmerName,
        l.location.town,
        l.location.district,
        l.description || '',
      ]
        .join(' ')
        .toLowerCase();

      return searchTokens.every(token => combinedText.includes(token));
    });
  }, [listings, searchTokens]);

  // Map markers synchronized to the active location query & filter
  const mapMarkers = useMemo(() => {
    const list: {
      id: string;
      name: string;
      crop?: string;
      district: string;
      town: string;
      lat: number;
      lng: number;
      type?: 'farmer' | 'buyer' | 'driver';
    }[] = [];

    if (filterType === 'all' || filterType === 'farmers') {
      filteredFarmers.forEach(f => {
        if (f.location) {
          list.push({
            id: f._id,
            name: f.name,
            crop: f.farmName || 'Verified Farm',
            district: f.location.district || '',
            town: f.location.town || f.location.district || '',
            lat: f.location.lat,
            lng: f.location.lng,
            type: 'farmer',
          });
        }
      });
    }

    if (filterType === 'all' || filterType === 'vegetables') {
      filteredVegetables.forEach(v => {
        const isDuplicate = list.some(
          m =>
            Math.abs(m.lat - v.location.lat) < 0.001 &&
            Math.abs(m.lng - v.location.lng) < 0.001 &&
            m.name === v.cropName
        );
        if (!isDuplicate) {
          list.push({
            id: v._id,
            name: v.cropName,
            crop: v.cropName,
            district: v.location.district,
            town: v.location.town,
            lat: v.location.lat,
            lng: v.location.lng,
            type: 'farmer',
          });
        }
      });
    }

    return list;
  }, [filteredFarmers, filteredVegetables, filterType]);

  const handleChat = (farmerId: string, farmerName: string) => {
    const primaryCrop = listings.find(l => l.farmerId === farmerId)?.cropName || 'Fresh Harvest';
    const convId = getOrCreateConversation(farmerId, farmerName, primaryCrop, 'farmer');
    goToSubScreen('chat_detail', { conversationId: convId });
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const showFarmers = filterType === 'all' || filterType === 'farmers';
  const showVegetables = filterType === 'all' || filterType === 'vegetables';
  const totalCount = filteredFarmers.length + filteredVegetables.length;

  return (
    <ScrollView style={s.mainScroll} contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={{ padding: 16, gap: 14 }}>
        {/* Header Title & Subtitle */}
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>
            Nearby Agrarian Hubs & Farm Gates
          </Text>
          <Text style={{ fontSize: 12.5, color: '#64748B', lineHeight: 18 }}>
            Search any location to discover registered smallholder farmers and freshly harvested crops directly at farm gates.
          </Text>
        </View>

        {/* Location Search Bar */}
        <View style={s.nearbySearchContainer}>
          <MapPin size={18} color="#16A34A" />
          <TextInput
            style={s.nearbySearchInput}
            placeholder="Search location (e.g. Pannipitiya, Nuwara Eliya, Jaffna)..."
            placeholderTextColor="#94A3B8"
            value={searchLocation}
            onChangeText={setSearchLocation}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchLocation.length > 0 && (
            <Pressable
              onPress={() => setSearchLocation('')}
              style={s.nearbyClearBtn}
              hitSlop={8}
            >
              <X size={14} color="#64748B" />
            </Pressable>
          )}
        </View>

        {/* Quick Suggestion Location Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        >
          {presetLocations.map(loc => {
            const isSelected =
              (loc.value === '' && !searchLocation) ||
              (loc.value !== '' && searchLocation.toLowerCase() === loc.value.toLowerCase());
            return (
              <Pressable
                key={loc.label}
                onPress={() => setSearchLocation(loc.value)}
                style={({ pressed }) => [
                  s.nearbyPresetChip,
                  isSelected && s.nearbyPresetChipActive,
                  pressed && s.btnPressed,
                ]}
              >
                <Text
                  style={[
                    s.nearbyPresetText,
                    isSelected && s.nearbyPresetTextActive,
                  ]}
                >
                  {loc.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Filter Selection Tabs: All | Farmers | Vegetables */}
        <View style={s.nearbyFilterRow}>
          <Pressable
            onPress={() => setFilterType('all')}
            style={[s.nearbyFilterTab, filterType === 'all' && s.nearbyFilterTabActive]}
          >
            <Text
              style={[
                s.nearbyFilterTabText,
                filterType === 'all' && s.nearbyFilterTabTextActive,
              ]}
            >
              All
            </Text>
            <View
              style={[
                s.nearbyCountBadge,
                filterType !== 'all' && s.nearbyCountBadgeInactive,
              ]}
            >
              <Text
                style={[
                  s.nearbyCountBadgeText,
                  filterType !== 'all' && s.nearbyCountBadgeTextInactive,
                ]}
              >
                {totalCount}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setFilterType('farmers')}
            style={[s.nearbyFilterTab, filterType === 'farmers' && s.nearbyFilterTabActive]}
          >
            <Text
              style={[
                s.nearbyFilterTabText,
                filterType === 'farmers' && s.nearbyFilterTabTextActive,
              ]}
            >
              Farmers
            </Text>
            <View
              style={[
                s.nearbyCountBadge,
                filterType !== 'farmers' && s.nearbyCountBadgeInactive,
              ]}
            >
              <Text
                style={[
                  s.nearbyCountBadgeText,
                  filterType !== 'farmers' && s.nearbyCountBadgeTextInactive,
                ]}
              >
                {filteredFarmers.length}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setFilterType('vegetables')}
            style={[s.nearbyFilterTab, filterType === 'vegetables' && s.nearbyFilterTabActive]}
          >
            <Text
              style={[
                s.nearbyFilterTabText,
                filterType === 'vegetables' && s.nearbyFilterTabTextActive,
              ]}
            >
              Vegetables
            </Text>
            <View
              style={[
                s.nearbyCountBadge,
                filterType !== 'vegetables' && s.nearbyCountBadgeInactive,
              ]}
            >
              <Text
                style={[
                  s.nearbyCountBadgeText,
                  filterType !== 'vegetables' && s.nearbyCountBadgeTextInactive,
                ]}
              >
                {filteredVegetables.length}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Interactive Map View */}
        <View style={{ gap: 8 }}>
          <SriLankaMap
            markers={mapMarkers}
            selectedId={selectedMapMarkerId}
            onSelectMarker={id => setSelectedMapMarkerId(id)}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={s.liveGreenDot} />
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#166534' }}>
                {trimmedQuery
                  ? `Showing results for "${searchLocation}" (${totalCount} locations)`
                  : `Showing all Sri Lanka agrarian hubs (${mapMarkers.length} locations)`}
              </Text>
            </View>
          </View>
        </View>

        {/* Empty State when no results found */}
        {totalCount === 0 && (
          <View style={s.nearbyEmptyCard}>
            <View style={s.nearbyEmptyIconCircle}>
              <MapPin size={28} color="#94A3B8" />
            </View>
            <Text style={s.nearbyEmptyTitle}>
              No Farmers or Vegetables Found
            </Text>
            <Text style={s.nearbyEmptyDesc}>
              {`No active farm gates or harvests matched "${searchLocation}". Try selecting Pannipitiya, Nuwara Eliya, or Dambulla.`}
            </Text>
            <Pressable
              onPress={() => setSearchLocation('')}
              style={({ pressed }) => [s.nearbyResetBtn, pressed && s.btnPressed]}
            >
              <Text style={s.nearbyResetBtnText}>View All Regions</Text>
            </Pressable>
          </View>
        )}

        {/* Section 1: Farmers List */}
        {showFarmers && filteredFarmers.length > 0 && (
          <View style={{ gap: 12, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 15.5, fontWeight: '800', color: '#0F172A' }}>
                  {trimmedQuery ? `Farmers in ${searchLocation}` : 'Registered Farmers'}
                </Text>
                <View style={s.filterBadge}>
                  <Text style={s.filterBadgeText}>{filteredFarmers.length}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 11.5, color: '#64748B', fontWeight: '600' }}>
                Direct Farm Gate Contact
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              {filteredFarmers.map(farmer => {
                const farmerListings = listings.filter(
                  l => l.farmerId === farmer._id && l.status !== 'removed'
                );
                const farmerTown =
                  farmer.location?.town || farmerListings[0]?.location.town || 'Sri Lanka';
                const farmerDistrict =
                  farmer.location?.district || farmerListings[0]?.location.district || '';

                return (
                  <View key={farmer._id} style={s.nearbyFarmerCard}>
                    {/* Top Row: Avatar, Farmer & Farm Info, Rating */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 10,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <View style={s.nearbyFarmerAvatar}>
                          <Text style={s.nearbyFarmerAvatarText}>
                            {farmer.name.charAt(0).toUpperCase()}
                          </Text>
                          <View style={s.nearbyFarmerVerifiedDot} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                            <Text style={s.nearbyFarmerName} numberOfLines={1}>
                              {farmer.name}
                            </Text>
                            <View style={s.nearbyVerifiedBadge}>
                              <ShieldCheck size={11} color="#16A34A" />
                              <Text style={s.nearbyVerifiedText}>Verified</Text>
                            </View>
                          </View>
                          <Text style={s.nearbyFarmName} numberOfLines={1}>
                            {farmer.farmName || 'Direct Farm Producer'}
                          </Text>
                        </View>
                      </View>

                      {/* Rating Badge */}
                      <View style={s.nearbyRatingBadge}>
                        <Star size={13} color="#F59E0B" fill="#F59E0B" />
                        <Text style={s.nearbyRatingText}>
                          {farmer.rating?.toFixed(1) || '4.9'}
                        </Text>
                        <Text style={s.nearbyRatingCount}>
                          ({farmer.totalRatings || 86})
                        </Text>
                      </View>
                    </View>

                    {/* Location & Farm Size Row */}
                    <View style={s.nearbyLocationRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
                        <MapPin size={13} color="#16A34A" />
                        <Text style={s.nearbyLocationText} numberOfLines={1}>
                          {farmerTown}, {farmerDistrict}
                        </Text>
                      </View>
                      <View style={s.nearbyFarmSizeBadge}>
                        <Text style={s.nearbyFarmSizeText}>
                          {farmer.farmSizeAcres ? `${farmer.farmSizeAcres} Acres Farm` : 'Smallholder Farm'}
                        </Text>
                      </View>
                    </View>

                    {/* Crops Supplied by this farmer */}
                    {farmerListings.length > 0 && (
                      <View style={{ gap: 6 }}>
                        <Text style={s.nearbySectionSublabel}>
                          Active Harvest from this Farm Gate:
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {farmerListings.map(fl => (
                            <Pressable
                              key={fl._id}
                              onPress={() => goToSubScreen('product_detail', { listingId: fl._id })}
                              style={({ pressed }) => [s.nearbyProducePill, pressed && s.btnPressed]}
                            >
                              <Text style={s.nearbyProducePillText} numberOfLines={1}>
                                {fl.cropName}
                              </Text>
                              <Text style={s.nearbyProducePillPrice}>
                                LKR {fl.pricePerKg}/kg
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Action buttons row */}
                    <View style={s.nearbyActionRow}>
                      <Pressable
                        onPress={() => handleCall(farmer.phone)}
                        style={({ pressed }) => [s.nearbyCallBtn, pressed && s.btnPressed]}
                      >
                        <Phone size={13} color="#334155" />
                        <Text style={s.nearbyCallBtnText}>Call</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleChat(farmer._id, farmer.name)}
                        style={({ pressed }) => [s.nearbyChatBtn, pressed && s.btnPressed]}
                      >
                        <MessageSquare size={13} color="#1F5C3A" />
                        <Text style={s.nearbyChatBtnText}>Chat</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setSelectedFarmerModalId(farmer._id)}
                        style={({ pressed }) => [s.nearbyProfileBtn, pressed && s.btnPressed]}
                      >
                        <ShieldCheck size={13} color="#FFFFFF" />
                        <Text style={s.nearbyProfileBtnText}>View Farm Profile</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Section 2: Vegetables & Harvests List */}
        {showVegetables && filteredVegetables.length > 0 && (
          <View style={{ gap: 12, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 15.5, fontWeight: '800', color: '#0F172A' }}>
                  {trimmedQuery ? `Vegetables in ${searchLocation}` : 'Fresh Vegetables & Harvest'}
                </Text>
                <View style={s.filterBadge}>
                  <Text style={s.filterBadgeText}>{filteredVegetables.length}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 11.5, color: '#64748B', fontWeight: '600' }}>
                Farm Gate Wholesale Pricing
              </Text>
            </View>

            <View style={{ gap: 10 }}>
              {filteredVegetables.map(listing => (
                <ProductCard key={listing._id} listing={listing} compact />
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Seller Profile Modal */}
      <SellerProfileModal
        farmerId={selectedFarmerModalId}
        isOpen={!!selectedFarmerModalId}
        onClose={() => setSelectedFarmerModalId(null)}
      />
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
      <View style={{ flex: 1, backgroundColor: '#F8FAF8', padding: 16, alignItems: 'center', justifyContent: 'center' }}>
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
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>Your Harvest Cart</Text>
          <Pressable onPress={clearCart} style={({ pressed }) => [pressed && s.btnPressed]}>
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#DC2626' }}>Clear All</Text>
          </Pressable>
        </View>

        <View style={{ gap: 10 }}>
          {cart.map(item => {
            const hasPhoto =
              item.listing.photos &&
              item.listing.photos.length > 0 &&
              (item.listing.photos[0].startsWith('data:image') || item.listing.photos[0].startsWith('http'));

            return (
              <Card key={item.listing._id} padding="md">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {/* Picture of the product */}
                  <View style={s.cartItemImageContainer}>
                    {hasPhoto ? (
                      <Image
                        source={{ uri: item.listing.photos[0] }}
                        style={s.cartItemImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <ProduceVisual type={item.listing.cropName} size="md" />
                    )}
                  </View>

                  {/* Product Details & Stepper */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14.5, fontWeight: '800', color: '#0F172A' }} numberOfLines={1}>
                      {item.listing.cropName}
                    </Text>
                    <Text style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }} numberOfLines={1}>
                      {`LKR ${item.listing.pricePerKg}/kg · ${item.listing.farmerName}`}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#1F5C3A', marginTop: 4 }}>
                      {`LKR ${(item.listing.pricePerKg * item.quantityKg).toLocaleString()}`}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Pressable
                          onPress={() => updateCartQuantity(item.listing._id, Math.max(1, item.quantityKg - 1))}
                          style={({ pressed }) => [s.qtyBtn, pressed && s.btnPressed]}
                        >
                          <Minus size={13} color="#1E293B" strokeWidth={2.5} />
                        </Pressable>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A', minWidth: 36, textAlign: 'center' }}>
                          {`${item.quantityKg}kg`}
                        </Text>
                        <Pressable
                          onPress={() => updateCartQuantity(item.listing._id, item.quantityKg + 1)}
                          style={({ pressed }) => [s.qtyBtn, pressed && s.btnPressed]}
                        >
                          <Plus size={13} color="#1E293B" strokeWidth={2.5} />
                        </Pressable>
                      </View>

                      <Pressable
                        onPress={() => removeFromCart(item.listing._id)}
                        style={({ pressed }) => [s.cartRemoveBtn, pressed && s.btnPressed]}
                      >
                        <Trash2 size={13} color="#DC2626" />
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#DC2626' }}>Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Cost Breakdown */}
        <Card padding="md">
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#64748B' }}>Harvest Subtotal</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>{`LKR ${subtotal.toLocaleString()}`}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#64748B' }}>Logistics Fleet Delivery</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>{`LKR ${deliveryFee.toLocaleString()}`}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#0F172A' }}>Total Amount</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#1F5C3A' }}>{`LKR ${total.toLocaleString()}`}</Text>
            </View>
          </View>
        </Card>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          rightIcon={<ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />}
          onPress={() => goToSubScreen('checkout')}
        >
          {`Proceed to Checkout (LKR ${total.toLocaleString()})`}
        </Button>
      </View>
    </ScrollView>
  );
};

// ===================== 5. BUYER CHECKOUT SCREEN =====================
type CheckoutStep = 'details' | 'cod_confirm' | 'card_form' | 'wallet_form';

export const BuyerCheckoutScreen: React.FC = () => {
  const { cart, currentUser, placeOrder, goToSubScreen, goBack } = useApp();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<CheckoutStep>('details');
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [buyerName, setBuyerName] = useState(currentUser?.name || 'Commercial Buyer');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '+94 77 123 4567');
  const [address, setAddress] = useState('No. 42/3, Havelock Road, Colombo 05');
  const [district, setDistrict] = useState('Colombo');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'card' | 'mobile_wallet'>('cash_on_delivery');
  const [notes, setNotes] = useState('Call recipient upon arrival');

  // Cash on Delivery confirmation state
  const [codAgreed, setCodAgreed] = useState<boolean>(false);

  // Card details state
  const [cardHolder, setCardHolder] = useState(currentUser?.name || 'Dinesh Wickramasinghe');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Mobile wallet state
  const [walletProvider, setWalletProvider] = useState<'Genie' | 'eZ Cash' | 'FriMi'>('Genie');
  const [walletPhone, setWalletPhone] = useState(currentUser?.phone || '+94 77 123 4567');

  const subtotal = cart.reduce((acc, item) => acc + item.listing.pricePerKg * item.quantityKg, 0);
  const deliveryFee = deliveryMode === 'pickup' ? 0 : 1500;
  const total = subtotal + deliveryFee;

  // Format card number with spaces (4-4-4-4)
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  // Format expiry with slash (MM/YY)
  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  // Step 1 -> Step 2: Validate info and continue (DOES NOT PLACE ORDER)
  const handleContinueToPayment = () => {
    if (!buyerName.trim() || !buyerPhone.trim()) {
      Alert.alert('Required Info', 'Please enter recipient name and phone number.');
      return;
    }
    if (deliveryMode === 'delivery' && !address.trim()) {
      Alert.alert('Required Info', 'Please enter your delivery street address.');
      return;
    }

    if (paymentMethod === 'cash_on_delivery') {
      setStep('cod_confirm');
    } else if (paymentMethod === 'card') {
      setStep('card_form');
    } else {
      setStep('wallet_form');
    }
  };

  // Step 2A: Confirm COD order
  const handlePlaceCodOrder = () => {
    if (!codAgreed) {
      Alert.alert(
        'Confirmation Required',
        'Please tick the confirmation checkbox to verify that you will pay in cash upon produce delivery.'
      );
      return;
    }

    try {
      const order = placeOrder({
        deliveryType: deliveryMode,
        deliveryAddress: address,
        district,
        paymentMethod: 'cash_on_delivery',
        notes,
        buyerName,
        buyerPhone,
      });
      goToSubScreen('order_confirmation', { orderId: order._id });
    } catch (e: any) {
      Alert.alert('Order Error', e?.message || 'Failed to place order.');
    }
  };

  // Step 2B: Pay with Card
  const handlePlaceCardOrder = () => {
    if (!cardHolder.trim()) {
      Alert.alert('Required', 'Please enter the cardholder name.');
      return;
    }
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 15) {
      Alert.alert('Invalid Card Number', 'Please enter a valid 16-digit card number.');
      return;
    }
    if (cardExpiry.length < 4) {
      Alert.alert('Invalid Expiry', 'Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (cardCvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter the 3-digit security code (CVV).');
      return;
    }

    try {
      const order = placeOrder({
        deliveryType: deliveryMode,
        deliveryAddress: address,
        district,
        paymentMethod: 'card',
        notes,
        buyerName,
        buyerPhone,
        cardDetails: {
          cardLast4: cleanNum.slice(-4),
          cardHolder,
        },
      });
      goToSubScreen('order_confirmation', { orderId: order._id });
    } catch (e: any) {
      Alert.alert('Payment Error', e?.message || 'Failed to process card payment.');
    }
  };

  // Step 2C: Pay via Mobile Wallet
  const handlePlaceWalletOrder = () => {
    if (!walletPhone.trim()) {
      Alert.alert('Required', 'Please enter your mobile wallet phone number.');
      return;
    }

    try {
      const order = placeOrder({
        deliveryType: deliveryMode,
        deliveryAddress: address,
        district,
        paymentMethod: 'mobile_wallet',
        notes: `${notes} (Wallet: ${walletProvider} - ${walletPhone})`,
        buyerName,
        buyerPhone,
      });
      goToSubScreen('order_confirmation', { orderId: order._id });
    } catch (e: any) {
      Alert.alert('Wallet Error', e?.message || 'Failed to process wallet payment.');
    }
  };

  // RENDER STEP 2A: CASH ON DELIVERY CONFIRMATION
  if (step === 'cod_confirm') {
    return (
      <ScrollView style={s.mainScroll} contentContainerStyle={{ padding: 16, paddingBottom: 60 + insets.bottom }}>
        <View style={{ gap: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable onPress={() => setStep('details')} style={({ pressed }) => [s.qtyBtn, pressed && s.btnPressed]}>
              <ArrowLeft size={18} color="#1E293B" strokeWidth={2.5} />
            </Pressable>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>
                Cash on Delivery
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B' }}>
                Step 2 of 2: Confirm Order & Payment
              </Text>
            </View>
          </View>

          {/* Amount Due Hero Card */}
          <View style={s.codHeroCard}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' }}>
              <Banknote size={24} color="#059669" />
            </View>
            <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Amount Due on Delivery
            </Text>
            <Text style={s.codHeroAmount}>
              {`LKR ${total.toLocaleString()}`}
            </Text>
            <Text style={{ fontSize: 12, color: '#065F46', textAlign: 'center', lineHeight: 18, maxWidth: 300 }}>
              Please prepare exact cash to hand over upon produce inspection and delivery.
            </Text>
          </View>

          {/* Delivery Summary Card */}
          <Card padding="md">
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 10 }}>
              Delivery Summary
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12.5, color: '#64748B' }}>Recipient:</Text>
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A' }}>{buyerName}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12.5, color: '#64748B' }}>Contact Phone:</Text>
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A' }}>{buyerPhone}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12.5, color: '#64748B' }}>Fulfillment:</Text>
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A' }}>
                  {deliveryMode === 'delivery' ? `${address}, ${district}` : 'Self-Pickup at Farm Gate'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12.5, color: '#64748B' }}>Produce Count:</Text>
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A' }}>
                  {`${cart.length} produce types (${cart.reduce((a, b) => a + b.quantityKg, 0)} kg total)`}
                </Text>
              </View>
            </View>
          </Card>

          {/* Confirmation Checkbox */}
          <Pressable
            onPress={() => setCodAgreed(!codAgreed)}
            style={({ pressed }) => [
              s.codCheckboxContainer,
              codAgreed && { borderColor: '#1F5C3A', backgroundColor: '#F0FDF4' },
              pressed && s.btnPressed,
            ]}
          >
            <View style={[s.checkbox, codAgreed && s.checkboxChecked]}>
              {codAgreed && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
            </View>
            <Text style={s.codCheckboxText}>
              {`I confirm that I will pay LKR ${total.toLocaleString()} in cash to the delivery driver upon receiving and inspecting the produce.`}
            </Text>
          </Pressable>

          {/* Confirm Order Button */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            leftIcon={<CheckCircle2 size={18} color="#FFFFFF" strokeWidth={2.5} />}
            onPress={handlePlaceCodOrder}
          >
            Confirm Order
          </Button>
        </View>
      </ScrollView>
    );
  }

  // RENDER STEP 2B: CARD PAYMENT FORM
  if (step === 'card_form') {
    return (
      <ScrollView style={s.mainScroll} contentContainerStyle={{ padding: 16, paddingBottom: 60 + insets.bottom }}>
        <View style={{ gap: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable onPress={() => setStep('details')} style={({ pressed }) => [s.qtyBtn, pressed && s.btnPressed]}>
              <ArrowLeft size={18} color="#1E293B" strokeWidth={2.5} />
            </Pressable>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>
                Card Payment
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B' }}>
                Step 2 of 2: Enter Visa / Mastercard Details
              </Text>
            </View>
          </View>

          {/* Card Mockup Visual */}
          <View style={s.cardMockup}>
            <View style={s.cardMockupChipRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CreditCard size={20} color="#FFFFFF" />
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>LankaPay Gateway</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 }}>VISA / MC</Text>
            </View>

            <Text style={s.cardMockupNumber}>
              {cardNumber || '•••• •••• •••• ••••'}
            </Text>

            <View style={s.cardMockupBottomRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={s.cardMockupLabel}>Cardholder Name</Text>
                <Text style={s.cardMockupValue} numberOfLines={1}>
                  {(cardHolder || buyerName || 'CARDHOLDER NAME').toUpperCase()}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.cardMockupLabel}>Expires</Text>
                <Text style={s.cardMockupValue}>
                  {cardExpiry || 'MM/YY'}
                </Text>
              </View>
            </View>
          </View>

          {/* Card Input Form */}
          <Card padding="md">
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 12 }}>
              Cardholder Details
            </Text>
            <View style={{ gap: 12 }}>
              <Input
                label="Cardholder Name"
                value={cardHolder}
                onChangeText={setCardHolder}
                placeholder="Name as printed on card"
                autoCapitalize="words"
              />

              <Input
                label="Card Number"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                placeholder="4111 2222 3333 4444"
                keyboardType="numeric"
                maxLength={19}
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Expiry Date"
                    value={cardExpiry}
                    onChangeText={handleExpiryChange}
                    placeholder="MM/YY"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="CVV / CVC"
                    value={cardCvv}
                    onChangeText={t => setCardCvv(t.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <ShieldCheck size={16} color="#16A34A" />
                <Text style={{ fontSize: 11.5, color: '#64748B' }}>
                  256-bit Bank-Grade SSL LankaPay Direct Checkout
                </Text>
              </View>
            </View>
          </Card>

          {/* Amount Due Summary */}
          <Card padding="sm">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>Total Charge</Text>
              <Text style={{ fontSize: 17, fontWeight: '900', color: '#1F5C3A' }}>
                {`LKR ${total.toLocaleString()}`}
              </Text>
            </View>
          </Card>

          {/* Pay Button */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            leftIcon={<Lock size={18} color="#FFFFFF" strokeWidth={2.5} />}
            onPress={handlePlaceCardOrder}
          >
            {`Pay LKR ${total.toLocaleString()}`}
          </Button>
        </View>
      </ScrollView>
    );
  }

  // RENDER STEP 2C: MOBILE WALLET FORM
  if (step === 'wallet_form') {
    return (
      <ScrollView style={s.mainScroll} contentContainerStyle={{ padding: 16, paddingBottom: 60 + insets.bottom }}>
        <View style={{ gap: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable onPress={() => setStep('details')} style={({ pressed }) => [s.qtyBtn, pressed && s.btnPressed]}>
              <ArrowLeft size={18} color="#1E293B" strokeWidth={2.5} />
            </Pressable>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>
                Mobile Wallet
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B' }}>
                Step 2 of 2: Select Wallet & Authorize
              </Text>
            </View>
          </View>

          {/* Wallet Provider Options */}
          <Card padding="md">
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 10 }}>
              Select Wallet Provider
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['Genie', 'eZ Cash', 'FriMi'] as const).map(w => (
                <Pressable
                  key={w}
                  onPress={() => setWalletProvider(w)}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      alignItems: 'center',
                      borderColor: walletProvider === w ? '#1F5C3A' : '#E2E8F0',
                      backgroundColor: walletProvider === w ? '#E6F2E8' : '#FFFFFF',
                    },
                    pressed && s.btnPressed,
                  ]}
                >
                  <Smartphone size={18} color={walletProvider === w ? '#1F5C3A' : '#64748B'} />
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: walletProvider === w ? '#1F5C3A' : '#334155', marginTop: 4 }}>
                    {w}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={{ marginTop: 14 }}>
              <Input
                label="Registered Mobile Phone"
                value={walletPhone}
                onChangeText={setWalletPhone}
                keyboardType="phone-pad"
                placeholder="+94 77 123 4567"
              />
            </View>
          </Card>

          {/* Amount Due Summary */}
          <Card padding="sm">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>Total Charge</Text>
              <Text style={{ fontSize: 17, fontWeight: '900', color: '#1F5C3A' }}>
                {`LKR ${total.toLocaleString()}`}
              </Text>
            </View>
          </Card>

          {/* Pay Button */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            leftIcon={<Smartphone size={18} color="#FFFFFF" strokeWidth={2.5} />}
            onPress={handlePlaceWalletOrder}
          >
            {`Pay via ${walletProvider}`}
          </Button>
        </View>
      </ScrollView>
    );
  }

  // RENDER STEP 1: FULFILLMENT & PAYMENT METHOD SELECTION
  return (
    <ScrollView style={s.mainScroll} contentContainerStyle={{ padding: 16, paddingBottom: 60 + insets.bottom }}>
      <View style={{ gap: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable onPress={goBack} style={({ pressed }) => [s.qtyBtn, pressed && s.btnPressed]}>
            <ArrowLeft size={18} color="#1E293B" strokeWidth={2.5} />
          </Pressable>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>
              Checkout
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B' }}>
              Step 1 of 2: Fulfillment & Payment Choice
            </Text>
          </View>
        </View>

        {/* Fulfillment Mode Toggle */}
        <Card padding="sm">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => setDeliveryMode('delivery')}
              style={({ pressed }) => [
                s.segmentTab,
                deliveryMode === 'delivery' && s.segmentTabActive,
                pressed && s.btnPressed,
              ]}
            >
              <Truck size={17} color={deliveryMode === 'delivery' ? '#ffffff' : '#475569'} />
              <Text style={[s.segmentTabText, deliveryMode === 'delivery' && s.segmentTabTextActive]}>
                Doorstep Delivery
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setDeliveryMode('pickup')}
              style={({ pressed }) => [
                s.segmentTab,
                deliveryMode === 'pickup' && s.segmentTabActive,
                pressed && s.btnPressed,
              ]}
            >
              <MapPin size={17} color={deliveryMode === 'pickup' ? '#ffffff' : '#475569'} />
              <Text style={[s.segmentTabText, deliveryMode === 'pickup' && s.segmentTabTextActive]}>
                Farm Gate Pickup
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* If Farm Gate Pickup is selected, show farmer's location, address, and contact number (Requirement 6) */}
        {deliveryMode === 'pickup' && (
          <Card padding="md" variant="mint" style={{ borderColor: '#86EFAC', borderWidth: 1.5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MapPin size={18} color="#1F5C3A" />
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#1F5C3A' }}>
                  Farmer Pickup Point & Direct Contact
                </Text>
              </View>
              <View style={{ backgroundColor: '#E6F2E8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#1F5C3A' }}>FREE PICKUP</Text>
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: '#4B6B56', fontWeight: '700' }}>Farmer Name:</Text>
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#0F172A' }}>
                  {cart[0]?.listing.farmerName || 'Sunil Bandara'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: '#4B6B56', fontWeight: '700' }}>Farm Address:</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A', flex: 1, textAlign: 'right', marginLeft: 10 }}>
                  {cart[0] ? `${cart[0].listing.farmerName}'s Farm, ${cart[0].listing.location.town}, ${cart[0].listing.location.district}` : 'Highland Organics, Kandapola, Nuwara Eliya'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#4B6B56', fontWeight: '700' }}>Farmer Phone:</Text>
                <Pressable
                  onPress={() => Linking.openURL(`tel:${cart[0]?.listing.farmerPhone || '+94771234567'}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <Phone size={12} color="#1F5C3A" />
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#1F5C3A' }}>
                    {cart[0]?.listing.farmerPhone || '+94 77 123 4567'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={{ marginTop: 8, padding: 8, backgroundColor: '#E6F2E8', borderRadius: 8 }}>
              <Text style={{ fontSize: 11, color: '#1F5C3A', fontWeight: '600', lineHeight: 16 }}>
                Direct Farm Gate Collection: You will be issued a 4-digit Order PIN to collect fresh produce directly from the producer once harvested and packed.
              </Text>
            </View>
          </Card>
        )}

        {/* Delivery Details Card */}
        <Card padding="md">
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 12 }}>
            Recipient Information
          </Text>
          <View style={{ gap: 12 }}>
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
              <View style={{ gap: 12 }}>
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
              </View>
            )}
            <Input
              label="Delivery Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Gate code, crate placement..."
            />
          </View>
        </Card>

        {/* Payment Methods (Only selection - does not place order) */}
        <Card padding="md">
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 12 }}>
            Choose Payment Method
          </Text>
          <View style={{ gap: 10 }}>
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
                  style={({ pressed }) => [
                    s.paymentOption,
                    isSelected && { backgroundColor: '#E6F2E8', borderColor: '#1F5C3A' },
                    pressed && s.btnPressed,
                  ]}
                >
                  <Icon size={19} color={isSelected ? '#1F5C3A' : '#64748B'} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isSelected ? '#1F5C3A' : '#1E293B', flex: 1 }}>
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
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 10 }}>
            Order Summary ({cart.length} produce types)
          </Text>
          <View style={{ gap: 8 }}>
            {cart.map(item => (
              <View key={item.listing._id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#334155' }}>
                  {`${item.listing.cropName} (${item.quantityKg}kg)`}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  {`LKR ${(item.listing.pricePerKg * item.quantityKg).toLocaleString()}`}
                </Text>
              </View>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
              <Text style={{ fontSize: 13, color: '#64748B' }}>Delivery Logistics:</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                {deliveryMode === 'pickup' ? 'FREE (Self-Pickup)' : `LKR ${deliveryFee.toLocaleString()}`}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#0F172A' }}>Grand Total</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#1F5C3A' }}>
                {`LKR ${total.toLocaleString()}`}
              </Text>
            </View>
          </View>
        </Card>

        {/* Continue Button */}
        <Button
          variant="primary"
          fullWidth
          size="lg"
          rightIcon={<ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />}
          onPress={handleContinueToPayment}
        >
          {`Continue (LKR ${total.toLocaleString()})`}
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
        <CheckCircle2 size={46} color="#1F5C3A" strokeWidth={2.5} />
      </View>

      <Text style={{ fontSize: 22, fontWeight: '900', color: '#0F172A', marginTop: 16, textAlign: 'center' }}>
        Order Placed Successfully!
      </Text>

      <Text style={{ fontSize: 13.5, color: '#4B6B56', textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
        Direct notification sent to the farmer to begin fresh dawn harvesting.
      </Text>

      {order && (
        <Card padding="md" style={{ width: '100%', marginTop: 22 }}>
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12.5, color: '#64748B' }}>Order Tracking No:</Text>
              <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#1F5C3A' }}>{order.orderNumber}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12.5, color: '#64748B' }}>Produce:</Text>
              <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A' }}>
                {order.items.map(i => `${i.cropName} (${i.quantityKg}kg)`).join(', ')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12.5, color: '#64748B' }}>Total Paid/Payable:</Text>
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#1F5C3A' }}>{`LKR ${order.total.toLocaleString()}`}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12.5, color: '#64748B' }}>Fulfillment:</Text>
              <Text style={{ fontSize: 12.5, fontWeight: '800', color: order.deliveryType === 'pickup' ? '#1D4ED8' : '#065F46' }}>
                {order.deliveryType === 'pickup' ? 'Farm Gate Self-Pickup' : 'Doorstep Delivery'}
              </Text>
            </View>

            {order.deliveryType === 'pickup' ? (
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12.5, color: '#64748B' }}>Farmer & Location:</Text>
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A', flex: 1, textAlign: 'right', marginLeft: 8 }}>
                    {order.farmerName} · {order.farmerAddress}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12.5, color: '#64748B' }}>Farmer Contact:</Text>
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#1F5C3A' }}>
                    {order.farmerPhone}
                  </Text>
                </View>
                <View style={{ backgroundColor: '#EFF6FF', padding: 10, borderRadius: 10, marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#BFDBFE' }}>
                  <View>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#1D4ED8', textTransform: 'uppercase' }}>PICKUP PIN</Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E40AF' }}>{order.pickupPin}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#3B82F6', flex: 1, marginLeft: 12 }}>
                    Show this 4-digit PIN to farmer {order.farmerName} when collecting.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12.5, color: '#64748B' }}>Delivery To:</Text>
                <Text style={{ fontSize: 12.5, color: '#0F172A', flex: 1, textAlign: 'right', marginLeft: 8 }} numberOfLines={1}>
                  {order.deliveryAddress}
                </Text>
              </View>
            )}
          </View>
        </Card>
      )}

      <View style={{ width: '100%', gap: 12, marginTop: 24 }}>
        <Button
          variant="primary"
          fullWidth
          size="lg"
          leftIcon={<Truck size={18} color="#ffffff" strokeWidth={2.5} />}
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
  const { orders, navState, buyerConfirmPickup, goToSubScreen, goBack } = useApp();

  const myOrders = orders;
  const activeOrder = navState.selectedOrderId
    ? orders.find(o => o._id === navState.selectedOrderId)
    : myOrders[0];

  const isPickup = activeOrder?.deliveryType === 'pickup';

  const DELIVERY_STEPS: OrderStatus[] = [
    'pending',
    'accepted',
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
  ];

  const PICKUP_STEPS: OrderStatus[] = [
    'pending',
    'accepted',
    'preparing',
    'ready_for_pickup',
    'delivered',
  ];

  const statusSteps = isPickup ? PICKUP_STEPS : DELIVERY_STEPS;
  const currentIdx = activeOrder ? statusSteps.indexOf(activeOrder.status) : 0;

  const deliveryLabels = [
    { label: 'Order Placed & Verified', desc: 'Farmer notified at farm gate' },
    { label: 'Farmer Accepted', desc: 'Harvest scheduled by farmer' },
    { label: 'Harvesting & Packing', desc: 'Graded & packed into crates' },
    { label: 'Ready at Farm Gate', desc: 'Awaiting logistics driver dispatch' },
    { label: 'Out for Final Delivery', desc: 'Driver en route to your doorstep' },
    { label: 'Delivered to Doorstep', desc: 'Handover complete & verified' },
  ];

  const pickupLabels = [
    { label: 'Order Placed & Confirmed', desc: 'Direct farm order received' },
    { label: 'Farmer Accepted', desc: 'Harvest batch scheduled' },
    { label: 'Harvesting & Packing', desc: 'Produce crated at farm gate' },
    { label: 'Ready for Farm Gate Pickup', desc: 'Ready! You can now visit to collect' },
    { label: 'Collected from Farm Gate', desc: 'PIN verified & handover complete' },
  ];

  const stepsToRender = isPickup ? pickupLabels : deliveryLabels;

  return (
    <ScrollView style={s.mainScroll} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable onPress={goBack} style={({ pressed }) => [s.qtyBtn, pressed && s.btnPressed]}>
            <ArrowLeft size={18} color="#1E293B" strokeWidth={2.5} />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>
            My Orders & Live Tracking
          </Text>
        </View>

        {/* Active Selected Order Tracker */}
        {activeOrder && (
          <Card padding="md" variant="mint" style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <View className="flex-row items-center gap-2">
                  <Text style={{ fontSize: 11, color: '#4B6B56', fontWeight: '800', letterSpacing: 0.5 }}>
                    ACTIVE SHIPMENT
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 1.5,
                      borderRadius: 6,
                      backgroundColor: isPickup ? '#DBEAFE' : '#D1FAE5',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9.5,
                        fontWeight: '800',
                        color: isPickup ? '#1D4ED8' : '#065F46',
                      }}
                    >
                      {isPickup ? 'FARM GATE SELF-PICKUP' : 'DOORSTEP DELIVERY'}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 17, fontWeight: '900', color: '#0F172A', marginTop: 2 }}>
                  {activeOrder.orderNumber}
                </Text>
              </View>
              <StatusPill status={activeOrder.status} />
            </View>

            {/* If Self-Pickup: Show Farmer Details, Location, Phone & Pickup PIN (Requirement 6) */}
            {isPickup && (
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  padding: 12,
                  borderWidth: 1.5,
                  borderColor: '#93C5FD',
                  gap: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MapPin size={18} color="#1D4ED8" />
                    <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#1E3A8A' }}>
                      Farm Gate Pickup Point
                    </Text>
                  </View>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Phone size={12} color="#1D4ED8" />}
                    onPress={() => Linking.openURL(`tel:${activeOrder.farmerPhone || '+94771234567'}`)}
                  >
                    Call Farmer
                  </Button>
                </View>

                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>
                    {activeOrder.farmerName}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#475569' }}>
                    {activeOrder.farmerAddress}
                  </Text>
                  <Text style={{ fontSize: 11.5, color: '#64748B', fontStyle: 'italic' }}>
                    {activeOrder.pickupLocation?.directions || 'Located near Agrarian Services Centre. Call farmer on approach.'}
                  </Text>
                </View>

                {/* 4-digit PIN Card */}
                <View
                  style={{
                    backgroundColor: '#EFF6FF',
                    padding: 10,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderWidth: 1,
                    borderColor: '#BFDBFE',
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#1D4ED8', textTransform: 'uppercase' }}>
                      COLLECTION VERIFICATION PIN
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: '#1E40AF', letterSpacing: 2 }}>
                      {activeOrder.pickupPin}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#3B82F6', flex: 1, marginLeft: 12 }}>
                    Show this PIN to farmer {activeOrder.farmerName} upon collection.
                  </Text>
                </View>

                {/* Direct Action when Ready */}
                {activeOrder.status === 'ready_for_pickup' && (
                  <View style={{ gap: 8, marginTop: 4 }}>
                    <View style={{ backgroundColor: '#FEF3C7', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A' }}>
                      <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#B45309', textAlign: 'center' }}>
                        Your produce is packed and waiting at the farm gate!
                      </Text>
                    </View>
                    <Button
                      variant="primary"
                      fullWidth
                      size="md"
                      leftIcon={<Check size={16} color="#ffffff" strokeWidth={2.5} />}
                      onPress={() => buyerConfirmPickup(activeOrder._id)}
                    >
                      I Have Collected My Produce
                    </Button>
                  </View>
                )}
              </View>
            )}

            {/* If Doorstep Delivery: Uber Eats Style Driver Card (Requirement 4) */}
            {!isPickup && Boolean(activeOrder.driverName) && (
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  padding: 12,
                  borderWidth: 1.5,
                  borderColor: '#86EFAC',
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Avatar name={activeOrder.driverName || 'Driver'} size="md" role="driver" />
                    <View>
                      <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#0F172A' }}>
                        {activeOrder.driverName}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#15803D', fontWeight: '700' }}>
                        4.95 ★ Certified Fleet Partner
                      </Text>
                    </View>
                  </View>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Phone size={12} color="#1F5C3A" />}
                    onPress={() => Linking.openURL(`tel:${activeOrder.driverPhone || '+94782345678'}`)}
                  >
                    Call Driver
                  </Button>
                </View>

                <View style={{ backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11.5, color: '#475569', fontWeight: '600' }}>
                    Vehicle: {activeOrder.driverVehicle || 'Light Truck'}
                  </Text>
                  <Text style={{ fontSize: 11.5, color: '#1F5C3A', fontWeight: '700', marginTop: 2 }}>
                    {activeOrder.status === 'ready_for_pickup'
                      ? 'Driver assigned · En route to farm gate for crate pickup'
                      : activeOrder.status === 'out_for_delivery'
                      ? 'In transit · Produce picked up from farm and heading to your doorstep!'
                      : 'Delivered successfully · Handover verified'}
                  </Text>
                </View>
              </View>
            )}

            {/* Stepper Progression */}
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 12 }}>
                Fulfillment & Dispatch Stepper
              </Text>
              <View style={{ gap: 0 }}>
                {stepsToRender.map((step, idx, arr) => {
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  const isLast = idx === arr.length - 1;

                  return (
                    <View key={step.label} style={{ flexDirection: 'row', minHeight: 48 }}>
                      {/* Node & Connecting Line Column */}
                      <View style={{ alignItems: 'center', width: 26, marginRight: 10 }}>
                        <View
                          style={[
                            s.trackerNode,
                            isDone && { backgroundColor: '#1F5C3A' },
                            isCurrent && { borderWidth: 3, borderColor: '#86EFAC' },
                          ]}
                        >
                          {isDone && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                        </View>
                        {!isLast && (
                          <View
                            style={[
                              s.trackerConnectingLine,
                              isDone && idx < currentIdx && { backgroundColor: '#1F5C3A' },
                            ]}
                          />
                        )}
                      </View>

                      {/* Content Column */}
                      <View style={{ flex: 1, paddingBottom: isLast ? 0 : 14 }}>
                        <Text style={{ fontSize: 12.5, fontWeight: isDone ? '800' : '500', color: isDone ? '#0F172A' : '#94A3B8' }}>
                          {step.label}
                        </Text>
                        <Text style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{step.desc}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Order Items with Photos */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, gap: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
                Items in this Order
              </Text>
              {activeOrder.items.map((item, idx) => {
                const hasPhoto =
                  item.photoUrl &&
                  (item.photoUrl.startsWith('data:image') || item.photoUrl.startsWith('http'));

                return (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        overflow: 'hidden',
                        backgroundColor: '#F1F5F9',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {hasPhoto ? (
                        <Image source={{ uri: item.photoUrl }} style={{ width: 40, height: 40 }} resizeMode="cover" />
                      ) : (
                        <ProduceVisual type={item.cropName} size="sm" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A' }} numberOfLines={1}>
                        {item.cropName}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#64748B' }}>
                        {item.quantityKg} kg · LKR {item.pricePerKg}/kg
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#1F5C3A' }}>
                      {`LKR ${(item.pricePerKg * item.quantityKg).toLocaleString()}`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        {/* All Past Orders List */}
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>
          All Orders ({myOrders.length})
        </Text>

        <View style={{ gap: 10 }}>
          {myOrders.map(order => (
            <Card
              key={order._id}
              padding="md"
              variant="interactive"
              onPress={() => goToSubScreen('order_tracking', { orderId: order._id })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View className="flex-row items-center gap-2">
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#0F172A' }}>
                    {order.orderNumber}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 4,
                      backgroundColor: order.deliveryType === 'pickup' ? '#EFF6FF' : '#ECFDF5',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9.5,
                        fontWeight: '700',
                        color: order.deliveryType === 'pickup' ? '#1D4ED8' : '#047857',
                      }}
                    >
                      {order.deliveryType === 'pickup' ? 'Farm Pickup' : 'Delivery'}
                    </Text>
                  </View>
                </View>
                <StatusPill status={order.status} />
              </View>

              <Text style={{ fontSize: 12.5, color: '#4B6B56', marginTop: 4 }}>
                {order.items.map(i => `${i.cropName} (${i.quantityKg}kg)`).join(' · ')}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                <Text style={{ fontSize: 11.5, color: '#64748B' }}>
                  {order.deliveryAddress}
                </Text>
                <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#1F5C3A' }}>
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
    <View style={{ flex: 1, backgroundColor: '#F8FAF8' }}>
      {/* Chat Header */}
      <View style={s.chatHeader}>
        <Pressable onPress={goBack} style={({ pressed }) => [s.qtyBtn, pressed && s.btnPressed]}>
          <ArrowLeft size={18} color="#1E293B" strokeWidth={2.5} />
        </Pressable>
        <Avatar name={conv?.participants?.find(p => p.role === 'farmer')?.name || 'Farmer'} size="sm" role="farmer" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontSize: 14.5, fontWeight: '800', color: '#0F172A' }} numberOfLines={1}>
            {conv?.participants?.find(p => p.role === 'farmer')?.name || 'Farmer Partner'}
          </Text>
          <Text style={{ fontSize: 11, color: '#1F5C3A', fontWeight: '600' }}>
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
      <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {quickReplies.map(q => (
            <Pressable
              key={q}
              onPress={() => setInputText(q)}
              style={({ pressed }) => [s.quickReplyChip, pressed && s.btnPressed]}
            >
              <Text style={{ fontSize: 11.5, color: '#1F5C3A', fontWeight: '700' }}>{q}</Text>
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
          placeholderTextColor="#94A3B8"
          style={s.chatInput}
        />
        <Pressable
          onPress={handleSend}
          style={({ pressed }) => [s.chatSendBtn, pressed && s.btnPressed]}
        >
          <Send size={16} color="#FFFFFF" strokeWidth={2.5} />
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
          <Pressable onPress={goBack} style={({ pressed }) => [s.qtyBtn, pressed && s.btnPressed]}>
            <ArrowLeft size={18} color="#1E293B" strokeWidth={2.5} />
          </Pressable>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>
              Wholesale Market Rates
            </Text>
            <Text style={{ fontSize: 11, color: '#64748B' }}>
              Official Agrarian Development Economic Centre Benchmark
            </Text>
          </View>
        </View>

        {/* Market Filter Chips */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['All', 'Dambulla', 'Pettah', 'Nuwara Eliya'].map(m => (
            <Pressable
              key={m}
              onPress={() => setMarketFilter(m)}
              style={({ pressed }) => [
                s.optionChip,
                marketFilter === m
                  ? { backgroundColor: '#1F5C3A', borderColor: '#1F5C3A' }
                  : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                pressed && s.btnPressed,
              ]}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: marketFilter === m ? '#ffffff' : '#334155' }}>
                {m}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Pricing Cards */}
        <View style={{ gap: 10 }}>
          {filteredPrices.map(item => (
            <Card key={item.id} padding="md">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>
                    {item.crop}
                  </Text>
                  <Text style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                    {item.marketName}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#1F5C3A' }}>
                    {`LKR ${item.retailAvgLkr}/kg`}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                    {item.trend === 'up' ? (
                      <TrendingUp size={13} color="#DC2626" />
                    ) : (
                      <TrendingDown size={13} color="#16A34A" />
                    )}
                    <Text style={{ fontSize: 10.5, fontWeight: '700', color: item.trend === 'up' ? '#DC2626' : '#16A34A' }}>
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
  const { currentUser, orders, conversations, logout, openAuth, goToSubScreen } = useApp();

  const buyerOrders = orders.filter(
    o =>
      o.buyerId === (currentUser?._id || 'user_buyer_1') ||
      o.buyerName === (currentUser?.name || 'Dinesh Jayawardena')
  );
  const totalVolumeKg = buyerOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantityKg, 0),
    0
  );

  const buyerName = currentUser?.name || 'Dinesh Jayawardena';
  const buyerPhone = currentUser?.phone || '+94 77 123 4567';
  const buyerTown = currentUser?.location?.town || 'Colombo 05';
  const buyerDistrict = currentUser?.location?.district || 'Western Province';
  const buyerAddress = currentUser?.location?.address || 'No. 42/3, Havelock Road, Colombo 05';

  return (
    <ScrollView style={s.mainScroll} contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
      <View style={{ gap: 16 }}>
        {/* 1. HERO PROFILE CARD */}
        <View style={s.profileHeroCard}>
          <View style={s.profileHeroTopRow}>
            <View style={s.profileAvatarWrapper}>
              <Avatar name={buyerName} size="lg" role="buyer" />
              <View style={s.profileVerifiedBadge}>
                <ShieldCheck size={12} color="#FFFFFF" strokeWidth={2.8} />
              </View>
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.profileHeroName} numberOfLines={1}>
                {buyerName}
              </Text>
              <Text style={s.profileHeroPhone}>{buyerPhone}</Text>
              <View style={s.profileLocationRow}>
                <MapPin size={11} color="rgba(255, 255, 255, 0.85)" />
                <Text style={s.profileLocationText}>
                  {buyerTown}, {buyerDistrict}
                </Text>
              </View>
            </View>
          </View>

          {/* Member Badge & Bio Row */}
          <View style={s.profileHeroTagRow}>
            <View style={s.profileHeroTagPill}>
              <Sparkles size={11} color="#FDE047" />
              <Text style={s.profileHeroTagText}>
                {currentUser ? 'Verified Wholesale Buyer' : 'Guest Buyer Account'}
              </Text>
            </View>
            <Text style={s.profileHeroIdText}>
              ID: {currentUser?._id?.slice(-8).toUpperCase() || 'BYR-7729'}
            </Text>
          </View>
        </View>

        {/* 2. PROCUREMENT IMPACT & ACTIVITY STATS */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={s.profileStatCard}>
            <Text style={s.profileStatValue}>{buyerOrders.length}</Text>
            <Text style={s.profileStatLabel}>Farm Orders</Text>
            <Text style={s.profileStatSub}>100% Fulfilled</Text>
          </View>

          <View style={s.profileStatCard}>
            <Text style={s.profileStatValue}>
              {totalVolumeKg > 0 ? `${totalVolumeKg} kg` : '640 kg'}
            </Text>
            <Text style={s.profileStatLabel}>Produce Sourced</Text>
            <Text style={s.profileStatSub}>Direct Harvest</Text>
          </View>

          <View style={s.profileStatCard}>
            <Text style={s.profileStatValue}>0% Cut</Text>
            <Text style={s.profileStatLabel}>Zero Broker Fees</Text>
            <Text style={s.profileStatSub}>Fair Price</Text>
          </View>
        </View>

        {/* 3. DEFAULT DELIVERY DESTINATION CARD */}
        <Card padding="md" style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <View style={s.profileIconCircle}>
                <MapPin size={15} color="#1F5C3A" />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>
                Primary Delivery Destination
              </Text>
            </View>
            <View style={s.profileDefaultBadge}>
              <Text style={s.profileDefaultBadgeText}>Default</Text>
            </View>
          </View>

          <View style={s.profileAddressBox}>
            <Text style={s.profileAddressTitle}>
              {buyerName} · {buyerPhone}
            </Text>
            <Text style={s.profileAddressDetail}>{buyerAddress}</Text>
            <View style={s.profileCrateNote}>
              <Truck size={12} color="#1F5C3A" />
              <Text style={s.profileCrateNoteText}>
                Handover via ventilated agrarian crates · Morning drop-off window
              </Text>
            </View>
          </View>
        </Card>

        {/* 4. PROCUREMENT & TRACKING HUB */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#0F172A', paddingHorizontal: 2 }}>
            Procurement & Tracking Hub
          </Text>

          <Card padding="none">
            {/* My Orders */}
            <Pressable
              onPress={() => goToSubScreen('my_orders')}
              style={({ pressed }) => [s.profileMenuRow, pressed && s.btnPressed]}
            >
              <View style={s.profileMenuLeft}>
                <View style={[s.profileMenuIconBox, { backgroundColor: '#E6F2E8' }]}>
                  <ShoppingBag size={18} color="#1F5C3A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.profileMenuTitle}>My Orders & Live Dispatch</Text>
                  <Text style={s.profileMenuSubtitle}>
                    {buyerOrders.length} orders placed · Track step-by-step from harvest
                  </Text>
                </View>
              </View>
              <ChevronRight size={17} color="#94A3B8" />
            </Pressable>

            <View style={s.profileDivider} />

            {/* Direct Farmer Messages */}
            <Pressable
              onPress={() => goToSubScreen('chat_list')}
              style={({ pressed }) => [s.profileMenuRow, pressed && s.btnPressed]}
            >
              <View style={s.profileMenuLeft}>
                <View style={[s.profileMenuIconBox, { backgroundColor: '#FEF8EA' }]}>
                  <MessageSquare size={18} color="#B45309" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.profileMenuTitle}>Direct Producer Messages</Text>
                  <Text style={s.profileMenuSubtitle}>
                    {conversations.length} active chats with smallholder farmers
                  </Text>
                </View>
              </View>
              <ChevronRight size={17} color="#94A3B8" />
            </Pressable>

            <View style={s.profileDivider} />

            {/* Market Prices */}
            <Pressable
              onPress={() => goToSubScreen('market_prices')}
              style={({ pressed }) => [s.profileMenuRow, pressed && s.btnPressed]}
            >
              <View style={s.profileMenuLeft}>
                <View style={[s.profileMenuIconBox, { backgroundColor: '#EEF8FA' }]}>
                  <TrendingUp size={18} color="#19768A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.profileMenuTitle}>Official Mandi Daily Rates</Text>
                  <Text style={s.profileMenuSubtitle}>
                    Colombo, Dambulla & Keppetipola economic center prices
                  </Text>
                </View>
              </View>
              <ChevronRight size={17} color="#94A3B8" />
            </Pressable>

            <View style={s.profileDivider} />

            {/* Nearby Producers Map */}
            <Pressable
              onPress={() => goToSubScreen('nearby_map')}
              style={({ pressed }) => [s.profileMenuRow, pressed && s.btnPressed]}
            >
              <View style={s.profileMenuLeft}>
                <View style={[s.profileMenuIconBox, { backgroundColor: '#F3E8FF' }]}>
                  <MapPin size={18} color="#7C3AED" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.profileMenuTitle}>Nearby Producer Holdings</Text>
                  <Text style={s.profileMenuSubtitle}>
                    Locate registered farmers across 25 Sri Lankan districts
                  </Text>
                </View>
              </View>
              <ChevronRight size={17} color="#94A3B8" />
            </Pressable>
          </Card>
        </View>

        {/* 5. FAIR TRADE & QUALITY ASSURANCE */}
        <Card variant="mint" padding="md" style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <ShieldCheck size={18} color="#1F5C3A" />
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#1F5C3A' }}>
              Direct Harvest Buyer Guarantee
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: '#334155', lineHeight: 18 }}>
            Every kilogram ordered through Goviya is harvested at dawn following order receipt, graded for wholesale quality standards, and delivered directly with zero intermediary markups.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
            <View style={s.profileGuaranteeBadge}>
              <Check size={11} color="#1F5C3A" strokeWidth={3} />
              <Text style={s.profileGuaranteeBadgeText}>SL-GAP Verified</Text>
            </View>
            <View style={s.profileGuaranteeBadge}>
              <Check size={11} color="#1F5C3A" strokeWidth={3} />
              <Text style={s.profileGuaranteeBadgeText}>Crate-Packed Fresh</Text>
            </View>
            <View style={s.profileGuaranteeBadge}>
              <Check size={11} color="#1F5C3A" strokeWidth={3} />
              <Text style={s.profileGuaranteeBadgeText}>100% Traceable</Text>
            </View>
          </View>
        </Card>

        {/* 6. SUPPORT & HELPLINE */}
        <Card padding="md" style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[s.profileIconCircle, { backgroundColor: '#FEF8EA' }]}>
              <Phone size={14} color="#B45309" />
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>
                Agrarian Logistics Support
              </Text>
              <Text style={{ fontSize: 11, color: '#64748B' }}>
                Helpline active 6:00 AM - 10:00 PM daily
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
              leftIcon={<Phone size={13} color="#1F5C3A" />}
              onPress={() => Linking.openURL('tel:1920')}
            >
              Govt Agri 1920
            </Button>
            <Button
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
              leftIcon={<Phone size={13} color="#1F5C3A" />}
              onPress={() => Linking.openURL('tel:+94112345678')}
            >
              Goviya Help Desk
            </Button>
          </View>
        </Card>

        {/* 7. ACCOUNT SESSION ACTION */}
        <View style={{ gap: 8, paddingTop: 4 }}>
          {currentUser ? (
            <Button
              variant="destructive"
              fullWidth
              size="lg"
              leftIcon={<LogOut size={16} color="#FFFFFF" />}
              onPress={logout}
            >
              Sign Out of Account
            </Button>
          ) : (
            <Button
              variant="primary"
              fullWidth
              size="lg"
              leftIcon={<LogIn size={16} color="#FFFFFF" />}
              onPress={() => openAuth('buyer')}
            >
              Sign In / Register Buyer Account
            </Button>
          )}

          <Text style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 4 }}>
            Goviya Platform v2.4 · Sri Lanka Direct Agriculture Network
          </Text>
        </View>
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
    backgroundColor: '#F8FAF8',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.975 }],
  },
  filterBtn: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  produceChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  promoBanner: {
    borderRadius: 16,
    backgroundColor: '#164E33',
    padding: 16,
    shadowColor: '#164E33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  promoTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  promoSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 17,
  },
  promoBtn: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  promoBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#164E33',
  },
  benchmarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F2E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#CDE5D2',
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 2,
  },
  benchmarkBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1F5C3A',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priceChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  optionChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1F5C3A',
    borderColor: '#1F5C3A',
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  // Upgraded Profile Dashboard Styles
  profileHeroCard: {
    backgroundColor: '#1F5C3A',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#1F5C3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    gap: 14,
  },
  profileHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatarWrapper: {
    position: 'relative',
  },
  profileVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#15803D',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileHeroName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileHeroPhone: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    fontWeight: '500',
  },
  profileLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  profileLocationText: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  profileHeroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileHeroTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 14,
  },
  profileHeroTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileHeroIdText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  profileStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F5C3A',
  },
  profileStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
    textAlign: 'center',
  },
  profileStatSub: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  profileIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6F2E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDefaultBadge: {
    backgroundColor: '#E6F2E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CDE5D2',
  },
  profileDefaultBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1F5C3A',
  },
  profileAddressBox: {
    backgroundColor: '#F8FAF8',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAF0EA',
    gap: 4,
  },
  profileAddressTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileAddressDetail: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  profileCrateNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  profileCrateNoteText: {
    fontSize: 10.5,
    color: '#1F5C3A',
    fontWeight: '600',
    flex: 1,
  },
  profileMenuRow: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileMenuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  profileMenuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMenuTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileMenuSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  profileGuaranteeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CDE5D2',
  },
  profileGuaranteeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1F5C3A',
  },
  // Detail screen styles
  detailHeroMedia: {
    width: '100%',
    height: 250,
    backgroundColor: '#EAF2EC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  detailBackBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  detailOrganicPill: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#164E33',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  detailOrganicText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qtyControlBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewProfileBtn: {
    backgroundColor: '#E6F2E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#CDE5D2',
  },
  viewProfileText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1F5C3A',
  },
  farmerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  detailFloatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  detailPriceSummary: {
    flexShrink: 1,
  },
  detailPriceLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  detailPriceValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1F5C3A',
  },
  detailPriceSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  detailCtaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  // Checkout styles
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentTabActive: {
    backgroundColor: '#1F5C3A',
    borderColor: '#1F5C3A',
  },
  segmentTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  segmentTabTextActive: {
    color: '#FFFFFF',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
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
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E6F2E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#CDE5D2',
  },
  trackerNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackerConnectingLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  // Chat styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  chatBubbleBuyer: {
    alignSelf: 'flex-end',
    backgroundColor: '#1F5C3A',
    borderBottomRightRadius: 4,
    shadowColor: '#1F5C3A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  chatBubbleFarmer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chatBubbleText: {
    fontSize: 13.5,
    color: '#0F172A',
    lineHeight: 19,
  },
  chatBubbleTime: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  quickReplyChip: {
    backgroundColor: '#E6F2E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CDE5D2',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 13.5,
    color: '#0F172A',
  },
  chatSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1F5C3A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F5C3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  // Nearby Agrarian Hubs Styles
  nearbySearchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  nearbySearchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
    marginLeft: 8,
  },
  nearbyClearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyPresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nearbyPresetChipActive: {
    backgroundColor: '#E6F2E8',
    borderColor: '#1F5C3A',
  },
  nearbyPresetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  nearbyPresetTextActive: {
    color: '#1F5C3A',
  },
  nearbyFilterRow: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F6',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  nearbyFilterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  nearbyFilterTabActive: {
    backgroundColor: '#1F5C3A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  nearbyFilterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  nearbyFilterTabTextActive: {
    color: '#FFFFFF',
  },
  nearbyCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  nearbyCountBadgeInactive: {
    backgroundColor: '#E2E8F0',
  },
  nearbyCountBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nearbyCountBadgeTextInactive: {
    color: '#475569',
  },
  nearbyFarmerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: 12,
  },
  nearbyFarmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6F2E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CDE5D2',
    position: 'relative',
  },
  nearbyFarmerAvatarText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1F5C3A',
  },
  nearbyFarmerVerifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nearbyFarmerName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  nearbyVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E6F2E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nearbyVerifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  nearbyFarmName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F5C3A',
    marginTop: 2,
  },
  nearbyRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  nearbyRatingText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#92400E',
  },
  nearbyRatingCount: {
    fontSize: 10,
    color: '#B45309',
    fontWeight: '600',
  },
  nearbyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAF8',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nearbyLocationText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  nearbyFarmSizeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nearbyFarmSizeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  nearbySectionSublabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  nearbyProducePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAF8',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nearbyProducePillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  nearbyProducePillPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F5C3A',
  },
  nearbyActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  nearbyCallBtn: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  nearbyCallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  nearbyChatBtn: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#E6F2E8',
    borderWidth: 1,
    borderColor: '#CDE5D2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  nearbyChatBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F5C3A',
  },
  nearbyProfileBtn: {
    height: 38,
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#1F5C3A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    shadowColor: '#1F5C3A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  nearbyProfileBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nearbyEmptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginVertical: 10,
  },
  nearbyEmptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  nearbyEmptyDesc: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  nearbyResetBtn: {
    backgroundColor: '#1F5C3A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  nearbyResetBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Cart & Multi-Step Checkout Styles
  cartItemImageContainer: {
    width: 68,
    height: 68,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cartItemImage: {
    width: '100%',
    height: '100%',
  },
  cartRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  codHeroCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    gap: 6,
  },
  codHeroAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#065F46',
  },
  codCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  codCheckboxText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  cardMockup: {
    backgroundColor: '#064E3B',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    gap: 16,
  },
  cardMockupChipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMockupNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  cardMockupBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardMockupLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardMockupValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
});
