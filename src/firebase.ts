import { initializeApp } from 'firebase/app';
import {
  getFirestore, doc, setDoc, getDoc, collection,
  addDoc, query, where, getDocs, orderBy, updateDoc, onSnapshot
} from 'firebase/firestore';
import configJson from '../firebase-applet-config.json';

// Merge static JSON config with the secret apiKey from .env
const firebaseConfig = {
  ...configJson,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export {
  doc, setDoc, getDoc, collection,
  addDoc, query, where, getDocs, orderBy, updateDoc, onSnapshot
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
