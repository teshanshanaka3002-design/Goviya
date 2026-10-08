import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Sprout,
  ShoppingBag,
  Truck,
  User as UserIcon,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Check,
  CreditCard,
  MapPin,
  FileText,
  ShieldCheck,
  Home,
  Layers,
} from 'lucide-react-native';
import { useApp } from '../../services/store';
import { Role } from '../../types';
import { GoviyaMarketplaceBadge } from '../../components/shared/GoviyaMarketplaceBadge';

export interface AuthScreenProps {
  initialRole?: Role;
  initialView?: 'login' | 'register';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialRole,
  initialView = 'login',
}) => {
  const {
    loginAsUser,
    loginAsRole,
    registerUser,
    authTargetRole,
    users,
  } = useApp();

  const [view, setView] = useState<'login' | 'register'>(initialView);

  // Form states
  const [identifier, setIdentifier] = useState(''); // phone or email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register stakeholder role: buyer | farmer | driver
  const [registerRole, setRegisterRole] = useState<'buyer' | 'farmer' | 'driver'>(() => {
    if (initialRole === 'driver' || authTargetRole === 'driver') return 'driver';
    if (initialRole === 'farmer' || authTargetRole === 'farmer') return 'farmer';
    return 'buyer';
  });

  // Common register fields
  const [fullName, setFullName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Delivery Rider specific fields
  const [drivingLicense, setDrivingLicense] = useState('');
  const [vehicleType, setVehicleType] = useState<
    'Three-Wheeler' | 'Light Truck (Dimas)' | 'Motorbike' | 'Lorry'
  >('Light Truck (Dimas)');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [riderDistrict, setRiderDistrict] = useState('Gampaha');

  // Farmer specific fields
  const [farmName, setFarmName] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [farmerDistrict, setFarmerDistrict] = useState('Nuwara Eliya');
  const [farmSize, setFarmSize] = useState('3.5');

  useEffect(() => {
    if (initialView) {
      setView(initialView);
    }
  }, [initialView]);

  useEffect(() => {
    if (initialRole === 'driver' || authTargetRole === 'driver') {
      setRegisterRole('driver');
    } else if (initialRole === 'farmer' || authTargetRole === 'farmer') {
      setRegisterRole('farmer');
    } else if (initialRole === 'buyer' || authTargetRole === 'buyer') {
      setRegisterRole('buyer');
    }
  }, [initialRole, authTargetRole]);

  // Normalize phone digits to match 07X... with +94 7X...
  const normalizeDigits = (str: string) => {
    return str.replace(/\D/g, '').replace(/^94/, '').replace(/^0/, '');
  };

  // Handle standard Login submission
  const handleLoginSubmit = () => {
    const rawInput = identifier.trim();
    const cleanId = rawInput.toLowerCase();
    const inputDigits = normalizeDigits(rawInput);

    // 1. Try matching existing registered user by phone digits, email, or name
    if (rawInput) {
      const matched = users.find(u => {
        const uDigits = normalizeDigits(u.phone);
        const phoneMatch = inputDigits.length >= 7 && uDigits.includes(inputDigits);
        const emailMatch = u.email && u.email.toLowerCase() === cleanId;
        const nameMatch = u.name.toLowerCase() === cleanId;
        return phoneMatch || emailMatch || nameMatch;
      });

      if (matched) {
        loginAsUser(matched._id);
        return;
      }
    }

    // 2. Keyword check if user typed role hint
    if (cleanId.includes('admin')) {
      loginAsRole('admin');
      return;
    }
    if (cleanId.includes('driver') || cleanId.includes('logi') || cleanId.includes('rider')) {
      loginAsRole('driver');
      return;
    }
    if (cleanId.includes('farmer')) {
      loginAsRole('farmer');
      return;
    }
    if (cleanId.includes('buyer')) {
      loginAsRole('buyer');
      return;
    }

    // 3. Fallback based on context
    const targetRole: Role = initialRole || authTargetRole || 'buyer';
    loginAsRole(targetRole);
  };

  // Handle OTP Login
  const handleOtpLogin = () => {
    if (!identifier.trim()) {
      Alert.alert(
        'Phone Number Required',
        'Please enter your mobile number (e.g. 077 123 4567) to receive an SMS verification code.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Use Demo (+94 77 123 4567)',
            onPress: () => {
              setIdentifier('077 123 4567');
              Alert.alert(
                'Demo OTP Code: 482910',
                'Verification successful. Navigating to your dashboard.',
                [
                  {
                    text: 'Continue',
                    onPress: () => loginAsRole('farmer'),
                  },
                ]
              );
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'SMS Verification Code Sent',
      `A 6-digit one-time code was sent to ${identifier.trim()}.\n\nDemo PIN: 482910`,
      [
        {
          text: 'Verify & Continue',
          onPress: () => handleLoginSubmit(),
        },
      ]
    );
  };

  // Forgot password handler
  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Please enter your registered Sri Lankan phone number or email to receive password reset instructions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SMS Link',
          onPress: () =>
            Alert.alert(
              'Reset Link Sent',
              'A password reset link was sent via SMS. Please check your messages.'
            ),
        },
      ]
    );
  };

  // Handle Create Account / Register submission
  const handleRegisterSubmit = () => {
    if (!fullName.trim()) {
      Alert.alert('Full Name Required', 'Please enter your full name to create an account.');
      return;
    }

    if (!identifier.trim()) {
      Alert.alert(
        'Contact Info Required',
        'Please enter your phone number or email address.'
      );
      return;
    }

    // Role-specific validation
    if (registerRole === 'driver') {
      if (!drivingLicense.trim()) {
        Alert.alert(
          'Driving Licence Required',
          'Please enter your Sri Lankan driving licence number to register as a delivery rider.'
        );
        return;
      }
      if (!vehiclePlate.trim()) {
        Alert.alert(
          'Vehicle Number Plate Required',
          'Please enter your vehicle registration plate number (e.g. WP - LG 8824).'
        );
        return;
      }
    }

    if (registerRole === 'farmer') {
      if (!nicNumber.trim()) {
        Alert.alert(
          'NIC Required',
          'Please enter your National Identity Card (NIC) number for farmer identity verification.'
        );
        return;
      }
      if (!farmName.trim()) {
        Alert.alert(
          'Farm Name Required',
          'Please enter your farm or estate name (e.g. Nuwara Eliya Fresh Greens).'
        );
        return;
      }
    }

    if (!agreeTerms) {
      Alert.alert(
        'Terms of Service',
        'Please agree to the Terms of Service and Privacy Policy to register.'
      );
      return;
    }

    // Format phone cleanly
    const rawContact = identifier.trim();
    let formattedPhone = rawContact;
    if (!rawContact.includes('@')) {
      const digits = rawContact.replace(/\D/g, '');
      if (digits.startsWith('94')) {
        formattedPhone = `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
      } else if (digits.startsWith('0')) {
        formattedPhone = `+94 ${digits.slice(1, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
      } else {
        formattedPhone = `+94 ${digits}`;
      }
    }

    // 1. DELIVERY RIDER REGISTRATION
    if (registerRole === 'driver') {
      registerUser({
        name: fullName.trim(),
        phone: formattedPhone,
        email: rawContact.includes('@') ? rawContact : undefined,
        role: 'driver',
        verified: true,
        vehicleType,
        vehiclePlate: vehiclePlate.trim().toUpperCase(),
        rating: 5.0,
        totalRatings: 1,
        location: {
          lat: riderDistrict === 'Colombo' ? 6.9271 : 7.084,
          lng: riderDistrict === 'Colombo' ? 79.8612 : 80.0098,
          district: riderDistrict,
          address: `${riderDistrict} Delivery Hub & Logistics Depot`,
        },
      });
      return;
    }

    // 2. FARMER REGISTRATION
    if (registerRole === 'farmer') {
      registerUser({
        name: fullName.trim(),
        phone: formattedPhone,
        email: rawContact.includes('@') ? rawContact : undefined,
        role: 'farmer',
        verified: false, // Farmers submit documents and require admin KYC approval
        nicNumber: nicNumber.trim(),
        farmName: farmName.trim(),
        farmSizeAcres: parseFloat(farmSize) || 3.0,
        yearsFarming: 5,
        rating: 5.0,
        totalRatings: 1,
        location: {
          lat: 6.9697,
          lng: 80.7891,
          district: farmerDistrict,
          town: farmerDistrict === 'Nuwara Eliya' ? 'Kandapola' : farmerDistrict,
          address: `${farmName.trim()}, ${farmerDistrict}, Sri Lanka`,
        },
      });
      return;
    }

    // 3. BUYER REGISTRATION (Name, Phone/Email, Password)
    registerUser({
      name: fullName.trim(),
      phone: formattedPhone,
      email: rawContact.includes('@') ? rawContact : undefined,
      role: 'buyer',
      verified: true,
      rating: 5.0,
      totalRatings: 1,
      location: {
        lat: 6.9271,
        lng: 79.8612,
        district: 'Colombo',
        town: 'Colombo 03',
        address: 'Colombo, Western Province',
      },
    });
  };

  const vehicleOptions: ('Three-Wheeler' | 'Light Truck (Dimas)' | 'Motorbike' | 'Lorry')[] = [
    'Motorbike',
    'Three-Wheeler',
    'Light Truck (Dimas)',
    'Lorry',
  ];

  const districtOptions = ['Colombo', 'Gampaha', 'Kandy', 'Nuwara Eliya', 'Matale', 'Jaffna', 'Kurunegala'];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#F6F7F5' }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      >
        {/* ==================== 1. TOP FOREST GREEN HEADER ==================== */}
        <View
          style={{
            backgroundColor: '#1B5E39',
            paddingTop: 24,
            paddingBottom: 44,
            paddingHorizontal: 20,
            alignItems: 'center',
          }}
        >
          {view === 'login' ? (
            /* Login Header: Circular Badge + Welcome back! */
            <View style={{ alignItems: 'center' }}>
              <GoviyaMarketplaceBadge shape="circle" size={78} />
              <Text
                style={{
                  fontSize: 27,
                  fontWeight: '800',
                  color: '#FFFFFF',
                  marginTop: 14,
                  textAlign: 'center',
                  letterSpacing: -0.3,
                }}
              >
                Welcome back!
              </Text>
              <Text
                style={{
                  fontSize: 13.5,
                  color: 'rgba(255, 255, 255, 0.85)',
                  marginTop: 6,
                  textAlign: 'center',
                }}
              >
                Sign in to continue growing with us
              </Text>
            </View>
          ) : (
            /* Sign Up Header: Square Badge + Goviya Title + Create your account */
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GoviyaMarketplaceBadge shape="square" size={62} />
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: '900',
                    color: '#FFFFFF',
                    marginLeft: 12,
                    letterSpacing: -0.5,
                  }}
                >
                  Goviya
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 25,
                  fontWeight: '800',
                  color: '#FFFFFF',
                  marginTop: 16,
                  textAlign: 'center',
                  letterSpacing: -0.3,
                }}
              >
                Create your account
              </Text>
              <Text
                style={{
                  fontSize: 13.5,
                  color: 'rgba(255, 255, 255, 0.85)',
                  marginTop: 5,
                  textAlign: 'center',
                }}
              >
                {registerRole === 'driver'
                  ? 'Join our logistics fleet as a delivery rider'
                  : registerRole === 'farmer'
                  ? 'Sell directly from your farm to verified buyers'
                  : 'Start buying fresh harvests directly from growers'}
              </Text>
            </View>
          )}
        </View>

        {/* ==================== 2. MAIN WHITE FLOATING CARD ==================== */}
        <View
          style={{
            marginTop: -24,
            marginHorizontal: 16,
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 22,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          {view === 'login' ? (
            /* ------------------ LOGIN FORM ------------------ */
            <View style={{ gap: 15 }}>
              {/* Field: Phone Number / Email */}
              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#1A1A1A',
                    marginBottom: 8,
                  }}
                >
                  Phone Number / Email
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    height: 52,
                    backgroundColor: '#FFFFFF',
                    gap: 10,
                  }}
                >
                  <UserIcon size={19} color="#9CA3AF" />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 13.5,
                      color: '#1A1A1A',
                      padding: 0,
                    }}
                    placeholder="Enter your phone number or email"
                    placeholderTextColor="#9CA3AF"
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Field: Password */}
              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#1A1A1A',
                    marginBottom: 8,
                  }}
                >
                  Password
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    height: 52,
                    backgroundColor: '#FFFFFF',
                    gap: 10,
                  }}
                >
                  <Lock size={19} color="#9CA3AF" />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 13.5,
                      color: '#1A1A1A',
                      padding: 0,
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={8}
                    style={{ padding: 4 }}
                  >
                    {showPassword ? (
                      <EyeOff size={19} color="#6B7280" />
                    ) : (
                      <Eye size={19} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Forgot password? Link */}
              <Pressable
                onPress={handleForgotPassword}
                style={{ alignSelf: 'flex-end', marginTop: -2, marginBottom: 4 }}
              >
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: '700',
                    color: '#1B5E39',
                  }}
                >
                  Forgot password?
                </Text>
              </Pressable>

              {/* Primary Log In Button */}
              <Pressable
                onPress={handleLoginSubmit}
                style={({ pressed }) => [
                  {
                    height: 50,
                    backgroundColor: '#1B5E39',
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 6,
                  },
                  pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                ]}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: '#FFFFFF',
                  }}
                >
                  Log In
                </Text>
              </Pressable>

              {/* Secondary Log in with OTP Button */}
              <Pressable
                onPress={handleOtpLogin}
                style={({ pressed }) => [
                  {
                    height: 50,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1.5,
                    borderColor: '#1B5E39',
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  pressed && { opacity: 0.85, backgroundColor: '#F8FAF8' },
                ]}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: '#1B5E39',
                  }}
                >
                  Log in with OTP
                </Text>
              </Pressable>
            </View>
          ) : (
            /* ------------------ REGISTER FORM ------------------ */
            <View style={{ gap: 14 }}>
              {/* Section: I want to join as (Buyer | Farmer | Delivery Rider) */}
              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#1A1A1A',
                    marginBottom: 10,
                  }}
                >
                  I want to join as
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {/* Buyer Option */}
                  <Pressable
                    onPress={() => setRegisterRole('buyer')}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 13,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor:
                        registerRole === 'buyer' ? '#EAF4ED' : '#FFFFFF',
                      borderWidth: registerRole === 'buyer' ? 2 : 1,
                      borderColor:
                        registerRole === 'buyer' ? '#1B5E39' : '#E5E7EB',
                    }}
                  >
                    <ShoppingBag
                      size={16}
                      color={registerRole === 'buyer' ? '#1B5E39' : '#4B5563'}
                    />
                    <Text
                      style={{
                        fontSize: 12.5,
                        fontWeight: '700',
                        color:
                          registerRole === 'buyer' ? '#1B5E39' : '#4B5563',
                      }}
                    >
                      Buyer
                    </Text>
                  </Pressable>

                  {/* Farmer Option */}
                  <Pressable
                    onPress={() => setRegisterRole('farmer')}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 13,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor:
                        registerRole === 'farmer' ? '#EAF4ED' : '#FFFFFF',
                      borderWidth: registerRole === 'farmer' ? 2 : 1,
                      borderColor:
                        registerRole === 'farmer' ? '#1B5E39' : '#E5E7EB',
                    }}
                  >
                    <Sprout
                      size={16}
                      color={registerRole === 'farmer' ? '#1B5E39' : '#4B5563'}
                    />
                    <Text
                      style={{
                        fontSize: 12.5,
                        fontWeight: '700',
                        color:
                          registerRole === 'farmer' ? '#1B5E39' : '#4B5563',
                      }}
                    >
                      Farmer
                    </Text>
                  </Pressable>

                  {/* Delivery Rider Option */}
                  <Pressable
                    onPress={() => setRegisterRole('driver')}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 13,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor:
                        registerRole === 'driver' ? '#EAF4ED' : '#FFFFFF',
                      borderWidth: registerRole === 'driver' ? 2 : 1,
                      borderColor:
                        registerRole === 'driver' ? '#1B5E39' : '#E5E7EB',
                    }}
                  >
                    <Truck
                      size={16}
                      color={registerRole === 'driver' ? '#1B5E39' : '#4B5563'}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color:
                          registerRole === 'driver' ? '#1B5E39' : '#4B5563',
                      }}
                    >
                      Rider
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Field: Full Name */}
              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#1A1A1A',
                    marginBottom: 7,
                  }}
                >
                  Full Name
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    height: 50,
                    backgroundColor: '#FFFFFF',
                    gap: 10,
                  }}
                >
                  <UserIcon size={18} color="#9CA3AF" />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 13.5,
                      color: '#1A1A1A',
                      padding: 0,
                    }}
                    placeholder={
                      registerRole === 'driver'
                        ? 'Enter delivery rider full name'
                        : registerRole === 'farmer'
                        ? 'Enter farmer full name'
                        : 'Enter your full name'
                    }
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              {/* Field: Phone Number / Email */}
              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#1A1A1A',
                    marginBottom: 7,
                  }}
                >
                  Phone Number / Email
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    height: 50,
                    backgroundColor: '#FFFFFF',
                    gap: 10,
                  }}
                >
                  <Phone size={18} color="#9CA3AF" />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 13.5,
                      color: '#1A1A1A',
                      padding: 0,
                    }}
                    placeholder="Enter your phone number or email"
                    placeholderTextColor="#9CA3AF"
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Field: Password */}
              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#1A1A1A',
                    marginBottom: 7,
                  }}
                >
                  Password
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    height: 50,
                    backgroundColor: '#FFFFFF',
                    gap: 10,
                  }}
                >
                  <Lock size={18} color="#9CA3AF" />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 13.5,
                      color: '#1A1A1A',
                      padding: 0,
                    }}
                    placeholder="Create a password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={8}
                    style={{ padding: 4 }}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#6B7280" />
                    ) : (
                      <Eye size={18} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* ================= STAKEHOLDER SPECIFIC FIELDS ================= */}

              {/* A. DELIVERY RIDER ADDITIONAL FIELDS */}
              {registerRole === 'driver' && (
                <View
                  style={{
                    backgroundColor: '#F8FAF8',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 16,
                    padding: 14,
                    gap: 12,
                    marginTop: 2,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <ShieldCheck size={16} color="#1B5E39" />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#1B5E39' }}>
                      Rider & Fleet Verification
                    </Text>
                  </View>

                  {/* Driving Licence Number */}
                  <View>
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
                      Driving Licence Number
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        height: 46,
                        backgroundColor: '#FFFFFF',
                        gap: 8,
                      }}
                    >
                      <CreditCard size={17} color="#9CA3AF" />
                      <TextInput
                        style={{ flex: 1, fontSize: 13, color: '#1A1A1A', padding: 0 }}
                        placeholder="e.g. B-84910284"
                        placeholderTextColor="#9CA3AF"
                        value={drivingLicense}
                        onChangeText={setDrivingLicense}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>

                  {/* Vehicle Type Picker */}
                  <View>
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
                      Vehicle Type
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {vehicleOptions.map(vt => {
                        const isSelected = vehicleType === vt;
                        return (
                          <Pressable
                            key={vt}
                            onPress={() => setVehicleType(vt)}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 7,
                              borderRadius: 10,
                              borderWidth: isSelected ? 1.5 : 1,
                              borderColor: isSelected ? '#1B5E39' : '#D1D5DB',
                              backgroundColor: isSelected ? '#EAF4ED' : '#FFFFFF',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 11.5,
                                fontWeight: isSelected ? '700' : '500',
                                color: isSelected ? '#1B5E39' : '#4B5563',
                              }}
                            >
                              {vt === 'Three-Wheeler' ? '🛺 Three-Wheeler' : vt === 'Light Truck (Dimas)' ? '🚚 Dimas Truck' : vt === 'Motorbike' ? '🏍️ Motorbike' : '🚛 Lorry'}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Vehicle Number Plate */}
                  <View>
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
                      Vehicle Number Plate
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        height: 46,
                        backgroundColor: '#FFFFFF',
                        gap: 8,
                      }}
                    >
                      <FileText size={17} color="#9CA3AF" />
                      <TextInput
                        style={{ flex: 1, fontSize: 13, color: '#1A1A1A', padding: 0 }}
                        placeholder="e.g. WP - LG 8824"
                        placeholderTextColor="#9CA3AF"
                        value={vehiclePlate}
                        onChangeText={setVehiclePlate}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>

                  {/* Delivery Operating Hub */}
                  <View>
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
                      Operating District / Hub
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {districtOptions.slice(0, 5).map(dist => {
                        const isSelected = riderDistrict === dist;
                        return (
                          <Pressable
                            key={dist}
                            onPress={() => setRiderDistrict(dist)}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: isSelected ? '#1B5E39' : '#E5E7EB',
                              backgroundColor: isSelected ? '#1B5E39' : '#FFFFFF',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: isSelected ? '700' : '500',
                                color: isSelected ? '#FFFFFF' : '#4B5563',
                              }}
                            >
                              {dist}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}

              {/* B. FARMER ADDITIONAL FIELDS */}
              {registerRole === 'farmer' && (
                <View
                  style={{
                    backgroundColor: '#F8FAF8',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 16,
                    padding: 14,
                    gap: 12,
                    marginTop: 2,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Sprout size={16} color="#1B5E39" />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#1B5E39' }}>
                      Farm Holding & KYC Details
                    </Text>
                  </View>

                  {/* Farm Name */}
                  <View>
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
                      Farm / Estate Name
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        height: 46,
                        backgroundColor: '#FFFFFF',
                        gap: 8,
                      }}
                    >
                      <Home size={17} color="#9CA3AF" />
                      <TextInput
                        style={{ flex: 1, fontSize: 13, color: '#1A1A1A', padding: 0 }}
                        placeholder="e.g. Nuwara Eliya Fresh Greens"
                        placeholderTextColor="#9CA3AF"
                        value={farmName}
                        onChangeText={setFarmName}
                      />
                    </View>
                  </View>

                  {/* NIC Number */}
                  <View>
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
                      National Identity Card (NIC)
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        height: 46,
                        backgroundColor: '#FFFFFF',
                        gap: 8,
                      }}
                    >
                      <CreditCard size={17} color="#9CA3AF" />
                      <TextInput
                        style={{ flex: 1, fontSize: 13, color: '#1A1A1A', padding: 0 }}
                        placeholder="e.g. 198567204918 or 856720491V"
                        placeholderTextColor="#9CA3AF"
                        value={nicNumber}
                        onChangeText={setNicNumber}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>

                  {/* Farm District & Size in 2 columns */}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
                        Farm District
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          borderRadius: 12,
                          paddingHorizontal: 10,
                          height: 46,
                          backgroundColor: '#FFFFFF',
                          gap: 6,
                        }}
                      >
                        <MapPin size={16} color="#9CA3AF" />
                        <TextInput
                          style={{ flex: 1, fontSize: 12.5, color: '#1A1A1A', padding: 0 }}
                          placeholder="e.g. Nuwara Eliya"
                          placeholderTextColor="#9CA3AF"
                          value={farmerDistrict}
                          onChangeText={setFarmerDistrict}
                        />
                      </View>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
                        Farm Size (Acres)
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          borderRadius: 12,
                          paddingHorizontal: 10,
                          height: 46,
                          backgroundColor: '#FFFFFF',
                          gap: 6,
                        }}
                      >
                        <Layers size={16} color="#9CA3AF" />
                        <TextInput
                          style={{ flex: 1, fontSize: 12.5, color: '#1A1A1A', padding: 0 }}
                          placeholder="e.g. 3.5"
                          placeholderTextColor="#9CA3AF"
                          value={farmSize}
                          onChangeText={setFarmSize}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Checkbox: Terms of Service & Privacy Policy */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 4,
                }}
              >
                <Pressable
                  onPress={() => setAgreeTerms(!agreeTerms)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 1.5,
                    borderColor: agreeTerms ? '#1B5E39' : '#D1D5DB',
                    backgroundColor: agreeTerms ? '#1B5E39' : '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {agreeTerms && (
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  )}
                </Pressable>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#4B5563',
                    flex: 1,
                    lineHeight: 18,
                  }}
                >
                  I agree to the{' '}
                  <Text style={{ fontWeight: '700', color: '#1B5E39' }}>
                    Terms of Service
                  </Text>{' '}
                  and{' '}
                  <Text style={{ fontWeight: '700', color: '#1B5E39' }}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>

              {/* Primary Create Account Button */}
              <Pressable
                onPress={handleRegisterSubmit}
                style={({ pressed }) => [
                  {
                    height: 50,
                    backgroundColor: '#1B5E39',
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 8,
                  },
                  pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                ]}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: '#FFFFFF',
                  }}
                >
                  {registerRole === 'driver'
                    ? 'Register as Delivery Rider'
                    : registerRole === 'farmer'
                    ? 'Register as Farmer'
                    : 'Create Buyer Account'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* ==================== 3. FOOTER ACTIONS & NAVIGATION ==================== */}
        {view === 'login' ? (
          /* Login Footer with Register Link + Direct Role Navigation */
          <View style={{ paddingHorizontal: 16, paddingTop: 18, gap: 10 }}>
            {/* Don't have an account? Register */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <Text style={{ fontSize: 13, color: '#6B7280' }}>
                Don't have an account?{' '}
              </Text>
              <Pressable onPress={() => setView('register')}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#1B5E39',
                  }}
                >
                  Register
                </Text>
              </Pressable>
            </View>

            {/* Quick 2-Column Role Cards: Farmer & Buyer */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => loginAsRole('farmer')}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    height: 48,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  },
                  pressed && { opacity: 0.85, backgroundColor: '#F8FAF8' },
                ]}
              >
                <Sprout size={18} color="#1B5E39" />
                <Text
                  style={{
                    fontSize: 13.5,
                    fontWeight: '700',
                    color: '#1A1A1A',
                  }}
                >
                  Farmer
                </Text>
              </Pressable>

              <Pressable
                onPress={() => loginAsRole('buyer')}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    height: 48,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  },
                  pressed && { opacity: 0.85, backgroundColor: '#F8FAF8' },
                ]}
              >
                <ShoppingBag size={18} color="#1B5E39" />
                <Text
                  style={{
                    fontSize: 13.5,
                    fontWeight: '700',
                    color: '#1A1A1A',
                  }}
                >
                  Buyer
                </Text>
              </Pressable>
            </View>

            {/* Login as Admin Button */}
            <Pressable
              onPress={() => loginAsRole('admin')}
              style={({ pressed }) => [
                {
                  height: 48,
                  backgroundColor: '#EAF4ED',
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 2,
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <UserIcon size={18} color="#1B5E39" />
              <Text
                style={{
                  fontSize: 13.5,
                  fontWeight: '700',
                  color: '#1B5E39',
                }}
              >
                Login as Admin
              </Text>
            </Pressable>

            {/* Login as logidriver Button */}
            <Pressable
              onPress={() => loginAsRole('driver')}
              style={({ pressed }) => [
                {
                  height: 48,
                  backgroundColor: '#EAF4ED',
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <UserIcon size={18} color="#1B5E39" />
              <Text
                style={{
                  fontSize: 13.5,
                  fontWeight: '700',
                  color: '#1B5E39',
                }}
              >
                Login as logidriver
              </Text>
            </Pressable>
          </View>
        ) : (
          /* Register Footer: Already have an account? Log In */
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 20,
            }}
          >
            <Text style={{ fontSize: 13, color: '#6B7280' }}>
              Already have an account?{' '}
            </Text>
            <Pressable onPress={() => setView('login')}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: '#1B5E39',
                }}
              >
                Log In
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default AuthScreen;
