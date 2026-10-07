import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Role,
  Listing,
  Order,
  OrderStatus,
  Conversation,
  ChatMessage,
  MarketPriceRecord,
  Complaint,
  PlatformStat,
} from '../types';
import {
  mockUsers,
  mockListings,
  mockOrders,
  mockConversations,
  mockChatMessages,
  mockMarketPrices,
  mockComplaints,
  mockPlatformStats,
} from './mockData';

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
  platformStats: PlatformStat;
  isSimulatorFrame: boolean;
  toggleSimulatorFrame: () => void;
  // Auth & Nav
  authTargetRole: Role | null;
  openAuth: (targetRole?: Role, view?: 'login' | 'register') => void;
  switchRole: (role: Role) => void;
  continueAsGuest: () => void;
  loginAsUser: (userId: string) => void;
  loginAsRole: (role: Role) => void;
  registerUser: (userData: Partial<User>) => void;
  logout: () => void;
  setTab: (tab: string) => void;
  goToSubScreen: (
    subScreen: string | null,
    meta?: {
      listingId?: string;
      orderId?: string;
      conversationId?: string;
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
  // Listings
  addListing: (listingData: Omit<Listing, '_id' | 'farmerId' | 'farmerName' | 'farmerPhone' | 'farmerRating'>) => void;
  updateListingStatus: (listingId: string, status: 'active' | 'out_of_stock' | 'removed') => void;
  updateListingPhotos: (listingId: string, photos: string[]) => void;
  deleteListingPhoto: (listingId: string, photoIndex: number) => void;
  addListingPhoto: (listingId: string, photoUrl: string) => void;
  setListingCoverPhoto: (listingId: string, photoIndex: number) => void;
  clearListingPhotos: (listingId: string) => void;
  deleteListing: (listingId: string) => void;
  updateListing: (listingId: string, data: Partial<Listing>) => void;
  // Chat
  sendMessage: (conversationId: string, content: string, type?: 'text' | 'order_request', extra?: any) => void;
  getOrCreateConversation: (targetId: string, targetName: string, cropName?: string, targetRole?: Role) => string;
  // Admin
  adminVerifyUser: (userId: string, approved: boolean) => void;
  adminResolveComplaint: (complaintId: string, action: 'resolved' | 'dismissed', note: string) => void;
  // User profile & Support
  updateCurrentUser: (userData: Partial<User>) => void;
  fileComplaint: (complaintData: Omit<Complaint, '_id' | 'createdAt' | 'status'>) => Complaint;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_PREFIX = 'goviya_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Simulator frame toggle
  const [isSimulatorFrame, setIsSimulatorFrame] = useState<boolean>(() => {
    return window.innerWidth > 900;
  });

  // Current user & role
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null; // Guest buyer initially: visitors can view the buyer marketplace without signup or login!
  });

  const [authTargetRole, setAuthTargetRole] = useState<Role | null>(null);

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
    const saved = localStorage.getItem(STORAGE_PREFIX + 'users');
    return saved ? JSON.parse(saved) : mockUsers;
  });

  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'listings');
    if (!saved) return mockListings;
    try {
      const parsed: Listing[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(l => l._id));
      const missingMocks = mockListings.filter(l => !existingIds.has(l._id));
      return [...parsed, ...missingMocks];
    } catch (e) {
      return mockListings;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'orders');
    return saved ? JSON.parse(saved) : mockOrders;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'conversations');
    return saved ? JSON.parse(saved) : mockConversations;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'messages');
    return saved ? JSON.parse(saved) : mockChatMessages;
  });

  const [marketPrices] = useState<MarketPriceRecord[]>(mockMarketPrices);

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'complaints');
    return saved ? JSON.parse(saved) : mockComplaints;
  });

  const [platformStats] = useState<PlatformStat>(mockPlatformStats);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_PREFIX + 'user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_PREFIX + 'user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'messages', JSON.stringify(messages));
  }, [messages]);

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

  const registerUser = (userData: Partial<User>) => {
    const newUser: User = {
      _id: `user_${Date.now()}`,
      role: userData.role || 'buyer',
      name: userData.name || 'New User',
      phone: userData.phone || '+94 77 000 0000',
      email: userData.email,
      verified: userData.role === 'buyer', // farmers require admin verification
      createdAt: new Date().toISOString(),
      location: userData.location || {
        lat: 6.9271,
        lng: 79.8612,
        district: 'Colombo',
        address: 'Colombo, Western Province',
      },
      ...userData,
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
  };

  const logout = () => {
    setCurrentUser(null);
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

  const setTab = (tab: string) => {
    setNavState(prev => ({
      ...prev,
      activeTab: tab,
      subScreen: null,
      selectedListingId: null,
      selectedOrderId: null,
      selectedConversationId: null,
    }));
  };

  const goToSubScreen = (
    subScreen: string | null,
    meta?: {
      listingId?: string;
      orderId?: string;
      conversationId?: string;
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
    }));
  };

  // Cart operations
  const addToCart = (listing: Listing, quantityKg: number) => {
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
                note: note || (status === 'ready_for_pickup' && ord.deliveryType === 'pickup'
                  ? `Packed and awaiting buyer pickup at ${ord.farmerName}'s farm gate`
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
    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const driverName = currentUser?.name || 'Roshan Kaluarachchi';
          const driverPhone = currentUser?.phone || '+94 78 234 5678';
          const driverVehicle = currentUser?.vehiclePlate
            ? `${currentUser.vehicleType} · ${currentUser.vehiclePlate}`
            : 'Dimas Light Truck · WP - LG 8824';

          return {
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
        }
        return ord;
      })
    );
  };

  const driverConfirmPickup = (orderId: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const driverName = ord.driverName || currentUser?.name || 'Roshan Kaluarachchi';
          return {
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
        }
        return ord;
      })
    );
  };

  const driverConfirmDelivery = (orderId: string, proofNote?: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord._id === orderId) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const driverName = ord.driverName || currentUser?.name || 'Roshan Kaluarachchi';
          return {
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
        }
        return ord;
      })
    );
  };

  const addListing = (
    listingData: Omit<Listing, '_id' | 'farmerId' | 'farmerName' | 'farmerPhone' | 'farmerRating'>
  ) => {
    if (!currentUser) return;
    const newListing: Listing = {
      _id: `list_${Date.now()}`,
      farmerId: currentUser._id,
      farmerName: currentUser.name,
      farmerPhone: currentUser.phone,
      farmerRating: currentUser.rating || 5.0,
      ...listingData,
    };
    setListings(prev => [newListing, ...prev]);
  };

  const updateListingStatus = (listingId: string, status: 'active' | 'out_of_stock' | 'removed') => {
    setListings(prev =>
      prev.map(l => (l._id === listingId ? { ...l, status } : l))
    );
  };

  const updateListingPhotos = (listingId: string, photos: string[]) => {
    setListings(prev =>
      prev.map(l => (l._id === listingId ? { ...l, photos } : l))
    );
  };

  const deleteListingPhoto = (listingId: string, photoIndex: number) => {
    setListings(prev =>
      prev.map(l => {
        if (l._id !== listingId) return l;
        const currentPhotos = l.photos || [];
        const newPhotos = currentPhotos.filter((_, idx) => idx !== photoIndex);
        return { ...l, photos: newPhotos };
      })
    );
  };

  const addListingPhoto = (listingId: string, photoUrl: string) => {
    setListings(prev =>
      prev.map(l => {
        if (l._id !== listingId) return l;
        const currentPhotos = l.photos || [];
        return { ...l, photos: [...currentPhotos, photoUrl] };
      })
    );
  };

  const setListingCoverPhoto = (listingId: string, photoIndex: number) => {
    setListings(prev =>
      prev.map(l => {
        if (l._id !== listingId) return l;
        const currentPhotos = [...(l.photos || [])];
        if (photoIndex < 0 || photoIndex >= currentPhotos.length) return l;
        const [selected] = currentPhotos.splice(photoIndex, 1);
        return { ...l, photos: [selected, ...currentPhotos] };
      })
    );
  };

  const clearListingPhotos = (listingId: string) => {
    setListings(prev =>
      prev.map(l => (l._id === listingId ? { ...l, photos: [] } : l))
    );
  };

  const deleteListing = (listingId: string) => {
    setListings(prev => prev.filter(l => l._id !== listingId));
  };

  const updateListing = (listingId: string, data: Partial<Listing>) => {
    setListings(prev =>
      prev.map(l => (l._id === listingId ? { ...l, ...data } : l))
    );
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
    const activeUser = currentUser || {
      _id: 'user_buyer_guest',
      name: 'Guest Buyer',
      phone: '+94 77 123 4567',
      role: 'buyer' as Role,
      verified: false,
      createdAt: new Date().toISOString(),
    };

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

  const adminVerifyUser = (userId: string, approved: boolean) => {
    setUsers(prev =>
      prev.map(u => (u._id === userId ? { ...u, verified: approved } : u))
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
        platformStats,
        isSimulatorFrame,
        toggleSimulatorFrame,
        authTargetRole,
        openAuth,
        switchRole,
        continueAsGuest,
        loginAsUser,
        loginAsRole,
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
        addListing,
        updateListingStatus,
        updateListingPhotos,
        deleteListingPhoto,
        addListingPhoto,
        setListingCoverPhoto,
        clearListingPhotos,
        deleteListing,
        updateListing,
        sendMessage,
        getOrCreateConversation,
        adminVerifyUser,
        adminResolveComplaint,
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
