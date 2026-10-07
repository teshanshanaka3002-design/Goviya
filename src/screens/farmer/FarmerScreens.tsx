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
  const { listings, orders, currentUser, setTab, goToSubScreen } = useApp();

  const currentFarmerId = currentUser?.role === 'farmer' ? currentUser._id : 'user_farmer_1';

  const myListings = listings.filter(l => l.farmerId === currentFarmerId && l.status === 'active');
  const myOrders = orders.filter(o => o.farmerId === currentFarmerId);

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
          <Avatar name={currentUser?.name || 'Sunil Shantha'} size="lg" role="farmer" />
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
          <Card padding="sm" className="flex-1 bg-white items-center">
            <Text className="text-[10px] text-[#6B7280] font-bold">PENDING ORDERS</Text>
            <Text className="text-lg font-black text-[#B45309]">{pendingOrders.length}</Text>
          </Card>

          <Card padding="sm" className="flex-1 bg-white items-center">
            <Text className="text-[10px] text-[#6B7280] font-bold">ACTIVE CROPS</Text>
            <Text className="text-lg font-black text-[#1F5C3A]">{myListings.length}</Text>
          </Card>

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
            <Text className="text-sm font-bold text-[#1A1A1A]">Pending Action Required</Text>
            {pendingOrders.map(order => (
              <Card key={order._id} padding="md" className="border-l-4 border-l-[#B45309]">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-bold text-[#1A1A1A]">{order.orderNumber}</Text>
                  <StatusPill status="pending" />
                </View>
                <Text className="text-xs text-[#6B7280] mt-1">
                  Buyer: {order.buyerName} · {order.items[0]?.cropName} ({order.items[0]?.quantityKg}kg)
                </Text>
              </Card>
            ))}
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

// Main Farmer Screens Router Container
export const FarmerScreens: React.FC = () => {
  const { navState } = useApp();

  if (navState.activeTab === 'orders') return <FarmerOrdersScreen />;
  if (navState.activeTab === 'listings') return <FarmerListingsScreen />;

  return <FarmerHomeScreen />;
};
