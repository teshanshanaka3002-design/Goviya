import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { MapPin, Star, Plus, Check, MessageSquare } from 'lucide-react-native';
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
  const { addToCart, goToSubScreen } = useApp();
  const [justAdded, setJustAdded] = React.useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = React.useState(false);

  const handleOpenSeller = () => {
    setIsSellerModalOpen(true);
  };

  const handleAddToCart = () => {
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

  const hasPhoto =
    listing.photos &&
    listing.photos.length > 0 &&
    (listing.photos[0].startsWith('data:image') || listing.photos[0].startsWith('http'));

  if (compact) {
    return (
      <View style={{ width: '100%' }}>
        <Card
          variant="interactive"
          padding="sm"
          onPress={handleClick}
          style={ps.compactCard}
        >
          {hasPhoto ? (
            <Image
              source={{ uri: listing.photos[0] }}
              style={ps.compactPhoto}
              resizeMode="cover"
            />
          ) : (
            <ProduceVisual type={listing.cropName} size="sm" />
          )}

          <View style={ps.compactBody}>
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
              <Text style={ps.minOrderDot}>·</Text>
              <Text style={ps.minOrderText}>{`Min ${listing.minOrderKg}kg`}</Text>
            </View>
          </View>

          <Pressable
            onPress={handleAddToCart}
            style={[
              ps.compactAddBtn,
              justAdded && { backgroundColor: '#1F5C3A' },
            ]}
          >
            {justAdded ? (
              <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <Plus size={16} color="#1F5C3A" strokeWidth={2.5} />
            )}
          </Pressable>
        </Card>

        <SellerProfileModal
          farmerId={listing.farmerId}
          isOpen={isSellerModalOpen}
          onClose={() => setIsSellerModalOpen(false)}
          initialCropName={listing.cropName}
        />
      </View>
    );
  }

  return (
    <View style={{ width: '100%', height: '100%' }}>
      <Card
        variant="interactive"
        padding="none"
        onPress={handleClick}
        style={ps.fullCard}
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

          {listing.isOrganic && (
            <View style={ps.organicBadge}>
              <Text style={ps.organicBadgeText}>Organic</Text>
            </View>
          )}

          <View style={ps.ratingBadge}>
            <Star size={10} color="#F59E0B" fill="#F59E0B" />
            <Text style={ps.ratingBadgeText}>
              {listing.farmerRating.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={ps.body}>
          {/* Location */}
          <View style={ps.locationRow}>
            <MapPin size={11} color="#1F5C3A" />
            <Text style={ps.locationText} numberOfLines={1}>
              {listing.location.town}, {listing.location.district}
            </Text>
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

          {/* Pricing & Add to Cart Action */}
          <View style={ps.priceRow}>
            <View style={ps.priceInfo}>
              <View style={ps.priceAmountRow}>
                <Text style={ps.priceValue} numberOfLines={1}>
                  {`LKR ${listing.pricePerKg.toLocaleString()}`}
                </Text>
                <Text style={ps.priceUnit}>/kg</Text>
              </View>
              <Text style={ps.minOrderSubtitle}>
                {`Min ${listing.minOrderKg} kg`}
              </Text>
            </View>

            <Pressable
              onPress={handleAddToCart}
              style={[
                ps.addBtn,
                justAdded
                  ? { backgroundColor: '#1F5C3A', borderColor: '#1F5C3A' }
                  : { backgroundColor: '#E6F2E8', borderColor: '#CDE5D2' },
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
      </Card>

      <SellerProfileModal
        farmerId={listing.farmerId}
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        initialCropName={listing.cropName}
      />
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
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  mediaArea: {
    position: 'relative',
    width: '100%',
    height: 120,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  organicBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#1F5C3A',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
    zIndex: 2,
  },
  organicBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  body: {
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 10,
    color: '#6B7280',
    flex: 1,
    fontWeight: '500',
  },
  cropTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 8,
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
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  chatPillText: {
    fontSize: 9.5,
    color: '#1F5C3A',
    fontWeight: '700',
  },
  priceRow: {
    marginTop: 2,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
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
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1F5C3A',
  },
  priceUnit: {
    fontSize: 9.5,
    color: '#6B7280',
    fontWeight: '600',
  },
  minOrderSubtitle: {
    fontSize: 9.5,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 1,
  },
  addBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
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
    gap: 10,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 10,
  },
  compactPhoto: {
    width: 44,
    height: 44,
    borderRadius: 10,
    flexShrink: 0,
    backgroundColor: '#F3F4F6',
  },
  compactBody: {
    flex: 1,
    justifyContent: 'center',
  },
  cropTitleCompact: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
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
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1F5C3A',
  },
  unitText: {
    fontSize: 9.5,
    color: '#9CA3AF',
  },
  minOrderDot: {
    fontSize: 9.5,
    color: '#D1D5DB',
  },
  minOrderText: {
    fontSize: 9.5,
    color: '#9CA3AF',
  },
  compactAddBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E6F2E8',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
