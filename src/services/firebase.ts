import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  Auth,
  initializeAuth,
  getAuth,
  // @ts-ignore getReactNativePersistence is provided by React Native entry
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY.length > 5
);

// Initialize Firebase App
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth with platform-appropriate persistence
let authInstance: Auth;
try {
  if (Platform.OS === 'web') {
    authInstance = getAuth(app);
  } else {
    // For Expo mobile (iOS / Android), persist auth session in AsyncStorage
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} catch (e) {
  // If initializeAuth was already called or in fallback environment
  authInstance = getAuth(app);
}

export const auth: Auth = authInstance;
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

/**
 * Converts Firebase Authentication error codes into human-friendly messages
 */
export const formatAuthError = (err: any): string => {
  if (!err) return 'An unexpected error occurred.';
  const code = err.code || '';
  const msg = err.message || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address format. Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email/phone or password. Please verify your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to many failed login attempts. Please reset your password or try again later.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid':
      return 'Firebase API key is missing or invalid. Please check your root .env configuration.';
    default:
      if (typeof msg === 'string' && msg.includes('Firebase:')) {
        return msg.replace(/^Firebase:\s*/, '').replace(/\s*\([^)]*\)\.?$/, '');
      }
      return msg || 'Authentication failed. Please check your credentials.';
  }
};

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
};
export type { FirebaseUser };

