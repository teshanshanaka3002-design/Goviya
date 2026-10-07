import React from 'react';
import { MapPin, Star, Plus, Check } from 'lucide-react';
import { Listing } from '../../types';
import { ProduceVisual } from '../ui/ProduceVisual';
import { Card } from '../ui/Card';
import { useApp } from '../../services/store';
import { SellerProfileModal } from './SellerProfileModal';

export interface ProductCardProps {
  listing: Listing;
  onSelect?: () => void;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  listing,
  onSelect,
  compact = false,
}) => {
  const { addToCart, cart, goToSubScreen } = useApp();
  const [justAdded, setJustAdded] = React.useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = React.useState(false);

  const isInCart = cart.some(item => item.listing._id === listing._id);

  const handleOpenSeller = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSellerModalOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(listing, listing.minOrderKg || 5);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect();
    } else {
      goToSubScreen('product_detail', { listingId: listing._id });
    }
  };

  if (compact) {
    const hasPhoto = listing.photos && listing.photos.length > 0 && (listing.photos[0].startsWith('data:image') || listing.photos[0].startsWith('http'));
    return (
      <Card
        variant="interactive"
        padding="sm"
        onClick={handleClick}
        className="flex items-center gap-3 w-full"
      >
        {hasPhoto ? (
          <img
            src={listing.photos[0]}
            alt={listing.cropName}
            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#E5E5E5]"
          />
        ) : (
          <ProduceVisual type={listing.cropName} size="sm" className="shrink-0" />
        )}
        <div className="flex-1 min-w-0 text-left">
          <h4 className="text-sm font-bold text-[#1A1A1A] truncate">{listing.cropName}</h4>
          <button
            type="button"
            onClick={handleOpenSeller}
            className="text-xs text-[#4B6B56] hover:text-[#1F5C3A] hover:underline font-medium truncate block text-left cursor-pointer"
            title="View Seller Profile & Chat"
          >
            {listing.farmerName} · {listing.location.town}
          </button>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-extrabold text-[#1F5C3A]">
              LKR {listing.pricePerKg.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#9CA3AF]">/ kg</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="p-2 rounded-xl bg-[#E6F2E8] text-[#1F5C3A] hover:bg-[#1F5C3A] hover:text-white transition-colors cursor-pointer shrink-0"
        >
          {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </Card>
    );
  }

  return (
    <Card
      variant="interactive"
      padding="none"
      onClick={handleClick}
      className="flex flex-col h-full group"
    >
      {/* Top Media Area */}
      <div className="relative w-full h-36 bg-[#F6F7F5] overflow-hidden flex items-center justify-center">
        {listing.photos && listing.photos.length > 0 && (listing.photos[0].startsWith('data:image') || listing.photos[0].startsWith('http')) ? (
          <img
            src={listing.photos[0]}
            alt={listing.cropName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="p-3">
            <ProduceVisual
              type={listing.cropName}
              size="lg"
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {listing.isOrganic && (
          <span className="absolute top-2.5 left-2.5 bg-[#1F5C3A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            Organic
          </span>
        )}

        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-bold text-[#1A1A1A] shadow-xs">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{listing.farmerRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3.5 flex flex-col flex-1 text-left">
        <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] mb-1">
          <MapPin className="w-3 h-3 text-[#1F5C3A]" />
          <span className="truncate">
            {listing.location.town}, {listing.location.district}
          </span>
        </div>

        <h3 className="text-sm font-bold text-[#1A1A1A] line-clamp-1 mb-1 group-hover:text-[#1F5C3A] transition-colors">
          {listing.cropName}
        </h3>

        <button
          type="button"
          onClick={handleOpenSeller}
          className="text-[11px] text-[#4B6B56] hover:text-[#1F5C3A] hover:underline font-semibold line-clamp-1 mb-2 text-left flex items-center gap-1 cursor-pointer"
          title="View Seller Profile & Chat"
        >
          <span>Farmer: {listing.farmerName}</span>
          <span className="text-[10px] text-[#1F5C3A] bg-[#E6F2E8] px-1.5 py-0.2 rounded-md font-bold">
            Chat 💬
          </span>
        </button>

        {/* Pricing & Order CTA */}
        <div className="mt-auto pt-2 border-t border-[#F0F0EE] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#9CA3AF] uppercase font-semibold">Price</div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-extrabold text-[#1F5C3A]">
                LKR {listing.pricePerKg.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#6B7280]">/kg</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              justAdded
                ? 'bg-[#1F5C3A] text-white'
                : 'bg-[#E6F2E8] text-[#1F5C3A] hover:bg-[#1F5C3A] hover:text-white active:scale-95'
            }`}
            aria-label={`Add ${listing.cropName} to cart`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add ({listing.minOrderKg}kg)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Seller Profile & Chat Modal */}
      <SellerProfileModal
        farmerId={listing.farmerId}
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        initialCropName={listing.cropName}
      />
    </Card>
  );
};
