import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import Svg, {
  Line,
  Path,
  Circle,
  Text as SvgText,
} from 'react-native-svg';
import {
  ArrowLeft,
  Bell,
  Sprout,
  Info,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import { useApp } from '../../services/store';

interface CropTrendData {
  id: string;
  name: string;
  marketSubtitle: string;
  unit: string;
  currentRate: number;
  changePercent: number;
  isUp: boolean;
  projected1mo: number;
  lowest6mo: number;
  highest6mo: number;
  minY: number;
  maxY: number;
  yTicks: number[];
  history: Array<{
    month: string;
    price: number;
  }>;
}

export const CROP_PRICE_TRENDS_DATA: CropTrendData[] = [
  {
    id: 'carrots',
    name: 'Carrots',
    marketSubtitle: 'Updated daily based on Pettah Wholesale Market',
    unit: 'LKR/kg',
    currentRate: 240,
    changePercent: 5,
    isUp: true,
    projected1mo: 255,
    lowest6mo: 210,
    highest6mo: 250,
    minY: 200,
    maxY: 240,
    yTicks: [230, 220, 210, 200],
    history: [
      { month: 'Jan', price: 210 },
      { month: 'Feb', price: 220 },
      { month: 'Mar', price: 235 },
      { month: 'Apr', price: 230 },
      { month: 'May', price: 240 },
      { month: 'Jun', price: 255 },
    ],
  },
  {
    id: 'paddy_rice',
    name: 'Paddy Rice',
    marketSubtitle: 'Updated daily based on Polonnaruwa & Pettah Wholesale Market',
    unit: 'LKR/kg',
    currentRate: 130,
    changePercent: 4,
    isUp: true,
    projected1mo: 138,
    lowest6mo: 105,
    highest6mo: 135,
    minY: 100,
    maxY: 140,
    yTicks: [130, 120, 110, 100],
    history: [
      { month: 'Jan', price: 108 },
      { month: 'Feb', price: 112 },
      { month: 'Mar', price: 122 },
      { month: 'Apr', price: 118 },
      { month: 'May', price: 130 },
      { month: 'Jun', price: 138 },
    ],
  },
  {
    id: 'leeks',
    name: 'Leeks',
    marketSubtitle: 'Updated daily based on Nuwara Eliya & Meegoda Market',
    unit: 'LKR/kg',
    currentRate: 240,
    changePercent: 2,
    isUp: true,
    projected1mo: 248,
    lowest6mo: 215,
    highest6mo: 245,
    minY: 210,
    maxY: 250,
    yTicks: [240, 230, 220, 210],
    history: [
      { month: 'Jan', price: 218 },
      { month: 'Feb', price: 226 },
      { month: 'Mar', price: 238 },
      { month: 'Apr', price: 232 },
      { month: 'May', price: 240 },
      { month: 'Jun', price: 248 },
    ],
  },
  {
    id: 'green_beans',
    name: 'Green Beans',
    marketSubtitle: 'Updated daily based on Dambulla Dedicated Economic Centre',
    unit: 'LKR/kg',
    currentRate: 360,
    changePercent: 6,
    isUp: true,
    projected1mo: 375,
    lowest6mo: 310,
    highest6mo: 365,
    minY: 300,
    maxY: 380,
    yTicks: [360, 340, 320, 300],
    history: [
      { month: 'Jan', price: 315 },
      { month: 'Feb', price: 330 },
      { month: 'Mar', price: 325 },
      { month: 'Apr', price: 345 },
      { month: 'May', price: 360 },
      { month: 'Jun', price: 375 },
    ],
  },
  {
    id: 'tomatoes',
    name: 'Tomatoes',
    marketSubtitle: 'Updated daily based on Dambulla Dedicated Economic Centre',
    unit: 'LKR/kg',
    currentRate: 300,
    changePercent: -3,
    isUp: false,
    projected1mo: 315,
    lowest6mo: 260,
    highest6mo: 340,
    minY: 260,
    maxY: 340,
    yTicks: [320, 300, 280, 260],
    history: [
      { month: 'Jan', price: 330 },
      { month: 'Feb', price: 340 },
      { month: 'Mar', price: 315 },
      { month: 'Apr', price: 290 },
      { month: 'May', price: 300 },
      { month: 'Jun', price: 315 },
    ],
  },
  {
    id: 'potatoes',
    name: 'Potatoes',
    marketSubtitle: 'Updated daily based on Welimada & Pettah Wholesale Market',
    unit: 'LKR/kg',
    currentRate: 220,
    changePercent: 7,
    isUp: true,
    projected1mo: 235,
    lowest6mo: 180,
    highest6mo: 225,
    minY: 180,
    maxY: 230,
    yTicks: [220, 210, 200, 190],
    history: [
      { month: 'Jan', price: 185 },
      { month: 'Feb', price: 195 },
      { month: 'Mar', price: 210 },
      { month: 'Apr', price: 205 },
      { month: 'May', price: 220 },
      { month: 'Jun', price: 235 },
    ],
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    marketSubtitle: 'Updated daily based on Keppetipola Wholesale Market',
    unit: 'LKR/kg',
    currentRate: 160,
    changePercent: 3,
    isUp: true,
    projected1mo: 170,
    lowest6mo: 130,
    highest6mo: 165,
    minY: 130,
    maxY: 170,
    yTicks: [160, 150, 140, 130],
    history: [
      { month: 'Jan', price: 135 },
      { month: 'Feb', price: 142 },
      { month: 'Mar', price: 155 },
      { month: 'Apr', price: 150 },
      { month: 'May', price: 160 },
      { month: 'Jun', price: 170 },
    ],
  },
];

export const FarmerMarketPriceTrendsScreen: React.FC = () => {
  const { goBack } = useApp();
  const [selectedCropId, setSelectedCropId] = useState<string>('carrots');
  const [containerWidth, setContainerWidth] = useState<number>(
    Dimensions.get('window').width - 32 - 40 // Screen width minus scroll padding and card padding
  );

  const selectedCrop =
    CROP_PRICE_TRENDS_DATA.find(c => c.id === selectedCropId) ||
    CROP_PRICE_TRENDS_DATA[0];

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 50) {
      setContainerWidth(width);
    }
  };

  const handleShowProjectionInfo = () => {
    Alert.alert(
      'How a Projection is Made',
      'Goviya price forecasts are computed using:\n\n• 5-year seasonal crop cycles across Central & Uva provinces\n• Central Wholesale Market daily volume arrival reports (Pettah & Dambulla)\n• Weather patterns, monsoon rainfall anomalies, and Department of Agrarian Development harvest estimates\n• Fuel & inter-district transport logistics indices',
      [{ text: 'Understood', style: 'default' }]
    );
  };

  const handleNotificationPress = () => {
    Alert.alert(
      'Market Price Alerts',
      `Notifications active for ${selectedCrop.name}. You will receive SMS & push notifications if wholesale rates fluctuate by more than 5%.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  // SVG Chart Geometry Calculations
  const chartHeight = 170;
  const leftMargin = 38;
  const rightMargin = 20;
  const topMargin = 26;
  const bottomMargin = 28;

  const printableWidth = Math.max(containerWidth - leftMargin - rightMargin, 160);
  const printableHeight = chartHeight - topMargin - bottomMargin;

  const { minY, maxY, yTicks, history } = selectedCrop;

  const getYCoordinate = (price: number) => {
    const ratio = (price - minY) / (maxY - minY);
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    return topMargin + (1 - clampedRatio) * printableHeight;
  };

  // Render first 5 points (Jan to May) as active recorded nodes with labels, Jun as end axis
  const activeHistoryPoints = history.slice(0, 5);
  const totalMonths = history.length; // 6: Jan, Feb, Mar, Apr, May, Jun

  const pointsCoordinates = history.map((pt, index) => {
    const x = leftMargin + (index / (totalMonths - 1)) * printableWidth;
    const y = getYCoordinate(pt.price);
    return { ...pt, x, y };
  });

  // SVG Line path for recorded points (Jan - May)
  const linePathD = activeHistoryPoints.reduce((acc, _, index) => {
    const pt = pointsCoordinates[index];
    if (index === 0) {
      return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }
    return `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Bar matching UI image */}
      <View style={styles.topHeaderBar}>
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [
            styles.roundHeaderBtn,
            pressed && styles.btnPressed,
          ]}
          hitSlop={8}
        >
          <ArrowLeft size={20} color="#1B4D3E" strokeWidth={2.5} />
        </Pressable>

        <View style={styles.brandTitleRow}>
          <Sprout size={22} color="#1B4D3E" strokeWidth={2.5} />
          <Text style={styles.brandTitleText}>Goviya</Text>
        </View>

        <Pressable
          onPress={handleNotificationPress}
          style={({ pressed }) => [
            styles.roundHeaderBtn,
            pressed && styles.btnPressed,
          ]}
          hitSlop={8}
        >
          <Bell size={20} color="#1B4D3E" strokeWidth={2.2} />
        </Pressable>
      </View>

      {/* Screen Title */}
      <Text style={styles.pageTitle}>Market Price Trends</Text>

      {/* 2. Card 1: Price Movement (6 Months) */}
      <View style={styles.cardContainer}>
        <View style={styles.chartHeaderRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.chartTitleText}>Price Movement (6 Months)</Text>
            <Text style={styles.chartSubtitleText}>
              {selectedCrop.marketSubtitle}
            </Text>
          </View>
          <View style={styles.unitBadge}>
            <Text style={styles.unitBadgeText}>{selectedCrop.unit}</Text>
          </View>
        </View>

        {/* SVG Chart with dynamic data & exact aesthetics */}
        <View style={styles.chartWrapper} onLayout={handleContainerLayout}>
          <Svg width={containerWidth} height={chartHeight}>
            {/* Horizontal Grid Lines & Y-axis labels */}
            {yTicks.map((tick, index) => {
              const y = getYCoordinate(tick);
              const isBaseLine = index === yTicks.length - 1;

              return (
                <React.Fragment key={`grid-${tick}-${index}`}>
                  {/* Y Axis text label */}
                  <SvgText
                    x={leftMargin - 10}
                    y={y + 4}
                    fontSize="12"
                    fontWeight="500"
                    fill="#9CA3AF"
                    textAnchor="end"
                  >
                    {tick}
                  </SvgText>

                  {/* Horizontal grid line */}
                  <Line
                    x1={leftMargin}
                    y1={y}
                    x2={containerWidth - rightMargin}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeWidth={isBaseLine ? 1.5 : 1}
                    strokeDasharray={isBaseLine ? undefined : '4 4'}
                  />
                </React.Fragment>
              );
            })}

            {/* Connecting Green Trend Line */}
            {linePathD ? (
              <Path
                d={linePathD}
                fill="none"
                stroke="#1B4D3E"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {/* Data Point Nodes and Value Labels (Jan to May) */}
            {activeHistoryPoints.map((_, index) => {
              const pt = pointsCoordinates[index];
              return (
                <React.Fragment key={`point-${pt.month}-${index}`}>
                  {/* Point Value Text Label (e.g. LKR 210) */}
                  <SvgText
                    x={pt.x}
                    y={pt.y - 10}
                    fontSize="11"
                    fontWeight="800"
                    fill="#1B4D3E"
                    textAnchor="middle"
                  >
                    {`LKR ${pt.price}`}
                  </SvgText>

                  {/* Circular Node */}
                  <Circle
                    cx={pt.x}
                    cy={pt.y}
                    r={4}
                    fill="#1B4D3E"
                  />
                </React.Fragment>
              );
            })}

            {/* X-axis Month Labels at the bottom */}
            {history.map((pt, index) => {
              const ptCoord = pointsCoordinates[index];
              return (
                <SvgText
                  key={`month-${pt.month}`}
                  x={ptCoord.x}
                  y={chartHeight - 6}
                  fontSize="12"
                  fontWeight="600"
                  fill="#6B7280"
                  textAnchor="middle"
                >
                  {pt.month}
                </SvgText>
              );
            })}
          </Svg>
        </View>
      </View>

      {/* 3. Card 2: Selected Crop Metrics Details */}
      <View style={styles.cropDetailsCard}>
        <View style={styles.cropDetailsHeader}>
          <Text style={styles.cropNameTitle}>{selectedCrop.name}</Text>
          <Text style={styles.cropUnitLabel}>{selectedCrop.unit}</Text>
        </View>

        <View style={styles.metricsTwoColumnGrid}>
          {/* Left Column: Current Rate & Projected Rate */}
          <View style={styles.metricColumnLeft}>
            <View style={styles.rateLabelRow}>
              <Text style={styles.metricLabelText}>Current Rate:</Text>
              <View
                style={[
                  styles.changePill,
                  selectedCrop.isUp ? styles.changePillUp : styles.changePillDown,
                ]}
              >
                {selectedCrop.isUp ? (
                  <TrendingUp size={11} color="#047857" strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={11} color="#DC2626" strokeWidth={2.5} />
                )}
                <Text
                  style={[
                    styles.changePillText,
                    selectedCrop.isUp
                      ? styles.changePillTextUp
                      : styles.changePillTextDown,
                  ]}
                >
                  {selectedCrop.isUp
                    ? `+${selectedCrop.changePercent}%`
                    : `${selectedCrop.changePercent}%`}
                </Text>
              </View>
            </View>

            <Text style={styles.bigRatePrimary}>
              LKR {selectedCrop.currentRate}
            </Text>

            <Text style={[styles.metricLabelText, { marginTop: 16 }]}>
              Projected (1mo):
            </Text>
            <Text style={styles.projectedRateText}>
              LKR {selectedCrop.projected1mo}
            </Text>
          </View>

          {/* Right Column: Lowest & Highest in 6 Months */}
          <View style={styles.metricColumnRight}>
            <Text style={styles.metricLabelText}>Lowest (6mo):</Text>
            <Text style={styles.bigRateSecondary}>
              LKR {selectedCrop.lowest6mo}
            </Text>

            <Text style={[styles.metricLabelText, { marginTop: 16 }]}>
              Highest (6mo):
            </Text>
            <Text style={styles.bigRateSecondary}>
              LKR {selectedCrop.highest6mo}
            </Text>
          </View>
        </View>

        {/* Projection Info Row */}
        <Pressable
          onPress={handleShowProjectionInfo}
          style={({ pressed }) => [
            styles.projectionInfoRow,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.projectionInfoText}>
            How a projection is made
          </Text>
          <Info size={14} color="#6B7280" />
        </Pressable>
      </View>

      {/* 4. Section 3: Compare with other crops */}
      <View style={styles.compareSectionContainer}>
        <Text style={styles.compareSectionTitle}>Compare with other crops</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cropPillsScrollContainer}
        >
          {CROP_PRICE_TRENDS_DATA.map(crop => {
            const isSelected = crop.id === selectedCropId;
            return (
              <Pressable
                key={crop.id}
                onPress={() => setSelectedCropId(crop.id)}
                style={({ pressed }) => [
                  styles.cropPill,
                  isSelected ? styles.cropPillSelected : styles.cropPillUnselected,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text
                  style={[
                    styles.cropPillText,
                    isSelected
                      ? styles.cropPillTextSelected
                      : styles.cropPillTextUnselected,
                  ]}
                >
                  {crop.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F7',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  // Top Header Bar
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  roundHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: -0.4,
  },
  pageTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 18,
    letterSpacing: -0.2,
  },

  // Card 1: Chart Card
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: '#E7EAE6',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chartTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.2,
  },
  chartSubtitleText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 3,
  },
  unitBadge: {
    backgroundColor: '#EAF3EC',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  chartWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  // Card 2: Crop Details Card
  cropDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: '#E7EAE6',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 18,
  },
  cropDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cropNameTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.3,
  },
  cropUnitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  metricsTwoColumnGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricColumnLeft: {
    flex: 1.1,
  },
  metricColumnRight: {
    flex: 0.9,
    paddingLeft: 12,
  },
  rateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  changePillUp: {
    backgroundColor: '#DCFCE7',
  },
  changePillDown: {
    backgroundColor: '#FEE2E2',
  },
  changePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  changePillTextUp: {
    color: '#047857',
  },
  changePillTextDown: {
    color: '#DC2626',
  },
  bigRatePrimary: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1B4D3E',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  projectedRateText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1B4D3E',
    marginTop: 4,
    letterSpacing: -0.4,
  },
  bigRateSecondary: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginTop: 4,
    letterSpacing: -0.3,
  },
  projectionInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  projectionInfoText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6B7280',
  },

  // Section 3: Compare with other crops
  compareSectionContainer: {
    marginTop: 2,
  },
  compareSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  cropPillsScrollContainer: {
    gap: 10,
    paddingRight: 10,
  },
  cropPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropPillSelected: {
    backgroundColor: '#164E37',
  },
  cropPillUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cropPillText: {
    fontSize: 13,
  },
  cropPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  cropPillTextUnselected: {
    color: '#374151',
    fontWeight: '600',
  },
});
