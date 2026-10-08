import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react-native';

export interface SriLankaMapProps {
  markers?: {
    id: string;
    name: string;
    crop?: string;
    district: string;
    town: string;
    lat: number;
    lng: number;
    type?: 'farmer' | 'buyer' | 'driver';
  }[];
  selectedId?: string | null;
  onSelectMarker?: (id: string) => void;
  showRoute?: boolean;
  routeTitle?: string;
  className?: string;
}

export const SriLankaMap: React.FC<SriLankaMapProps> = ({
  markers = [],
  selectedId,
  onSelectMarker,
  showRoute = false,
  routeTitle,
  className = '',
}) => {
  const projectCoordinates = (lat: number, lng: number) => {
    const minLat = 5.8;
    const maxLat = 9.9;
    const minLng = 79.5;
    const maxLng = 81.9;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) };
  };

  return (
    <View style={styles.mapContainer}>
      <Svg viewBox="0 0 100 100" width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="islandLandGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#DFEFE3" />
            <Stop offset="100%" stopColor="#D5EAD8" />
          </LinearGradient>
        </Defs>

        <Rect width="100" height="100" fill="#EAF4ED" />

        {/* Approximate Stylized Sri Lanka Teardrop Island Silhouette */}
        <Path
          d="M 38 12 C 45 8, 52 14, 54 22 C 58 32, 68 45, 72 58 C 74 70, 70 82, 58 92 C 48 94, 38 90, 32 82 C 24 72, 22 55, 25 40 C 28 28, 30 18, 38 12 Z"
          fill="#D5EAD8"
          stroke="#B8DEC0"
          strokeWidth="0.8"
        />

        {/* Major Transport Corridors */}
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

        {showRoute && (
          <Path
            d="M 52 64 C 48 66, 38 68, 30 70"
            fill="none"
            stroke="#1F5C3A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="4,2"
          />
        )}
      </Svg>

      {/* Compass Badge */}
      <View style={styles.compassBadge}>
        <Compass size={14} color="#1F5C3A" />
        <Text style={styles.compassText}>Sri Lanka Agri GPS</Text>
      </View>

      {Boolean(routeTitle) && (
        <View style={styles.routeBadge}>
          <Navigation size={12} color="#ffffff" />
          <Text style={styles.routeText}>{routeTitle}</Text>
        </View>
      )}

      {/* Markers */}
      {markers.map((m, idx) => {
        const { x, y } = projectCoordinates(m.lat, m.lng);
        const isSelected = selectedId === m.id;

        return (
          <Pressable
            key={`${m.id}-${idx}`}
            onPress={() => onSelectMarker?.(m.id)}
            style={[
              styles.markerWrapper,
              { left: `${x}%`, top: `${y}%` },
            ]}
          >
            <View
              style={[
                styles.markerPin,
                m.type === 'driver'
                  ? { backgroundColor: '#5BB5C9' }
                  : m.type === 'buyer'
                  ? { backgroundColor: '#C8452D' }
                  : { backgroundColor: '#1F5C3A' },
              ]}
            >
              <MapPin size={13} color="#ffffff" />
            </View>

            <View
              style={[
                styles.markerLabel,
                isSelected && styles.markerLabelSelected,
              ]}
            >
              <Text
                style={[
                  styles.markerLabelText,
                  isSelected && { color: '#ffffff' },
                ]}
                numberOfLines={1}
              >
                {m.town}
              </Text>
            </View>
          </Pressable>
        );
      })}

      {/* Bottom Map Controls hint */}
      <View style={styles.bottomHintBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Layers size={12} color="#1F5C3A" />
          <Text style={styles.hintText}>
            Direct Farm Gate Hubs
          </Text>
        </View>
        <Text style={styles.hintAction}>Tap marker to explore</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    backgroundColor: '#EAF4ED',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D5EAD8',
  },
  compassBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compassText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1F5C3A',
  },
  routeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#1F5C3A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  routeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  markerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -14 }, { translateY: -14 }],
  },
  markerPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerLabel: {
    marginTop: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  markerLabelSelected: {
    backgroundColor: '#1F5C3A',
  },
  markerLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  bottomHintBar: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  hintText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1F5C3A',
  },
  hintAction: {
    fontSize: 10,
    color: '#1F5C3A',
    fontWeight: '500',
  },
});
