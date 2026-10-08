import React from 'react';
import { View, Text, Pressable, Image, ScrollView, Linking } from 'react-native';
import {
  ShieldCheck,
  MapPin,
  Star,
  MessageSquare,
  Phone,
  Plus,
  Check,
  Sparkles,
} from 'lucide-react-native';
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

  const handleCall = () => {
    Linking.openURL(`tel:${farmPhone}`);
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
      <View style={{ gap: 16, paddingBottom: 24 }}>
        {/* Top Seller Card */}
        <View className="bg-[#E6F2E8] border border-[#CDE5D2] rounded-2xl p-4" style={{ gap: 12 }}>
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-start gap-3 flex-1">
              <Avatar name={farmerName} size="lg" role="farmer" />
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-base font-extrabold text-[#1A1A1A] flex-1">
                    {farmName}
                  </Text>
                  <ShieldCheck size={16} color="#1F5C3A" />
                </View>
                <Text className="text-xs font-semibold text-[#1F5C3A] mt-0.5">
                  Producer: {farmerName}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <MapPin size={12} color="#1F5C3A" />
                  <Text className="text-xs text-[#4B6B56]">
                    {farmTown}, {farmDistrict}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row items-center gap-1 bg-white px-2.5 py-1 rounded-full">
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Text className="text-xs font-black text-[#B45309]">{rating.toFixed(1)}</Text>
            </View>
          </View>

          {/* Quick Metrics Badges */}
          <View className="flex-row gap-2 pt-2 border-t border-[#CDE5D2]">
            <View className="flex-1 bg-white/80 p-2 rounded-xl items-center">
              <Text className="text-[9px] uppercase font-bold text-[#4B6B56]">Farm Size</Text>
              <Text className="text-xs font-black text-[#1F5C3A]">{farmSize} Acres</Text>
            </View>
            <View className="flex-1 bg-white/80 p-2 rounded-xl items-center">
              <Text className="text-[9px] uppercase font-bold text-[#4B6B56]">Active Crops</Text>
              <Text className="text-xs font-black text-[#1F5C3A]">{farmerListings.length} Listed</Text>
            </View>
            <View className="flex-1 bg-white/80 p-2 rounded-xl items-center">
              <Text className="text-[9px] uppercase font-bold text-[#4B6B56]">Verification</Text>
              <Text className="text-xs font-black text-[#1F5C3A]">100% GAP</Text>
            </View>
          </View>

          {/* MAIN ACTIONS: CHAT WITH SELLER & CALL */}
          <View className="flex-row gap-2 pt-1">
            <Button
              variant="primary"
              size="md"
              style={{ flex: 1 }}
              leftIcon={<MessageSquare size={16} color="#ffffff" />}
              onPress={handleChatWithSeller}
            >
              Chat with Seller
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Phone size={15} color="#1F5C3A" />}
              onPress={handleCall}
            >
              Call
            </Button>
          </View>
        </View>

        {/* Farm Bio & Guarantees */}
        <View className="bg-white border border-[#E5E5E5] rounded-2xl p-3.5" style={{ gap: 8 }}>
          <View className="flex-row items-center gap-1.5">
            <Sparkles size={14} color="#1F5C3A" />
            <Text className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              Farm Credentials & Harvest Guarantee
            </Text>
          </View>
          <Text className="text-xs text-[#4B5563] leading-relaxed">
            Registered smallholder farming holding with zero middleman markup. All crops are harvested at early dawn upon order receipt, graded for wholesale quality, and packed directly into ventilated agrarian crates for dispatch.
          </Text>

          <View className="pt-2 border-t border-[#F0F0EE] flex-row items-center justify-between text-[11px] text-[#6B7280]">
            <Text className="text-xs text-[#6B7280]">Farm Gate Pickup:</Text>
            <Text className="text-xs font-semibold text-[#1A1A1A] text-right flex-1 ml-2" numberOfLines={1}>
              {farmAddress}
            </Text>
          </View>
        </View>

        {/* Harvest Produce Catalog from this Seller */}
        <View style={{ gap: 10 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              Available Crops from {farmerName} ({farmerListings.length})
            </Text>
            <Text className="text-[10px] text-[#6B7280]">Direct from harvest</Text>
          </View>

          {farmerListings.length === 0 ? (
            <View className="items-center py-6 bg-[#F9FAF8] rounded-2xl border border-dashed border-[#E5E5E5]">
              <Text className="text-xs text-[#6B7280]">
                This seller currently has no active harvest listings available.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {farmerListings.map(listing => {
                const isAdded = addedListingIds[listing._id];
                const inCart = cart.some(c => c.listing._id === listing._id);
                const hasPhoto =
                  listing.photos &&
                  listing.photos.length > 0 &&
                  (listing.photos[0].startsWith('data:image') || listing.photos[0].startsWith('http'));

                return (
                  <View
                    key={listing._id}
                    className="p-3 bg-white rounded-2xl border border-[#E5E5E5] flex-row items-center justify-between gap-3"
                  >
                    <View className="flex-row items-center gap-2.5 flex-1">
                      <View className="w-12 h-12 rounded-xl overflow-hidden bg-[#F6F7F5] shrink-0 border border-[#E5E5E5] items-center justify-center">
                        {hasPhoto ? (
                          <Image
                            source={{ uri: listing.photos[0] }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <ProduceVisual type={listing.cropName} size="sm" />
                        )}
                      </View>

                      <View className="flex-1">
                        <Text className="text-xs font-bold text-[#1A1A1A]" numberOfLines={1}>
                          {listing.cropName}
                        </Text>
                        <Text className="text-[10px] text-[#6B7280]">
                          Stock: {listing.quantityKg} kg · Min: {listing.minOrderKg} kg
                        </Text>
                        <View className="flex-row items-baseline gap-1 mt-0.5">
                          <Text className="text-xs font-extrabold text-[#1F5C3A]">
                            LKR {listing.pricePerKg.toLocaleString()}
                          </Text>
                          <Text className="text-[9px] text-[#9CA3AF]">/ kg</Text>
                        </View>
                      </View>
                    </View>

                    <View className="shrink-0 flex-row items-center gap-1.5">
                      <Pressable
                        onPress={() => {
                          onClose();
                          goToSubScreen('product_detail', { listingId: listing._id });
                        }}
                        style={({ pressed }) => [
                          pressed && { opacity: 0.75, backgroundColor: '#E2E8F0' },
                        ]}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 min-h-[32px] justify-center"
                      >
                        <Text className="text-[10px] font-bold text-[#4B6B56]">View</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleAddToCart(listing)}
                        style={({ pressed }) => [
                          pressed && { opacity: 0.88, transform: [{ scale: 0.96 }] },
                        ]}
                        className={`flex-row items-center gap-1 px-3 py-1.5 rounded-xl min-h-[32px] justify-center ${
                          isAdded || !inCart ? 'bg-[#1F5C3A]' : 'bg-[#E6F2E8]'
                        }`}
                      >
                        {isAdded ? (
                          <View className="flex-row items-center gap-1">
                            <Check size={14} color="#ffffff" strokeWidth={2.5} />
                            <Text className="text-xs font-bold text-white">Added</Text>
                          </View>
                        ) : inCart ? (
                          <View className="flex-row items-center gap-1">
                            <Check size={12} color="#1F5C3A" strokeWidth={2.5} />
                            <Text className="text-xs font-bold text-[#1F5C3A]">In Cart</Text>
                          </View>
                        ) : (
                          <View className="flex-row items-center gap-1">
                            <Plus size={14} color="#ffffff" strokeWidth={2.5} />
                            <Text className="text-xs font-bold text-white">Add</Text>
                          </View>
                        )}
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Secondary Chat Banner */}
        <View className="p-3 bg-[#EEF8FA] border border-[#D0EEF5] rounded-2xl flex-row items-center justify-between">
          <View className="flex-1 mr-2">
            <Text className="font-bold text-xs text-[#19768A]">Need a custom harvest order?</Text>
            <Text className="text-[10px] text-[#528796]">
              Negotiate crate sizes, harvest dates, or wholesale discounts directly with {farmerName}.
            </Text>
          </View>
          <Button
            variant="primary"
            size="sm"
            onPress={handleChatWithSeller}
            leftIcon={<MessageSquare size={14} color="#ffffff" />}
          >
            Chat
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
};
