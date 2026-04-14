import React, { useEffect, useState } from 'react';
import { useSession } from './SessionContext';
import { api } from './api';
import { PlayCircle, LayoutGrid, List, ArrowLeft, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { translations } from './translations';

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
  const { sessionId, language } = useSession();
  const navigate = useNavigate();
  const t = translations[language];
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'time' | 'rating'>('time');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionId) return;
      try {
        // For the local API, we fetch all history and filter locally, 
        // or just fetch all and let the API handle pagination later.
        const data = await api.history.getPage(1000, 0); // Pull up to 1000 items
        let items: HistoryItem[] = data.results;
        
        // Filter by current session
        items = items.filter(item => item.sessionId === sessionId);
        
        // Filter to only items that have at least one vote
        const votedItems = items.filter(item => item.ratings && Object.keys(item.ratings).length > 0);
        
        setHistory(votedItems);
      } catch (error) {
        console.error(error);
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

  const getAvgRating = (item: HistoryItem) => {
    const ratingValues = Object.values(item.ratings || {}) as number[];
    if (ratingValues.length === 0) return 0;
    return ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;
  };

  const sortedHistory = [...history].sort((a, b) => {
    if (sortBy === 'rating') {
      return getAvgRating(b) - getAvgRating(a);
    }
    // Default: by time (newest first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="flex flex-col flex-1 gap-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/')}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:bg-gray-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
          {t.back}
        </button>
        <h2 className="text-5xl md:text-7xl font-bold text-center">{t.library}</h2>
        <div className="w-[120px]"></div> {/* Spacer for centering */}
      </div>

      {history.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm gap-4">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setSortBy('time')}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${sortBy === 'time' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Clock size={20} /> {t.byTime}
            </button>
            <button 
              onClick={() => setSortBy('rating')}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${sortBy === 'rating' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Star size={20} /> {t.byRating}
            </button>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
              aria-label="List View"
            >
              <List size={24} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
              aria-label="Grid View"
            >
              <LayoutGrid size={24} />
            </button>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-8 bg-white p-12 rounded-[3rem] shadow-xl">
          <p className="text-4xl text-gray-500 text-center">{t.noSongs}</p>
          <button 
            onClick={() => navigate('/selection')}
            className="bg-blue-500 text-white px-12 py-6 rounded-3xl text-4xl font-bold hover:bg-blue-600 transition-colors shadow-lg cursor-pointer"
          >
            {t.playMusic}
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full" : "flex flex-col gap-6 w-full max-w-4xl mx-auto"}>
          {sortedHistory.map((item) => {
            const ratingValues = Object.values(item.ratings || {}) as number[];
            const avgRating = ratingValues.length > 0 
              ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1) 
              : 'N/A';
            
            const timeString = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (viewMode === 'grid') {
              return (
                <div key={item.id} className="bg-white p-6 rounded-3xl shadow-md flex flex-col justify-between hover:bg-gray-50 transition-colors gap-6 border-2 border-transparent hover:border-blue-100">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-bold line-clamp-2">{item.title}</h3>
                      <span className="text-sm font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md shrink-0">{timeString}</span>
                    </div>
                    <p className="text-xl text-gray-600 line-clamp-1">{item.artist}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      <div className="text-3xl font-bold text-blue-600 flex items-baseline gap-1">
                        {avgRating} <span className="text-lg text-gray-400 font-normal">/ 5</span>
                      </div>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{ratingValues.length} {ratingValues.length === 1 ? t.vote : t.votes}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/play/${encodeURIComponent(item.title + ' ' + item.artist)}`)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors p-3 rounded-2xl cursor-pointer"
                      aria-label={`Play ${item.title} again`}
                    >
                      <PlayCircle size={32} />
                    </button>
                  </div>
                </div>
              );
            }

            // List View
            return (
              <div key={item.id} className="bg-white p-6 rounded-3xl shadow-md flex items-center justify-between hover:bg-gray-50 transition-colors border-2 border-transparent hover:border-blue-100">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-bold">{item.title}</h3>
                    <span className="text-sm font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{timeString}</span>
                  </div>
                  <p className="text-xl text-gray-600">{item.artist}</p>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-end">
                    <div className="text-4xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl flex items-baseline gap-1">
                      {avgRating} <span className="text-xl text-gray-400 font-normal">/ 5</span>
                    </div>
                    <span className="text-sm text-gray-400 mt-2 font-bold uppercase tracking-wider">{ratingValues.length} {ratingValues.length === 1 ? t.vote : t.votes}</span>
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
