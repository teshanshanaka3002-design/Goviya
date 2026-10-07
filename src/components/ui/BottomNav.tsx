import React from 'react';
import {
  Home,
  MapPin,
  ShoppingCart,
  ShoppingBag,
  User,
  TrendingUp,
  Package,
  Truck,
  DollarSign,
  LayoutDashboard,
  Users,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { Role } from '../../types';
import { useApp } from '../../services/store';

export interface BottomNavProps {
  role: Role;
}

export const BottomNav: React.FC<BottomNavProps> = ({ role }) => {
  const { currentUser, navState, setTab, cart, orders, complaints } = useApp();
  const currentTab = navState.activeTab;

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const pendingComplaintsCount = complaints.filter(c => c.status === 'pending').length;
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
      { id: 'users', label: 'Users', icon: Users },
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
    <nav
      className="sticky bottom-0 z-20 w-full bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] px-2 py-1 shadow-lg shrink-0"
      aria-label="Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabsConfig.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[56px] py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-[#1F5C3A] font-semibold'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-[#C8452D] text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center leading-none ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 tracking-tight truncate max-w-[64px] ${
                  isActive ? 'font-semibold text-[#1F5C3A]' : 'font-normal'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-[#1F5C3A] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
