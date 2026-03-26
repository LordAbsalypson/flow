import React, { useEffect, useState } from 'react';
import { useSession } from './SessionContext';
import { db, collection, query, where, getDocs, orderBy, handleFirestoreError, OperationType } from './firebase';
import { PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HistoryItem {
  id: string;
  title: string;
  artist: string;
  videoId: string;
  ratings?: Record<string, number>;
  emojis?: Record<string, string>;
  timestamp: string;
}

export const Library: React.FC = () => {
  const { sessionId } = useSession();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionId) return;
      try {
        const q = query(
          collection(db, 'history'),
          where('sessionId', '==', sessionId),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const items: HistoryItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as HistoryItem);
        });
        
        // Filter to only items that have at least one vote
        const votedItems = items.filter(item => item.ratings && Object.keys(item.ratings).length > 0);
        
        // Take only the last 5
        setHistory(votedItems.slice(0, 5));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="text-5xl font-bold animate-pulse">Loading Library...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-8">
      <h2 className="text-7xl font-bold text-center mb-4">Library</h2>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-8 bg-white p-12 rounded-[3rem] shadow-xl">
          <p className="text-4xl text-gray-500 text-center">No songs have been rated yet.</p>
          <button 
            onClick={() => navigate('/selection')}
            className="bg-blue-500 text-white px-12 py-6 rounded-3xl text-4xl font-bold hover:bg-blue-600 transition-colors shadow-lg cursor-pointer"
          >
            Play Music
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
          {history.map((item) => {
            const ratingValues = Object.values(item.ratings || {}) as number[];
            const avgRating = ratingValues.length > 0 
              ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1) 
              : 'N/A';

            return (
              <div key={item.id} className="bg-white p-6 rounded-3xl shadow-md flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-bold">{item.title}</h3>
                  <p className="text-2xl text-gray-600">{item.artist}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-gray-500 uppercase tracking-wider font-bold">Avg Rating</span>
                    <div className="text-4xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
                      {avgRating} <span className="text-2xl text-gray-400">/ 5</span>
                    </div>
                    <span className="text-sm text-gray-400 mt-1">{ratingValues.length} {ratingValues.length === 1 ? 'vote' : 'votes'}</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/play/${encodeURIComponent(item.title + ' ' + item.artist)}`)}
                    className="text-blue-500 hover:text-blue-700 transition-colors p-2 cursor-pointer"
                    aria-label={`Play ${item.title} again`}
                  >
                    <PlayCircle size={48} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
