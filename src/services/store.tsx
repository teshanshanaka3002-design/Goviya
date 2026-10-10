import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Role,
  Listing,
  ListingStatus,
  Order,
  OrderStatus,
  Conversation,
  ChatMessage,
  MarketPriceRecord,
  Complaint,
  PlatformStat,
  CropCategory,
} from '../types';
import {
  mockUsers,
  mockOrders,
  mockConversations,
  mockChatMessages,
  mockMarketPrices,
  mockComplaints,
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
  syncOrdersToFirestore,
} from './firestore';

export { db, doc, collection, onSnapshot, updateDoc, setDoc, deleteDoc, auth, isFirebaseConfigured };

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
  placeOrder: (input: PlaceOrderInput) => Order;
  advanceOrderStatus: (orderId: string) => void;
  farmerAcceptOrder: (orderId: string) => void;
  farmerRejectOrder: (orderId: string, reason: string) => void;
  farmerUpdateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  farmerConfirmPickupHandover: (orderId: string) => void;
  driverAcceptOrder: (orderId: string) => void;
  driverConfirmPickup: (orderId: string) => void;
  driverConfirmDelivery: (orderId: string, proofNote?: string) => void;
  buyerConfirmPickup: (orderId: string) => void;
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
  // User profile & Support
  updateCurrentUser: (userData: Partial<User>) => void;
  fileComplaint: (complaintData: Omit<Complaint, '_id' | 'createdAt' | 'status'>) => Complaint;
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

const formatTimestamp = (ts: any): string => {
  if (ts && typeof ts.toDate === 'function') {
    return ts.toDate().toISOString();
  }
  if (typeof ts === 'string') {
    return ts;
  }
  return new Date().toISOString();
};

const formatOptionalTimestamp = (ts: any): string | undefined => {
  if (ts && typeof ts.toDate === 'function') {
    return ts.toDate().toISOString();
  }
  if (typeof ts === 'string') {
    return ts;
  }
  return undefined;
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
    const saved = safeStorage.getItem(STORAGE_PREFIX + 'users');
    if (!saved) return mockUsers;
    try {
      const parsed: User[] = JSON.parse(saved);
      const updated = parsed.map(u => {
        if (u._id === 'user_farmer_1' && (!u.avatarUrl || u.avatarUrl.includes('unsplash.com'))) {
          return { ...u, avatarUrl: DEFAULT_FARMER_AVATAR };
        }
        if (u._id === 'user_pending_1' && (!u.avatarUrl || u.avatarUrl.includes('unsplash.com'))) {
          return { ...u, avatarUrl: GAMINI_FARMER_AVATAR };
        }
        if (u._id === 'user_pending_2' && (!u.avatarUrl || u.avatarUrl.includes('unsplash.com'))) {
          return { ...u, avatarUrl: KAVINDA_FARMER_AVATAR };
        }
        return u;
      });
      const existingIds = new Set(updated.map(u => u._id));
      const missingMocks = mockUsers.filter(u => !existingIds.has(u._id));
      return [...updated, ...missingMocks];
    } catch (e) {
      return mockUsers;
    }
  });

  const [listings, setListings] = useState<Listing[]>([]);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = safeStorage.getItem(STORAGE_PREFIX + 'orders');
    return saved ? JSON.parse(saved) : mockOrders;
  });

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

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = safeStorage.getItem(STORAGE_PREFIX + 'complaints');
    if (!saved) return mockComplaints;
    try {
      const parsed: Complaint[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(c => c._id));
      const missingMocks = mockComplaints.filter(c => !existingIds.has(c._id));
      return [...parsed, ...missingMocks];
    } catch (e) {
      return mockComplaints;
    }
  });

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

  const [platformStats] = useState<PlatformStat>(mockPlatformStats);

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
    safeStorage.setItem(STORAGE_PREFIX + 'orders', JSON.stringify(orders));
    syncOrdersToFirestore(orders);
  }, [orders]);


  useEffect(() => {
    safeStorage.setItem(STORAGE_PREFIX + 'complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
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
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

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
            setCurrentUser(appUser);
          }
        } catch (err) {
          console.warn('Error restoring user session from Firestore:', err);
        }
      } else {
        // Guest mode (unauthenticated)
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ----------------------------------------------------
  // Firestore Real-Time Listings Listener
  // ----------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    // When there is NO authenticated user, query Firestore using:
    // query(collection(db, 'listings'), where('status', '==', 'active'))
    // Do not request the whole listings collection for guests.
    const isAuthed = Boolean(auth.currentUser);
    const listingsQuery = isAuthed
      ? collection(db, 'listings')
      : query(collection(db, 'listings'), where('status', '==', 'active'));

    const unsubscribe = onSnapshot(
      listingsQuery,
      (snapshot) => {
        const firestoreListings: Listing[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          const priceVal = Number(data.pricePerKg ?? data.price ?? 0);
          const qtyVal = Number(data.quantityKg ?? data.quantity ?? 0);
          const minOrderVal = Number(data.minOrderKg ?? 1);
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
            photos: Array.isArray(data.photos) && data.photos.length > 0 ? data.photos : [],
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
  }, [currentUser]);

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
      const userSnap = await getDoc(userDocRef);

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
      selectedComplaintId: meta?.complaintId ?? prev.selectedComplaintId,
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

  // Order operations
  const placeOrder = (input: PlaceOrderInput): Order => {
    if (!currentUser) {
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
      notes,
      buyerName,
      buyerPhone,
      deliveryTimeSlot,
      cashChangeDetails,
      cardDetails,
    } = input;

    const firstItem = cart[0].listing;
    const subtotal = cart.reduce((acc, item) => acc + item.listing.pricePerKg * item.quantityKg, 0);
    const deliveryFee = deliveryType === 'pickup' ? 0 : 1500;
    const serviceFee = 0;
    const total = subtotal + deliveryFee;

    const resolvedBuyerId = currentUser ? currentUser._id : `guest_${Date.now()}`;
    const resolvedBuyerName = buyerName || currentUser?.name || 'Colombo Fresh Buyer';
    const resolvedBuyerPhone = buyerPhone || currentUser?.phone || '+94 77 345 6789';

    const newOrder: Order = {
      _id: `ord_${Date.now()}`,
      orderNumber: `GOV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      buyerId: resolvedBuyerId,
      buyerName: resolvedBuyerName,
      buyerPhone: resolvedBuyerPhone,
      farmerId: firstItem.farmerId,
      farmerName: firstItem.farmerName,
      farmerPhone: firstItem.farmerPhone,
      farmerAddress: `${firstItem.location.town}, ${firstItem.location.district}`,
      items: cart.map(item => ({
        listingId: item.listing._id,
        cropName: item.listing.cropName,
        category: item.listing.category,
        photoUrl: item.listing.photos[0] || 'carrots',
        quantityKg: item.quantityKg,
        pricePerKg: item.listing.pricePerKg,
      })),
      subtotal,
      deliveryFee,
      serviceFee,
      total,
      paymentMethod,
      deliveryType,
      pickupLocation: {
        lat: firstItem.location.lat,
        lng: firstItem.location.lng,
        district: firstItem.location.district,
        town: firstItem.location.town,
        address: `${firstItem.farmerName}'s Farm, ${firstItem.location.town}, ${firstItem.location.district}`,
        directions: `Located near ${firstItem.location.town} Agrarian Services Centre. Contact ${firstItem.farmerPhone} on approach.`,
      },
      pickupPin: `${Math.floor(1000 + Math.random() * 9000)}`,
      deliveryAddress: deliveryType === 'pickup' ? `Direct Farm Gate Pickup (${firstItem.location.town})` : deliveryAddress,
      deliveryDistrict: deliveryType === 'pickup' ? firstItem.location.district : district,
      deliveryNotes: notes,
      deliveryTimeSlot: deliveryTimeSlot || 'Tomorrow (Morning 8:00 AM - 12:00 PM)',
      cashChangeDetails,
      cardDetails,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'pending',
          label: deliveryType === 'pickup' ? 'Order Placed (Farm Self-Pickup)' : 'Order Placed (Doorstep Delivery)',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note:
            deliveryType === 'pickup'
              ? `Direct farm pickup requested. Farmer ${firstItem.farmerName} received request to pack harvest at farm gate.`
              : `Doorstep delivery requested. Farmer ${firstItem.farmerName} notified to prepare crates for driver dispatch. Payment: ${paymentMethod.replace(/_/g, ' ').toUpperCase()}`,
        },
      ],
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const advanceOrderStatus = (orderId: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (ord.status === 'pending') {
            return {
              ...ord,
              status: 'accepted' as OrderStatus,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...ord.timeline,
                {
                  status: 'accepted',
                  label: 'Farmer Accepted Order',
                  timestamp: nowStr,
                  note: `Farmer ${ord.farmerName} confirmed batch availability and scheduled morning harvest`,
                },
              ],
            };
          }
          if (ord.status === 'accepted') {
            return {
              ...ord,
              status: 'preparing' as OrderStatus,
              preparationNote: 'Harvested freshly from field, washed, sorted Grade A and packed into crates',
              updatedAt: new Date().toISOString(),
              timeline: [
                ...ord.timeline,
                {
                  status: 'preparing',
                  label: 'Harvesting & Packing in Crates',
                  timestamp: nowStr,
                  note: 'Produce harvested at farm gate, washed, quality graded and packed into crates',
                },
              ],
            };
          }
          if (ord.status === 'preparing') {
            const isPickup = ord.deliveryType === 'pickup';
            return {
              ...ord,
              status: 'ready_for_pickup' as OrderStatus,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...ord.timeline,
                {
                  status: 'ready_for_pickup',
                  label: isPickup ? 'Ready for Buyer Farm Gate Pickup' : 'Ready for Logistics Driver Pickup',
                  timestamp: nowStr,
                  note: isPickup
                    ? `Harvest packed and waiting at ${ord.farmerName}'s farm gate. Bring your Order PIN.`
                    : 'Packed into crates, weighed, labeled and awaiting fleet driver dispatch at farm gate',
                },
              ],
            };
          }
          if (ord.status === 'ready_for_pickup') {
            if (ord.deliveryType === 'pickup') {
              return {
                ...ord,
                status: 'delivered' as OrderStatus,
                deliveredAt: nowStr,
                deliveredBy: 'Direct Farm Gate Handover',
                updatedAt: new Date().toISOString(),
                timeline: [
                  ...ord.timeline,
                  {
                    status: 'delivered',
                    label: 'Collected from Farm Gate',
                    timestamp: nowStr,
                    note: `Buyer ${ord.buyerName} collected harvest directly from farmer ${ord.farmerName} at farm gate.`,
                  },
                ],
              };
            }
            return {
              ...ord,
              status: 'out_for_delivery' as OrderStatus,
              driverId: 'user_driver_1',
              driverName: 'Roshan Kaluarachchi',
              driverPhone: '+94 78 234 5678',
              driverVehicle: 'Light Truck (Dimas) · WP - LG 8824',
              updatedAt: new Date().toISOString(),
              timeline: [
                ...ord.timeline,
                {
                  status: 'out_for_delivery',
                  label: 'Collected by Driver & Out for Delivery',
                  timestamp: nowStr,
                  note: `Driver Roshan picked up produce crates from farmer ${ord.farmerName} at farm gate and is in transit to destination`,
                },
              ],
            };
          }
          if (ord.status === 'out_for_delivery') {
            return {
              ...ord,
              status: 'delivered' as OrderStatus,
              deliveredAt: nowStr,
              deliveredBy: ord.driverName || 'Logistics Driver',
              deliveryProofNote: 'Confirmed by buyer at destination address',
              updatedAt: new Date().toISOString(),
              timeline: [
                ...ord.timeline,
                {
                  status: 'delivered',
                  label: 'Delivered Successfully to Buyer',
                  timestamp: nowStr,
                  note: `Driver ${ord.driverName || 'Roshan'} delivered parcel to buyer ${ord.buyerName} at ${ord.deliveryAddress}. Payment settled.`,
                },
              ],
            };
          }
        }
        return ord;
      })
    );
  };

  const farmerAcceptOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          const updatedTimeline = [
            ...ord.timeline,
            {
              status: 'accepted' as OrderStatus,
              label: 'Farmer Accepted Order',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              note: 'Harvest & packing preparation in progress',
            },
          ];
          return {
            ...ord,
            status: 'accepted',
            updatedAt: new Date().toISOString(),
            timeline: updatedTimeline,
          };
        }
        return ord;
      })
    );
  };

  const farmerRejectOrder = (orderId: string, reason: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          return {
            ...ord,
            status: 'rejected',
            rejectionReason: reason,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...ord.timeline,
              {
                status: 'rejected' as OrderStatus,
                label: 'Order Declined by Farmer',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                note: reason,
              },
            ],
          };
        }
        return ord;
      })
    );
  };

  const farmerUpdateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          let label = status.replace(/_/g, ' ').toUpperCase();
          if (status === 'preparing') {
            label = 'Harvesting & Packing in Crates';
          } else if (status === 'ready_for_pickup') {
            label = ord.deliveryType === 'pickup' ? 'Ready for Buyer Farm Pickup' : 'Ready for Driver Pickup';
          }

          return {
            ...ord,
            status,
            preparationNote: note || ord.preparationNote,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...ord.timeline,
              {
                status,
                label,
                timestamp: nowStr,
                note: note || (status === 'ready_for_pickup'
                  ? (ord.deliveryType === 'pickup'
                      ? `Packed and awaiting buyer pickup at ${ord.farmerName}'s farm gate. Bring your Order PIN.`
                      : `Packed into crates, weighed, and awaiting fleet driver dispatch at ${ord.farmerName}'s farm gate`)
                  : undefined),
              },
            ],
          };
        }
        return ord;
      })
    );
  };

  const farmerConfirmPickupHandover = (orderId: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...ord,
            status: 'delivered',
            deliveredAt: nowStr,
            deliveredBy: 'Direct Farm Gate Handover',
            updatedAt: new Date().toISOString(),
            timeline: [
              ...ord.timeline,
              {
                status: 'delivered',
                label: 'Harvest Handed Over to Buyer',
                timestamp: nowStr,
                note: `Farmer ${ord.farmerName} verified Order PIN and handed over produce to buyer ${ord.buyerName} at farm gate.`,
              },
            ],
          };
        }
        return ord;
      })
    );
  };

  const driverAcceptOrder = (orderId: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const driverName = currentUser?.name || 'Roshan Kaluarachchi';
    const driverPhone = currentUser?.phone || '+94 78 234 5678';
    const driverVehicle = currentUser?.vehiclePlate
      ? `${currentUser.vehicleType} · ${currentUser.vehiclePlate}`
      : 'Dimas Light Truck · WP - LG 8824';

    let updatedOrderObj: Order | null = null;
    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          const updated: Order = {
            ...ord,
            driverId: currentUser?._id || 'user_driver_1',
            driverName,
            driverPhone,
            driverVehicle,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...ord.timeline,
              {
                status: ord.status,
                label: `Logistics Driver Assigned (${driverName})`,
                timestamp: nowStr,
                note: `Driver ${driverName} assigned to collect from ${ord.farmerName}'s farm and deliver to ${ord.deliveryDistrict}.`,
              },
            ],
          };
          updatedOrderObj = updated;
          return updated;
        }
        return ord;
      })
    );
    if (updatedOrderObj) {
      updateDoc(doc(db, 'orders', orderId), updatedOrderObj);
    }
  };

  const driverConfirmPickup = (orderId: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let updatedOrderObj: Order | null = null;
    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          const driverName = ord.driverName || currentUser?.name || 'Roshan Kaluarachchi';
          const updated: Order = {
            ...ord,
            status: 'out_for_delivery',
            driverId: ord.driverId || currentUser?._id || 'user_driver_1',
            driverName,
            driverPhone: ord.driverPhone || currentUser?.phone || '+94 78 234 5678',
            driverVehicle:
              ord.driverVehicle ||
              (currentUser?.vehiclePlate
                ? `${currentUser.vehicleType} · ${currentUser.vehiclePlate}`
                : 'Dimas Light Truck · WP - LG 8824'),
            updatedAt: new Date().toISOString(),
            timeline: [
              ...ord.timeline,
              {
                status: 'out_for_delivery',
                label: 'Produce Picked Up & Out For Delivery',
                timestamp: nowStr,
                note: `Driver ${driverName} collected produce crates from farmer ${ord.farmerName} at farm gate. On transit to destination.`,
              },
            ],
          };
          updatedOrderObj = updated;
          return updated;
        }
        return ord;
      })
    );
    if (updatedOrderObj) {
      updateDoc(doc(db, 'orders', orderId), updatedOrderObj);
    }
  };

  const driverConfirmDelivery = (orderId: string, proofNote?: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let updatedOrderObj: Order | null = null;
    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          const driverName = ord.driverName || currentUser?.name || 'Roshan Kaluarachchi';
          const updated: Order = {
            ...ord,
            status: 'delivered',
            deliveredAt: nowStr,
            deliveredBy: driverName,
            deliveryProofNote: proofNote || 'Delivered & verified by recipient at doorstep',
            updatedAt: new Date().toISOString(),
            timeline: [
              ...ord.timeline,
              {
                status: 'delivered',
                label: 'Successfully Delivered to Buyer',
                timestamp: nowStr,
                note: `Driver ${driverName} delivered parcel to buyer ${ord.buyerName} at ${ord.deliveryAddress}. Handover verified.`,
              },
            ],
          };
          updatedOrderObj = updated;
          return updated;
        }
        return ord;
      })
    );
    if (updatedOrderObj) {
      updateDoc(doc(db, 'orders', orderId), updatedOrderObj);
    }
  };

  const buyerConfirmPickup = (orderId: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...ord,
            status: 'delivered',
            deliveredAt: nowStr,
            deliveredBy: 'Direct Farm Gate Handover',
            deliveryProofNote: `Handed over at ${ord.farmerName}'s farm gate. Order PIN ${ord.pickupPin} verified.`,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...ord.timeline,
              {
                status: 'delivered',
                label: 'Collected from Farm Gate',
                timestamp: nowStr,
                note: `Buyer ${ord.buyerName} verified Order PIN ${ord.pickupPin} and collected fresh produce directly from farmer ${ord.farmerName}. Handover complete.`,
              },
            ],
          };
        }
        return ord;
      })
    );
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
      status: (listingData.status as ListingStatus) || 'active',
      isOrganic: Boolean(listingData.isOrganic),
      organic: Boolean(listingData.isOrganic),
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
      } catch (err) {
        console.warn('Error updating user verification in Firestore:', err);
      }
    }
  };

  const adminToggleDeactivateUser = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u._id === userId ? { ...u, isDeactivated: !u.isDeactivated } : u))
    );
  };

  const adminResolveComplaint = (
    complaintId: string,
    action: 'resolved' | 'dismissed',
    note: string
  ) => {
    setComplaints(prev =>
      prev.map(c =>
        c._id === complaintId
          ? { ...c, status: action, resolutionNote: note }
          : c
      )
    );
  };

  const adminWarnUser = (complaintId: string, note?: string) => {
    setComplaints(prev =>
      prev.map(c =>
        c._id === complaintId
          ? {
              ...c,
              status: 'resolved',
              resolutionNote:
                note ||
                `Formal administrative warning issued to ${c.targetName}. Recorded in producer audit profile.`,
            }
          : c
      )
    );
  };

  const adminRemoveListingFromComplaint = (complaintId: string, listingId: string, reason?: string) => {
    setListings(prev => prev.map(l => (l._id === listingId ? { ...l, status: 'removed' } : l)));
    setComplaints(prev =>
      prev.map(c =>
        c._id === complaintId
          ? {
              ...c,
              status: 'resolved',
              resolutionNote:
                reason ||
                `Listing removed by platform administrator due to verified trade complaint.`,
            }
          : c
      )
    );
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => (u._id === updatedUser._id ? updatedUser : u)));
  };

  const fileComplaint = (complaintData: Omit<Complaint, '_id' | 'createdAt' | 'status'>): Complaint => {
    const newComplaint: Complaint = {
      _id: `complaint_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...complaintData,
    };
    setComplaints(prev => [newComplaint, ...prev]);
    return newComplaint;
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
        complaints,
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
        updateCurrentUser,
        fileComplaint,
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
