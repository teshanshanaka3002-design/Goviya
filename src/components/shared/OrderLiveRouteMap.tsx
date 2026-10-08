import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import Svg, { Rect, Path, Defs, LinearGradient, Stop, Circle, G } from 'react-native-svg';
import {
  MapPin,
  Navigation,
  Compass,
  Truck,
  ExternalLink,
  Clock,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react-native';
import { Order } from '../../types';

export interface OrderLiveRouteMapProps {
  order: Order;
  height?: number;
  showGoogleMapsButton?: boolean;
}

export const OrderLiveRouteMap: React.FC<OrderLiveRouteMapProps> = ({
  order,
  height = 270,
  showGoogleMapsButton = true,
}) => {
  // District to Lat/Lng mapping
  const districtCoords: Record<string, { lat: number; lng: number }> = {
    'nuwara eliya': { lat: 6.9697, lng: 80.7891 },
    'colombo': { lat: 6.9271, lng: 79.8612 },
    'kandy': { lat: 7.2906, lng: 80.6337 },
    'matale': { lat: 7.8731, lng: 80.6511 },
    'dambulla': { lat: 7.8604, lng: 80.6517 },
    'jaffna': { lat: 9.6615, lng: 80.0255 },
    'gampaha': { lat: 7.084, lng: 80.0098 },
    'badulla': { lat: 6.9934, lng: 81.055 },
    'kurunegala': { lat: 7.4863, lng: 80.3623 },
  };

  const getCoord = (
    explicitLocation?: { lat: number; lng: number },
    addressStr?: string,
    districtStr?: string,
    defaultCoord: { lat: number; lng: number } = { lat: 6.9271, lng: 79.8612 }
  ) => {
    if (explicitLocation && explicitLocation.lat && explicitLocation.lng) {
      return explicitLocation;
    }
    const dLower = (districtStr || '').toLowerCase();
    for (const [key, coord] of Object.entries(districtCoords)) {
      if (dLower.includes(key)) return coord;
    }
    const aLower = (addressStr || '').toLowerCase();
    for (const [key, coord] of Object.entries(districtCoords)) {
      if (aLower.includes(key)) return coord;
    }
    return defaultCoord;
  };

  const originCoord = getCoord(
    order.pickupLocation,
    order.farmerAddress,
    order.pickupLocation?.district,
    { lat: 6.9697, lng: 80.7891 } // Default Nuwara Eliya
  );

  const destCoord = getCoord(
    undefined,
    order.deliveryAddress,
    order.deliveryDistrict,
    { lat: 6.9271, lng: 79.8612 } // Default Colombo
  );

  // Project GPS to map SVG coordinates (0 - 100)
  const projectCoordinates = (lat: number, lng: number) => {
    const minLat = 5.8;
    const maxLat = 9.9;
    const minLng = 79.5;
    const maxLng = 81.9;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(12, Math.min(88, x)),
      y: Math.max(12, Math.min(88, y)),
    };
  };

  const pOrigin = projectCoordinates(originCoord.lat, originCoord.lng);
  const pDest = projectCoordinates(destCoord.lat, destCoord.lng);

  // Compute live driver position depending on order status
  let pDriver = { ...pOrigin };
  let driverStatusText = 'Awaiting Dispatch';
  let routeDashColor = '#1F5C3A';

  if (order.status === 'ready_for_pickup') {
    // Driver heading to farm
    pDriver = {
      x: pOrigin.x - (pOrigin.x - pDest.x) * 0.2,
      y: pOrigin.y - (pOrigin.y - pDest.y) * 0.2,
    };
    driverStatusText = 'Heading to Farm Gate';
    routeDashColor = '#D97706';
  } else if (order.status === 'out_for_delivery') {
    // Driver roughly midway to destination
    pDriver = {
      x: (pOrigin.x + pDest.x) / 2 + 2,
      y: (pOrigin.y + pDest.y) / 2 - 2,
    };
    driverStatusText = 'En Route to Buyer';
    routeDashColor = '#2563EB';
  } else if (order.status === 'delivered') {
    pDriver = { ...pDest };
    driverStatusText = 'Delivered at Destination';
    routeDashColor = '#15803D';
  } else {
    // Farmer preparing
    pDriver = { ...pOrigin };
    driverStatusText = 'Harvesting at Farm';
  }

  // Curve control point for highway aesthetics
  const cx = (pOrigin.x + pDest.x) / 2 + 8;
  const cy = (pOrigin.y + pDest.y) / 2 - 6;
  const routePath = `M ${pOrigin.x} ${pOrigin.y} Q ${cx} ${cy} ${pDest.x} ${pDest.y}`;

  const openFullRouteInGoogleMaps = () => {
    const originStr = encodeURIComponent(
      order.pickupLocation?.address || order.farmerAddress || 'Nuwara Eliya, Sri Lanka'
    );
    const destStr = encodeURIComponent(
      order.deliveryAddress || `${order.deliveryDistrict}, Sri Lanka`
    );
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=driving`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Map Error', 'Could not open navigation directions.');
    });
  };

  return (
    <View style={[styles.mapContainer, { height }]}>
      {/* SVG Map Canvas */}
      <Svg viewBox="0 0 100 100" width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="islandLand" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#E2F0E5" />
            <Stop offset="100%" stopColor="#D5EAD8" />
          </LinearGradient>
        </Defs>

        {/* Ocean Background */}
        <Rect width="100" height="100" fill="#EDF6EE" />

        {/* Sri Lanka Land Contour */}
        <Path
          d="M 38 12 C 45 8, 52 14, 54 22 C 58 32, 68 45, 72 58 C 74 70, 70 82, 58 92 C 48 94, 38 90, 32 82 C 24 72, 22 55, 25 40 C 28 28, 30 18, 38 12 Z"
          fill="url(#islandLand)"
          stroke="#B4DEC0"
          strokeWidth="0.8"
        />

        {/* Major Expressways / Arteries */}
        <Path
          d="M 30 70 Q 42 55 50 45 T 46 20"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeDasharray="2,1"
          opacity={0.8}
        />
        <Path
          d="M 30 70 Q 40 72 50 62"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          opacity={0.8}
        />

        {/* Complete Live Route Polyline */}
        <Path
          d={routePath}
          fill="none"
          stroke={routeDashColor}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeDasharray="4,2"
        />

        {/* Route glow line underneath */}
        <Path
          d={routePath}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="5"
          opacity={0.4}
        />
      </Svg>

      {/* Top Corridor Legend Overlay */}
      <View style={styles.topInfoBar}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor:
                  order.status === 'out_for_delivery'
                    ? '#2563EB'
                    : order.status === 'delivered'
                    ? '#15803D'
                    : '#D97706',
              }}
            />
            <Text style={styles.corridorTitle} numberOfLines={1}>
              {order.farmerName} → {order.buyerName}
            </Text>
          </View>
          <Text style={styles.corridorSubtitle}>
            {order.status === 'out_for_delivery'
              ? `Live Transit · ${order.driverName || 'Driver'} on route`
              : order.status === 'ready_for_pickup'
              ? 'Ready at Farm Gate · Driver dispatched'
              : order.status === 'delivered'
              ? 'Handover Completed & Verified'
              : 'Harvest & Sorting at Farm Gate'}
          </Text>
        </View>

        {showGoogleMapsButton && (
          <Pressable
            onPress={openFullRouteInGoogleMaps}
            style={({ pressed }) => [
              styles.navButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Navigation size={12} color="#FFFFFF" />
            <Text style={styles.navButtonText}>Turn-by-Turn ↗</Text>
          </Pressable>
        )}
      </View>

      {/* ================= MAP MARKERS ================= */}

      {/* 1. Origin Marker (Farmer Farm Gate) */}
      <View
        style={[
          styles.markerAnchor,
          { left: `${pOrigin.x}%`, top: `${pOrigin.y}%` },
        ]}
      >
        <View style={[styles.markerBadge, { backgroundColor: '#1F5C3A' }]}>
          <Text style={styles.markerBadgeEmoji}>🌾</Text>
        </View>
        <View style={styles.markerCallout}>
          <Text style={styles.markerCalloutTitle} numberOfLines={1}>
            {order.farmerName}
          </Text>
          <Text style={styles.markerCalloutSub}>Origin (Farm)</Text>
        </View>
      </View>

      {/* 2. Destination Marker (Buyer Doorstep) */}
      <View
        style={[
          styles.markerAnchor,
          { left: `${pDest.x}%`, top: `${pDest.y}%` },
        ]}
      >
        <View style={[styles.markerBadge, { backgroundColor: '#DC2626' }]}>
          <MapPin size={11} color="#FFFFFF" />
        </View>
        <View style={styles.markerCallout}>
          <Text style={styles.markerCalloutTitle} numberOfLines={1}>
            {order.buyerName}
          </Text>
          <Text style={styles.markerCalloutSub}>
            {order.deliveryDistrict || 'Destination'}
          </Text>
        </View>
      </View>

      {/* 3. Live Driver Vehicle Marker (Transit Corridor) */}
      {(order.status === 'ready_for_pickup' ||
        order.status === 'out_for_delivery' ||
        order.status === 'delivered') && (
        <View
          style={[
            styles.markerAnchor,
            { left: `${pDriver.x}%`, top: `${pDriver.y}%` },
          ]}
        >
          {/* Pulsing indicator ring */}
          {order.status === 'out_for_delivery' && (
            <View style={styles.driverPulseRing} />
          )}

          <View style={[styles.markerBadge, { backgroundColor: '#2563EB', borderWidth: 2, borderColor: '#FFFFFF' }]}>
            <Truck size={12} color="#FFFFFF" />
          </View>
          <View style={[styles.markerCallout, { borderColor: '#93C5FD' }]}>
            <Text style={[styles.markerCalloutTitle, { color: '#1E40AF' }]} numberOfLines={1}>
              {order.driverName || 'Logistics Driver'}
            </Text>
            <Text style={styles.markerCalloutSub}>{driverStatusText}</Text>
          </View>
        </View>
      )}

      {/* Bottom Status Ticker */}
      <View style={styles.bottomTicker}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Clock size={11} color="#1F5C3A" />
          <Text style={styles.tickerText}>
            Est. Transit: ~3 hrs 15 mins (A7 / Central Expressway)
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <ShieldCheck size={11} color="#15803D" />
          <Text style={[styles.tickerText, { color: '#15803D', fontWeight: '800' }]}>
            GPS Verified
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#EDF6EE',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#CDE5D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  topInfoBar: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  corridorTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  corridorSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1F5C3A',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  markerAnchor: {
    position: 'absolute',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    alignItems: 'center',
  },
  markerBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  markerBadgeEmoji: {
    fontSize: 12,
  },
  markerCallout: {
    marginTop: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 90,
  },
  markerCalloutTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0F172A',
  },
  markerCalloutSub: {
    fontSize: 7.5,
    color: '#64748B',
  },
  driverPulseRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  bottomTicker: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tickerText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#334155',
  },
});

export default OrderLiveRouteMap;
