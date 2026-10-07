/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './services/store';
import { AppHeader } from './components/shared/AppHeader';
import { BottomNav } from './components/ui/BottomNav';
import { AuthScreen } from './screens/auth/AuthScreens';

// Buyer Screens
import {
  BuyerHomeScreen,
  BuyerNearbyScreen,
  BuyerProductDetailScreen,
  BuyerCartScreen,
  BuyerCheckoutScreen,
  BuyerOrderConfirmationScreen,
  BuyerOrderTrackingScreen,
  BuyerChatScreen,
  BuyerProfileScreen,
} from './screens/buyer/BuyerScreens';

// Farmer Screens
import {
  FarmerHomeScreen,
  FarmerOrdersScreen,
  FarmerListingScreen,
  FarmerAddListingScreen,
  FarmerMarketPriceScreen,
  FarmerProfileScreen,
} from './screens/farmer/FarmerScreens';

// Driver Screens
import {
  DriverHomeScreen,
  DriverDeliveryDetailScreen,
  DriverEarningsScreen,
  DriverProfileScreen,
} from './screens/driver/DriverScreens';

// Admin Screens
import {
  AdminDashboardScreen,
  AdminUsersScreen,
  AdminCategoriesScreen,
  AdminComplaintsScreen,
} from './screens/admin/AdminScreens';

const MainNavigator: React.FC = () => {
  const { currentUser, currentRole, navState } = useApp();

  // Render Subscreen if active
  const renderSubScreen = () => {
    switch (navState.subScreen) {
      case 'auth':
        return <AuthScreen initialRole={navState.authRole} initialView={navState.authView} />;
      case 'product_detail':
        return <BuyerProductDetailScreen />;
      case 'checkout':
        return <BuyerCheckoutScreen />;
      case 'order_confirmation':
        return <BuyerOrderConfirmationScreen />;
      case 'order_tracking':
        return <BuyerOrderTrackingScreen />;
      case 'chat_detail':
        return <BuyerChatScreen />;
      case 'add_listing':
        return <FarmerAddListingScreen />;
      case 'driver_delivery_detail':
        return <DriverDeliveryDetailScreen />;
      default:
        return null;
    }
  };

  // Render Role Tab
  const renderTabScreen = () => {
    if (currentRole === 'buyer') {
      switch (navState.activeTab) {
        case 'home':
          return <BuyerHomeScreen />;
        case 'nearby':
          return <BuyerNearbyScreen />;
        case 'cart':
          return <BuyerCartScreen />;
        case 'profile':
          return <BuyerProfileScreen />;
        default:
          return <BuyerHomeScreen />;
      }
    }

    if (currentRole === 'farmer') {
      switch (navState.activeTab) {
        case 'home':
          return <FarmerHomeScreen />;
        case 'orders':
        case 'market':
          return <FarmerOrdersScreen />;
        case 'listings':
          return <FarmerListingScreen />;
        case 'profile':
          return <FarmerProfileScreen />;
        default:
          return <FarmerHomeScreen />;
      }
    }

    if (currentRole === 'driver') {
      switch (navState.activeTab) {
        case 'home':
        case 'deliveries':
          return <DriverHomeScreen />;
        case 'earnings':
          return <DriverEarningsScreen />;
        case 'profile':
          return <DriverProfileScreen />;
        default:
          return <DriverHomeScreen />;
      }
    }

    if (currentRole === 'admin') {
      switch (navState.activeTab) {
        case 'dashboard':
          return <AdminDashboardScreen />;
        case 'users':
          return <AdminUsersScreen />;
        case 'categories':
          return <AdminCategoriesScreen />;
        case 'complaints':
          return <AdminComplaintsScreen />;
        default:
          return <AdminDashboardScreen />;
      }
    }

    return null;
  };

  const isSubScreenActive = Boolean(navState.subScreen);

  // Non-buyer dashboards (farmer, driver, admin) require signing up or logging in with matching role
  const requiresRoleAuth =
    currentRole !== 'buyer' && (!currentUser || currentUser.role !== currentRole);

  const activeContent = requiresRoleAuth ? (
    <div className="flex flex-col h-full w-full bg-[#F6F7F5] overflow-hidden text-[#1A1A1A] relative">
      <AppHeader />
      <main className="flex-1 overflow-y-auto no-scrollbar relative w-full">
        <AuthScreen initialRole={currentRole} />
      </main>
    </div>
  ) : (
    <div className="flex flex-col h-full w-full bg-[#F6F7F5] overflow-hidden text-[#1A1A1A] relative">
      {/* App Header */}
      <AppHeader />

      {/* Main Scrollable Viewport */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative w-full">
        {isSubScreenActive ? renderSubScreen() : renderTabScreen()}
      </main>

      {/* Bottom Navigation */}
      {!isSubScreenActive && <BottomNav role={currentRole} />}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#0B0F17] flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden select-none">
      {/* Ambient Backdrop Glow for Depth */}
      <div className="fixed inset-0 pointer-events-none opacity-25 flex items-center justify-center">
        <div className="w-[500px] h-[700px] bg-[#1F5C3A]/30 blur-[130px] rounded-full" />
      </div>

      {/* Outer Phone Frame Wrapper */}
      <div className="relative flex items-center justify-center w-full max-w-[393px] h-screen sm:h-[852px] sm:max-h-[calc(100vh-24px)]">
        {/* Hardware side buttons (visible on desktop chassis) */}
        <div className="hidden sm:block absolute -left-[12px] top-[115px] w-[3px] h-[26px] bg-[#2A313C] rounded-l-sm" />
        <div className="hidden sm:block absolute -left-[12px] top-[155px] w-[3px] h-[48px] bg-[#2A313C] rounded-l-sm" />
        <div className="hidden sm:block absolute -left-[12px] top-[215px] w-[3px] h-[48px] bg-[#2A313C] rounded-l-sm" />
        <div className="hidden sm:block absolute -right-[12px] top-[165px] w-[3px] h-[72px] bg-[#2A313C] rounded-r-sm" />

        {/* iPhone Chassis Shell (Strict containing block for fixed overlays) */}
        <div
          className="iphone-chassis relative w-full h-full bg-white sm:rounded-[52px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden sm:border-[10px] sm:border-[#1C2024] flex flex-col ring-1 ring-black/40 isolate"
          style={{
            transform: 'translate3d(0, 0, 0)',
            WebkitTransform: 'translate3d(0, 0, 0)',
            contain: 'paint layout',
          }}
        >
          {/* iOS Status Bar & Dynamic Island */}
          <div className="h-10 bg-white flex items-center justify-between px-6 pt-1 text-[11px] font-bold text-[#1A1A1A] select-none shrink-0 z-30 border-b border-black/5">
            <span className="w-12 text-left font-semibold">09:41</span>
            {/* Dynamic Island */}
            <div className="w-[110px] h-[26px] bg-black rounded-full flex items-center justify-between px-2.5 mx-auto shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-[#111] ring-1 ring-white/10 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#1D3557]/80" />
              </div>
              <div className="w-2 h-2 rounded-full bg-[#0a0a0a] ring-1 ring-white/5" />
            </div>
            <div className="w-12 flex items-center justify-end gap-1.5 text-[10px] text-[#1A1A1A]">
              <span className="font-semibold text-[9px]">5G</span>
              {/* Battery Pill */}
              <div className="w-4.5 h-2.5 border border-[#1A1A1A] rounded-[3px] p-[1px] flex items-center">
                <div className="h-full w-full bg-[#1A1A1A] rounded-[1.5px]" />
              </div>
            </div>
          </div>

          {/* App Body Content Viewport (Strictly sized containing viewport) */}
          <div
            className="flex-1 overflow-hidden flex flex-col relative w-full h-full"
            style={{
              transform: 'translate3d(0, 0, 0)',
              WebkitTransform: 'translate3d(0, 0, 0)',
            }}
          >
            {activeContent}
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="h-4 bg-white flex justify-center items-center pb-1 shrink-0 z-30 select-none">
            <div className="w-32 h-1 bg-black/35 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainNavigator />
    </AppProvider>
  );
}
