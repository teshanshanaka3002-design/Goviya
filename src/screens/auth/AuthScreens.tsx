import React, { useState, useEffect } from 'react';
import {
  Sprout,
  ShieldCheck,
  Truck,
  Users,
  ArrowRight,
  Phone,
  Lock,
  User as UserIcon,
  MapPin,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../services/store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Role } from '../../types';
import { GoviyaLogo } from '../../components/shared/GoviyaLogo';

export interface AuthScreenProps {
  initialRole?: Role;
  initialView?: 'login' | 'register' | 'onboarding' | 'splash';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialRole,
  initialView = 'login',
}) => {
  const {
    loginAsUser,
    loginAsRole,
    registerUser,
    continueAsGuest,
    authTargetRole,
    users,
  } = useApp();

  const effectiveInitialRole = initialRole || authTargetRole || 'buyer';

  const [view, setView] = useState<'splash' | 'onboarding' | 'login' | 'register'>(
    initialView === 'register' ? 'register' : 'login'
  );
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Form states
  const [loginRole, setLoginRole] = useState<Role>(effectiveInitialRole);
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [password, setPassword] = useState('password123');

  // Register Role & Fields
  const [registerRole, setRegisterRole] = useState<'buyer' | 'farmer' | 'driver'>(
    effectiveInitialRole === 'admin'
      ? 'buyer'
      : (effectiveInitialRole as 'buyer' | 'farmer' | 'driver')
  );
  const [name, setName] = useState('');
  const [regPhone, setRegPhone] = useState('+94 7');
  const [district, setDistrict] = useState('Nuwara Eliya');
  const [address, setAddress] = useState('');

  // Farmer specific fields
  const [farmName, setFarmName] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [farmSizeAcres, setFarmSizeAcres] = useState('3.5');

  // Driver specific fields
  const [vehicleType, setVehicleType] = useState<
    'Light Truck (Dimas)' | 'Three-Wheeler' | 'Motorbike' | 'Lorry'
  >('Light Truck (Dimas)');
  const [vehiclePlate, setVehiclePlate] = useState('WP - LG 8824');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState('B-84910284');

  // Error / helper state
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (effectiveInitialRole) {
      setLoginRole(effectiveInitialRole);
      if (effectiveInitialRole !== 'admin') {
        setRegisterRole(effectiveInitialRole as 'buyer' | 'farmer' | 'driver');
      }
    }
  }, [effectiveInitialRole]);

  const onboardingSlides = [
    {
      title: 'Direct Farm-to-Table in Sri Lanka',
      subtitle:
        'Eliminate middlemen brokers. Farmers get fair wholesale rates, buyers get harvest-fresh produce at lower cost.',
      badge: 'Fair Trade Agriculture',
      icon: <Sprout className="w-12 h-12 text-[#1F5C3A]" />,
      color: 'bg-[#E6F2E8]',
    },
    {
      title: 'Find Nearby Verified Producers',
      subtitle:
        'Discover local growers in Nuwara Eliya, Dambulla, Jaffna and Kandy with real-time harvest availability.',
      badge: 'Islandwide Logistics',
      icon: <Truck className="w-12 h-12 text-[#2E8C9F]" />,
      color: 'bg-[#EEF8FA]',
    },
    {
      title: 'Transparent Pricing & Safe Delivery',
      subtitle:
        'Track live wholesale benchmarks from Dambulla Economic Centre with verified drivers and direct chats.',
      badge: 'Guaranteed Quality',
      icon: <ShieldCheck className="w-12 h-12 text-[#E8A317]" />,
      color: 'bg-[#FEF8EA]',
    },
  ];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter your full name');
      return;
    }

    if (!regPhone.trim() || regPhone.length < 9) {
      setFormError('Please enter a valid Sri Lankan phone number');
      return;
    }

    if (registerRole === 'farmer' && !farmName.trim()) {
      setFormError('Please enter your farm or holding name');
      return;
    }

    if (registerRole === 'driver' && !vehiclePlate.trim()) {
      setFormError('Please enter your vehicle registration plate');
      return;
    }

    registerUser({
      name,
      phone: regPhone,
      role: registerRole,
      nicNumber: registerRole === 'farmer' || registerRole === 'driver' ? nicNumber || driverLicenseNumber : undefined,
      farmName: registerRole === 'farmer' ? farmName : undefined,
      farmSizeAcres: registerRole === 'farmer' ? parseFloat(farmSizeAcres) || 2 : undefined,
      vehicleType: registerRole === 'driver' ? vehicleType : undefined,
      vehiclePlate: registerRole === 'driver' ? vehiclePlate : undefined,
      verified: registerRole === 'buyer', // farmers and drivers get verified
      location: {
        lat: district === 'Nuwara Eliya' ? 6.9697 : district === 'Jaffna' ? 9.6615 : 6.9271,
        lng: district === 'Nuwara Eliya' ? 80.7891 : district === 'Jaffna' ? 80.0255 : 79.8612,
        district,
        address: address.trim() || `${district}, Sri Lanka`,
      },
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    // Find matching user by role
    const matched = users.find(u => u.role === loginRole) || null;
    if (matched) {
      loginAsUser(matched._id);
    } else {
      loginAsRole(loginRole);
    }
  };

  if (view === 'splash') {
    return (
      <div className="flex flex-col items-center justify-between min-h-full bg-[#1F5C3A] text-white p-6 text-center">
        <div className="w-full flex justify-between items-center">
          <button
            type="button"
            onClick={continueAsGuest}
            className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Browse as Guest</span>
          </button>
          <button
            type="button"
            onClick={() => setView('login')}
            className="text-xs font-semibold text-white/80 hover:text-white cursor-pointer"
          >
            Sign In
          </button>
        </div>
        <div className="my-auto flex flex-col items-center text-center">
          <div className="mb-4 drop-shadow-lg">
            <GoviyaLogo size="2xl" variant="white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Goviya</h1>
          <p className="text-sm text-white/85 mt-2 max-w-xs leading-relaxed">
            Sri Lanka’s Direct Farm-to-Buyer Mobile Marketplace
          </p>
        </div>
        <div className="w-full max-w-xs space-y-3 pb-6">
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            onClick={() => setView('onboarding')}
          >
            Get Started
          </Button>
          <button
            type="button"
            onClick={() => setView('login')}
            className="w-full py-2.5 text-xs text-white/90 font-semibold hover:underline cursor-pointer"
          >
            Already have an account? Sign In
          </button>
          <button
            type="button"
            onClick={continueAsGuest}
            className="w-full py-2 text-xs text-white/70 hover:text-white hover:underline cursor-pointer"
          >
            Explore marketplace as guest buyer →
          </button>
        </div>
      </div>
    );
  }

  if (view === 'onboarding') {
    const current = onboardingSlides[onboardingStep];
    return (
      <div className="flex flex-col justify-between min-h-full bg-white p-6 text-center">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-bold text-[#1F5C3A]">{current.badge}</span>
          <button
            type="button"
            onClick={continueAsGuest}
            className="text-xs font-semibold text-[#6B7280] hover:text-[#1A1A1A] cursor-pointer"
          >
            Browse Marketplace
          </button>
        </div>

        <div className="my-auto flex flex-col items-center px-4">
          <div
            className={`w-24 h-24 rounded-3xl ${current.color} flex items-center justify-center shadow-inner mb-6`}
          >
            {current.icon}
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight mb-3">
            {current.title}
          </h2>
          <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs">
            {current.subtitle}
          </p>
        </div>

        <div className="space-y-6 pb-6">
          <div className="flex justify-center gap-1.5">
            {onboardingSlides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  onboardingStep === i ? 'w-6 bg-[#1F5C3A]' : 'w-1.5 bg-[#E5E5E5]'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {onboardingStep > 0 && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOnboardingStep(prev => prev - 1)}
              >
                Back
              </Button>
            )}
            <Button
              variant="primary"
              className="flex-1"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                if (onboardingStep < onboardingSlides.length - 1) {
                  setOnboardingStep(prev => prev + 1);
                } else {
                  setView('login');
                }
              }}
            >
              {onboardingStep === onboardingSlides.length - 1 ? 'Start Now' : 'Continue'}
            </Button>
          </div>

          <button
            type="button"
            onClick={continueAsGuest}
            className="text-xs text-[#1F5C3A] font-semibold hover:underline cursor-pointer block mx-auto"
          >
            Skip & browse marketplace as guest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F6F7F5] flex flex-col justify-start px-4 py-6 text-left">
      <div className="max-w-md w-full mx-auto space-y-4">
        {/* Top Guest Navigation Header Bar */}
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={continueAsGuest}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1F5C3A] hover:text-[#154128] bg-white px-3 py-1.5 rounded-xl border border-[#D5EAD8] shadow-2xs cursor-pointer transition-all active:scale-95"
            title="Browse buyer marketplace without signing in"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Browse as Guest Buyer</span>
          </button>
          <span className="text-[11px] font-semibold text-[#6B7280]">
            No signup needed to browse
          </span>
        </div>

        {/* Brand Banner */}
        <div className="text-center pt-1">
          <div className="inline-flex items-center justify-center mb-2">
            <GoviyaLogo size="lg" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">Goviya</h1>
          <p className="text-xs text-[#6B7280]">
            Connecting Sri Lankan Farmers Directly With Buyers & Logistics
          </p>
        </div>

        {/* Role-Gate Explanation Banner (When switching to Farmer or Driver) */}
        {(effectiveInitialRole === 'farmer' || authTargetRole === 'farmer') && (
          <div className="bg-[#FEF8EA] border border-[#FDE6B8] p-3 rounded-2xl flex items-start gap-2.5 text-xs text-[#B45309]">
            <Sprout className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#92400E]">Farmer Producer Portal Access</div>
              <p className="text-[11px] text-[#A16207] mt-0.5 leading-snug">
                The farmer dashboard requires an authenticated producer account to manage crop harvest listings, update preparation notes, and hand over orders.
              </p>
            </div>
          </div>
        )}

        {(effectiveInitialRole === 'driver' || authTargetRole === 'driver') && (
          <div className="bg-[#EEF8FA] border border-[#D0EEF5] p-3 rounded-2xl flex items-start gap-2.5 text-xs text-[#19768A]">
            <Truck className="w-5 h-5 text-[#19768A] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#0E7490]">Logistics Driver Fleet Portal Access</div>
              <p className="text-[11px] text-[#155E75] mt-0.5 leading-snug">
                Fleet drivers must sign up or log in with verified vehicle credentials to view ready farm orders, accept dispatch routes, and record delivery handovers.
              </p>
            </div>
          </div>
        )}

        {/* 1-Click Instant Persona Sign-In for Easy Testing */}
        <Card variant="mint" padding="md" className="border border-[#CDE5D2]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F5C3A] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Tap Instant Stakeholder Demo</span>
            </div>
            <span className="text-[10px] text-[#4B6B56] font-medium">Quick switch</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => loginAsRole('buyer')}
              className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#D5EAD8] hover:border-[#1F5C3A] text-left transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#E6F2E8] text-[#1F5C3A] flex items-center justify-center font-bold text-xs shrink-0">
                🛒
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#1A1A1A] truncate">Buyer</div>
                <div className="text-[10px] text-[#6B7280] truncate">Dinesh · Colombo</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => loginAsRole('farmer')}
              className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#D5EAD8] hover:border-[#1F5C3A] text-left transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FEF8EA] text-[#B45309] flex items-center justify-center font-bold text-xs shrink-0">
                🌱
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#1A1A1A] truncate">Farmer</div>
                <div className="text-[10px] text-[#6B7280] truncate">Sunil · Nuwara Eliya</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => loginAsRole('driver')}
              className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#D5EAD8] hover:border-[#1F5C3A] text-left transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#EEF8FA] text-[#19768A] flex items-center justify-center font-bold text-xs shrink-0">
                🚚
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#1A1A1A] truncate">Driver</div>
                <div className="text-[10px] text-[#6B7280] truncate">Roshan · Dimas Truck</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => loginAsRole('admin')}
              className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#D5EAD8] hover:border-[#1F5C3A] text-left transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-bold text-xs shrink-0">
                🛡️
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#1A1A1A] truncate">Admin</div>
                <div className="text-[10px] text-[#6B7280] truncate">Dr. Niluka · Center</div>
              </div>
            </button>
          </div>
        </Card>

        {/* Tab Toggle: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 bg-[#E8ECE6] rounded-2xl border border-[#D8DFD5]">
          <button
            type="button"
            onClick={() => {
              setView('login');
              setFormError(null);
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              view === 'login'
                ? 'bg-white text-[#1F5C3A] shadow-xs'
                : 'text-[#6B7280] hover:text-[#1A1A1A]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setView('register');
              setFormError(null);
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              view === 'register'
                ? 'bg-[#1F5C3A] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1A1A1A]'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Error Notice */}
        {formError && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#DC2626] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Regular Sign-In / Register Form Card */}
        <Card variant="default" padding="lg">
          {view === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#1A1A1A]">
                  Account Sign In
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Sign in to access your customized role dashboard:
                </p>
              </div>

              {/* Login Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5 uppercase tracking-wider">
                  Select Role to Sign In
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginRole('buyer')}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      loginRole === 'buyer'
                        ? 'border-[#1F5C3A] bg-[#E6F2E8] text-[#1F5C3A] font-bold shadow-2xs'
                        : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                    }`}
                  >
                    <span className="text-base block mb-0.5">🛒</span>
                    <span className="text-[11px]">Buyer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginRole('farmer')}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      loginRole === 'farmer'
                        ? 'border-[#B45309] bg-[#FEF8EA] text-[#B45309] font-bold shadow-2xs'
                        : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                    }`}
                  >
                    <span className="text-base block mb-0.5">🌱</span>
                    <span className="text-[11px]">Farmer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginRole('driver')}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      loginRole === 'driver'
                        ? 'border-[#19768A] bg-[#EEF8FA] text-[#19768A] font-bold shadow-2xs'
                        : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                    }`}
                  >
                    <span className="text-base block mb-0.5">🚚</span>
                    <span className="text-[11px]">Driver</span>
                  </button>
                </div>
              </div>

              <Input
                label="Registered Mobile Phone Number"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                placeholder="+94 7X XXX XXXX"
                required
              />

              <Input
                label="Password / OTP"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                placeholder="Enter password"
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#6B7280]">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-[#E5E5E5] text-[#1F5C3A] focus:ring-[#1F5C3A]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="font-semibold text-[#1F5C3A] hover:underline cursor-pointer"
                >
                  Request OTP
                </button>
              </div>

              <Button type="submit" variant="primary" fullWidth size="md">
                Sign In as {loginRole === 'buyer' ? 'Buyer' : loginRole === 'farmer' ? 'Farmer' : 'Logistics Driver'}
              </Button>

              <div className="pt-2 text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className="text-xs text-[#1F5C3A] font-semibold hover:underline block mx-auto cursor-pointer"
                >
                  New to Goviya? Create account as Buyer, Farmer or Driver
                </button>
                <button
                  type="button"
                  onClick={continueAsGuest}
                  className="text-xs text-[#6B7280] hover:text-[#1A1A1A] hover:underline block mx-auto cursor-pointer"
                >
                  Or continue browsing produce marketplace without sign in
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#1A1A1A]">
                  Register New Account
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Choose your role to get specialized features:
                </p>
              </div>

              {/* 3-Role Selector: Buyer, Farmer, Logistic Driver */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5 uppercase tracking-wider">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('buyer')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      registerRole === 'buyer'
                        ? 'border-[#1F5C3A] bg-[#E6F2E8] text-[#1F5C3A] font-bold shadow-xs'
                        : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                    }`}
                  >
                    <Users className="w-5 h-5 mx-auto mb-1 text-[#1F5C3A]" />
                    <span className="text-[11px] block">Buyer</span>
                    <span className="text-[9px] opacity-75 block">Consumer/Shop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole('farmer')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      registerRole === 'farmer'
                        ? 'border-[#B45309] bg-[#FEF8EA] text-[#B45309] font-bold shadow-xs'
                        : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                    }`}
                  >
                    <Sprout className="w-5 h-5 mx-auto mb-1 text-[#B45309]" />
                    <span className="text-[11px] block">Farmer</span>
                    <span className="text-[9px] opacity-75 block">Grower/Producer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole('driver')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      registerRole === 'driver'
                        ? 'border-[#19768A] bg-[#EEF8FA] text-[#19768A] font-bold shadow-xs'
                        : 'border-[#E5E5E5] bg-white text-[#6B7280]'
                    }`}
                  >
                    <Truck className="w-5 h-5 mx-auto mb-1 text-[#19768A]" />
                    <span className="text-[11px] block">Driver</span>
                    <span className="text-[9px] opacity-75 block">Logistics Fleet</span>
                  </button>
                </div>
              </div>

              {/* Common Fields */}
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
                placeholder="e.g. Bandara Jayasinghe"
                required
              />

              <Input
                label="Mobile Phone (+94)"
                type="tel"
                value={regPhone}
                onChange={e => setRegPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                placeholder="+94 77 XXX XXXX"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5 uppercase tracking-wider">
                  {registerRole === 'farmer'
                    ? 'Farm District'
                    : registerRole === 'driver'
                    ? 'Fleet Operating Region'
                    : 'Delivery District'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-3.5" />
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/20"
                  >
                    <option value="Nuwara Eliya">Nuwara Eliya (Central Highlands)</option>
                    <option value="Dambulla">Dambulla / Matale</option>
                    <option value="Jaffna">Jaffna (Northern Province)</option>
                    <option value="Kandy">Kandy (Central Province)</option>
                    <option value="Kurunegala">Kurunegala (North Western)</option>
                    <option value="Colombo">Colombo (Western Province)</option>
                    <option value="Gampaha">Gampaha (Western Province)</option>
                    <option value="Badulla">Badulla (Uva Province)</option>
                  </select>
                </div>
              </div>

              {/* FARMER SPECIFIC REGISTRATION FIELDS */}
              {registerRole === 'farmer' && (
                <div className="space-y-3 p-3 bg-[#FEF8EA]/60 rounded-xl border border-[#FDE6B8]">
                  <div className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Producer Farm Details</span>
                  </div>
                  <Input
                    label="Farm / Holding Name"
                    type="text"
                    value={farmName}
                    onChange={e => setFarmName(e.target.value)}
                    placeholder="e.g. Kandapola Highland Eco Farm"
                    required
                  />
                  <Input
                    label="Farm Size (in Acres)"
                    type="number"
                    value={farmSizeAcres}
                    onChange={e => setFarmSizeAcres(e.target.value)}
                    placeholder="e.g. 4.5"
                  />
                  <Input
                    label="National Identity Card (NIC) for Agrarian Verification"
                    type="text"
                    value={nicNumber}
                    onChange={e => setNicNumber(e.target.value)}
                    placeholder="e.g. 197412803450"
                    helperText="Required by Sri Lanka Agrarian Services for verified green badge."
                  />
                  <Input
                    label="Farm Gate Address"
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. Kandapola Ridge Road, Nuwara Eliya"
                  />
                </div>
              )}

              {/* DRIVER SPECIFIC REGISTRATION FIELDS */}
              {registerRole === 'driver' && (
                <div className="space-y-3 p-3 bg-[#EEF8FA]/60 rounded-xl border border-[#D0EEF5]">
                  <div className="text-[11px] font-bold text-[#19768A] uppercase tracking-wider flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Fleet Vehicle & Driver Verification</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                      Vehicle Type
                    </label>
                    <select
                      value={vehicleType}
                      onChange={e => setVehicleType(e.target.value as any)}
                      className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#19768A]/20"
                    >
                      <option value="Light Truck (Dimas)">Light Truck (Dimas / 1-2 Tonnes)</option>
                      <option value="Three-Wheeler">Three-Wheeler (Small Crates / Rapid Transit)</option>
                      <option value="Motorbike">Motorbike (Express Samples)</option>
                      <option value="Lorry">Commercial Refrigerated Lorry</option>
                    </select>
                  </div>
                  <Input
                    label="Vehicle License Plate Number"
                    type="text"
                    value={vehiclePlate}
                    onChange={e => setVehiclePlate(e.target.value)}
                    placeholder="e.g. WP - LG 8824"
                    required
                  />
                  <Input
                    label="Heavy/Light Driver License Number"
                    type="text"
                    value={driverLicenseNumber}
                    onChange={e => setDriverLicenseNumber(e.target.value)}
                    placeholder="e.g. B-84910284"
                    helperText="Required for insurance compliance on Sri Lankan agricultural corridors."
                  />
                </div>
              )}

              {/* BUYER SPECIFIC FIELDS */}
              {registerRole === 'buyer' && (
                <Input
                  label="Delivery / Receiving Address"
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. No. 42/3, Havelock Road, Colombo 05"
                />
              )}

              <Button type="submit" variant="primary" fullWidth size="md">
                Register as {registerRole === 'farmer' ? 'Farmer' : registerRole === 'driver' ? 'Logistics Driver' : 'Buyer'}
              </Button>

              <div className="pt-1 text-center space-y-1.5">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-xs text-[#1F5C3A] font-semibold hover:underline block mx-auto cursor-pointer"
                >
                  Already registered? Back to Sign In
                </button>
                <button
                  type="button"
                  onClick={continueAsGuest}
                  className="text-xs text-[#6B7280] hover:text-[#1A1A1A] hover:underline block mx-auto cursor-pointer"
                >
                  Or explore marketplace as guest buyer
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
