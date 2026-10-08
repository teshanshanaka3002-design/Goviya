import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, TextInput, Alert } from 'react-native';
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
import { User, Complaint, CropCategory } from '../../types';

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

  const pendingVerificationUsers = users.filter(u => !u.verified);
  const pendingComplaints = complaints.filter(c => c.status === 'pending');

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const totalGrossLkr = platformStats.totalTransactionsLkr + orders.reduce((sum, o) => sum + o.total, 0);

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
          <Card variant="mint" padding="md" style={{ width: '48%' }}>
            <View className="flex-row items-center justify-between">
              <Text className="text-[10px] text-[#4B6B56] uppercase font-bold">Total Orders</Text>
              <Package size={14} color="#1F5C3A" />
            </View>
            <Text className="text-2xl font-black text-[#1F5C3A] mt-1">{totalOrdersCount}</Text>
            <Text className="text-[10px] text-[#4B6B56] font-semibold mt-0.5">
              {pendingOrdersCount} pending farmer action
            </Text>
          </Card>

          <Card padding="md" style={{ width: '48%' }}>
            <View className="flex-row items-center justify-between">
              <Text className="text-[10px] text-[#6B7280] uppercase font-bold">Gross (LKR)</Text>
              <DollarSign size={14} color="#6B7280" />
            </View>
            <Text className="text-xl font-black text-[#1A1A1A] mt-1">
              {(totalGrossLkr / 1000000).toFixed(2)}M LKR
            </Text>
            <Text className="text-[10px] text-[#1F5C3A] font-semibold mt-0.5">
              Direct trade volume
            </Text>
          </Card>

          <Card padding="md" style={{ width: '48%' }}>
            <Text className="text-[10px] text-[#6B7280] uppercase font-bold">Active Producers</Text>
            <Text className="text-xl font-black text-[#1A1A1A] mt-1">
              {platformStats.totalFarmers.toLocaleString()}
            </Text>
            <Text className="text-[10px] text-[#1F5C3A] font-semibold">+12% this month</Text>
          </Card>

          <Pressable style={{ width: '48%' }} onPress={() => setTab('users')}>
            <Card padding="md" style={{ borderColor: '#FDE68A', backgroundColor: '#FFFDF5' }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-[10px] text-[#6B7280] uppercase font-bold">Pending Reviews</Text>
                <ChevronRight size={14} color="#B45309" />
              </View>
              <Text className="text-xl font-black text-[#B45309] mt-1">
                {pendingVerificationUsers.length + pendingComplaints.length}
              </Text>
              <Text className="text-[10px] text-[#B45309] font-semibold">Tap to view queue</Text>
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
                      <Avatar name={user.name} size="md" role={user.role} />
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

                <View className="flex-row justify-between items-center">
                  <View className="flex-1 mr-2">
                    <Text className="text-xs text-[#4B5563]">
                      <Text className="font-semibold text-[#1A1A1A]">{order.farmerName}</Text> →{' '}
                      <Text className="font-semibold text-[#1A1A1A]">{order.buyerName}</Text>
                    </Text>
                    <Text className="text-[10px] text-[#6B7280] mt-0.5">
                      {order.items.map(i => `${i.cropName} (${i.quantityKg}kg)`).join(', ')}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs font-black text-[#1F5C3A]">
                      LKR {order.total.toLocaleString()}
                    </Text>
                    <Text className="text-[9px] text-[#6B7280]">
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

        {/* Dispute Resolution & Complaints Queue */}
        <View style={{ gap: 8 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-[#1A1A1A]">Dispute Tickets ({pendingComplaints.length})</Text>
            <Pressable onPress={() => setTab('complaints')}>
              <Text className="text-xs text-[#1F5C3A] font-bold">View all complaints →</Text>
            </Pressable>
          </View>
          {pendingComplaints.length === 0 ? (
            <Card padding="md" className="items-center py-5">
              <ShieldCheck size={20} color="#1F5C3A" />
              <Text className="text-xs text-[#1F5C3A] font-bold mt-1">Zero Active Disputes</Text>
              <Text className="text-[10px] text-[#6B7280]">All trade dispute tickets have been addressed</Text>
            </Card>
          ) : (
            pendingComplaints.map(complaint => (
              <Pressable
                key={complaint._id}
                onPress={() =>
                  goToSubScreen('admin_complaint_detail', { complaintId: complaint._id })
                }
              >
                <Card padding="md" style={{ gap: 10 }}>
                  <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
                    <View className="flex-1 mr-2">
                      <Text className="text-xs font-bold text-[#1A1A1A]">{complaint.reason}</Text>
                      <Text className="text-[10px] text-[#6B7280]">
                        Reporter: {complaint.complainantName} · Target: {complaint.targetName} ({complaint.targetType})
                      </Text>
                    </View>
                    <StatusPill status={complaint.status} />
                  </View>

                  <Text className="text-xs text-[#4B5563]">
                    {complaint.details}
                  </Text>

                  <View className="flex-row justify-end gap-2 pt-2 border-t border-[#F0F0EE]">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye size={13} color="#4B5563" />}
                      onPress={() =>
                        goToSubScreen('admin_complaint_detail', { complaintId: complaint._id })
                      }
                    >
                      Audit & Resolve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => adminResolveComplaint(complaint._id, 'dismissed', 'Dismissed after review')}
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => adminResolveComplaint(complaint._id, 'resolved', 'Refund / replacement initiated')}
                    >
                      Resolve Dispute
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
  const pendingUsers = users.filter(u => !u.verified);

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
        u.phone.includes(query) ||
        (u.farmName && u.farmName.toLowerCase().includes(query)) ||
        (u.location?.town && u.location.town.toLowerCase().includes(query)) ||
        (u.location?.district && u.location.district.toLowerCase().includes(query))
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
                              user.role === 'farmer' ? 'bg-[#ECFDF5]' : 'bg-[#EFF6FF]'
                            }`}
                          >
                            <Text
                              className={`text-[10px] font-bold ${
                                user.role === 'farmer' ? 'text-[#065F46]' : 'text-[#1D4ED8]'
                              }`}
                            >
                              {user.role === 'farmer' ? 'Farmer' : 'Wholesale Buyer'}
                            </Text>
                          </View>
                        </View>

                        {/* Farm name if farmer */}
                        {Boolean(user.farmName) && (
                          <Text className="text-xs font-semibold text-[#1F5C3A] mt-0.5">
                            {user.farmName} · {user.farmSizeAcres || 3.5} Ac
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
                          Verify
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

          <View className="bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB] flex-row justify-between items-center">
            <View>
              <Text className="text-[10px] font-bold text-[#6B7280] uppercase">NIC Number</Text>
              <Text className="text-sm font-black text-[#1A1A1A] mt-0.5">
                {user.nicNumber || '198214502891'}
              </Text>
            </View>
            <View className="items-end">
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

// ===================== 5. ADMIN COMPLAINTS SCREEN =====================
export const AdminComplaintsScreen: React.FC = () => {
  const { complaints, goToSubScreen } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');

  const pendingCount = complaints.filter(c => c.status === 'pending').length;

  const filteredComplaints = complaints.filter(c => {
    if (activeTab === 'pending') return c.status === 'pending';
    if (activeTab === 'resolved') return c.status === 'resolved';
    if (activeTab === 'dismissed') return c.status === 'dismissed';
    return true;
  });

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] p-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ gap: 14 }}>
        {/* Header */}
        <View>
          <Text className="text-lg font-black text-[#1A1A1A]">Dispute Tickets & Complaints</Text>
          <Text className="text-xs text-[#6B7280]">
            Wholesale trade mediation, policy violations, and dispute adjudication
          </Text>
        </View>

        {/* Tab Filters */}
        <View className="flex-row gap-2">
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

          {/* Pending */}
          <Pressable
            onPress={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 ${
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
            {pendingCount > 0 && (
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
                  {pendingCount}
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
              Resolved
            </Text>
          </Pressable>

          {/* Dismissed */}
          <Pressable
            onPress={() => setActiveTab('dismissed')}
            className={`px-3 py-1.5 rounded-full border ${
              activeTab === 'dismissed'
                ? 'bg-[#1F5C3A] border-[#1F5C3A]'
                : 'bg-white border-[#E5E7EB]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'dismissed' ? 'text-white' : 'text-[#4B5563]'
              }`}
            >
              Dismissed
            </Text>
          </Pressable>
        </View>

        {/* Complaints Cards List */}
        {filteredComplaints.length === 0 ? (
          <EmptyState
            title="No Dispute Tickets"
            description="Zero complaints matching the selected filter status."
          />
        ) : (
          <View style={{ gap: 10 }}>
            {filteredComplaints.map(complaint => {
              const isHigh = complaint.severity === 'high';
              const isMedium = complaint.severity === 'medium';

              return (
                <Pressable
                  key={complaint._id}
                  onPress={() =>
                    goToSubScreen('admin_complaint_detail', { complaintId: complaint._id })
                  }
                >
                  <Card padding="md" style={{ gap: 10 }}>
                    {/* Header: Severity & Status */}
                    <View className="flex-row items-center justify-between border-b border-[#F0F0EE] pb-2">
                      {/* Severity Tag */}
                      <View
                        className={`px-2 py-0.5 rounded border ${
                          isHigh
                            ? 'bg-red-50 border-red-200'
                            : isMedium
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-black uppercase ${
                            isHigh
                              ? 'text-red-700'
                              : isMedium
                              ? 'text-amber-700'
                              : 'text-blue-700'
                          }`}
                        >
                          {complaint.severity} Severity
                        </Text>
                      </View>

                      <StatusPill status={complaint.status} />
                    </View>

                    {/* Complaint Reason */}
                    <Text className="text-sm font-bold text-[#1A1A1A]">
                      {complaint.reason}
                    </Text>

                    {/* Parties Row */}
                    <View className="bg-[#F9FAFB] p-2.5 rounded-lg border border-[#E5E7EB] gap-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[11px] text-[#6B7280]">
                          Reporter:{' '}
                          <Text className="font-bold text-[#1A1A1A]">
                            {complaint.complainantName}
                          </Text>
                        </Text>
                        <Text className="text-[10px] text-[#6B7280]">
                          Target: {complaint.targetType.toUpperCase()}
                        </Text>
                      </View>

                      <Text className="text-[11px] text-[#6B7280]">
                        Reported Subject:{' '}
                        <Text className="font-bold text-[#1F5C3A]">
                          {complaint.targetName}
                        </Text>
                      </Text>
                    </View>

                    {/* Short Description */}
                    <Text className="text-xs text-[#4B5563] leading-4" numberOfLines={2}>
                      {complaint.details}
                    </Text>

                    {/* Footer Row */}
                    <View className="flex-row items-center justify-between pt-2 border-t border-[#F0F0EE]">
                      <Text className="text-[10px] text-[#9CA3AF]">
                        Filed: {new Date(complaint.createdAt).toLocaleDateString()}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Text className="text-xs font-bold text-[#1F5C3A]">
                          View Evidence & Resolve
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

// ===================== 6. ADMIN COMPLAINT DETAIL SCREEN =====================
export const AdminComplaintDetailScreen: React.FC = () => {
  const {
    navState,
    complaints,
    adminResolveComplaint,
    adminWarnUser,
    adminRemoveListingFromComplaint,
    goBack,
  } = useApp();

  const complaintId = navState.selectedComplaintId;
  const complaint =
    complaints.find(c => c._id === complaintId) ||
    complaints.find(c => c.status === 'pending') ||
    complaints[0];

  if (!complaint) {
    return (
      <View className="flex-1 bg-[#F6F7F5] p-4 items-center justify-center">
        <Text className="text-sm font-bold text-[#1A1A1A]">Complaint ticket not found</Text>
        <Button variant="primary" size="sm" onPress={goBack} className="mt-3">
          Back to Complaints
        </Button>
      </View>
    );
  }

  const isPending = complaint.status === 'pending';
  const isHigh = complaint.severity === 'high';
  const isMedium = complaint.severity === 'medium';

  const evidencePhotos = complaint.evidencePhotos || [
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=600&auto=format&fit=crop&q=80',
  ];

  // Action 1: Remove Listing
  const handleRemoveListing = () => {
    Alert.alert(
      'Remove Public Listing',
      `Are you sure you want to take down listing "${complaint.targetName}"? It will be immediately pulled from the wholesale marketplace.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Listing',
          style: 'destructive',
          onPress: () => {
            adminRemoveListingFromComplaint(
              complaint._id,
              complaint.targetId,
              'Listing delisted by Platform Administrator due to verified weight/grading policy violations.'
            );
            Alert.alert('Listing Removed', 'The reported produce listing has been removed from marketplace.');
            goBack();
          },
        },
      ]
    );
  };

  // Action 2: Warn User
  const handleWarnUser = () => {
    Alert.alert(
      'Issue Warning',
      `Issue an official administrative compliance warning to ${complaint.targetName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Issue Warning',
          onPress: () => {
            adminWarnUser(
              complaint._id,
              `Official administrative warning issued to ${complaint.targetName}. Violation recorded in producer audit file.`
            );
            Alert.alert('Warning Issued', `Formal warning recorded on ${complaint.targetName}'s account.`);
            goBack();
          },
        },
      ]
    );
  };

  // Action 3: Dismiss Report
  const handleDismissReport = () => {
    Alert.alert(
      'Dismiss Dispute Ticket',
      'Dismiss this complaint without penalty if evidence is insufficient or parties settled directly?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss Ticket',
          style: 'destructive',
          onPress: () => {
            adminResolveComplaint(
              complaint._id,
              'dismissed',
              'Dismissed after investigation - insufficient proof of default or mutually settled.'
            );
            Alert.alert('Ticket Dismissed', 'Dispute complaint has been marked dismissed.');
            goBack();
          },
        },
      ]
    );
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
              Dispute Ticket Investigation
            </Text>
            <Text className="text-[11px] text-[#6B7280]">
              Ticket #{complaint._id.toUpperCase()} · Administrative Mediation
            </Text>
          </View>
        </View>

        {/* Case Overview Card */}
        <Card padding="md" style={{ gap: 10 }}>
          <View className="flex-row items-center justify-between pb-2 border-b border-[#F0F0EE]">
            <View
              className={`px-2 py-0.5 rounded border ${
                isHigh
                  ? 'bg-red-50 border-red-200'
                  : isMedium
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <Text
                className={`text-[10px] font-black uppercase ${
                  isHigh ? 'text-red-700' : isMedium ? 'text-amber-700' : 'text-blue-700'
                }`}
              >
                {complaint.severity} Severity
              </Text>
            </View>

            <StatusPill status={complaint.status} />
          </View>

          <Text className="text-base font-black text-[#1A1A1A]">
            {complaint.reason}
          </Text>

          <Text className="text-xs text-[#4B5563] leading-5">
            {complaint.details}
          </Text>

          <Text className="text-[10px] text-[#9CA3AF] pt-1">
            Filed on: {new Date(complaint.createdAt).toLocaleString()}
          </Text>
        </Card>

        {/* Involved Parties Section */}
        <View style={{ gap: 8 }}>
          <Text className="text-sm font-bold text-[#1A1A1A]">Involved Parties</Text>
          <View className="flex-row gap-2.5">
            {/* Complainant Party */}
            <Card padding="md" className="flex-1 bg-white gap-1 border border-blue-100">
              <Text className="text-[10px] font-bold text-blue-700 uppercase">Reporter Party</Text>
              <Text className="text-xs font-black text-[#1A1A1A]" numberOfLines={1}>
                {complaint.complainantName}
              </Text>
              <Text className="text-[10px] text-[#6B7280]">
                ID: {complaint.complainantId}
              </Text>
            </Card>

            {/* Target Subject */}
            <Card padding="md" className="flex-1 bg-white gap-1 border border-amber-100">
              <Text className="text-[10px] font-bold text-amber-700 uppercase">
                Reported {complaint.targetType.toUpperCase()}
              </Text>
              <Text className="text-xs font-black text-[#1A1A1A]" numberOfLines={1}>
                {complaint.targetName}
              </Text>
              <Text className="text-[10px] text-[#6B7280]">
                ID: {complaint.targetId}
              </Text>
            </Card>
          </View>
        </View>

        {/* Full Evidence Section */}
        <View style={{ gap: 8 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-[#1A1A1A]">
              Submitted Evidence & Photos ({evidencePhotos.length})
            </Text>
            <Text className="text-[10px] text-[#6B7280]">Audit Documentation</Text>
          </View>

          <View className="flex-row gap-2.5">
            {evidencePhotos.map((url, idx) => (
              <View
                key={idx}
                style={{
                  flex: 1,
                  height: 150,
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: '#F3F4F6',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}
              >
                <Image
                  source={{ uri: url }}
                  style={{ width: '100%', height: 150 }}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>

          <Card padding="sm" className="bg-[#F9FAFB] border border-[#E5E7EB]">
            <Text className="text-[11px] text-[#4B5563] leading-4">
              📌 Evidence includes electronic weighbridge printouts, crates packing stamps, and verified batch delivery notes.
            </Text>
          </Card>
        </View>

        {/* Resolution Note if not pending */}
        {Boolean(complaint.resolutionNote) && (
          <Card padding="md" className="bg-emerald-50 border border-emerald-200 gap-1.5">
            <View className="flex-row items-center gap-1.5">
              <CheckCircle size={15} color="#15803D" />
              <Text className="text-xs font-bold text-[#15803D]">Administrative Resolution Decision</Text>
            </View>
            <Text className="text-xs text-emerald-900 leading-4">
              {complaint.resolutionNote}
            </Text>
          </Card>
        )}

        {/* Three Actions (Visible if pending) */}
        {isPending && (
          <View style={{ gap: 10, paddingTop: 4 }}>
            <Text className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Enforcement Actions
            </Text>

            {/* 1. Remove Listing */}
            <Button
              variant="outline"
              size="lg"
              style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}
              leftIcon={<Trash2 size={16} color="#DC2626" />}
              onPress={handleRemoveListing}
            >
              <Text className="text-sm font-bold text-[#DC2626]">Remove Listing</Text>
            </Button>

            {/* 2. Warn User */}
            <Button
              variant="outline"
              size="lg"
              style={{ borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }}
              leftIcon={<AlertTriangle size={16} color="#B45309" />}
              onPress={handleWarnUser}
            >
              <Text className="text-sm font-bold text-[#B45309]">Warn User</Text>
            </Button>

            {/* 3. Dismiss Report */}
            <Button
              variant="outline"
              size="lg"
              leftIcon={<XCircle size={16} color="#4B5563" />}
              onPress={handleDismissReport}
            >
              <Text className="text-sm font-bold text-[#4B5563]">Dismiss Report</Text>
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
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
