import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import {
  ChevronLeft,
  ShoppingCart,
  Shuffle,
  Check,
  LogIn,
  LogOut,
  Lock,
} from 'lucide-react-native';
import { useApp } from '../../services/store';
import { Role } from '../../types';
import { GoviyaLogo } from './GoviyaLogo';

export interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const {
    currentUser,
    currentRole,
    navState,
    goBack,
    switchRole,
    openAuth,
    logout,
    cart,
    setTab,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roleTitles: Record<Role, string> = {
    buyer: currentUser ? 'Buyer Portal' : 'Marketplace (Guest)',
    farmer: 'Farmer Studio',
    driver: 'Logistics Fleet',
    admin: 'Platform Admin',
  };

  const roleBadges: Record<Role, { label: string; bg: string; text: string }> = {
    buyer: {
      label: currentUser ? 'Buyer' : 'Guest Buyer',
      bg: 'bg-[#E6F2E8]',
      text: 'text-[#1F5C3A]',
    },
    farmer: { label: 'Farmer', bg: 'bg-[#FEF8EA]', text: 'text-[#B45309]' },
    driver: { label: 'Driver', bg: 'bg-[#EEF8FA]', text: 'text-[#19768A]' },
    admin: { label: 'Admin', bg: 'bg-[#F3E8FF]', text: 'text-[#7C3AED]' },
  };

  const subScreenTitles: Record<string, string> = {
    product_detail: 'Crop Details',
    cart: 'Shopping Cart',
    checkout: 'Checkout & Delivery',
    order_confirmation: 'Order Confirmed',
    order_tracking: 'Live Delivery Tracking',
    my_orders: 'My Orders',
    chat_list: 'Messages',
    chat_detail: 'Direct Chat',
    market_prices: 'Official Mandi Rates',
    nearby_map: 'Nearby Producers Map',
    add_listing: 'Post New Harvest',
  };

  const effectiveTitle =
    title || (navState.subScreen ? subScreenTitles[navState.subScreen] || '' : '');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  const currentBadge = roleBadges[currentRole];

  return (
    <View className="w-full bg-white border-b border-[#E5E5E5] px-4 py-2.5 z-30">
      <View className="flex-row items-center justify-between">
        {/* Left Slot */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 6 }}>
          {showBack || navState.subScreen ? (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                { padding: 6, marginLeft: -4, borderRadius: 10, backgroundColor: '#F1F5F9' },
                pressed && { opacity: 0.75, backgroundColor: '#E2E8F0' },
              ]}
            >
              <ChevronLeft size={20} color="#1A1A1A" strokeWidth={2.5} />
            </Pressable>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
              <GoviyaLogo size={28} />
              <View style={{ flexShrink: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', lineHeight: 18 }}>
                  Goviya
                </Text>
                <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '500' }} numberOfLines={1}>
                  {roleTitles[currentRole]}
                </Text>
              </View>
            </View>
          )}

          {effectiveTitle ? (
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A', flex: 1, marginLeft: 2 }} numberOfLines={1}>
              {effectiveTitle}
            </Text>
          ) : null}
        </View>

        {/* Right Slot */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {rightAction ? (
            rightAction
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {!currentUser && !navState.subScreen && (
                <Pressable
                  onPress={() => openAuth('buyer')}
                  style={({ pressed }) => [
                    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, backgroundColor: '#1F5C3A' },
                    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <LogIn size={11} color="#ffffff" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff' }}>Sign In</Text>
                </Pressable>
              )}

              {/* Role Switcher Pill */}
              <Pressable
                onPress={() => setShowRoleMenu(true)}
                style={({ pressed }) => [
                  pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                ]}
                className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full border border-black/5 ${currentBadge.bg}`}
              >
                <Shuffle size={11} color={currentRole === 'farmer' ? '#B45309' : currentRole === 'driver' ? '#19768A' : currentRole === 'admin' ? '#7C3AED' : '#1F5C3A'} />
                <Text className={`text-xs font-semibold ${currentBadge.text}`}>
                  {currentBadge.label}
                </Text>
              </Pressable>

              {/* Buyer Cart Icon */}
              {currentRole === 'buyer' && !navState.subScreen && (
                <Pressable
                  onPress={() => setTab('cart')}
                  style={({ pressed }) => [
                    { position: 'relative', padding: 6, borderRadius: 10 },
                    pressed && { opacity: 0.75, backgroundColor: '#F1F5F9' },
                  ]}
                >
                  <ShoppingCart size={19} color="#1F5C3A" />
                  {cart.length > 0 && (
                    <View style={{ position: 'absolute', top: 2, right: 2, backgroundColor: '#C8452D', borderRadius: 8, height: 16, minWidth: 16, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#ffffff', fontSize: 9.5, fontWeight: '800', lineHeight: 12 }}>
                        {cart.length}
                      </Text>
                    </View>
                  )}
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Role Selector Modal */}
      <Modal
        visible={showRoleMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRoleMenu(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center p-4"
          onPress={() => setShowRoleMenu(false)}
        >
          <View className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-xl border border-[#E5E5E5]">
            <Text className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider mb-2">
              Switch Stakeholder Dashboard
            </Text>

            {/* Buyer */}
            <Pressable
              onPress={() => {
                switchRole('buyer');
                setShowRoleMenu(false);
              }}
              style={({ pressed }) => [
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, marginBottom: 6 },
                currentRole === 'buyer' ? { backgroundColor: '#E6F2E8' } : { backgroundColor: '#F8FAFC' },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text className="text-xs font-medium text-[#374151]">🛒 Buyer (No login needed)</Text>
              {currentRole === 'buyer' && <Check size={14} color="#1F5C3A" />}
            </Pressable>

            {/* Farmer */}
            <Pressable
              onPress={() => {
                switchRole('farmer');
                setShowRoleMenu(false);
              }}
              style={({ pressed }) => [
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, marginBottom: 6 },
                currentRole === 'farmer' ? { backgroundColor: '#FEF8EA' } : { backgroundColor: '#F8FAFC' },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text className="text-xs font-medium text-[#374151]">🌱 Farmer Dashboard</Text>
              {currentUser?.role === 'farmer' ? (
                currentRole === 'farmer' ? <Check size={14} color="#B45309" /> : null
              ) : (
                <Lock size={12} color="#9CA3AF" />
              )}
            </Pressable>

            {/* Driver */}
            <Pressable
              onPress={() => {
                switchRole('driver');
                setShowRoleMenu(false);
              }}
              style={({ pressed }) => [
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, marginBottom: 6 },
                currentRole === 'driver' ? { backgroundColor: '#EEF8FA' } : { backgroundColor: '#F8FAFC' },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text className="text-xs font-medium text-[#374151]">🚚 Driver Logistics</Text>
              {currentUser?.role === 'driver' ? (
                currentRole === 'driver' ? <Check size={14} color="#19768A" /> : null
              ) : (
                <Lock size={12} color="#9CA3AF" />
              )}
            </Pressable>

            {/* Admin */}
            <Pressable
              onPress={() => {
                switchRole('admin');
                setShowRoleMenu(false);
              }}
              style={({ pressed }) => [
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, marginBottom: 6 },
                currentRole === 'admin' ? { backgroundColor: '#F3E8FF' } : { backgroundColor: '#F8FAFC' },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text className="text-xs font-medium text-[#374151]">🛡️ Platform Admin</Text>
              {currentUser?.role === 'admin' ? (
                currentRole === 'admin' ? <Check size={14} color="#7C3AED" /> : null
              ) : (
                <Lock size={12} color="#9CA3AF" />
              )}
            </Pressable>

            <View className="mt-2 pt-2 border-t border-[#E5E5E5]">
              {currentUser ? (
                <View style={{ gap: 8 }}>
                  <Text className="text-[11px] text-[#6B7280]">
                    Signed in as <Text className="font-bold text-[#1A1A1A]">{currentUser.name}</Text>
                  </Text>
                  <Pressable
                    onPress={() => {
                      logout();
                      setShowRoleMenu(false);
                    }}
                    className="flex-row items-center gap-1.5 p-2 rounded-lg bg-red-50"
                  >
                    <LogOut size={14} color="#DC2626" />
                    <Text className="text-xs font-semibold text-[#DC2626]">
                      Sign Out (Browse as Guest)
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    openAuth(currentRole);
                    setShowRoleMenu(false);
                  }}
                  className="flex-row items-center justify-center gap-1 p-2.5 rounded-xl bg-[#E6F2E8]"
                >
                  <LogIn size={14} color="#1F5C3A" />
                  <Text className="text-xs font-bold text-[#1F5C3A]">
                    Sign In / Create Account
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
