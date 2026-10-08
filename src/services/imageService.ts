import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Checks whether a given string is a renderable image URL or data URI.
 */
export const isValidPhotoUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('blob:')
  );
};

/**
 * Pick an image from the device's photo gallery / library.
 */
export const pickImageFromGallery = async (): Promise<string | null> => {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Denied',
        'Camera roll / photo library access is required to select crop harvest images.'
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    if (asset.base64) {
      return `data:image/jpeg;base64,${asset.base64}`;
    }
    return asset.uri || null;
  } catch (error: any) {
    console.warn('Error picking image from gallery:', error);
    Alert.alert('Image Selection Error', 'Unable to load photo from device storage.');
    return null;
  }
};

/**
 * Capture a photo directly using the device camera.
 */
export const captureImageWithCamera = async (): Promise<string | null> => {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to capture live farm harvest photos.'
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    if (asset.base64) {
      return `data:image/jpeg;base64,${asset.base64}`;
    }
    return asset.uri || null;
  } catch (error: any) {
    console.warn('Error capturing photo with camera:', error);
    Alert.alert('Camera Error', 'Unable to capture image with device camera.');
    return null;
  }
};
