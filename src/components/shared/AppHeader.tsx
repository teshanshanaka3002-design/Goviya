import React, { useState } from 'react';
import {
  ChevronLeft,
  ShoppingCart,
  Shuffle,
  Check,
  LogIn,
  LogOut,
  Lock,
  User as UserIcon,
} from 'lucide-react';
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

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  const currentBadge = roleBadges[currentRole];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] px-4 py-2.5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Left Slot: Back or Logo */}
        <div className="flex items-center gap-2">
          {showBack || navState.subScreen ? (
            <button
              type="button"
              onClick={handleBack}
              className="p-2 -ml-1 text-[#1A1A1A] hover:bg-[#F3F4F6] rounded-xl transition-colors active:scale-95 cursor-pointer"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <GoviyaLogo size={32} />
              <div>
                <h1 className="text-base font-extrabold text-[#1A1A1A] tracking-tight leading-none">
                  Goviya
                </h1>
                <p className="text-[10px] text-[#6B7280] font-medium leading-tight">
                  {roleTitles[currentRole]}
                </p>
              </div>
            </div>
          )}

          {title && (
            <h2 className="text-sm font-bold text-[#1A1A1A] truncate max-w-[170px] ml-1">
              {title}
            </h2>
          )}
        </div>

        {/* Right Slot: Actions, Role Selector Pill, Sign In / Cart */}
        <div className="flex items-center gap-1.5">
          {rightAction ? (
            rightAction
          ) : (
            <>
              {/* Unauthenticated Quick Sign-In Button */}
              {!currentUser && !navState.subScreen && (
                <button
                  type="button"
                  onClick={() => openAuth('buyer')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1F5C3A] text-white hover:bg-[#16452B] active:scale-95 transition-all shadow-2xs cursor-pointer"
                  title="Sign In or Register"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Role Switcher Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleMenu(prev => !prev)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${currentBadge.bg} ${currentBadge.text} border border-black/5 hover:opacity-90 active:scale-95 transition-all cursor-pointer`}
                  title="Switch Stakeholder Dashboard"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>{currentBadge.label}</span>
                </button>

                {showRoleMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowRoleMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E5E5] p-2 z-50 text-left animate-fadeIn">
                      <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider">
                        Switch Stakeholder Dashboard
                      </div>

                      {/* Buyer Option: Always accessible without login */}
                      <button
                        type="button"
                        onClick={() => {
                          switchRole('buyer');
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          currentRole === 'buyer'
                            ? 'bg-[#E6F2E8] text-[#1F5C3A] font-bold'
                            : 'text-[#374151] hover:bg-[#F3F4F6]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>🛒</span>
                          <span>Buyer (No login needed)</span>
                        </div>
                        {currentRole === 'buyer' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      {/* Farmer Option: Requires farmer login/signup */}
                      <button
                        type="button"
                        onClick={() => {
                          switchRole('farmer');
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          currentRole === 'farmer'
                            ? 'bg-[#FEF8EA] text-[#B45309] font-bold'
                            : 'text-[#374151] hover:bg-[#F3F4F6]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>🌱</span>
                          <span>Farmer Dashboard</span>
                        </div>
                        {currentUser?.role === 'farmer' ? (
                          currentRole === 'farmer' ? <Check className="w-3.5 h-3.5" /> : null
                        ) : (
                          <span title="Login required">
                            <Lock className="w-3 h-3 text-[#9CA3AF]" />
                          </span>
                        )}
                      </button>

                      {/* Driver Option: Requires driver login/signup */}
                      <button
                        type="button"
                        onClick={() => {
                          switchRole('driver');
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          currentRole === 'driver'
                            ? 'bg-[#EEF8FA] text-[#19768A] font-bold'
                            : 'text-[#374151] hover:bg-[#F3F4F6]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>🚚</span>
                          <span>Driver Logistics</span>
                        </div>
                        {currentUser?.role === 'driver' ? (
                          currentRole === 'driver' ? <Check className="w-3.5 h-3.5" /> : null
                        ) : (
                          <span title="Login required">
                            <Lock className="w-3 h-3 text-[#9CA3AF]" />
                          </span>
                        )}
                      </button>

                      {/* Admin Option */}
                      <button
                        type="button"
                        onClick={() => {
                          switchRole('admin');
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          currentRole === 'admin'
                            ? 'bg-[#F3E8FF] text-[#7C3AED] font-bold'
                            : 'text-[#374151] hover:bg-[#F3F4F6]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>🛡️</span>
                          <span>Platform Admin</span>
                        </div>
                        {currentUser?.role === 'admin' ? (
                          currentRole === 'admin' ? <Check className="w-3.5 h-3.5" /> : null
                        ) : (
                          <span title="Login required">
                            <Lock className="w-3 h-3 text-[#9CA3AF]" />
                          </span>
                        )}
                      </button>

                      {/* User Account / Auth Actions */}
                      <div className="mt-1.5 pt-1.5 border-t border-[#F0F0EE]">
                        {currentUser ? (
                          <div className="px-2 py-1 space-y-1">
                            <div className="text-[10px] text-[#6B7280] truncate">
                              Signed in as <strong className="text-[#1A1A1A]">{currentUser.name}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                logout();
                                setShowRoleMenu(false);
                              }}
                              className="w-full flex items-center gap-1.5 text-xs text-[#DC2626] font-semibold hover:bg-[#FEF2F2] p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Sign Out (Browse as Guest)</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              openAuth(currentRole);
                              setShowRoleMenu(false);
                            }}
                            className="w-full flex items-center justify-center gap-1 text-xs text-[#1F5C3A] font-bold bg-[#E6F2E8] hover:bg-[#D5EAD8] p-2 rounded-xl transition-colors cursor-pointer"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Sign In / Create Account</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Buyer Cart Icon */}
              {currentRole === 'buyer' && !navState.subScreen && (
                <button
                  type="button"
                  onClick={() => setTab('cart')}
                  className="relative p-2 text-[#1A1A1A] hover:bg-[#F3F4F6] rounded-xl transition-colors cursor-pointer"
                  aria-label="View Cart"
                >
                  <ShoppingCart className="w-5 h-5 text-[#1F5C3A]" />
                  {cart.length > 0 && (
                    <span className="absolute top-1 right-1 bg-[#C8452D] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
                      {cart.length}
                    </span>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
