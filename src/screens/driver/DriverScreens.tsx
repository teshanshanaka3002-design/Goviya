import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking, Image } from 'react-native';
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
  Layers,
  Sparkles,
} from 'lucide-react-native';
import { useApp } from '../../services/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { SriLankaMap } from '../../components/shared/SriLankaMap';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProduceVisual } from '../../components/ui/ProduceVisual';
import { Avatar } from '../../components/ui/Avatar';
import { Order } from '../../types';
import { isValidPhotoUrl } from '../../services/imageService';

export const DriverHomeScreen: React.FC = () => {
  const {
    orders,
    currentUser,
    driverAcceptOrder,
    driverConfirmPickup,
    driverConfirmDelivery,
  } = useApp();

  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');

  const currentDriverId = currentUser?.role === 'driver' ? currentUser._id : 'user_driver_1';

  // 1. Available Pickup Jobs: Orders marked ready_for_pickup, deliveryType !== 'pickup', and not yet assigned to a driver
  const availablePickups = orders.filter(
    o => o.deliveryType !== 'pickup' && o.status === 'ready_for_pickup' && (!o.driverId || o.driverId !== currentDriverId)
  );

  // 2. Active Trips: Orders accepted by this driver, either ready_for_pickup (heading to farm) or out_for_delivery (heading to buyer)
  const activeTrips = orders.filter(
    o =>
      o.deliveryType !== 'pickup' &&
      o.driverId === currentDriverId &&
      (o.status === 'ready_for_pickup' || o.status === 'out_for_delivery')
  );

  // 3. Completed: Delivered orders by this driver or completed platform deliveries
  const completedDeliveries = orders.filter(
    o => o.deliveryType !== 'pickup' && o.status === 'delivered' && (o.driverId === currentDriverId || !o.driverId)
  );

  const todayEarnings = 4850 + completedDeliveries.length * 1500;

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={{ gap: 14 }}>
        {/* Availability Status Card */}
        <Card padding="md" className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5 flex-1">
            <View
              className={`w-3.5 h-3.5 rounded-full ${
                isOnline ? 'bg-[#1F5C3A]' : 'bg-[#9CA3AF]'
              }`}
            />
            <View className="flex-1">
              <Text className="text-xs font-black text-[#1A1A1A]">
                Fleet Status: {isOnline ? 'Online · Dispatch Ready' : 'Offline'}
              </Text>
              <Text className="text-[10px] text-[#6B7280]">
                {currentUser?.name || 'Roshan Kaluarachchi'} · {currentUser?.vehiclePlate || 'WP - LG 8824 (Dimas Truck)'}
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

        {/* Metrics Row */}
        <View className="flex-row gap-2.5">
          <Card variant="mint" padding="sm" className="flex-1">
            <Text className="text-[10px] uppercase font-bold text-[#4B6B56]">Today's Pay</Text>
            <Text className="text-lg font-black text-[#1F5C3A] mt-0.5">
              LKR {todayEarnings.toLocaleString()}
            </Text>
            <Text className="text-[9px] text-[#4B6B56]">LKR 1,500 / delivery</Text>
          </Card>

          <Card padding="sm" className="flex-1">
            <Text className="text-[10px] uppercase font-bold text-[#6B7280]">Active Trips</Text>
            <Text className="text-lg font-black text-[#1A1A1A] mt-0.5">
              {activeTrips.length}
            </Text>
            <Text className="text-[9px] text-[#19768A]">In transit / pickup</Text>
          </Card>

          <Card padding="sm" className="flex-1">
            <Text className="text-[10px] uppercase font-bold text-[#6B7280]">Available</Text>
            <Text className="text-lg font-black text-[#B45309] mt-0.5">
              {availablePickups.length}
            </Text>
            <Text className="text-[9px] text-[#B45309]">Ready at farm</Text>
          </Card>
        </View>

        {/* Dispatch Segmented Control */}
        <View className="flex-row bg-[#E5E7EB] p-1 rounded-xl">
          <Pressable
            onPress={() => setActiveTab('available')}
            className={`flex-1 py-2 rounded-lg items-center ${
              activeTab === 'available' ? 'bg-[#1F5C3A]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-black ${
                activeTab === 'available' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Available Jobs ({availablePickups.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('active')}
            className={`flex-1 py-2 rounded-lg items-center ${
              activeTab === 'active' ? 'bg-[#1F5C3A]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-black ${
                activeTab === 'active' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Active Route ({activeTrips.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('completed')}
            className={`flex-1 py-2 rounded-lg items-center ${
              activeTab === 'completed' ? 'bg-[#1F5C3A]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-black ${
                activeTab === 'completed' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              History ({completedDeliveries.length})
            </Text>
          </Pressable>
        </View>

        {/* ================= 1. AVAILABLE PICKUP JOBS (UBER EATS STYLE BROADCAST) ================= */}
        {activeTab === 'available' && (
          <View style={{ gap: 12 }}>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-extrabold text-[#1A1A1A]">
                Farm Harvest Pickup Requests
              </Text>
              <View className="bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                <Text className="text-[10px] font-black text-[#B45309]">
                  Live Broadcast
                </Text>
              </View>
            </View>

            {availablePickups.length === 0 ? (
              <EmptyState
                title="No Pending Pickups"
                description="When farmers finish harvesting and tap 'Ready', new pickup requests will broadcast here immediately."
              />
            ) : (
              availablePickups.map(order => (
                <Card key={order._id} padding="md" style={{ gap: 12 }} className="border-2 border-[#86EFAC]">
                  {/* Job Header & Fare */}
                  <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2.5">
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center gap-1.5">
                        <View className="w-2 h-2 rounded-full bg-[#10B981]" />
                        <Text className="text-xs font-black text-[#1A1A1A]">
                          NEW DELIVERY JOB · {order.orderNumber}
                        </Text>
                      </View>
                      <Text className="text-[10px] text-[#6B7280] mt-0.5">
                        Packed & ready at farm gate
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-black text-[#1F5C3A]">LKR 1,500</Text>
                      <Text className="text-[9px] text-[#4B6B56] font-semibold">Driver Pay</Text>
                    </View>
                  </View>

                  {/* Cargo Items with Photos */}
                  <View className="flex-row items-center gap-3 bg-[#F9FAFB] p-2 rounded-xl">
                    {order.items.slice(0, 2).map((item, idx) => {
                      const hasPhoto = isValidPhotoUrl(item.photoUrl);

                      return (
                        <View key={idx} className="flex-row items-center gap-2 flex-1">
                          <View
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 8,
                              overflow: 'hidden',
                              backgroundColor: '#E5E7EB',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {hasPhoto ? (
                              <Image
                                source={{ uri: item.photoUrl }}
                                style={{ width: 38, height: 38 }}
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
                            <Text className="text-[10px] text-[#6B7280]">
                              {item.quantityKg} kg crate
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* Route Steps (Farm Pickup -> Buyer Dropoff) */}
                  <View className="gap-2.5">
                    {/* Pickup Spot */}
                    <View className="flex-row items-start gap-2">
                      <View className="w-5 items-center mt-0.5">
                        <View className="w-2.5 h-2.5 rounded-full bg-[#1F5C3A]" />
                        <View className="w-0.5 h-6 bg-[#D1D5DB] my-0.5" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold text-[#4B6B56] uppercase">PICKUP FROM FARM GATE</Text>
                        <Text className="text-xs font-bold text-[#1A1A1A]">{order.farmerName}</Text>
                        <Text className="text-[11px] text-[#6B7280]">{order.farmerAddress}</Text>
                      </View>
                      <Pressable
                        onPress={() => Linking.openURL(`tel:${order.farmerPhone || '+94771234567'}`)}
                        className="bg-[#E6F2E8] p-1.5 rounded-lg"
                      >
                        <Phone size={14} color="#1F5C3A" />
                      </Pressable>
                    </View>

                    {/* Dropoff Spot */}
                    <View className="flex-row items-start gap-2">
                      <View className="w-5 items-center mt-0.5">
                        <MapPin size={12} color="#DC2626" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold text-[#991B1B] uppercase">DELIVERY DESTINATION</Text>
                        <Text className="text-xs font-bold text-[#1A1A1A]">{order.buyerName}</Text>
                        <Text className="text-[11px] text-[#6B7280]">{order.deliveryAddress}</Text>
                      </View>
                      <Pressable
                        onPress={() => Linking.openURL(`tel:${order.buyerPhone || '+94771234567'}`)}
                        className="bg-[#EFF6FF] p-1.5 rounded-lg"
                      >
                        <Phone size={14} color="#2563EB" />
                      </Pressable>
                    </View>
                  </View>

                  {/* Accept Job CTA Button */}
                  <Button
                    variant="primary"
                    fullWidth
                    size="md"
                    leftIcon={<Truck size={17} color="#ffffff" strokeWidth={2.5} />}
                    onPress={() => {
                      driverAcceptOrder(order._id);
                      setActiveTab('active');
                    }}
                  >
                    Accept Delivery Job (LKR 1,500)
                  </Button>
                </Card>
              ))
            )}
          </View>
        )}

        {/* ================= 2. ACTIVE ROUTE / IN PROGRESS (UBER EATS STEPPER) ================= */}
        {activeTab === 'active' && (
          <View style={{ gap: 12 }}>
            <Text className="text-sm font-extrabold text-[#1A1A1A]">
              My Active Deliveries ({activeTrips.length})
            </Text>

            {activeTrips.length === 0 ? (
              <EmptyState
                title="No Active Deliveries"
                description="Accept an available pickup job from the 'Available Jobs' tab to start driving."
              />
            ) : (
              activeTrips.map(order => {
                const isPickingUp = order.status === 'ready_for_pickup';
                const isDelivering = order.status === 'out_for_delivery';

                return (
                  <Card key={order._id} padding="md" style={{ gap: 12 }}>
                    {/* Status Step Banner */}
                    <View
                      className={`p-2.5 rounded-xl border flex-row items-center justify-between ${
                        isPickingUp
                          ? 'bg-[#FEF8EA] border-[#FDE6B8]'
                          : 'bg-[#EFF6FF] border-[#BFDBFE]'
                      }`}
                    >
                      <View className="flex-row items-center gap-2">
                        <Truck size={16} color={isPickingUp ? '#B45309' : '#1D4ED8'} strokeWidth={2.5} />
                        <Text
                          className={`text-xs font-black ${
                            isPickingUp ? 'text-[#B45309]' : 'text-[#1D4ED8]'
                          }`}
                        >
                          {isPickingUp
                            ? 'STEP 1: Head to Farm Gate & Pick Up'
                            : 'STEP 2: In Transit to Buyer Doorstep'}
                        </Text>
                      </View>
                      <Text className="text-[10px] font-bold text-[#6B7280]">
                        {order.orderNumber}
                      </Text>
                    </View>

                    {/* Step 1: Farm Gate Details */}
                    {isPickingUp && (
                      <View className="gap-3">
                        <View className="flex-row items-center justify-between">
                          <View>
                            <Text className="text-[10px] font-bold text-[#6B7280] uppercase">FARM GATE ADDRESS</Text>
                            <Text className="text-sm font-black text-[#1A1A1A] mt-0.5">{order.farmerName}</Text>
                            <Text className="text-xs text-[#4B5563]">{order.farmerAddress}</Text>
                          </View>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Phone size={13} color="#1F5C3A" />}
                            onPress={() => Linking.openURL(`tel:${order.farmerPhone || '+94771234567'}`)}
                          >
                            Call Farmer
                          </Button>
                        </View>

                        <View className="bg-[#F9FAFB] p-2.5 rounded-xl border border-[#F3F4F6]">
                          <Text className="text-[11px] font-bold text-[#1A1A1A]">Cargo to Collect:</Text>
                          <Text className="text-xs text-[#4B6B56] mt-0.5">
                            {order.items.map(i => `${i.cropName} (${i.quantityKg}kg)`).join(' · ')}
                          </Text>
                        </View>

                        <Button
                          variant="primary"
                          fullWidth
                          size="lg"
                          leftIcon={<Check size={18} color="#ffffff" strokeWidth={2.5} />}
                          onPress={() => driverConfirmPickup(order._id)}
                        >
                          Confirm Pickup at Farm Gate
                        </Button>
                      </View>
                    )}

                    {/* Step 2: Buyer Destination & Handover */}
                    {isDelivering && (
                      <View className="gap-3">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 mr-2">
                            <Text className="text-[10px] font-bold text-[#6B7280] uppercase">DELIVER TO BUYER</Text>
                            <Text className="text-sm font-black text-[#1A1A1A] mt-0.5">{order.buyerName}</Text>
                            <Text className="text-xs text-[#4B5563]">{order.deliveryAddress}</Text>
                            {Boolean(order.deliveryNotes) && (
                              <Text className="text-[11px] text-[#B45309] font-medium mt-1">
                                Note: {order.deliveryNotes}
                              </Text>
                            )}
                          </View>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Phone size={13} color="#1F5C3A" />}
                            onPress={() => Linking.openURL(`tel:${order.buyerPhone || '+94771234567'}`)}
                          >
                            Call Buyer
                          </Button>
                        </View>

                        <View className="bg-[#F0FDF4] p-2.5 rounded-xl border border-[#BBF7D0] flex-row justify-between items-center">
                          <View>
                            <Text className="text-[10px] font-bold text-[#15803D] uppercase">COLLECTION DUE</Text>
                            <Text className="text-xs font-black text-[#15803D]">
                              {order.paymentMethod === 'cash_on_delivery'
                                ? `Cash Due: LKR ${order.total.toLocaleString()}`
                                : 'Prepaid (Card / Wallet)'}
                            </Text>
                          </View>
                          <View className="bg-white px-2 py-1 rounded-md border border-[#86EFAC]">
                            <Text className="text-[10px] font-bold text-[#15803D]">
                              {order.paymentMethod.replace(/_/g, ' ').toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <Button
                          variant="primary"
                          fullWidth
                          size="lg"
                          leftIcon={<CheckCircle size={18} color="#ffffff" strokeWidth={2.5} />}
                          onPress={() => {
                            driverConfirmDelivery(
                              order._id,
                              'Handed over to buyer at doorstep, verified and signed'
                            );
                            setActiveTab('completed');
                          }}
                        >
                          Confirm Doorstep Handover & Complete
                        </Button>
                      </View>
                    )}
                  </Card>
                );
              })
            )}
          </View>
        )}

        {/* ================= 3. COMPLETED DELIVERIES HISTORY ================= */}
        {activeTab === 'completed' && (
          <View style={{ gap: 12 }}>
            <Text className="text-sm font-extrabold text-[#1A1A1A]">
              Delivered & Settled Tasks ({completedDeliveries.length})
            </Text>

            {completedDeliveries.length === 0 ? (
              <EmptyState
                title="No Completed Deliveries Yet"
                description="Completed delivery jobs and payment settlements will appear here."
              />
            ) : (
              completedDeliveries.map(order => (
                <Card key={order._id} padding="md" style={{ gap: 10 }}>
                  <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
                    <View>
                      <Text className="text-xs font-black text-[#1A1A1A]">{order.orderNumber}</Text>
                      <Text className="text-[10px] text-[#6B7280]">
                        Delivered at {order.deliveredAt || 'Today'}
                      </Text>
                    </View>
                    <View className="bg-[#DCFCE7] px-2.5 py-1 rounded-full border border-[#86EFAC]">
                      <Text className="text-[10px] font-black text-[#15803D]">
                        +LKR 1,500 Paid
                      </Text>
                    </View>
                  </View>

                  <View className="gap-1">
                    <Text className="text-xs text-[#4B5563]">
                      Route: {order.farmerName} ({order.farmerAddress?.split(',')[0]}) → {order.buyerName} ({order.deliveryDistrict})
                    </Text>
                    <Text className="text-[11px] text-[#15803D] font-medium">
                      ✓ {order.deliveryProofNote || 'Handover confirmed by recipient'}
                    </Text>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* Dispatch Map Corridor */}
        <View style={{ gap: 8 }}>
          <Text className="text-sm font-bold text-[#1A1A1A]">Logistics Route Corridor</Text>
          <SriLankaMap
            showRoute
            routeTitle="Nuwara Eliya -> Colombo Corridor"
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

export const DriverScreens: React.FC = () => {
  return <DriverHomeScreen />;
};
