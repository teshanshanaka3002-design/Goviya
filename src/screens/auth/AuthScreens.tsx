import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
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
  Sparkles,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react-native';
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
      icon: <Sprout size={48} color="#1F5C3A" />,
      color: 'bg-[#E6F2E8]',
    },
    {
      title: 'Find Nearby Verified Producers',
      subtitle:
        'Discover local growers in Nuwara Eliya, Dambulla, Jaffna and Kandy with real-time harvest availability.',
      badge: 'Islandwide Logistics',
      icon: <Truck size={48} color="#2E8C9F" />,
      color: 'bg-[#EEF8FA]',
    },
    {
      title: 'Transparent Pricing & Safe Delivery',
      subtitle:
        'Track live wholesale benchmarks from Dambulla Economic Centre with verified drivers and direct chats.',
      badge: 'Guaranteed Quality',
      icon: <ShieldCheck size={48} color="#E8A317" />,
      color: 'bg-[#FEF8EA]',
    },
  ];

  const handleRegisterSubmit = () => {
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
      verified: registerRole === 'buyer',
      location: {
        lat: district === 'Nuwara Eliya' ? 6.9697 : district === 'Jaffna' ? 9.6615 : 6.9271,
        lng: district === 'Nuwara Eliya' ? 80.7891 : district === 'Jaffna' ? 80.0255 : 79.8612,
        district,
        address: address.trim() || `${district}, Sri Lanka`,
      },
    });
  };

  const handleLoginSubmit = () => {
    setFormError(null);
    const matched = users.find(u => u.role === loginRole) || null;
    if (matched) {
      loginAsUser(matched._id);
    } else {
      loginAsRole(loginRole);
    }
  };

  if (view === 'splash') {
    return (
      <View className="flex-1 justify-between bg-[#1F5C3A] p-6 text-center">
        <View className="flex-row justify-between items-center w-full pt-4">
          <Pressable
            onPress={continueAsGuest}
            className="flex-row items-center gap-1"
          >
            <ChevronLeft size={16} color="#ffffff" />
            <Text className="text-xs font-semibold text-white">Browse as Guest</Text>
          </Pressable>
          <Pressable onPress={() => setView('login')}>
            <Text className="text-xs font-semibold text-white">Sign In</Text>
          </Pressable>
        </View>

        <View className="items-center my-auto">
          <GoviyaLogo size="2xl" variant="white" />
          <Text className="text-3xl font-extrabold text-white mt-4">Goviya</Text>
          <Text className="text-sm text-white/85 mt-2 text-center max-w-xs">
            Sri Lanka’s Direct Farm-to-Buyer Mobile Marketplace
          </Text>
        </View>

        <View className="w-full pb-6" style={{ gap: 12 }}>
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            onPress={() => setView('onboarding')}
          >
            Get Started
          </Button>
          <Pressable
            onPress={() => setView('login')}
            className="w-full py-2.5 items-center"
          >
            <Text className="text-xs text-white/90 font-semibold">Already have an account? Sign In</Text>
          </Pressable>
          <Pressable
            onPress={continueAsGuest}
            className="w-full py-2 items-center"
          >
            <Text className="text-xs text-white/70">Explore marketplace as guest buyer →</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (view === 'onboarding') {
    const current = onboardingSlides[onboardingStep];
    return (
      <View className="flex-1 justify-between bg-white p-6">
        <View className="flex-row items-center justify-between w-full pt-4">
          <Text className="text-xs font-bold text-[#1F5C3A]">{current.badge}</Text>
          <Pressable onPress={continueAsGuest}>
            <Text className="text-xs font-semibold text-[#6B7280]">Browse Marketplace</Text>
          </Pressable>
        </View>

        <View className="items-center my-auto px-4">
          <View
            className={`w-24 h-24 rounded-3xl ${current.color} items-center justify-center mb-6`}
          >
            {current.icon}
          </View>
          <Text className="text-2xl font-bold text-[#1A1A1A] text-center mb-3">
            {current.title}
          </Text>
          <Text className="text-sm text-[#6B7280] text-center leading-relaxed max-w-xs">
            {current.subtitle}
          </Text>
        </View>

        <View className="pb-6" style={{ gap: 16 }}>
          <View className="flex-row justify-center gap-1.5 mb-2">
            {onboardingSlides.map((_, i) => (
              <View
                key={i}
                className={`h-1.5 rounded-full ${
                  onboardingStep === i ? 'w-6 bg-[#1F5C3A]' : 'w-1.5 bg-[#E5E5E5]'
                }`}
              />
            ))}
          </View>

          <View className="flex-row gap-3">
            {onboardingStep > 0 && (
              <Button
                variant="outline"
                style={{ flex: 1 }}
                size="md"
                onPress={() => setOnboardingStep(prev => prev - 1)}
              >
                Back
              </Button>
            )}
            <Button
              variant="primary"
              style={{ flex: 1 }}
              size="md"
              rightIcon={<ArrowRight size={16} color="#ffffff" />}
              onPress={() => {
                if (onboardingStep < onboardingSlides.length - 1) {
                  setOnboardingStep(prev => prev + 1);
                } else {
                  setView('login');
                }
              }}
            >
              {onboardingStep === onboardingSlides.length - 1 ? 'Start Now' : 'Continue'}
            </Button>
          </View>

          <Pressable onPress={continueAsGuest} className="items-center mt-1">
            <Text className="text-xs text-[#1F5C3A] font-semibold">
              Skip & browse marketplace as guest
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5] px-4 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="max-w-md w-full mx-auto" style={{ gap: 16 }}>
        {/* Top Guest Navigation Header Bar */}
        <View className="flex-row items-center justify-between pb-1">
          <Pressable
            onPress={continueAsGuest}
            className="flex-row items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#D5EAD8]"
          >
            <ChevronLeft size={16} color="#1F5C3A" />
            <Text className="text-xs font-bold text-[#1F5C3A]">Browse as Guest Buyer</Text>
          </Pressable>
          <Text className="text-[11px] font-semibold text-[#6B7280]">
            No signup needed to browse
          </Text>
        </View>

        {/* Brand Banner */}
        <View className="items-center pt-1">
          <GoviyaLogo size="lg" />
          <Text className="text-2xl font-extrabold text-[#1A1A1A] mt-2">Goviya</Text>
          <Text className="text-xs text-[#6B7280] text-center">
            Connecting Sri Lankan Farmers Directly With Buyers & Logistics
          </Text>
        </View>

        {/* Role-Gate Explanation Banner */}
        {(effectiveInitialRole === 'farmer' || authTargetRole === 'farmer') && (
          <View className="bg-[#FEF8EA] border border-[#FDE6B8] p-3 rounded-2xl flex-row items-start gap-2.5">
            <Sprout size={20} color="#B45309" />
            <View className="flex-1">
              <Text className="font-bold text-xs text-[#92400E]">Farmer Producer Portal Access</Text>
              <Text className="text-[11px] text-[#A16207] mt-0.5">
                The farmer dashboard requires an authenticated producer account to manage crop harvest listings, update preparation notes, and hand over orders.
              </Text>
            </View>
          </View>
        )}

        {(effectiveInitialRole === 'driver' || authTargetRole === 'driver') && (
          <View className="bg-[#EEF8FA] border border-[#D0EEF5] p-3 rounded-2xl flex-row items-start gap-2.5">
            <Truck size={20} color="#19768A" />
            <View className="flex-1">
              <Text className="font-bold text-xs text-[#0E7490]">Logistics Driver Fleet Portal Access</Text>
              <Text className="text-[11px] text-[#155E75] mt-0.5">
                Fleet drivers must sign up or log in with verified vehicle credentials to view ready farm orders, accept dispatch routes, and record delivery handovers.
              </Text>
            </View>
          </View>
        )}

        {/* 1-Click Instant Persona Sign-In for Easy Testing */}
        <Card variant="mint" padding="md" className="border border-[#CDE5D2]">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-1.5">
              <Sparkles size={14} color="#1F5C3A" />
              <Text className="text-xs font-bold text-[#1F5C3A] uppercase">
                1-Tap Instant Stakeholder Demo
              </Text>
            </View>
            <Text className="text-[10px] text-[#4B6B56] font-medium">Quick switch</Text>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => loginAsRole('buyer')}
              style={({ pressed }) => [{ width: '48%' }, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
              className="flex-row items-center gap-2 p-2.5 bg-white rounded-xl border border-[#D5EAD8]"
            >
              <Text className="text-base">🛒</Text>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#1A1A1A]">Buyer</Text>
                <Text className="text-[10px] text-[#6B7280]">Dinesh · Colombo</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => loginAsRole('farmer')}
              style={({ pressed }) => [{ width: '48%' }, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
              className="flex-row items-center gap-2 p-2.5 bg-white rounded-xl border border-[#D5EAD8]"
            >
              <Text className="text-base">🌱</Text>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#1A1A1A]">Farmer</Text>
                <Text className="text-[10px] text-[#6B7280]">Sunil · Nuwara Eliya</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => loginAsRole('driver')}
              style={({ pressed }) => [{ width: '48%' }, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
              className="flex-row items-center gap-2 p-2.5 bg-white rounded-xl border border-[#D5EAD8]"
            >
              <Text className="text-base">🚚</Text>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#1A1A1A]">Driver</Text>
                <Text className="text-[10px] text-[#6B7280]">Roshan · Dimas Truck</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => loginAsRole('admin')}
              style={({ pressed }) => [{ width: '48%' }, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
              className="flex-row items-center gap-2 p-2.5 bg-white rounded-xl border border-[#D5EAD8]"
            >
              <Text className="text-base">🛡️</Text>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#1A1A1A]">Admin</Text>
                <Text className="text-[10px] text-[#6B7280]">Dr. Niluka · Center</Text>
              </View>
            </Pressable>
          </View>
        </Card>

        {/* Tab Toggle: Sign In vs Create Account */}
        <View className="flex-row p-1 bg-[#E8ECE6] rounded-2xl border border-[#D8DFD5]">
          <Pressable
            onPress={() => {
              setView('login');
              setFormError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              view === 'login' ? 'bg-white' : ''
            }`}
          >
            <Text className={`text-xs font-bold ${view === 'login' ? 'text-[#1F5C3A]' : 'text-[#6B7280]'}`}>
              Sign In
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setView('register');
              setFormError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              view === 'register' ? 'bg-[#1F5C3A]' : ''
            }`}
          >
            <Text className={`text-xs font-bold ${view === 'register' ? 'text-white' : 'text-[#6B7280]'}`}>
              Create New Account
            </Text>
          </Pressable>
        </View>

        {/* Error Notice */}
        {Boolean(formError) && (
          <View className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex-row items-center gap-2">
            <AlertCircle size={16} color="#DC2626" />
            <Text className="text-xs text-[#DC2626] flex-1">{formError}</Text>
          </View>
        )}

        {/* Regular Sign-In / Register Form Card */}
        <Card variant="default" padding="lg">
          {view === 'login' ? (
            <View style={{ gap: 16 }}>
              <View>
                <Text className="text-base font-bold text-[#1A1A1A]">Account Sign In</Text>
                <Text className="text-xs text-[#6B7280] mt-0.5">
                  Sign in to access your customized role dashboard:
                </Text>
              </View>

              {/* Login Role Selector */}
              <View>
                <Text className="text-xs font-semibold text-[#1A1A1A] mb-1.5 uppercase tracking-wider">
                  Select Role to Sign In
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => setLoginRole('buyer')}
                    style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                    className={`flex-1 py-2.5 min-h-[50px] justify-center rounded-xl border items-center ${
                      loginRole === 'buyer' ? 'border-[#1F5C3A] bg-[#E6F2E8]' : 'border-[#E5E5E5] bg-white'
                    }`}
                  >
                    <Text className="text-base">🛒</Text>
                    <Text className="text-[11px] font-bold text-[#1F5C3A] mt-0.5">Buyer</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setLoginRole('farmer')}
                    style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                    className={`flex-1 py-2.5 min-h-[50px] justify-center rounded-xl border items-center ${
                      loginRole === 'farmer' ? 'border-[#B45309] bg-[#FEF8EA]' : 'border-[#E5E5E5] bg-white'
                    }`}
                  >
                    <Text className="text-base">🌱</Text>
                    <Text className="text-[11px] font-bold text-[#B45309] mt-0.5">Farmer</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setLoginRole('driver')}
                    style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                    className={`flex-1 py-2.5 min-h-[50px] justify-center rounded-xl border items-center ${
                      loginRole === 'driver' ? 'border-[#19768A] bg-[#EEF8FA]' : 'border-[#E5E5E5] bg-white'
                    }`}
                  >
                    <Text className="text-base">🚚</Text>
                    <Text className="text-[11px] font-bold text-[#19768A] mt-0.5">Driver</Text>
                  </Pressable>
                </View>
              </View>

              <Input
                label="Registered Mobile Phone Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                leftIcon={<Phone size={16} color="#6B7280" />}
                placeholder="+94 7X XXX XXXX"
              />

              <Input
                label="Password / OTP"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                leftIcon={<Lock size={16} color="#6B7280" />}
                placeholder="Enter password"
              />

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onPress={handleLoginSubmit}
              >
                {`Sign In as ${loginRole === 'buyer' ? 'Buyer' : loginRole === 'farmer' ? 'Farmer' : 'Logistics Driver'}`}
              </Button>

              <View className="pt-2 items-center" style={{ gap: 8 }}>
                <Pressable onPress={() => setView('register')}>
                  <Text className="text-xs text-[#1F5C3A] font-semibold text-center">
                    New to Goviya? Create account as Buyer, Farmer or Driver
                  </Text>
                </Pressable>
                <Pressable onPress={continueAsGuest}>
                  <Text className="text-xs text-[#6B7280] text-center mt-1">
                    Or continue browsing produce marketplace without sign in
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              <View>
                <Text className="text-base font-bold text-[#1A1A1A]">Register New Account</Text>
                <Text className="text-xs text-[#6B7280] mt-0.5">
                  Choose your role to get specialized features:
                </Text>
              </View>

              {/* 3-Role Selector */}
              <View>
                <Text className="text-xs font-semibold text-[#1A1A1A] mb-1.5 uppercase tracking-wider">
                  Select Your Account Role
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => setRegisterRole('buyer')}
                    style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                    className={`flex-1 p-2.5 min-h-[54px] justify-center rounded-xl border items-center ${
                      registerRole === 'buyer' ? 'border-[#1F5C3A] bg-[#E6F2E8]' : 'border-[#E5E5E5] bg-white'
                    }`}
                  >
                    <Users size={20} color="#1F5C3A" />
                    <Text className="text-[11px] font-bold text-[#1F5C3A] mt-1">Buyer</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setRegisterRole('farmer')}
                    style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                    className={`flex-1 p-2.5 min-h-[54px] justify-center rounded-xl border items-center ${
                      registerRole === 'farmer' ? 'border-[#B45309] bg-[#FEF8EA]' : 'border-[#E5E5E5] bg-white'
                    }`}
                  >
                    <Sprout size={20} color="#B45309" />
                    <Text className="text-[11px] font-bold text-[#B45309] mt-1">Farmer</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setRegisterRole('driver')}
                    style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                    className={`flex-1 p-2.5 min-h-[54px] justify-center rounded-xl border items-center ${
                      registerRole === 'driver' ? 'border-[#19768A] bg-[#EEF8FA]' : 'border-[#E5E5E5] bg-white'
                    }`}
                  >
                    <Truck size={20} color="#19768A" />
                    <Text className="text-[11px] font-bold text-[#19768A] mt-1">Driver</Text>
                  </Pressable>
                </View>
              </View>

              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                leftIcon={<UserIcon size={16} color="#6B7280" />}
                placeholder="e.g. Bandara Jayasinghe"
              />

              <Input
                label="Mobile Phone (+94)"
                keyboardType="phone-pad"
                value={regPhone}
                onChangeText={setRegPhone}
                leftIcon={<Phone size={16} color="#6B7280" />}
                placeholder="+94 77 XXX XXXX"
              />

              {registerRole === 'farmer' && (
                <View className="p-3 bg-[#FEF8EA] rounded-xl border border-[#FDE6B8]" style={{ gap: 12 }}>
                  <Text className="text-[11px] font-bold text-[#B45309] uppercase">
                    Producer Farm Details
                  </Text>
                  <Input
                    label="Farm / Holding Name"
                    value={farmName}
                    onChangeText={setFarmName}
                    placeholder="e.g. Kandapola Highland Eco Farm"
                  />
                  <Input
                    label="Farm Size (in Acres)"
                    keyboardType="numeric"
                    value={farmSizeAcres}
                    onChangeText={setFarmSizeAcres}
                    placeholder="e.g. 4.5"
                  />
                </View>
              )}

              {registerRole === 'driver' && (
                <View className="p-3 bg-[#EEF8FA] rounded-xl border border-[#D0EEF5]" style={{ gap: 12 }}>
                  <Text className="text-[11px] font-bold text-[#19768A] uppercase">
                    Fleet Vehicle Details
                  </Text>
                  <Input
                    label="Vehicle License Plate Number"
                    value={vehiclePlate}
                    onChangeText={setVehiclePlate}
                    placeholder="e.g. WP - LG 8824"
                  />
                </View>
              )}

              {registerRole === 'buyer' && (
                <Input
                  label="Delivery / Receiving Address"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="e.g. No. 42/3, Havelock Road, Colombo 05"
                />
              )}

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onPress={handleRegisterSubmit}
              >
                {`Register as ${registerRole === 'farmer' ? 'Farmer' : registerRole === 'driver' ? 'Logistics Driver' : 'Buyer'}`}
              </Button>

              <View className="pt-1 items-center" style={{ gap: 6 }}>
                <Pressable onPress={() => setView('login')}>
                  <Text className="text-xs text-[#1F5C3A] font-semibold text-center">
                    Already registered? Back to Sign In
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  );
};
