import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, TextInput, Alert } from 'react-native';
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
  Pencil,
  Archive,
  LogOut,
  Calendar,
  Award,
  Sprout,
  Sparkles,
  Camera,
  ImagePlus,
  Upload,
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
import { DEFAULT_FARMER_AVATAR } from '../../services/farmerAvatarData';
import { Order, OrderStatus, Listing } from '../../types';
import { FarmerOrdersScreen } from './FarmerOrdersScreen';
import { FarmerMarketPriceTrendsScreen } from './FarmerMarketPriceTrendsScreen';
import {
  pickImageFromGallery,
  captureImageWithCamera,
  isValidPhotoUrl,
} from '../../services/imageService';

export const HARVEST_PHOTO_PRESETS = [
  {
    title: 'Fresh Orange Carrots',
    url: 'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?w=600&auto=format&fit=crop&q=80',
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
  {
    title: 'Nuwara Eliya White Potatoes',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    tag: 'Potatoes',
  },
  {
    title: 'Crisp Highland Cabbage',
    url: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&auto=format&fit=crop&q=80',
    tag: 'Cabbage',
  },
];

export const FARMER_AVATAR_PRESETS = [
  {
    id: 'av_1',
    label: 'Sunil (Highland)',
    url: DEFAULT_FARMER_AVATAR,
  },
  {
    id: 'av_2',
    label: 'Field Portrait',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'av_3',
    label: 'Senior Cultivator',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'av_4',
    label: 'Organic Grower',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  },
];

// ===================== 1. FARMER HOME DASHBOARD =====================
export const FarmerHomeScreen: React.FC = () => {
  const { listings, orders, currentUser, users, farmerAcceptOrder, farmerRejectOrder, setTab, goToSubScreen } = useApp();

  const currentFarmerId = currentUser?.role === 'farmer' ? (currentUser.uid || currentUser._id) : 'user_farmer_1';
  const currentFarmer = users.find(u => u._id === currentFarmerId || (currentUser?.uid && u._id === currentUser.uid)) || currentUser;

  const myListings = listings.filter(
    l => (l.farmerId === currentFarmerId || (currentUser?.uid && l.farmerId === currentUser.uid) || (currentUser?._id && l.farmerId === currentUser._id)) && l.status === 'active'
  );
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
        <Pressable onPress={() => setTab('profile')}>
          <Card padding="md" className="bg-[#1F5C3A] flex-row items-center gap-3">
            <Avatar
              name={currentUser?.name || 'Sunil Bandara'}
              size="lg"
              role="farmer"
              imageUrl={currentUser?.avatarUrl || currentFarmer?.avatarUrl || DEFAULT_FARMER_AVATAR}
            />
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-base font-extrabold text-white">
                  {currentUser?.farmName || "Sunil's Highland Farm"}
                </Text>
                <ShieldCheck size={14} color="#86EFAC" />
              </View>
              <Text className="text-xs text-white/80">
                {currentUser?.name || 'Sunil Bandara'} · {currentUser?.location?.town || 'Nuwara Eliya'}
              </Text>
            </View>
            <View className="bg-white/20 px-2.5 py-1 rounded-full flex-row items-center gap-1">
              <Text className="text-white text-xs font-bold">Profile</Text>
              <ChevronRight size={13} color="#FFFFFF" />
            </View>
          </Card>
        </Pressable>

        {/* Metrics Row */}
        <View className="flex-row gap-2">
          <Pressable onPress={() => setTab('orders')} style={{ flex: 1 }}>
            <Card padding="sm" className="bg-white items-center">
              <View style={{ height: 24, justifyContent: 'center', alignItems: 'center' }}>
                <Text className="text-[10px] text-[#6B7280] font-bold" numberOfLines={1}>PENDING ORDERS</Text>
              </View>
              <Text className="text-base font-black text-[#B45309] mt-0.5" numberOfLines={1}>{pendingOrders.length}</Text>
            </Card>
          </Pressable>

          <Pressable onPress={() => setTab('listings')} style={{ flex: 1 }}>
            <Card padding="sm" className="bg-white items-center">
              <View style={{ height: 24, justifyContent: 'center', alignItems: 'center' }}>
                <Text className="text-[10px] text-[#6B7280] font-bold" numberOfLines={1}>ACTIVE CROPS</Text>
              </View>
              <Text className="text-base font-black text-[#1F5C3A] mt-0.5" numberOfLines={1}>{myListings.length}</Text>
            </Card>
          </Pressable>

          <Card padding="sm" className="flex-1 bg-white items-center">
            <View style={{ height: 24, justifyContent: 'center', alignItems: 'center' }}>
              <Text className="text-[10px] text-[#6B7280] font-bold" numberOfLines={1}>DELIVERED LKR</Text>
            </View>
            <Text className="text-base font-black text-[#19768A] mt-0.5" numberOfLines={1}>
              LKR {totalRevenue.toLocaleString()}
            </Text>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 10 }}>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            leftIcon={<Plus size={18} color="#ffffff" />}
            onPress={() => goToSubScreen('add_listing')}
          >
            Post New Crop Harvest
          </Button>

          <Button
            variant="outline"
            fullWidth
            size="lg"
            leftIcon={<TrendingUp size={18} color="#1F5C3A" />}
            style={{
              backgroundColor: '#EAF3EC',
              borderColor: '#1F5C3A',
              borderWidth: 1.5,
            }}
            onPress={() => goToSubScreen('market_price_trends')}
          >
            <Text style={{ color: '#1F5C3A', fontWeight: '800', fontSize: 14 }}>
              Current Market Price
            </Text>
          </Button>
        </View>

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
              const hasPhoto = isValidPhotoUrl(firstItem?.photoUrl);

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
  const {
    listings,
    currentUser,
    goToSubScreen,
    deleteListing,
    updateListing,
    updateListingStatus,
  } = useApp();

  const currentFarmerId = currentUser?.role === 'farmer' ? (currentUser.uid || currentUser._id) : 'user_farmer_1';
  const myListings = listings.filter(
    l => l.farmerId === currentFarmerId ||
         (currentUser?.uid && l.farmerId === currentUser.uid) ||
         (currentUser?._id && l.farmerId === currentUser._id)
  );

  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'out_of_stock'>('all');

  // Edit Modal State
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editCropName, setEditCropName] = useState('');
  const [editCategory, setEditCategory] = useState<'Vegetables' | 'Fruits' | 'Spices & Herbs' | 'Grains & Rice' | 'Tubers'>('Vegetables');
  const [editQuantityKg, setEditQuantityKg] = useState('');
  const [editMinOrderKg, setEditMinOrderKg] = useState('');
  const [editPricePerKg, setEditPricePerKg] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsOrganic, setEditIsOrganic] = useState(false);
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [isUploadingEditPhoto, setIsUploadingEditPhoto] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const categories: Array<'Vegetables' | 'Fruits' | 'Spices & Herbs' | 'Grains & Rice' | 'Tubers'> = [
    'Vegetables',
    'Fruits',
    'Spices & Herbs',
    'Grains & Rice',
    'Tubers',
  ];

  const activeListings = myListings.filter(l => l.status === 'active');
  const soldOutListings = myListings.filter(l => l.status === 'out_of_stock');

  const filteredListings = myListings.filter(l => {
    if (activeFilter === 'active') return l.status === 'active';
    if (activeFilter === 'out_of_stock') return l.status === 'out_of_stock';
    return true;
  });

  const handlePickGalleryForEdit = async () => {
    setIsUploadingEditPhoto(true);
    const uri = await pickImageFromGallery();
    setIsUploadingEditPhoto(false);
    if (uri) {
      setEditPhotos(prev => [uri, ...prev]);
    }
  };

  const handleCaptureCameraForEdit = async () => {
    setIsUploadingEditPhoto(true);
    const uri = await captureImageWithCamera();
    setIsUploadingEditPhoto(false);
    if (uri) {
      setEditPhotos(prev => [uri, ...prev]);
    }
  };

  const handleRemoveEditPhoto = (idxToRemove: number) => {
    setEditPhotos(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const openEditModal = (listing: Listing) => {
    setEditingListing(listing);
    setEditCropName(listing.cropName);
    setEditCategory(listing.category);
    setEditQuantityKg(listing.quantityKg.toString());
    setEditMinOrderKg(listing.minOrderKg.toString());
    setEditPricePerKg(listing.pricePerKg.toString());
    setEditDescription(listing.description || '');
    setEditIsOrganic(Boolean(listing.isOrganic));
    setEditPhotos(listing.photos && listing.photos.length > 0 ? [...listing.photos] : []);
    setEditError(null);
  };

  const handleSaveEdit = () => {
    if (!editingListing) return;
    if (!editCropName.trim()) {
      setEditError('Crop name cannot be empty');
      return;
    }
    const q = parseFloat(editQuantityKg);
    const p = parseFloat(editPricePerKg);
    const m = parseFloat(editMinOrderKg);

    if (isNaN(q) || q < 0) {
      setEditError('Please enter a valid stock quantity in kg');
      return;
    }
    if (isNaN(p) || p <= 0) {
      setEditError('Please enter a valid wholesale price per kg in LKR');
      return;
    }

    const finalPhotos = editPhotos.length > 0
      ? editPhotos
      : (editingListing.photos && editingListing.photos.length > 0 ? editingListing.photos : [HARVEST_PHOTO_PRESETS[0].url]);

    updateListing(editingListing._id, {
      cropName: editCropName.trim(),
      category: editCategory,
      quantityKg: q,
      minOrderKg: isNaN(m) || m <= 0 ? 5 : m,
      pricePerKg: p,
      description: editDescription.trim(),
      isOrganic: editIsOrganic,
      photos: finalPhotos,
      status: q === 0 ? 'out_of_stock' : editingListing.status,
    });

    setEditingListing(null);
  };

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ gap: 16 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-black text-[#1A1A1A]">
              My Harvest Listings
            </Text>
            <Text className="text-xs text-[#6B7280]">
              Manage crop yields, pricing, and live availability
            </Text>
          </View>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} color="#ffffff" />}
            onPress={() => goToSubScreen('add_listing')}
          >
            Add Harvest
          </Button>
        </View>

        {/* Filter Chips */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-full border ${
              activeFilter === 'all'
                ? 'bg-[#1F5C3A] border-[#1F5C3A]'
                : 'bg-white border-[#E5E7EB]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeFilter === 'all' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              All ({myListings.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('active')}
            className={`px-3 py-1.5 rounded-full border ${
              activeFilter === 'active'
                ? 'bg-[#1F5C3A] border-[#1F5C3A]'
                : 'bg-white border-[#E5E7EB]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeFilter === 'active' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Active ({activeListings.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('out_of_stock')}
            className={`px-3 py-1.5 rounded-full border ${
              activeFilter === 'out_of_stock'
                ? 'bg-[#1F5C3A] border-[#1F5C3A]'
                : 'bg-white border-[#E5E7EB]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeFilter === 'out_of_stock' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Sold Out ({soldOutListings.length})
            </Text>
          </Pressable>
        </View>

        {/* Listing Cards */}
        {filteredListings.length === 0 ? (
          <EmptyState
            title={activeFilter === 'all' ? 'No Harvest Listings' : `No ${activeFilter === 'active' ? 'Active' : 'Sold Out'} Listings`}
            description="Post your crop yield to connect directly with wholesale buyers across Sri Lanka."
            actionLabel="Add Harvest"
            onAction={() => goToSubScreen('add_listing')}
          />
        ) : (
          <View style={{ gap: 12 }}>
            {filteredListings.map(listing => {
              const hasPhoto = isValidPhotoUrl(listing.photos?.[0]);
              const isSoldOut = listing.status === 'out_of_stock';

              return (
                <Card key={listing._id} padding="md" style={{ gap: 10 }}>
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 12,
                        overflow: 'hidden',
                        backgroundColor: '#F3F4F6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                      }}
                    >
                      {hasPhoto ? (
                        <Image
                          source={{ uri: listing.photos[0] }}
                          style={{ width: 54, height: 54 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <ProduceVisual type={listing.cropName} size="sm" />
                      )}
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5 flex-wrap">
                        <Text className="text-sm font-bold text-[#1A1A1A]">{listing.cropName}</Text>
                        <View className="bg-slate-100 px-1.5 py-0.5 rounded">
                          <Text className="text-[10px] text-slate-600 font-semibold">{listing.category}</Text>
                        </View>
                        {listing.isOrganic && (
                          <View className="bg-emerald-50 px-1.5 py-0.5 rounded">
                            <Text className="text-[10px] text-emerald-700 font-bold">🌱 Organic</Text>
                          </View>
                        )}
                      </View>

                      <Text className="text-xs text-[#6B7280] mt-0.5">
                        Stock: <Text className="font-bold text-[#1A1A1A]">{listing.quantityKg} kg</Text> · Min:{' '}
                        <Text className="font-bold text-[#1A1A1A]">{listing.minOrderKg} kg</Text>
                      </Text>

                      <Text className="text-xs font-black text-[#1F5C3A] mt-0.5">
                        LKR {listing.pricePerKg}/kg
                      </Text>
                    </View>

                    {/* Status Badge */}
                    <View
                      className={`px-2 py-1 rounded-md ${
                        isSoldOut ? 'bg-amber-100' : 'bg-emerald-100'
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-extrabold ${
                          isSoldOut ? 'text-amber-800' : 'text-emerald-800'
                        }`}
                      >
                        {isSoldOut ? 'Sold Out' : 'Active'}
                      </Text>
                    </View>
                  </View>

                  {/* Description / Notes preview if exists */}
                  {Boolean(listing.description) && (
                    <Text className="text-xs text-[#6B7280] bg-[#F9FAFB] p-2 rounded-lg" numberOfLines={2}>
                      {listing.description}
                    </Text>
                  )}

                  {/* Action Buttons Row */}
                  <View className="flex-row items-center gap-2 pt-2 border-t border-[#E5E7EB]">
                    {/* Mark Sold Out / Mark Available Toggle */}
                    {isSoldOut ? (
                      <Button
                        variant="outline"
                        size="sm"
                        style={{
                          flex: 1,
                          borderColor: '#86EFAC',
                          backgroundColor: '#F0FDF4',
                        }}
                        leftIcon={<CheckCircle2 size={13} color="#15803D" />}
                        onPress={() => updateListingStatus(listing._id, 'active')}
                      >
                        <Text className="text-xs font-bold text-[#15803D]">Mark Available</Text>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        style={{
                          flex: 1,
                          borderColor: '#FDE68A',
                          backgroundColor: '#FFFBEB',
                        }}
                        leftIcon={<Archive size={13} color="#B45309" />}
                        onPress={() => updateListingStatus(listing._id, 'out_of_stock')}
                      >
                        <Text className="text-xs font-bold text-[#B45309]">Mark Sold Out</Text>
                      </Button>
                    )}

                    {/* Edit Details Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ flex: 1, borderColor: '#CBD5E1' }}
                      leftIcon={<Pencil size={13} color="#1F5C3A" />}
                      onPress={() => openEditModal(listing)}
                    >
                      <Text className="text-xs font-bold text-[#1F5C3A]">Edit Details</Text>
                    </Button>

                    {/* Delete Button */}
                    <Pressable
                      onPress={() => deleteListing(listing._id)}
                      className="p-2 rounded-lg bg-red-50 border border-red-200"
                    >
                      <Trash2 size={15} color="#DC2626" />
                    </Pressable>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>

      {/* Edit Listing Modal */}
      <BottomSheet
        isOpen={editingListing !== null}
        onClose={() => setEditingListing(null)}
        title="Edit Harvest Details"
        maxHeight="88%"
      >
        <View style={{ gap: 14 }}>
          {editError && (
            <View className="bg-red-50 p-2.5 rounded-lg border border-red-200 flex-row items-center gap-2">
              <AlertCircle size={15} color="#DC2626" />
              <Text className="text-xs text-red-700 font-semibold flex-1">{editError}</Text>
            </View>
          )}

          {/* Crop Name */}
          <Input
            label="Crop Name"
            value={editCropName}
            onChangeText={setEditCropName}
            placeholder="e.g. Carrots, Red Onions"
          />

          {/* Category Chips */}
          <View style={{ gap: 6 }}>
            <Text className="text-xs font-bold text-[#4B5563]">Produce Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {categories.map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => setEditCategory(cat)}
                  className={`px-3 py-1.5 rounded-full border ${
                    editCategory === cat
                      ? 'bg-[#1F5C3A] border-[#1F5C3A]'
                      : 'bg-white border-[#E5E7EB]'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      editCategory === cat ? 'text-white' : 'text-[#4B5563]'
                    }`}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Price & Quantity Grid */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Wholesale Price (LKR / kg)"
                value={editPricePerKg}
                onChangeText={setEditPricePerKg}
                keyboardType="numeric"
                placeholder="e.g. 320"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Stock Quantity (kg)"
                value={editQuantityKg}
                onChangeText={setEditQuantityKg}
                keyboardType="numeric"
                placeholder="e.g. 250"
              />
            </View>
          </View>

          <Input
            label="Minimum Order (kg)"
            value={editMinOrderKg}
            onChangeText={setEditMinOrderKg}
            keyboardType="numeric"
            placeholder="e.g. 10"
          />

          {/* Organic Produce Switch */}
          <Pressable
            onPress={() => setEditIsOrganic(!editIsOrganic)}
            className="flex-row items-center justify-between p-3 rounded-xl border border-[#E5E7EB] bg-white"
          >
            <View className="flex-1 mr-2">
              <Text className="text-xs font-bold text-[#1A1A1A]">Certified Organic / Bio-farmed</Text>
              <Text className="text-[11px] text-[#6B7280]">
                Attracts buyers seeking chemical-free highland harvests
              </Text>
            </View>
            <View
              className={`w-6 h-6 rounded border items-center justify-center ${
                editIsOrganic ? 'bg-[#1F5C3A] border-[#1F5C3A]' : 'bg-white border-[#D1D5DB]'
              }`}
            >
              {editIsOrganic && <Check size={14} color="#ffffff" strokeWidth={3} />}
            </View>
          </Pressable>

          {/* Photos Management & Phone Upload Section */}
          <View style={{ gap: 8 }}>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold text-[#4B5563]">Listing Photos</Text>
              <Text className="text-[10px] text-[#6B7280]">
                {editPhotos.length} {editPhotos.length === 1 ? 'photo' : 'photos'} attached
              </Text>
            </View>

            {/* Current Photos Thumbnails */}
            {editPhotos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                {editPhotos.map((photoUri, pIdx) => (
                  <View
                    key={pIdx}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      overflow: 'hidden',
                      borderWidth: 2,
                      borderColor: pIdx === 0 ? '#1F5C3A' : '#E2E8F0',
                      position: 'relative',
                      backgroundColor: '#F1F5F9',
                    }}
                  >
                    <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    {pIdx === 0 && (
                      <View style={{ position: 'absolute', bottom: 3, left: 3, right: 3, backgroundColor: 'rgba(31, 92, 58, 0.9)', borderRadius: 3, paddingVertical: 1, alignItems: 'center' }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: '800' }}>COVER</Text>
                      </View>
                    )}
                    <Pressable
                      onPress={() => handleRemoveEditPhoto(pIdx)}
                      style={{
                        position: 'absolute',
                        top: 3,
                        right: 3,
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={10} color="#FFFFFF" strokeWidth={2.5} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Upload from Phone Buttons */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleCaptureCameraForEdit}
                disabled={isUploadingEditPhoto}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    backgroundColor: '#F8FAFC',
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: '#CBD5E1',
                    borderStyle: 'dashed',
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Camera size={15} color="#1F5C3A" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#1F5C3A' }}>
                  Take Photo
                </Text>
              </Pressable>

              <Pressable
                onPress={handlePickGalleryForEdit}
                disabled={isUploadingEditPhoto}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    backgroundColor: '#F8FAFC',
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: '#CBD5E1',
                    borderStyle: 'dashed',
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <ImagePlus size={15} color="#1F5C3A" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#1F5C3A' }}>
                  Upload from Phone
                </Text>
              </Pressable>
            </View>

            {/* Add Preset Option */}
            <View style={{ gap: 4, marginTop: 2 }}>
              <Text className="text-[10px] text-[#6B7280]">Or add a harvest preset:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {HARVEST_PHOTO_PRESETS.map((preset, index) => {
                  const isAlreadyIn = editPhotos.includes(preset.url);
                  return (
                    <Pressable
                      key={index}
                      onPress={() => {
                        if (!isAlreadyIn) {
                          setEditPhotos(prev => [preset.url, ...prev]);
                        }
                      }}
                      className={`rounded-lg overflow-hidden border p-0.5 ${
                        isAlreadyIn ? 'border-[#1F5C3A]' : 'border-[#E2E8F0]'
                      }`}
                    >
                      <Image
                        source={{ uri: preset.url }}
                        style={{ width: 48, height: 48, borderRadius: 6 }}
                        resizeMode="cover"
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Quality Notes */}
          <Input
            label="Harvest Quality Notes"
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder="Grading quality, wash method, crates packing..."
            multiline
            numberOfLines={2}
          />

          {/* Modal Action Buttons */}
          <View className="flex-row gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              style={{ flex: 1 }}
              onPress={() => setEditingListing(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              style={{ flex: 2 }}
              leftIcon={<CheckCircle2 size={16} color="#ffffff" />}
              onPress={handleSaveEdit}
            >
              Save Changes
            </Button>
          </View>
        </View>
      </BottomSheet>
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
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cropPresets = ['Carrots', 'Tomatoes', 'Potatoes', 'Red Onions', 'Leeks', 'Cabbage', 'Green Chillies'];
  const categories: Array<'Vegetables' | 'Fruits' | 'Spices & Herbs' | 'Grains & Rice' | 'Tubers'> = [
    'Vegetables',
    'Fruits',
    'Spices & Herbs',
    'Grains & Rice',
    'Tubers',
  ];

  const handlePickGallery = async () => {
    setIsUploadingPhoto(true);
    const uri = await pickImageFromGallery();
    setIsUploadingPhoto(false);
    if (uri) {
      setUploadedPhotos(prev => [uri, ...prev]);
    }
  };

  const handleCaptureCamera = async () => {
    setIsUploadingPhoto(true);
    const uri = await captureImageWithCamera();
    setIsUploadingPhoto(false);
    if (uri) {
      setUploadedPhotos(prev => [uri, ...prev]);
    }
  };

  const handleRemoveUploadedPhoto = (idxToRemove: number) => {
    setUploadedPhotos(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!currentUser?.verified) {
      setErrorMsg('Your farmer account is pending verification. Only verified farmers can publish listings.');
      Alert.alert(
        'Verification Required',
        'Your farmer account is currently pending administrative verification. Only verified farmers can publish harvest listings.'
      );
      return;
    }
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

    const finalPhotos = uploadedPhotos.length > 0
      ? uploadedPhotos
      : [HARVEST_PHOTO_PRESETS[selectedPhotoIndex]?.url || ''];

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await addListing({
        cropName: cropName.trim(),
        category,
        quantityKg: q,
        minOrderKg: isNaN(m) || m <= 0 ? 5 : m,
        pricePerKg: p,
        harvestDate: new Date().toISOString().split('T')[0],
        photos: finalPhotos,
        description: description.trim(),
        status: 'active',
        location: {
          lat: currentUser?.location?.lat || 6.9697,
          lng: currentUser?.location?.lng || 80.7891,
          district: currentUser?.district || currentUser?.location?.district || 'Nuwara Eliya',
          town: currentUser?.location?.town || 'Kandapola',
        },
        isOrganic,
      });

      Alert.alert('Success', 'Listing created successfully on Firestore!');
      setTab('listings');
      goToSubScreen(null);
    } catch (err: any) {
      const msg = err?.message || 'Failed to create listing in Firestore';
      setErrorMsg(msg);
      Alert.alert('Publish Error', msg);
    } finally {
      setIsSubmitting(false);
    }
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

          {/* Harvest & Crop Photos Upload Section */}
          <View style={{ gap: 10 }}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Harvest Photos
                </Text>
                <Text className="text-[10px] text-[#6B7280]">
                  Upload real harvest photos from your phone or choose presets
                </Text>
              </View>
              {uploadedPhotos.length > 0 && (
                <View className="bg-[#E6F2E8] px-2 py-0.5 rounded-full border border-[#CDE5D2]">
                  <Text className="text-[10px] font-bold text-[#1F5C3A]">
                    {uploadedPhotos.length} {uploadedPhotos.length === 1 ? 'Photo' : 'Photos'} Ready
                  </Text>
                </View>
              )}
            </View>

            {/* Upload Action Buttons */}
            <View className="flex-row gap-2.5">
              <Pressable
                onPress={handleCaptureCamera}
                disabled={isUploadingPhoto}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: '#F8FAFC',
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: '#CBD5E1',
                    borderStyle: 'dashed',
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Camera size={18} color="#1F5C3A" />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F5C3A' }}>
                  Take Photo
                </Text>
              </Pressable>

              <Pressable
                onPress={handlePickGallery}
                disabled={isUploadingPhoto}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: '#F8FAFC',
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: '#CBD5E1',
                    borderStyle: 'dashed',
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <ImagePlus size={18} color="#1F5C3A" />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F5C3A' }}>
                  Upload from Phone
                </Text>
              </Pressable>
            </View>

            {/* Uploaded Photos Preview List */}
            {uploadedPhotos.length > 0 && (
              <View style={{ gap: 6 }}>
                <Text className="text-[11px] font-bold text-[#4B5563]">
                  Uploaded Crop Images ({uploadedPhotos.length}):
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
                  {uploadedPhotos.map((photoUri, pIdx) => (
                    <View
                      key={pIdx}
                      style={{
                        width: 84,
                        height: 84,
                        borderRadius: 12,
                        overflow: 'hidden',
                        borderWidth: 2,
                        borderColor: pIdx === 0 ? '#1F5C3A' : '#E2E8F0',
                        position: 'relative',
                        backgroundColor: '#F1F5F9',
                      }}
                    >
                      <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      {pIdx === 0 && (
                        <View style={{ position: 'absolute', bottom: 4, left: 4, right: 4, backgroundColor: 'rgba(31, 92, 58, 0.9)', borderRadius: 4, paddingVertical: 1, alignItems: 'center' }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800' }}>COVER</Text>
                        </View>
                      )}
                      <Pressable
                        onPress={() => handleRemoveUploadedPhoto(pIdx)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(0, 0, 0, 0.65)',
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <X size={12} color="#FFFFFF" strokeWidth={2.5} />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Presets Row */}
            <View style={{ gap: 6 }}>
              <Text className="text-[11px] font-bold text-[#6B7280]">
                {uploadedPhotos.length > 0 ? 'Or use sample preset photos instead:' : 'Or select a quick harvest preset:'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: 'row' }}>
                {HARVEST_PHOTO_PRESETS.map((preset, idx) => {
                  const isSelected = uploadedPhotos.length === 0 && selectedPhotoIndex === idx;
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        setSelectedPhotoIndex(idx);
                      }}
                      style={({ pressed }) => [
                        { width: 72, height: 72, borderRadius: 10, overflow: 'hidden', borderWidth: 2 },
                        isSelected ? { borderColor: '#1F5C3A' } : { borderColor: '#E2E8F0' },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Image source={{ uri: preset.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      {isSelected && (
                        <View style={{ position: 'absolute', top: 3, right: 3, backgroundColor: '#1F5C3A', borderRadius: 8, padding: 2 }}>
                          <Check size={9} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publishing to Firestore...' : 'Publish Harvest'}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

// ===================== 4. FARMER PROFILE SCREEN =====================
export const FarmerProfileScreen: React.FC = () => {
  const {
    currentUser,
    users,
    listings,
    orders,
    updateCurrentUser,
    logout,
    setTab,
    goToSubScreen,
  } = useApp();

  const currentFarmerId = currentUser?.role === 'farmer' ? currentUser._id : 'user_farmer_1';
  const currentFarmer = users.find(u => u._id === currentFarmerId) || currentUser;

  const myListings = listings.filter(l => l.farmerId === currentFarmerId);
  const activeListings = myListings.filter(l => l.status === 'active');

  const myOrders = orders.filter(
    o => o.farmerId === currentFarmerId || (currentFarmer && o.farmerName === currentFarmer.name)
  );
  const completedOrders = myOrders.filter(o => o.status === 'delivered');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const estimatedMonthlyRevenue = totalRevenue > 0 ? Math.round(totalRevenue * 0.45) : 345000;
  const avgOrderValue =
    completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 28500;

  const farmerName = currentUser?.name || currentFarmer?.name || 'Sunil Bandara';
  const farmName = currentUser?.farmName || currentFarmer?.farmName || "Sunil's Highland Farm";
  const phone = currentUser?.phone || currentFarmer?.phone || '+94 77 123 4567';
  const locationAddress =
    currentUser?.location?.address ||
    currentFarmer?.location?.address ||
    'Highland Ridge Farm, Kandapola, Nuwara Eliya';
  const town = currentUser?.location?.town || currentFarmer?.location?.town || 'Kandapola';
  const district =
    currentUser?.location?.district || currentFarmer?.location?.district || 'Nuwara Eliya';
  const yearsFarming = currentUser?.yearsFarming ?? currentFarmer?.yearsFarming ?? 14;
  const farmSizeAcres = currentUser?.farmSizeAcres ?? currentFarmer?.farmSizeAcres ?? 4.5;
  const rating = currentUser?.rating || currentFarmer?.rating || 4.9;
  const totalRatings = currentUser?.totalRatings || currentFarmer?.totalRatings || 128;
  const avatarUrl = currentUser?.avatarUrl || currentFarmer?.avatarUrl || DEFAULT_FARMER_AVATAR;
  const isVerified = currentUser?.verified ?? currentFarmer?.verified ?? true;

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(farmerName);
  const [editFarmName, setEditFarmName] = useState(farmName);
  const [editPhone, setEditPhone] = useState(phone);
  const [editAddress, setEditAddress] = useState(locationAddress);
  const [editTown, setEditTown] = useState(town);
  const [editDistrict, setEditDistrict] = useState(district);
  const [editYearsFarming, setEditYearsFarming] = useState(yearsFarming.toString());
  const [editFarmSize, setEditFarmSize] = useState(farmSizeAcres.toString());
  const [editAvatarUrl, setEditAvatarUrl] = useState(avatarUrl || DEFAULT_FARMER_AVATAR);
  const [editSuccessMsg, setEditSuccessMsg] = useState(false);

  const handleOpenEdit = () => {
    setEditName(farmerName);
    setEditFarmName(farmName);
    setEditPhone(phone);
    setEditAddress(locationAddress);
    setEditTown(town);
    setEditDistrict(district);
    setEditYearsFarming(yearsFarming.toString());
    setEditFarmSize(farmSizeAcres.toString());
    setEditAvatarUrl(avatarUrl || DEFAULT_FARMER_AVATAR);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    updateCurrentUser({
      name: editName.trim(),
      farmName: editFarmName.trim(),
      phone: editPhone.trim(),
      avatarUrl: editAvatarUrl.trim() || undefined,
      yearsFarming: parseInt(editYearsFarming, 10) || 14,
      farmSizeAcres: parseFloat(editFarmSize) || 4.5,
      location: {
        lat: currentUser?.location?.lat || 6.9697,
        lng: currentUser?.location?.lng || 80.7891,
        address: editAddress.trim(),
        town: editTown.trim(),
        district: editDistrict.trim(),
      },
    });

    setEditSuccessMsg(true);
    setTimeout(() => {
      setEditSuccessMsg(false);
      setIsEditModalOpen(false);
    }, 400);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your farmer account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => logout() },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={{ gap: 16 }}>
        {/* 1. HERO PROFILE CARD */}
        <View
          style={{
            backgroundColor: '#1F5C3A',
            borderRadius: 18,
            padding: 18,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          {/* Top Avatar & Identifiers Row */}
          <View className="flex-row items-center gap-3.5">
            <View className="relative">
              <Avatar
                name={farmerName}
                size="xl"
                role="farmer"
                imageUrl={avatarUrl}
              />
              {isVerified && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    backgroundColor: '#15803D',
                    borderRadius: 12,
                    padding: 3,
                    borderWidth: 2,
                    borderColor: '#1F5C3A',
                  }}
                >
                  <ShieldCheck size={14} color="#FFFFFF" strokeWidth={2.8} />
                </View>
              )}
            </View>

            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 flex-wrap">
                <Text className="text-lg font-black text-white" numberOfLines={1}>
                  {farmerName}
                </Text>
              </View>

              <Text className="text-xs font-bold text-emerald-200 mt-0.5" numberOfLines={1}>
                {farmName}
              </Text>

              {/* Location Row */}
              <View className="flex-row items-center gap-1 mt-1.5">
                <MapPin size={12} color="#D1FAE5" />
                <Text className="text-xs text-emerald-100 flex-1" numberOfLines={1}>
                  {town}, {district}
                </Text>
              </View>

              {/* Phone Row */}
              <View className="flex-row items-center gap-1 mt-1">
                <Phone size={12} color="#D1FAE5" />
                <Text className="text-xs text-emerald-100 font-semibold">{phone}</Text>
              </View>
            </View>
          </View>

          {/* Verification & Rating Badges */}
          <View className="flex-row items-center gap-2 mt-4 pt-3 border-t border-emerald-800/60 flex-wrap">
            <View className="flex-row items-center bg-emerald-900/80 px-2.5 py-1 rounded-full gap-1 border border-emerald-600/40">
              <ShieldCheck size={13} color="#86EFAC" />
              <Text className="text-[11px] font-extrabold text-emerald-200">
                Verified Producer
              </Text>
            </View>

            <View className="flex-row items-center bg-emerald-900/80 px-2.5 py-1 rounded-full gap-1 border border-emerald-600/40">
              <Star size={12} color="#FBBF24" fill="#FBBF24" />
              <Text className="text-[11px] font-extrabold text-white">
                {rating} ★ ({totalRatings} Reviews)
              </Text>
            </View>

            <View className="flex-row items-center bg-emerald-900/80 px-2.5 py-1 rounded-full gap-1 border border-emerald-600/40">
              <Sparkles size={11} color="#FDE047" />
              <Text className="text-[11px] font-bold text-emerald-100">
                Direct Wholesale
              </Text>
            </View>
          </View>

          {/* Edit Profile Quick Button */}
          <Pressable
            onPress={handleOpenEdit}
            style={({ pressed }) => [
              {
                marginTop: 14,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.25)',
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View className="flex-row items-center justify-center gap-1.5">
              <Pencil size={14} color="#FFFFFF" />
              <Text className="text-xs font-bold text-white">Edit Profile Details</Text>
            </View>
          </Pressable>
        </View>

        {/* 2. FARMING SUMMARY (4-CARD GRID) */}
        <View style={{ gap: 8 }}>
          <Text className="text-sm font-extrabold text-[#1A1A1A]">Farming Summary</Text>
          <View className="flex-row gap-2.5">
            {/* Years Farming */}
            <Card padding="md" className="flex-1 bg-white items-center text-center">
              <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mb-1.5">
                <Sprout size={16} color="#1F5C3A" />
              </View>
              <Text className="text-base font-black text-[#1F5C3A]">
                {yearsFarming} Yrs
              </Text>
              <Text className="text-[10px] font-bold text-[#6B7280] text-center mt-0.5">
                Years Farming
              </Text>
              <Text className="text-[9px] text-[#9CA3AF] text-center">Highland Soil</Text>
            </Card>

            {/* Total Crops Listed */}
            <Pressable onPress={() => setTab('listings')} style={{ flex: 1 }}>
              <Card padding="md" className="bg-white items-center text-center">
                <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mb-1.5">
                  <Package size={16} color="#2563EB" />
                </View>
                <Text className="text-base font-black text-[#1D4ED8]">
                  {myListings.length}
                </Text>
                <Text className="text-[10px] font-bold text-[#6B7280] text-center mt-0.5">
                  Total Crops
                </Text>
                <Text className="text-[9px] text-emerald-600 font-bold text-center">
                  {activeListings.length} Active
                </Text>
              </Card>
            </Pressable>

            {/* Total Orders Completed */}
            <Pressable onPress={() => setTab('orders')} style={{ flex: 1 }}>
              <Card padding="md" className="bg-white items-center text-center">
                <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mb-1.5">
                  <CheckCircle2 size={16} color="#D97706" />
                </View>
                <Text className="text-base font-black text-[#B45309]">
                  {completedOrders.length}
                </Text>
                <Text className="text-[10px] font-bold text-[#6B7280] text-center mt-0.5">
                  Orders Done
                </Text>
                <Text className="text-[9px] text-[#9CA3AF] text-center">100% Fulfilled</Text>
              </Card>
            </Pressable>

            {/* Farm Land Size */}
            <Card padding="md" className="flex-1 bg-white items-center text-center">
              <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center mb-1.5">
                <MapPin size={16} color="#7C3AED" />
              </View>
              <Text className="text-base font-black text-[#6D28D9]">
                {farmSizeAcres} Ac
              </Text>
              <Text className="text-[10px] font-bold text-[#6B7280] text-center mt-0.5">
                Farm Size
              </Text>
              <Text className="text-[9px] text-[#9CA3AF] text-center">Cultivated</Text>
            </Card>
          </View>
        </View>

        {/* 3. EARNINGS SUMMARY */}
        <View style={{ gap: 8 }}>
          <Text className="text-sm font-extrabold text-[#1A1A1A]">Earnings Summary</Text>
          <Card padding="md" className="bg-white gap-3 border border-emerald-100">
            <View className="flex-row items-center justify-between pb-2 border-b border-[#F3F4F6]">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center">
                  <TrendingUp size={16} color="#1F5C3A" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-[#1A1A1A]">Revenue Overview</Text>
                  <Text className="text-[11px] text-[#6B7280]">Direct Bank Transfer (BOC)</Text>
                </View>
              </View>
              <View className="bg-emerald-50 px-2 py-0.5 rounded">
                <Text className="text-[10px] font-bold text-emerald-800">Weekly Payout</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB]">
                <Text className="text-[10px] font-bold text-[#6B7280] uppercase">
                  Total Delivered Revenue
                </Text>
                <Text className="text-base font-black text-[#1F5C3A] mt-1">
                  LKR {totalRevenue.toLocaleString()}
                </Text>
                <Text className="text-[10px] text-[#6B7280] mt-0.5">
                  All-time wholesale earnings
                </Text>
              </View>

              <View className="flex-1 bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB]">
                <Text className="text-[10px] font-bold text-[#6B7280] uppercase">
                  Monthly Projected
                </Text>
                <Text className="text-base font-black text-[#1D4ED8] mt-1">
                  LKR {estimatedMonthlyRevenue.toLocaleString()}
                </Text>
                <Text className="text-[10px] text-[#6B7280] mt-0.5">
                  Est. monthly payout
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between bg-emerald-50/70 p-2.5 rounded-lg">
              <Text className="text-xs text-emerald-900 font-semibold">
                Avg. Wholesale Order: LKR {avgOrderValue.toLocaleString()}
              </Text>
              <Text className="text-[11px] font-bold text-[#1F5C3A]">0% Broker Fee</Text>
            </View>
          </Card>
        </View>

        {/* 4. FARM & DISPATCH LOCATION INFO */}
        <Card padding="md" className="bg-white gap-2.5">
          <Text className="text-xs font-bold text-[#6B7280] uppercase">Farm Location & Address</Text>
          <View className="flex-row items-start gap-2.5">
            <MapPin size={16} color="#1F5C3A" style={{ marginTop: 2 }} />
            <View className="flex-1">
              <Text className="text-xs font-bold text-[#1A1A1A]">{locationAddress}</Text>
              <Text className="text-[11px] text-[#6B7280] mt-0.5">
                Nearest Dispatch Hub: Nuwara Eliya Dedicated Economic Center
              </Text>
            </View>
          </View>
        </Card>

        {/* 5. ACTION BUTTONS */}
        <View style={{ gap: 10, paddingTop: 4 }}>
          {/* Edit Profile Button */}
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Pencil size={16} color="#ffffff" />}
            onPress={handleOpenEdit}
          >
            Edit Profile
          </Button>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="lg"
            style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}
            leftIcon={<LogOut size={16} color="#DC2626" />}
            onPress={handleLogout}
          >
            <Text className="text-sm font-bold text-[#DC2626]">Log Out</Text>
          </Button>
        </View>
      </View>

      {/* Edit Profile Modal */}
      <BottomSheet
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Farmer Profile"
        maxHeight="88%"
      >
        <View style={{ gap: 14 }}>
          {editSuccessMsg && (
            <View className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex-row items-center gap-2">
              <CheckCircle2 size={16} color="#15803D" />
              <Text className="text-xs text-emerald-800 font-bold">Profile updated successfully!</Text>
            </View>
          )}

          {/* Full Name */}
          <Input
            label="Farmer Full Name"
            value={editName}
            onChangeText={setEditName}
            placeholder="e.g. Sunil Bandara"
          />

          {/* Farm Name */}
          <Input
            label="Farm / Enterprise Name"
            value={editFarmName}
            onChangeText={setEditFarmName}
            placeholder="e.g. Highland Organics Nuwara Eliya"
          />

          {/* Phone Number */}
          <Input
            label="Phone Number"
            value={editPhone}
            onChangeText={setEditPhone}
            keyboardType="phone-pad"
            placeholder="+94 77 123 4567"
          />

          {/* Farm Address */}
          <Input
            label="Farm Physical Address"
            value={editAddress}
            onChangeText={setEditAddress}
            placeholder="e.g. Highland Ridge Farm, Kandapola"
            multiline
            numberOfLines={2}
          />

          {/* Town & District */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Town / Area"
                value={editTown}
                onChangeText={setEditTown}
                placeholder="Kandapola"
              />
            </View>
            <View className="flex-1">
              <Input
                label="District"
                value={editDistrict}
                onChangeText={setEditDistrict}
                placeholder="Nuwara Eliya"
              />
            </View>
          </View>

          {/* Experience & Land Size */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Years Farming"
                value={editYearsFarming}
                onChangeText={setEditYearsFarming}
                keyboardType="numeric"
                placeholder="14"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Farm Size (Acres)"
                value={editFarmSize}
                onChangeText={setEditFarmSize}
                keyboardType="numeric"
                placeholder="4.5"
              />
            </View>
          </View>

          {/* Avatar Photo Selector */}
          <View style={{ gap: 6 }}>
            <Text className="text-xs font-bold text-[#4B5563]">Select Profile Photo Preset</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {FARMER_AVATAR_PRESETS.map(preset => {
                const isSelected = editAvatarUrl === preset.url;
                return (
                  <Pressable
                    key={preset.id}
                    onPress={() => setEditAvatarUrl(preset.url)}
                    className={`rounded-full overflow-hidden border-2 p-0.5 ${
                      isSelected ? 'border-[#1F5C3A]' : 'border-transparent'
                    }`}
                  >
                    <Image
                      source={{ uri: preset.url }}
                      style={{ width: 52, height: 52, borderRadius: 26 }}
                      resizeMode="cover"
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <Input
            label="Or Custom Photo URL"
            value={editAvatarUrl}
            onChangeText={setEditAvatarUrl}
            placeholder="https://images.unsplash.com/..."
          />

          {/* Modal Action Buttons */}
          <View className="flex-row gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              style={{ flex: 1 }}
              onPress={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              style={{ flex: 2 }}
              leftIcon={<CheckCircle2 size={16} color="#ffffff" />}
              onPress={handleSaveProfile}
            >
              Save Profile
            </Button>
          </View>
        </View>
      </BottomSheet>
    </ScrollView>
  );
};

// Main Farmer Screens Router Container
export const FarmerScreens: React.FC = () => {
  const { navState } = useApp();

  if (navState.subScreen === 'add_listing') {
    return <FarmerAddListingScreen />;
  }

  if (
    navState.subScreen === 'market_price_trends' ||
    navState.subScreen === 'current_market_price'
  ) {
    return <FarmerMarketPriceTrendsScreen />;
  }

  if (navState.activeTab === 'orders') return <FarmerOrdersScreen />;
  if (navState.activeTab === 'listings') return <FarmerListingsScreen />;
  if (navState.activeTab === 'profile') return <FarmerProfileScreen />;

  return <FarmerHomeScreen />;
};

