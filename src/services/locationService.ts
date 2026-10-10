import * as Location from 'expo-location';
import { Linking, Alert } from 'react-native';

export interface Coordinates {
  lat: number;
  lng: number;
}

// Well-known coordinates for Sri Lanka districts and major agri-hubs
export const SRI_LANKA_DISTRICT_COORDS: Record<string, Coordinates> = {
  'colombo': { lat: 6.9271, lng: 79.8612 },
  'gampaha': { lat: 7.084, lng: 80.0098 },
  'kalutara': { lat: 6.5854, lng: 79.9607 },
  'kandy': { lat: 7.2906, lng: 80.6337 },
  'matale': { lat: 7.4675, lng: 80.6234 },
  'nuwara eliya': { lat: 6.9697, lng: 80.7891 },
  'kandapola': { lat: 6.9697, lng: 80.7891 },
  'galle': { lat: 6.0535, lng: 80.221 },
  'matara': { lat: 5.9549, lng: 80.555 },
  'hambantota': { lat: 6.1429, lng: 81.1212 },
  'jaffna': { lat: 9.6615, lng: 80.0255 },
  'kilinochchi': { lat: 9.3803, lng: 80.377 },
  'mannar': { lat: 8.981, lng: 79.9044 },
  'vavuniya': { lat: 8.7542, lng: 80.4982 },
  'mullaitivu': { lat: 9.2671, lng: 80.8142 },
  'batticaloa': { lat: 7.731, lng: 81.6747 },
  'ampara': { lat: 7.2974, lng: 81.6747 },
  'trincomalee': { lat: 8.5874, lng: 81.2152 },
  'kurunegala': { lat: 7.4863, lng: 80.3623 },
  'puttalam': { lat: 8.0408, lng: 79.8394 },
  'anuradhapura': { lat: 8.3114, lng: 80.4037 },
  'polonnaruwa': { lat: 7.9403, lng: 81.0188 },
  'badulla': { lat: 6.9934, lng: 81.055 },
  'monaragala': { lat: 6.8728, lng: 81.3507 },
  'ratnapura': { lat: 6.6828, lng: 80.4036 },
  'kegalle': { lat: 7.2513, lng: 80.3464 },
  'dambulla': { lat: 7.8604, lng: 80.6517 },
};

/**
 * Resolves latitude and longitude from explicit location object or district/address text.
 */
export const resolveCoordinates = (
  explicitCoord?: { lat?: number; lng?: number } | null,
  districtStr?: string | null,
  addressStr?: string | null,
  fallback: Coordinates = { lat: 6.9271, lng: 79.8612 }
): Coordinates => {
  if (
    explicitCoord &&
    typeof explicitCoord.lat === 'number' &&
    typeof explicitCoord.lng === 'number' &&
    !isNaN(explicitCoord.lat) &&
    !isNaN(explicitCoord.lng) &&
    (explicitCoord.lat !== 0 || explicitCoord.lng !== 0)
  ) {
    return { lat: explicitCoord.lat, lng: explicitCoord.lng };
  }

  const dLower = (districtStr || '').toLowerCase().trim();
  for (const [key, coord] of Object.entries(SRI_LANKA_DISTRICT_COORDS)) {
    if (dLower.includes(key)) return coord;
  }

  const aLower = (addressStr || '').toLowerCase().trim();
  for (const [key, coord] of Object.entries(SRI_LANKA_DISTRICT_COORDS)) {
    if (aLower.includes(key)) return coord;
  }

  return fallback;
};

/**
 * Requests location permission properly from the device.
 */
export const requestDriverLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (err) {
    console.warn('Location permission request failed:', err);
    return false;
  }
};

/**
 * Gets Driver current GPS position.
 */
export const getDriverCurrentLocation = async (): Promise<Coordinates | null> => {
  try {
    const granted = await requestDriverLocationPermission();
    if (!granted) return null;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
    };
  } catch (err) {
    console.warn('Failed to retrieve current driver location:', err);
    return null;
  }
};

/**
 * Subscribes to live driver location updates.
 */
export const subscribeToDriverLocation = (
  onLocationUpdate: (coords: Coordinates) => void
): (() => void) => {
  let isCancelled = false;
  let subscription: Location.LocationSubscription | null = null;

  (async () => {
    try {
      const granted = await requestDriverLocationPermission();
      if (!granted || isCancelled) return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (location) => {
          if (!isCancelled && location?.coords) {
            onLocationUpdate({
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            });
          }
        }
      );
    } catch (err) {
      console.warn('Failed to subscribe to live driver location:', err);
    }
  })();

  return () => {
    isCancelled = true;
    if (subscription) {
      subscription.remove();
    }
  };
};

/**
 * Opens external Google Maps turn-by-turn navigation between origin and destination.
 */
export const openExternalGoogleMapsNavigation = (params: {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  destAddress?: string;
}): void => {
  const { originLat, originLng, destLat, destLng, destAddress } = params;
  const destination = destAddress ? encodeURIComponent(destAddress) : `${destLat},${destLng}`;
  const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destination}&travelmode=driving`;

  Linking.openURL(url).catch((err) => {
    console.warn('Could not open external Google Maps navigation:', err);
  });
};

// Generic aliases for any role (driver, buyer, farmer)
export const requestLocationPermission = requestDriverLocationPermission;
export const getCurrentLocation = getDriverCurrentLocation;
export const subscribeToLocation = subscribeToDriverLocation;
export const subscribeToUserLocation = subscribeToDriverLocation;
