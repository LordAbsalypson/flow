import { io } from 'socket.io-client';

// The Vite proxy handles routing this to the backend
export const socket = io({
  path: '/socket.io',
  autoConnect: true,
  transports: ['websocket', 'polling']
});

export const api = {
  sessions: {
    get: async (id: string) => {
      const res = await fetch(`/api/sessions/${id}`);
      if (!res.ok) throw new Error('Failed to get session');
      return res.json();
    },
    upsert: async (id: string, currentHistoryId: string) => {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, currentHistoryId })
      });
      return res.json();
    }
  },
  history: {
    getPage: async (limit: number = 20, offset: number = 0) => {
      const res = await fetch(`/api/history?limit=${limit}&offset=${offset}`);
      return res.json();
    },
    getSingle: async (id: string) => {
      const res = await fetch(`/api/history/${id}`);
      if (!res.ok) throw new Error('Failed to get history');
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    vote: async (id: string, userId: string, voteData: { rating?: number; emoji?: string }) => {
      const res = await fetch(`/api/history/${id}/vote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...voteData })
      });
      return res.json();
    }
  },
  feedback: {
    create: async (data: any) => {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  }
};
