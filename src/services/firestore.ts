import { Order } from '../types';
import { mockOrders } from './mockData';

export interface FirestoreDB {
  _isGoviyaFirestore: boolean;
}

export const db: FirestoreDB = {
  _isGoviyaFirestore: true,
};

export interface DocumentReference<T = any> {
  id: string;
  path: string;
  collectionName: string;
}

export interface CollectionReference<T = any> {
  id: string;
  path: string;
}

export interface DocumentSnapshot<T = any> {
  id: string;
  exists: () => boolean;
  data: () => T | undefined;
}

export interface QuerySnapshot<T = any> {
  docs: DocumentSnapshot<T>[];
  size: number;
  empty: boolean;
  forEach: (callback: (doc: DocumentSnapshot<T>) => void) => void;
}

export type SnapshotUnsubscribe = () => void;
export type DocumentSnapshotCallback<T = any> = (snapshot: DocumentSnapshot<T>) => void;
export type QuerySnapshotCallback<T = any> = (snapshot: QuerySnapshot<T>) => void;

// In-memory document store initialized with mock orders
const storage: Record<string, Record<string, any>> = {
  orders: {},
};

// Populate initial mock orders
mockOrders.forEach(ord => {
  storage.orders[ord._id] = { ...ord };
});

// Listener Registries
const docListeners: Map<string, Set<DocumentSnapshotCallback>> = new Map();
const colListeners: Map<string, Set<QuerySnapshotCallback>> = new Map();

/**
 * Creates a reference to a document in a collection.
 */
export const doc = (
  _db: FirestoreDB,
  collectionName: string,
  id: string
): DocumentReference => {
  return {
    id,
    collectionName,
    path: `${collectionName}/${id}`,
  };
};

/**
 * Creates a reference to a collection.
 */
export const collection = (
  _db: FirestoreDB,
  collectionName: string
): CollectionReference => {
  return {
    id: collectionName,
    path: collectionName,
  };
};

/**
 * Builds a DocumentSnapshot object for a given collection and id.
 */
const buildDocSnapshot = <T = any>(
  collectionName: string,
  id: string
): DocumentSnapshot<T> => {
  const col = storage[collectionName] || {};
  const data = col[id];
  return {
    id,
    exists: () => data !== undefined,
    data: () => (data ? JSON.parse(JSON.stringify(data)) : undefined),
  };
};

/**
 * Builds a QuerySnapshot object for a given collection.
 */
const buildColSnapshot = <T = any>(
  collectionName: string
): QuerySnapshot<T> => {
  const col = storage[collectionName] || {};
  const docSnapshots: DocumentSnapshot<T>[] = Object.keys(col).map(id =>
    buildDocSnapshot<T>(collectionName, id)
  );
  return {
    docs: docSnapshots,
    size: docSnapshots.length,
    empty: docSnapshots.length === 0,
    forEach: (cb: (doc: DocumentSnapshot<T>) => void) => {
      docSnapshots.forEach(cb);
    },
  };
};

/**
 * Real-time listener for Firestore documents and collections (onSnapshot).
 */
export function onSnapshot<T = any>(
  ref: DocumentReference<T>,
  onNext: DocumentSnapshotCallback<T>,
  onError?: (error: Error) => void
): SnapshotUnsubscribe;
export function onSnapshot<T = any>(
  ref: CollectionReference<T>,
  onNext: QuerySnapshotCallback<T>,
  onError?: (error: Error) => void
): SnapshotUnsubscribe;
export function onSnapshot(
  ref: any,
  onNext: any,
  _onError?: any
): SnapshotUnsubscribe {
  if (ref && 'collectionName' in ref && 'id' in ref) {
    // Document Listener
    const docPath = `${ref.collectionName}/${ref.id}`;
    if (!docListeners.has(docPath)) {
      docListeners.set(docPath, new Set());
    }
    const set = docListeners.get(docPath)!;
    set.add(onNext);

    // Initial trigger
    try {
      const snap = buildDocSnapshot(ref.collectionName, ref.id);
      onNext(snap);
    } catch (err) {
      if (_onError) _onError(err);
    }

    return () => {
      set.delete(onNext);
      if (set.size === 0) {
        docListeners.delete(docPath);
      }
    };
  } else if (ref && 'path' in ref) {
    // Collection Listener
    const colName = ref.path;
    if (!colListeners.has(colName)) {
      colListeners.set(colName, new Set());
    }
    const set = colListeners.get(colName)!;
    set.add(onNext);

    // Initial trigger
    try {
      const snap = buildColSnapshot(colName);
      onNext(snap);
    } catch (err) {
      if (_onError) _onError(err);
    }

    return () => {
      set.delete(onNext);
      if (set.size === 0) {
        colListeners.delete(colName);
      }
    };
  }

  return () => {};
}

/**
 * Updates a Firestore document and broadcasts real-time updates via onSnapshot.
 */
export const updateDoc = async (
  ref: DocumentReference,
  data: Partial<any>
): Promise<void> => {
  const colName = ref.collectionName;
  const id = ref.id;
  if (!storage[colName]) {
    storage[colName] = {};
  }
  const existing = storage[colName][id] || { _id: id };
  storage[colName][id] = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  // Broadcast to document listeners
  const docPath = `${colName}/${id}`;
  const docSet = docListeners.get(docPath);
  if (docSet) {
    const snap = buildDocSnapshot(colName, id);
    docSet.forEach(cb => {
      try {
        cb(snap);
      } catch (e) {
        console.warn('Error in doc onSnapshot listener:', e);
      }
    });
  }

  // Broadcast to collection listeners
  const colSet = colListeners.get(colName);
  if (colSet) {
    const colSnap = buildColSnapshot(colName);
    colSet.forEach(cb => {
      try {
        cb(colSnap);
      } catch (e) {
        console.warn('Error in col onSnapshot listener:', e);
      }
    });
  }
};

/**
 * Sets a Firestore document (create or overwrite) and broadcasts real-time updates.
 */
export const setDoc = async (
  ref: DocumentReference,
  data: any
): Promise<void> => {
  const colName = ref.collectionName;
  const id = ref.id;
  if (!storage[colName]) {
    storage[colName] = {};
  }
  storage[colName][id] = { ...data };

  // Broadcast to doc listeners
  const docPath = `${colName}/${id}`;
  const docSet = docListeners.get(docPath);
  if (docSet) {
    const snap = buildDocSnapshot(colName, id);
    docSet.forEach(cb => cb(snap));
  }

  // Broadcast to col listeners
  const colSet = colListeners.get(colName);
  if (colSet) {
    const colSnap = buildColSnapshot(colName);
    colSet.forEach(cb => cb(colSnap));
  }
};

/**
 * Synchronize all current orders into Firestore storage.
 */
export const syncOrdersToFirestore = (orders: Order[]) => {
  orders.forEach(ord => {
    storage.orders[ord._id] = { ...ord };
  });
};

/**
 * Gets a single document snapshot.
 */
export const getDoc = async <T = any>(
  ref: DocumentReference<T>
): Promise<DocumentSnapshot<T>> => {
  return buildDocSnapshot<T>(ref.collectionName, ref.id);
};
