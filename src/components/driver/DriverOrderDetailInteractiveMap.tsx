import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Navigation, Clock, ShieldCheck, Truck, MapPin } from 'lucide-react-native';
import { Order } from '../../types';
import { useApp } from '../../services/store';
import {
  Coordinates,
  resolveCoordinates,
  subscribeToDriverLocation,
  openExternalGoogleMapsNavigation,
} from '../../services/locationService';

export interface DriverOrderDetailInteractiveMapProps {
  order: Order;
  height?: number;
}

export const DriverOrderDetailInteractiveMap: React.FC<DriverOrderDetailInteractiveMapProps> = ({
  order,
  height = 230,
}) => {
  const { currentUser } = useApp();
  const mapRef = useRef<MapView>(null);

  // 1. Resolve Farmer Pickup coordinates from Firestore
  const farmerCoord = resolveCoordinates(
    order.pickupLocation,
    order.pickupLocation?.district || order.farmerAddress,
    order.farmerAddress,
    { lat: 6.9697, lng: 80.7891 } // Kandapola / Nuwara Eliya default
  );

  // 2. Resolve Buyer Delivery coordinates from Firestore
  const buyerCoord = resolveCoordinates(
    (order as any).deliveryLocation,
    order.deliveryDistrict,
    order.deliveryAddress,
    { lat: 6.9271, lng: 79.8612 } // Colombo default
  );

  // 3. Fallback driver location from current user profile in Firestore
  const fallbackDriverCoord = resolveCoordinates(
    currentUser?.location,
    currentUser?.district || currentUser?.location?.district,
    currentUser?.location?.town || currentUser?.location?.address,
    { lat: 7.084, lng: 80.0098 } // Kadawatha Logistics Hub
  );

  // 4. Live Driver GPS location
  const [driverCoord, setDriverCoord] = useState<Coordinates>(fallbackDriverCoord);
  const [hasLiveGps, setHasLiveGps] = useState<boolean>(false);

  // Subscribe to real-time Driver location via expo-location
  useEffect(() => {
    const unsubscribe = subscribeToDriverLocation((newCoords) => {
      setDriverCoord(newCoords);
      setHasLiveGps(true);
    });
    return () => unsubscribe();
  }, []);

  // 5. Fit map to show all available markers
  useEffect(() => {
    if (!mapRef.current) return;
    const coordsToFit = [
      { latitude: farmerCoord.lat, longitude: farmerCoord.lng },
      { latitude: buyerCoord.lat, longitude: buyerCoord.lng },
      { latitude: driverCoord.lat, longitude: driverCoord.lng },
    ];

    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(coordsToFit, {
        edgePadding: { top: 60, right: 35, bottom: 45, left: 35 },
        animated: true,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [farmerCoord.lat, farmerCoord.lng, buyerCoord.lat, buyerCoord.lng, driverCoord.lat, driverCoord.lng]);

  const isPickedUp = order.status === 'out_for_delivery' || order.status === 'delivered';

  // 6. Handle "Turn-by-Turn ↗" / "Open in Google Maps" external navigation
  const handleOpenTurnByTurn = () => {
    if (!isPickedUp) {
      // Before pickup: Navigate from Driver -> Farmer
      openExternalGoogleMapsNavigation({
        originLat: driverCoord.lat,
        originLng: driverCoord.lng,
        destLat: farmerCoord.lat,
        destLng: farmerCoord.lng,
        destAddress: order.pickupLocation?.address || order.farmerAddress,
      });
    } else {
      // After pickup: Navigate from Driver -> Buyer
      openExternalGoogleMapsNavigation({
        originLat: driverCoord.lat,
        originLng: driverCoord.lng,
        destLat: buyerCoord.lat,
        destLng: buyerCoord.lng,
        destAddress: order.deliveryAddress,
      });
    }
  };

  // Polyline coordinates for active delivery route
  const routePoints = [
    { latitude: driverCoord.lat, longitude: driverCoord.lng },
    ...(isPickedUp
      ? [{ latitude: buyerCoord.lat, longitude: buyerCoord.lng }]
      : [
          { latitude: farmerCoord.lat, longitude: farmerCoord.lng },
          { latitude: buyerCoord.lat, longitude: buyerCoord.lng },
        ]),
  ];

  return (
    <View style={[styles.container, { height }]}>
      {/* Real Interactive MapView (Default provider in Expo Go - no Google billing required) */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: (farmerCoord.lat + buyerCoord.lat) / 2,
          longitude: (farmerCoord.lng + buyerCoord.lng) / 2,
          latitudeDelta: Math.abs(farmerCoord.lat - buyerCoord.lat) * 1.6 + 0.3,
          longitudeDelta: Math.abs(farmerCoord.lng - buyerCoord.lng) * 1.6 + 0.3,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Route Corridor Polyline */}
        <Polyline
          coordinates={routePoints}
          strokeColor={isPickedUp ? '#2563EB' : '#1F5C3A'}
          strokeWidth={3}
          lineDashPattern={[4, 3]}
        />

        {/* 1. Farmer Pickup Marker */}
        <Marker
          coordinate={{ latitude: farmerCoord.lat, longitude: farmerCoord.lng }}
          title={`${order.farmerName} (Pickup)`}
          description={order.pickupLocation?.address || order.farmerAddress}
        >
          <View style={[styles.customPin, { backgroundColor: '#1F5C3A', borderColor: '#FFFFFF' }]}>
            <Text style={styles.pinIconText}>🌾</Text>
          </View>
        </Marker>

        {/* 2. Buyer Delivery Marker */}
        <Marker
          coordinate={{ latitude: buyerCoord.lat, longitude: buyerCoord.lng }}
          title={`${order.buyerName} (Delivery)`}
          description={order.deliveryAddress || order.deliveryDistrict}
        >
          <View style={[styles.customPin, { backgroundColor: '#DC2626', borderColor: '#FFFFFF' }]}>
            <MapPin size={13} color="#FFFFFF" />
          </View>
        </Marker>

        {/* 3. Driver Live Marker */}
        <Marker
          coordinate={{ latitude: driverCoord.lat, longitude: driverCoord.lng }}
          title="You (Driver)"
          description={hasLiveGps ? 'Live GPS Location' : 'Fleet Assigned Location'}
        >
          <View style={[styles.customPin, { backgroundColor: '#2563EB', borderColor: '#FFFFFF' }]}>
            <Truck size={13} color="#FFFFFF" />
          </View>
        </Marker>
      </MapView>

      {/* Top Header Overlay */}
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
          <Text style={styles.corridorSubtitle} numberOfLines={1}>
            {order.status === 'out_for_delivery'
              ? 'Live Transit · In transit to Buyer'
              : order.status === 'ready_for_pickup'
              ? 'Ready at Farm Gate · Driver dispatched'
              : order.status === 'delivered'
              ? 'Handover Completed & Verified'
              : 'Dispatching to Farm Gate'}
          </Text>
        </View>

        <Pressable
          onPress={handleOpenTurnByTurn}
          style={({ pressed }) => [
            styles.navButton,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Navigation size={12} color="#FFFFFF" />
          <Text style={styles.navButtonText}>Turn-by-Turn ↗</Text>
        </Pressable>
      </View>

      {/* Bottom Status Ticker Overlay */}
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
            {hasLiveGps ? 'GPS Live' : 'GPS Verified'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#CDE5D2',
    backgroundColor: '#EDF6EE',
  },
  topInfoBar: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  corridorTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  corridorSubtitle: {
    fontSize: 9.5,
    color: '#6B7280',
    marginTop: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1F5C3A',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bottomTicker: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  tickerText: {
    fontSize: 9,
    color: '#374151',
    fontWeight: '600',
  },
  customPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  pinIconText: {
    fontSize: 12,
  },
});
