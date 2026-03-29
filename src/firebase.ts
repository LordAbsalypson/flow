import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3001`;
const socket: Socket = io(API_URL);

export const db = {}; // Mock db object

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: any, op: OperationType, path: string | null) {
  console.error(`Local DB Error [${op}] at ${path}:`, error);
}

// Helper to simulate Firestore doc/collection references
export const doc = (db: any, collection: string, id: string) => ({ collection, id });
export const collection = (db: any, name: string) => ({ name });

export const addDoc = async (collRef: { name: string }, data: any) => {
  const id = Math.random().toString(36).substring(7); // Simple ID generation
  const res = await fetch(`${API_URL}/api/${collRef.name}/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, id }),
  });
  return await res.json();
};

export const setDoc = async (docRef: { collection: string; id: string }, data: any, options?: { merge?: boolean }) => {
  const method = options?.merge ? 'PATCH' : 'POST';
  const res = await fetch(`${API_URL}/api/${docRef.collection}/${docRef.id}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const updateDoc = async (docRef: { collection: string; id: string }, data: any) => {
  const res = await fetch(`${API_URL}/api/${docRef.collection}/${docRef.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const onSnapshot = (
  docRef: { collection: string; id: string },
  onNext: (snapshot: any) => void,
  onError?: (error: any) => void
) => {
  const topic = `${docRef.collection}/${docRef.id}`;
  
  const handleChange = (data: any) => {
    onNext({
      exists: () => !!data,
      data: () => data,
      id: docRef.id
    });
  };

  socket.emit('subscribe', topic);
  socket.on('change', (data) => {
    if (data && data.id === docRef.id) {
      handleChange(data);
    }
  });

  // Initial fetch
  fetch(`${API_URL}/api/${docRef.collection}/${docRef.id}`)
    .then(res => res.json())
    .then(data => {
      if (!data.error) handleChange(data);
    })
    .catch(err => onError?.(err));

  return () => {
    socket.off('change');
    socket.emit('unsubscribe', topic);
  };
};

// Mock other exports if needed
export const getDoc = async (docRef: { collection: string; id: string }) => {
  const res = await fetch(`${API_URL}/api/${docRef.collection}/${docRef.id}`);
  const data = await res.json();
  return {
    exists: () => !data.error,
    data: () => data,
    id: docRef.id
  };
};

export const query = () => {};
export const where = () => {};
export const getDocs = () => ({ docs: [] });
export const orderBy = () => {};
