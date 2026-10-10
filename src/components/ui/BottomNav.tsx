import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  MapPin,
  ShoppingCart,
  ShoppingBag,
  User,
  Package,
  Truck,
  DollarSign,
  LayoutDashboard,
  Users,
  Tag,
  AlertTriangle,
} from 'lucide-react-native';
import { Role } from '../../types';
import { useApp } from '../../services/store';

export interface BottomNavProps {
  role: Role;
}

export const BottomNav: React.FC<BottomNavProps> = ({ role }) => {
  const { currentUser, navState, setTab, cart, orders, complaints, users } = useApp();
  const insets = useSafeAreaInsets();
  const currentTab = navState.activeTab;

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const pendingComplaintsCount = complaints.filter(
    c => c.status === 'open' || c.status === 'in_progress' || (c.status as string) === 'pending'
  ).length;
  const pendingUsersCount = users.filter(u => !u.verified).length;
  const activeDeliveriesCount = orders.filter(
    o => o.status === 'ready_for_pickup' || o.status === 'out_for_delivery'
  ).length;

  const tabsConfig = {
    buyer: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'nearby', label: 'Nearby', icon: MapPin },
      {
        id: 'cart',
        label: 'Cart',
        icon: ShoppingCart,
        badge: cart.length > 0 ? cart.length : undefined,
      },
      { id: 'profile', label: currentUser ? 'Profile' : 'Account', icon: User },
    ],
    farmer: [
      {
        id: 'home',
        label: 'Home',
        icon: Home,
        badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: ShoppingBag,
        badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      },
      { id: 'listings', label: 'My Listing', icon: Package },
      { id: 'profile', label: 'Profile', icon: User },
    ],
    driver: [
      { id: 'home', label: 'Home', icon: Home },
      {
        id: 'deliveries',
        label: 'Deliveries',
        icon: Truck,
        badge: activeDeliveriesCount > 0 ? activeDeliveriesCount : undefined,
      },
      { id: 'earnings', label: 'Earnings', icon: DollarSign },
      { id: 'profile', label: 'Profile', icon: User },
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      {
        id: 'users',
        label: 'Users',
        icon: Users,
        badge: pendingUsersCount > 0 ? pendingUsersCount : undefined,
      },
      { id: 'categories', label: 'Categories', icon: Tag },
      {
        id: 'complaints',
        label: 'Complaints',
        icon: AlertTriangle,
        badge: pendingComplaintsCount > 0 ? pendingComplaintsCount : undefined,
      },
    ],
  }[role] || [];

  return (
    <View
      style={[
        styles.navContainer,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {tabsConfig.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <Pressable
            key={tab.id}
            onPress={() => setTab(tab.id)}
            style={styles.tabButton}
          >
            <View style={styles.iconContainer}>
              <Icon
                size={21}
                color={isActive ? '#1F5C3A' : '#6B7280'}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
              {tab.badge !== undefined && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>
                    {tab.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && (
              <View style={styles.activeIndicator} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingTop: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabButton: {
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    minWidth: 54,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  iconContainer: {
    position: 'relative',
  },
  badgePill: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#C8452D',
    borderRadius: 8,
    height: 16,
    minWidth: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    lineHeight: 12,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    maxWidth: 68,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: '#1F5C3A',
  },
  tabLabelInactive: {
    fontWeight: '500',
    color: '#6B7280',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 20,
    height: 3,
    backgroundColor: '#1F5C3A',
    borderRadius: 2,
  },
});
