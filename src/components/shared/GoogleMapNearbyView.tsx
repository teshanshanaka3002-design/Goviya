import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  MapPin,
  ExternalLink,
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  Compass,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
} from 'lucide-react-native';

export interface GoogleMapNearbyMarker {
  id: string;
  name: string;
  crop?: string;
  district: string;
  town: string;
  lat: number;
  lng: number;
  type?: 'farmer' | 'buyer' | 'driver';
  phone?: string;
}

export interface GoogleMapNearbyViewProps {
  markers?: GoogleMapNearbyMarker[];
  selectedId?: string | null;
  onSelectMarker?: (id: string) => void;
  searchQuery?: string;
  onOpenChat?: (farmerId: string, farmerName: string) => void;
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
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [keyCounter, setKeyCounter] = useState<number>(0);

  // Identify active selected marker
  const activeMarker = useMemo(() => {
    if (!selectedId) return null;
    return markers.find(m => m.id === selectedId) || null;
  }, [markers, selectedId]);

  // Compute map center and zoom level based on active marker or search query
  const { centerLat, centerLng, zoomLevel, displayTitle } = useMemo(() => {
    if (activeMarker && activeMarker.lat && activeMarker.lng) {
      return {
        centerLat: activeMarker.lat,
        centerLng: activeMarker.lng,
        zoomLevel: 14,
        displayTitle: `${activeMarker.name} (${activeMarker.town})`,
      };
    }

    const trimmed = searchQuery.trim().toLowerCase();
    if (trimmed) {
      for (const [townKey, coords] of Object.entries(SRI_LANKA_TOWN_COORDS)) {
        if (trimmed.includes(townKey)) {
          return {
            centerLat: coords.lat,
            centerLng: coords.lng,
            zoomLevel: coords.zoom,
            displayTitle: `${townKey.toUpperCase()}, Sri Lanka`,
          };
        }
      }
      // Check if any marker matches the town
      const matchedMarker = markers.find(
        m =>
          m.town.toLowerCase().includes(trimmed) ||
          m.district.toLowerCase().includes(trimmed)
      );
      if (matchedMarker) {
        return {
          centerLat: matchedMarker.lat,
          centerLng: matchedMarker.lng,
          zoomLevel: 13,
          displayTitle: `${matchedMarker.town}, Sri Lanka`,
        };
      }
    }

    // Default Central Sri Lanka (Dambulla/Sigiriya agrarian corridor)
    return {
      centerLat: 7.8731,
      centerLng: 80.7718,
      zoomLevel: 8,
      displayTitle: 'All Island Agrarian Centers',
    };
  }, [activeMarker, markers, searchQuery]);

  // Generate self-contained Leaflet HTML with Google Maps tile layers & interactive pins
  const mapHtml = useMemo(() => {
    const tileUrl =
      mapType === 'satellite'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

    const markersJson = JSON.stringify(
      markers.map(m => ({
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
    html, body {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background: #E5E7EB;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
    }
    #map {
      height: 100%;
      width: 100%;
      background: #E5E7EB;
    }
    .farmer-pin {
      background: #1F5C3A;
      color: #FFFFFF;
      border: 2px solid #FFFFFF;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
      font-size: 13px;
      cursor: pointer;
      user-select: none;
      transition: transform 0.15s ease-in-out;
    }
    .farmer-pin.active {
      background: #15803D;
      border: 3px solid #86EFAC;
      transform: scale(1.3);
      box-shadow: 0 0 14px rgba(22, 163, 74, 0.7);
    }
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      padding: 4px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.18);
    }
    .popup-title {
      font-weight: 800;
      font-size: 13px;
      color: #0F172A;
      margin-bottom: 2px;
    }
    .popup-sub {
      font-size: 11px;
      color: #64748B;
    }
    .popup-badge {
      display: inline-block;
      background: #DCFCE7;
      color: #166534;
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 5px;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function() {
      try {
        var map = L.map('map', {
          zoomControl: true,
          attributionControl: false
        }).setView([${centerLat}, ${centerLng}], ${zoomLevel});

        // Live Google Maps Tiles Layer
        var googleLayer = L.tileLayer('${tileUrl}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(map);

        // Fail-safe tile error fallback
        googleLayer.on('tileerror', function() {
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
        });

        // Add interactive farmer pins
        var markersList = ${markersJson};
        markersList.forEach(function(m) {
          if (!m.lat || !m.lng) return;

          var iconHtml = '<div class="farmer-pin ' + (m.isSelected ? 'active' : '') + '">🌾</div>';
          var customIcon = L.divIcon({
            className: 'custom-pin-wrapper',
            html: iconHtml,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -16]
          });

          var marker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(map);

          var popupHtml =
            '<div class="popup-title">' + m.name + '</div>' +
            '<div class="popup-sub">' + m.town + (m.district ? ', ' + m.district : '') + '</div>' +
            (m.crop ? '<div class="popup-badge">🌿 ' + m.crop + '</div>' : '');

          marker.bindPopup(popupHtml);

          if (m.isSelected) {
            marker.openPopup();
          }
        });
      } catch(e) {
        console.error(e);
      }
    })();
  </script>
</body>
</html>`;
  }, [centerLat, centerLng, mapType, markers, selectedId, zoomLevel]);

  // Launch external official Google Maps App / Web
  const handleOpenGoogleMapsApp = () => {
    let url = '';
    if (activeMarker) {
      url = `https://www.google.com/maps/search/?api=1&query=${activeMarker.lat},${activeMarker.lng}`;
    } else if (searchQuery.trim()) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery.trim() + ', Sri Lanka')}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=Dambulla+Economic+Centre,+Sri+Lanka`;
    }

    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(searchQuery || 'Sri Lanka')}`);
    });
  };

  const mapHeight = isExpanded ? 420 : 270;

  return (
    <View style={styles.container}>
      {/* Top Header Bar with Live Badge & Layer Controls */}
      <View style={styles.topControlBar}>
        <View style={styles.badgeRow}>
          <View style={styles.livePulseDot} />
          <Text style={styles.badgeTitleText}>Google Maps (Live)</Text>
        </View>

        <View style={styles.actionButtonsRow}>
          {/* Layer switcher: Roadmap vs Satellite */}
          <Pressable
            onPress={() =>
              setMapType(prev => (prev === 'roadmap' ? 'satellite' : 'roadmap'))
            }
            style={({ pressed }) => [
              styles.controlBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Layers size={12} color="#1F5C3A" />
            <Text style={styles.controlBtnText}>
              {mapType === 'roadmap' ? 'Satellite' : 'Roadmap'}
            </Text>
          </Pressable>

          {/* Refresh / Re-center */}
          <Pressable
            onPress={() => setKeyCounter(prev => prev + 1)}
            style={({ pressed }) => [
              styles.iconControlBtn,
              pressed && styles.btnPressed,
            ]}
            hitSlop={6}
          >
            <RefreshCw size={12} color="#1F5C3A" />
          </Pressable>

          {/* Expand / Minimize */}
          <Pressable
            onPress={() => setIsExpanded(prev => !prev)}
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

      {/* Map Display Frame */}
      <View style={[styles.mapFrame, { height: mapHeight }]}>
        {Platform.OS === 'web' ? (
          // Web: Interactive iframe with srcDoc
          <iframe
            key={`web-map-${keyCounter}-${mapType}-${centerLat}-${centerLng}`}
            title="Google Maps Nearby"
            srcDoc={mapHtml}
            width="100%"
            height="100%"
            style={{
              border: 'none',
              width: '100%',
              height: '100%',
              borderRadius: 0,
            }}
          />
        ) : (
          // Mobile: Native WebView
          <WebView
            key={`native-map-${keyCounter}-${mapType}-${centerLat}-${centerLng}`}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={false}
            scrollEnabled={false}
            allowsInlineMediaPlayback={true}
            mixedContentMode="always"
            renderLoading={() => (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color="#1F5C3A" />
                <Text style={styles.loadingText}>Loading Google Map...</Text>
              </View>
            )}
            startInLoadingState={true}
          />
        )}

        {/* Floating Location Indicator on top left */}
        <View style={styles.floatingLocationBadge}>
          <Compass size={12} color="#1F5C3A" />
          <Text style={styles.floatingLocationText} numberOfLines={1}>
            {displayTitle}
          </Text>
        </View>
      </View>

      {/* Selected Farmer Info Card (when a farmer pin is selected) */}
      {activeMarker && (
        <View style={styles.activeFarmerOverlay}>
          <View style={styles.farmerCardHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.farmerNameText} numberOfLines={1}>
                  {activeMarker.name}
                </Text>
                <View style={styles.verifiedTag}>
                  <CheckCircle2 size={10} color="#166534" />
                  <Text style={styles.verifiedTagText}>Farm Gate</Text>
                </View>
              </View>
              <Text style={styles.farmerLocationText} numberOfLines={1}>
                {activeMarker.town}, {activeMarker.district}
                {activeMarker.crop ? ` · ${activeMarker.crop}` : ''}
              </Text>
            </View>

            <View style={styles.farmerActionsRow}>
              {onOpenChat && (
                <Pressable
                  onPress={() => onOpenChat(activeMarker.id, activeMarker.name)}
                  style={({ pressed }) => [
                    styles.chatBtn,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <MessageSquare size={13} color="#1F5C3A" />
                  <Text style={styles.chatBtnText}>Chat</Text>
                </Pressable>
              )}

              <Pressable
                onPress={handleOpenGoogleMapsApp}
                style={({ pressed }) => [
                  styles.directionsBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <Navigation size={12} color="#ffffff" />
                <Text style={styles.directionsBtnText}>Directions</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Quick Region Selector Chips */}
      <View style={styles.hubChipsContainer}>
        <Text style={styles.hubChipsTitle}>Quick Centers:</Text>
        <View style={styles.hubChipsRow}>
          {[
            { label: 'Pannipitiya', id: 'pannipitiya' },
            { label: 'Nuwara Eliya', id: 'nuwara_eliya' },
            { label: 'Dambulla', id: 'dambulla' },
            { label: 'Jaffna', id: 'jaffna' },
            { label: 'All Island', id: 'all_island' },
          ].map(hub => {
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
                    return;
                  }
                  const found = markers.find(m =>
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
    paddingVertical: 9,
    backgroundColor: '#F6FAF7',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EFE8',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  badgeTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: -0.2,
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
    fontSize: 11,
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
    fontSize: 11,
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
  webView: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  loadingText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
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
  activeFarmerOverlay: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  farmerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  farmerLocationText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  farmerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },
  chatBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
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
