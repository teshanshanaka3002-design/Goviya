import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Image, Linking, Modal } from 'react-native';
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
  Package,
  UserCheck,
  X,
  Navigation,
} from 'lucide-react-native';
import { useApp, db, doc, onSnapshot, auth, isFirebaseConfigured } from '../../services/store';
import { Card } from '../../components/ui/Card';
import { isValidPhotoUrl } from '../../services/imageService';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProduceVisual } from '../../components/ui/ProduceVisual';
import { Avatar } from '../../components/ui/Avatar';
import { OrderLiveRouteMap } from '../../components/shared/OrderLiveRouteMap';
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
  const [viewScope, setViewScope] = useState<'current_farm' | 'all_farms'>('current_farm');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Firestore real-time onSnapshot listener for the tracking modal order
  useEffect(() => {
    if (!trackingOrder?._id) return;
    if (!isFirebaseConfigured || !auth.currentUser || trackingOrder._id.startsWith('ord_')) {
      return;
    }
    const unsub = onSnapshot(
      doc(db, 'orders', trackingOrder._id),
      (docSnap) => {
        const data = docSnap.data();
        if (data) {
          setTrackingOrder({ _id: docSnap.id, ...data } as Order);
        }
      },
      (error) => {
        console.warn('FIRESTORE FARMER TRACKING ORDER WARNING:', error.message);
      }
    );
    return () => unsub();
  }, [trackingOrder?._id]);

  const currentFarmerId = currentUser?.role === 'farmer' ? currentUser._id : 'user_farmer_1';
  const currentFarmer = users.find(u => u._id === currentFarmerId) || currentUser;

  // Filter orders by farm scope
  const scopedOrders = orders.filter(o => {
    if (viewScope === 'all_farms') return true;
    return o.farmerId === currentFarmerId || (currentFarmer && o.farmerName === currentFarmer.name);
  });

  const pendingOrders = scopedOrders.filter(o => o.status === 'pending');
  const preparingOrders = scopedOrders.filter(o => o.status === 'accepted' || o.status === 'preparing');
  const readyOrders = scopedOrders.filter(o => o.status === 'ready_for_pickup');
  const deliveredOrders = scopedOrders.filter(o => o.status === 'delivered');

  const filteredOrders = scopedOrders.filter(order => {
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
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={{ gap: 14 }}>
        {/* Header with Title and Scope Selector */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-black text-[#1A1A1A]">
              Farm Orders & Dispatch
            </Text>
            <Text className="text-xs text-[#6B7280]">
              {currentFarmer?.farmName || "Sunil's Highland Farm"} · Live sync
            </Text>
          </View>

          {/* Farm Scope Switcher */}
          <View className="flex-row bg-[#E5E7EB] p-0.5 rounded-xl">
            <Pressable
              onPress={() => setViewScope('current_farm')}
              className={`px-2.5 py-1 rounded-lg ${
                viewScope === 'current_farm' ? 'bg-[#1F5C3A]' : 'bg-transparent'
              }`}
            >
              <Text className={`text-[11px] font-bold ${viewScope === 'current_farm' ? 'text-white' : 'text-[#4B5563]'}`}>
                My Farm
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setViewScope('all_farms')}
              className={`px-2.5 py-1 rounded-lg ${
                viewScope === 'all_farms' ? 'bg-[#1F5C3A]' : 'bg-transparent'
              }`}
            >
              <Text className={`text-[11px] font-bold ${viewScope === 'all_farms' ? 'text-white' : 'text-[#4B5563]'}`}>
                All Farms ({orders.length})
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Filter Badges */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 6 }}>
          <Pressable
            onPress={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full border ${
              statusFilter === 'all' ? 'bg-[#1F5C3A] border-[#1F5C3A]' : 'bg-white border-[#E5E5E5]'
            }`}
          >
            <Text className={`text-xs font-bold ${statusFilter === 'all' ? 'text-white' : 'text-[#1A1A1A]'}`}>
              All ({scopedOrders.length})
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

          <Pressable
            onPress={() => setStatusFilter('ready')}
            className={`px-3 py-1.5 rounded-full border ${
              statusFilter === 'ready' ? 'bg-[#047857] border-[#047857]' : 'bg-white border-[#E5E5E5]'
            }`}
          >
            <Text className={`text-xs font-bold ${statusFilter === 'ready' ? 'text-white' : 'text-[#1A1A1A]'}`}>
              Ready ({readyOrders.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-full border ${
              statusFilter === 'delivered' ? 'bg-[#374151] border-[#374151]' : 'bg-white border-[#E5E5E5]'
            }`}
          >
            <Text className={`text-xs font-bold ${statusFilter === 'delivered' ? 'text-white' : 'text-[#1A1A1A]'}`}>
              Delivered ({deliveredOrders.length})
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
            {filteredOrders.map(order => {
              const isSelfPickup = order.deliveryType === 'pickup';

              return (
                <Card key={order._id} padding="md" style={{ gap: 12 }}>
                  {/* Order Header */}
                  <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2.5">
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs font-black text-[#1A1A1A]">{order.orderNumber}</Text>
                        {isSelfPickup ? (
                          <View className="bg-[#EFF6FF] px-2 py-0.5 rounded-md border border-[#BFDBFE]">
                            <Text className="text-[10px] font-bold text-[#1D4ED8]">Farm Gate Pickup</Text>
                          </View>
                        ) : (
                          <View className="bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#A7F3D0]">
                            <Text className="text-[10px] font-bold text-[#065F46]">Doorstep Delivery</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-[11px] text-[#6B7280] mt-0.5">
                        Buyer: {order.buyerName} · {order.buyerPhone}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-1.5">
                      <Pressable
                        onPress={() => {
                          const convId = getOrCreateConversation(order.buyerId, order.buyerName, order.items[0]?.cropName || 'Order', 'buyer');
                          goToSubScreen('chat_detail', { conversationId: convId });
                        }}
                        style={({ pressed }) => [
                          { paddingHorizontal: 8, paddingVertical: 4.5, borderRadius: 8, backgroundColor: '#E6F2E8', flexDirection: 'row', alignItems: 'center', gap: 4 },
                          pressed && { opacity: 0.75 },
                        ]}
                      >
                        <MessageSquare size={12} color="#1F5C3A" />
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#1F5C3A' }}>Chat</Text>
                      </Pressable>
                      <StatusPill status={order.status} />
                    </View>
                  </View>

                  {/* Items in Order with Product Photo (Matching Buyer's View) */}
                  <View style={{ gap: 8 }}>
                    {order.items.map((item, idx) => {
                      const hasPhoto = isValidPhotoUrl(item.photoUrl);

                      return (
                        <View key={idx} className="flex-row items-center gap-3">
                          {/* Product Image Container */}
                          <View
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 10,
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
                                source={{ uri: item.photoUrl }}
                                style={{ width: 48, height: 48 }}
                                resizeMode="cover"
                              />
                            ) : (
                              <ProduceVisual type={item.cropName} size="sm" />
                            )}
                          </View>

                          <View className="flex-1">
                            <Text className="text-xs font-bold text-[#1A1A1A]" numberOfLines={1}>
                              {item.cropName}
                            </Text>
                            <Text className="text-[11px] text-[#6B7280] mt-0.5">
                              {item.quantityKg} kg · LKR {item.pricePerKg}/kg
                            </Text>
                          </View>

                          <Text className="text-xs font-black text-[#1F5C3A]">
                            LKR {(item.pricePerKg * item.quantityKg).toLocaleString()}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Order Total & Destination Details */}
                  <View className="bg-[#F9FAFB] p-2.5 rounded-xl border border-[#F3F4F6] gap-1">
                    <View className="flex-row justify-between">
                      <Text className="text-[11px] text-[#6B7280]">
                        {isSelfPickup ? 'Pickup Location:' : 'Delivery Address:'}
                      </Text>
                      <Text className="text-[11px] font-semibold text-[#1A1A1A] flex-1 text-right ml-2" numberOfLines={1}>
                        {isSelfPickup ? order.farmerAddress : order.deliveryAddress}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-[11px] text-[#6B7280]">Order Value:</Text>
                      <Text className="text-xs font-black text-[#1F5C3A]">
                        LKR {order.total.toLocaleString()} ({order.paymentMethod.replace(/_/g, ' ').toUpperCase()})
                      </Text>
                    </View>
                  </View>

                  {/* ================= STATUS-SPECIFIC SECTIONS ================= */}

                  {/* 1. Pending: Accept / Decline */}
                  {order.status === 'pending' && (
                    <View className="flex-row gap-2 pt-2 border-t border-[#F0F0EE]">
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ flex: 1 }}
                        onPress={() => farmerRejectOrder(order._id, 'Harvest capacity reached')}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        style={{ flex: 1 }}
                        leftIcon={<CheckCircle2 size={15} color="#ffffff" strokeWidth={2.5} />}
                        onPress={() => farmerAcceptOrder(order._id)}
                      >
                        Accept Order
                      </Button>
                    </View>
                  )}

                  {/* 2. Accepted: Advance to Preparing */}
                  {order.status === 'accepted' && (
                    <View className="pt-2 border-t border-[#F0F0EE]">
                      <Button
                        variant="primary"
                        fullWidth
                        size="sm"
                        leftIcon={<Package size={15} color="#ffffff" strokeWidth={2.5} />}
                        onPress={() =>
                          farmerUpdateOrderStatus(
                            order._id,
                            'preparing',
                            'Harvesting from field, grading and packing into crates'
                          )
                        }
                      >
                        Start Harvesting & Packing
                      </Button>
                    </View>
                  )}

                  {/* 3. Preparing: Advance to Ready for Pickup */}
                  {order.status === 'preparing' && (
                    <View className="pt-2 border-t border-[#F0F0EE] gap-1.5">
                      <View className="bg-[#FEF8EA] p-2 rounded-lg border border-[#FDE6B8]">
                        <Text className="text-[11px] text-[#92400E] font-medium text-center">
                          Currently Harvesting & Grading. Tap when produce is packed in crates.
                        </Text>
                      </View>
                      <Button
                        variant="primary"
                        fullWidth
                        size="sm"
                        leftIcon={<CheckCircle2 size={15} color="#ffffff" strokeWidth={2.5} />}
                        onPress={() =>
                          farmerUpdateOrderStatus(
                            order._id,
                            'ready_for_pickup',
                            isSelfPickup
                              ? `Harvest packed at farm gate, ready for buyer pickup. Bring PIN: ${order.pickupPin}`
                              : 'Packed into crates, weighed, and awaiting logistics fleet driver pickup'
                          )
                        }
                      >
                        Mark Ready for Pickup
                      </Button>
                    </View>
                  )}

                  {/* 4. Ready for Pickup: Actions depending on deliveryType */}
                  {order.status === 'ready_for_pickup' && (
                    <View className="pt-2 border-t border-[#F0F0EE] gap-2">
                      {isSelfPickup ? (
                        <View style={{ gap: 8 }}>
                          <View className="bg-[#EFF6FF] p-2.5 rounded-xl border border-[#BFDBFE]">
                            <View className="flex-row items-center justify-between">
                              <Text className="text-xs font-bold text-[#1D4ED8]">
                                Awaiting Buyer Farm Gate Pickup
                              </Text>
                              <View className="bg-white px-2 py-0.5 rounded border border-[#93C5FD]">
                                <Text className="text-xs font-black text-[#1D4ED8]">
                                  PIN: {order.pickupPin}
                                </Text>
                              </View>
                            </View>
                            <Text className="text-[10px] text-[#3B82F6] mt-1">
                              Verify buyer's 4-digit PIN upon arrival before handing over produce crates.
                            </Text>
                          </View>
                          <Button
                            variant="primary"
                            fullWidth
                            size="sm"
                            leftIcon={<UserCheck size={15} color="#ffffff" strokeWidth={2.5} />}
                            onPress={() => farmerConfirmPickupHandover(order._id)}
                          >
                            Confirm Farm Gate Handover
                          </Button>
                        </View>
                      ) : (
                        <View className="bg-[#ECFDF5] p-2.5 rounded-xl border border-[#A7F3D0]">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-xs font-bold text-[#065F46]">
                              {order.driverName ? 'Driver Assigned' : 'Awaiting Driver Dispatch'}
                            </Text>
                            <Truck size={15} color="#065F46" />
                          </View>
                          {order.driverName ? (
                            <View className="mt-1">
                              <Text className="text-xs font-semibold text-[#1A1A1A]">
                                {order.driverName} ({order.driverVehicle})
                              </Text>
                              <Text className="text-[10px] text-[#047857]">
                                En route to farm gate · {order.driverPhone}
                              </Text>
                            </View>
                          ) : (
                            <Text className="text-[11px] text-[#047857] mt-1">
                              Broadcasted to logistics drivers. A driver will accept and arrive shortly.
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  )}

                  {/* 5. Out for Delivery: Show Driver Info */}
                  {order.status === 'out_for_delivery' && (
                    <View className="bg-[#EFF6FF] p-2.5 rounded-xl border border-[#BFDBFE] gap-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs font-bold text-[#1D4ED8]">
                          In Transit with Logistics Driver
                        </Text>
                        <Truck size={14} color="#1D4ED8" />
                      </View>
                      <Text className="text-xs text-[#1E3A8A] font-semibold">
                        Driver: {order.driverName || 'Roshan Kaluarachchi'} ({order.driverVehicle || 'Truck'})
                      </Text>
                      <Text className="text-[10px] text-[#3B82F6]">
                        Heading to buyer destination: {order.deliveryAddress}
                      </Text>
                    </View>
                  )}

                  {/* 6. Delivered: Delivery Confirmation details reflected on Farmer dashboard */}
                  {order.status === 'delivered' && (
                    <View className="bg-[#F0FDF4] p-3 rounded-xl border border-[#BBF7D0] gap-1.5">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1.5">
                          <CheckCircle2 size={16} color="#15803D" strokeWidth={2.5} />
                          <Text className="text-xs font-black text-[#15803D]">
                            Delivery Completed & Confirmed
                          </Text>
                        </View>
                        <Text className="text-[10px] font-bold text-[#15803D]">
                          {order.deliveredAt || 'Settled'}
                        </Text>
                      </View>
                      <Text className="text-[11px] text-[#166534]">
                        Handed over by: <Text className="font-bold">{order.deliveredBy || order.driverName || 'Direct Handover'}</Text>
                      </Text>
                      {Boolean(order.deliveryProofNote) && (
                        <Text className="text-[10px] text-[#4ADE80] text-[#15803D] italic">
                          Proof note: "{order.deliveryProofNote}"
                        </Text>
                      )}
                      <Text className="text-[10px] font-bold text-[#15803D] mt-0.5">
                        ✓ Revenue settled to farm balance
                      </Text>
                    </View>
                  )}

                  {/* Live Route & Delivery Tracking Button */}
                  <Pressable
                    onPress={() => setTrackingOrder(order)}
                    className="flex-row items-center justify-between p-2.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] mt-1"
                  >
                    <View className="flex-row items-center gap-2">
                      <Truck size={15} color="#166534" />
                      <Text className="text-xs font-bold text-[#166534]">
                        Live Route & Delivery Tracking
                      </Text>
                    </View>
                    <Text className="text-[11px] font-extrabold text-[#166534]">
                      {order.status === 'out_for_delivery'
                        ? 'Live in Transit ↗'
                        : order.status === 'ready_for_pickup'
                        ? 'Driver Dispatched ↗'
                        : 'View Route ↗'}
                    </Text>
                  </Pressable>
                </Card>
              );
            })}
          </View>
        )}
      </View>

      {/* Farmer Live Route & Dispatch Tracking Modal */}
      {trackingOrder && (
        <Modal visible={true} animationType="slide" transparent>
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-3xl max-h-[90%] p-4 gap-3.5">
              {/* Header */}
              <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2.5">
                <View>
                  <Text className="text-sm font-black text-[#1A1A1A]">
                    Live Route & Dispatch Tracking
                  </Text>
                  <Text className="text-[11px] text-[#6B7280]">
                    {trackingOrder.orderNumber} · {trackingOrder.farmerName} → {trackingOrder.buyerName}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setTrackingOrder(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                >
                  <X size={18} color="#6B7280" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 30 }}>
                {/* Complete Live Route Map */}
                <View className="rounded-2xl overflow-hidden">
                  <OrderLiveRouteMap order={trackingOrder} height={230} />
                </View>

                {/* Fleet Driver Live Status Card */}
                <View className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] gap-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Truck size={16} color="#1D4ED8" />
                      <Text className="text-xs font-bold text-[#1E3A8A]">
                        Logistics Driver Dispatch
                      </Text>
                    </View>
                    <StatusPill status={trackingOrder.status} />
                  </View>

                  {trackingOrder.driverName ? (
                    <View className="flex-row items-center justify-between pt-1">
                      <View>
                        <Text className="text-xs font-black text-[#1A1A1A]">
                          {trackingOrder.driverName}
                        </Text>
                        <Text className="text-[11px] text-[#6B7280]">
                          {trackingOrder.driverVehicle || 'Light Truck'}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => Linking.openURL(`tel:${trackingOrder.driverPhone || '+94782345678'}`)}
                        className="flex-row items-center gap-1 bg-[#1D4ED8] px-3 py-1.5 rounded-xl"
                      >
                        <Phone size={12} color="#FFFFFF" />
                        <Text className="text-xs font-bold text-white">Call Driver</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Text className="text-xs text-[#1E3A8A]">
                      Order broadcasted to nearby fleet drivers. Awaiting driver assignment.
                    </Text>
                  )}
                </View>

                {/* Buyer Destination Info */}
                <View className="p-3 rounded-xl bg-slate-50 border border-slate-200 gap-1.5">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-bold text-[#1A1A1A]">
                      Destination: {trackingOrder.buyerName}
                    </Text>
                    <Pressable
                      onPress={() => Linking.openURL(`tel:${trackingOrder.buyerPhone}`)}
                      className="flex-row items-center gap-1 bg-slate-200 px-2.5 py-1 rounded-lg"
                    >
                      <Phone size={11} color="#1A1A1A" />
                      <Text className="text-[11px] font-bold text-[#1A1A1A]">Call Buyer</Text>
                    </Pressable>
                  </View>
                  <Text className="text-xs text-[#4B5563]">
                    {trackingOrder.deliveryAddress} ({trackingOrder.deliveryDistrict})
                  </Text>
                </View>

                {/* Full Dispatch & Preparation Chronological Log */}
                {trackingOrder.timeline && trackingOrder.timeline.length > 0 && (
                  <View className="p-3 rounded-xl bg-white border border-[#E5E7EB] gap-2">
                    <Text className="text-xs font-black text-[#1A1A1A] uppercase tracking-wide">
                      Live Dispatch Timeline ({trackingOrder.timeline.length} updates)
                    </Text>

                    <View className="gap-2 pt-1">
                      {trackingOrder.timeline.map((evt, idx) => {
                        const isFarmer = evt.status === 'pending' || evt.status === 'accepted' || evt.status === 'preparing';
                        return (
                          <View key={idx} className="flex-row items-start gap-2.5 border-b border-[#F0F0EE] pb-2 last:border-b-0">
                            <Text className="text-xs">{isFarmer ? '🌾' : '🚚'}</Text>
                            <View className="flex-1">
                              <View className="flex-row items-center justify-between">
                                <Text className="text-xs font-bold text-[#1A1A1A]">{evt.label}</Text>
                                <Text className="text-[10px] text-[#6B7280]">{evt.timestamp}</Text>
                              </View>
                              {Boolean(evt.note) && (
                                <Text className="text-[11px] text-[#4B5563] mt-0.5">{evt.note}</Text>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};
