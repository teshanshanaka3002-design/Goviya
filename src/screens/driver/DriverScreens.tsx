import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Linking,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import {
  Truck,
  MapPin,
  CheckCircle,
  Navigation,
  Phone,
  DollarSign,
  Clock,
  ShieldCheck,
  Check,
  AlertCircle,
  Package,
  ArrowRight,
  ChevronLeft,
  User,
  Star,
  Award,
  LogOut,
  Edit3,
  ExternalLink,
  Calendar,
  TrendingUp,
  X,
  SlidersHorizontal,
  CreditCard,
  FileText,
  Compass,
} from 'lucide-react-native';
import { useApp } from '../../services/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { SriLankaMap } from '../../components/shared/SriLankaMap';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProduceVisual } from '../../components/ui/ProduceVisual';
import { Avatar } from '../../components/ui/Avatar';
import { OrderLiveRouteMap } from '../../components/shared/OrderLiveRouteMap';
import { Order } from '../../types';

// Helper: Open Google Maps for a given location or query
const openGoogleMaps = (query: string, lat?: number, lng?: number) => {
  let url = '';
  if (lat && lng) {
    url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  } else {
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }
  Linking.openURL(url).catch(() => {
    Alert.alert('Map Error', 'Could not launch Google Maps on this device.');
  });
};

// Helper: Direct phone calling
const makePhoneCall = (phoneNumber: string) => {
  const clean = phoneNumber.replace(/\s+/g, '');
  Linking.openURL(`tel:${clean}`).catch(() => {
    Alert.alert('Call', `Direct call to ${phoneNumber}`);
  });
};

// ============================================================================
// 1. DETAIL SCREEN: DRIVER ORDER DETAIL & STEP-BY-STEP ACTIONS
// ============================================================================
interface DriverOrderDetailProps {
  orderId: string;
  onBack: () => void;
}

export const DriverOrderDetailScreen: React.FC<DriverOrderDetailProps> = ({
  orderId,
  onBack,
}) => {
  const {
    orders,
    currentUser,
    driverAcceptOrder,
    driverConfirmPickup,
    driverConfirmDelivery,
  } = useApp();

  const order = orders.find(o => o._id === orderId);
  const currentDriverId = currentUser?.role === 'driver' ? currentUser._id : 'user_driver_1';

  if (!order) {
    return (
      <View className="flex-1 bg-[#F6F7F5] p-4 items-center justify-center">
        <EmptyState
          title="Order Not Found"
          description="This delivery mission does not exist or has been removed."
          actionLabel="Back to Deliveries"
          onAction={onBack}
        />
      </View>
    );
  }

  const isAssignedToMe = order.driverId === currentDriverId;
  const isAvailable =
    order.deliveryType !== 'pickup' &&
    order.status === 'ready_for_pickup' &&
    (!order.driverId || order.driverId !== currentDriverId);

  const pickupLocationText =
    order.pickupLocation?.address || order.farmerAddress || `${order.farmerName}'s Farm, Nuwara Eliya`;
  const dropoffLocationText =
    order.deliveryAddress || `${order.deliveryDistrict}, Sri Lanka`;

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5]" contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Top Header Bar */}
      <View className="bg-white px-4 py-3 border-b border-[#E5E7EB] flex-row items-center justify-between">
        <Pressable
          onPress={onBack}
          className="flex-row items-center gap-1.5 p-1.5 -ml-1 rounded-lg active:bg-gray-100"
        >
          <ChevronLeft size={20} color="#1F5C3A" />
          <Text className="text-xs font-bold text-[#1F5C3A]">Back to Deliveries</Text>
        </Pressable>

        <StatusPill status={order.status} />
      </View>

      <View className="p-4 gap-4">
        {/* Order Header Summary */}
        <Card padding="md" className="gap-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-black text-[#1A1A1A]">{order.orderNumber}</Text>
              <Text className="text-[11px] text-[#6B7280]">
                Created on {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View className="bg-[#E6F2E8] px-3 py-1 rounded-full">
              <Text className="text-xs font-black text-[#1F5C3A]">
                Fee: LKR {order.deliveryFee?.toLocaleString() || '1,500'}
              </Text>
            </View>
          </View>

          {/* Driver's current location button option */}
          <Pressable
            onPress={() =>
              openGoogleMaps(
                currentUser?.location?.address || 'Kadawatha Logistics Hub, Western Province',
                currentUser?.location?.lat || 7.084,
                currentUser?.location?.lng || 80.0098
              )
            }
            className="flex-row items-center justify-between mt-2 p-2.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]"
          >
            <View className="flex-row items-center gap-2">
              <Compass size={16} color="#166534" />
              <Text className="text-xs font-bold text-[#166534]">
                My Fleet Location: {currentUser?.location?.district || 'Western Hub'}
              </Text>
            </View>
            <Text className="text-[11px] font-bold text-[#166534]">Open in Google Maps ↗</Text>
          </Pressable>
        </Card>

        {/* Complete Live Route Corridor Map (Farm Gate -> Fleet Driver -> Buyer Doorstep) */}
        <View style={{ borderRadius: 16, overflow: 'hidden' }}>
          <OrderLiveRouteMap order={order} height={230} />
        </View>

        {/* 1. PICKUP POINT (FARMER) */}
        <Card padding="md" className="gap-3 border-l-4 border-l-[#1F5C3A]">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-full bg-[#E6F2E8] items-center justify-center">
                <Text className="text-xs font-black text-[#1F5C3A]">1</Text>
              </View>
              <Text className="text-xs font-black text-[#1A1A1A]">PICKUP: Farm Gate</Text>
            </View>
            <Text className="text-[10px] font-bold text-[#B45309] bg-[#FEF8EA] px-2 py-0.5 rounded">
              Ready for Pickup
            </Text>
          </View>

          <View className="gap-1 pl-8">
            <Text className="text-sm font-bold text-[#1A1A1A]">{order.farmerName}</Text>
            <Text className="text-xs text-[#4B5563]">{pickupLocationText}</Text>
            {order.pickupLocation?.directions && (
              <Text className="text-[11px] text-[#6B7280] italic mt-0.5">
                Directions: {order.pickupLocation.directions}
              </Text>
            )}
            <Text className="text-[11px] text-[#1F5C3A] font-semibold mt-1">
              Pickup Window: {order.deliveryTimeSlot || 'Morning 8:00 AM - 12:00 PM'}
            </Text>
          </View>

          {/* Action Row for Pickup */}
          <View className="flex-row gap-2 mt-1">
            <Pressable
              onPress={() => makePhoneCall(order.farmerPhone)}
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 active:bg-slate-200"
            >
              <Phone size={14} color="#1A1A1A" />
              <Text className="text-xs font-bold text-[#1A1A1A]">Call Farmer</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                openGoogleMaps(
                  pickupLocationText,
                  order.pickupLocation?.lat,
                  order.pickupLocation?.lng
                )
              }
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#E6F2E8] border border-[#86EFAC] active:bg-[#DCFCE7]"
            >
              <Navigation size={14} color="#1F5C3A" />
              <Text className="text-xs font-bold text-[#1F5C3A]">Maps to Farm</Text>
            </Pressable>
          </View>
        </Card>

        {/* 2. DROP-OFF POINT (BUYER) */}
        <Card padding="md" className="gap-3 border-l-4 border-l-[#2563EB]">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-full bg-[#DBEAFE] items-center justify-center">
                <Text className="text-xs font-black text-[#1D4ED8]">2</Text>
              </View>
              <Text className="text-xs font-black text-[#1A1A1A]">DELIVERY: Buyer Doorstep</Text>
            </View>
            <Text className="text-[10px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded">
              {order.deliveryDistrict}
            </Text>
          </View>

          <View className="gap-1 pl-8">
            <Text className="text-sm font-bold text-[#1A1A1A]">{order.buyerName}</Text>
            <Text className="text-xs text-[#4B5563]">{dropoffLocationText}</Text>
            {order.deliveryNotes && (
              <Text className="text-[11px] text-[#6B7280] italic mt-0.5">
                Note: {order.deliveryNotes}
              </Text>
            )}
            <Text className="text-[11px] text-[#2563EB] font-semibold mt-1">
              Contact: {order.buyerPhone}
            </Text>
          </View>

          {/* Action Row for Drop-off */}
          <View className="flex-row gap-2 mt-1">
            <Pressable
              onPress={() => makePhoneCall(order.buyerPhone)}
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 active:bg-slate-200"
            >
              <Phone size={14} color="#1A1A1A" />
              <Text className="text-xs font-bold text-[#1A1A1A]">Call Buyer</Text>
            </Pressable>

            <Pressable
              onPress={() => openGoogleMaps(dropoffLocationText)}
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#DBEAFE] border border-[#93C5FD] active:bg-[#BFDBFE]"
            >
              <Navigation size={14} color="#1D4ED8" />
              <Text className="text-xs font-bold text-[#1D4ED8]">Maps to Buyer</Text>
            </Pressable>
          </View>
        </Card>

        {/* 3. PRODUCE CRATES / ITEMS */}
        <Card padding="md" className="gap-2.5">
          <Text className="text-xs font-black text-[#1A1A1A] uppercase tracking-wide">
            Crates & Harvest Cargo ({order.items.length} crops)
          </Text>

          {order.items.map((item, idx) => (
            <View
              key={idx}
              className="flex-row items-center justify-between py-2 border-b border-[#F0F0EE] last:border-b-0"
            >
              <View className="flex-row items-center gap-3">
                <ProduceVisual type={item.photoUrl || item.cropName} size="md" />
                <View>
                  <Text className="text-xs font-bold text-[#1A1A1A]">{item.cropName}</Text>
                  <Text className="text-[11px] text-[#6B7280]">
                    {item.quantityKg} kg @ LKR {item.pricePerKg}/kg
                  </Text>
                </View>
              </View>

              <Text className="text-xs font-black text-[#1F5C3A]">
                LKR {(item.quantityKg * item.pricePerKg).toLocaleString()}
              </Text>
            </View>
          ))}

          <View className="pt-2 border-t border-[#E5E7EB] flex-row items-center justify-between">
            <Text className="text-xs text-[#6B7280]">Payment Method</Text>
            <Text className="text-xs font-bold text-[#1A1A1A]">
              {order.paymentMethod === 'cash_on_delivery'
                ? 'Cash on Delivery (Collect from Buyer)'
                : 'Prepaid Digital / Card'}
            </Text>
          </View>
        </Card>

        {/* 4. DRIVER STEP ACTIONS */}
        <View className="mt-2 gap-2.5">
          {isAvailable && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => {
                driverAcceptOrder(order._id);
                Alert.alert('Delivery Accepted!', 'You have been assigned to this delivery mission.');
              }}
            >
              Accept Delivery Mission (+LKR 1,500)
            </Button>
          )}

          {isAssignedToMe && order.status === 'ready_for_pickup' && (
            <View className="gap-2">
              <Button
                variant="outline"
                size="md"
                fullWidth
                leftIcon={<Navigation size={16} color="#1F5C3A" />}
                onPress={() =>
                  openGoogleMaps(
                    pickupLocationText,
                    order.pickupLocation?.lat,
                    order.pickupLocation?.lng
                  )
                }
              >
                Navigate to Farm Gate (Google Maps)
              </Button>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<CheckCircle size={18} color="#FFFFFF" />}
                onPress={() => {
                  driverConfirmPickup(order._id);
                  Alert.alert('Pickup Confirmed', 'Crates verified and in transit to buyer!');
                }}
              >
                Confirm Pickup & Start Delivery
              </Button>
            </View>
          )}

          {isAssignedToMe && order.status === 'out_for_delivery' && (
            <View className="gap-2">
              <Button
                variant="outline"
                size="md"
                fullWidth
                leftIcon={<Navigation size={16} color="#1D4ED8" />}
                onPress={() => openGoogleMaps(dropoffLocationText)}
              >
                Navigate to Drop-off (Google Maps)
              </Button>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<CheckCircle size={18} color="#FFFFFF" />}
                onPress={() => {
                  driverConfirmDelivery(order._id, 'Delivered and verified by buyer');
                  Alert.alert('Delivery Successful!', 'Delivery completed! Payout added to your Earnings.');
                }}
              >
                Confirm Delivery & Handover
              </Button>
            </View>
          )}

          {order.status === 'delivered' && (
            <View className="bg-[#DCFCE7] p-3 rounded-xl border border-[#86EFAC] items-center">
              <Text className="text-xs font-black text-[#15803D]">
                ✓ Delivery Successfully Completed & Settled
              </Text>
              <Text className="text-[11px] text-[#166534] mt-0.5">
                Earnings of LKR 1,500 credited to driver balance
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

// ============================================================================
// 2. DELIVERIES TAB: AVAILABLE, ACTIVE, COMPLETED FILTER TABS
// ============================================================================
export const DriverDeliveriesScreen: React.FC = () => {
  const {
    orders,
    currentUser,
    driverAcceptOrder,
    driverConfirmPickup,
    driverConfirmDelivery,
    goToSubScreen,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'available' | 'active' | 'completed'>('available');
  const currentDriverId = currentUser?.role === 'driver' ? currentUser._id : 'user_driver_1';

  // Available ready-for-pickup orders near the driver
  const availablePickups = orders.filter(
    o =>
      o.deliveryType !== 'pickup' &&
      o.status === 'ready_for_pickup' &&
      (!o.driverId || o.driverId !== currentDriverId)
  );

  // Active trips assigned to this driver
  const activeTrips = orders.filter(
    o =>
      o.deliveryType !== 'pickup' &&
      o.driverId === currentDriverId &&
      (o.status === 'ready_for_pickup' || o.status === 'out_for_delivery')
  );

  // Completed deliveries
  const completedDeliveries = orders.filter(
    o =>
      o.deliveryType !== 'pickup' &&
      o.status === 'delivered' &&
      (o.driverId === currentDriverId || !o.driverId)
  );

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="gap-4">
        {/* Filter Pills Header */}
        <View className="flex-row bg-white p-1 rounded-2xl border border-[#E5E7EB]">
          <Pressable
            onPress={() => setActiveFilter('available')}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center flex-row gap-1.5 ${
              activeFilter === 'available' ? 'bg-[#1F5C3A]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeFilter === 'available' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Available
            </Text>
            {availablePickups.length > 0 && (
              <View
                className={`px-1.5 py-0.2 rounded-full ${
                  activeFilter === 'available' ? 'bg-[#FFFFFF]/25' : 'bg-amber-100'
                }`}
              >
                <Text
                  className={`text-[10px] font-black ${
                    activeFilter === 'available' ? 'text-white' : 'text-amber-800'
                  }`}
                >
                  {availablePickups.length}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('active')}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center flex-row gap-1.5 ${
              activeFilter === 'active' ? 'bg-[#1F5C3A]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeFilter === 'active' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Active
            </Text>
            {activeTrips.length > 0 && (
              <View
                className={`px-1.5 py-0.2 rounded-full ${
                  activeFilter === 'active' ? 'bg-[#FFFFFF]/25' : 'bg-emerald-100'
                }`}
              >
                <Text
                  className={`text-[10px] font-black ${
                    activeFilter === 'active' ? 'text-white' : 'text-emerald-800'
                  }`}
                >
                  {activeTrips.length}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('completed')}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center flex-row gap-1.5 ${
              activeFilter === 'completed' ? 'bg-[#1F5C3A]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeFilter === 'completed' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Completed
            </Text>
            <View
              className={`px-1.5 py-0.2 rounded-full ${
                activeFilter === 'completed' ? 'bg-[#FFFFFF]/25' : 'bg-slate-100'
              }`}
            >
              <Text
                className={`text-[10px] font-black ${
                  activeFilter === 'completed' ? 'text-white' : 'text-slate-700'
                }`}
              >
                {completedDeliveries.length}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* 1. AVAILABLE TAB CONTENT */}
        {activeFilter === 'available' && (
          <View className="gap-3">
            <Text className="text-xs font-black text-[#1A1A1A] uppercase tracking-wide">
              Ready-for-Pickup Deliveries Near You ({availablePickups.length})
            </Text>

            {availablePickups.length === 0 ? (
              <EmptyState
                title="No Deliveries Available"
                description="Orders packed and ready for pickup at farm gates will appear here automatically."
              />
            ) : (
              availablePickups.map(order => {
                const totalKg = order.items.reduce((s, i) => s + i.quantityKg, 0);
                const pickupLoc = order.pickupLocation?.address || order.farmerAddress;
                return (
                  <Card
                    key={order._id}
                    padding="md"
                    className="gap-3 border border-[#E5E7EB] active:border-[#1F5C3A]"
                    onPress={() => goToSubScreen('driver_order_detail', { orderId: order._id })}
                  >
                    <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
                      <View>
                        <Text className="text-xs font-black text-[#1A1A1A]">{order.orderNumber}</Text>
                        <Text className="text-[11px] text-[#6B7280]">
                          Farmer: <Text className="font-bold text-[#1A1A1A]">{order.farmerName}</Text>
                        </Text>
                      </View>
                      <View className="bg-[#E6F2E8] px-2.5 py-1 rounded-full">
                        <Text className="text-xs font-black text-[#1F5C3A]">
                          +LKR {order.deliveryFee?.toLocaleString() || '1,500'}
                        </Text>
                      </View>
                    </View>

                    {/* Route Info */}
                    <View className="gap-1.5">
                      <View className="flex-row items-start gap-2">
                        <MapPin size={15} color="#1F5C3A" className="mt-0.5" />
                        <View className="flex-1">
                          <Text className="text-xs font-bold text-[#1A1A1A]">Pickup:</Text>
                          <Text className="text-xs text-[#4B5563]">{pickupLoc}</Text>
                        </View>
                      </View>

                      <View className="flex-row items-start gap-2">
                        <Navigation size={15} color="#2563EB" className="mt-0.5" />
                        <View className="flex-1">
                          <Text className="text-xs font-bold text-[#1A1A1A]">Deliver to:</Text>
                          <Text className="text-xs text-[#4B5563]">
                            {order.deliveryAddress} ({order.deliveryDistrict})
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Crop Summary */}
                    <View className="bg-slate-50 p-2.5 rounded-xl flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Package size={16} color="#6B7280" />
                        <Text className="text-xs text-[#374151]">
                          {order.items[0]?.cropName}
                          {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''} · {totalKg} kg
                        </Text>
                      </View>
                      <Text className="text-[10px] font-bold text-[#B45309]">~14 km route</Text>
                    </View>

                    {/* Card Actions */}
                    <View className="flex-row gap-2 pt-1">
                      <Pressable
                        onPress={() => goToSubScreen('driver_order_detail', { orderId: order._id })}
                        className="flex-1 py-2 rounded-xl bg-slate-100 items-center justify-center"
                      >
                        <Text className="text-xs font-bold text-[#374151]">View Details</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          driverAcceptOrder(order._id);
                          Alert.alert('Delivery Accepted', 'Assigned to your fleet. Please head to pickup point.');
                        }}
                        className="flex-1 py-2 rounded-xl bg-[#1F5C3A] items-center justify-center active:bg-[#18492E]"
                      >
                        <Text className="text-xs font-bold text-white">Accept Job</Text>
                      </Pressable>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        )}

        {/* 2. ACTIVE TAB CONTENT */}
        {activeFilter === 'active' && (
          <View className="gap-3">
            <Text className="text-xs font-black text-[#1A1A1A] uppercase tracking-wide">
              Active Missions ({activeTrips.length})
            </Text>

            {activeTrips.length === 0 ? (
              <EmptyState
                title="No Active Missions"
                description="Accept an available delivery job to start your transit corridor."
                actionLabel="Browse Available Jobs"
                onAction={() => setActiveFilter('available')}
              />
            ) : (
              activeTrips.map(order => {
                const isHeadingToPickup = order.status === 'ready_for_pickup';
                const pickupLoc = order.pickupLocation?.address || order.farmerAddress;

                return (
                  <Card
                    key={order._id}
                    padding="md"
                    className="gap-3.5 border-2 border-[#1F5C3A]"
                    onPress={() => goToSubScreen('driver_order_detail', { orderId: order._id })}
                  >
                    <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
                      <View>
                        <Text className="text-xs font-black text-[#1A1A1A]">{order.orderNumber}</Text>
                        <Text className="text-[11px] font-bold text-[#1F5C3A]">
                          {isHeadingToPickup ? 'Step 1: Heading to Farm' : 'Step 2: On Route to Buyer'}
                        </Text>
                      </View>
                      <StatusPill status={order.status} />
                    </View>

                    {/* Step-by-step indicator bar */}
                    <View className="bg-slate-100 p-2.5 rounded-xl">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[11px] font-bold text-[#1A1A1A]">
                          {isHeadingToPickup ? 'Pickup: ' + order.farmerName : 'Drop-off: ' + order.buyerName}
                        </Text>
                        <Text className="text-[11px] font-black text-[#1F5C3A]">
                          LKR {order.deliveryFee?.toLocaleString() || '1,500'}
                        </Text>
                      </View>
                      <Text className="text-xs text-[#4B5563] mt-0.5">
                        {isHeadingToPickup ? pickupLoc : order.deliveryAddress}
                      </Text>
                    </View>

                    {/* Contact Buttons */}
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => makePhoneCall(isHeadingToPickup ? order.farmerPhone : order.buyerPhone)}
                        className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100"
                      >
                        <Phone size={14} color="#1A1A1A" />
                        <Text className="text-xs font-bold text-[#1A1A1A]">
                          Call {isHeadingToPickup ? 'Farmer' : 'Buyer'}
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          openGoogleMaps(
                            isHeadingToPickup ? pickupLoc : order.deliveryAddress,
                            order.pickupLocation?.lat,
                            order.pickupLocation?.lng
                          )
                        }
                        className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#DBEAFE]"
                      >
                        <Navigation size={14} color="#1D4ED8" />
                        <Text className="text-xs font-bold text-[#1D4ED8]">Navigate (Maps)</Text>
                      </Pressable>
                    </View>

                    {/* Action Execution Button */}
                    {isHeadingToPickup ? (
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        leftIcon={<CheckCircle size={16} color="#FFFFFF" />}
                        onPress={() => {
                          driverConfirmPickup(order._id);
                          Alert.alert('Pickup Confirmed', 'Harvest is now Out for Delivery!');
                        }}
                      >
                        Confirm Farm Pickup
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        leftIcon={<CheckCircle size={16} color="#FFFFFF" />}
                        onPress={() => {
                          driverConfirmDelivery(order._id);
                          Alert.alert('Delivery Finished', 'Handover confirmed! Payment recorded.');
                        }}
                      >
                        Confirm Buyer Delivery
                      </Button>
                    )}
                  </Card>
                );
              })
            )}
          </View>
        )}

        {/* 3. COMPLETED TAB CONTENT */}
        {activeFilter === 'completed' && (
          <View className="gap-3">
            <Text className="text-xs font-black text-[#1A1A1A] uppercase tracking-wide">
              Completed Deliveries History ({completedDeliveries.length})
            </Text>

            {completedDeliveries.length === 0 ? (
              <EmptyState
                title="No Completed Deliveries Yet"
                description="Past deliveries will be archived here with full payment records."
              />
            ) : (
              completedDeliveries.map(order => (
                <Card
                  key={order._id}
                  padding="md"
                  className="gap-2.5 border border-[#E5E7EB]"
                  onPress={() => goToSubScreen('driver_order_detail', { orderId: order._id })}
                >
                  <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
                    <View>
                      <Text className="text-xs font-black text-[#1A1A1A]">{order.orderNumber}</Text>
                      <Text className="text-[10px] text-[#6B7280]">
                        {order.deliveredAt || new Date(order.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="bg-[#DCFCE7] px-2.5 py-1 rounded-full border border-[#86EFAC]">
                      <Text className="text-xs font-black text-[#15803D]">
                        +LKR {order.deliveryFee?.toLocaleString() || '1,500'} Paid
                      </Text>
                    </View>
                  </View>

                  <View className="gap-1">
                    <Text className="text-xs text-[#4B5563]">
                      Route: {order.farmerName} ({order.farmerAddress?.split(',')[0]}) → {order.buyerName} ({order.deliveryDistrict})
                    </Text>
                    <Text className="text-[11px] text-[#15803D] font-medium">
                      ✓ Handover confirmed at destination
                    </Text>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// ============================================================================
// 3. EARNINGS TAB: SUMMARY CARDS, TIMELINE CHART, SETTLED DELIVERIES
// ============================================================================
export const DriverEarningsScreen: React.FC = () => {
  const { orders, currentUser } = useApp();
  const currentDriverId = currentUser?.role === 'driver' ? currentUser._id : 'user_driver_1';

  const completedDeliveries = orders.filter(
    o =>
      o.deliveryType !== 'pickup' &&
      o.status === 'delivered' &&
      (o.driverId === currentDriverId || !o.driverId)
  );

  const deliveryEarnedTotal = completedDeliveries.reduce(
    (sum, o) => sum + (o.deliveryFee || 1500),
    0
  );

  const todayEarnings = 4500 + deliveryEarnedTotal;
  const weekEarnings = 32500 + deliveryEarnedTotal;
  const monthEarnings = 118500 + deliveryEarnedTotal;

  // 7-day earnings bars for chart
  const weekChartData = [
    { day: 'Mon', amount: 4500, height: 45 },
    { day: 'Tue', amount: 6000, height: 60 },
    { day: 'Wed', amount: 7500, height: 75 },
    { day: 'Thu', amount: 6000, height: 60 },
    { day: 'Fri', amount: 9000, height: 90 },
    { day: 'Sat', amount: 10500, height: 100 },
    { day: 'Sun (Today)', amount: todayEarnings, height: 85, isToday: true },
  ];

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="gap-4">
        {/* Earnings Summary Cards */}
        <View className="flex-row gap-2.5">
          <Card variant="mint" padding="sm" className="flex-1">
            <Text className="text-[10px] uppercase font-bold text-[#4B6B56]">Today's Earnings</Text>
            <Text className="text-base font-black text-[#1F5C3A] mt-1">
              LKR {todayEarnings.toLocaleString()}
            </Text>
            <Text className="text-[9px] text-[#4B6B56] mt-0.5">Live payout balance</Text>
          </Card>

          <Card padding="sm" className="flex-1">
            <Text className="text-[10px] uppercase font-bold text-[#6B7280]">This Week</Text>
            <Text className="text-base font-black text-[#1A1A1A] mt-1">
              LKR {weekEarnings.toLocaleString()}
            </Text>
            <Text className="text-[9px] text-[#19768A] mt-0.5">24 completed trips</Text>
          </Card>

          <Card padding="sm" className="flex-1">
            <Text className="text-[10px] uppercase font-bold text-[#6B7280]">This Month</Text>
            <Text className="text-base font-black text-[#1A1A1A] mt-1">
              LKR {monthEarnings.toLocaleString()}
            </Text>
            <Text className="text-[9px] text-[#B45309] mt-0.5">Fleet rank: Top 5%</Text>
          </Card>
        </View>

        {/* Weekly Performance Bar Chart */}
        <Card padding="md" className="gap-3">
          <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
            <View>
              <Text className="text-xs font-black text-[#1A1A1A]">Earnings Over Time</Text>
              <Text className="text-[10px] text-[#6B7280]">Past 7 days fleet performance</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-[#E6F2E8] px-2 py-0.5 rounded">
              <TrendingUp size={12} color="#1F5C3A" />
              <Text className="text-[10px] font-black text-[#1F5C3A]">+18.5% vs last week</Text>
            </View>
          </View>

          {/* Simple Visual Bar Chart */}
          <View className="h-32 flex-row items-end justify-between px-2 pt-4">
            {weekChartData.map((d, idx) => (
              <View key={idx} className="items-center flex-1 gap-1.5">
                <Text className="text-[9px] font-bold text-[#6B7280]">
                  {(d.amount / 1000).toFixed(1)}k
                </Text>
                <View
                  style={{ height: d.height }}
                  className={`w-7 rounded-t-lg ${
                    d.isToday ? 'bg-[#1F5C3A]' : 'bg-[#93C5FD]'
                  }`}
                />
                <Text
                  className={`text-[9px] font-bold ${
                    d.isToday ? 'text-[#1F5C3A]' : 'text-[#6B7280]'
                  }`}
                >
                  {d.day.split(' ')[0]}
                </Text>
              </View>
            ))}
          </View>

          {/* Bank Transfer Status */}
          <View className="flex-row items-center justify-between pt-2 border-t border-[#F0F0EE] bg-slate-50 -mx-4 -mb-4 p-3 rounded-b-2xl">
            <View className="flex-row items-center gap-2">
              <CreditCard size={15} color="#1F5C3A" />
              <Text className="text-[11px] text-[#374151]">
                Auto-payout: Commercial Bank (Acc ***8824)
              </Text>
            </View>
            <Text className="text-[11px] font-black text-[#1F5C3A]">Weekly</Text>
          </View>
        </Card>

        {/* List of Completed Deliveries Below */}
        <View className="gap-2.5">
          <Text className="text-xs font-black text-[#1A1A1A] uppercase tracking-wide">
            Settled Delivery Records ({completedDeliveries.length})
          </Text>

          {completedDeliveries.map(order => (
            <Card key={order._id} padding="md" className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-black text-[#1A1A1A]">{order.orderNumber}</Text>
                <Text className="text-xs font-black text-[#15803D]">
                  +LKR {order.deliveryFee?.toLocaleString() || '1,500'}
                </Text>
              </View>

              <Text className="text-[11px] text-[#6B7280]">
                {order.farmerName} → {order.buyerName} ({order.deliveryDistrict})
              </Text>
              <Text className="text-[10px] text-[#15803D] font-bold">
                ✓ Settled on {order.deliveredAt || 'Today'}
              </Text>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// ============================================================================
// 4. PROFILE TAB: DRIVER DETAILS, ONLINE/OFFLINE TOGGLE, EDIT MODAL, LOGOUT
// ============================================================================
export const DriverProfileScreen: React.FC = () => {
  const { currentUser, orders, updateCurrentUser, logout } = useApp();
  const [isOnline, setIsOnline] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit fields
  const [name, setName] = useState(currentUser?.name || 'Roshan Kaluarachchi');
  const [phone, setPhone] = useState(currentUser?.phone || '+94 78 234 5678');
  const [vehicleType, setVehicleType] = useState(
    currentUser?.vehicleType || 'Light Truck (Dimas)'
  );
  const [vehiclePlate, setVehiclePlate] = useState(
    currentUser?.vehiclePlate || 'WP - LG 8824'
  );

  const completedDeliveriesCount = orders.filter(
    o => o.deliveryType !== 'pickup' && o.status === 'delivered'
  ).length;

  const handleSaveProfile = () => {
    updateCurrentUser({
      name: name.trim(),
      phone: phone.trim(),
      vehicleType: vehicleType as any,
      vehiclePlate: vehiclePlate.trim().toUpperCase(),
    });
    setShowEditModal(false);
    Alert.alert('Profile Saved', 'Your driver fleet profile has been updated successfully.');
  };

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="gap-4">
        {/* Profile Card Header */}
        <Card padding="lg" className="items-center gap-3">
          <View className="relative">
            <Avatar name={currentUser?.name || 'Roshan'} size="xl" />
            <View className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#1F5C3A] items-center justify-center border-2 border-white">
              <Truck size={12} color="#FFFFFF" />
            </View>
          </View>

          <View className="items-center">
            <Text className="text-base font-extrabold text-[#1A1A1A]">
              {currentUser?.name || 'Roshan Kaluarachchi'}
            </Text>
            <Text className="text-xs text-[#6B7280]">{currentUser?.phone || '+94 78 234 5678'}</Text>
            <View className="flex-row items-center gap-1 mt-1 bg-[#E6F2E8] px-2.5 py-0.5 rounded-full">
              <ShieldCheck size={12} color="#1F5C3A" />
              <Text className="text-[10px] font-bold text-[#1F5C3A]">Verified Logistics Partner</Text>
            </View>
          </View>
        </Card>

        {/* Online / Offline Availability Toggle */}
        <Card padding="md" className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <View
              className={`w-3.5 h-3.5 rounded-full ${
                isOnline ? 'bg-[#1F5C3A]' : 'bg-[#9CA3AF]'
              }`}
            />
            <View>
              <Text className="text-xs font-bold text-[#1A1A1A]">
                Dispatch Status: {isOnline ? 'Online · Accepting Deliveries' : 'Offline · On Break'}
              </Text>
              <Text className="text-[11px] text-[#6B7280]">
                {isOnline ? 'Visible to dispatch centers in Western & Central hubs' : 'Not receiving new pickup alerts'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setIsOnline(!isOnline)}
            className={`px-3 py-1.5 rounded-xl ${
              isOnline ? 'bg-[#E6F2E8]' : 'bg-slate-100'
            }`}
          >
            <Text className={`text-xs font-bold ${isOnline ? 'text-[#1F5C3A]' : 'text-[#6B7280]'}`}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Text>
          </Pressable>
        </Card>

        {/* Vehicle & Fleet Info */}
        <Card padding="md" className="gap-2.5">
          <Text className="text-xs font-black text-[#1A1A1A] uppercase tracking-wide">
            Fleet Vehicle Details
          </Text>

          <View className="flex-row items-center justify-between py-1.5 border-b border-[#F0F0EE]">
            <Text className="text-xs text-[#6B7280]">Vehicle Type</Text>
            <Text className="text-xs font-bold text-[#1A1A1A]">
              {currentUser?.vehicleType || 'Light Truck (Dimas)'}
            </Text>
          </View>

          <View className="flex-row items-center justify-between py-1.5 border-b border-[#F0F0EE]">
            <Text className="text-xs text-[#6B7280]">Plate Number</Text>
            <Text className="text-xs font-bold text-[#1A1A1A]">
              {currentUser?.vehiclePlate || 'WP - LG 8824'}
            </Text>
          </View>

          <View className="flex-row items-center justify-between py-1.5">
            <Text className="text-xs text-[#6B7280]">Operating Hub</Text>
            <Text className="text-xs font-bold text-[#1A1A1A]">Kadawatha Express Hub, Western</Text>
          </View>
        </Card>

        {/* Performance Statistics */}
        <View className="flex-row gap-2.5">
          <Card padding="md" className="flex-1 items-center gap-1">
            <View className="flex-row items-center gap-1">
              <Star size={16} color="#EAB308" fill="#EAB308" />
              <Text className="text-base font-black text-[#1A1A1A]">4.95</Text>
            </View>
            <Text className="text-[10px] text-[#6B7280]">215 Ratings</Text>
          </Card>

          <Card padding="md" className="flex-1 items-center gap-1">
            <Text className="text-base font-black text-[#1F5C3A]">
              {215 + completedDeliveriesCount}
            </Text>
            <Text className="text-[10px] text-[#6B7280]">Deliveries Done</Text>
          </Card>

          <Card padding="md" className="flex-1 items-center gap-1">
            <Text className="text-base font-black text-[#1D4ED8]">99.4%</Text>
            <Text className="text-[10px] text-[#6B7280]">On-Time Rate</Text>
          </Card>
        </View>

        {/* Action Buttons */}
        <View className="gap-2.5 mt-2">
          <Button
            variant="outline"
            size="md"
            fullWidth
            leftIcon={<Edit3 size={16} color="#1F5C3A" />}
            onPress={() => setShowEditModal(true)}
          >
            Edit Profile
          </Button>

          <Button
            variant="destructive"
            size="md"
            fullWidth
            leftIcon={<LogOut size={16} color="#FFFFFF" />}
            onPress={() => {
              Alert.alert('Sign Out', 'Are you sure you want to log out of Goviya Logistics Fleet?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Log Out',
                  style: 'destructive',
                  onPress: () => logout(),
                },
              ]);
            }}
          >
            Log Out
          </Button>
        </View>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 gap-4">
            <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-3">
              <Text className="text-sm font-black text-[#1A1A1A]">Edit Driver Fleet Profile</Text>
              <Pressable onPress={() => setShowEditModal(false)}>
                <X size={20} color="#6B7280" />
              </Pressable>
            </View>

            <View className="gap-3">
              <View>
                <Text className="text-xs font-bold text-[#1A1A1A] mb-1">Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  className="border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs text-[#1A1A1A]"
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-[#1A1A1A] mb-1">Phone Number</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  className="border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs text-[#1A1A1A]"
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-[#1A1A1A] mb-1">Vehicle Type</Text>
                <TextInput
                  value={vehicleType}
                  onChangeText={(val) => setVehicleType(val as any)}
                  className="border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs text-[#1A1A1A]"
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-[#1A1A1A] mb-1">Vehicle Plate Number</Text>
                <TextInput
                  value={vehiclePlate}
                  onChangeText={setVehiclePlate}
                  className="border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs text-[#1A1A1A]"
                />
              </View>
            </View>

            <Button variant="primary" size="lg" fullWidth onPress={handleSaveProfile}>
              Save Profile Changes
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ============================================================================
// 5. HOME TAB: AVAILABLE DELIVERIES & CORRIDOR MAP
// ============================================================================
export const DriverHomeScreen: React.FC = () => {
  const { orders, currentUser, goToSubScreen } = useApp();
  const currentDriverId = currentUser?.role === 'driver' ? currentUser._id : 'user_driver_1';

  // Available Pickup Jobs
  const availablePickups = orders.filter(
    o =>
      o.deliveryType !== 'pickup' &&
      o.status === 'ready_for_pickup' &&
      (!o.driverId || o.driverId !== currentDriverId)
  );

  // Active Trips
  const activeTrips = orders.filter(
    o =>
      o.deliveryType !== 'pickup' &&
      o.driverId === currentDriverId &&
      (o.status === 'ready_for_pickup' || o.status === 'out_for_delivery')
  );

  const completedDeliveries = orders.filter(
    o =>
      o.deliveryType !== 'pickup' &&
      o.status === 'delivered' &&
      (o.driverId === currentDriverId || !o.driverId)
  );

  const todayEarnings = 4850 + completedDeliveries.length * 1500;

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="gap-4">
        {/* Fleet Header Card */}
        <Card padding="md" className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5 flex-1">
            <View className="w-3.5 h-3.5 rounded-full bg-[#1F5C3A]" />
            <View className="flex-1">
              <Text className="text-xs font-black text-[#1A1A1A]">
                Fleet Status: Online · Dispatch Ready
              </Text>
              <Text className="text-[10px] text-[#6B7280]">
                {currentUser?.name || 'Roshan Kaluarachchi'} · {currentUser?.vehiclePlate || 'WP - LG 8824'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() =>
              openGoogleMaps(
                currentUser?.location?.address || 'Kadawatha Logistics Hub',
                currentUser?.location?.lat,
                currentUser?.location?.lng
              )
            }
            className="flex-row items-center gap-1 bg-[#E6F2E8] px-2.5 py-1.5 rounded-xl border border-[#86EFAC]"
          >
            <Compass size={13} color="#1F5C3A" />
            <Text className="text-[10px] font-bold text-[#1F5C3A]">My Location</Text>
          </Pressable>
        </Card>

        {/* Metrics Row */}
        <View className="flex-row gap-2.5">
          <Card variant="mint" padding="sm" className="flex-1">
            <Text className="text-[10px] uppercase font-bold text-[#4B6B56]">Today's Pay</Text>
            <Text className="text-base font-black text-[#1F5C3A] mt-0.5">
              LKR {todayEarnings.toLocaleString()}
            </Text>
            <Text className="text-[9px] text-[#4B6B56]">LKR 1,500 / trip</Text>
          </Card>

          <Card padding="sm" className="flex-1">
            <Text className="text-[10px] uppercase font-bold text-[#6B7280]">Active Trips</Text>
            <Text className="text-base font-black text-[#1A1A1A] mt-0.5">{activeTrips.length}</Text>
            <Text className="text-[9px] text-[#19768A]">In transit</Text>
          </Card>

          <Card padding="sm" className="flex-1">
            <Text className="text-[10px] uppercase font-bold text-[#6B7280]">Available</Text>
            <Text className="text-base font-black text-[#B45309] mt-0.5">
              {availablePickups.length}
            </Text>
            <Text className="text-[9px] text-[#B45309]">Ready at farm</Text>
          </Card>
        </View>

        {/* Active Mission Banner (if active) */}
        {activeTrips.length > 0 && (
          <Card
            padding="md"
            className="border-2 border-[#1F5C3A] bg-[#F0FDF4] gap-2"
            onPress={() => goToSubScreen('driver_order_detail', { orderId: activeTrips[0]._id })}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Truck size={16} color="#1F5C3A" />
                <Text className="text-xs font-black text-[#1F5C3A]">Active Mission in Progress</Text>
              </View>
              <Text className="text-[10px] font-bold text-[#1F5C3A]">Tap to Manage →</Text>
            </View>
            <Text className="text-xs font-bold text-[#1A1A1A]">
              {activeTrips[0].farmerName} → {activeTrips[0].buyerName} ({activeTrips[0].deliveryDistrict})
            </Text>
          </Card>
        )}

        {/* Available Deliveries List */}
        <View className="gap-2.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-black text-[#1A1A1A] uppercase tracking-wide">
              Available Pickup Jobs Near You ({availablePickups.length})
            </Text>
            <Text className="text-[10px] text-[#6B7280]">Tap for details & maps</Text>
          </View>

          {availablePickups.length === 0 ? (
            <EmptyState
              title="No Pickups Waiting"
              description="When farmers mark batches ready for pickup, they will appear here instantly."
            />
          ) : (
            availablePickups.map(order => {
              const totalKg = order.items.reduce((s, i) => s + i.quantityKg, 0);
              const pickupLoc = order.pickupLocation?.address || order.farmerAddress;

              return (
                <Card
                  key={order._id}
                  padding="md"
                  className="gap-2.5 border border-[#E5E7EB] active:border-[#1F5C3A]"
                  onPress={() => goToSubScreen('driver_order_detail', { orderId: order._id })}
                >
                  <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
                    <View>
                      <Text className="text-xs font-black text-[#1A1A1A]">{order.orderNumber}</Text>
                      <Text className="text-[10px] text-[#6B7280]">
                        Pickup: {order.farmerName} ({order.pickupLocation?.town || 'Farm Gate'})
                      </Text>
                    </View>
                    <View className="bg-[#E6F2E8] px-2 py-0.5 rounded-full">
                      <Text className="text-xs font-black text-[#1F5C3A]">
                        +LKR {order.deliveryFee?.toLocaleString() || '1,500'}
                      </Text>
                    </View>
                  </View>

                  <View className="gap-1">
                    <Text className="text-xs text-[#374151]">
                      Deliver to: <Text className="font-bold">{order.buyerName}</Text> ({order.deliveryDistrict})
                    </Text>
                    <Text className="text-[11px] text-[#6B7280]">
                      {order.items[0]?.cropName} · {totalKg} kg
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between pt-1">
                    <Text className="text-[10px] font-bold text-[#1F5C3A]">
                      View Details & Google Maps →
                    </Text>
                    <Text className="text-[10px] text-[#6B7280]">Ready now</Text>
                  </View>
                </Card>
              );
            })
          )}
        </View>

        {/* Dispatch Route Corridor Map */}
        <View className="gap-2">
          <Text className="text-xs font-black text-[#1A1A1A] uppercase tracking-wide">
            Transit Corridors & Waypoints
          </Text>
          <SriLankaMap
            showRoute
            routeTitle="Highland to Western Province Dispatch"
            markers={orders
              .filter(o => o.deliveryType !== 'pickup' && (o.status === 'ready_for_pickup' || o.status === 'out_for_delivery'))
              .map(o => ({
                id: o._id,
                name: o.farmerName,
                district: o.deliveryDistrict,
                town: o.farmerAddress,
                lat: 6.9697,
                lng: 80.7891,
                type: 'driver',
              }))}
          />
        </View>
      </View>
    </ScrollView>
  );
};

// ============================================================================
// 6. MAIN DRIVER SCREENS ROUTER
// ============================================================================
export const DriverScreens: React.FC = () => {
  const { navState, goBack } = useApp();

  // If order detail subscreen is open
  if (navState.subScreen === 'driver_order_detail' && navState.selectedOrderId) {
    return <DriverOrderDetailScreen orderId={navState.selectedOrderId} onBack={goBack} />;
  }

  // Route by bottom nav tab
  switch (navState.activeTab) {
    case 'home':
      return <DriverHomeScreen />;
    case 'deliveries':
      return <DriverDeliveriesScreen />;
    case 'earnings':
      return <DriverEarningsScreen />;
    case 'profile':
      return <DriverProfileScreen />;
    default:
      return <DriverHomeScreen />;
  }
};

export default DriverScreens;
