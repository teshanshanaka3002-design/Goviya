import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Compass, Truck, MapPin } from 'lucide-react-native';
import { Order } from '../../types';
import { useApp } from '../../services/store';
import {
  Coordinates,
  resolveCoordinates,
  subscribeToDriverLocation,
} from '../../services/locationService';

export interface DriverHomeInteractiveMapProps {
  orders: Order[];
  height?: number;
}

export const DriverHomeInteractiveMap: React.FC<DriverHomeInteractiveMapProps> = ({
  orders,
  height = 240,
}) => {
  const { currentUser } = useApp();
  const mapRef = useRef<MapView>(null);

  // Fallback driver coordinates from profile
  const fallbackDriverCoord = resolveCoordinates(
    currentUser?.location,
    currentUser?.district || currentUser?.location?.district,
    currentUser?.location?.town || currentUser?.location?.address,
    { lat: 7.084, lng: 80.0098 } // Kadawatha Logistics Hub / Western Province
  );

  const [driverCoord, setDriverCoord] = useState<Coordinates>(fallbackDriverCoord);
  const [hasLiveGps, setHasLiveGps] = useState<boolean>(false);

  // Subscribe to real-time Driver location updates
  useEffect(() => {
    const unsub = subscribeToDriverLocation((coords) => {
      setDriverCoord(coords);
      setHasLiveGps(true);
    });
    return () => unsub();
  }, []);

  // Filter relevant delivery orders (available ready for pickup or active out for delivery)
  const deliveryOrders = orders.filter(
    (o) =>
      o.deliveryType === 'delivery' &&
      (o.status === 'ready_for_pickup' || o.status === 'out_for_delivery')
  );

  // Extract real pickup & delivery markers from Firestore orders
  const pickupMarkers = deliveryOrders.map((o) => {
    const coord = resolveCoordinates(
      o.pickupLocation,
      o.pickupLocation?.district || o.farmerAddress,
      o.farmerAddress,
      { lat: 6.9697, lng: 80.7891 }
    );
    return {
      id: `pickup_${o._id}`,
      orderId: o._id,
      title: `${o.farmerName} (Pickup)`,
      description: o.pickupLocation?.address || o.farmerAddress || 'Farm Gate',
      lat: coord.lat,
      lng: coord.lng,
      type: 'farmer' as const,
    };
  });

  const deliveryMarkers = deliveryOrders.map((o) => {
    const coord = resolveCoordinates(
      (o as any).deliveryLocation,
      o.deliveryDistrict,
      o.deliveryAddress,
      { lat: 6.9271, lng: 79.8612 }
    );
    return {
      id: `delivery_${o._id}`,
      orderId: o._id,
      title: `${o.buyerName} (Delivery)`,
      description: o.deliveryAddress || o.deliveryDistrict,
      lat: coord.lat,
      lng: coord.lng,
      type: 'buyer' as const,
    };
  });

  // Fit map to show Driver + active pickups/deliveries
  useEffect(() => {
    if (!mapRef.current) return;

    const allPoints = [
      { latitude: driverCoord.lat, longitude: driverCoord.lng },
      ...pickupMarkers.map((p) => ({ latitude: p.lat, longitude: p.lng })),
      ...deliveryMarkers.map((d) => ({ latitude: d.lat, longitude: d.lng })),
    ];

    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(allPoints, {
        edgePadding: { top: 55, right: 35, bottom: 45, left: 35 },
        animated: true,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [driverCoord.lat, driverCoord.lng, pickupMarkers.length, deliveryMarkers.length]);

  return (
    <View style={[styles.container, { height }]}>
      {/* Real Interactive MapView (Default provider in Expo Go - no Google billing required) */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 7.2,
          longitude: 80.5,
          latitudeDelta: 2.2,
          longitudeDelta: 2.2,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* 1. Driver Current Location Marker */}
        <Marker
          coordinate={{ latitude: driverCoord.lat, longitude: driverCoord.lng }}
          title="You (Driver)"
          description={hasLiveGps ? 'Live GPS Location' : 'Fleet Base Location'}
        >
          <View style={[styles.customPin, { backgroundColor: '#2563EB', borderColor: '#FFFFFF' }]}>
            <Truck size={13} color="#FFFFFF" />
          </View>
        </Marker>

        {/* 2. Farmer Pickup Markers */}
        {pickupMarkers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.lat, longitude: m.lng }}
            title={m.title}
            description={m.description}
          >
            <View style={[styles.customPin, { backgroundColor: '#1F5C3A', borderColor: '#FFFFFF' }]}>
              <Text style={styles.pinIconText}>🌾</Text>
            </View>
          </Marker>
        ))}

        {/* 3. Buyer Delivery Markers */}
        {deliveryMarkers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.lat, longitude: m.lng }}
            title={m.title}
            description={m.description}
          >
            <View style={[styles.customPin, { backgroundColor: '#DC2626', borderColor: '#FFFFFF' }]}>
              <MapPin size={13} color="#FFFFFF" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top Corridor Legend Overlay */}
      <View style={styles.topInfoBar}>
        <View style={styles.topBadge}>
          <Compass size={11} color="#FFFFFF" />
          <Text style={styles.topBadgeText}>Highland to Western Province Dispatch</Text>
        </View>
        <Text style={styles.topAgriText}>Sri Lanka Agri GPS</Text>
      </View>

      {/* Bottom Hubs Footer Overlay */}
      <View style={styles.bottomTicker}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text style={styles.bottomEmoji}>📦</Text>
          <Text style={styles.tickerTitle}>Direct Farm Gate Hubs</Text>
        </View>
        <Text style={styles.tickerSub}>Tap marker to explore</Text>
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
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1F5C3A',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  topBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  topAgriText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#374151',
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
  bottomEmoji: {
    fontSize: 11,
  },
  tickerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1F5C3A',
  },
  tickerSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6B7280',
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
