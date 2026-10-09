import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { MapPin, Star, Plus, Check, MessageSquare } from 'lucide-react-native';
import { Listing } from '../../types';
import { ProduceVisual } from '../ui/ProduceVisual';
import { useApp } from '../../services/store';
import { SellerProfileModal } from './SellerProfileModal';
import { isValidPhotoUrl } from '../../services/imageService';

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
  const { addToCart, goToSubScreen } = useApp();
  const [justAdded, setJustAdded] = React.useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = React.useState(false);

  const handleOpenSeller = (e?: any) => {
    e?.stopPropagation?.();
    setIsSellerModalOpen(true);
  };

  const handleAddToCart = (e?: any) => {
    e?.stopPropagation?.();
    addToCart(listing, 1);
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

  const hasPhoto = isValidPhotoUrl(listing.photos?.[0]);

  if (compact) {
    return (
      <View style={{ width: '100%' }}>
        <View style={ps.compactCard}>
          <Pressable onPress={handleClick} style={ps.compactMediaArea}>
            {hasPhoto ? (
              <Image
                source={{ uri: listing.photos[0] }}
                style={ps.compactPhoto}
                resizeMode="cover"
              />
            ) : (
              <ProduceVisual type={listing.cropName} size="sm" />
            )}
            {listing.discountPercent ? (
              <View style={ps.compactDiscountBadge}>
                <Text style={ps.compactDiscountText}>-{listing.discountPercent}%</Text>
              </View>
            ) : listing.offerBadge ? (
              <View style={ps.compactOfferBadge}>
                <Text style={ps.compactOfferText}>Deal</Text>
              </View>
            ) : null}
          </Pressable>

          <Pressable onPress={handleClick} style={ps.compactBody}>
            <Text style={ps.cropTitleCompact} numberOfLines={1}>
              {listing.cropName}
            </Text>
            <Pressable onPress={handleOpenSeller}>
              <Text style={ps.compactSubtitle} numberOfLines={1}>
                {listing.farmerName} · {listing.location.town}
              </Text>
            </Pressable>
            <View style={ps.compactPriceRow}>
              <Text style={ps.priceTextSmall}>
                {`LKR ${listing.pricePerKg.toLocaleString()}`}
              </Text>
              <Text style={ps.unitText}>/kg</Text>
              {listing.originalPricePerKg && listing.originalPricePerKg > listing.pricePerKg ? (
                <Text style={ps.compactOriginalPrice}>
                  {`LKR ${listing.originalPricePerKg}`}
                </Text>
              ) : (
                <>
                  <Text style={ps.minOrderDot}>·</Text>
                  <Text style={ps.minOrderText}>From 1kg</Text>
                </>
              )}
            </View>
          </Pressable>

          <Pressable
            onPress={handleAddToCart}
            style={({ pressed }) => [
              ps.compactAddBtn,
              justAdded
                ? { backgroundColor: '#1F5C3A', borderColor: '#1F5C3A' }
                : { backgroundColor: '#E6F2E8', borderColor: '#CDE5D2' },
              pressed && ps.btnPressed,
            ]}
          >
            {justAdded ? (
              <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <Plus size={16} color="#1F5C3A" strokeWidth={2.5} />
            )}
          </Pressable>
        </View>

        {isSellerModalOpen && (
          <SellerProfileModal
            farmerId={listing.farmerId}
            isOpen={isSellerModalOpen}
            onClose={() => setIsSellerModalOpen(false)}
            initialCropName={listing.cropName}
          />
        )}
      </View>
    );
  }

  return (
    <View style={{ width: '100%' }}>
      <View style={ps.fullCard}>
        {/* Clickable Header & Details Area */}
        <Pressable
          onPress={handleClick}
          style={({ pressed }) => [
            ps.clickableArea,
            pressed && { opacity: 0.95 },
          ]}
        >
          {/* Top Media Area */}
          <View style={ps.mediaArea}>
            {hasPhoto ? (
              <Image
                source={{ uri: listing.photos[0] }}
                style={ps.cardImage}
                resizeMode="cover"
              />
            ) : (
              <ProduceVisual type={listing.cropName} size="md" />
            )}

            {/* Badges Overlay */}
            <View style={ps.topBadgesRow}>
              {listing.discountPercent ? (
                <View style={ps.discountBadge}>
                  <Text style={ps.discountBadgeText}>-{listing.discountPercent}%</Text>
                </View>
              ) : listing.offerBadge ? (
                <View style={ps.offerBadge}>
                  <Text style={ps.offerBadgeText}>{listing.offerBadge}</Text>
                </View>
              ) : listing.isOrganic ? (
                <View style={ps.organicBadge}>
                  <Text style={ps.organicBadgeText}>Organic</Text>
                </View>
              ) : null}

              <View style={ps.ratingBadge}>
                <Star size={10} color="#F59E0B" fill="#F59E0B" />
                <Text style={ps.ratingBadgeText}>
                  {listing.farmerRating.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Card Upper Info */}
          <View style={ps.infoSection}>
            {/* Location & Secondary Tag */}
            <View style={ps.locationRow}>
              <MapPin size={11} color="#1F5C3A" />
              <Text style={ps.locationText} numberOfLines={1}>
                {listing.location.town}, {listing.location.district}
              </Text>
              {listing.isOrganic && (listing.discountPercent || listing.offerBadge) ? (
                <View style={ps.miniOrganicPill}>
                  <Text style={ps.miniOrganicText}>Bio</Text>
                </View>
              ) : null}
            </View>

            {/* Crop Name */}
            <Text style={ps.cropTitle} numberOfLines={1}>
              {listing.cropName}
            </Text>

            {/* Farmer & Chat Row */}
            <Pressable onPress={handleOpenSeller} style={ps.farmerRow}>
              <Text style={ps.farmerName} numberOfLines={1}>
                {listing.farmerName}
              </Text>
              <View style={ps.chatPill}>
                <MessageSquare size={10} color="#1F5C3A" />
                <Text style={ps.chatPillText}>Chat</Text>
              </View>
            </Pressable>
          </View>
        </Pressable>

        {/* Pricing & Add to Cart Action */}
        <View style={ps.priceRow}>
          <View style={ps.priceInfo}>
            <View style={ps.priceAmountRow}>
              <Text style={ps.priceValue} numberOfLines={1}>
                {`LKR ${listing.pricePerKg.toLocaleString()}`}
              </Text>
              <Text style={ps.priceUnit}>/kg</Text>
            </View>
            {listing.originalPricePerKg && listing.originalPricePerKg > listing.pricePerKg ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                <Text style={ps.strikethroughPrice} numberOfLines={1}>
                  {`LKR ${listing.originalPricePerKg}`}
                </Text>
                <Text style={ps.savingsText} numberOfLines={1}>
                  {`Save LKR ${listing.originalPricePerKg - listing.pricePerKg}`}
                </Text>
              </View>
            ) : (
              <Text style={ps.minOrderSubtitle}>
                From 1 kg
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleAddToCart}
            style={({ pressed }) => [
              ps.addBtn,
              justAdded
                ? { backgroundColor: '#1F5C3A', borderColor: '#1F5C3A' }
                : { backgroundColor: '#E6F2E8', borderColor: '#CDE5D2' },
              pressed && ps.btnPressed,
            ]}
          >
            {justAdded ? (
              <View style={ps.btnContent}>
                <Check size={13} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={ps.addedBtnText}>Added</Text>
              </View>
            ) : (
              <View style={ps.btnContent}>
                <Plus size={13} color="#1F5C3A" strokeWidth={2.5} />
                <Text style={ps.addBtnText}>Add</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {isSellerModalOpen && (
        <SellerProfileModal
          farmerId={listing.farmerId}
          isOpen={isSellerModalOpen}
          onClose={() => setIsSellerModalOpen(false)}
          initialCropName={listing.cropName}
        />
      )}
    </View>
  );
};

const ps = StyleSheet.create({
  fullCard: {
    flexDirection: 'column',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    justifyContent: 'space-between',
  },
  clickableArea: {
    width: '100%',
  },
  mediaArea: {
    position: 'relative',
    width: '100%',
    height: 124,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  topBadgesRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  discountBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  offerBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  offerBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  organicBadge: {
    backgroundColor: '#1F5C3A',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 2,
  },
  organicBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  miniOrganicPill: {
    backgroundColor: '#E6F2E8',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    marginLeft: 2,
  },
  miniOrganicText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1F5C3A',
  },
  ratingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E293B',
  },
  strikethroughPrice: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  savingsText: {
    fontSize: 9.5,
    color: '#DC2626',
    fontWeight: '700',
  },
  compactOriginalPrice: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '600',
    marginLeft: 3,
  },
  compactDiscountBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
    zIndex: 2,
  },
  compactDiscountText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '900',
  },
  compactOfferBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#D97706',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
    zIndex: 2,
  },
  compactOfferText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '800',
  },
  infoSection: {
    padding: 10,
    paddingBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 10,
    color: '#64748B',
    flex: 1,
    fontWeight: '500',
  },
  cropTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 10.5,
    color: '#4B6B56',
    fontWeight: '600',
    flex: 1,
  },
  chatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E6F2E8',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#CDE5D2',
    flexShrink: 0,
  },
  chatPillText: {
    fontSize: 9.5,
    color: '#1F5C3A',
    fontWeight: '700',
  },
  priceRow: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    backgroundColor: '#FAFCFA',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  priceInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  priceAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1.5,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1F5C3A',
  },
  priceUnit: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },
  minOrderSubtitle: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 1,
  },
  addBtn: {
    minHeight: 32,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F5C3A',
  },
  addedBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Compact layout styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  compactMediaArea: {
    flexShrink: 0,
  },
  compactPhoto: {
    width: 46,
    height: 46,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
  },
  compactBody: {
    flex: 1,
    justifyContent: 'center',
  },
  cropTitleCompact: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  compactSubtitle: {
    fontSize: 11,
    color: '#4B6B56',
    fontWeight: '500',
    marginTop: 1,
  },
  compactPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 2,
  },
  priceTextSmall: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F5C3A',
  },
  unitText: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
  minOrderDot: {
    fontSize: 9.5,
    color: '#CBD5E1',
  },
  minOrderText: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
  compactAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
  },
});
