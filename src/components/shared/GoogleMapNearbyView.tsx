import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import {
  Navigation,
  Compass,
  CheckCircle2,
  MessageSquare,
  Layers,
  Maximize2,
  Minimize2,
  LocateFixed,
  User,
  Star,
  X,
  RefreshCw,
} from 'lucide-react-native';
import { useApp } from '../../services/store';
import {
  Coordinates,
  resolveCoordinates,
  subscribeToUserLocation,
  openExternalGoogleMapsNavigation,
} from '../../services/locationService';

export interface GoogleMapNearbyMarker {
  id: string;
  farmerId?: string;
  name: string;
  crop?: string;
  district: string;
  town: string;
  lat: number;
  lng: number;
  type?: 'farmer' | 'buyer' | 'driver';
  phone?: string;
  farmName?: string;
  rating?: number;
}

export interface GoogleMapNearbyViewProps {
  markers?: GoogleMapNearbyMarker[];
  selectedId?: string | null;
  onSelectMarker?: (id: string) => void;
  searchQuery?: string;
  onOpenChat?: (farmerId: string, farmerName: string) => void;
  onViewSeller?: (farmerId: string) => void;
}

const SRI_LANKA_TOWN_COORDS: Record<string, { lat: number; lng: number; zoom: number }> = {
  pannipitiya: { lat: 6.8458, lng: 79.9575, zoom: 14 },
  'nuwara eliya': { lat: 6.9697, lng: 80.7891, zoom: 13 },
  dambulla: { lat: 7.8604, lng: 80.6517, zoom: 14 },
  jaffna: { lat: 9.6615, lng: 80.0255, zoom: 13 },
  colombo: { lat: 6.9271, lng: 79.8612, zoom: 13 },
  kandy: { lat: 7.2906, lng: 80.6337, zoom: 14 },
  matale: { lat: 7.4675, lng: 80.6234, zoom: 13 },
  badulla: { lat: 6.9934, lng: 81.055, zoom: 13 },
  kurunegala: { lat: 7.4863, lng: 80.3623, zoom: 13 },
  gampaha: { lat: 7.084, lng: 80.0098, zoom: 13 },
};

export const GoogleMapNearbyView: React.FC<GoogleMapNearbyViewProps> = ({
  markers = [],
  selectedId,
  onSelectMarker,
  searchQuery = '',
  onOpenChat,
  onViewSeller,
}) => {
  const { currentUser } = useApp();
  const mapRef = useRef<MapView>(null);

  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [keyCounter, setKeyCounter] = useState<number>(0);

  // 1. Resolve fallback Buyer location from profile or Colombo default
  const fallbackUserCoord = useMemo(() => {
    return resolveCoordinates(
      currentUser?.location,
      currentUser?.district || currentUser?.location?.district,
      currentUser?.location?.town || currentUser?.location?.address,
      { lat: 6.9271, lng: 79.8612 } // Colombo baseline
    );
  }, [currentUser]);

  // 2. Live device GPS state
  const [userCoord, setUserCoord] = useState<Coordinates>(fallbackUserCoord);
  const [hasLiveGps, setHasLiveGps] = useState<boolean>(false);

  // Subscribe to real-time live device GPS (matching Delivery Rider implementation)
  useEffect(() => {
    const unsubscribe = subscribeToUserLocation((coords) => {
      setUserCoord(coords);
      setHasLiveGps(true);
    });
    return () => unsubscribe();
  }, []);

  // Update userCoord when profile changes if live GPS hasn't locked yet
  useEffect(() => {
    if (!hasLiveGps) {
      setUserCoord(fallbackUserCoord);
    }
  }, [fallbackUserCoord, hasLiveGps]);

  // Identify active selected marker
  const activeMarker = useMemo(() => {
    if (!selectedId) return null;
    return markers.find((m) => m.id === selectedId) || null;
  }, [markers, selectedId]);

  // Compute display title for the map header indicator
  const displayTitle = useMemo(() => {
    if (activeMarker && activeMarker.lat && activeMarker.lng) {
      return `${activeMarker.name} (${activeMarker.town})`;
    }

    const trimmed = searchQuery.trim().toLowerCase();
    if (trimmed) {
      for (const townKey of Object.keys(SRI_LANKA_TOWN_COORDS)) {
        if (trimmed.includes(townKey)) {
          return `${townKey.toUpperCase()}, Sri Lanka`;
        }
      }
      const matchedMarker = markers.find(
        (m) =>
          m.town.toLowerCase().includes(trimmed) ||
          m.district.toLowerCase().includes(trimmed)
      );
      if (matchedMarker) {
        return `${matchedMarker.town}, Sri Lanka`;
      }
    }

    return hasLiveGps ? 'Near Your Current GPS Location' : 'All Island Agrarian Hubs';
  }, [activeMarker, markers, searchQuery, hasLiveGps]);

  // Camera animations on search query change or marker selection
  useEffect(() => {
    if (!mapRef.current) return;

    if (activeMarker && activeMarker.lat && activeMarker.lng) {
      mapRef.current.animateToRegion(
        {
          latitude: activeMarker.lat,
          longitude: activeMarker.lng,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        },
        450
      );
      return;
    }

    const trimmed = searchQuery.trim().toLowerCase();
    if (trimmed) {
      for (const [townKey, coords] of Object.entries(SRI_LANKA_TOWN_COORDS)) {
        if (trimmed.includes(townKey)) {
          mapRef.current.animateToRegion(
            {
              latitude: coords.lat,
              longitude: coords.lng,
              latitudeDelta: 0.12,
              longitudeDelta: 0.12,
            },
            450
          );
          return;
        }
      }
    }
  }, [activeMarker, searchQuery]);

  // Re-center smoothly on Buyer's live GPS position
  const handleCenterOnMyLocation = () => {
    if (!mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: userCoord.lat,
        longitude: userCoord.lng,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      },
      500
    );
  };

  // Fit all markers + Buyer GPS into camera
  const handleFitAllMarkers = () => {
    if (!mapRef.current) return;
    const allCoords = [
      { latitude: userCoord.lat, longitude: userCoord.lng },
      ...markers.filter((m) => m.lat && m.lng).map((m) => ({ latitude: m.lat, longitude: m.lng })),
    ];

    if (allCoords.length === 1) {
      handleCenterOnMyLocation();
      return;
    }

    mapRef.current.fitToCoordinates(allCoords, {
      edgePadding: { top: 60, right: 35, bottom: 45, left: 35 },
      animated: true,
    });
  };

  // Launch external official Google Maps turn-by-turn navigation
  const handleDirectNavigation = (marker: GoogleMapNearbyMarker) => {
    openExternalGoogleMapsNavigation({
      originLat: userCoord.lat,
      originLng: userCoord.lng,
      destLat: marker.lat,
      destLng: marker.lng,
      destAddress: `${marker.town}, ${marker.district}`,
    });
  };

  // Launch Google Maps App / Web overview
  const handleOpenGoogleMapsApp = () => {
    if (activeMarker) {
      handleDirectNavigation(activeMarker);
    } else if (searchQuery.trim()) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        searchQuery.trim() + ', Sri Lanka'
      )}`;
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(searchQuery || 'Sri Lanka')}`);
      });
    } else {
      openExternalGoogleMapsNavigation({
        originLat: userCoord.lat,
        originLng: userCoord.lng,
        destLat: 7.8604,
        destLng: 80.6517,
        destAddress: 'Dambulla Economic Centre, Sri Lanka',
      });
    }
  };

  const mapHeight = isExpanded ? 440 : 280;

  // Web fallback HTML for browser platform
  const webMapHtml = useMemo(() => {
    if (Platform.OS !== 'web') return '';

    const tileUrl =
      mapType === 'satellite'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

    const markersJson = JSON.stringify(
      markers.map((m) => ({
        id: m.id,
        name: m.name,
        crop: m.crop || '',
        town: m.town,
        district: m.district,
        lat: m.lat,
        lng: m.lng,
        isSelected: m.id === selectedId,
      }))
    );

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>
    html, body { height: 100%; width: 100%; margin: 0; padding: 0; background: #E5E7EB; font-family: sans-serif; overflow: hidden; }
    #map { height: 100%; width: 100%; }
    .farmer-pin { background: #1F5C3A; color: #FFF; border: 2px solid #FFF; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.35); font-size: 13px; cursor: pointer; }
    .farmer-pin.active { background: #15803D; border: 3px solid #86EFAC; transform: scale(1.3); box-shadow: 0 0 14px rgba(22, 163, 74, 0.7); }
    .buyer-pin { background: #2563EB; color: #FFF; border: 2.5px solid #FFF; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(37,99,235,0.5); font-size: 12px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function() {
      try {
        var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([${userCoord.lat}, ${userCoord.lng}], 12);
        L.tileLayer('${tileUrl}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }).addTo(map);

        // Buyer GPS Marker
        var buyerIcon = L.divIcon({ className: 'custom-pin', html: '<div class="buyer-pin">📍</div>', iconSize: [32, 32], iconAnchor: [16, 16] });
        L.marker([${userCoord.lat}, ${userCoord.lng}], { icon: buyerIcon }).addTo(map).bindPopup('<b>You (Buyer)</b><br/>${hasLiveGps ? 'Live GPS Location' : 'Profile Location'}');

        // Farmer Markers
        var list = ${markersJson};
        list.forEach(function(m) {
          if (!m.lat || !m.lng) return;
          var icon = L.divIcon({ className: 'custom-pin', html: '<div class="farmer-pin ' + (m.isSelected ? 'active' : '') + '">🌾</div>', iconSize: [30, 30], iconAnchor: [15, 15] });
          L.marker([m.lat, m.lng], { icon: icon }).addTo(map).bindPopup('<b>' + m.name + '</b><br/>' + m.town + ', ' + m.district);
        });
      } catch(e) {}
    })();
  </script>
</body>
</html>`;
  }, [hasLiveGps, mapType, markers, selectedId, userCoord]);

  return (
    <View style={styles.container}>
      {/* Top Header Control Bar with Live GPS Pulse & Controls */}
      <View style={styles.topControlBar}>
        <View style={styles.badgeRow}>
          <View style={[styles.livePulseDot, hasLiveGps && styles.livePulseDotActive]} />
          <View>
            <Text style={styles.badgeTitleText}>Google Maps</Text>
            <Text style={styles.badgeSubText}>
              {hasLiveGps ? 'Live GPS Active' : 'Sri Lanka Agri Map'}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtonsRow}>
          {/* Map Layer Switcher: Standard vs Satellite */}
          <Pressable
            onPress={() =>
              setMapType((prev) => (prev === 'standard' ? 'satellite' : 'standard'))
            }
            style={({ pressed }) => [
              styles.controlBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Layers size={12} color="#1F5C3A" />
            <Text style={styles.controlBtnText}>
              {mapType === 'standard' ? 'Satellite' : 'Roadmap'}
            </Text>
          </Pressable>

          {/* Re-center on My Location */}
          <Pressable
            onPress={handleCenterOnMyLocation}
            style={({ pressed }) => [
              styles.iconControlBtn,
              hasLiveGps && styles.iconControlBtnActive,
              pressed && styles.btnPressed,
            ]}
            hitSlop={6}
          >
            <LocateFixed size={13} color={hasLiveGps ? '#15803D' : '#1F5C3A'} />
          </Pressable>

          {/* Fit all markers */}
          <Pressable
            onPress={handleFitAllMarkers}
            style={({ pressed }) => [
              styles.iconControlBtn,
              pressed && styles.btnPressed,
            ]}
            hitSlop={6}
          >
            <RefreshCw size={12} color="#1F5C3A" />
          </Pressable>

          {/* Expand / Minimize map frame */}
          <Pressable
            onPress={() => setIsExpanded((prev) => !prev)}
            style={({ pressed }) => [
              styles.iconControlBtn,
              pressed && styles.btnPressed,
            ]}
            hitSlop={6}
          >
            {isExpanded ? (
              <Minimize2 size={13} color="#1F5C3A" />
            ) : (
              <Maximize2 size={13} color="#1F5C3A" />
            )}
          </Pressable>

          {/* Open Google Maps native app */}
          <Pressable
            onPress={handleOpenGoogleMapsApp}
            style={({ pressed }) => [
              styles.launchAppBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Navigation size={11} color="#ffffff" />
            <Text style={styles.launchAppBtnText}>Open App ↗</Text>
          </Pressable>
        </View>
      </View>

      {/* Map View Frame */}
      <View style={[styles.mapFrame, { height: mapHeight }]}>
        {Platform.OS === 'web' ? (
          // Web: Interactive Leaflet Iframe with Google tile layer
          <iframe
            key={`web-map-${keyCounter}-${mapType}-${userCoord.lat}-${userCoord.lng}`}
            title="Google Maps Nearby"
            srcDoc={webMapHtml}
            width="100%"
            height="100%"
            style={{
              border: 'none',
              width: '100%',
              height: '100%',
            }}
          />
        ) : (
          // Native: Interactive react-native-maps MapView (matching Driver Implementation)
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            mapType={mapType}
            initialRegion={{
              latitude: userCoord.lat,
              longitude: userCoord.lng,
              latitudeDelta: 0.35,
              longitudeDelta: 0.35,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
          >
            {/* 1. Buyer Live GPS Location Marker */}
            <Marker
              coordinate={{ latitude: userCoord.lat, longitude: userCoord.lng }}
              title="You (Buyer)"
              description={hasLiveGps ? 'Live Device GPS' : 'Buyer Profile Location'}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.buyerGpsPinWrapper}>
                <View style={styles.buyerGpsPulseRing} />
                <View style={styles.buyerGpsPin}>
                  <User size={13} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              </View>
            </Marker>

            {/* 2. Farmer & Produce Markers */}
            {markers.map((m) => {
              const isSelected = m.id === selectedId;
              return (
                <Marker
                  key={m.id}
                  coordinate={{ latitude: m.lat, longitude: m.lng }}
                  title={m.name}
                  description={`${m.town}, ${m.district}${m.crop ? ` · ${m.crop}` : ''}`}
                  onPress={() => onSelectMarker?.(m.id)}
                >
                  <View
                    style={[
                      styles.farmerPin,
                      isSelected && styles.farmerPinSelected,
                    ]}
                  >
                    <Text style={styles.farmerPinEmoji}>🌾</Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>
        )}

        {/* Floating Location Badge on Top Left */}
        <View style={styles.floatingLocationBadge}>
          <Compass size={12} color="#1F5C3A" />
          <Text style={styles.floatingLocationText} numberOfLines={1}>
            {displayTitle}
          </Text>
        </View>

        {/* Floating Quick GPS Re-center Floating Action Button */}
        {Platform.OS !== 'web' && (
          <Pressable
            onPress={handleCenterOnMyLocation}
            style={({ pressed }) => [
              styles.floatingGpsFab,
              pressed && styles.btnPressed,
            ]}
            hitSlop={8}
          >
            <LocateFixed size={18} color="#1F5C3A" />
          </Pressable>
        )}
      </View>

      {/* Selected Farmer Info Card (when a farmer pin is selected) */}
      {activeMarker && (
        <View style={styles.activeFarmerOverlay}>
          <View style={styles.farmerCardHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={styles.farmerNameText} numberOfLines={1}>
                  {activeMarker.name}
                </Text>
                <View style={styles.verifiedTag}>
                  <CheckCircle2 size={10} color="#166534" />
                  <Text style={styles.verifiedTagText}>Farm Gate</Text>
                </View>
                {activeMarker.rating ? (
                  <View style={styles.ratingPill}>
                    <Star size={10} color="#D97706" fill="#D97706" />
                    <Text style={styles.ratingPillText}>
                      {activeMarker.rating.toFixed(1)}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.farmerLocationText} numberOfLines={1}>
                {activeMarker.town}, {activeMarker.district}
                {activeMarker.crop ? ` · ${activeMarker.crop}` : ''}
              </Text>
            </View>

            <Pressable
              onPress={() => onSelectMarker?.('')}
              style={styles.closeOverlayBtn}
              hitSlop={8}
            >
              <X size={14} color="#64748B" />
            </Pressable>
          </View>

          {/* Action buttons row */}
          <View style={styles.farmerActionsRow}>
            {/* Turn-by-Turn GPS Directions */}
            <Pressable
              onPress={() => handleDirectNavigation(activeMarker)}
              style={({ pressed }) => [
                styles.directionsBtn,
                pressed && styles.btnPressed,
              ]}
            >
              <Navigation size={12} color="#ffffff" />
              <Text style={styles.directionsBtnText}>Directions ↗</Text>
            </Pressable>

            {/* Chat with Farmer */}
            {onOpenChat && (
              <Pressable
                onPress={() =>
                  onOpenChat(activeMarker.farmerId || activeMarker.id, activeMarker.name)
                }
                style={({ pressed }) => [
                  styles.chatBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <MessageSquare size={12} color="#1F5C3A" />
                <Text style={styles.chatBtnText}>Chat</Text>
              </Pressable>
            )}

            {/* View Farmer Full Profile Modal */}
            {onViewSeller && (
              <Pressable
                onPress={() =>
                  onViewSeller(activeMarker.farmerId || activeMarker.id)
                }
                style={({ pressed }) => [
                  styles.viewProfileBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <User size={12} color="#1F5C3A" />
                <Text style={styles.viewProfileBtnText}>View Farm</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Quick Agrarian Region Selector Chips */}
      <View style={styles.hubChipsContainer}>
        <Text style={styles.hubChipsTitle}>Quick Centers:</Text>
        <View style={styles.hubChipsRow}>
          {[
            { label: 'Pannipitiya', id: 'pannipitiya' },
            { label: 'Nuwara Eliya', id: 'nuwara_eliya' },
            { label: 'Dambulla', id: 'dambulla' },
            { label: 'Jaffna', id: 'jaffna' },
            { label: 'All Island', id: 'all_island' },
          ].map((hub) => {
            const isMatching =
              (hub.id === 'all_island' && !searchQuery && !activeMarker) ||
              searchQuery.toLowerCase().includes(hub.label.toLowerCase()) ||
              (activeMarker &&
                activeMarker.town.toLowerCase().includes(hub.label.toLowerCase()));

            return (
              <Pressable
                key={hub.id}
                onPress={() => {
                  if (hub.id === 'all_island') {
                    onSelectMarker?.('');
                    handleFitAllMarkers();
                    return;
                  }
                  const townCoord = SRI_LANKA_TOWN_COORDS[hub.label.toLowerCase()];
                  if (townCoord && mapRef.current) {
                    mapRef.current.animateToRegion(
                      {
                        latitude: townCoord.lat,
                        longitude: townCoord.lng,
                        latitudeDelta: 0.12,
                        longitudeDelta: 0.12,
                      },
                      450
                    );
                  }
                  const found = markers.find((m) =>
                    m.town.toLowerCase().includes(hub.label.toLowerCase())
                  );
                  if (found) {
                    onSelectMarker?.(found.id);
                  }
                }}
                style={({ pressed }) => [
                  styles.hubChip,
                  isMatching && styles.hubChipActive,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text
                  style={[
                    styles.hubChipText,
                    isMatching && styles.hubChipTextActive,
                  ]}
                >
                  {hub.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D7E8DC',
    overflow: 'hidden',
    shadowColor: '#1F5C3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F6FAF7',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EFE8',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  livePulseDotActive: {
    backgroundColor: '#16A34A',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: -0.2,
  },
  badgeSubText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF3EC',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBE2D1',
  },
  controlBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1F5C3A',
  },
  iconControlBtn: {
    backgroundColor: '#EAF3EC',
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBE2D1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconControlBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  launchAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1F5C3A',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  launchAppBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  mapFrame: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
  },
  floatingLocationBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    maxWidth: '70%',
  },
  floatingLocationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  floatingGpsFab: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBE2D1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buyerGpsPinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
  },
  buyerGpsPulseRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(37, 99, 235, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.4)',
  },
  buyerGpsPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  farmerPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1F5C3A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  farmerPinSelected: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#16A34A',
    borderColor: '#86EFAC',
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
    shadowColor: '#16A34A',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  farmerPinEmoji: {
    fontSize: 12,
  },
  activeFarmerOverlay: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  farmerCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  farmerNameText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#166534',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  ratingPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
  },
  farmerLocationText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeOverlayBtn: {
    padding: 3,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  farmerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1F5C3A',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 7,
  },
  directionsBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  chatBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  viewProfileBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  hubChipsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FAFCFA',
    borderTopWidth: 1,
    borderTopColor: '#EEF4EF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hubChipsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  hubChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  hubChip: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hubChipActive: {
    backgroundColor: '#1F5C3A',
    borderColor: '#1F5C3A',
  },
  hubChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  hubChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
