import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
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
} from 'lucide-react-native';
import { useApp } from '../../services/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { SriLankaMap } from '../../components/shared/SriLankaMap';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProduceVisual } from '../../components/ui/ProduceVisual';
import { Avatar } from '../../components/ui/Avatar';
import { Order } from '../../types';

// ===================== 1. DRIVER HOME & DASHBOARD =====================
export const DriverHomeScreen: React.FC = () => {
  const { orders, currentUser, driverConfirmPickup, driverConfirmDelivery } = useApp();
  const [isOnline, setIsOnline] = useState(true);

  const assignedDeliveries = orders.filter(
    o => o.deliveryType !== 'pickup' && (o.status === 'ready_for_pickup' || o.status === 'out_for_delivery' || o.status === 'preparing')
  );

  const completedToday = orders.filter(o => o.deliveryType !== 'pickup' && o.status === 'delivered');
  const todayEarnings = 4850 + completedToday.length * 1500;

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ gap: 16 }}>
        {/* Availability Status Card */}
        <Card padding="md" className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5 flex-1">
            <View
              className={`w-3.5 h-3.5 rounded-full ${
                isOnline ? 'bg-[#1F5C3A]' : 'bg-[#9CA3AF]'
              }`}
            />
            <View className="flex-1">
              <Text className="text-xs font-bold text-[#1A1A1A]">
                Fleet Status: {isOnline ? 'Active & Ready for Dispatch' : 'Offline'}
              </Text>
              <Text className="text-[10px] text-[#6B7280]">
                Vehicle: {currentUser?.vehiclePlate || 'WP - LG 8824 (Dimas Truck)'}
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
        <View className="flex-row gap-3">
          <Card variant="mint" padding="md" className="flex-1">
            <Text className="text-[10px] uppercase font-bold text-[#4B6B56]">Today's Fleet Pay</Text>
            <Text className="text-xl font-black text-[#1F5C3A] mt-0.5">
              LKR {todayEarnings.toLocaleString()}
            </Text>
            <Text className="text-[10px] text-[#4B6B56] mt-0.5">+LKR 800 fuel subsidy</Text>
          </Card>

          <Card padding="md" className="flex-1">
            <Text className="text-[10px] uppercase font-bold text-[#6B7280]">Assigned Routes</Text>
            <Text className="text-xl font-black text-[#1A1A1A] mt-0.5">
              {assignedDeliveries.length}
            </Text>
            <Text className="text-[10px] text-[#6B7280] mt-0.5">Highland & Western corridors</Text>
          </Card>
        </View>

        {/* Map View */}
        <View style={{ gap: 8 }}>
          <Text className="text-sm font-bold text-[#1A1A1A]">Logistics Dispatch Map</Text>
          <SriLankaMap
            showRoute
            routeTitle="Nuwara Eliya -> Colombo Corridor"
            markers={assignedDeliveries.map(o => ({
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

        {/* Active Deliveries */}
        <View style={{ gap: 8 }}>
          <Text className="text-sm font-bold text-[#1A1A1A]">Active Fleet Tasks ({assignedDeliveries.length})</Text>

          {assignedDeliveries.length === 0 ? (
            <EmptyState
              title="No Pending Dispatch Routes"
              description="New farm harvest delivery jobs will appear here once packed at farm gate."
            />
          ) : (
            assignedDeliveries.map(order => (
              <Card key={order._id} padding="md" style={{ gap: 12 }}>
                <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-xs font-bold text-[#1A1A1A]">{order.orderNumber}</Text>
                    <Text className="text-[10px] text-[#6B7280]">
                      Pickup: {order.farmerName} ({order.farmerAddress})
                    </Text>
                  </View>
                  <StatusPill status={order.status} />
                </View>

                <View style={{ gap: 4 }}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-[#6B7280]">Destination:</Text>
                    <Text className="text-xs font-bold text-[#1A1A1A] flex-1 text-right ml-2" numberOfLines={1}>
                      {order.deliveryAddress}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-[#6B7280]">Recipient:</Text>
                    <Text className="text-xs font-bold text-[#1F5C3A]">
                      {order.buyerName} ({order.buyerPhone})
                    </Text>
                  </View>
                </View>

                {/* Driver Communication Shortcuts */}
                <View className="flex-row gap-2 pt-1 border-t border-[#F0F0EE]">
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ flex: 1 }}
                    leftIcon={<Phone size={13} color="#1F5C3A" />}
                    onPress={() => Linking.openURL(`tel:${order.farmerPhone || '+94771234567'}`)}
                  >
                    Call Farmer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ flex: 1 }}
                    leftIcon={<Phone size={13} color="#1F5C3A" />}
                    onPress={() => Linking.openURL(`tel:${order.buyerPhone || '+94771234567'}`)}
                  >
                    Call Buyer
                  </Button>
                </View>

                {/* Dispatch Status Actions */}
                {order.status === 'preparing' && (
                  <View className="p-2.5 bg-[#FEF8EA] rounded-xl border border-[#FDE6B8]">
                    <Text className="text-xs text-[#92400E] font-medium text-center">
                      Farmer is harvesting & packing at farm gate. Pickup opens once ready.
                    </Text>
                  </View>
                )}

                {order.status === 'ready_for_pickup' && (
                  <Button
                    variant="primary"
                    fullWidth
                    size="md"
                    leftIcon={<Check size={16} color="#ffffff" strokeWidth={2.5} />}
                    onPress={() => driverConfirmPickup(order._id)}
                  >
                    Confirm Pickup at Farm Gate
                  </Button>
                )}

                {order.status === 'out_for_delivery' && (
                  <Button
                    variant="primary"
                    fullWidth
                    size="md"
                    leftIcon={<CheckCircle size={16} color="#ffffff" strokeWidth={2.5} />}
                    onPress={() => driverConfirmDelivery(order._id, 'Handed over to recipient')}
                  >
                    Confirm Doorstep Handover
                  </Button>
                )}
              </Card>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

// Main Driver Screens Router Container
export const DriverScreens: React.FC = () => {
  return <DriverHomeScreen />;
};
