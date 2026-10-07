import React, { useState } from 'react';
import {
  Package,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Check,
  Phone,
  MessageSquare,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Image,
  Upload,
  Trash2,
  Camera,
  X,
  Eye,
  Star,
} from 'lucide-react';
import { useApp } from '../../services/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProduceVisual } from '../../components/ui/ProduceVisual';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Order, OrderStatus, Listing } from '../../types';

// Authentic Sri Lankan agricultural harvest presets
export const HARVEST_PHOTO_PRESETS = [
  {
    title: 'Fresh Orange Carrots',
    url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=600&auto=format&fit=crop&q=80',
    tag: 'Carrots',
  },
  {
    title: 'Highland Washed Carrots',
    url: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&auto=format&fit=crop&q=80',
    tag: 'Carrots',
  },
  {
    title: 'Baby Sweet Carrots',
    url: 'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?w=600&auto=format&fit=crop&q=80',
    tag: 'Carrots',
  },
  {
    title: 'Jaffna Cured Red Onions',
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
    tag: 'Onions',
  },
  {
    title: 'Greenhouse Salad Tomatoes',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    tag: 'Tomatoes',
  },
  {
    title: 'Upcountry Green Leeks',
    url: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&auto=format&fit=crop&q=80',
    tag: 'Leeks',
  },
  {
    title: 'Pannipitiya Fresh Brinjal',
    url: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=600&auto=format&fit=crop&q=80',
    tag: 'Brinjal',
  },
  {
    title: 'Galewela Green Chillies',
    url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
    tag: 'Chillies',
  },
  {
    title: 'Tender Green Okra (Bandakka)',
    url: 'https://images.unsplash.com/photo-1617454837330-819958178129?w=600&auto=format&fit=crop&q=80',
    tag: 'Okra',
  },
  {
    title: 'Organic Sweet Papaya',
    url: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&auto=format&fit=crop&q=80',
    tag: 'Papaya',
  },
];

// Reusable Photo Management Modal for any farmer crop listing
export interface PhotoManagerModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const PhotoManagerModal: React.FC<PhotoManagerModalProps> = ({
  listing,
  isOpen,
  onClose,
  onToast,
}) => {
  const { addListingPhoto, deleteListingPhoto, setListingCoverPhoto, clearListingPhotos } = useApp();
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!listing) return null;

  const photos = listing.photos || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let count = 0;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        addListingPhoto(listing._id, result);
        count++;
        onToast(`Harvest photo uploaded for ${listing.cropName}!`);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddPresetPhoto = (url: string) => {
    addListingPhoto(listing._id, url);
    onToast(`Added preset harvest photo to ${listing.cropName}!`);
  };

  const handleAddUrl = () => {
    if (!customImageUrl.trim()) return;
    addListingPhoto(listing._id, customImageUrl.trim());
    setCustomImageUrl('');
    onToast(`Photo URL added to ${listing.cropName}!`);
  };

  const handleDeletePhoto = (index: number) => {
    deleteListingPhoto(listing._id, index);
    onToast(`Photo removed from ${listing.cropName}.`);
  };

  const handleSetCover = (index: number) => {
    setListingCoverPhoto(listing._id, index);
    onToast(`Photo set as cover photo!`);
  };

  const handleClearAll = () => {
    clearListingPhotos(listing._id);
    setShowConfirmClear(false);
    onToast(`All photos cleared for ${listing.cropName}.`);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Photos for ${listing.cropName}`}
    >
      <div className="p-4 space-y-4 text-left overflow-y-auto max-h-[75vh]">
        {/* Header note with farmer name */}
        <div className="flex items-center justify-between text-xs text-[#6B7280]">
          <span>
            Grower: <strong className="text-[#1A1A1A]">{listing.farmerName}</strong> · {listing.location.town}
          </span>
          <span className="font-bold text-[#1F5C3A] bg-[#E6F2E8] px-2 py-0.5 rounded-full">
            {photos.length} Photo{photos.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Current Photos Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#1A1A1A]">
              Current Item Photos ({photos.length})
            </label>
            {photos.length > 0 && (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
              >
                Delete All Photos
              </button>
            )}
          </div>

          {showConfirmClear && (
            <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-xl space-y-2 text-xs">
              <p className="font-semibold text-red-700">Are you sure you want to delete all photos for this item?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold text-xs cursor-pointer"
                >
                  Yes, Delete All
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  className="px-3 py-1 bg-white border border-[#E5E5E5] text-[#1A1A1A] rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {photos.length === 0 ? (
            <div className="p-4 bg-[#F9FAF8] border border-dashed border-[#E5E5E5] rounded-2xl text-center text-xs text-[#6B7280] space-y-1">
              <Camera className="w-6 h-6 text-[#9CA3AF] mx-auto mb-1" />
              <p className="font-semibold text-[#1A1A1A]">No custom photos uploaded yet</p>
              <p className="text-[11px]">Upload authentic photos of this harvest to attract buyers across Sri Lanka.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {photos.map((photo, idx) => {
                const isRealImage = photo.startsWith('data:image') || photo.startsWith('http');
                return (
                  <div
                    key={idx}
                    className="relative rounded-2xl overflow-hidden border border-[#E5E5E5] bg-white h-24 shadow-2xs group"
                  >
                    {isRealImage ? (
                      <img
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2">
                        <ProduceVisual type={listing.cropName} size="sm" />
                      </div>
                    )}

                    {/* DELETE BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(idx)}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 active:scale-95 transition-all cursor-pointer z-10"
                      title="Delete this image"
                      aria-label="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* SET AS COVER BUTTON */}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        className="absolute bottom-1.5 right-1.5 p-1 bg-white/90 hover:bg-white text-amber-500 rounded-md shadow-xs transition-all cursor-pointer z-10"
                        title="Set as Cover Photo"
                      >
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </button>
                    )}

                    <span className={`absolute bottom-1.5 left-1.5 text-white text-[9px] font-bold px-1.5 py-0.2 rounded ${idx === 0 ? 'bg-[#1F5C3A]' : 'bg-black/60'}`}>
                      {idx === 0 ? 'Cover' : `#${idx + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upload Option 1: File from Device / Camera */}
        <div className="space-y-2 pt-2 border-t border-[#F0F0EE]">
          <label className="text-xs font-bold text-[#1A1A1A] block">
            1. Upload from Camera / Photo Library
          </label>
          <label className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-[#1F5C3A] rounded-2xl text-xs font-bold text-[#1F5C3A] hover:bg-[#E6F2E8] transition-colors cursor-pointer shadow-2xs">
            <Upload className="w-4 h-4" />
            <span>Choose Image from Phone / Computer</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Upload Option 2: Paste Web Image URL */}
        <div className="space-y-2 pt-2 border-t border-[#F0F0EE]">
          <label className="text-xs font-bold text-[#1A1A1A] block">
            2. Add via Image Web Link (URL)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={customImageUrl}
              onChange={e => setCustomImageUrl(e.target.value)}
              placeholder="https://example.com/fresh-produce.jpg"
              className="flex-1 h-10 px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/20"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddUrl}
              disabled={!customImageUrl.trim()}
            >
              Add Photo
            </Button>
          </div>
        </div>

        {/* Upload Option 3: Curated Authentic Harvest Photo Presets */}
        <div className="space-y-2 pt-2 border-t border-[#F0F0EE]">
          <label className="text-xs font-bold text-[#1A1A1A] block">
            3. Instant Sri Lankan Harvest Photo Presets
          </label>
          <p className="text-[11px] text-[#6B7280]">
            Tap any pre-verified organic harvest image to add it immediately:
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {HARVEST_PHOTO_PRESETS.map((preset, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => handleAddPresetPhoto(preset.url)}
                className="p-2 bg-white border border-[#E5E5E5] hover:border-[#1F5C3A] rounded-xl flex items-center gap-2 text-left transition-colors cursor-pointer group"
              >
                <img
                  src={preset.url}
                  alt={preset.title}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-[#1A1A1A] group-hover:text-[#1F5C3A] truncate">
                    {preset.title}
                  </div>
                  <span className="text-[9px] text-[#1F5C3A] font-semibold bg-[#E6F2E8] px-1.5 py-0.2 rounded">
                    + Add Photo
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            fullWidth
            size="md"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

// ===================== 1. FARMER HOME / ORDERS DASHBOARD =====================
export const FarmerHomeScreen: React.FC = () => {
  const {
    orders,
    listings,
    currentUser,
    users,
    loginAsUser,
    farmerAcceptOrder,
    farmerRejectOrder,
    farmerUpdateOrderStatus,
    farmerConfirmPickupHandover,
    getOrCreateConversation,
    goToSubScreen,
    setTab,
    addListingPhoto,
    deleteListingPhoto,
    updateListingStatus,
    deleteListing,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Insufficient harvest volume due to weather');
  const [statusUpdatingOrderId, setStatusUpdatingOrderId] = useState<string | null>(null);
  const [customPrepNote, setCustomPrepNote] = useState('');

  // Active Photo Management Modal State
  const [managingListingId, setManagingListingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Active farmer profile
  const currentFarmerId = currentUser?.role === 'farmer' ? currentUser._id : 'user_farmer_1';
  const currentFarmer = users.find(u => u._id === currentFarmerId) || currentUser;

  // STRICTLY filter listings belonging to this specific farmer
  const myListings = listings.filter(
    l => l.farmerId === currentFarmerId || (currentUser?.phone && l.farmerPhone === currentUser.phone)
  );

  // STRICTLY filter orders belonging to this specific farmer
  const farmerOrders = orders.filter(
    o => o.farmerId === currentFarmerId || (currentFarmer && o.farmerName === currentFarmer.name)
  );

  const pendingOrders = farmerOrders.filter(o => o.status === 'pending');
  const confirmedOrders = farmerOrders.filter(
    o => o.status === 'accepted' || o.status === 'preparing' || o.status === 'ready_for_pickup' || o.status === 'out_for_delivery'
  );
  const completedOrders = farmerOrders.filter(o => o.status === 'delivered');

  const filteredOrders =
    activeTab === 'pending'
      ? pendingOrders
      : activeTab === 'confirmed'
      ? confirmedOrders
      : activeTab === 'completed'
      ? completedOrders
      : farmerOrders;

  const totalRevenue = farmerOrders
    .filter(o => o.status !== 'rejected' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.subtotal, 0);

  // Total photos across all listings for this farmer
  const totalPhotosCount = myListings.reduce((sum, l) => sum + (l.photos?.length || 0), 0);

  const activeListing = listings.find(l => l._id === managingListingId) || null;

  // Handle direct file upload from the card
  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>, listingId: string, cropName: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        addListingPhoto(listingId, result);
        showToast(`Harvest photo uploaded for ${cropName}!`);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleConfirmReject = () => {
    if (rejectingOrderId) {
      farmerRejectOrder(rejectingOrderId, rejectReason);
      setRejectingOrderId(null);
    }
  };

  // Farmer Profiles for Demo Switching
  const farmerProfiles = users.filter(u => u.role === 'farmer');

  return (
    <div className="space-y-4 px-4 pt-2 pb-24 text-left max-w-lg mx-auto animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1F5C3A] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Farmer Dashboard</h2>
          <p className="text-xs text-[#6B7280]">
            Orders overview, buyer inquiries & live harvest milestones
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTab('orders')}
          >
            All Orders →
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => goToSubScreen('add_listing')}
          >
            Add Crop
          </Button>
        </div>
      </div>

      {/* Active Farmer Profile Banner & Switcher */}
      <div className="bg-[#E6F2E8] border border-[#CDE5D2] rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={currentFarmer?.name || 'Farmer'} size="sm" role="farmer" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h4 className="text-xs font-bold text-[#1F5C3A] truncate">
                {currentFarmer?.name}
              </h4>
              <ShieldCheck className="w-3.5 h-3.5 text-[#1F5C3A] shrink-0" />
            </div>
            <p className="text-[10px] text-[#4B6B56] truncate">
              {currentFarmer?.farmName || 'Direct Producer'} · {farmerOrders.length} Buyer Orders · {currentFarmer?.location?.town || currentFarmer?.location?.district}
            </p>
          </div>
        </div>

        {farmerProfiles.length > 1 && (
          <div className="shrink-0 flex items-center gap-1">
            <span className="text-[9px] font-bold text-[#4B6B56] uppercase hidden sm:inline">Farmer:</span>
            <select
              value={currentFarmerId}
              onChange={e => loginAsUser(e.target.value)}
              className="text-[10px] font-bold text-[#1F5C3A] bg-white border border-[#CDE5D2] rounded-lg px-2 py-1 shadow-2xs cursor-pointer focus:outline-none"
              title="Switch active farmer"
            >
              {farmerProfiles.map(f => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.location?.town || f.location?.district})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Top Stat Cards Grid (Orders & Revenue Focused) */}
      <div className="grid grid-cols-4 gap-2">
        <div
          onClick={() => setActiveTab('all')}
          className="p-2.5 rounded-xl border bg-white border-[#E5E5E5] text-left cursor-pointer hover:border-[#1F5C3A] transition-colors"
        >
          <div className="text-[9px] uppercase font-bold text-[#6B7280]">Total Orders</div>
          <div className="text-lg font-black text-[#1A1A1A] mt-0.5">
            {farmerOrders.length}
          </div>
          <div className="text-[8px] text-[#6B7280]">Buyer requests</div>
        </div>

        <div
          onClick={() => setActiveTab('pending')}
          className="p-2.5 rounded-xl border bg-[#FEF8EA] border-[#FCE7C2] text-left cursor-pointer hover:border-amber-500 transition-colors"
        >
          <div className="text-[9px] uppercase font-bold text-[#B45309]">Pending</div>
          <div className="text-lg font-black text-[#B45309] mt-0.5">
            {pendingOrders.length}
          </div>
          <div className="text-[8px] text-[#B45309]">Needs action</div>
        </div>

        <div
          onClick={() => setActiveTab('confirmed')}
          className="p-2.5 rounded-xl border bg-[#EEF8FA] border-[#D0EEF5] text-left cursor-pointer hover:border-blue-500 transition-colors"
        >
          <div className="text-[9px] uppercase font-bold text-[#19768A]">In Progress</div>
          <div className="text-lg font-black text-[#19768A] mt-0.5">
            {confirmedOrders.length}
          </div>
          <div className="text-[8px] text-[#528796]">Prep & transit</div>
        </div>

        <div className="p-2.5 rounded-xl border bg-[#E6F2E8] border-[#CDE5D2] text-left">
          <div className="text-[9px] uppercase font-bold text-[#4B6B56]">Sales LKR</div>
          <div className="text-sm font-black text-[#1F5C3A] mt-1 truncate">
            {totalRevenue > 99999 ? `${(totalRevenue / 1000).toFixed(0)}k` : totalRevenue.toLocaleString()}
          </div>
          <div className="text-[8px] text-[#4B6B56]">Settled value</div>
        </div>
      </div>

      {/* SECTION: INCOMING HARVEST ORDERS */}
      <div className="space-y-3 pt-3 border-t border-[#E5E5E5]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#1F5C3A]" />
            <span>Incoming Harvest Orders ({farmerOrders.length})</span>
          </h3>
          <span className="text-xs text-[#6B7280]">
            Direct buyer requests
          </span>
        </div>

        {/* Tabs */}
        <div>
          <div className="flex border-b border-[#E5E5E5] text-xs font-semibold">
            {[
              { id: 'all', label: `All (${farmerOrders.length})` },
              { id: 'pending', label: `Pending (${pendingOrders.length})` },
              { id: 'confirmed', label: `Confirmed (${confirmedOrders.length})` },
              { id: 'completed', label: `Completed (${completedOrders.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 text-center transition-colors border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#1F5C3A] text-[#1F5C3A] font-bold'
                    : 'border-transparent text-[#6B7280]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <EmptyState
              title="No orders in this state"
              description="Incoming harvest order requests from buyers in Colombo and Kandy will show up here."
            />
          ) : (
            filteredOrders.map(order => {
              const isPickupOrder = order.deliveryType === 'pickup';
              return (
                <Card key={order._id} variant="default" padding="md" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#6B7280]">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isPickupOrder
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {isPickupOrder ? '🏪 Farm Self-Pickup' : '🚚 Driver Delivery'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <h4 className="text-xs font-bold text-[#1A1A1A]">
                          Buyer: {order.buyerName}
                        </h4>
                        <a
                          href={`tel:${order.buyerPhone}`}
                          className="text-[10px] text-[#1F5C3A] font-semibold hover:underline flex items-center gap-0.5"
                          title="Call buyer"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>{order.buyerPhone}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const convId = getOrCreateConversation(
                              order.buyerId,
                              order.buyerName,
                              order.items[0]?.cropName,
                              'buyer'
                            );
                            goToSubScreen('chat_detail', { conversationId: convId });
                          }}
                          className="text-[10px] text-[#1F5C3A] bg-[#E6F2E8] px-2 py-0.5 rounded-md font-bold hover:bg-[#1F5C3A] hover:text-white transition-colors cursor-pointer flex items-center gap-1 ml-1"
                        >
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                    <StatusPill status={order.status} />
                  </div>

                  {/* Items & Amount */}
                  <div className="p-2.5 bg-[#F6F7F5] rounded-xl space-y-1.5">
                    {order.items.map(item => (
                      <div
                        key={item.listingId}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <ProduceVisual type={item.cropName} size="sm" />
                          <div>
                            <span className="font-semibold text-[#1A1A1A]">{item.cropName}</span>
                            <span className="text-[#6B7280] ml-1.5">({item.quantityKg} kg)</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-[#1F5C3A]">
                          LKR {(item.pricePerKg * item.quantityKg).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="pt-1.5 border-t border-[#E5E5E5] flex justify-between text-xs text-[#6B7280]">
                      <span>{isPickupOrder ? 'Pickup Location:' : 'Delivery Address:'}</span>
                      <span className="font-medium text-[#1A1A1A] truncate max-w-[200px]">
                        {isPickupOrder ? `Farm Gate (${currentFarmer?.location?.town || 'Hakgala'})` : order.deliveryAddress}
                      </span>
                    </div>
                    {isPickupOrder && (
                      <div className="flex justify-between text-[11px] text-[#854D0E] bg-amber-50 p-1.5 rounded-lg border border-amber-200 font-semibold">
                        <span>Pickup PIN:</span>
                        <span className="font-mono text-xs">#{order.pickupPin || '4821'}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons depending on status */}
                  {order.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => setRejectingOrderId(order._id)}
                      >
                        Decline Order
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          farmerAcceptOrder(order._id);
                          showToast(`Order ${order.orderNumber} accepted! Scheduled for harvest.`);
                        }}
                      >
                        Accept Order
                      </Button>
                    </div>
                  )}

                  {order.status === 'accepted' && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] text-[#2E8C9F] font-semibold flex items-center justify-between">
                        <span>✓ Order accepted · Ready to prepare</span>
                        <span className="text-[10px] text-[#6B7280]">Notify buyer of progress</span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => {
                          farmerUpdateOrderStatus(
                            order._id,
                            'preparing',
                            'Harvesting fresh produce from field and preparing crates'
                          );
                          setStatusUpdatingOrderId(order._id);
                          showToast('Preparation started! Buyer notified.');
                        }}
                      >
                        Start Harvesting & Update Buyer →
                      </Button>
                    </div>
                  )}

                  {order.status === 'preparing' && (
                    <div className="space-y-2 pt-1">
                      <div className="bg-[#EEF8FA] p-2 rounded-xl text-xs space-y-1">
                        <div className="text-[11px] text-[#19768A] font-bold flex items-center justify-between">
                          <span>🌱 Preparation in progress</span>
                          <span className="text-[10px] text-[#6B7280]">Live for buyer</span>
                        </div>
                        <p className="text-[11px] text-[#374151]">
                          {order.preparationNote || 'Harvesting, quality sorting and packing into wooden crates.'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => setStatusUpdatingOrderId(order._id)}
                        >
                          Update Progress Note
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            farmerUpdateOrderStatus(
                              order._id,
                              'ready_for_pickup',
                              isPickupOrder
                                ? `Packed and ready for buyer pickup at ${order.farmerName}'s farm gate!`
                                : 'Weighed, labeled & packed into crates. Ready for Logistics Driver to collect.'
                            );
                            showToast(
                              isPickupOrder
                                ? 'Marked ready! Buyer notified to pick up at farm.'
                                : 'Marked ready! Available for logistics driver pickup.'
                            );
                          }}
                        >
                          {isPickupOrder ? 'Mark Ready for Pickup' : 'Mark Ready for Driver'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {order.status === 'ready_for_pickup' && (
                    <div className="space-y-2 pt-1">
                      <div className="bg-[#FEF8EA] border border-[#FCE7C2] p-2.5 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-[#B45309] flex items-center justify-between">
                          <span>
                            {isPickupOrder
                              ? '🎉 Harvest Ready for Buyer Pickup'
                              : '📦 Ready at Farm Gate for Logistics Driver'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#854D0E]">
                          {isPickupOrder
                            ? `Waiting for buyer ${order.buyerName} to arrive at farm gate. Verify PIN: #${order.pickupPin || '4821'}.`
                            : 'Crates weighed and stacked at farm dispatch gate. Visible to logistics fleet drivers for route collection.'}
                        </p>
                      </div>

                      {isPickupOrder ? (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => {
                            farmerConfirmPickupHandover(order._id);
                            showToast(`Harvest handed over to buyer ${order.buyerName}!`);
                          }}
                        >
                          Confirm Handover to Buyer (Finish)
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between text-xs text-[#6B7280] px-1">
                          <span>Awaiting driver collection...</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              farmerUpdateOrderStatus(
                                order._id,
                                'ready_for_pickup',
                                'Farmer reaffirmed crates ready at dispatch gate'
                              );
                              showToast('Fleet dispatch alerted.');
                            }}
                          >
                            Re-Ping Drivers
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {order.status === 'out_for_delivery' && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs bg-[#EEF8FA] p-2.5 rounded-xl text-[#19768A] border border-[#D0EEF5]">
                        <div>
                          <div className="font-bold">Collected by Driver {order.driverName}</div>
                          <div className="text-[10px] text-[#528796]">
                            Vehicle: {order.driverVehicle || 'Logistics Truck'} · In transit to {order.deliveryDistrict}
                          </div>
                        </div>
                        {order.driverPhone && (
                          <a
                            href={`tel:${order.driverPhone}`}
                            className="p-1.5 bg-white text-[#19768A] rounded-lg border border-[#D0EEF5] text-xs font-bold hover:bg-[#E6F2E8] flex items-center gap-1 shadow-2xs"
                            title="Call driver"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        )}
                      </div>
                      <div className="text-[10px] text-[#6B7280] text-center">
                        Delivery in transit. You will be notified immediately upon doorstep handover.
                      </div>
                    </div>
                  )}

                  {order.status === 'delivered' && (
                    <div className="p-2.5 bg-[#E6F2E8] border border-[#CDE5D2] rounded-xl text-xs space-y-1">
                      <div className="text-[#1F5C3A] font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivery Completed & Payment Settled</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#4B6B56]">
                          {order.deliveredAt || 'Recently'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#4B6B56]">
                        {isPickupOrder
                          ? `Buyer ${order.buyerName} collected fresh harvest directly at farm gate.`
                          : `Delivered by Driver ${order.deliveredBy || order.driverName || 'Fleet Partner'} to ${order.deliveryAddress}.`}
                      </div>
                      {order.deliveryProofNote && (
                        <div className="text-[10px] text-[#6B7280] italic">
                          Proof: {order.deliveryProofNote}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Reject Order BottomSheet */}
      <BottomSheet
        isOpen={!!rejectingOrderId}
        onClose={() => setRejectingOrderId(null)}
        title="Decline Harvest Order"
      >
        <div className="space-y-4 text-left pb-4">
          <p className="text-xs text-[#6B7280]">
            Please select the reason for declining. The buyer will be notified immediately:
          </p>

          <div className="space-y-2">
            {[
              'Insufficient harvest volume due to weather/rain',
              'Requested quantity already reserved for existing batch',
              'Produce requires 3 more days before optimal harvest brix',
              'Logistics corridor currently inaccessible',
            ].map(reason => (
              <label
                key={reason}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs ${
                  rejectReason === reason
                    ? 'border-[#C8452D] bg-[#FDEEEB] text-[#C8452D] font-bold'
                    : 'border-[#E5E5E5] bg-white text-[#1A1A1A]'
                }`}
              >
                <input
                  type="radio"
                  name="reject_reason"
                  checked={rejectReason === reason}
                  onChange={() => setRejectReason(reason)}
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setRejectingOrderId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleConfirmReject}
            >
              Confirm Decline
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Milestone Update BottomSheet */}
      {(() => {
        const activeUpdatingOrder = orders.find(o => o._id === statusUpdatingOrderId);
        const isSelfPickup = activeUpdatingOrder?.deliveryType === 'pickup';

        return (
          <BottomSheet
            isOpen={!!statusUpdatingOrderId}
            onClose={() => {
              setStatusUpdatingOrderId(null);
              setCustomPrepNote('');
            }}
            title="Update Harvest Process & Notify Buyer"
            footer={
              <div className="flex gap-2.5">
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1 text-xs"
                  onClick={() => {
                    if (statusUpdatingOrderId) {
                      const noteToSave = customPrepNote.trim() || 'Harvesting & packing in progress';
                      farmerUpdateOrderStatus(statusUpdatingOrderId, 'preparing', noteToSave);
                      setStatusUpdatingOrderId(null);
                      setCustomPrepNote('');
                      showToast('Live tracking updated for buyer!');
                    }
                  }}
                >
                  Save Progress
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  className="flex-1 text-xs font-bold"
                  onClick={() => {
                    if (statusUpdatingOrderId) {
                      farmerUpdateOrderStatus(
                        statusUpdatingOrderId,
                        'ready_for_pickup',
                        isSelfPickup
                          ? `Harvest is packed and ready for buyer pickup at the farm gate! Bring Order PIN.`
                          : 'Crates weighed, labeled & stacked at farm dispatch gate. Ready for Logistics Driver collection.'
                      );
                      setStatusUpdatingOrderId(null);
                      setCustomPrepNote('');
                      showToast(
                        isSelfPickup
                          ? 'Marked Ready! Buyer notified for farm gate collection.'
                          : 'Marked Ready! Available to logistics fleet drivers.'
                      );
                    }
                  }}
                >
                  {isSelfPickup ? 'Ready for Pickup →' : 'Ready for Driver →'}
                </Button>
              </div>
            }
          >
            <div className="space-y-3.5 text-left pb-2">
              {activeUpdatingOrder && (
                <div className="bg-[#F6F7F5] p-2.5 rounded-xl border border-[#E5E5E5] text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#1A1A1A]">
                      Order {activeUpdatingOrder.orderNumber} · {activeUpdatingOrder.buyerName}
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      {activeUpdatingOrder.items.map(i => `${i.cropName} (${i.quantityKg}kg)`).join(', ')}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isSelfPickup ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isSelfPickup ? 'Farm Pickup' : 'Fleet Delivery'}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[11px] font-bold text-[#374151] block mb-1.5">
                  Select Current Milestone:
                </span>

                {/* Compact 2x2 Grid for Milestones */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'harvesting',
                      emoji: '🌱',
                      title: '1. Harvesting',
                      desc: 'Picking morning yield in field',
                      fullText: 'Harvesting fresh produce from field right now in prime morning quality',
                    },
                    {
                      id: 'sorting',
                      emoji: '🧼',
                      title: '2. Sorting Grade A',
                      desc: 'Root washing & wholesale sorting',
                      fullText: 'Washing, root trimming, and sorting produce for Grade A quality',
                    },
                    {
                      id: 'packing',
                      emoji: '📦',
                      title: '3. Crate Packing',
                      desc: 'Packed in ventilated wooden crates',
                      fullText: 'Weighed and packed into ventilated wooden crates with cushioning',
                    },
                    {
                      id: 'ready',
                      emoji: '⚖️',
                      title: '4. Dispatch Gate',
                      desc: 'Labeled & awaiting collection',
                      fullText: 'Crates stacked and labeled with Order ID. Awaiting collection',
                    },
                  ].map(step => {
                    const isSelected =
                      customPrepNote.toLowerCase().includes(step.title.toLowerCase().slice(3)) ||
                      customPrepNote === step.fullText;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => {
                          setCustomPrepNote(step.fullText);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#1F5C3A] bg-[#E6F2E8] shadow-xs ring-1 ring-[#1F5C3A]'
                            : 'border-[#E5E5E5] bg-white hover:bg-[#F9FAF8] hover:border-[#1F5C3A]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base">{step.emoji}</span>
                          {isSelected && (
                            <span className="text-[10px] text-[#1F5C3A] font-extrabold">✓ Active</span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-[#1A1A1A] leading-tight">{step.title}</div>
                        <div className="text-[10px] text-[#6B7280] mt-0.5 leading-snug line-clamp-1">
                          {step.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Note Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#1A1A1A]">
                    Message on Buyer's Live Tracker
                  </label>
                  <span className="text-[10px] text-[#6B7280]">Live preview</span>
                </div>
                <textarea
                  value={customPrepNote}
                  onChange={e => setCustomPrepNote(e.target.value)}
                  placeholder="e.g. Packing 50kg carrots into 2 crates. Quality looks exceptional today!"
                  rows={2}
                  className="w-full p-2.5 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/20"
                />
              </div>
            </div>
          </BottomSheet>
        );
      })()}

      {/* Reusable Photo Management Modal */}
      <PhotoManagerModal
        listing={activeListing}
        isOpen={!!managingListingId}
        onClose={() => setManagingListingId(null)}
        onToast={showToast}
      />
    </div>
  );
};

// ===================== 2. FARMER LISTINGS SCREEN =====================
export const FarmerListingScreen: React.FC = () => {
  const {
    listings,
    currentUser,
    goToSubScreen,
    updateListingStatus,
    deleteListingPhoto,
    addListingPhoto,
    deleteListing,
    users,
    loginAsUser,
  } = useApp();

  // Active farmer profile
  const currentFarmerId = currentUser?.role === 'farmer' ? currentUser._id : 'user_farmer_1';
  const currentFarmer = users.find(u => u._id === currentFarmerId) || currentUser;

  // STRICTLY filter listings belonging to this specific farmer
  const myListings = listings.filter(
    l => l.farmerId === currentFarmerId || (currentUser?.phone && l.farmerPhone === currentUser.phone)
  );

  // Active Photo Management Modal State
  const [managingListingId, setManagingListingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const activeListing = listings.find(l => l._id === managingListingId) || null;

  // Handle direct file upload from device or camera
  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>, listingId: string, cropName: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        addListingPhoto(listingId, result);
        showToast(`Harvest photo uploaded for ${cropName}!`);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleDeletePhoto = (listingId: string, index: number, cropName: string) => {
    deleteListingPhoto(listingId, index);
    showToast(`Photo removed from ${cropName}.`);
  };

  // Farmer Profiles for Demo Switching
  const farmerProfiles = users.filter(u => u.role === 'farmer');

  return (
    <div className="space-y-4 px-4 pt-2 pb-24 text-left max-w-lg mx-auto animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1F5C3A] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">My Published Harvest</h2>
          <p className="text-xs text-[#6B7280]">
            Manage crops, upload and delete images for your listings
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => goToSubScreen('add_listing')}
        >
          Add Crop
        </Button>
      </div>

      {/* Active Farmer Indicator & Switcher */}
      <div className="bg-[#E6F2E8] border border-[#CDE5D2] rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={currentFarmer?.name || 'Farmer'} size="sm" role="farmer" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h4 className="text-xs font-bold text-[#1F5C3A] truncate">
                {currentFarmer?.name}
              </h4>
              <ShieldCheck className="w-3.5 h-3.5 text-[#1F5C3A] shrink-0" />
            </div>
            <p className="text-[10px] text-[#4B6B56] truncate">
              {currentFarmer?.farmName || 'Direct Producer'} · {myListings.length} Active Listings
            </p>
          </div>
        </div>

        {farmerProfiles.length > 1 && (
          <div className="shrink-0 flex items-center gap-1">
            <span className="text-[9px] font-bold text-[#4B6B56] uppercase hidden sm:inline">Farmer:</span>
            <select
              value={currentFarmerId}
              onChange={e => loginAsUser(e.target.value)}
              className="text-[10px] font-bold text-[#1F5C3A] bg-white border border-[#CDE5D2] rounded-lg px-2 py-1 shadow-2xs cursor-pointer focus:outline-none"
              title="Switch active farmer"
            >
              {farmerProfiles.map(f => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.location?.town || f.location?.district})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Listings List */}
      <div className="space-y-3">
        {myListings.length === 0 ? (
          <EmptyState
            title="No listings for this farmer yet"
            description="You currently have no crops published under this farmer account. Tap 'Add Crop' to list your first harvest batch."
            actionLabel="Add First Crop"
            onAction={() => goToSubScreen('add_listing')}
          />
        ) : (
          myListings.map(listing => {
            const hasPhotos = listing.photos && listing.photos.length > 0;
            const photoCount = hasPhotos ? listing.photos.length : 0;

            return (
              <Card key={listing._id} variant="default" padding="md" className="space-y-3.5">
                {/* Crop Header */}
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#F6F7F5] flex items-center justify-center border border-[#E5E5E5]">
                    {hasPhotos && (listing.photos[0].startsWith('data:image') || listing.photos[0].startsWith('http')) ? (
                      <img
                        src={listing.photos[0]}
                        alt={listing.cropName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ProduceVisual type={listing.cropName} size="sm" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#1A1A1A] truncate">
                        {listing.cropName}
                      </h4>
                      <StatusPill
                        status={listing.status === 'active' ? 'active' : 'out_of_stock'}
                      />
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      {listing.category} · {listing.location.town}, {listing.location.district}
                    </p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-sm font-black text-[#1F5C3A]">
                        LKR {listing.pricePerKg}
                      </span>
                      <span className="text-[10px] text-[#6B7280]">/ kg</span>
                      <span className="text-xs text-[#6B7280] ml-3">
                        Stock: <strong className="text-[#1A1A1A]">{listing.quantityKg} kg</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* IMAGE UPLOAD & DELETION GALLERY AREA */}
                <div className="p-3 bg-[#F9FAF8] rounded-xl border border-[#E5E5E5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5 text-[#1F5C3A]" />
                      <span>Item Photos ({photoCount})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setManagingListingId(listing._id)}
                      className="text-[11px] font-bold text-[#1F5C3A] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Manage & Upload
                    </button>
                  </div>

                  {/* Thumbnail Row with Direct Delete Buttons */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                    {hasPhotos ? (
                      listing.photos.map((photo, idx) => {
                        const isRealImage = photo.startsWith('data:image') || photo.startsWith('http');
                        return (
                          <div
                            key={idx}
                            className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#E5E5E5] bg-white group shadow-2xs"
                          >
                            {isRealImage ? (
                              <img
                                src={photo}
                                alt={`Crop photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center p-1">
                                <ProduceVisual type={listing.cropName} size="sm" />
                              </div>
                            )}

                            {/* DELETE BUTTON ON EACH IMAGE */}
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(listing._id, idx, listing.cropName)}
                              className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-xs transition-transform active:scale-90 cursor-pointer z-10"
                              title="Delete this image"
                              aria-label="Delete image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>

                            {/* Primary badge for first photo */}
                            {idx === 0 && (
                              <span className="absolute bottom-0 inset-x-0 bg-[#1F5C3A]/85 text-white text-[8px] font-bold text-center py-0.2">
                                Cover
                              </span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-[11px] text-[#6B7280] py-1 italic">
                        No custom photos uploaded yet. Tap "+ Upload" to add real photos of this crop.
                      </div>
                    )}

                    {/* Direct Upload File Input on Card */}
                    <label className="w-16 h-16 rounded-xl border-2 border-dashed border-[#1F5C3A]/40 hover:border-[#1F5C3A] bg-white flex flex-col items-center justify-center text-[#1F5C3A] cursor-pointer shrink-0 transition-colors shadow-2xs">
                      <Camera className="w-4 h-4 mb-0.5" />
                      <span className="text-[9px] font-bold">+ Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleDirectFileUpload(e, listing._id, listing.cropName)}
                      />
                    </label>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-[#F0F0EE] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#6B7280]">
                    Harvested: {listing.harvestDate}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateListingStatus(
                          listing._id,
                          listing.status === 'active' ? 'out_of_stock' : 'active'
                        )
                      }
                      className="text-xs font-semibold text-[#1F5C3A] hover:underline cursor-pointer"
                    >
                      {listing.status === 'active' ? 'Mark Out of Stock' : 'Reactivate'}
                    </button>
                    <span className="text-[#D1D5DB]">·</span>
                    <button
                      type="button"
                      onClick={() => setManagingListingId(listing._id)}
                      className="text-xs font-bold text-[#1F5C3A] hover:underline cursor-pointer"
                    >
                      Photo Manager
                    </button>
                    <span className="text-[#D1D5DB]">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        deleteListing(listing._id);
                        showToast(`Listing ${listing.cropName} deleted`);
                      }}
                      className="text-xs font-semibold text-[#DC2626] hover:underline cursor-pointer"
                      title="Delete entire listing"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* DEDICATED PHOTO MANAGEMENT BOTTOM SHEET */}
      <PhotoManagerModal
        listing={activeListing}
        isOpen={!!managingListingId}
        onClose={() => setManagingListingId(null)}
        onToast={showToast}
      />
    </div>
  );
};

// ===================== 3. FARMER ADD LISTING SCREEN =====================
export const FarmerAddListingScreen: React.FC = () => {
  const { addListing, goBack, currentUser } = useApp();
  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState<'Vegetables' | 'Fruits' | 'Spices & Herbs' | 'Grains & Rice' | 'Tubers'>('Vegetables');
  const [quantityKg, setQuantityKg] = useState('200');
  const [minOrderKg, setMinOrderKg] = useState('10');
  const [pricePerKg, setPricePerKg] = useState('280');
  const [harvestDate, setHarvestDate] = useState('2026-10-06');
  const [district, setDistrict] = useState(currentUser?.location?.district || 'Nuwara Eliya');
  const [town, setTown] = useState(currentUser?.location?.town || 'Kandapola');
  const [isOrganic, setIsOrganic] = useState(true);
  const [description, setDescription] = useState('Freshly harvested grade A organic produce picked in morning mountain mist.');
  
  // Staged Photos for the new listing (with upload and delete support)
  const [stagedPhotos, setStagedPhotos] = useState<string[]>([]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setStagedPhotos(prev => [...prev, result]);
        showToast('Photo added!');
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleDeleteStagedPhoto = (index: number) => {
    setStagedPhotos(prev => prev.filter((_, idx) => idx !== index));
    showToast('Photo removed.');
  };

  const handleAddPresetPhoto = (url: string) => {
    setStagedPhotos(prev => [...prev, url]);
    showToast('Preset photo added!');
  };

  const handleAddUrl = () => {
    if (!customPhotoUrl.trim()) return;
    setStagedPhotos(prev => [...prev, customPhotoUrl.trim()]);
    setCustomPhotoUrl('');
    showToast('Photo URL added!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim()) return;

    // Use staged photos or fallback to cropName keyword
    const finalPhotos = stagedPhotos.length > 0 ? stagedPhotos : [cropName.toLowerCase()];

    addListing({
      cropName,
      category,
      quantityKg: Number(quantityKg) || 100,
      minOrderKg: Number(minOrderKg) || 5,
      pricePerKg: Number(pricePerKg) || 200,
      harvestDate,
      photos: finalPhotos,
      description,
      status: 'active',
      location: {
        lat: currentUser?.location?.lat || 6.9697,
        lng: currentUser?.location?.lng || 80.7891,
        district,
        town,
      },
      isOrganic,
    });

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="p-6 text-center space-y-4 max-w-md mx-auto my-auto animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-[#E6F2E8] text-[#1F5C3A] flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">Crop Listing Published!</h2>
        <p className="text-xs text-[#6B7280]">
          Your crop <strong>{cropName}</strong> with <strong>{stagedPhotos.length} photo(s)</strong> is now live on Goviya. Buyers across Sri Lanka can search, order, and dispatch drivers directly.
        </p>
        <Button variant="primary" fullWidth size="lg" onClick={goBack}>
          Back to My Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-20 text-left max-w-lg mx-auto animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1F5C3A] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-[#1A1A1A]">Publish Crop Listing</h2>
        <p className="text-xs text-[#6B7280]">
          List harvest batch with uploaded photos for direct wholesale and commercial buyers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PHOTO UPLOAD & DELETE SECTION */}
        <Card variant="default" padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#1F5C3A]" />
              <span>Harvest Photos ({stagedPhotos.length})</span>
            </label>
            <span className="text-[10px] text-[#6B7280]">Upload or delete images</span>
          </div>

          {/* Staged Photos Preview with Delete Button on Each */}
          {stagedPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {stagedPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden border border-[#E5E5E5] bg-white h-20 shadow-2xs group"
                >
                  <img
                    src={photo}
                    alt={`Staged photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteStagedPhoto(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md shadow-xs hover:bg-red-700 cursor-pointer"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.2">
                    {idx === 0 ? 'Cover' : `#${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-2">
            <label className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#E6F2E8] border border-[#CDE5D2] rounded-xl text-xs font-bold text-[#1F5C3A] hover:bg-[#D4EBD8] transition-colors cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5" />
              <span>+ Upload Photo from Device</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Sample Preset Photos */}
          <div className="pt-2 border-t border-[#F0F0EE]">
            <span className="text-[10px] font-bold text-[#6B7280] block mb-1.5">
              Or Choose Quick Produce Presets:
            </span>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { label: '🥕 Carrots', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=600&auto=format&fit=crop&q=80' },
                { label: '🧅 Onions', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80' },
                { label: '🍅 Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
                { label: '🥬 Leeks', url: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&auto=format&fit=crop&q=80' },
                { label: '🍆 Brinjal', url: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=600&auto=format&fit=crop&q=80' },
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleAddPresetPhoto(p.url)}
                  className="px-2 py-1 rounded-lg bg-white border border-[#E5E5E5] text-[10px] font-semibold text-[#1A1A1A] shrink-0 hover:border-[#1F5C3A] cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Listing Details */}
        <Card variant="default" padding="md" className="space-y-3">
          <Input
            label="Crop Name"
            value={cropName}
            onChange={e => setCropName(e.target.value)}
            placeholder="e.g. Nuwara Eliya Fresh Carrots"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5 uppercase tracking-wider">
              Produce Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full h-11 px-3 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1A1A1A]"
            >
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Spices & Herbs">Spices & Herbs</option>
              <option value="Grains & Rice">Grains & Rice</option>
              <option value="Tubers">Tubers</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Available Stock (KG)"
              type="number"
              value={quantityKg}
              onChange={e => setQuantityKg(e.target.value)}
              required
            />
            <Input
              label="Min Order (KG)"
              type="number"
              value={minOrderKg}
              onChange={e => setMinOrderKg(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price Per KG (LKR)"
              type="number"
              value={pricePerKg}
              onChange={e => setPricePerKg(e.target.value)}
              required
            />
            <Input
              label="Harvest Date"
              type="date"
              value={harvestDate}
              onChange={e => setHarvestDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="District"
              value={district}
              onChange={e => setDistrict(e.target.value)}
              placeholder="e.g. Nuwara Eliya"
            />
            <Input
              label="Town / Village"
              value={town}
              onChange={e => setTown(e.target.value)}
              placeholder="e.g. Kandapola"
            />
          </div>

          <label className="flex items-center gap-3 p-3 bg-[#F6F7F5] rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={isOrganic}
              onChange={e => setIsOrganic(e.target.checked)}
              className="w-4 h-4 rounded text-[#1F5C3A] focus:ring-[#1F5C3A]"
            />
            <div>
              <div className="text-xs font-bold text-[#1A1A1A]">100% Organic Grown</div>
              <div className="text-[11px] text-[#6B7280]">
                Cultivated without synthetic fertilizers or chemical pesticides
              </div>
            </div>
          </label>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5 uppercase tracking-wider">
              Batch Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A]"
              placeholder="Describe soil moisture, variety, washing method..."
            />
          </div>
        </Card>

        <Button type="submit" variant="primary" size="lg" fullWidth>
          Publish to Goviya Network
        </Button>
      </form>
    </div>
  );
};

// ===================== 4. FARMER MARKET PRICE INDEX SCREEN =====================
export const FarmerMarketPriceScreen: React.FC = () => {
  const { marketPrices } = useApp();
  const [selectedCrop, setSelectedCrop] = useState(marketPrices[0]);

  return (
    <div className="space-y-4 px-4 pt-2 pb-24 text-left">
      <div>
        <h2 className="text-lg font-bold text-[#1A1A1A]">Live Market Price Index</h2>
        <p className="text-xs text-[#6B7280]">
          Wholesale prices verified at Dambulla & Pettah Economic Centres
        </p>
      </div>

      {/* Selected Crop 6-Month Trend Chart */}
      <Card variant="mint" padding="md" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#4B6B56] font-bold uppercase">
              Price Benchmark
            </span>
            <h3 className="text-base font-bold text-[#1A1A1A]">
              {selectedCrop.crop} ({selectedCrop.sinhalaName})
            </h3>
            <p className="text-[11px] text-[#6B7280]">{selectedCrop.marketName}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-[#1F5C3A]">
              LKR {selectedCrop.wholesaleMaxLkr}
            </div>
            <div className="flex items-center justify-end gap-1 text-[11px] font-bold">
              {selectedCrop.trend === 'up' ? (
                <span className="text-[#1F5C3A] flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{selectedCrop.changePercentage}%
                </span>
              ) : selectedCrop.trend === 'down' ? (
                <span className="text-[#C8452D] flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5" /> {selectedCrop.changePercentage}%
                </span>
              ) : (
                <span className="text-[#6B7280]">Stable</span>
              )}
            </div>
          </div>
        </div>

        {/* 6-Month Bar Chart */}
        <div className="pt-2">
          <div className="text-[10px] text-[#6B7280] font-semibold mb-2">
            6-Month Wholesale Trend (LKR / KG)
          </div>
          <div className="flex items-end justify-between h-28 gap-2 bg-white/70 p-3 rounded-xl border border-[#D5EAD8]">
            {selectedCrop.history6Months.map(h => {
              const maxVal = Math.max(...selectedCrop.history6Months.map(x => x.price));
              const heightPct = Math.round((h.price / maxVal) * 100);

              return (
                <div key={h.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[9px] font-bold text-[#1F5C3A]">{h.price}</span>
                  <div
                    style={{ height: `${heightPct * 0.7}%` }}
                    className="w-full bg-[#1F5C3A] rounded-t-md hover:bg-[#2D7A4D] transition-all"
                  />
                  <span className="text-[10px] text-[#6B7280] font-medium">{h.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Market Prices List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
          All Economic Centre Crops
        </h3>

        {marketPrices.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedCrop(item)}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              selectedCrop.id === item.id
                ? 'border-[#1F5C3A] bg-[#E6F2E8]'
                : 'border-[#E5E5E5] bg-white hover:bg-[#F6F7F5]'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A1A1A]">{item.crop}</span>
                <span className="text-[11px] text-[#6B7280]">({item.sinhalaName})</span>
              </div>
              <div className="text-[10px] text-[#6B7280]">{item.marketName}</div>
            </div>

            <div className="text-right">
              <div className="text-xs font-extrabold text-[#1A1A1A]">
                LKR {item.wholesaleMinLkr} - {item.wholesaleMaxLkr}
              </div>
              <div className="text-[10px] text-[#6B7280]">Retail: ~LKR {item.retailAvgLkr}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================== 5. FARMER PROFILE SCREEN =====================
export const FarmerProfileScreen: React.FC = () => {
  const { currentUser, logout } = useApp();

  return (
    <div className="p-4 space-y-4 pb-20 text-left">
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-[#E5E5E5]">
        <Avatar name={currentUser?.name || 'Farmer'} size="lg" role="farmer" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-bold text-[#1A1A1A] truncate">{currentUser?.name}</h3>
            {currentUser?.verified && (
              <ShieldCheck className="w-4 h-4 text-[#1F5C3A] shrink-0" />
            )}
          </div>
          <p className="text-xs text-[#6B7280]">{currentUser?.farmName}</p>
          <span className="inline-block mt-1 text-[10px] font-semibold text-[#B45309] bg-[#FEF8EA] px-2 py-0.5 rounded-full">
            Agrarian Services Registered Producer
          </span>
        </div>
      </div>

      <Card variant="default" padding="md" className="space-y-3">
        <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
          Farm Holding Credentials
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-[#F0F0EE]">
            <span className="text-[#6B7280]">NIC Number:</span>
            <span className="font-semibold text-[#1A1A1A]">{currentUser?.nicNumber || '197412803450'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F0F0EE]">
            <span className="text-[#6B7280]">Holding Size:</span>
            <span className="font-semibold text-[#1A1A1A]">{currentUser?.farmSizeAcres || 4.5} Acres</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F0F0EE]">
            <span className="text-[#6B7280]">Bank Settlement:</span>
            <span className="font-semibold text-[#1A1A1A]">Bank of Ceylon · Kandapola Branch</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F0F0EE]">
            <span className="text-[#6B7280]">Farmer Rating:</span>
            <span className="font-semibold text-[#1F5C3A]">4.9 ★ (128 reviews)</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#F0F0EE]">
          <Button variant="destructive" fullWidth size="md" onClick={logout}>
            Log Out of Farmer Studio
          </Button>
        </div>
      </Card>
    </div>
  );
};

export { FarmerOrdersScreen } from './FarmerOrdersScreen';
