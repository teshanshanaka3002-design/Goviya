import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface BuyerFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Category multi-select
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  // Price Range
  minPrice: number;
  maxPrice: number;
  onChangePriceRange: (min: number, max: number) => void;
  // Distance
  distanceKm: number;
  onChangeDistance: (km: number) => void;
  // Availability switches
  showAvailableOnly: boolean;
  onToggleAvailableOnly: () => void;
  includeOutOfStock: boolean;
  onToggleIncludeOutOfStock: () => void;
  // Sort By
  sortBy: 'nearest' | 'price_asc' | 'price_desc';
  onChangeSortBy: (sort: 'nearest' | 'price_asc' | 'price_desc') => void;
  // Action buttons
  onClearAll: () => void;
  resultsCount: number;
}

export const BuyerFilterModal: React.FC<BuyerFilterModalProps> = ({
  isOpen,
  onClose,
  selectedCategories,
  onToggleCategory,
  minPrice,
  maxPrice,
  onChangePriceRange,
  distanceKm,
  onChangeDistance,
  showAvailableOnly,
  onToggleAvailableOnly,
  includeOutOfStock,
  onToggleIncludeOutOfStock,
  sortBy,
  onChangeSortBy,
  onClearAll,
  resultsCount,
}) => {
  const insets = useSafeAreaInsets();

  if (!isOpen) return null;

  const categories = ['Vegetables', 'Fruits', 'Root Crops', 'Leafy Greens'];

  // Handle stepping distance on slider tap
  const handleStepDistance = () => {
    if (distanceKm <= 15) onChangeDistance(25);
    else if (distanceKm <= 25) onChangeDistance(50);
    else if (distanceKm <= 50) onChangeDistance(100);
    else onChangeDistance(15);
  };

  // Handle stepping price on slider tap
  const handleStepPrice = () => {
    if (maxPrice >= 1000) onChangePriceRange(50, 600);
    else if (maxPrice >= 600) onChangePriceRange(100, 400);
    else onChangePriceRange(50, 1000);
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Top Drag Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Filter Products</Text>

            <View style={styles.headerRightActions}>
              <Pressable onPress={onClearAll} hitSlop={8}>
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeCircleBtn,
                  pressed && { opacity: 0.75, transform: [{ scale: 0.95 }] },
                ]}
                hitSlop={8}
              >
                <X size={14} color="#166534" strokeWidth={2.8} />
              </Pressable>
            </View>
          </View>

          {/* Scrollable Filter Body */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Category Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.chipsRow}>
                {categories.map(cat => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => onToggleCategory(cat)}
                      style={[
                        styles.categoryChip,
                        isSelected
                          ? styles.categoryChipSelected
                          : styles.categoryChipUnselected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected
                            ? styles.categoryChipTextSelected
                            : styles.categoryChipTextUnselected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 2. Price Range Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Price Range</Text>

              <Pressable
                onPress={handleStepPrice}
                style={styles.sliderTrackWrapper}
              >
                {/* Background Track Line */}
                <View style={styles.baseTrack} />

                {/* Active Segment between Thumbs */}
                <View
                  style={[
                    styles.activeRangeTrack,
                    {
                      left: `${Math.max(0, ((minPrice - 50) / 950) * 100)}%`,
                      right: `${Math.max(0, 100 - ((maxPrice - 50) / 950) * 100)}%`,
                    },
                  ]}
                />

                {/* Min Thumb */}
                <View
                  style={[
                    styles.sliderThumb,
                    {
                      left: `${Math.max(2, Math.min(80, ((minPrice - 50) / 950) * 100))}%`,
                    },
                  ]}
                />

                {/* Max Thumb */}
                <View
                  style={[
                    styles.sliderThumb,
                    {
                      left: `${Math.max(20, Math.min(94, ((maxPrice - 50) / 950) * 100))}%`,
                    },
                  ]}
                />
              </Pressable>

              <View style={styles.priceLabelsRow}>
                <Text style={styles.priceMinText}>{`LKR ${minPrice}`}</Text>
                <Text style={styles.priceMaxText}>
                  {`LKR ${maxPrice.toLocaleString()} per kg`}
                </Text>
              </View>
            </View>

            {/* 3. Distance Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Distance</Text>

              <Pressable
                onPress={handleStepDistance}
                style={styles.sliderTrackWrapper}
              >
                {/* Base Track */}
                <View style={styles.baseTrack} />

                {/* Active Track to Thumb */}
                <View
                  style={[
                    styles.activeRangeTrack,
                    {
                      left: 0,
                      width: `${Math.max(10, Math.min(100, (distanceKm / 50) * 100))}%`,
                    },
                  ]}
                />

                {/* Single Distance Thumb */}
                <View
                  style={[
                    styles.sliderThumb,
                    {
                      left: `${Math.max(8, Math.min(92, (distanceKm / 50) * 100))}%`,
                    },
                  ]}
                />
              </Pressable>

              <Pressable onPress={handleStepDistance}>
                <Text style={styles.distanceText}>{`Within ${distanceKm} km`}</Text>
              </Pressable>
            </View>

            {/* 4. Availability Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Availability</Text>

              {/* Show available only row */}
              <Pressable
                onPress={onToggleAvailableOnly}
                style={styles.switchRow}
              >
                <Text style={styles.switchLabelPrimary}>Show available only</Text>
                <View
                  style={[
                    styles.switchTrack,
                    showAvailableOnly
                      ? styles.switchTrackActive
                      : styles.switchTrackInactive,
                  ]}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      showAvailableOnly
                        ? styles.switchThumbActive
                        : styles.switchThumbInactive,
                    ]}
                  />
                </View>
              </Pressable>

              {/* Include out-of-stock items row */}
              <Pressable
                onPress={onToggleIncludeOutOfStock}
                style={styles.switchRow}
              >
                <Text style={styles.switchLabelSecondary}>
                  Include out-of-stock items
                </Text>
                <View
                  style={[
                    styles.switchTrack,
                    includeOutOfStock
                      ? styles.switchTrackActive
                      : styles.switchTrackInactive,
                  ]}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      includeOutOfStock
                        ? styles.switchThumbActive
                        : styles.switchThumbInactive,
                    ]}
                  />
                </View>
              </Pressable>
            </View>

            {/* 5. Sort By Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Sort By</Text>

              {/* Nearest Radio */}
              <Pressable
                onPress={() => onChangeSortBy('nearest')}
                style={styles.radioRow}
              >
                <View
                  style={[
                    styles.radioCircle,
                    sortBy === 'nearest'
                      ? styles.radioCircleActive
                      : styles.radioCircleInactive,
                  ]}
                >
                  {sortBy === 'nearest' && <View style={styles.radioDot} />}
                </View>
                <Text
                  style={[
                    styles.radioText,
                    sortBy === 'nearest' && styles.radioTextBold,
                  ]}
                >
                  Nearest
                </Text>
              </Pressable>

              {/* Price: Low to High Radio */}
              <Pressable
                onPress={() => onChangeSortBy('price_asc')}
                style={styles.radioRow}
              >
                <View
                  style={[
                    styles.radioCircle,
                    sortBy === 'price_asc'
                      ? styles.radioCircleActive
                      : styles.radioCircleInactive,
                  ]}
                >
                  {sortBy === 'price_asc' && <View style={styles.radioDot} />}
                </View>
                <Text
                  style={[
                    styles.radioText,
                    sortBy === 'price_asc' && styles.radioTextBold,
                  ]}
                >
                  Price: Low to High
                </Text>
              </Pressable>
            </View>

            {/* 6. Action Buttons Row */}
            <View
              style={[
                styles.buttonsRow,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <Pressable
                onPress={onClearAll}
                style={({ pressed }) => [
                  styles.clearAllBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text style={styles.clearAllBtnText}>Clear All</Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.showResultsBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text style={styles.showResultsBtnText}>
                  {`Show ${resultsCount} Results`}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#205438',
    textDecorationLine: 'underline',
  },
  closeCircleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Section
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipSelected: {
    backgroundColor: '#205438',
  },
  categoryChipUnselected: {
    backgroundColor: '#DDF1E4',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  categoryChipTextUnselected: {
    color: '#111827',
  },

  // Sliders
  sliderTrackWrapper: {
    height: 24,
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  baseTrack: {
    height: 3.5,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    width: '100%',
  },
  activeRangeTrack: {
    position: 'absolute',
    height: 3.5,
    backgroundColor: '#205438',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#205438',
    top: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  priceLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  priceMinText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1F5C3A',
  },
  priceMaxText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  distanceText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1F5C3A',
    marginTop: 6,
  },

  // Switches
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  switchLabelPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  switchLabelSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  switchTrack: {
    width: 48,
    height: 26,
    borderRadius: 13,
    padding: 2.5,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: '#205438',
  },
  switchTrackInactive: {
    backgroundColor: '#CBD5E1',
  },
  switchThumb: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  switchThumbInactive: {
    alignSelf: 'flex-start',
  },

  // Radio
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderWidth: 2.5,
    borderColor: '#205438',
  },
  radioCircleInactive: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#205438',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginLeft: 10,
  },
  radioTextBold: {
    fontWeight: '800',
    color: '#0F172A',
  },

  // Bottom Buttons
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  clearAllBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#205438',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearAllBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#205438',
  },
  showResultsBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#205438',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showResultsBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
