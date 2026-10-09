// Goviya Data Types

export type Role = 'buyer' | 'farmer' | 'driver' | 'admin';

export interface User {
  _id: string;
  role: Role;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  location?: {
    lat: number;
    lng: number;
    district: string;
    town?: string;
    address: string;
  };
  verified: boolean;
  nicNumber?: string;
  farmName?: string;
  farmSizeAcres?: number;
  yearsFarming?: number;
  vehicleType?: 'Three-Wheeler' | 'Light Truck (Dimas)' | 'Motorbike' | 'Lorry';
  vehiclePlate?: string;
  rating?: number;
  totalRatings?: number;
  createdAt: string;
  isDeactivated?: boolean;
  isOnline?: boolean;
  verificationDocuments?: {
    id: string;
    type: 'nic_front' | 'nic_back' | 'grama_certificate' | 'farm_deed' | 'business_reg';
    title: string;
    url: string;
    issuedDate?: string;
  }[];
}

export interface CropCategory {
  id: string;
  name: string;
  description: string;
  iconName: string;
  iconUrl?: string;
  itemCount: number;
  createdAt: string;
}

export type ListingStatus = 'active' | 'out_of_stock' | 'removed';

export interface Listing {
  _id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerRating: number;
  cropName: string;
  category: 'Vegetables' | 'Fruits' | 'Spices & Herbs' | 'Grains & Rice' | 'Tubers';
  quantityKg: number;
  minOrderKg: number;
  pricePerKg: number; // in LKR
  originalPricePerKg?: number; // Pre-discount price
  discountPercent?: number; // Discount percentage (e.g. 20, 25)
  isOffer?: boolean; // Promotional or bundle offer
  offerBadge?: string; // e.g. "Special Offer", "Weekend Deal", "Bulk Saver"
  offerTitle?: string; // e.g. "Hill Country Harvest Deal"
  harvestDate: string;
  photos: string[];
  description: string;
  status: ListingStatus;
  location: {
    lat: number;
    lng: number;
    district: string;
    town: string;
  };
  isOrganic?: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export interface OrderItem {
  listingId: string;
  cropName: string;
  category: string;
  photoUrl: string;
  quantityKg: number;
  pricePerKg: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerAddress: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number; // in LKR
  paymentMethod: 'cash_on_delivery' | 'card' | 'mobile_wallet';
  deliveryType?: 'delivery' | 'pickup';
  pickupLocation?: {
    lat: number;
    lng: number;
    district: string;
    town: string;
    address: string;
    directions?: string;
  };
  pickupPin?: string;
  preparationNote?: string;
  deliveredAt?: string;
  deliveredBy?: string;
  deliveryProofNote?: string;
  deliveryAddress: string;
  deliveryDistrict: string;
  deliveryNotes?: string;
  deliveryTimeSlot?: string;
  cashChangeDetails?: string;
  cardDetails?: {
    cardLast4: string;
    cardHolder: string;
  };
  status: OrderStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    status: OrderStatus;
    label: string;
    timestamp: string;
    note?: string;
  }[];
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: Role;
  type: 'text' | 'product' | 'photo' | 'order_request';
  content: string;
  listingId?: string;
  listingData?: {
    cropName: string;
    pricePerKg: number;
    photo: string;
  };
  orderRequestData?: {
    cropName: string;
    quantityKg: number;
    offerPricePerKg: number;
  };
  sentAt: string;
  readAt?: string;
}

export interface Conversation {
  _id: string;
  participants: {
    userId: string;
    name: string;
    role: Role;
    avatarUrl?: string;
  }[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  relatedCropName?: string;
}

export interface MarketPriceRecord {
  id: string;
  crop: string;
  sinhalaName: string;
  marketName: string; // e.g. Dambulla Economic Centre, Pettah Wholesale, Meegoda
  wholesaleMinLkr: number;
  wholesaleMaxLkr: number;
  retailAvgLkr: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  updatedAt: string;
  history6Months: { month: string; price: number }[];
}

export interface Complaint {
  _id: string;
  complainantId: string;
  complainantName: string;
  targetId: string;
  targetName: string;
  targetType: 'listing' | 'farmer' | 'buyer' | 'driver';
  reason: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'resolved' | 'dismissed';
  evidencePhotos?: string[];
  createdAt: string;
  resolutionNote?: string;
}

export interface PlatformStat {
  totalFarmers: number;
  totalBuyers: number;
  totalDrivers: number;
  totalTransactionsLkr: number;
  activeListingsCount: number;
  completedDeliveriesCount: number;
  topCrops: { crop: string; volumeKg: number; revenueLkr: number }[];
  monthlyVolume: { month: string; volumeTons: number; valueMillionsLkr: number }[];
}
