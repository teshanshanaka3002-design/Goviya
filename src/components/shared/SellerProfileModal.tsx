import React from 'react';
import {
  ShieldCheck,
  MapPin,
  Star,
  MessageSquare,
  Phone,
  Plus,
  Check,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../services/store';
import { BottomSheet } from '../ui/BottomSheet';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { ProduceVisual } from '../ui/ProduceVisual';
import { Listing } from '../../types';

interface SellerProfileModalProps {
  farmerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  initialCropName?: string;
}

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({
  farmerId,
  isOpen,
  onClose,
  initialCropName,
}) => {
  const { users, listings, addToCart, cart, getOrCreateConversation, goToSubScreen } = useApp();
  const [addedListingIds, setAddedListingIds] = React.useState<Record<string, boolean>>({});

  if (!farmerId) return null;

  // Find farmer from users list or create a fallback from listings
  const farmerUser = users.find(u => u._id === farmerId && u.role === 'farmer');
  const farmerListings = listings.filter(
    l => l.farmerId === farmerId && (l.status === 'active' || l.status === 'out_of_stock')
  );

  const farmerName = farmerUser?.name || farmerListings[0]?.farmerName || 'Verified Producer';
  const farmName = farmerUser?.farmName || `${farmerName}'s Organic Agro Holdings`;
  const farmTown = farmerUser?.location?.town || farmerListings[0]?.location?.town || 'Nuwara Eliya';
  const farmDistrict = farmerUser?.location?.district || farmerListings[0]?.location?.district || 'Central';
  const farmAddress = farmerUser?.location?.address || `${farmTown}, ${farmDistrict} Province, Sri Lanka`;
  const farmPhone = farmerUser?.phone || farmerListings[0]?.farmerPhone || '+94 77 123 4567';
  const rating = farmerUser?.rating || farmerListings[0]?.farmerRating || 4.9;
  const farmSize = farmerUser?.farmSizeAcres || 3.5;

  const handleChatWithSeller = () => {
    onClose();
    const primaryCrop = initialCropName || farmerListings[0]?.cropName || 'Fresh Harvest';
    const convId = getOrCreateConversation(farmerId, farmerName, primaryCrop, 'farmer');
    goToSubScreen('chat_detail', { conversationId: convId });
  };

  const handleAddToCart = (listing: Listing) => {
    addToCart(listing, listing.minOrderKg || 5);
    setAddedListingIds(prev => ({ ...prev, [listing._id]: true }));
    setTimeout(() => {
      setAddedListingIds(prev => ({ ...prev, [listing._id]: false }));
    }, 1500);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Seller & Farm Profile">
      <div className="space-y-4 text-left pb-6 max-h-[80vh] overflow-y-auto">
        {/* Top Seller Card */}
        <div className="bg-[#E6F2E8] border border-[#CDE5D2] rounded-2xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar name={farmerName} size="lg" role="farmer" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-extrabold text-[#1A1A1A] leading-snug">
                    {farmName}
                  </h3>
                  <span title="Agrarian Verified Producer">
                    <ShieldCheck className="w-4 h-4 text-[#1F5C3A] shrink-0" />
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#1F5C3A] mt-0.5">
                  Producer: {farmerName}
                </p>
                <p className="text-xs text-[#4B6B56] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1F5C3A] shrink-0" />
                  <span>{farmTown}, {farmDistrict}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white/90 text-[#B45309] px-2.5 py-1 rounded-full text-xs font-black shadow-2xs shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#CDE5D2]/70 text-center">
            <div className="bg-white/80 p-2 rounded-xl">
              <span className="text-[9px] uppercase font-bold text-[#4B6B56] block">Farm Size</span>
              <span className="text-xs font-black text-[#1F5C3A]">{farmSize} Acres</span>
            </div>
            <div className="bg-white/80 p-2 rounded-xl">
              <span className="text-[9px] uppercase font-bold text-[#4B6B56] block">Active Crops</span>
              <span className="text-xs font-black text-[#1F5C3A]">{farmerListings.length} Listed</span>
            </div>
            <div className="bg-white/80 p-2 rounded-xl">
              <span className="text-[9px] uppercase font-bold text-[#4B6B56] block">Verification</span>
              <span className="text-xs font-black text-[#1F5C3A]">100% GAP</span>
            </div>
          </div>

          {/* MAIN ACTIONS: CHAT WITH SELLER & CALL */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="primary"
              size="md"
              className="flex-1 shadow-sm"
              leftIcon={<MessageSquare className="w-4 h-4" />}
              onClick={handleChatWithSeller}
            >
              Chat with Seller
            </Button>
            <a
              href={`tel:${farmPhone}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-[#CDE5D2] hover:bg-[#F3F4F6] text-[#1F5C3A] font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="Call Farm Direct"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>
        </div>

        {/* Farm Bio & Guarantees */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-3.5 space-y-2">
          <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1F5C3A]" />
            <span>Farm Credentials & Harvest Guarantee</span>
          </h4>
          <p className="text-xs text-[#4B5563] leading-relaxed">
            Registered smallholder farming holding with zero middleman markup. All crops are harvested at early dawn upon order receipt, graded for wholesale quality, and packed directly into ventilated agrarian crates for dispatch.
          </p>

          <div className="pt-2 border-t border-[#F0F0EE] flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Farm Gate Pickup:</span>
            <span className="font-semibold text-[#1A1A1A] text-right truncate max-w-[200px]">
              {farmAddress}
            </span>
          </div>
        </div>

        {/* Harvest Produce Catalog from this Seller */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              Available Crops from {farmerName} ({farmerListings.length})
            </h4>
            <span className="text-[10px] text-[#6B7280]">Direct from harvest</span>
          </div>

          {farmerListings.length === 0 ? (
            <div className="text-center py-6 bg-[#F9FAF8] rounded-2xl border border-dashed border-[#E5E5E5] text-xs text-[#6B7280]">
              This seller currently has no active harvest listings available.
            </div>
          ) : (
            <div className="space-y-2">
              {farmerListings.map(listing => {
                const isAdded = addedListingIds[listing._id];
                const inCart = cart.some(c => c.listing._id === listing._id);
                const hasPhoto =
                  listing.photos &&
                  listing.photos.length > 0 &&
                  (listing.photos[0].startsWith('data:image') || listing.photos[0].startsWith('http'));

                return (
                  <div
                    key={listing._id}
                    className="p-3 bg-white rounded-2xl border border-[#E5E5E5] flex items-center justify-between gap-3 shadow-2xs hover:border-[#1F5C3A]/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F6F7F5] shrink-0 border border-[#E5E5E5] flex items-center justify-center">
                        {hasPhoto ? (
                          <img
                            src={listing.photos[0]}
                            alt={listing.cropName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ProduceVisual type={listing.cropName} size="sm" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-[#1A1A1A] truncate">
                          {listing.cropName}
                        </h5>
                        <p className="text-[10px] text-[#6B7280]">
                          Stock: {listing.quantityKg} kg · Min: {listing.minOrderKg} kg
                        </p>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xs font-extrabold text-[#1F5C3A]">
                            LKR {listing.pricePerKg.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-[#9CA3AF]">/ kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          goToSubScreen('product_detail', { listingId: listing._id });
                        }}
                        className="px-2.5 py-1.5 text-[10px] font-bold text-[#4B6B56] hover:bg-[#F3F4F6] rounded-xl transition-colors cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(listing)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-[#1F5C3A] text-white'
                            : inCart
                            ? 'bg-[#E6F2E8] text-[#1F5C3A]'
                            : 'bg-[#1F5C3A] text-white hover:bg-[#16452B] active:scale-95'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : inCart ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Secondary Chat Banner */}
        <div className="p-3 bg-[#EEF8FA] border border-[#D0EEF5] rounded-2xl flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-[#19768A]">Need a custom harvest order?</div>
            <p className="text-[10px] text-[#528796]">
              Negotiate crate sizes, harvest dates, or wholesale discounts directly with {farmerName}.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleChatWithSeller}
            leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
          >
            Chat
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
