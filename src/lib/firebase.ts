import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); 
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// Generic error handler as per guidelines
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
  code?: string;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorCode = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;

  const errInfo: FirestoreErrorInfo = {
    error: errorCode || (error instanceof Error ? error.name : 'unknown-error'),
    code: errorCode,
    operationType,
    path
  }
  console.error('Firestore Error:', errInfo);
  throw new Error(`${operationType} failed${path ? ` for ${path}` : ''}`);
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export { serverTimestamp, collection, query, where, orderBy, limit, getDocs, getDocFromServer, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, doc };
