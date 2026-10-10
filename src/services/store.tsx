import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  Role,
  Listing,
  ListingStatus,
  Order,
  OrderItem,
  OrderStatus,
  Conversation,
  ChatMessage,
  MarketPriceRecord,
  Complaint,
  SupportTicket,
  TicketMessage,
  TicketStatus,
  PlatformStat,
  CropCategory,
} from '../types';
import {
  mockUsers,
  mockConversations,
  mockChatMessages,
  mockMarketPrices,
  mockPlatformStats,
  mockCategories,
} from './mockData';
import { DEFAULT_FARMER_AVATAR, GAMINI_FARMER_AVATAR, KAVINDA_FARMER_AVATAR } from './farmerAvatarData';
import {
  auth,
  isFirebaseConfigured,
  formatAuthError,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from './firebase';
import {
  db,
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  runTransaction,
  syncOrdersToFirestore,
} from './firestore';

export { db, doc, collection, onSnapshot, updateDoc, setDoc, deleteDoc, auth, isFirebaseConfigured, arrayUnion, runTransaction };

export interface PlaceOrderInput {
  deliveryType?: 'delivery' | 'pickup';
  deliveryAddress: string;
  district: string;
  paymentMethod: 'cash_on_delivery' | 'card' | 'mobile_wallet';
  notes?: string;
  buyerName?: string;
  buyerPhone?: string;
  deliveryTimeSlot?: string;
  cashChangeDetails?: string;
  cardDetails?: {
    cardLast4: string;
    cardHolder: string;
  };
}

export const calculateCartTotals = (items: { listing: Listing; quantityKg: number }[]) => {
  const subtotal = items.reduce((acc, item) => acc + item.listing.pricePerKg * item.quantityKg, 0);
  const deliveryFee = items.length > 0 ? 1500 : 0;
  const total = subtotal + deliveryFee;
  return { subtotal, deliveryFee, total };
};

interface CartItem {
  listing: Listing;
  quantityKg: number;
}

interface NavigationState {
  role: Role;
  activeTab: string;
  subScreen: string | null;
  selectedListingId: string | null;
  selectedOrderId: string | null;
  selectedConversationId: string | null;
  selectedUserId?: string | null;
  selectedComplaintId?: string | null;
  selectedTicketId?: string | null;
  authRole?: Role;
  authView?: 'login' | 'register';
}

interface AppContextType {
  currentUser: User | null;
  currentRole: Role;
  navState: NavigationState;
  cart: CartItem[];
  listings: Listing[];
  orders: Order[];
  conversations: Conversation[];
  messages: ChatMessage[];
  marketPrices: MarketPriceRecord[];
  complaints: Complaint[];
  tickets: SupportTicket[];
  users: User[];
  categories: CropCategory[];
  platformStats: PlatformStat;
  isSimulatorFrame: boolean;
  toggleSimulatorFrame: () => void;
  // Auth & Nav
  authLoading: boolean;
  authError: string | null;
  authTargetRole: Role | null;
  openAuth: (targetRole?: Role, view?: 'login' | 'register') => void;
  switchRole: (role: Role) => void;
  continueAsGuest: () => void;
  loginAsUser: (userId: string) => void;
  loginAsRole: (role: Role) => void;
  login: (identifier: string, password: string) => Promise<User>;
  registerUser: (userData: Partial<User>, password?: string) => Promise<User>;
  logout: () => Promise<void>;
  setTab: (tab: string) => void;
  goToSubScreen: (
    subScreen: string | null,
    meta?: {
      listingId?: string;
      orderId?: string;
      conversationId?: string;
      userId?: string;
      complaintId?: string;
      ticketId?: string;
      initialRole?: Role;
      initialView?: 'login' | 'register';
    }
  ) => void;
  goBack: () => void;
  // Cart
  addToCart: (listing: Listing, quantityKg: number) => void;
  updateCartQuantity: (listingId: string, quantityKg: number) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  // Orders
  placeOrder: (input: PlaceOrderInput) => Promise<Order>;
  advanceOrderStatus: (orderId: string) => Promise<void>;
  farmerAcceptOrder: (orderId: string) => Promise<void>;
  farmerRejectOrder: (orderId: string, reason: string) => Promise<void>;
  farmerUpdateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  farmerConfirmPickupHandover: (orderId: string) => Promise<void>;
  driverAcceptOrder: (orderId: string) => Promise<void>;
  driverConfirmPickup: (orderId: string) => Promise<void>;
  driverConfirmDelivery: (orderId: string, proofNote?: string) => Promise<void>;
  buyerConfirmPickup: (orderId: string) => Promise<void>;
  // Listings
  addListing: (listingData: Omit<Listing, '_id' | 'farmerId' | 'farmerName' | 'farmerPhone' | 'farmerRating'>) => Promise<string>;
  updateListingStatus: (listingId: string, status: 'active' | 'out_of_stock' | 'removed') => void;
  updateListingPhotos: (listingId: string, photos: string[]) => void;
  deleteListingPhoto: (listingId: string, photoIndex: number) => void;
  addListingPhoto: (listingId: string, photoUrl: string) => void;
  setListingCoverPhoto: (listingId: string, photoIndex: number) => void;
  clearListingPhotos: (listingId: string) => void;
  deleteListing: (listingId: string) => void;
  updateListing: (listingId: string, data: Partial<Listing>) => void;
  // Categories
  addCategory: (category: { name: string; description: string; iconName: string; iconUrl?: string }) => void;
  updateCategory: (id: string, data: Partial<CropCategory>) => void;
  deleteCategory: (id: string) => void;
  // Chat
  sendMessage: (conversationId: string, content: string, type?: 'text' | 'order_request', extra?: any) => void;
  getOrCreateConversation: (targetId: string, targetName: string, cropName?: string, targetRole?: Role) => string;
  // Admin
  adminVerifyUser: (userId: string, approved: boolean) => void;
  adminToggleDeactivateUser: (userId: string) => void;
  adminResolveComplaint: (complaintId: string, action: 'resolved' | 'dismissed', note: string) => void;
  adminWarnUser: (complaintId: string, note?: string) => void;
  adminRemoveListingFromComplaint: (complaintId: string, listingId: string, reason?: string) => void;
  adminUpdateTicketStatus: (ticketId: string, status: TicketStatus, note?: string) => Promise<void>;
  // User profile & Support
  updateCurrentUser: (userData: Partial<User>) => void;
  fileComplaint: (complaintData: Omit<Complaint, '_id' | 'createdAt' | 'status'>) => Complaint;
  raiseTicket: (ticketData: {
    category: string;
    subject: string;
    description: string;
    orderId?: string | null;
  }) => Promise<SupportTicket>;
  sendTicketMessage: (ticketId: string, message: string) => Promise<void>;
  listenToTicketMessages: (ticketId: string, callback: (msgs: TicketMessage[]) => void) => () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_PREFIX = 'goviya_v1_';

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {}
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {}
  },
  removeItem: (key: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {}
  },
};

export const formatTimestamp = (ts: any): string => {
  if (!ts) {
    return new Date().toISOString();
  }
  if (typeof ts.toDate === 'function') {
    try {
      return ts.toDate().toISOString();
    } catch {}
  }
  if (ts instanceof Date) {
    return ts.toISOString();
  }
  if (typeof ts.seconds === 'number') {
    try {
      return new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1000000)).toISOString();
    } catch {}
  }
  if (typeof ts === 'number') {
    return new Date(ts).toISOString();
  }
  if (typeof ts === 'string') {
    return ts;
  }
  return new Date().toISOString();
};

export const formatOptionalTimestamp = (ts: any): string | undefined => {
  if (!ts) {
    return undefined;
  }
  if (typeof ts.toDate === 'function') {
    try {
      return ts.toDate().toISOString();
    } catch {}
  }
  if (ts instanceof Date) {
    return ts.toISOString();
  }
  if (typeof ts.seconds === 'number') {
    try {
      return new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1000000)).toISOString();
    } catch {}
  }
  if (typeof ts === 'number') {
    return new Date(ts).toISOString();
  }
  if (typeof ts === 'string') {
    return ts;
  }
  return undefined;
};

export const getTimestampMillis = (val: any): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (val instanceof Date) return val.getTime();
  if (typeof val.toDate === 'function') {
    try {
      return val.toDate().getTime();
    } catch {
      return 0;
    }
  }
  if (typeof val.seconds === 'number') {
    return val.seconds * 1000 + Math.floor((val.nanoseconds || 0) / 1000000);
  }
  if (typeof val === 'string') {
    const parsed = Date.parse(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const sortOrdersDesc = (a: Order, b: Order): number => {
  const timeA = getTimestampMillis(a.createdAt);
  const timeB = getTimestampMillis(b.createdAt);
  if (timeB !== timeA) {
    return timeB - timeA;
  }
  return (b._id || '').localeCompare(a._id || '');
};

export const mapFirestoreOrder = (docSnap: any): Order => {
  const data = docSnap.data();
  return {
    _id: docSnap.id,
    orderNumber: data.orderNumber || `GOV-${docSnap.id.slice(0, 6).toUpperCase()}`,
    buyerId: data.buyerId || '',
    buyerName: data.buyerName || 'Buyer',
    buyerPhone: data.buyerPhone || '',
    farmerId: data.farmerId || '',
    farmerName: data.farmerName || 'Farmer',
    farmerPhone: data.farmerPhone || '',
    farmerAddress: data.farmerAddress || '',
    driverId: data.driverId || undefined,
    driverName:
      data.driverName ||
      (data.driverId
        ? (auth.currentUser && auth.currentUser.uid === data.driverId
            ? auth.currentUser.displayName || 'Roshan Kaluarachchi'
            : 'Roshan Kaluarachchi')
        : undefined),
    driverPhone:
      data.driverPhone ||
      (data.driverId
        ? (auth.currentUser && auth.currentUser.uid === data.driverId
            ? auth.currentUser.phoneNumber || '+94 78 234 5678'
            : '+94 78 234 5678')
        : undefined),
    driverVehicle: data.driverVehicle || (data.driverId ? 'Light Truck · WP - LG 8824' : undefined),
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: Number(data.subtotal || 0),
    deliveryFee: Number(data.deliveryFee || 0),
    serviceFee: Number(data.serviceFee || 0),
    total: Number(data.total || 0),
    paymentMethod: data.paymentMethod || 'cash_on_delivery',
    deliveryType: data.deliveryType || 'delivery',
    pickupLocation: data.pickupLocation,
    pickupPin: data.pickupPin,
    preparationNote: data.preparationNote,
    pickedUpAt: data.pickedUpAt,
    deliveredAt: data.deliveredAt,
    deliveredBy: data.deliveredBy,
    deliveryProofNote: data.deliveryProofNote,
    deliveryAddress: data.deliveryAddress || '',
    deliveryDistrict: data.deliveryDistrict || '',
    deliveryNotes: data.deliveryNotes,
    deliveryTimeSlot: data.deliveryTimeSlot,
    cashChangeDetails: data.cashChangeDetails,
    cardDetails: data.cardDetails,
    status: (data.status as OrderStatus) || 'pending',
    rejectionReason: data.rejectionReason,
    createdAt: formatTimestamp(data.createdAt),
    updatedAt: formatOptionalTimestamp(data.updatedAt) || formatTimestamp(data.createdAt),
    timeline: Array.isArray(data.timeline) ? data.timeline : [],
  };
};

export const mapFirestoreUser = (docSnap: any): User => {
  const data = docSnap.data();
  const rawUid = data.uid || docSnap.id;
  return {
    _id: docSnap.id,
    uid: rawUid,
    name: data.name || (data.role === 'admin' ? 'Isuru Admin' : 'Goviya User'),
    email: data.email || undefined,
    phone: data.phone || '',
    role: (data.role as Role) || 'buyer',
    verified: Boolean(data.verified),
    isDeactivated: Boolean(data.isDeactivated),
    createdAt: formatTimestamp(data.createdAt),
    updatedAt: formatOptionalTimestamp(data.updatedAt),
    avatarUrl: data.avatarUrl,
    location: data.location || (data.district ? { lat: 6.9271, lng: 79.8612, district: data.district, address: data.district } : undefined),
    district: data.district || data.location?.district,
    nicNumber: data.nicNumber,
    farmName: data.farmName,
    farmSizeAcres: data.farmSizeAcres !== undefined ? Number(data.farmSizeAcres) : undefined,
    yearsFarming: data.yearsFarming !== undefined ? Number(data.yearsFarming) : undefined,
    drivingLicenceNumber: data.drivingLicenceNumber || data.drivingLicense,
    drivingLicense: data.drivingLicenceNumber || data.drivingLicense,
    vehicleType: data.vehicleType,
    vehiclePlate: data.vehiclePlate,
    rating: data.rating !== undefined ? Number(data.rating) : 5.0,
    totalRatings: data.totalRatings !== undefined ? Number(data.totalRatings) : 0,
    verificationDocuments: data.verificationDocuments,
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Simulator frame toggle
  const [isSimulatorFrame, setIsSimulatorFrame] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth > 900 : false;
  });

  // Current user & role
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = safeStorage.getItem(STORAGE_PREFIX + 'user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u._id === 'user_farmer_1' && (!u.avatarUrl || u.avatarUrl.includes('unsplash.com'))) {
          u.avatarUrl = DEFAULT_FARMER_AVATAR;
        }
        return u;
      } catch (e) { /* ignore */ }
    }
    return null; // Guest buyer initially: visitors can view the buyer marketplace without signup or login!
  });

  const [authTargetRole, setAuthTargetRole] = useState<Role | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Navigation State
  const [navState, setNavState] = useState<NavigationState>(() => {
    const initialRole = currentUser ? currentUser.role : 'buyer';
    return {
      role: initialRole,
      activeTab: initialRole === 'admin' ? 'dashboard' : 'home',
      subScreen: null,
      selectedListingId: null,
      selectedOrderId: null,
      selectedConversationId: null,
    };
  });

  const currentRole: Role = currentUser ? currentUser.role : navState.role;

  // Data Collections
  const [users, setUsers] = useState<User[]>(() => {
    if (isFirebaseConfigured) return [];
    const saved = safeStorage.getItem(STORAGE_PREFIX + 'users');
    if (!saved) return mockUsers;
    try {
      return JSON.parse(saved);
    } catch {
      return mockUsers;
    }
  });

  const [listings, setListings] = useState<Listing[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = safeStorage.getItem(STORAGE_PREFIX + 'cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = safeStorage.getItem(STORAGE_PREFIX + 'conversations');
    return saved ? JSON.parse(saved) : mockConversations;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = safeStorage.getItem(STORAGE_PREFIX + 'messages');
    return saved ? JSON.parse(saved) : mockChatMessages;
  });

  const [marketPrices] = useState<MarketPriceRecord[]>(mockMarketPrices);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const [categories, setCategories] = useState<CropCategory[]>(() => {
    const saved = safeStorage.getItem(STORAGE_PREFIX + 'categories');
    if (!saved) return mockCategories;
    try {
      const parsed: CropCategory[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(c => c.id));
      const missingMocks = mockCategories.filter(c => !existingIds.has(c.id));
      return [...parsed, ...missingMocks];
    } catch (e) {
      return mockCategories;
    }
  });

  // Calculate platform statistics dynamically from real Firestore collections
  const platformStats: PlatformStat = useMemo(() => {
    const totalFarmers = users.filter(u => u.role === 'farmer').length;
    const totalBuyers = users.filter(u => u.role === 'buyer').length;
    const totalDrivers = users.filter(u => u.role === 'driver').length;
    const totalTransactionsLkr = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const activeListingsCount = listings.filter(l => l.status === 'active').length;
    const completedDeliveriesCount = orders.filter(o => o.status === 'delivered').length;

    return {
      totalFarmers,
      totalBuyers,
      totalDrivers,
      totalTransactionsLkr,
      activeListingsCount,
      completedDeliveriesCount,
      topCrops: mockPlatformStats.topCrops,
      monthlyVolume: mockPlatformStats.monthlyVolume,
    };
  }, [users, orders, listings]);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      safeStorage.setItem(STORAGE_PREFIX + 'user', JSON.stringify(currentUser));
    } else {
      safeStorage.removeItem(STORAGE_PREFIX + 'user');
    }
  }, [currentUser]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_PREFIX + 'cart', JSON.stringify(cart));
  }, [cart]);


  useEffect(() => {
    if (!isFirebaseConfigured) {
      safeStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
    } else {
      safeStorage.removeItem(STORAGE_PREFIX + 'users');
    }
  }, [users]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_PREFIX + 'conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_PREFIX + 'messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_PREFIX + 'categories', JSON.stringify(categories));
  }, [categories]);

  // ----------------------------------------------------
  // Firebase Auth State Listener (Session Restoration)
  // ----------------------------------------------------
  const [isAuthReady, setIsAuthReady] = useState<boolean>(!isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            let userSnap = await getDoc(userDocRef);

            if (!userSnap.exists() && firebaseUser.email?.toLowerCase() === 'isuru@gmail.com') {
              try {
                await setDoc(userDocRef, {
                  _id: firebaseUser.uid,
                  uid: firebaseUser.uid,
                  name: firebaseUser.displayName || 'Isuru Admin',
                  email: 'isuru@gmail.com',
                  role: 'admin',
                  verified: true,
                  isDeactivated: false,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
                userSnap = await getDoc(userDocRef);
              } catch (initErr) {
                console.warn('Auto-provisioning admin doc on auth listener deferred:', initErr);
              }
            }

            if (userSnap.exists()) {
              const data = userSnap.data();
              const appUser: User = {
                _id: firebaseUser.uid,
                uid: firebaseUser.uid,
                name: data.name || firebaseUser.displayName || 'Goviya User',
                email: data.email || firebaseUser.email || undefined,
                phone: data.phone || '',
                role: (data.role as Role) || 'buyer',
                verified: Boolean(data.verified),
                isDeactivated: Boolean(data.isDeactivated),
                createdAt: formatTimestamp(data.createdAt),
                updatedAt: formatOptionalTimestamp(data.updatedAt),
                avatarUrl: data.avatarUrl,
                location: data.location,
                district: data.district || data.location?.district,
                nicNumber: data.nicNumber,
                farmName: data.farmName,
                farmSizeAcres: data.farmSizeAcres,
                yearsFarming: data.yearsFarming,
                drivingLicenceNumber: data.drivingLicenceNumber || data.drivingLicense,
                drivingLicense: data.drivingLicenceNumber || data.drivingLicense,
                vehicleType: data.vehicleType,
                vehiclePlate: data.vehiclePlate,
                rating: data.rating,
                totalRatings: data.totalRatings,
              };

              if (appUser.isDeactivated) {
                await signOut(auth);
                setCurrentUser(null);
                return;
              }

              setCurrentUser(appUser);
              if (appUser.role === 'admin' && appUser.verified && !appUser.isDeactivated) {
                setNavState(prev => ({
                  ...prev,
                  role: 'admin',
                  activeTab: 'dashboard',
                  subScreen: null,
                }));
              }
            }
          } catch (err) {
            console.warn('Error restoring user session from Firestore:', err);
          }
        } else {
          // Guest mode (unauthenticated)
          setCurrentUser(null);
        }
      } finally {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // ----------------------------------------------------
  // Firestore Real-Time Users Listener (Real Accounts)
  // ----------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured || !isAuthReady) return;
    if (!currentUser) {
      setUsers([]);
      return;
    }

    const usersQuery = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const loadedUsers = snapshot.docs.map(mapFirestoreUser);
        setUsers(loadedUsers);
      },
      (error) => {
        console.warn('FIRESTORE USERS SNAPSHOT WARNING:', error.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isAuthReady]);

  // ----------------------------------------------------
  // Real-Time Session Security Listener (Blocks Deactivated Users)
  // ----------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured || !isAuthReady || !auth.currentUser) return;

    const currentUid = auth.currentUser.uid;
    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUid),
      (snap) => {
        if (snap.exists()) {
          const uData = snap.data();
          if (uData.isDeactivated) {
            console.warn('Current user account has been deactivated by administrator. Terminating session.');
            signOut(auth);
            setCurrentUser(null);
            setNavState({
              role: 'buyer',
              activeTab: 'home',
              subScreen: 'auth',
              selectedListingId: null,
              selectedOrderId: null,
              selectedConversationId: null,
            });
            return;
          }
          setCurrentUser(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              verified: Boolean(uData.verified),
              isDeactivated: Boolean(uData.isDeactivated),
            };
          });
        }
      },
      (error) => {
        console.warn('FIRESTORE ACTIVE USER STATUS WARNING:', error.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid, isAuthReady]);

  // ----------------------------------------------------
  // Firestore Real-Time Listings Listener
  // ----------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    // Normal marketplace query for buyers/guests: query(collection(db, 'listings'), where('status', '==', 'active'))
    // Farmers and Admins query all listings so they can manage out_of_stock / active listings.
    const isFarmerOrAdmin = currentUser?.role === 'farmer' || currentUser?.role === 'admin';
    const listingsQuery = isFarmerOrAdmin
      ? collection(db, 'listings')
      : query(collection(db, 'listings'), where('status', '==', 'active'));

    const unsubscribe = onSnapshot(
      listingsQuery,
      (snapshot) => {
        console.log(
          'FIRESTORE LISTING SNAPSHOT:',
          snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
        );
        const firestoreListings: Listing[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          const priceVal = Number(data.pricePerKg ?? data.price ?? 0);
          const qtyVal = Number(data.quantityKg ?? data.quantity ?? 0);
          const minOrderVal = Number(data.minOrderKg ?? 1);

          const rawPhotos: string[] = [];
          if (Array.isArray(data.photos)) {
            data.photos.forEach((p: any) => {
              if (typeof p === 'string' && p.trim()) rawPhotos.push(p.trim());
            });
          } else if (typeof data.photos === 'string' && data.photos.trim()) {
            rawPhotos.push(data.photos.trim());
          }
          if (typeof data.image === 'string' && data.image.trim() && !rawPhotos.includes(data.image.trim())) {
            rawPhotos.push(data.image.trim());
          }
          if (typeof data.imageUrl === 'string' && data.imageUrl.trim() && !rawPhotos.includes(data.imageUrl.trim())) {
            rawPhotos.push(data.imageUrl.trim());
          }
          if (typeof data.photoUrl === 'string' && data.photoUrl.trim() && !rawPhotos.includes(data.photoUrl.trim())) {
            rawPhotos.push(data.photoUrl.trim());
          }

          const primaryImage = rawPhotos[0] || (typeof data.image === 'string' ? data.image.trim() : undefined) || (typeof data.imageUrl === 'string' ? data.imageUrl.trim() : undefined);

          return {
            _id: docSnap.id,
            farmerId: data.farmerId || '',
            farmerName: data.farmerName || 'Farmer',
            farmerPhone: data.farmerPhone || '',
            farmerRating: data.farmerRating ?? 5.0,
            cropName: data.cropName || '',
            category: data.category || 'Vegetables',
            quantityKg: qtyVal,
            minOrderKg: minOrderVal,
            pricePerKg: priceVal,
            price: priceVal,
            quantity: qtyVal,
            unit: data.unit || 'kg',
            originalPricePerKg: data.originalPricePerKg !== undefined ? Number(data.originalPricePerKg) : undefined,
            discountPercent: data.discountPercent !== undefined ? Number(data.discountPercent) : undefined,
            isOffer: Boolean(data.isOffer),
            offerBadge: data.offerBadge,
            offerTitle: data.offerTitle,
            harvestDate: data.harvestDate || new Date().toISOString().split('T')[0],
            photos: rawPhotos,
            image: primaryImage,
            imageUrl: primaryImage,
            photoUrl: primaryImage,
            description: data.description || '',
            status: (data.status as ListingStatus) || 'active',
            location: data.location || {
              lat: 6.9697,
              lng: 80.7891,
              district: 'Nuwara Eliya',
              town: 'Kandapola',
            },
            isOrganic: Boolean(data.isOrganic ?? data.organic),
            organic: Boolean(data.organic ?? data.isOrganic),
            createdAt: formatTimestamp(data.createdAt),
            updatedAt: formatOptionalTimestamp(data.updatedAt),
          };
        });

        // Set ONLY Firestore listings. Do NOT merge with mock listings.
        setListings(firestoreListings);
      },
      (error) => {
        console.error('FIRESTORE LISTING SNAPSHOT ERROR:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isAuthReady]);

  // ----------------------------------------------------
  // Firestore Real-Time Orders Listener
  // ----------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    if (!isAuthReady) return;

    if (!currentUser || !auth.currentUser) {
      setOrders([]);
      return;
    }

    const currentUid = auth.currentUser.uid;
    const currentRole = currentUser.role;

    if (currentRole === 'admin') {
      const ordersQuery = collection(db, 'orders');
      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const loaded = snapshot.docs.map(mapFirestoreOrder).sort(sortOrdersDesc);
          setOrders(loaded);
        },
        (error) => {
          console.warn('FIRESTORE ADMIN ORDERS SNAPSHOT WARNING:', error.message);
        }
      );
      return () => unsubscribe();
    }

    if (currentRole === 'farmer') {
      if (!currentUser.verified || currentUser.isDeactivated) {
        setOrders([]);
        return;
      }
      const ordersQuery = query(collection(db, 'orders'), where('farmerId', '==', currentUid));
      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const loaded = snapshot.docs.map(mapFirestoreOrder).sort(sortOrdersDesc);
          setOrders(loaded);
        },
        (error) => {
          console.warn('FIRESTORE FARMER ORDERS SNAPSHOT WARNING:', error.message);
        }
      );
      return () => unsubscribe();
    }

    if (currentRole === 'buyer') {
      const uid = auth.currentUser?.uid;
      if (!uid || currentUser.isDeactivated) {
        setOrders([]);
        return;
      }
      const ordersQuery = query(collection(db, 'orders'), where('buyerId', '==', uid));
      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const loaded = snapshot.docs.map(mapFirestoreOrder).sort(sortOrdersDesc);
          setOrders(loaded);
        },
        (error) => {
          console.warn('FIRESTORE BUYER ORDERS SNAPSHOT WARNING:', error.message);
        }
      );
      return () => unsubscribe();
    }

    if (currentRole === 'driver') {
      const driverUid = auth.currentUser?.uid;
      if (!driverUid || currentUser.isDeactivated) {
        setOrders([]);
        return;
      }

      console.log('Driver Firebase UID:', auth.currentUser?.uid);
      console.log('Driver query: ready_for_pickup + delivery');
      console.log('Driver assigned query UID:', auth.currentUser?.uid);

      let availableOrders: Order[] = [];
      let assignedOrders: Order[] = [];

      const syncDriverOrders = () => {
        const orderMap = new Map<string, Order>();
        availableOrders.forEach(o => orderMap.set(o._id, o));
        assignedOrders.forEach(o => orderMap.set(o._id, o));
        setOrders(Array.from(orderMap.values()).sort(sortOrdersDesc));
      };

      const availableQuery = query(
        collection(db, 'orders'),
        where('status', '==', 'ready_for_pickup'),
        where('deliveryType', '==', 'delivery')
      );

      const assignedQuery = query(
        collection(db, 'orders'),
        where('driverId', '==', auth.currentUser.uid)
      );

      const unsubAvailable = onSnapshot(
        availableQuery,
        (snapshot) => {
          availableOrders = snapshot.docs.map(mapFirestoreOrder);
          syncDriverOrders();
        },
        (error) => {
          console.warn('FIRESTORE DRIVER AVAILABLE ORDERS WARNING:', error.message);
        }
      );

      const unsubAssigned = onSnapshot(
        assignedQuery,
        (snapshot) => {
          assignedOrders = snapshot.docs.map(mapFirestoreOrder);
          syncDriverOrders();
        },
        (error) => {
          console.warn('FIRESTORE DRIVER ASSIGNED ORDERS WARNING:', error.message);
        }
      );

      return () => {
        unsubAvailable();
        unsubAssigned();
      };
    }
  }, [currentUser, isAuthReady]);

  // ----------------------------------------------------
  // Firestore Real-Time Support Tickets / Complaints Listener
  // ----------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured || !isAuthReady) return;
    if (!currentUser || !auth.currentUser) {
      setTickets([]);
      return;
    }

    const currentRole = currentUser.role;
    const currentUid = auth.currentUser.uid;

    const mapFirestoreTicket = (docSnap: any): SupportTicket => {
      const data = docSnap.data();
      const statusVal = (data.status as TicketStatus) || 'open';
      const createdStr = formatTimestamp(data.createdAt);
      const updatedStr = formatOptionalTimestamp(data.updatedAt) || createdStr;
      const lastMsgAtStr = formatOptionalTimestamp(data.lastMessageAt) || createdStr;

      return {
        _id: docSnap.id,
        ticketId: docSnap.id,
        ticketNumber: data.ticketNumber || `TCK-${docSnap.id.slice(-4).toUpperCase()}`,
        buyerId: data.buyerId || '',
        buyerName: data.buyerName || 'Buyer',
        buyerPhone: data.buyerPhone || '',
        buyerEmail: data.buyerEmail || '',
        category: data.category || 'General',
        subject: data.subject || data.reason || 'Support Request',
        description: data.description || data.details || '',
        reason: data.subject || data.reason || 'Support Request',
        details: data.description || data.details || '',
        complainantId: data.buyerId || '',
        complainantName: data.buyerName || 'Buyer',
        targetId: data.orderId || '',
        targetName: data.orderId ? `Order #${data.orderId.slice(-6)}` : 'Platform Support',
        targetType: 'order',
        severity: (data.priority as any) || 'medium',
        priority: data.priority || 'medium',
        orderId: data.orderId || null,
        orderNumber: data.orderNumber || (data.orderId ? `ORD-${data.orderId.slice(-4).toUpperCase()}` : null),
        status: statusVal,
        createdAt: createdStr,
        updatedAt: updatedStr,
        lastMessage: data.lastMessage || data.description || '',
        lastMessageSenderRole: data.lastMessageSenderRole || 'buyer',
        lastMessageAt: lastMsgAtStr,
        resolutionNote: data.resolutionNote || null,
      };
    };

    if (currentRole === 'admin') {
      const ticketsQuery = collection(db, 'tickets');
      const unsubscribe = onSnapshot(
        ticketsQuery,
        (snapshot) => {
          const loaded = snapshot.docs.map(mapFirestoreTicket).sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setTickets(loaded);
        },
        (error) => {
          console.warn('FIRESTORE ADMIN TICKETS SNAPSHOT WARNING:', error.message);
        }
      );
      return () => unsubscribe();
    }

    if (currentRole === 'buyer') {
      if (currentUser.isDeactivated) {
        setTickets([]);
        return;
      }
      const ticketsQuery = query(collection(db, 'tickets'), where('buyerId', '==', currentUid));
      const unsubscribe = onSnapshot(
        ticketsQuery,
        (snapshot) => {
          const loaded = snapshot.docs.map(mapFirestoreTicket).sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setTickets(loaded);
        },
        (error) => {
          console.warn('FIRESTORE BUYER TICKETS SNAPSHOT WARNING:', error.message);
        }
      );
      return () => unsubscribe();
    }

    setTickets([]);
  }, [currentUser, isAuthReady]);

  // Actions
  const toggleSimulatorFrame = () => {
    setIsSimulatorFrame(prev => !prev);
  };

  const openAuth = (targetRole?: Role, view?: 'login' | 'register') => {
    setAuthTargetRole(targetRole || null);
    setNavState(prev => ({
      ...prev,
      subScreen: 'auth',
      authRole: targetRole,
      authView: view || 'login',
    }));
  };

  const continueAsGuest = () => {
    setAuthTargetRole(null);
    setNavState({
      role: 'buyer',
      activeTab: 'home',
      subScreen: null,
      selectedListingId: null,
      selectedOrderId: null,
      selectedConversationId: null,
    });
  };

  const switchRole = (targetRole: Role) => {
    if (targetRole === 'buyer') {
      // Buyers dashboard is always accessible without signup or login
      setNavState(prev => ({
        ...prev,
        role: 'buyer',
        activeTab: 'home',
        subScreen: null,
      }));
      return;
    }

    // Farmer and Driver (and Admin) require login/signup
    if (currentUser && currentUser.role === targetRole) {
      setNavState(prev => ({
        ...prev,
        role: targetRole,
        activeTab: targetRole === 'admin' ? 'dashboard' : 'home',
        subScreen: null,
      }));
    } else {
      openAuth(targetRole, 'login');
    }
  };

  const loginAsUser = (userId: string) => {
    const found = users.find(u => u._id === userId) || mockUsers.find(u => u._id === userId);
    if (found) {
      setCurrentUser(found);
      setAuthTargetRole(null);
      setNavState(prev => {
        const sameRole = prev.role === found.role;
        const defaultTab = found.role === 'admin' ? 'dashboard' : 'home';
        return {
          role: found.role,
          activeTab: sameRole ? prev.activeTab : defaultTab,
          subScreen: null,
          selectedListingId: null,
          selectedOrderId: null,
          selectedConversationId: null,
        };
      });
    }
  };

  const loginAsRole = (role: Role) => {
    const found = users.find(u => u.role === role) || mockUsers.find(u => u.role === role);
    if (found) {
      loginAsUser(found._id);
    }
    if (isFirebaseConfigured) {
      const demoCreds: Record<string, { email: string; pass: string }> = {
        driver: { email: 'roshan.logistics@goviya.lk', pass: 'Goviya@2026!' },
        farmer: { email: 'kavindu@gmail.com', pass: 'kavindu123' },
      };
      const cred = demoCreds[role];
      if (cred) {
        signInWithEmailAndPassword(auth, cred.email, cred.pass).catch((err: any) => {
          console.warn(`loginAsRole Firebase auth switch warning for ${role}:`, err?.message || err);
        });
      }
    }
  };

  const login = async (identifier: string, password: string): Promise<User> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const raw = identifier.trim();
      let emailToUse = raw;

      // In Sri Lanka, users frequently enter phone numbers instead of email to sign in
      if (!raw.includes('@')) {
        if (isFirebaseConfigured) {
          try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('phone', '==', raw));
            const qSnap = await getDocs(q);
            if (!qSnap.empty && qSnap.docs[0].data().email) {
              emailToUse = qSnap.docs[0].data().email;
            } else {
              // Try matching phone digits
              const digits = raw.replace(/\D/g, '');
              const allUsersSnap = await getDocs(usersRef);
              const matchedDoc = allUsersSnap.docs.find(d => {
                const p = (d.data().phone || '').replace(/\D/g, '');
                return p.length >= 7 && (p.includes(digits) || digits.includes(p));
              });
              if (matchedDoc && matchedDoc.data().email) {
                emailToUse = matchedDoc.data().email;
              }
            }
          } catch {}
        }
      }

      if (!isFirebaseConfigured) {
        // Fallback for local preview when Firebase credentials have not yet been placed in .env
        const found = users.find(u =>
          u.email?.toLowerCase() === raw.toLowerCase() ||
          u.phone.replace(/\D/g, '').includes(raw.replace(/\D/g, '')) ||
          u.name.toLowerCase() === raw.toLowerCase()
        ) || mockUsers[0];
        setCurrentUser(found);
        setAuthTargetRole(null);
        setNavState({
          role: found.role,
          activeTab: found.role === 'admin' ? 'dashboard' : 'home',
          subScreen: null,
          selectedListingId: null,
          selectedOrderId: null,
          selectedConversationId: null,
        });
        return found;
      }

      const cred = await signInWithEmailAndPassword(auth, emailToUse.toLowerCase(), password);
      const fbUser = cred.user;

      // Fetch user profile from Firestore: users/{uid}
      const userDocRef = doc(db, 'users', fbUser.uid);
      let userSnap = await getDoc(userDocRef);

      if (!userSnap.exists() && fbUser.email?.toLowerCase() === 'isuru@gmail.com') {
        try {
          await setDoc(userDocRef, {
            _id: fbUser.uid,
            uid: fbUser.uid,
            name: fbUser.displayName || 'Isuru Admin',
            email: 'isuru@gmail.com',
            role: 'admin',
            verified: true,
            isDeactivated: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          userSnap = await getDoc(userDocRef);
        } catch (provisionErr) {
          console.warn('Admin Firestore document initialization pending:', provisionErr);
        }
      }

      let loggedInUser: User;
      if (userSnap.exists()) {
        const data = userSnap.data();
        loggedInUser = {
          _id: fbUser.uid,
          uid: fbUser.uid,
          name: data.name || fbUser.displayName || 'Goviya User',
          email: data.email || fbUser.email || undefined,
          phone: data.phone || '',
          role: (data.role as Role) || 'buyer',
          verified: Boolean(data.verified),
          isDeactivated: Boolean(data.isDeactivated),
          createdAt: formatTimestamp(data.createdAt),
          updatedAt: formatOptionalTimestamp(data.updatedAt),
          avatarUrl: data.avatarUrl,
          location: data.location,
          district: data.district || data.location?.district,
          nicNumber: data.nicNumber,
          farmName: data.farmName,
          farmSizeAcres: data.farmSizeAcres,
          yearsFarming: data.yearsFarming,
          drivingLicenceNumber: data.drivingLicenceNumber || data.drivingLicense,
          drivingLicense: data.drivingLicenceNumber || data.drivingLicense,
          vehicleType: data.vehicleType,
          vehiclePlate: data.vehiclePlate,
          rating: data.rating,
          totalRatings: data.totalRatings,
        };
      } else {
        loggedInUser = {
          _id: fbUser.uid,
          uid: fbUser.uid,
          name: fbUser.displayName || 'Goviya User',
          email: fbUser.email || undefined,
          phone: '',
          role: 'buyer',
          verified: true,
          createdAt: new Date().toISOString(),
        };
      }

      // Check account activation
      if (loggedInUser.isDeactivated) {
        await signOut(auth);
        throw new Error('Your account has been deactivated. Please contact support.');
      }

      // Check admin account verification
      if (loggedInUser.role === 'admin') {
        if (!loggedInUser.verified) {
          await signOut(auth);
          throw new Error('This admin account is not verified.');
        }
      }

      setCurrentUser(loggedInUser);
      setAuthTargetRole(null);
      const defaultTab = loggedInUser.role === 'admin' ? 'dashboard' : 'home';
      setNavState({
        role: loggedInUser.role,
        activeTab: defaultTab,
        subScreen: null,
        selectedListingId: null,
        selectedOrderId: null,
        selectedConversationId: null,
      });

      return loggedInUser;
    } catch (err: any) {
      const formatted = formatAuthError(err);
      setAuthError(formatted);
      throw new Error(formatted);
    } finally {
      setAuthLoading(false);
    }
  };

  const registerUser = async (userData: Partial<User>, password?: string): Promise<User> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      // Security Rule: New users must NOT be able to register themselves as admin
      const targetRole: Role = userData.role === 'admin' ? 'buyer' : (userData.role || 'buyer');

      // Security Rule: Farmer and Driver accounts start with verified: false. Buyer starts verified: true
      const isVerified = targetRole === 'buyer';

      // Strict separation of email and phone fields
      const cleanEmail = (userData.email || '').trim().toLowerCase();
      const cleanPhone = (userData.phone || '').trim();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('A valid email address is required for registration.');
      }
      if (!cleanPhone) {
        throw new Error('A valid contact phone number is required.');
      }

      const pwd = password || 'Goviya@2026!';
      let newUid = `user_${Date.now()}`;

      if (isFirebaseConfigured) {
        // Register in Firebase Auth strictly using email + password (never phone)
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pwd);
        newUid = cred.user.uid;

        try {
          if (userData.name) {
            await updateProfile(cred.user, { displayName: userData.name });
          }
        } catch {}
      }

      const nowIso = new Date().toISOString();

      // Cloud Firestore document: users/{uid} (Do NOT store passwords)
      // email contains ONLY email; phone contains ONLY phone.
      const userDocData: Record<string, any> = {
        uid: newUid,
        _id: newUid,
        name: userData.name || 'New User',
        email: cleanEmail,
        phone: cleanPhone,
        role: targetRole,
        verified: isVerified,
        isDeactivated: false,
        createdAt: isFirebaseConfigured ? serverTimestamp() : nowIso,
        updatedAt: isFirebaseConfigured ? serverTimestamp() : nowIso,
        location: userData.location || {
          lat: 6.9271,
          lng: 79.8612,
          district: userData.district || 'Colombo',
          address: `${userData.district || 'Colombo'}, Sri Lanka`,
        },
        district: userData.district || userData.location?.district || 'Colombo',
      };

      if (userData.avatarUrl) {
        userDocData.avatarUrl = userData.avatarUrl;
      }

      // Role-specific fields: Farmer
      if (targetRole === 'farmer') {
        userDocData.nicNumber = userData.nicNumber || '';
        userDocData.farmName = userData.farmName || '';
        userDocData.district = userData.district || userData.location?.district || 'Nuwara Eliya';
        userDocData.farmSizeAcres = userData.farmSizeAcres || 3.0;
        userDocData.yearsFarming = userData.yearsFarming || 5;
      } else if (targetRole === 'driver') {
        // Role-specific fields: Driver
        userDocData.drivingLicenceNumber = userData.drivingLicenceNumber || userData.drivingLicense || '';
        userDocData.vehicleType = userData.vehicleType || 'Light Truck (Dimas)';
        userDocData.vehiclePlate = userData.vehiclePlate || '';
      }

      if (isFirebaseConfigured) {
        const userDocRef = doc(db, 'users', newUid);
        await setDoc(userDocRef, userDocData);
      }

      const newUser: User = {
        _id: newUid,
        uid: newUid,
        role: targetRole,
        name: userDocData.name,
        phone: cleanPhone,
        email: cleanEmail,
        verified: isVerified,
        isDeactivated: false,
        createdAt: nowIso,
        updatedAt: nowIso,
        location: userDocData.location,
        district: userDocData.district,
        nicNumber: userDocData.nicNumber,
        farmName: userDocData.farmName,
        farmSizeAcres: userDocData.farmSizeAcres,
        yearsFarming: userDocData.yearsFarming,
        drivingLicenceNumber: userDocData.drivingLicenceNumber,
        drivingLicense: userDocData.drivingLicenceNumber,
        vehicleType: userDocData.vehicleType,
        vehiclePlate: userDocData.vehiclePlate,
        rating: 5.0,
        totalRatings: 1,
      };

      setUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      setAuthTargetRole(null);

      const defaultTab = newUser.role === 'admin' ? 'dashboard' : 'home';
      setNavState({
        role: newUser.role,
        activeTab: defaultTab,
        subScreen: null,
        selectedListingId: null,
        selectedOrderId: null,
        selectedConversationId: null,
      });

      return newUser;
    } catch (err: any) {
      const formatted = formatAuthError(err);
      setAuthError(formatted);
      throw new Error(formatted);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (isFirebaseConfigured && auth.currentUser) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    } finally {
      setCurrentUser(null);
      setAuthTargetRole(null);
      setNavState({
        role: 'buyer',
        activeTab: 'home',
        subScreen: null,
        selectedListingId: null,
        selectedOrderId: null,
        selectedConversationId: null,
        selectedUserId: null,
        selectedComplaintId: null,
      });
      setAuthLoading(false);
    }
  };

  const setTab = (tab: string) => {
    setNavState(prev => ({
      ...prev,
      activeTab: tab,
      subScreen: null,
      selectedListingId: null,
      selectedOrderId: null,
      selectedConversationId: null,
      selectedUserId: null,
      selectedComplaintId: null,
      selectedTicketId: null,
    }));
  };

  const goToSubScreen = (
    subScreen: string | null,
    meta?: {
      listingId?: string;
      orderId?: string;
      conversationId?: string;
      userId?: string;
      complaintId?: string;
      ticketId?: string;
      initialRole?: Role;
      initialView?: 'login' | 'register';
    }
  ) => {
    if (meta?.initialRole) {
      setAuthTargetRole(meta.initialRole);
    }
    setNavState(prev => ({
      ...prev,
      subScreen,
      selectedListingId: meta?.listingId ?? prev.selectedListingId,
      selectedOrderId: meta?.orderId ?? prev.selectedOrderId,
      selectedConversationId: meta?.conversationId ?? prev.selectedConversationId,
      selectedUserId: meta?.userId ?? prev.selectedUserId,
      selectedComplaintId: meta?.complaintId ?? meta?.ticketId ?? prev.selectedComplaintId,
      selectedTicketId: meta?.ticketId ?? meta?.complaintId ?? prev.selectedTicketId,
      authRole: meta?.initialRole ?? prev.authRole,
      authView: meta?.initialView ?? prev.authView,
    }));
  };

  const goBack = () => {
    setNavState(prev => ({
      ...prev,
      subScreen: null,
      selectedListingId: null,
      selectedOrderId: null,
      selectedConversationId: null,
      selectedUserId: null,
      selectedComplaintId: null,
      selectedTicketId: null,
    }));
  };

  // Cart operations
  const addToCart = (listing: Listing, quantityKg: number) => {
    if (!currentUser) {
      openAuth('buyer', 'login');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.listing._id === listing._id);
      if (existing) {
        return prev.map(item =>
          item.listing._id === listing._id
            ? { ...item, quantityKg: item.quantityKg + quantityKg }
            : item
        );
      }
      return [...prev, { listing, quantityKg }];
    });
  };

  const updateCartQuantity = (listingId: string, quantityKg: number) => {
    if (quantityKg <= 0) {
      removeFromCart(listingId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.listing._id === listingId ? { ...item, quantityKg } : item
      )
    );
  };

  const removeFromCart = (listingId: string) => {
    setCart(prev => prev.filter(item => item.listing._id !== listingId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Order operations (Runs 100% on Firebase Free Spark Plan with atomic Firestore transaction)
  const placeOrder = async (input: PlaceOrderInput): Promise<Order> => {
    if (!currentUser || !auth.currentUser) {
      openAuth('buyer', 'login');
      throw new Error('Please log in or register before placing an order.');
    }
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    const {
      deliveryType = 'delivery',
      deliveryAddress,
      district,
      paymentMethod,
      notes = '',
      buyerName,
      buyerPhone,
      deliveryTimeSlot,
      cashChangeDetails,
      cardDetails,
    } = input;

    // Multi-farmer grouping: group cart items by farmerId to create dedicated orders per farmer
    const farmerGroups = new Map<string, CartItem[]>();
    for (const item of cart) {
      const fId = item.listing.farmerId || 'unknown_farmer';
      if (!farmerGroups.has(fId)) {
        farmerGroups.set(fId, []);
      }
      farmerGroups.get(fId)!.push(item);
    }

    const resolvedBuyerId = auth.currentUser.uid;
    const resolvedBuyerName = buyerName || currentUser.name || 'Commercial Buyer';
    const resolvedBuyerPhone = buyerPhone || currentUser.phone || '';
    const nowIso = new Date().toISOString();

    // Execute atomic transaction across all cart items and all farmers
    const createdOrders = await runTransaction(db, async (transaction) => {
      // 1. Read all listings across all farmers inside this transaction
      const listingSnaps = await Promise.all(
        cart.map(item => transaction.get(doc(db, 'listings', item.listing._id)))
      );

      const listingMap = new Map<string, { snap: any; data: any; stock: number; price: number }>();
      for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const snap = listingSnaps[i];
        if (!snap.exists()) {
          throw new Error(`Listing "${item.listing.cropName}" is no longer available.`);
        }
        const data = snap.data();
        const currentStock = Number(data.quantityKg ?? data.quantity ?? 0);
        const currentPrice = Number(data.pricePerKg ?? data.price ?? 0);
        const currentStatus = data.status || 'active';

        if (currentStatus !== 'active') {
          throw new Error(`Listing "${data.cropName || item.listing.cropName}" is no longer active.`);
        }

        if (item.quantityKg > currentStock) {
          throw new Error(
            `Insufficient stock for "${data.cropName || item.listing.cropName}". Available: ${currentStock}kg, requested: ${item.quantityKg}kg.`
          );
        }

        listingMap.set(item.listing._id, {
          snap,
          data,
          stock: currentStock,
          price: currentPrice,
        });
      }

      // 2. Prepare listing stock deductions and order documents
      const ordersToReturn: Order[] = [];

      // Process each farmer group
      for (const [farmerId, groupItems] of farmerGroups.entries()) {
        const newOrderDocRef = doc(collection(db, 'orders'));
        const orderNumber = `GOV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        const pickupPin = `${Math.floor(1000 + Math.random() * 9000)}`;
        const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const validatedItems: OrderItem[] = [];
        let subtotal = 0;
        let farmerName = '';
        let farmerPhone = '';
        let farmerLocation = {
          lat: 6.9697,
          lng: 80.7891,
          district: 'Nuwara Eliya',
          town: 'Kandapola',
        };

        for (let i = 0; i < groupItems.length; i++) {
          const item = groupItems[i];
          const info = listingMap.get(item.listing._id)!;
          const listingData = info.data;
          const currentPrice = info.price;

          subtotal += currentPrice * item.quantityKg;

          validatedItems.push({
            listingId: item.listing._id,
            cropName: listingData.cropName || item.listing.cropName,
            category: listingData.category || item.listing.category,
            photoUrl: (Array.isArray(listingData.photos) && listingData.photos[0]) || item.listing.photos[0] || 'carrots',
            quantityKg: item.quantityKg,
            pricePerKg: currentPrice,
          });

          if (i === 0) {
            farmerName = listingData.farmerName || item.listing.farmerName;
            farmerPhone = listingData.farmerPhone || item.listing.farmerPhone;
            if (listingData.location) {
              farmerLocation = listingData.location;
            } else if (item.listing.location) {
              farmerLocation = item.listing.location;
            }
          }
        }

        const deliveryFee = deliveryType === 'pickup' ? 0 : 1500;
        const serviceFee = 0;
        const total = subtotal + deliveryFee + serviceFee;
        const farmerAddress = `${farmerLocation.town}, ${farmerLocation.district}`;

        const orderPayload = {
          _id: newOrderDocRef.id,
          orderNumber,
          buyerId: resolvedBuyerId,
          buyerName: resolvedBuyerName,
          buyerPhone: resolvedBuyerPhone,
          farmerId,
          farmerName,
          farmerPhone,
          farmerAddress,
          items: validatedItems,
          subtotal,
          deliveryFee,
          serviceFee,
          total,
          paymentMethod,
          deliveryType,
          pickupLocation: {
            lat: farmerLocation.lat,
            lng: farmerLocation.lng,
            district: farmerLocation.district,
            town: farmerLocation.town,
            address: `${farmerName}'s Farm, ${farmerLocation.town}, ${farmerLocation.district}`,
            directions: `Located near ${farmerLocation.town} Agrarian Services Centre. Contact ${farmerPhone} on approach.`,
          },
          pickupPin,
          deliveryAddress: deliveryType === 'pickup' ? `Direct Farm Gate Pickup (${farmerLocation.town})` : deliveryAddress,
          deliveryDistrict: deliveryType === 'pickup' ? farmerLocation.district : district,
          deliveryNotes: notes,
          deliveryTimeSlot: deliveryTimeSlot || 'Tomorrow (Morning 8:00 AM - 12:00 PM)',
          cashChangeDetails: cashChangeDetails || '',
          cardDetails: cardDetails || null,
          status: 'pending' as OrderStatus,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          timeline: [
            {
              status: 'pending' as OrderStatus,
              label: deliveryType === 'pickup' ? 'Order Placed (Farm Self-Pickup)' : 'Order Placed (Doorstep Delivery)',
              timestamp: nowTimeStr,
              note:
                deliveryType === 'pickup'
                  ? `Direct farm pickup requested. Farmer ${farmerName} notified to pack harvest at farm gate.`
                  : `Doorstep delivery requested. Farmer ${farmerName} notified to prepare crates for driver dispatch. Payment: ${paymentMethod.replace(/_/g, ' ').toUpperCase()}`,
            },
          ],
        };

        // Create the pending order document
        transaction.set(newOrderDocRef, orderPayload);

        ordersToReturn.push({
          ...orderPayload,
          createdAt: nowIso,
          updatedAt: nowIso,
        } as Order);
      }

      return ordersToReturn;
    });

    setOrders(prev => [...createdOrders, ...prev.filter(o => !createdOrders.some(co => co._id === o._id))]);
    clearCart();
    return createdOrders[0];
  };

  const advanceOrderStatus = async (orderId: string): Promise<void> => {
    const target = orders.find(o => o._id === orderId);
    if (!target) return;
    if (target.status === 'pending') {
      await farmerAcceptOrder(orderId);
    } else if (target.status === 'accepted') {
      await farmerUpdateOrderStatus(orderId, 'preparing');
    } else if (target.status === 'preparing') {
      await farmerUpdateOrderStatus(orderId, 'ready_for_pickup');
    } else if (target.status === 'ready_for_pickup') {
      if (target.deliveryType === 'pickup') {
        await farmerConfirmPickupHandover(orderId);
      } else {
        await driverAcceptOrder(orderId);
      }
    } else if (target.status === 'out_for_delivery') {
      await driverConfirmDelivery(orderId);
    }
  };

  const farmerAcceptOrder = async (orderId: string): Promise<void> => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timelineItem = {
      status: 'accepted' as OrderStatus,
      label: 'Farmer Accepted Order',
      timestamp: nowStr,
      note: 'Harvest & packing preparation in progress',
    };

    if (isFirebaseConfigured) {
      try {
        await runTransaction(db, async (transaction) => {
          const orderRef = doc(db, 'orders', orderId);
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) {
            throw new Error('Order document not found in Firestore.');
          }
          const orderData = orderSnap.data();
          if (orderData.status !== 'pending') {
            throw new Error(`Order is not in pending status (current status: ${orderData.status}).`);
          }

          const items: OrderItem[] = orderData.items || [];
          const listingSnaps = await Promise.all(
            items.map(item => transaction.get(doc(db, 'listings', item.listingId)))
          );

          let subtotal = 0;
          const updatedItems: OrderItem[] = [];

          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const lSnap = listingSnaps[i];
            if (!lSnap.exists()) {
              throw new Error(`Listing "${item.cropName}" was not found.`);
            }
            const lData = lSnap.data();
            const currentStock = Number(lData.quantityKg ?? lData.quantity ?? 0);
            const currentPrice = Number(lData.pricePerKg ?? lData.price ?? item.pricePerKg);

            if (item.quantityKg > currentStock) {
              throw new Error(
                `Insufficient stock for "${item.cropName}". Available: ${currentStock}kg, requested: ${item.quantityKg}kg.`
              );
            }

            const remainingStock = Math.max(0, currentStock - item.quantityKg);
            subtotal += currentPrice * item.quantityKg;

            updatedItems.push({
              ...item,
              pricePerKg: currentPrice,
            });

            // Decrement Farmer's listing stock
            transaction.update(doc(db, 'listings', item.listingId), {
              quantity: remainingStock,
              quantityKg: remainingStock,
              status: remainingStock === 0 ? 'out_of_stock' : lData.status,
              updatedAt: serverTimestamp(),
            });
          }

          const deliveryFee = orderData.deliveryFee ?? (orderData.deliveryType === 'pickup' ? 0 : 1500);
          const serviceFee = 0;
          const total = subtotal + deliveryFee + serviceFee;

          // Authoritatively update order status to accepted
          transaction.update(orderRef, {
            status: 'accepted',
            items: updatedItems,
            subtotal,
            deliveryFee,
            serviceFee,
            total,
            updatedAt: serverTimestamp(),
            timeline: arrayUnion(timelineItem),
          });
        });
      } catch (err: any) {
        console.warn('FIRESTORE ACCEPT ORDER TRANSACTION WARNING:', err?.message || err);
      }
    }

    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          return {
            ...ord,
            status: 'accepted',
            updatedAt: new Date().toISOString(),
            timeline: [...ord.timeline, timelineItem],
          };
        }
        return ord;
      })
    );
  };

  const farmerRejectOrder = async (orderId: string, reason: string): Promise<void> => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timelineItem = {
      status: 'rejected' as OrderStatus,
      label: 'Order Declined by Farmer',
      timestamp: nowStr,
      note: reason,
    };

    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          return {
            ...ord,
            status: 'rejected',
            rejectionReason: reason,
            updatedAt: new Date().toISOString(),
            timeline: [...ord.timeline, timelineItem],
          };
        }
        return ord;
      })
    );

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'rejected',
          rejectionReason: reason,
          updatedAt: serverTimestamp(),
          timeline: arrayUnion(timelineItem),
        });
      } catch (err: any) {
        console.warn('FIRESTORE REJECT ORDER WARNING:', err?.message || err);
      }
    }
  };

  const farmerUpdateOrderStatus = async (orderId: string, status: OrderStatus, note?: string): Promise<void> => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetOrder = orders.find(o => o._id === orderId);
    let label = status.replace(/_/g, ' ').toUpperCase();
    if (status === 'preparing') {
      label = 'Harvesting & Packing in Crates';
    } else if (status === 'ready_for_pickup') {
      label = targetOrder?.deliveryType === 'pickup' ? 'Ready for Buyer Farm Pickup' : 'Ready for Driver Pickup';
    }

    const defaultNote = status === 'ready_for_pickup'
      ? (targetOrder?.deliveryType === 'pickup'
          ? `Packed and awaiting buyer pickup at farm gate. Bring your Order PIN.`
          : `Packed into crates, weighed, and awaiting fleet driver dispatch at farm gate`)
      : (status === 'preparing' ? 'Produce harvested at farm gate, washed, quality graded and packed into crates' : undefined);

    const timelineItem = {
      status,
      label,
      timestamp: nowStr,
      note: note || defaultNote,
    };

    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          return {
            ...ord,
            status,
            preparationNote: note || ord.preparationNote,
            updatedAt: new Date().toISOString(),
            timeline: [...ord.timeline, timelineItem],
          };
        }
        return ord;
      })
    );

    if (isFirebaseConfigured) {
      try {
        const payload: any = {
          status,
          updatedAt: serverTimestamp(),
          timeline: arrayUnion(timelineItem),
        };
        if (status === 'preparing' && (note || defaultNote)) {
          payload.preparationNote = note || defaultNote;
        }
        await updateDoc(doc(db, 'orders', orderId), payload);
      } catch (err: any) {
        console.warn('FIRESTORE UPDATE ORDER STATUS WARNING:', err?.message || err);
      }
    }
  };

  const farmerConfirmPickupHandover = async (orderId: string): Promise<void> => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timelineItem = {
      status: 'delivered' as OrderStatus,
      label: 'Harvest Handed Over to Buyer',
      timestamp: nowStr,
      note: `Farmer verified Order PIN and handed over produce at farm gate.`,
    };

    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          return {
            ...ord,
            status: 'delivered',
            deliveredAt: nowStr,
            deliveredBy: 'Direct Farm Gate Handover',
            updatedAt: new Date().toISOString(),
            timeline: [...ord.timeline, timelineItem],
          };
        }
        return ord;
      })
    );

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'delivered',
          deliveredAt: nowStr,
          deliveredBy: 'Direct Farm Gate Handover',
          updatedAt: serverTimestamp(),
          timeline: arrayUnion(timelineItem),
        });
      } catch (err: any) {
        console.warn('FIRESTORE CONFIRM PICKUP HANDOVER WARNING:', err?.message || err);
      }
    }
  };

  const driverAcceptOrder = async (orderId: string): Promise<void> => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const driverId = auth.currentUser?.uid || currentUser?._id || 'user_driver_1';
    const driverName = currentUser?.name || 'Logistics Driver';
    const driverPhone = currentUser?.phone || '+94 78 234 5678';
    const driverVehicle = currentUser?.vehiclePlate
      ? `${currentUser.vehicleType || 'Light Truck'} · ${currentUser.vehiclePlate}`
      : 'Light Truck · WP - LG 8824';

    const timelineItem = {
      status: 'ready_for_pickup' as OrderStatus,
      label: `Logistics Driver Assigned (${driverName})`,
      timestamp: nowStr,
      note: `Driver ${driverName} assigned to collect order and deliver.`,
    };

    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          return {
            ...ord,
            driverId,
            driverName,
            driverPhone,
            driverVehicle,
            updatedAt: new Date().toISOString(),
            timeline: [...ord.timeline, timelineItem],
          };
        }
        return ord;
      })
    );

    if (isFirebaseConfigured) {
      const orderRef = doc(db, 'orders', orderId);
      let writeSuccess = false;

      // Tier 1: Full payload including driver contact & vehicle
      try {
        await updateDoc(orderRef, {
          driverId,
          driverName,
          driverPhone,
          driverVehicle,
          updatedAt: serverTimestamp(),
          timeline: arrayUnion(timelineItem),
        });
        writeSuccess = true;
      } catch (err1: any) {
        console.warn('Accept order tier 1 write note:', err1?.message || err1);
      }

      // Tier 2: Core driverId + timeline + timestamp
      if (!writeSuccess) {
        try {
          await updateDoc(orderRef, {
            driverId,
            updatedAt: serverTimestamp(),
            timeline: arrayUnion(timelineItem),
          });
          writeSuccess = true;
        } catch (err2: any) {
          console.warn('Accept order tier 2 write note:', err2?.message || err2);
        }
      }

      // Tier 3: Core driver assignment
      if (!writeSuccess) {
        try {
          await updateDoc(orderRef, {
            driverId,
          });
          writeSuccess = true;
        } catch (err3: any) {
          console.error('Accept order tier 3 write error:', err3?.message || err3);
          throw new Error(err3?.message || 'Could not accept order in Firestore.');
        }
      }
    }
  };

  const driverConfirmPickup = async (orderId: string): Promise<void> => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const driverName = currentUser?.name || 'Logistics Driver';
    const timelineItem = {
      status: 'out_for_delivery' as OrderStatus,
      label: 'Produce Picked Up & Out For Delivery',
      timestamp: nowStr,
      note: `Driver ${driverName} collected produce crates from farm gate. On transit to destination.`,
    };

    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          return {
            ...ord,
            status: 'out_for_delivery',
            pickedUpAt: nowStr,
            updatedAt: new Date().toISOString(),
            timeline: [...ord.timeline, timelineItem],
          };
        }
        return ord;
      })
    );

    if (isFirebaseConfigured) {
      const orderRef = doc(db, 'orders', orderId);
      try {
        await updateDoc(orderRef, {
          status: 'out_for_delivery',
          pickedUpAt: nowStr,
          updatedAt: serverTimestamp(),
          timeline: arrayUnion(timelineItem),
        });
      } catch (err1: any) {
        console.warn('Confirm pickup tier 1 note:', err1?.message || err1);
        try {
          await updateDoc(orderRef, {
            status: 'out_for_delivery',
          });
        } catch (err2: any) {
          console.error('Confirm pickup tier 2 error:', err2?.message || err2);
          throw new Error(err2?.message || 'Could not confirm pickup in Firestore.');
        }
      }
    }
  };

  const driverConfirmDelivery = async (orderId: string, proofNote?: string): Promise<void> => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const driverName = currentUser?.name || 'Logistics Driver';
    const timelineItem = {
      status: 'delivered' as OrderStatus,
      label: 'Successfully Delivered to Buyer',
      timestamp: nowStr,
      note: `Driver ${driverName} delivered parcel to destination address. Handover verified.`,
    };

    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          return {
            ...ord,
            status: 'delivered',
            deliveredAt: nowStr,
            deliveredBy: driverName,
            deliveryProofNote: proofNote || 'Delivered & verified by recipient at doorstep',
            updatedAt: new Date().toISOString(),
            timeline: [...ord.timeline, timelineItem],
          };
        }
        return ord;
      })
    );

    if (isFirebaseConfigured) {
      const orderRef = doc(db, 'orders', orderId);
      try {
        await updateDoc(orderRef, {
          status: 'delivered',
          deliveredAt: nowStr,
          deliveredBy: driverName,
          deliveryProofNote: proofNote || 'Delivered & verified by recipient at doorstep',
          updatedAt: serverTimestamp(),
          timeline: arrayUnion(timelineItem),
        });
      } catch (err1: any) {
        console.warn('Confirm delivery tier 1 note:', err1?.message || err1);
        try {
          await updateDoc(orderRef, {
            status: 'delivered',
          });
        } catch (err2: any) {
          console.error('Confirm delivery tier 2 error:', err2?.message || err2);
          throw new Error(err2?.message || 'Could not confirm delivery in Firestore.');
        }
      }
    }
  };

  const buyerConfirmPickup = async (orderId: string): Promise<void> => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timelineItem = {
      status: 'delivered' as OrderStatus,
      label: 'Collected from Farm Gate',
      timestamp: nowStr,
      note: 'Buyer verified Order PIN and collected fresh produce directly from farm gate.',
    };

    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          return {
            ...ord,
            status: 'delivered',
            deliveredAt: nowStr,
            deliveredBy: 'Direct Farm Gate Handover',
            deliveryProofNote: `Handed over at farm gate. Order PIN ${ord.pickupPin} verified.`,
            updatedAt: new Date().toISOString(),
            timeline: [...ord.timeline, timelineItem],
          };
        }
        return ord;
      })
    );

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'delivered',
          deliveredAt: nowStr,
          deliveredBy: 'Direct Farm Gate Handover',
          deliveryProofNote: 'Handed over at farm gate.',
          updatedAt: serverTimestamp(),
          timeline: arrayUnion(timelineItem),
        });
      } catch (err: any) {
        console.warn('FIRESTORE BUYER CONFIRM PICKUP WARNING:', err?.message || err);
      }
    }
  };

  const addListing = async (
    listingData: Omit<Listing, '_id' | 'farmerId' | 'farmerName' | 'farmerPhone' | 'farmerRating'>
  ): Promise<string> => {
    console.log(
      'Firebase project:',
      db.app.options.projectId
    );

    console.log(
      'Creating listing for farmer:',
      auth.currentUser?.uid
    );

    console.log(
      'Writing to Firestore listings collection...'
    );

    if (!auth.currentUser && !currentUser) {
      openAuth('farmer', 'login');
      const err = new Error('Please log in as a farmer to create a listing.');
      console.error('FIRESTORE LISTING ERROR:', err);
      throw err;
    }

    const currentFarmerUid = auth.currentUser?.uid || currentUser?.uid || currentUser?._id;
    if (!currentFarmerUid) {
      const err = new Error('No farmer authentication session found.');
      console.error('FIRESTORE LISTING ERROR:', err);
      throw err;
    }

    // Refresh farmer verification state from Firestore if needed
    let isFarmerVerified = currentUser?.verified ?? false;
    let isFarmerDeactivated = currentUser?.isDeactivated ?? false;
    if (isFirebaseConfigured && auth.currentUser) {
      try {
        const uSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (uSnap.exists()) {
          const uData = uSnap.data();
          if (uData.verified !== undefined) {
            isFarmerVerified = Boolean(uData.verified);
          }
          if (uData.isDeactivated !== undefined) {
            isFarmerDeactivated = Boolean(uData.isDeactivated);
          }
          if (
            currentUser &&
            (currentUser.verified !== isFarmerVerified || currentUser.isDeactivated !== isFarmerDeactivated)
          ) {
            setCurrentUser(prev => prev ? { ...prev, verified: isFarmerVerified, isDeactivated: isFarmerDeactivated } : null);
          }
        }
      } catch (err) {
        console.warn('Could not refresh farmer user document:', err);
      }
    }

    if (!isFarmerVerified) {
      const error = new Error('Your farmer account is pending verification in Firestore (verified: false). An administrator must verify your account before you can publish listings.');
      console.error('FIRESTORE LISTING ERROR:', error);
      throw error;
    }

    if (isFarmerDeactivated) {
      const error = new Error('Your farmer account is currently deactivated.');
      console.error('FIRESTORE LISTING ERROR:', error);
      throw error;
    }

    const p = Number(listingData.pricePerKg ?? (listingData as any).price ?? 0);
    const q = Number(listingData.quantityKg ?? (listingData as any).quantity ?? 0);
    const m = Number(listingData.minOrderKg ?? 1);

    const docPayload: Record<string, any> = {
      farmerId: currentFarmerUid,
      farmerName: currentUser?.name || auth.currentUser?.displayName || 'Farmer',
      farmerPhone: currentUser?.phone || '',
      farmerRating: currentUser?.rating ?? 5.0,
      cropName: listingData.cropName || '',
      category: listingData.category || 'Vegetables',
      price: p,
      pricePerKg: p,
      quantity: q,
      quantityKg: q,
      unit: listingData.unit || 'kg',
      minOrderKg: m,
      description: listingData.description || '',
      location: listingData.location || {
        lat: currentUser?.location?.lat || 6.9697,
        lng: currentUser?.location?.lng || 80.7891,
        district: currentUser?.district || currentUser?.location?.district || 'Nuwara Eliya',
        town: currentUser?.location?.town || 'Kandapola',
      },
      photos: Array.isArray(listingData.photos) ? listingData.photos : [],
      status: listingData.status === 'out_of_stock' ? 'out_of_stock' : 'active',
      isOrganic: Boolean(listingData.isOrganic ?? (listingData as any).organic),
      organic: Boolean((listingData as any).organic ?? listingData.isOrganic),
      harvestDate: listingData.harvestDate || new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (listingData.originalPricePerKg !== undefined) {
      docPayload.originalPricePerKg = listingData.originalPricePerKg;
    }
    if (listingData.discountPercent !== undefined) {
      docPayload.discountPercent = listingData.discountPercent;
    }
    if (listingData.isOffer !== undefined) {
      docPayload.isOffer = listingData.isOffer;
    }
    if (listingData.offerBadge !== undefined) {
      docPayload.offerBadge = listingData.offerBadge;
    }
    if (listingData.offerTitle !== undefined) {
      docPayload.offerTitle = listingData.offerTitle;
    }

    try {
      const ref = await addDoc(collection(db, 'listings'), docPayload);
      console.log('Firestore listing created:', ref.id);
      return ref.id;
    } catch (error) {
      console.error('FIRESTORE LISTING ERROR:', error);
      throw error;
    }
  };

  const updateListingStatus = async (listingId: string, status: 'active' | 'out_of_stock' | 'removed') => {
    setListings(prev =>
      prev.map(l => (l._id === listingId ? { ...l, status, updatedAt: new Date().toISOString() } : l))
    );
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'listings', listingId), {
          status,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Error updating listing status in Firestore:', err);
      }
    }
  };

  const updateListingPhotos = async (listingId: string, photos: string[]) => {
    setListings(prev =>
      prev.map(l => (l._id === listingId ? { ...l, photos, updatedAt: new Date().toISOString() } : l))
    );
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'listings', listingId), {
          photos,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Error updating listing photos in Firestore:', err);
      }
    }
  };

  const deleteListingPhoto = async (listingId: string, photoIndex: number) => {
    let updatedPhotos: string[] = [];
    setListings(prev =>
      prev.map(l => {
        if (l._id !== listingId) return l;
        const currentPhotos = l.photos || [];
        updatedPhotos = currentPhotos.filter((_, idx) => idx !== photoIndex);
        return { ...l, photos: updatedPhotos, updatedAt: new Date().toISOString() };
      })
    );
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'listings', listingId), {
          photos: updatedPhotos,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Error deleting listing photo in Firestore:', err);
      }
    }
  };

  const addListingPhoto = async (listingId: string, photoUrl: string) => {
    let updatedPhotos: string[] = [];
    setListings(prev =>
      prev.map(l => {
        if (l._id !== listingId) return l;
        const currentPhotos = l.photos || [];
        updatedPhotos = [...currentPhotos, photoUrl];
        return { ...l, photos: updatedPhotos, updatedAt: new Date().toISOString() };
      })
    );
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'listings', listingId), {
          photos: updatedPhotos,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Error adding listing photo in Firestore:', err);
      }
    }
  };

  const setListingCoverPhoto = async (listingId: string, photoIndex: number) => {
    let updatedPhotos: string[] = [];
    setListings(prev =>
      prev.map(l => {
        if (l._id !== listingId) return l;
        const currentPhotos = [...(l.photos || [])];
        if (photoIndex < 0 || photoIndex >= currentPhotos.length) return l;
        const [selected] = currentPhotos.splice(photoIndex, 1);
        updatedPhotos = [selected, ...currentPhotos];
        return { ...l, photos: updatedPhotos, updatedAt: new Date().toISOString() };
      })
    );
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'listings', listingId), {
          photos: updatedPhotos,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Error setting cover photo in Firestore:', err);
      }
    }
  };

  const clearListingPhotos = async (listingId: string) => {
    setListings(prev =>
      prev.map(l => (l._id === listingId ? { ...l, photos: [], updatedAt: new Date().toISOString() } : l))
    );
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'listings', listingId), {
          photos: [],
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Error clearing listing photos in Firestore:', err);
      }
    }
  };

  const deleteListing = async (listingId: string) => {
    setListings(prev => prev.filter(l => l._id !== listingId));
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'listings', listingId));
      } catch (err) {
        console.warn('Error deleting listing from Firestore:', err);
      }
    }
  };

  const updateListing = async (listingId: string, data: Partial<Listing>) => {
    setListings(prev =>
      prev.map(l => (l._id === listingId ? { ...l, ...data, updatedAt: new Date().toISOString() } : l))
    );
    if (isFirebaseConfigured) {
      try {
        const updateData: Record<string, any> = {
          ...data,
          updatedAt: serverTimestamp(),
        };
        if (data.pricePerKg !== undefined) {
          updateData.price = data.pricePerKg;
        }
        if (data.quantityKg !== undefined) {
          updateData.quantity = data.quantityKg;
        }
        if (data.isOrganic !== undefined) {
          updateData.organic = data.isOrganic;
        }
        delete updateData._id;

        await updateDoc(doc(db, 'listings', listingId), updateData);
      } catch (err) {
        console.warn('Error updating listing in Firestore:', err);
      }
    }
  };

  const sendMessage = (
    conversationId: string,
    content: string,
    type: 'text' | 'order_request' = 'text',
    extra?: any
  ) => {
    if (!currentUser) return;
    const newMsg: ChatMessage = {
      _id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser._id,
      senderRole: currentUser.role,
      type,
      content,
      sentAt: new Date().toISOString(),
      orderRequestData: extra?.orderRequestData,
      listingId: extra?.listingId,
      listingData: extra?.listingData,
    };

    setMessages(prev => [...prev, newMsg]);

    setConversations(prev =>
      prev.map(c =>
        c._id === conversationId
          ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
          : c
      )
    );
  };

  const getOrCreateConversation = (
    targetId: string,
    targetName: string,
    cropName?: string,
    targetRole?: Role
  ) => {
    if (!currentUser) {
      openAuth('buyer', 'login');
      return '';
    }
    const activeUser = currentUser;

    const existing = conversations.find(c =>
      c.participants.some(p => p.userId === targetId) &&
      c.participants.some(p => p.userId === activeUser._id)
    );
    if (existing) {
      return existing._id;
    }

    const defaultRole: Role = activeUser.role === 'farmer' ? 'buyer' : 'farmer';
    const newConv: Conversation = {
      _id: `conv_${Date.now()}`,
      participants: [
        { userId: activeUser._id, name: activeUser.name, role: activeUser.role },
        { userId: targetId, name: targetName, role: targetRole || defaultRole },
      ],
      lastMessage: `Started conversation regarding ${cropName || 'fresh harvest order'}`,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      relatedCropName: cropName,
    };
    setConversations(prev => [newConv, ...prev]);
    return newConv._id;
  };

  const addCategory = (data: { name: string; description: string; iconName: string; iconUrl?: string }) => {
    const newCat: CropCategory = {
      id: 'cat_' + Date.now(),
      name: data.name.trim(),
      description: data.description.trim(),
      iconName: data.iconName || 'Package',
      iconUrl: data.iconUrl,
      itemCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCategories(prev => [newCat, ...prev]);
  };

  const updateCategory = (id: string, data: Partial<CropCategory>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const adminVerifyUser = async (userId: string, approved: boolean) => {
    if (currentUser?.role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can modify verification status.');
    }
    setUsers(prev =>
      prev.map(u => (u._id === userId ? { ...u, verified: approved } : u))
    );
    if (currentUser?._id === userId || currentUser?.uid === userId) {
      setCurrentUser(prev => prev ? { ...prev, verified: approved } : null);
    }
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          verified: approved,
          updatedAt: serverTimestamp(),
        });
      } catch (err: any) {
        console.warn('Error updating user verification in Firestore:', err.message);
        throw err;
      }
    }
  };

  const adminToggleDeactivateUser = async (userId: string) => {
    if (currentUser?.role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can modify deactivation status.');
    }
    const target = users.find(u => u._id === userId);
    const newDeactivatedState = target ? !target.isDeactivated : true;

    setUsers(prev =>
      prev.map(u => (u._id === userId ? { ...u, isDeactivated: newDeactivatedState } : u))
    );
    if (currentUser?._id === userId || currentUser?.uid === userId) {
      setCurrentUser(prev => prev ? { ...prev, isDeactivated: newDeactivatedState } : null);
    }

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          isDeactivated: newDeactivatedState,
          updatedAt: serverTimestamp(),
        });
      } catch (err: any) {
        console.warn('Error toggling user deactivation in Firestore:', err.message);
        throw err;
      }
    }
  };

  const raiseTicket = async (ticketData: {
    category: string;
    subject: string;
    description: string;
    orderId?: string | null;
  }): Promise<SupportTicket> => {
    if (!auth.currentUser) throw new Error('Must be authenticated to raise a ticket');
    const currentUid = auth.currentUser.uid;
    const ticketNumber = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const newTicketData = {
      ticketNumber,
      buyerId: currentUid,
      buyerName: currentUser?.name || 'Buyer',
      buyerPhone: currentUser?.phone || '',
      buyerEmail: currentUser?.email || '',
      category: ticketData.category,
      subject: ticketData.subject,
      description: ticketData.description,
      orderId: ticketData.orderId || null,
      orderNumber: ticketData.orderId ? `ORD-${ticketData.orderId.slice(-4).toUpperCase()}` : null,
      status: 'open',
      priority: 'medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: ticketData.description,
      lastSenderRole: 'buyer',
      lastMessageSenderRole: 'buyer',
      lastMessageAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'tickets'), newTicketData);

    // Initial message stored in subcollection tickets/{ticketId}/messages/{messageId}
    await addDoc(collection(db, 'tickets', docRef.id, 'messages'), {
      senderId: currentUid,
      senderRole: 'buyer',
      senderName: currentUser?.name || 'Buyer',
      message: ticketData.description,
      createdAt: serverTimestamp(),
    });

    const created: SupportTicket = {
      _id: docRef.id,
      ticketId: docRef.id,
      ticketNumber,
      buyerId: currentUid,
      buyerName: currentUser?.name || 'Buyer',
      buyerPhone: currentUser?.phone || '',
      buyerEmail: currentUser?.email || '',
      category: ticketData.category,
      subject: ticketData.subject,
      description: ticketData.description,
      reason: ticketData.subject,
      details: ticketData.description,
      complainantId: currentUid,
      complainantName: currentUser?.name || 'Buyer',
      targetId: ticketData.orderId || '',
      targetName: ticketData.orderId ? `Order #${ticketData.orderId.slice(-6)}` : 'Platform Support',
      targetType: 'order',
      severity: 'medium',
      orderId: ticketData.orderId || null,
      orderNumber: ticketData.orderId ? `ORD-${ticketData.orderId.slice(-4).toUpperCase()}` : null,
      status: 'open',
      priority: 'medium',
      createdAt: nowIso,
      updatedAt: nowIso,
      lastMessage: ticketData.description,
      lastSenderRole: 'buyer',
      lastMessageSenderRole: 'buyer',
      lastMessageAt: nowIso,
    };

    setTickets(prev => [created, ...prev.filter(t => t._id !== docRef.id)]);
    return created;
  };

  const sendTicketMessage = async (ticketId: string, messageText: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('Must be authenticated to send messages');
    const currentUid = auth.currentUser.uid;
    const role = currentUser?.role === 'admin' ? 'admin' : 'buyer';
    const senderName = currentUser?.name || (role === 'admin' ? 'Support Desk' : 'Buyer');
    const cleanMsg = messageText.trim();
    if (!cleanMsg) return;

    // 1. Add to tickets/{ticketId}/messages
    await addDoc(collection(db, 'tickets', ticketId, 'messages'), {
      senderId: currentUid,
      senderRole: role,
      senderName,
      message: cleanMsg,
      createdAt: serverTimestamp(),
    });

    // 2. Update parent ticket doc
    const updateData: any = {
      lastMessage: cleanMsg,
      lastSenderRole: role,
      lastMessageSenderRole: role,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (role === 'admin') {
      const existingTicket = tickets.find(t => t._id === ticketId);
      if (existingTicket && existingTicket.status === 'open') {
        updateData.status = 'in_progress';
      }
    }

    await updateDoc(doc(db, 'tickets', ticketId), updateData);
  };

  const adminUpdateTicketStatus = async (
    ticketId: string,
    status: TicketStatus,
    note?: string
  ): Promise<void> => {
    if (!auth.currentUser || currentUser?.role !== 'admin') {
      throw new Error('Only administrators can update ticket status');
    }
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };
    if (note !== undefined) {
      updateData.resolutionNote = note;
    }
    await updateDoc(doc(db, 'tickets', ticketId), updateData);
  };

  const listenToTicketMessages = (
    ticketId: string,
    callback: (msgs: TicketMessage[]) => void
  ): (() => void) => {
    if (!ticketId || !isFirebaseConfigured) return () => {};
    const q = collection(db, 'tickets', ticketId, 'messages');
    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: TicketMessage[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            _id: docSnap.id,
            senderId: data.senderId || '',
            senderRole: (data.senderRole as Role) || 'buyer',
            senderName: data.senderName || '',
            message: data.message || '',
            createdAt: formatTimestamp(data.createdAt),
          };
        }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        callback(msgs);
      },
      (error) => {
        console.warn('FIRESTORE TICKET MESSAGES SNAPSHOT WARNING:', error.message);
      }
    );
  };

  const adminResolveComplaint = async (
    complaintId: string,
    action: 'resolved' | 'dismissed',
    note: string
  ) => {
    const nextStatus: TicketStatus = action === 'resolved' ? 'resolved' : 'closed';
    await adminUpdateTicketStatus(complaintId, nextStatus, note);
  };

  const adminWarnUser = async (complaintId: string, note?: string) => {
    const resolvedNote = note || 'Formal administrative warning issued. Recorded in audit file.';
    await adminUpdateTicketStatus(complaintId, 'resolved', resolvedNote);
  };

  const adminRemoveListingFromComplaint = async (complaintId: string, listingId: string, reason?: string) => {
    deleteListing(listingId);
    const resolvedNote = reason || 'Listing removed by platform administrator due to trade complaint.';
    await adminUpdateTicketStatus(complaintId, 'resolved', resolvedNote);
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => (u._id === updatedUser._id ? updatedUser : u)));
  };

  const fileComplaint = (complaintData: Omit<Complaint, '_id' | 'createdAt' | 'status'>): Complaint => {
    const dummyId = `ticket_${Date.now()}`;
    raiseTicket({
      category: complaintData.category || 'General',
      subject: complaintData.reason || complaintData.subject || 'Complaint',
      description: complaintData.details || complaintData.description || '',
      orderId: complaintData.orderId,
    }).catch(err => console.error('fileComplaint error:', err));

    return {
      _id: dummyId,
      status: 'open',
      createdAt: new Date().toISOString(),
      ...complaintData,
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        navState,
        cart,
        listings,
        orders,
        conversations,
        messages,
        marketPrices,
        complaints: tickets as any,
        tickets,
        users,
        categories,
        platformStats,
        isSimulatorFrame,
        toggleSimulatorFrame,
        authLoading,
        authError,
        authTargetRole,
        openAuth,
        switchRole,
        continueAsGuest,
        loginAsUser,
        loginAsRole,
        login,
        registerUser,
        logout,
        setTab,
        goToSubScreen,
        goBack,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        advanceOrderStatus,
        farmerAcceptOrder,
        farmerRejectOrder,
        farmerUpdateOrderStatus,
        farmerConfirmPickupHandover,
        driverAcceptOrder,
        driverConfirmPickup,
        driverConfirmDelivery,
        buyerConfirmPickup,
        addListing,
        updateListingStatus,
        updateListingPhotos,
        deleteListingPhoto,
        addListingPhoto,
        setListingCoverPhoto,
        clearListingPhotos,
        deleteListing,
        updateListing,
        addCategory,
        updateCategory,
        deleteCategory,
        sendMessage,
        getOrCreateConversation,
        adminVerifyUser,
        adminToggleDeactivateUser,
        adminResolveComplaint,
        adminWarnUser,
        adminRemoveListingFromComplaint,
        adminUpdateTicketStatus,
        updateCurrentUser,
        fileComplaint,
        raiseTicket,
        sendTicketMessage,
        listenToTicketMessages,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
