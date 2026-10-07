import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import {
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  Truck,
  Store,
  ArrowRight,
  AlertCircle,
} from 'lucide-react-native';
import { useApp } from '../../services/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProduceVisual } from '../../components/ui/ProduceVisual';
import { Avatar } from '../../components/ui/Avatar';
import { Order, OrderStatus } from '../../types';

export const FarmerOrdersScreen: React.FC = () => {
  const {
    orders,
    currentUser,
    users,
    farmerAcceptOrder,
    farmerRejectOrder,
    farmerUpdateOrderStatus,
    farmerConfirmPickupHandover,
    getOrCreateConversation,
    goToSubScreen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'transit' | 'delivered'>('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<'all' | 'delivery' | 'pickup'>('all');

  const currentFarmerId = currentUser?.role === 'farmer' ? currentUser._id : 'user_farmer_1';
  const currentFarmer = users.find(u => u._id === currentFarmerId) || currentUser;

  const farmerOrders = orders.filter(
    o => o.farmerId === currentFarmerId || (currentFarmer && o.farmerName === currentFarmer.name)
  );

  const pendingOrders = farmerOrders.filter(o => o.status === 'pending');
  const preparingOrders = farmerOrders.filter(o => o.status === 'accepted' || o.status === 'preparing');
  const readyOrders = farmerOrders.filter(o => o.status === 'ready_for_pickup');

  const filteredOrders = farmerOrders.filter(order => {
    if (statusFilter === 'pending' && order.status !== 'pending') return false;
    if (statusFilter === 'preparing' && order.status !== 'accepted' && order.status !== 'preparing') return false;
    if (statusFilter === 'ready' && order.status !== 'ready_for_pickup') return false;
    if (statusFilter === 'transit' && order.status !== 'out_for_delivery') return false;
    if (statusFilter === 'delivered' && order.status !== 'delivered') return false;

    if (deliveryTypeFilter === 'pickup' && order.deliveryType !== 'pickup') return false;
    if (deliveryTypeFilter === 'delivery' && order.deliveryType === 'pickup') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrderNum = order.orderNumber.toLowerCase().includes(q);
      const matchBuyer = order.buyerName.toLowerCase().includes(q);
      const matchCrop = order.items.some(i => i.cropName.toLowerCase().includes(q));
      if (!matchOrderNum && !matchBuyer && !matchCrop) return false;
    }
    return true;
  });

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ gap: 16 }}>
        <Text className="text-base font-extrabold text-[#1A1A1A]">
          Farmer Order Management ({farmerOrders.length})
        </Text>

        {/* Quick Filter Badges */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full border ${
              statusFilter === 'all' ? 'bg-[#1F5C3A] border-[#1F5C3A]' : 'bg-white border-[#E5E5E5]'
            }`}
          >
            <Text className={`text-xs font-bold ${statusFilter === 'all' ? 'text-white' : 'text-[#1A1A1A]'}`}>
              All ({farmerOrders.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-full border ${
              statusFilter === 'pending' ? 'bg-[#B45309] border-[#B45309]' : 'bg-white border-[#E5E5E5]'
            }`}
          >
            <Text className={`text-xs font-bold ${statusFilter === 'pending' ? 'text-white' : 'text-[#1A1A1A]'}`}>
              Pending ({pendingOrders.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStatusFilter('preparing')}
            className={`px-3 py-1.5 rounded-full border ${
              statusFilter === 'preparing' ? 'bg-[#19768A] border-[#19768A]' : 'bg-white border-[#E5E5E5]'
            }`}
          >
            <Text className={`text-xs font-bold ${statusFilter === 'preparing' ? 'text-white' : 'text-[#1A1A1A]'}`}>
              Preparing ({preparingOrders.length})
            </Text>
          </Pressable>
        </ScrollView>

        {/* Order Cards List */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="No Orders Found"
            description="No harvest orders match the selected filters."
          />
        ) : (
          <View style={{ gap: 12 }}>
            {filteredOrders.map(order => (
              <Card key={order._id} padding="md" style={{ gap: 12 }}>
                <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
                  <View>
                    <Text className="text-xs font-bold text-[#1A1A1A]">{order.orderNumber}</Text>
                    <Text className="text-[10px] text-[#6B7280]">
                      Buyer: {order.buyerName} ({order.buyerPhone})
                    </Text>
                  </View>
                  <StatusPill status={order.status} />
                </View>

                {order.items.map((item, idx) => (
                  <View key={idx} className="flex-row items-center justify-between">
                    <Text className="text-xs font-semibold text-[#1A1A1A]">
                      {item.cropName} x {item.quantityKg} kg
                    </Text>
                    <Text className="text-xs font-bold text-[#1F5C3A]">
                      LKR {(item.pricePerKg * item.quantityKg).toLocaleString()}
                    </Text>
                  </View>
                ))}

                {/* Farmer Order Actions */}
                {order.status === 'pending' && (
                  <View className="flex-row gap-2 pt-2 border-t border-[#F0F0EE]">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onPress={() => farmerRejectOrder(order._id, 'Out of stock')}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onPress={() => farmerAcceptOrder(order._id)}
                    >
                      Accept Order
                    </Button>
                  </View>
                )}

                {order.status === 'accepted' && (
                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    onPress={() => farmerUpdateOrderStatus(order._id, 'preparing', 'Harvesting and packing')}
                  >
                    Mark as Harvesting & Packing
                  </Button>
                )}

                {order.status === 'preparing' && (
                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    onPress={() => farmerUpdateOrderStatus(order._id, 'ready_for_pickup')}
                  >
                    Mark Ready for Pickup
                  </Button>
                )}
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};
