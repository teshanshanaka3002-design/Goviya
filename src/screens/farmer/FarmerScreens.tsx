import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, TextInput } from 'react-native';
import {
  Package,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Check,
  Phone,
  MessageSquare,
  BarChart2,
  Trash2,
  X,
  Star,
} from 'lucide-react-native';
import { useApp } from '../../services/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProduceVisual } from '../../components/ui/ProduceVisual';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Order, OrderStatus, Listing } from '../../types';
import { FarmerOrdersScreen } from './FarmerOrdersScreen';

export const HARVEST_PHOTO_PRESETS = [
  {
    title: 'Fresh Orange Carrots',
    url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=600&auto=format&fit=crop&q=80',
    tag: 'Carrots',
  },
  {
    title: 'Highland Washed Carrots',
    url: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&auto=format&fit=crop&q=80',
    tag: 'Carrots',
  },
  {
    title: 'Jaffna Cured Red Onions',
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
    tag: 'Onions',
  },
  {
    title: 'Greenhouse Salad Tomatoes',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    tag: 'Tomatoes',
  },
];

// ===================== 1. FARMER HOME DASHBOARD =====================
export const FarmerHomeScreen: React.FC = () => {
  const { listings, orders, currentUser, users, farmerAcceptOrder, farmerRejectOrder, setTab, goToSubScreen } = useApp();

  const currentFarmerId = currentUser?.role === 'farmer' ? currentUser._id : 'user_farmer_1';
  const currentFarmer = users.find(u => u._id === currentFarmerId) || currentUser;

  const myListings = listings.filter(l => l.farmerId === currentFarmerId && l.status === 'active');
  const myOrders = orders.filter(
    o => o.farmerId === currentFarmerId || (currentFarmer && o.farmerName === currentFarmer.name)
  );

  const pendingOrders = myOrders.filter(o => o.status === 'pending');
  const preparingOrders = myOrders.filter(o => o.status === 'accepted' || o.status === 'preparing');
  const totalRevenue = myOrders
    .filter(o => o.status === 'delivered')
    .reduce((acc, o) => acc + o.total, 0);

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ gap: 16 }}>
        {/* Profile Card */}
        <Card padding="md" className="bg-[#1F5C3A] flex-row items-center gap-3">
          <Avatar name={currentUser?.name || 'Sunil Bandara'} size="lg" role="farmer" />
          <View className="flex-1">
            <Text className="text-base font-extrabold text-white">
              {currentUser?.farmName || "Sunil's Highland Farm"}
            </Text>
            <Text className="text-xs text-white/80">
              {currentUser?.location?.town || 'Nuwara Eliya'} · Verified Producer
            </Text>
          </View>
        </Card>

        {/* Metrics Row */}
        <View className="flex-row gap-2">
          <Pressable onPress={() => setTab('orders')} style={{ flex: 1 }}>
            <Card padding="sm" className="bg-white items-center">
              <Text className="text-[10px] text-[#6B7280] font-bold">PENDING ORDERS</Text>
              <Text className="text-lg font-black text-[#B45309]">{pendingOrders.length}</Text>
            </Card>
          </Pressable>

          <Pressable onPress={() => setTab('listings')} style={{ flex: 1 }}>
            <Card padding="sm" className="bg-white items-center">
              <Text className="text-[10px] text-[#6B7280] font-bold">ACTIVE CROPS</Text>
              <Text className="text-lg font-black text-[#1F5C3A]">{myListings.length}</Text>
            </Card>
          </Pressable>

          <Card padding="sm" className="flex-1 bg-white items-center">
            <Text className="text-[10px] text-[#6B7280] font-bold">DELIVERED LKR</Text>
            <Text className="text-lg font-black text-[#19768A]">
              LKR {totalRevenue.toLocaleString()}
            </Text>
          </Card>
        </View>

        {/* Action Button */}
        <Button
          variant="primary"
          fullWidth
          size="lg"
          leftIcon={<Plus size={18} color="#ffffff" />}
          onPress={() => goToSubScreen('add_listing')}
        >
          Post New Crop Harvest
        </Button>

        {/* Pending Action Required Orders */}
        {pendingOrders.length > 0 && (
          <View style={{ gap: 8 }}>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold text-[#1A1A1A]">Pending Action Required ({pendingOrders.length})</Text>
              <Pressable onPress={() => setTab('orders')}>
                <Text className="text-xs font-bold text-[#1F5C3A]">View All Orders</Text>
              </Pressable>
            </View>
            {pendingOrders.map(order => {
              const firstItem = order.items[0];
              const hasPhoto =
                firstItem?.photoUrl &&
                (firstItem.photoUrl.startsWith('data:image') || firstItem.photoUrl.startsWith('http'));

              return (
                <Card key={order._id} padding="md" className="border-l-4 border-l-[#B45309] gap-2.5">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xs font-black text-[#1A1A1A]">{order.orderNumber}</Text>
                      <View className={`px-2 py-0.5 rounded text-[10px] ${order.deliveryType === 'pickup' ? 'bg-[#EFF6FF]' : 'bg-[#ECFDF5]'}`}>
                        <Text className={`text-[10px] font-bold ${order.deliveryType === 'pickup' ? 'text-[#1D4ED8]' : 'text-[#065F46]'}`}>
                          {order.deliveryType === 'pickup' ? 'Farm Pickup' : 'Doorstep'}
                        </Text>
                      </View>
                    </View>
                    <StatusPill status="pending" />
                  </View>

                  <View className="flex-row items-center gap-3">
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        overflow: 'hidden',
                        backgroundColor: '#F3F4F6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                      }}
                    >
                      {hasPhoto ? (
                        <Image source={{ uri: firstItem.photoUrl }} style={{ width: 44, height: 44 }} resizeMode="cover" />
                      ) : (
                        <ProduceVisual type={firstItem?.cropName || 'carrots'} size="sm" />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className="text-xs font-bold text-[#1A1A1A]">
                        {firstItem?.cropName} ({firstItem?.quantityKg}kg)
                        {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                      </Text>
                      <Text className="text-[11px] text-[#6B7280] mt-0.5">
                        Buyer: {order.buyerName} · LKR {order.total.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2 pt-2 border-t border-[#F0F0EE]">
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ flex: 1 }}
                      onPress={() => farmerRejectOrder(order._id, 'Capacity full')}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ flex: 1 }}
                      leftIcon={<CheckCircle2 size={14} color="#ffffff" />}
                      onPress={() => farmerAcceptOrder(order._id)}
                    >
                      Accept
                    </Button>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* My Listed Crops */}
        <View style={{ gap: 8 }}>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-bold text-[#1A1A1A]">My Active Harvests</Text>
            <Pressable onPress={() => setTab('listings')}>
              <Text className="text-xs font-bold text-[#1F5C3A]">View All</Text>
            </Pressable>
          </View>

          {myListings.map(listing => (
            <Card key={listing._id} padding="sm" className="flex-row items-center gap-3">
              <ProduceVisual type={listing.cropName} size="sm" />
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#1A1A1A]">{listing.cropName}</Text>
                <Text className="text-[10px] text-[#6B7280]">
                  Stock: {listing.quantityKg} kg · Min: {listing.minOrderKg} kg
                </Text>
                <Text className="text-xs font-black text-[#1F5C3A]">
                  LKR {listing.pricePerKg}/kg
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// ===================== 2. FARMER LISTINGS SCREEN =====================
export const FarmerListingsScreen: React.FC = () => {
  const { listings, currentUser, goToSubScreen, deleteListing } = useApp();
  const currentFarmerId = currentUser?.role === 'farmer' ? currentUser._id : 'user_farmer_1';
  const myListings = listings.filter(l => l.farmerId === currentFarmerId);

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ gap: 16 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-extrabold text-[#1A1A1A]">
            My Harvest Listings ({myListings.length})
          </Text>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} color="#ffffff" />}
            onPress={() => goToSubScreen('add_listing')}
          >
            Add Harvest
          </Button>
        </View>

        {myListings.length === 0 ? (
          <EmptyState
            title="No Harvest Listings"
            description="Post your crop yield to connect directly with buyers across Sri Lanka."
            actionLabel="Add Harvest"
            onAction={() => goToSubScreen('add_listing')}
          />
        ) : (
          <View style={{ gap: 12 }}>
            {myListings.map(listing => (
              <Card key={listing._id} padding="md" style={{ gap: 8 }}>
                <View className="flex-row items-center gap-3">
                  <ProduceVisual type={listing.cropName} size="sm" />
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-[#1A1A1A]">{listing.cropName}</Text>
                    <Text className="text-xs text-[#6B7280]">
                      Stock: {listing.quantityKg} kg · Price: LKR {listing.pricePerKg}/kg
                    </Text>
                  </View>
                  <StatusPill status={listing.status} />
                </View>

                <View className="flex-row justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
                  <Pressable
                    onPress={() => deleteListing(listing._id)}
                    className="p-1.5 rounded-lg bg-red-50"
                  >
                    <Trash2 size={16} color="#DC2626" />
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// ===================== 3. FARMER ADD LISTING SCREEN =====================
export const FarmerAddListingScreen: React.FC = () => {
  const { currentUser, addListing, setTab, goToSubScreen } = useApp();

  const [cropName, setCropName] = useState('Carrots');
  const [category, setCategory] = useState<'Vegetables' | 'Fruits' | 'Spices & Herbs' | 'Grains & Rice' | 'Tubers'>('Vegetables');
  const [quantityKg, setQuantityKg] = useState('250');
  const [minOrderKg, setMinOrderKg] = useState('10');
  const [pricePerKg, setPricePerKg] = useState('320');
  const [description, setDescription] = useState(
    'Freshly harvested highland grade produce. Graded for wholesale quality and packed in ventilated crates.'
  );
  const [isOrganic, setIsOrganic] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cropPresets = ['Carrots', 'Tomatoes', 'Potatoes', 'Red Onions', 'Leeks', 'Cabbage', 'Green Chillies'];
  const categories: Array<'Vegetables' | 'Fruits' | 'Spices & Herbs' | 'Grains & Rice' | 'Tubers'> = [
    'Vegetables',
    'Fruits',
    'Spices & Herbs',
    'Grains & Rice',
    'Tubers',
  ];

  const handleSubmit = () => {
    if (!cropName.trim()) {
      setErrorMsg('Please specify the crop name');
      return;
    }
    const q = parseFloat(quantityKg);
    const p = parseFloat(pricePerKg);
    const m = parseFloat(minOrderKg);

    if (isNaN(q) || q <= 0) {
      setErrorMsg('Please enter a valid stock quantity in kg');
      return;
    }
    if (isNaN(p) || p <= 0) {
      setErrorMsg('Please enter a valid wholesale price per kg');
      return;
    }

    addListing({
      cropName: cropName.trim(),
      category,
      quantityKg: q,
      minOrderKg: isNaN(m) || m <= 0 ? 5 : m,
      pricePerKg: p,
      harvestDate: new Date().toISOString().split('T')[0],
      photos: [HARVEST_PHOTO_PRESETS[selectedPhotoIndex]?.url || ''],
      description: description.trim(),
      status: 'active',
      location: {
        lat: currentUser?.location?.lat || 6.9697,
        lng: currentUser?.location?.lng || 80.7891,
        district: currentUser?.location?.district || 'Nuwara Eliya',
        town: currentUser?.location?.town || 'Kandapola',
      },
      isOrganic,
    });

    setTab('listings');
    goToSubScreen(null);
  };

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={{ gap: 16 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-extrabold text-[#1A1A1A]">Post New Harvest Yield</Text>
            <Text className="text-xs text-[#6B7280]">
              Direct farm-gate listing connecting buyers and bulk logistics
            </Text>
          </View>
        </View>

        {Boolean(errorMsg) && (
          <View className="p-3 bg-red-50 border border-red-200 rounded-xl flex-row items-center gap-2">
            <AlertCircle size={16} color="#DC2626" />
            <Text className="text-xs text-[#DC2626] font-semibold flex-1">{errorMsg}</Text>
          </View>
        )}

        <Card padding="md" style={{ gap: 14 }}>
          {/* Preset Crop Chips */}
          <View>
            <Text className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
              Select Crop
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: 'row' }}>
              {cropPresets.map(preset => (
                <Pressable
                  key={preset}
                  onPress={() => setCropName(preset)}
                  style={({ pressed }) => [
                    { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
                    cropName === preset
                      ? { backgroundColor: '#1F5C3A', borderColor: '#1F5C3A' }
                      : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: cropName === preset ? '#FFFFFF' : '#334155',
                    }}
                  >
                    {preset}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <Input
            label="Crop Name / Variety"
            value={cropName}
            onChangeText={setCropName}
            placeholder="e.g. Nuwara Eliya Fresh Carrots"
          />

          {/* Category Chips */}
          <View>
            <Text className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: 'row' }}>
              {categories.map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={({ pressed }) => [
                    { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
                    category === cat
                      ? { backgroundColor: '#1F5C3A', borderColor: '#1F5C3A' }
                      : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: category === cat ? '#FFFFFF' : '#334155',
                    }}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Numeric Fields Row */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Available Stock (kg)"
                keyboardType="numeric"
                value={quantityKg}
                onChangeText={setQuantityKg}
                placeholder="250"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Min Order (kg)"
                keyboardType="numeric"
                value={minOrderKg}
                onChangeText={setMinOrderKg}
                placeholder="10"
              />
            </View>
          </View>

          <Input
            label="Farm Gate Wholesale Price (LKR / kg)"
            keyboardType="numeric"
            value={pricePerKg}
            onChangeText={setPricePerKg}
            placeholder="320"
          />

          {/* Organic Cultivation Toggle */}
          <Pressable
            onPress={() => setIsOrganic(!isOrganic)}
            style={({ pressed }) => [
              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1 },
              isOrganic ? { backgroundColor: '#E6F2E8', borderColor: '#CDE5D2' } : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View className="flex-1 mr-2">
              <Text className="text-xs font-bold text-[#1F5C3A]">Certified Organic / Eco-Grown</Text>
              <Text className="text-[10px] text-[#4B6B56]">Cultivated without synthetic pesticides or chemical fertilizers</Text>
            </View>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                backgroundColor: isOrganic ? '#1F5C3A' : '#E2E8F0',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isOrganic && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
            </View>
          </Pressable>

          {/* Preset Photo Selector */}
          <View>
            <Text className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
              Harvest Verification Photo
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, flexDirection: 'row' }}>
              {HARVEST_PHOTO_PRESETS.map((preset, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setSelectedPhotoIndex(idx)}
                  style={({ pressed }) => [
                    { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', borderWidth: 2 },
                    selectedPhotoIndex === idx ? { borderColor: '#1F5C3A' } : { borderColor: '#E2E8F0' },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Image source={{ uri: preset.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  {selectedPhotoIndex === idx && (
                    <View style={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#1F5C3A', borderRadius: 10, padding: 2 }}>
                      <Check size={10} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <Input
            label="Harvest Quality Notes"
            value={description}
            onChangeText={setDescription}
            placeholder="Harvest time, grading standards, and packing..."
            multiline
            numberOfLines={2}
          />
        </Card>

        {/* Action Buttons */}
        <View className="flex-row gap-3 pt-2">
          <Button
            variant="outline"
            size="lg"
            style={{ flex: 1 }}
            onPress={() => goToSubScreen(null)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            style={{ flex: 2 }}
            leftIcon={<Plus size={18} color="#ffffff" />}
            onPress={handleSubmit}
          >
            Publish Harvest
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

// Main Farmer Screens Router Container
export const FarmerScreens: React.FC = () => {
  const { navState } = useApp();

  if (navState.subScreen === 'add_listing') {
    return <FarmerAddListingScreen />;
  }

  if (navState.activeTab === 'orders') return <FarmerOrdersScreen />;
  if (navState.activeTab === 'listings') return <FarmerListingsScreen />;

  return <FarmerHomeScreen />;
};
