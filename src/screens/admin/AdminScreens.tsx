import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import {
  ShieldAlert,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Tag,
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
  Plus,
  Check,
  Ban,
  ShieldCheck,
  Search,
  Filter,
  Truck,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Trash2,
  Pencil,
  Eye,
  Carrot,
  Apple,
  Flame,
  Wheat,
  Bean,
  Leaf,
  Layers,
  ChevronRight,
  Clock,
  UserCheck,
  UserX,
  X,
  Sparkles,
  Award,
  Send,
  MessageSquare,
  LifeBuoy,
} from 'lucide-react-native';
import { useApp } from '../../services/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Avatar } from '../../components/ui/Avatar';
import { ProduceVisual } from '../../components/ui/ProduceVisual';
import { User, Complaint, SupportTicket, TicketMessage, TicketStatus, CropCategory } from '../../types';

// ===================== 1. ADMIN DASHBOARD SCREEN =====================
export const AdminDashboardScreen: React.FC = () => {
  const {
    platformStats,
    users,
    complaints,
    orders,
    adminVerifyUser,
    adminResolveComplaint,
    goToSubScreen,
    setTab,
  } = useApp();

  const pendingVerificationUsers = users.filter(u => !u.verified && u.role !== 'admin');
  const activeTickets = complaints.filter(
    c => c.status === 'open' || c.status === 'in_progress' || (c.status as string) === 'pending'
  );

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const totalGrossLkr = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeProducersCount = users.filter(u => u.role === 'farmer' && !u.isDeactivated).length;

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ gap: 16 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-lg font-bold text-[#1A1A1A]">Platform Operations Center</Text>
            <Text className="text-xs text-[#6B7280]">
              Real-time oversight for Sri Lanka direct agricultural trade & fulfillment
            </Text>
          </View>
          <View className="bg-[#E6F2E8] px-2.5 py-1 rounded-full border border-[#CDE5D2]">
            <Text className="text-[10px] font-bold text-[#1F5C3A]">Live Sync</Text>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <Card variant="mint" padding="md" style={{ flex: 1, minWidth: '47%' }}>
            <View className="flex-row items-center justify-between" style={{ height: 18 }}>
              <Text className="text-[10px] text-[#4B6B56] uppercase font-bold" numberOfLines={1}>Total Orders</Text>
              <Package size={14} color="#1F5C3A" />
            </View>
            <Text className="text-xl font-black text-[#1F5C3A] mt-1" numberOfLines={1}>{totalOrdersCount}</Text>
            <Text className="text-[10px] text-[#4B6B56] font-semibold mt-0.5" numberOfLines={1}>
              {pendingOrdersCount} pending farmer action
            </Text>
          </Card>

          <Card padding="md" style={{ flex: 1, minWidth: '47%' }}>
            <View className="flex-row items-center justify-between" style={{ height: 18 }}>
              <Text className="text-[10px] text-[#6B7280] uppercase font-bold" numberOfLines={1}>Gross (LKR)</Text>
              <DollarSign size={14} color="#6B7280" />
            </View>
            <Text className="text-xl font-black text-[#1A1A1A] mt-1" numberOfLines={1}>
              {totalGrossLkr >= 1000000
                ? `${(totalGrossLkr / 1000000).toFixed(2)}M LKR`
                : totalGrossLkr > 0
                ? `${totalGrossLkr.toLocaleString()} LKR`
                : '0 LKR'}
            </Text>
            <Text className="text-[10px] text-[#1F5C3A] font-semibold mt-0.5" numberOfLines={1}>
              Direct trade volume
            </Text>
          </Card>

          <Card padding="md" style={{ flex: 1, minWidth: '47%' }}>
            <View className="flex-row items-center justify-between" style={{ height: 18 }}>
              <Text className="text-[10px] text-[#6B7280] uppercase font-bold" numberOfLines={1}>Active Producers</Text>
              <Users size={14} color="#6B7280" />
            </View>
            <Text className="text-xl font-black text-[#1A1A1A] mt-1" numberOfLines={1}>
              {activeProducersCount.toLocaleString()}
            </Text>
            <Text className="text-[10px] text-[#1F5C3A] font-semibold mt-0.5" numberOfLines={1}>
              {users.filter(u => u.role === 'farmer' && u.verified).length} verified
            </Text>
          </Card>

          <Pressable style={{ flex: 1, minWidth: '47%' }} onPress={() => setTab('users')}>
            <Card padding="md" style={{ borderColor: '#FDE68A', backgroundColor: '#FFFDF5' }}>
              <View className="flex-row items-center justify-between" style={{ height: 18 }}>
                <Text className="text-[10px] text-[#6B7280] uppercase font-bold" numberOfLines={1}>Pending Reviews</Text>
                <ChevronRight size={14} color="#B45309" />
              </View>
              <Text className="text-xl font-black text-[#B45309] mt-1" numberOfLines={1}>
                {pendingVerificationUsers.length}
              </Text>
              <Text className="text-[10px] text-[#B45309] font-semibold mt-0.5" numberOfLines={1}>Tap to view queue</Text>
            </Card>
          </Pressable>
        </View>

        {/* Verification Queue */}
        <View style={{ gap: 8 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-[#1A1A1A]">Pending Verifications ({pendingVerificationUsers.length})</Text>
            <Pressable onPress={() => setTab('users')}>
              <Text className="text-xs text-[#1F5C3A] font-bold">View all users →</Text>
            </Pressable>
          </View>
          {pendingVerificationUsers.length === 0 ? (
            <Card padding="md" className="items-center py-5">
              <CheckCircle size={20} color="#1F5C3A" />
              <Text className="text-xs text-[#1F5C3A] font-bold mt-1">All Accounts Verified</Text>
              <Text className="text-[10px] text-[#6B7280]">No pending KYC applications awaiting review</Text>
            </Card>
          ) : (
            pendingVerificationUsers.map(user => (
              <Pressable
                key={user._id}
                onPress={() => goToSubScreen('admin_user_verification', { userId: user._id })}
              >
                <Card padding="md" style={{ gap: 10 }}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2.5 flex-1">
                      <Avatar name={user.name} size="md" role={user.role} imageUrl={user.avatarUrl} />
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-[#1A1A1A]">{user.name}</Text>
                        <Text className="text-[10px] text-[#6B7280]">
                          Role: {user.role.toUpperCase()} · Phone: {user.phone}
                        </Text>
                        {Boolean(user.farmName) && (
                          <Text className="text-[10px] text-[#4B6B56] font-semibold">
                            Holding: {user.farmName} ({user.farmSizeAcres || 3} Acres)
                          </Text>
                        )}
                        {Boolean(user.vehiclePlate) && (
                          <Text className="text-[10px] text-[#19768A] font-semibold">
                            Vehicle: {user.vehiclePlate} ({user.vehicleType})
                          </Text>
                        )}
                      </View>
                    </View>
                    <StatusPill status="pending" label="Pending" />
                  </View>

                  {/* Admin Actions */}
                  <View className="flex-row justify-end gap-2 pt-2 border-t border-[#F0F0EE]">
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() =>
                        goToSubScreen('admin_user_verification', { userId: user._id })
                      }
                      leftIcon={<Eye size={13} color="#4B5563" />}
                    >
                      Audit Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => adminVerifyUser(user._id, false)}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<ShieldCheck size={14} color="#ffffff" />}
                      onPress={() => adminVerifyUser(user._id, true)}
                    >
                      Approve & Verify
                    </Button>
                  </View>
                </Card>
              </Pressable>
            ))
          )}
        </View>

        {/* Live Order Fulfillment Queue (All Platform Orders) */}
        <View style={{ gap: 8 }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-bold text-[#1A1A1A]">
                Live Platform Orders & Fulfillment ({orders.length})
              </Text>
              <Text className="text-[10px] text-[#6B7280]">
                Real-time tracking across Buyers, Farmers & Logistics Fleet
              </Text>
            </View>
            <View className="bg-[#E6F2E8] px-2 py-0.5 rounded-full border border-[#CDE5D2]">
              <Text className="text-[10px] font-bold text-[#1F5C3A]">Sync Active</Text>
            </View>
          </View>

          {orders.length === 0 ? (
            <Card padding="md" className="items-center py-5">
              <Package size={20} color="#6B7280" />
              <Text className="text-xs text-[#6B7280] font-bold mt-1">No Orders in Platform Queue</Text>
            </Card>
          ) : (
            orders.slice(0, 10).map(order => (
              <Card key={order._id} padding="md" style={{ gap: 8 }}>
                <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs font-bold text-[#1A1A1A]">{order.orderNumber}</Text>
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
                          fontSize: 9,
                          fontWeight: '700',
                          color: order.deliveryType === 'pickup' ? '#1D4ED8' : '#047857',
                        }}
                      >
                        {order.deliveryType === 'pickup' ? 'Farm Pickup' : 'Fleet Delivery'}
                      </Text>
                    </View>
                  </View>
                  <StatusPill status={order.status} />
                </View>

                <View className="flex-row justify-between items-start">
                  <View className="flex-1 mr-2">
                    <Text className="text-xs text-[#4B5563]">
                      <Text className="font-semibold text-[#1A1A1A]">{order.farmerName}</Text> →{' '}
                      <Text className="font-semibold text-[#1A1A1A]">{order.buyerName}</Text>
                    </Text>
                    <Text className="text-[10px] text-[#6B7280] mt-0.5">
                      {order.items.map(i => `${i.cropName} (${i.quantityKg}kg)`).join(', ')}
                    </Text>
                  </View>
                  <View className="items-end shrink-0">
                    <Text className="text-xs font-black text-[#1F5C3A]">
                      LKR {order.total.toLocaleString()}
                    </Text>
                    <Text className="text-[9px] text-[#6B7280] mt-0.5">
                      {order.paymentMethod.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {Boolean(order.driverName) && (
                  <View className="bg-[#F8FAFC] px-2 py-1 rounded-md flex-row items-center justify-between">
                    <Text className="text-[10px] text-[#64748B]">
                      Fleet Driver: <Text className="font-semibold text-[#0F172A]">{order.driverName}</Text> ({order.driverVehicle})
                    </Text>
                    <Text className="text-[10px] text-[#15803D] font-bold">Assigned</Text>
                  </View>
                )}
              </Card>
            ))
          )}
        </View>

        {/* Dispute Resolution & Support Tickets Queue */}
        <View style={{ gap: 8 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-[#1A1A1A]">Support & Dispute Tickets ({activeTickets.length})</Text>
            <Pressable onPress={() => setTab('complaints')}>
              <Text className="text-xs text-[#1F5C3A] font-bold">View all complaints →</Text>
            </Pressable>
          </View>
          {activeTickets.length === 0 ? (
            <Card padding="md" className="items-center py-5">
              <ShieldCheck size={20} color="#1F5C3A" />
              <Text className="text-xs text-[#1F5C3A] font-bold mt-1">Zero Active Tickets</Text>
              <Text className="text-[10px] text-[#6B7280]">All support tickets and disputes have been resolved</Text>
            </Card>
          ) : (
            activeTickets.map(complaint => (
              <Pressable
                key={complaint._id}
                onPress={() =>
                  goToSubScreen('admin_complaint_detail', { complaintId: complaint._id, ticketId: complaint._id })
                }
              >
                <Card padding="md" style={{ gap: 10 }}>
                  <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
                    <View className="flex-1 mr-2">
                      <Text className="text-xs font-bold text-[#1A1A1A]">
                        {complaint.subject || complaint.reason || 'Support Ticket'}
                      </Text>
                      <Text className="text-[10px] text-[#6B7280]">
                        Reporter: {complaint.buyerName || complaint.complainantName || 'Buyer'}
                        {complaint.orderId ? ` · Order: #${complaint.orderId.slice(-6)}` : null}
                      </Text>
                    </View>
                    <StatusPill status={complaint.status} />
                  </View>

                  <Text className="text-xs text-[#4B5563]" numberOfLines={2}>
                    {complaint.lastMessage || complaint.description || complaint.details}
                  </Text>

                  <View className="flex-row justify-end gap-2 pt-2 border-t border-[#F0F0EE]">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Eye size={13} color="#FFFFFF" />}
                      onPress={() =>
                        goToSubScreen('admin_complaint_detail', { complaintId: complaint._id, ticketId: complaint._id })
                      }
                    >
                      Open & Reply
                    </Button>
                  </View>
                </Card>
              </Pressable>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

// ===================== 2. ADMIN USERS SCREEN =====================
export const AdminUsersScreen: React.FC = () => {
  const { users, adminVerifyUser, adminToggleDeactivateUser, goToSubScreen } = useApp();

  const [activeTab, setActiveTab] = useState<'farmers' | 'buyers' | 'pending'>('farmers');
  const [searchQuery, setSearchQuery] = useState('');

  const farmers = users.filter(u => u.role === 'farmer');
  const buyers = users.filter(u => u.role === 'buyer');
  const pendingUsers = users.filter(u => !u.verified && u.role !== 'admin');

  const displayedUsers = (() => {
    let list: User[] = [];
    if (activeTab === 'farmers') list = farmers;
    else if (activeTab === 'buyers') list = buyers;
    else if (activeTab === 'pending') list = pendingUsers;

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(
      u =>
        u.name.toLowerCase().includes(query) ||
        (u.phone && u.phone.includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.farmName && u.farmName.toLowerCase().includes(query)) ||
        (u.vehiclePlate && u.vehiclePlate.toLowerCase().includes(query)) ||
        (u.vehicleType && u.vehicleType.toLowerCase().includes(query)) ||
        (u.location?.town && u.location.town.toLowerCase().includes(query)) ||
        (u.location?.district && u.location.district.toLowerCase().includes(query)) ||
        (u.district && u.district.toLowerCase().includes(query))
    );
  })();

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ gap: 14 }}>
        {/* Header */}
        <View>
          <Text className="text-lg font-black text-[#1A1A1A]">User & Producer Management</Text>
          <Text className="text-xs text-[#6B7280]">
            KYC verification audits, active status, and compliance tracking
          </Text>
        </View>

        {/* Tab Filters */}
        <View className="flex-row gap-2">
          {/* Farmers Tab */}
          <Pressable
            onPress={() => setActiveTab('farmers')}
            className={`flex-1 py-2 px-3 rounded-xl border items-center justify-center ${
              activeTab === 'farmers'
                ? 'bg-[#1F5C3A] border-[#1F5C3A]'
                : 'bg-white border-[#E5E7EB]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'farmers' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Farmers ({farmers.length})
            </Text>
          </Pressable>

          {/* Buyers Tab */}
          <Pressable
            onPress={() => setActiveTab('buyers')}
            className={`flex-1 py-2 px-3 rounded-xl border items-center justify-center ${
              activeTab === 'buyers'
                ? 'bg-[#1F5C3A] border-[#1F5C3A]'
                : 'bg-white border-[#E5E7EB]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'buyers' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Buyers ({buyers.length})
            </Text>
          </Pressable>

          {/* Pending Tab with Count Badge */}
          <Pressable
            onPress={() => setActiveTab('pending')}
            className={`flex-1 py-2 px-3 rounded-xl border flex-row items-center justify-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#B45309] border-[#B45309]'
                : 'bg-white border-[#E5E7EB]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'pending' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Pending
            </Text>
            {pendingUsers.length > 0 && (
              <View
                className={`px-1.5 py-0.2 rounded-full ${
                  activeTab === 'pending' ? 'bg-white' : 'bg-[#FEF3C7]'
                }`}
              >
                <Text
                  className={`text-[10px] font-black ${
                    activeTab === 'pending' ? 'text-[#B45309]' : 'text-[#92400E]'
                  }`}
                >
                  {pendingUsers.length}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="bg-white rounded-xl border border-[#E5E7EB] px-3 py-2 flex-row items-center gap-2">
          <Search size={16} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-xs text-[#1A1A1A] p-0"
            placeholder="Search by name, phone, farm or location..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {Boolean(searchQuery) && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={15} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* User Cards List */}
        {displayedUsers.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description={
              searchQuery
                ? `No accounts matched "${searchQuery}" in this category.`
                : activeTab === 'pending'
                ? 'All producer registration applications have been audited.'
                : 'No users registered under this classification.'
            }
          />
        ) : (
          <View style={{ gap: 10 }}>
            {displayedUsers.map(user => {
              const isPending = !user.verified;
              const isDeactivated = Boolean(user.isDeactivated);
              const locationStr =
                user.location?.town && user.location?.district
                  ? `${user.location.town}, ${user.location.district}`
                  : user.location?.address || 'Sri Lanka';

              return (
                <Pressable
                  key={user._id}
                  onPress={() => {
                    if (isPending) {
                      goToSubScreen('admin_user_verification', { userId: user._id });
                    }
                  }}
                >
                  <Card
                    padding="md"
                    style={{
                      gap: 10,
                      borderColor: isPending ? '#FDE68A' : isDeactivated ? '#FCA5A5' : '#E5E7EB',
                      backgroundColor: isPending ? '#FFFDF5' : isDeactivated ? '#FEF2F2' : '#FFFFFF',
                    }}
                  >
                    {/* Top Row: Avatar & Details */}
                    <View className="flex-row items-start gap-3">
                      <Avatar
                        name={user.name}
                        size="md"
                        role={user.role}
                        imageUrl={user.avatarUrl}
                      />

                      <View className="flex-1">
                        <View className="flex-row items-center gap-1.5 flex-wrap">
                          <Text className="text-sm font-bold text-[#1A1A1A]">{user.name}</Text>
                          <View
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              user.role === 'farmer'
                                ? 'bg-[#ECFDF5]'
                                : user.role === 'driver'
                                ? 'bg-[#E0F2FE]'
                                : user.role === 'admin'
                                ? 'bg-[#F3E8FF]'
                                : 'bg-[#EFF6FF]'
                            }`}
                          >
                            <Text
                              className={`text-[10px] font-bold ${
                                user.role === 'farmer'
                                  ? 'text-[#065F46]'
                                  : user.role === 'driver'
                                  ? 'text-[#0369A1]'
                                  : user.role === 'admin'
                                  ? 'text-[#7C3AED]'
                                  : 'text-[#1D4ED8]'
                              }`}
                            >
                              {user.role === 'farmer'
                                ? 'Farmer'
                                : user.role === 'driver'
                                ? 'Delivery Driver'
                                : user.role === 'admin'
                                ? 'Admin'
                                : 'Wholesale Buyer'}
                            </Text>
                          </View>
                        </View>

                        {/* Farm name if farmer */}
                        {Boolean(user.farmName) && (
                          <Text className="text-xs font-semibold text-[#1F5C3A] mt-0.5">
                            {user.farmName} · {user.farmSizeAcres || 3.5} Ac
                          </Text>
                        )}

                        {/* Vehicle details if driver */}
                        {Boolean(user.vehiclePlate) && (
                          <Text className="text-xs font-semibold text-[#0369A1] mt-0.5">
                            {user.vehiclePlate} · {user.vehicleType || 'Logistics Fleet'}
                          </Text>
                        )}

                        {/* Location */}
                        <View className="flex-row items-center gap-1 mt-1">
                          <MapPin size={11} color="#6B7280" />
                          <Text className="text-[11px] text-[#6B7280]" numberOfLines={1}>
                            {locationStr}
                          </Text>
                        </View>

                        {/* Phone */}
                        <View className="flex-row items-center gap-1 mt-0.5">
                          <Phone size={11} color="#6B7280" />
                          <Text className="text-[11px] text-[#6B7280] font-medium">
                            {user.phone}
                          </Text>
                        </View>
                      </View>

                      {/* Status Badges */}
                      <View className="items-end gap-1">
                        {isDeactivated ? (
                          <View className="bg-red-100 px-2 py-0.5 rounded">
                            <Text className="text-[10px] font-bold text-red-800">Deactivated</Text>
                          </View>
                        ) : isPending ? (
                          <View className="bg-amber-100 px-2 py-0.5 rounded">
                            <Text className="text-[10px] font-black text-amber-800">Pending KYC</Text>
                          </View>
                        ) : (
                          <View className="bg-emerald-100 px-2 py-0.5 rounded flex-row items-center gap-0.5">
                            <ShieldCheck size={11} color="#065F46" />
                            <Text className="text-[10px] font-bold text-emerald-800">Verified</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Action Buttons Row */}
                    <View className="flex-row items-center justify-end gap-2 pt-2 border-t border-[#F0F0EE]">
                      {/* For pending users: Review KYC Button */}
                      {isPending && (
                        <Button
                          variant="outline"
                          size="sm"
                          style={{
                            borderColor: '#F59E0B',
                            backgroundColor: '#FEF3C7',
                          }}
                          leftIcon={<Eye size={13} color="#92400E" />}
                          onPress={() =>
                            goToSubScreen('admin_user_verification', { userId: user._id })
                          }
                        >
                          <Text className="text-xs font-bold text-[#92400E]">Review KYC</Text>
                        </Button>
                      )}

                      {/* Verify / Revoke button */}
                      {user.verified ? (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<XCircle size={13} color="#6B7280" />}
                          onPress={() => adminVerifyUser(user._id, false)}
                        >
                          <Text className="text-xs font-bold text-[#4B5563]">Revoke KYC</Text>
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<ShieldCheck size={13} color="#ffffff" />}
                          onPress={() => adminVerifyUser(user._id, true)}
                        >
                          Approve & Verify
                        </Button>
                      )}

                      {/* Deactivate / Activate button */}
                      <Button
                        variant="outline"
                        size="sm"
                        style={{
                          borderColor: isDeactivated ? '#86EFAC' : '#FCA5A5',
                          backgroundColor: isDeactivated ? '#F0FDF4' : '#FEF2F2',
                        }}
                        leftIcon={
                          isDeactivated ? (
                            <Check size={13} color="#15803D" />
                          ) : (
                            <Ban size={13} color="#DC2626" />
                          )
                        }
                        onPress={() => adminToggleDeactivateUser(user._id)}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isDeactivated ? 'text-[#15803D]' : 'text-[#DC2626]'
                          }`}
                        >
                          {isDeactivated ? 'Activate' : 'Deactivate'}
                        </Text>
                      </Button>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// ===================== 3. ADMIN USER VERIFICATION DETAILS SCREEN =====================
export const AdminUserVerificationScreen: React.FC = () => {
  const { navState, users, adminVerifyUser, goBack } = useApp();
  const userId = navState.selectedUserId;
  const user = users.find(u => u._id === userId) || users.find(u => !u.verified) || users[0];

  if (!user) {
    return (
      <View className="flex-1 bg-[#F6F7F5] p-4 items-center justify-center">
        <Text className="text-sm font-bold text-[#1A1A1A]">User record not found</Text>
        <Button variant="primary" size="sm" onPress={goBack} className="mt-3">
          Back to Users
        </Button>
      </View>
    );
  }

  const documents = user.verificationDocuments || [
    {
      id: 'doc_nic',
      type: 'nic_front',
      title: 'National Identity Card (Smart NIC)',
      url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      issuedDate: '2019-06-14',
    },
    {
      id: 'doc_grama',
      type: 'grama_certificate',
      title: 'Grama Niladhari Farmer Residence Certificate',
      url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
      issuedDate: '2026-09-01',
    },
    {
      id: 'doc_deed',
      type: 'farm_deed',
      title: 'Agrarian Services Land Registry Deed',
      url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      issuedDate: '2022-03-20',
    },
  ];

  const handleApprove = () => {
    adminVerifyUser(user._id, true);
    Alert.alert('KYC Approved', `${user.name} has been verified as an official Agricultural Producer.`);
    goBack();
  };

  const handleReject = () => {
    adminVerifyUser(user._id, false);
    Alert.alert('Application Rejected', `KYC application for ${user.name} has been marked rejected.`);
    goBack();
  };

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={{ gap: 16 }}>
        {/* Navigation Bar with Back Arrow */}
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={goBack}
            className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] items-center justify-center"
          >
            <ArrowLeft size={18} color="#1A1A1A" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-base font-extrabold text-[#1A1A1A]">
              Producer KYC Verification
            </Text>
            <Text className="text-[11px] text-[#6B7280]">
              Auditing credentials for official Goviya wholesale registry
            </Text>
          </View>
        </View>

        {/* Producer Summary Hero */}
        <Card padding="md" className="bg-[#1F5C3A] flex-row items-center gap-3.5">
          <Avatar name={user.name} size="lg" role={user.role} imageUrl={user.avatarUrl} />
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5 flex-wrap">
              <Text className="text-base font-black text-white">{user.name}</Text>
              <View className="bg-emerald-800/90 px-2 py-0.5 rounded-full border border-emerald-600/40">
                <Text className="text-[10px] font-extrabold text-emerald-200">
                  {user.role === 'farmer' ? 'Agricultural Producer' : 'Wholesale Buyer'}
                </Text>
              </View>
            </View>

            <Text className="text-xs text-emerald-100 font-semibold mt-0.5">
              {user.farmName || "Sunil's Highland Farm"}
            </Text>

            <View className="flex-row items-center gap-2 mt-1.5">
              <View className="flex-row items-center gap-1">
                <Phone size={11} color="#D1FAE5" />
                <Text className="text-xs text-emerald-100">{user.phone}</Text>
              </View>
              {Boolean(user.email) && (
                <View className="flex-row items-center gap-1">
                  <Mail size={11} color="#D1FAE5" />
                  <Text className="text-xs text-emerald-100">{user.email}</Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* 1. National Identity Card (NIC) Audit */}
        <Card padding="md" style={{ gap: 10 }}>
          <View className="flex-row items-center justify-between pb-2 border-b border-[#F0F0EE]">
            <View className="flex-row items-center gap-2">
              <ShieldCheck size={16} color="#1F5C3A" />
              <Text className="text-xs font-bold text-[#1A1A1A]">National Identity Record</Text>
            </View>
            <View className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <Text className="text-[10px] font-bold text-emerald-800">DRP Validated</Text>
            </View>
          </View>

          <View className="bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB] flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-[10px] font-bold text-[#6B7280] uppercase">NIC Number</Text>
              <Text className="text-sm font-black text-[#1A1A1A] mt-0.5">
                {user.nicNumber || '198214502891'}
              </Text>
            </View>
            <View className="items-end shrink-0">
              <Text className="text-[10px] font-bold text-[#6B7280] uppercase">ID Type</Text>
              <Text className="text-xs font-bold text-[#1F5C3A] mt-0.5">
                Sri Lanka Smart NIC
              </Text>
            </View>
          </View>
        </Card>

        {/* 2. Farm Location & Holding */}
        <Card padding="md" style={{ gap: 10 }}>
          <View className="flex-row items-center gap-2 pb-2 border-b border-[#F0F0EE]">
            <MapPin size={16} color="#1F5C3A" />
            <Text className="text-xs font-bold text-[#1A1A1A]">Farm Location & Cultivated Land</Text>
          </View>

          <View className="flex-row gap-2.5">
            <View className="flex-1 bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E7EB]">
              <Text className="text-[10px] text-[#6B7280] font-bold uppercase">Land Size</Text>
              <Text className="text-sm font-black text-[#1F5C3A] mt-0.5">
                {user.farmSizeAcres || 4.5} Acres
              </Text>
              <Text className="text-[9px] text-[#6B7280]">Registered holding</Text>
            </View>

            <View className="flex-1 bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E7EB]">
              <Text className="text-[10px] text-[#6B7280] font-bold uppercase">Experience</Text>
              <Text className="text-sm font-black text-[#1D4ED8] mt-0.5">
                {user.yearsFarming || 14} Years
              </Text>
              <Text className="text-[9px] text-[#6B7280]">Active cultivator</Text>
            </View>
          </View>

          <View className="bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB] gap-1">
            <Text className="text-[10px] font-bold text-[#6B7280] uppercase">Physical Address</Text>
            <Text className="text-xs font-bold text-[#1A1A1A]">
              {user.location?.address || 'Highland Ridge Farm, Pelwehera, Dambulla'}
            </Text>
            <Text className="text-[11px] text-[#6B7280]">
              District: {user.location?.district || 'Matale'} · Town: {user.location?.town || 'Dambulla'}
            </Text>
          </View>
        </Card>

        {/* 3. Uploaded Verification Documents */}
        <View style={{ gap: 8 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-[#1A1A1A]">
              Uploaded Audit Documents ({documents.length})
            </Text>
            <Text className="text-[10px] text-[#6B7280]">Original Scans / Photos</Text>
          </View>

          {documents.map((doc, idx) => (
            <Card key={idx} padding="md" style={{ gap: 10 }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 flex-1">
                  <FileText size={16} color="#1F5C3A" />
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-[#1A1A1A]">{doc.title}</Text>
                    {Boolean(doc.issuedDate) && (
                      <Text className="text-[10px] text-[#6B7280]">
                        Issued Date: {doc.issuedDate}
                      </Text>
                    )}
                  </View>
                </View>
                <View className="bg-emerald-50 px-2 py-0.5 rounded">
                  <Text className="text-[10px] font-bold text-emerald-800">Attached</Text>
                </View>
              </View>

              {/* Document Image Preview */}
              <View
                style={{
                  height: 140,
                  borderRadius: 10,
                  overflow: 'hidden',
                  backgroundColor: '#F3F4F6',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}
              >
                <Image
                  source={{ uri: doc.url }}
                  style={{ width: '100%', height: 140 }}
                  resizeMode="cover"
                />
              </View>
            </Card>
          ))}
        </View>

        {/* Action Buttons: Approve / Reject */}
        <View className="flex-row gap-3 pt-2">
          <Button
            variant="outline"
            size="lg"
            style={{ flex: 1, borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}
            leftIcon={<XCircle size={16} color="#DC2626" />}
            onPress={handleReject}
          >
            <Text className="text-sm font-bold text-[#DC2626]">Reject</Text>
          </Button>

          <Button
            variant="primary"
            size="lg"
            style={{ flex: 2 }}
            leftIcon={<ShieldCheck size={18} color="#ffffff" />}
            onPress={handleApprove}
          >
            Approve & Verify
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

// ===================== 4. ADMIN CATEGORIES SCREEN =====================
export const AdminCategoriesScreen: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CropCategory | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIconName, setSelectedIconName] = useState('Carrot');
  const [formError, setFormError] = useState<string | null>(null);

  const iconPresets = [
    { name: 'Carrot', label: 'Carrot / Roots' },
    { name: 'Apple', label: 'Fruit / Tree' },
    { name: 'Flame', label: 'Spices / Chillies' },
    { name: 'Wheat', label: 'Grains / Rice' },
    { name: 'Bean', label: 'Tubers / Pulses' },
    { name: 'Leaf', label: 'Leafy Greens' },
    { name: 'Layers', label: 'General Agri' },
  ];

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setSelectedIconName('Carrot');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CropCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setSelectedIconName(cat.iconName || 'Carrot');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setFormError('Category name is required');
      return;
    }
    if (!description.trim()) {
      setFormError('Description is required');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        description: description.trim(),
        iconName: selectedIconName,
      });
    } else {
      addCategory({
        name: name.trim(),
        description: description.trim(),
        iconName: selectedIconName,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, catName: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete category "${catName}"? Existing produce will remain mapped to legacy tags.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(id) },
      ]
    );
  };

  const filteredCategories = categories.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ gap: 14 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-lg font-black text-[#1A1A1A]">Crop Categories</Text>
            <Text className="text-xs text-[#6B7280]">
              Standardized classification & wholesale produce indexing
            </Text>
          </View>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} color="#ffffff" />}
            onPress={handleOpenAdd}
          >
            Add Category
          </Button>
        </View>

        {/* Search Bar */}
        <View className="bg-white rounded-xl border border-[#E5E7EB] px-3 py-2 flex-row items-center gap-2">
          <Search size={16} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-xs text-[#1A1A1A] p-0"
            placeholder="Search crop categories..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {Boolean(searchQuery) && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={15} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* Categories List */}
        {filteredCategories.length === 0 ? (
          <EmptyState
            title="No Categories Found"
            description="Add a new crop category to expand Sri Lankan agricultural cataloguing."
            actionLabel="Add Category"
            onAction={handleOpenAdd}
          />
        ) : (
          <View style={{ gap: 10 }}>
            {filteredCategories.map(cat => (
              <Card key={cat.id} padding="md" style={{ gap: 10 }}>
                <View className="flex-row items-start gap-3">
                  {/* Category Visual */}
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: '#E6F2E8',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#CDE5D2',
                    }}
                  >
                    <ProduceVisual type={cat.name.toLowerCase()} size="sm" />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-bold text-[#1A1A1A]">{cat.name}</Text>
                      <View className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <Text className="text-[10px] font-bold text-emerald-800">
                          {cat.itemCount} Listings
                        </Text>
                      </View>
                    </View>

                    <Text className="text-xs text-[#6B7280] mt-1 leading-4">
                      {cat.description}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row justify-end items-center gap-2 pt-2 border-t border-[#F0F0EE]">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Pencil size={13} color="#1F5C3A" />}
                    onPress={() => handleOpenEdit(cat)}
                  >
                    <Text className="text-xs font-bold text-[#1F5C3A]">Edit</Text>
                  </Button>

                  <Pressable
                    onPress={() => handleDelete(cat.id, cat.name)}
                    className="p-2 rounded-lg bg-red-50 border border-red-200"
                  >
                    <Trash2 size={14} color="#DC2626" />
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* Add / Edit Category Modal */}
      <BottomSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        maxHeight="85%"
      >
        <View style={{ gap: 14 }}>
          {formError && (
            <View className="bg-red-50 p-2.5 rounded-lg border border-red-200">
              <Text className="text-xs text-red-700 font-semibold">{formError}</Text>
            </View>
          )}

          {/* Category Name */}
          <Input
            label="Category Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Exotic Fruits, Traditional Yams"
          />

          {/* Description */}
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Summary of produce varieties included..."
            multiline
            numberOfLines={3}
          />

          {/* Icon Preset Picker */}
          <View style={{ gap: 6 }}>
            <Text className="text-xs font-bold text-[#4B5563]">Category Produce Icon</Text>
            <View className="flex-row flex-wrap gap-2">
              {iconPresets.map(preset => {
                const isSelected = selectedIconName === preset.name;
                return (
                  <Pressable
                    key={preset.name}
                    onPress={() => setSelectedIconName(preset.name)}
                    className={`px-3 py-1.5 rounded-full border ${
                      isSelected
                        ? 'bg-[#1F5C3A] border-[#1F5C3A]'
                        : 'bg-white border-[#E5E7EB]'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? 'text-white' : 'text-[#4B5563]'
                      }`}
                    >
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Modal Action Buttons */}
          <View className="flex-row gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              style={{ flex: 1 }}
              onPress={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              style={{ flex: 2 }}
              leftIcon={<CheckCircle size={16} color="#ffffff" />}
              onPress={handleSave}
            >
              {editingCategory ? 'Update Category' : 'Save Category'}
            </Button>
          </View>
        </View>
      </BottomSheet>
    </ScrollView>
  );
};

// ===================== 5. ADMIN COMPLAINTS / TICKETS SCREEN =====================
export const AdminComplaintsScreen: React.FC = () => {
  const { complaints, goToSubScreen } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');

  const openCount = complaints.filter(
    c => c.status === 'open' || (c.status as string) === 'pending'
  ).length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const closedCount = complaints.filter(
    c => c.status === 'closed' || (c.status as string) === 'dismissed'
  ).length;

  const filteredComplaints = complaints.filter(c => {
    if (activeTab === 'open') return c.status === 'open' || (c.status as string) === 'pending';
    if (activeTab === 'in_progress') return c.status === 'in_progress';
    if (activeTab === 'resolved') return c.status === 'resolved';
    if (activeTab === 'closed') return c.status === 'closed' || (c.status as string) === 'dismissed';
    return true;
  });

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ gap: 14 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-black text-[#1A1A1A]">Support Tickets & Disputes</Text>
            <Text className="text-xs text-[#6B7280]">
              Wholesale dispute mediation, customer complaints, and support inquiries
            </Text>
          </View>
          <View className="bg-[#E6F2E8] px-2.5 py-1 rounded-full border border-[#CDE5D2]">
            <Text className="text-[10px] font-bold text-[#1F5C3A]">Live Sync</Text>
          </View>
        </View>

        {/* Tab Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {/* All */}
          <Pressable
            onPress={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-full border ${
              activeTab === 'all'
                ? 'bg-[#1F5C3A] border-[#1F5C3A]'
                : 'bg-white border-[#E5E7EB]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'all' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              All ({complaints.length})
            </Text>
          </Pressable>

          {/* Open */}
          <Pressable
            onPress={() => setActiveTab('open')}
            className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 ${
              activeTab === 'open'
                ? 'bg-[#B45309] border-[#B45309]'
                : 'bg-white border-[#E5E7EB]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'open' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Open
            </Text>
            {openCount > 0 && (
              <View
                className={`px-1.5 py-0.2 rounded-full ${
                  activeTab === 'open' ? 'bg-white' : 'bg-[#FEF3C7]'
                }`}
              >
                <Text
                  className={`text-[10px] font-black ${
                    activeTab === 'open' ? 'text-[#B45309]' : 'text-[#92400E]'
                  }`}
                >
                  {openCount}
                </Text>
              </View>
            )}
          </Pressable>

          {/* In Progress */}
          <Pressable
            onPress={() => setActiveTab('in_progress')}
            className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 ${
              activeTab === 'in_progress'
                ? 'bg-[#0284C7] border-[#0284C7]'
                : 'bg-white border-[#E5E7EB]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'in_progress' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              In Progress
            </Text>
            {inProgressCount > 0 && (
              <View
                className={`px-1.5 py-0.2 rounded-full ${
                  activeTab === 'in_progress' ? 'bg-white' : 'bg-[#E0F2FE]'
                }`}
              >
                <Text
                  className={`text-[10px] font-black ${
                    activeTab === 'in_progress' ? 'text-[#0284C7]' : 'text-[#0369A1]'
                  }`}
                >
                  {inProgressCount}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Resolved */}
          <Pressable
            onPress={() => setActiveTab('resolved')}
            className={`px-3 py-1.5 rounded-full border ${
              activeTab === 'resolved'
                ? 'bg-[#1F5C3A] border-[#1F5C3A]'
                : 'bg-white border-[#E5E7EB]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'resolved' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Resolved ({resolvedCount})
            </Text>
          </Pressable>

          {/* Closed */}
          <Pressable
            onPress={() => setActiveTab('closed')}
            className={`px-3 py-1.5 rounded-full border ${
              activeTab === 'closed'
                ? 'bg-[#4B5563] border-[#4B5563]'
                : 'bg-white border-[#E5E7EB]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'closed' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Closed ({closedCount})
            </Text>
          </Pressable>
        </ScrollView>

        {/* Complaints Cards List */}
        {filteredComplaints.length === 0 ? (
          <EmptyState
            title="No Tickets Found"
            description="Zero support tickets matching the selected filter status."
          />
        ) : (
          <View style={{ gap: 10 }}>
            {filteredComplaints.map(complaint => {
              const ticketNo =
                complaint.ticketNumber ||
                `TCK-${complaint._id.slice(-4).toUpperCase()}`;

              return (
                <Pressable
                  key={complaint._id}
                  onPress={() =>
                    goToSubScreen('admin_complaint_detail', {
                      complaintId: complaint._id,
                      ticketId: complaint._id,
                    })
                  }
                >
                  <Card padding="md" style={{ gap: 10 }}>
                    {/* Header: Ticket # & Status */}
                    <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
                      <View className="flex-row items-center gap-2">
                        <View className="bg-[#E6F2E8] px-2 py-0.5 rounded border border-[#CDE5D2]">
                          <Text className="text-[10px] font-black text-[#1F5C3A]">
                            {ticketNo}
                          </Text>
                        </View>
                        {Boolean(complaint.category) && (
                          <View className="bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                            <Text className="text-[10px] font-bold text-[#4B5563]">
                              {complaint.category}
                            </Text>
                          </View>
                        )}
                      </View>

                      <StatusPill status={complaint.status} />
                    </View>

                    {/* Complaint Subject / Reason */}
                    <Text className="text-sm font-bold text-[#1A1A1A]">
                      {complaint.subject || complaint.reason || 'Support Ticket'}
                    </Text>

                    {/* Parties Row */}
                    <View className="bg-[#F9FAFB] p-2.5 rounded-lg border border-[#E5E7EB] gap-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[11px] text-[#6B7280]">
                          Reporter:{' '}
                          <Text className="font-bold text-[#1A1A1A]">
                            {complaint.buyerName || complaint.complainantName || 'Buyer'}
                          </Text>
                          {Boolean(complaint.buyerPhone) && (
                            <Text className="text-[#6B7280]"> ({complaint.buyerPhone})</Text>
                          )}
                        </Text>
                        {complaint.orderId ? (
                          <Text className="text-[10px] font-bold text-[#1F5C3A]">
                            Order #{complaint.orderId.slice(-6)}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Last message / details preview */}
                    <Text className="text-xs text-[#4B5563] leading-4" numberOfLines={2}>
                      {complaint.lastMessage || complaint.description || complaint.details}
                    </Text>

                    {/* Footer Row */}
                    <View className="flex-row items-center justify-between pt-2 border-t border-[#F0F0EE]">
                      <Text className="text-[10px] text-[#9CA3AF]">
                        Updated: {new Date(complaint.updatedAt || complaint.createdAt).toLocaleDateString()}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Text className="text-xs font-bold text-[#1F5C3A]">
                          Open Thread & Reply
                        </Text>
                        <ChevronRight size={14} color="#1F5C3A" />
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// ===================== 6. ADMIN COMPLAINT DETAIL & LIVE CHAT SCREEN =====================
export const AdminComplaintDetailScreen: React.FC = () => {
  const {
    navState,
    complaints,
    adminUpdateTicketStatus,
    sendTicketMessage,
    listenToTicketMessages,
    adminResolveComplaint,
    adminWarnUser,
    adminRemoveListingFromComplaint,
    goBack,
  } = useApp();

  const complaintId = navState.selectedTicketId || navState.selectedComplaintId;
  const complaint =
    complaints.find(c => c._id === complaintId) ||
    complaints.find(c => c.status === 'open' || (c.status as string) === 'pending') ||
    complaints[0];

  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Real-time onSnapshot listener for messages
  useEffect(() => {
    if (!complaint?._id) return;
    const unsubscribe = listenToTicketMessages(complaint._id, (liveMsgs) => {
      setMessages(liveMsgs);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => unsubscribe();
  }, [complaint?._id]);

  if (!complaint) {
    return (
      <View className="flex-1 bg-[#F6F7F5] p-4 items-center justify-center">
        <Text className="text-sm font-bold text-[#1A1A1A]">Ticket not found</Text>
        <Button variant="primary" size="sm" onPress={goBack} className="mt-3">
          Back to Complaints
        </Button>
      </View>
    );
  }

  const ticketNo =
    complaint.ticketNumber ||
    `TCK-${complaint._id.slice(-4).toUpperCase()}`;

  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      await sendTicketMessage(complaint._id, text);
      setReplyText('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (statusUpdating || complaint.status === newStatus) return;
    setStatusUpdating(true);
    try {
      await adminUpdateTicketStatus(complaint._id, newStatus);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Enforcement action 1: Remove Listing
  const handleRemoveListing = () => {
    if (!complaint.targetId) {
      Alert.alert('No Listing', 'This ticket is not linked to a specific listing.');
      return;
    }
    Alert.alert(
      'Remove Public Listing',
      `Are you sure you want to take down listing "${complaint.targetName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Listing',
          style: 'destructive',
          onPress: async () => {
            if (complaint.targetId) {
              await adminRemoveListingFromComplaint(
                complaint._id,
                complaint.targetId,
                'Listing delisted by Platform Administrator due to verified ticket.'
              );
              Alert.alert('Listing Removed', 'The produce listing has been pulled.');
            }
          },
        },
      ]
    );
  };

  // Enforcement action 2: Warn User
  const handleWarnUser = () => {
    Alert.alert(
      'Issue Warning',
      `Issue an official administrative warning regarding this ticket?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Issue Warning',
          onPress: async () => {
            await adminWarnUser(
              complaint._id,
              `Official administrative warning issued. Violation recorded.`
            );
            Alert.alert('Warning Issued', 'Formal compliance warning recorded.');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#F6F7F5]">
      {/* Top Navigation Bar */}
      <View className="bg-white border-b border-[#E5E7EB] px-4 py-3 flex-row items-center gap-3">
        <Pressable
          onPress={goBack}
          className="w-9 h-9 rounded-full bg-[#F3F4F6] items-center justify-center border border-[#E5E7EB]"
        >
          <ArrowLeft size={18} color="#1A1A1A" />
        </Pressable>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-extrabold text-[#1A1A1A]">
              {ticketNo}
            </Text>
            <StatusPill status={complaint.status} />
          </View>
          <Text className="text-[11px] text-[#6B7280]" numberOfLines={1}>
            {complaint.subject || complaint.reason || 'Support Ticket'}
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 24, gap: 14 }}
      >
        {/* Ticket Overview Card */}
        <Card padding="md" style={{ gap: 10 }}>
          <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
            <View>
              <Text className="text-xs font-bold text-[#1A1A1A]">
                Category: {complaint.category || 'General Support'}
              </Text>
              <Text className="text-[10px] text-[#6B7280]">
                Filed: {new Date(complaint.createdAt).toLocaleString()}
              </Text>
            </View>
            {complaint.orderId ? (
              <View className="bg-[#E6F2E8] px-2 py-0.5 rounded border border-[#CDE5D2]">
                <Text className="text-[10px] font-bold text-[#1F5C3A]">
                  Order #{complaint.orderId.slice(-6)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Reporter details */}
          <View className="bg-[#F9FAFB] p-2.5 rounded-lg border border-[#E5E7EB] gap-1">
            <Text className="text-xs font-bold text-[#1A1A1A]">
              Buyer: {complaint.buyerName || complaint.complainantName || 'Buyer'}
            </Text>
            {Boolean(complaint.buyerPhone) && (
              <Text className="text-[11px] text-[#6B7280]">Phone: {complaint.buyerPhone}</Text>
            )}
            {Boolean(complaint.buyerEmail) && (
              <Text className="text-[11px] text-[#6B7280]">Email: {complaint.buyerEmail}</Text>
            )}
          </View>

          {/* Initial issue description */}
          <View className="gap-1">
            <Text className="text-[11px] font-bold text-[#6B7280] uppercase">
              Initial Issue Description:
            </Text>
            <Text className="text-xs text-[#1A1A1A] leading-5">
              {complaint.description || complaint.details || complaint.subject}
            </Text>
          </View>

          {/* Resolution note if resolved */}
          {Boolean(complaint.resolutionNote) && (
            <View className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg gap-1">
              <View className="flex-row items-center gap-1.5">
                <CheckCircle size={13} color="#15803D" />
                <Text className="text-xs font-bold text-[#15803D]">Resolution Decision</Text>
              </View>
              <Text className="text-xs text-emerald-900 leading-4">
                {complaint.resolutionNote}
              </Text>
            </View>
          )}
        </Card>

        {/* Status Control Bar */}
        <Card padding="md" style={{ gap: 8 }}>
          <Text className="text-xs font-bold text-[#1A1A1A]">
            Ticket Lifecycle Status:
          </Text>
          <View className="flex-row gap-2 flex-wrap">
            {(['open', 'in_progress', 'resolved', 'closed'] as TicketStatus[]).map(st => {
              const isActive = complaint.status === st;
              return (
                <Pressable
                  key={st}
                  onPress={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 rounded-full border ${
                    isActive
                      ? st === 'open'
                        ? 'bg-[#B45309] border-[#B45309]'
                        : st === 'in_progress'
                        ? 'bg-[#0284C7] border-[#0284C7]'
                        : st === 'resolved'
                        ? 'bg-[#1F5C3A] border-[#1F5C3A]'
                        : 'bg-[#4B5563] border-[#4B5563]'
                      : 'bg-white border-[#E5E7EB]'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold capitalize ${
                      isActive ? 'text-white' : 'text-[#4B5563]'
                    }`}
                  >
                    {st === 'in_progress' ? 'In Progress' : st}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Live Conversation Messages Thread */}
        <View style={{ gap: 8 }}>
          <View className="flex-row items-center justify-between px-1">
            <Text className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              Live Conversation Thread ({messages.length})
            </Text>
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2 rounded-full bg-[#1F5C3A]" />
              <Text className="text-[10px] text-[#1F5C3A] font-bold">Real-Time Sync</Text>
            </View>
          </View>

          {messages.length === 0 ? (
            <Card padding="md" className="items-center py-6">
              <MessageSquare size={22} color="#9CA3AF" />
              <Text className="text-xs text-[#6B7280] mt-1 font-semibold">
                No replies recorded yet
              </Text>
              <Text className="text-[10px] text-[#9CA3AF]">
                Send an official message below to begin resolution.
              </Text>
            </Card>
          ) : (
            <View style={{ gap: 8 }}>
              {messages.map(msg => {
                const isAdmin = msg.senderRole === 'admin';
                return (
                  <View
                    key={msg._id}
                    className={`p-3 rounded-xl border max-w-[85%] ${
                      isAdmin
                        ? 'bg-[#E6F2E8] border-[#CDE5D2] self-end'
                        : 'bg-white border-[#E5E7EB] self-start'
                    }`}
                  >
                    <View className="flex-row items-center justify-between gap-3 mb-1">
                      <Text
                        className={`text-[11px] font-bold ${
                          isAdmin ? 'text-[#1F5C3A]' : 'text-[#1A1A1A]'
                        }`}
                      >
                        {isAdmin ? 'Platform Support' : msg.senderName || 'Buyer'}
                      </Text>
                      <Text className="text-[9px] text-[#9CA3AF]">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </Text>
                    </View>
                    <Text className="text-xs text-[#1A1A1A] leading-4">
                      {msg.message}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Enforcement Actions if needed */}
        {complaint.targetId ? (
          <View className="flex-row gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              style={{ flex: 1, borderColor: '#FCA5A5' }}
              leftIcon={<Trash2 size={13} color="#DC2626" />}
              onPress={handleRemoveListing}
            >
              Delist Crop
            </Button>
            <Button
              variant="outline"
              size="sm"
              style={{ flex: 1, borderColor: '#FDE68A' }}
              leftIcon={<AlertTriangle size={13} color="#B45309" />}
              onPress={handleWarnUser}
            >
              Warn User
            </Button>
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom Reply Bar */}
      <View className="bg-white border-t border-[#E5E7EB] p-3 flex-row items-center gap-2">
        <TextInput
          className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full px-4 py-2 text-xs text-[#1A1A1A]"
          placeholder="Reply officially to buyer..."
          placeholderTextColor="#9CA3AF"
          value={replyText}
          onChangeText={setReplyText}
          multiline={false}
          onSubmitEditing={handleSendReply}
        />
        <Pressable
          onPress={handleSendReply}
          disabled={!replyText.trim() || sending}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            replyText.trim() && !sending ? 'bg-[#1F5C3A]' : 'bg-[#E5E7EB]'
          }`}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Send size={16} color={replyText.trim() ? '#FFFFFF' : '#9CA3AF'} />
          )}
        </Pressable>
      </View>
    </View>
  );
};

// ===================== MAIN ADMIN SCREENS ROUTER =====================
export const AdminScreens: React.FC = () => {
  const { navState } = useApp();

  // 1. Sub-Screens (Detail screens) - bottom nav is hidden on these automatically
  if (navState.subScreen === 'admin_user_verification') {
    return <AdminUserVerificationScreen />;
  }

  if (navState.subScreen === 'admin_complaint_detail') {
    return <AdminComplaintDetailScreen />;
  }

  // 2. Top-level tab screens - bottom nav is visible on these
  switch (navState.activeTab) {
    case 'users':
      return <AdminUsersScreen />;
    case 'categories':
      return <AdminCategoriesScreen />;
    case 'complaints':
      return <AdminComplaintsScreen />;
    case 'dashboard':
    default:
      return <AdminDashboardScreen />;
  }
};
