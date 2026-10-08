import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
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
} from 'lucide-react-native';
import { useApp } from '../../services/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Avatar } from '../../components/ui/Avatar';
import { User, Complaint } from '../../types';

// ===================== 1. ADMIN DASHBOARD SCREEN =====================
export const AdminDashboardScreen: React.FC = () => {
  const {
    platformStats,
    users,
    complaints,
    orders,
    adminVerifyUser,
    adminResolveComplaint,
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

          <Card padding="md" style={{ width: '48%' }}>
            <Text className="text-[10px] text-[#6B7280] uppercase font-bold">Pending Reviews</Text>
            <Text className="text-xl font-black text-[#B45309] mt-1">
              {pendingVerificationUsers.length + pendingComplaints.length}
            </Text>
            <Text className="text-[10px] text-[#B45309] font-semibold">Verification & Tickets</Text>
          </Card>
        </View>

        {/* Verification Queue */}
        <View style={{ gap: 8 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-[#1A1A1A]">Pending Verifications ({pendingVerificationUsers.length})</Text>
            <Text className="text-[10px] text-[#6B7280]">KYC & Producer Audit</Text>
          </View>
          {pendingVerificationUsers.length === 0 ? (
            <Card padding="md" className="items-center py-5">
              <CheckCircle size={20} color="#1F5C3A" />
              <Text className="text-xs text-[#1F5C3A] font-bold mt-1">All Accounts Verified</Text>
              <Text className="text-[10px] text-[#6B7280]">No pending KYC applications awaiting review</Text>
            </Card>
          ) : (
            pendingVerificationUsers.map(user => (
              <Card key={user._id} padding="md" style={{ gap: 10 }}>
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
            ))
          )}
        </View>

        {/* Dispute Resolution & Complaints Queue */}
        <View style={{ gap: 8 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-[#1A1A1A]">Dispute Tickets ({pendingComplaints.length})</Text>
            <Text className="text-[10px] text-[#6B7280]">Buyer & Seller Support</Text>
          </View>
          {pendingComplaints.length === 0 ? (
            <Card padding="md" className="items-center py-5">
              <ShieldCheck size={20} color="#1F5C3A" />
              <Text className="text-xs text-[#1F5C3A] font-bold mt-1">Zero Active Disputes</Text>
              <Text className="text-[10px] text-[#6B7280]">All trade dispute tickets have been addressed</Text>
            </Card>
          ) : (
            pendingComplaints.map(complaint => (
              <Card key={complaint._id} padding="md" style={{ gap: 10 }}>
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
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

// Main Admin Screens Router Container
export const AdminScreens: React.FC = () => {
  return <AdminDashboardScreen />;
};
