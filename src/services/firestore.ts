import {
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  runTransaction,
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
  QuerySnapshot,
  Firestore,
} from 'firebase/firestore';
import { db } from './firebase';
import { Order } from '../types';

export {
  db,
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  runTransaction,
};

export type {
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
  QuerySnapshot,
  Firestore,
};

/**
 * Helper to sync orders (kept for backward compatibility during step-by-step migration)
 */
export const syncOrdersToFirestore = async (orders: Order[]): Promise<void> => {
  // Safe helper during transitional phase
};
