import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Search as SearchIcon, Shuffle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const Selection: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{title: string, artist: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const moods = [
    { id: 'calm', label: 'Calm', emojiUrl: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Relieved%20face/3D/relieved_face_3d.png' },
    { id: 'happy', label: 'Happy', emojiUrl: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smiling%20face%20with%20smiling%20eyes/3D/smiling_face_with_smiling_eyes_3d.png' },
    { id: 'sad', label: 'Sad', emojiUrl: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pensive%20face/3D/pensive_face_3d.png' },
    { id: 'angry', label: 'Angry', emojiUrl: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pouting%20face/3D/pouting_face_3d.png' },
    { id: 'energetic', label: 'Energetic', emojiUrl: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Grinning%20face%20with%20sweat/3D/grinning_face_with_sweat_3d.png' },
    { id: 'relaxing', label: 'Relaxing', emojiUrl: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Yawning%20face/3D/yawning_face_3d.png' },
  ];

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length > 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Suggest 3 popular songs matching the search query: "${searchQuery}". Return ONLY a JSON array of objects with "title" and "artist".`,
            config: {
              responseMimeType: 'application/json',
            }
          });
          const data = JSON.parse(response.text || '[]');
          setSearchResults(data);
        } catch (e) {
          console.error("Search error:", e);
        } finally {
          setIsSearching(false);
        }
      }, 800); // 800ms debounce
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  return (
    <div className="flex flex-col flex-1 gap-8">
      <h2 className="text-7xl font-bold text-center mb-8">Selection</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
        {/* Search Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl flex flex-col gap-4 border-4 border-transparent focus-within:border-blue-600">
          <div className="flex items-center gap-4 text-5xl font-bold mb-4">
            <SearchIcon size={48} /> Search
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a song..."
            className="w-full text-3xl p-4 bg-gray-100 rounded-xl outline-none"
          />
          {isSearching && <div className="text-2xl text-gray-500">Searching...</div>}
          {searchResults.length > 0 && !isSearching && (
            <div className="flex flex-col gap-2 mt-4">
              {searchResults.map((res, idx) => (
                <button 
                  key={idx}
                  onClick={() => navigate(`/play/${encodeURIComponent(res.title + ' ' + res.artist)}`)}
                  className="text-left p-4 bg-gray-50 hover:bg-gray-200 rounded-xl text-2xl font-bold transition-colors cursor-pointer"
                >
                  {res.title} - {res.artist}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Random Card */}
        <button
          onClick={() => navigate(`/play/random`)}
          className="bg-white text-black text-5xl font-bold py-16 px-8 rounded-[2rem] shadow-xl hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-6 focus:ring-8 focus:ring-blue-500 outline-none border-4 border-transparent focus:border-blue-600 cursor-pointer"
        >
          <Shuffle size={64} />
          <span>Random</span>
        </button>

        {/* Mood Cards */}
        {moods.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/play/${cat.id}`)}
            className="bg-white text-black text-5xl font-bold py-16 px-8 rounded-[2rem] shadow-xl hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-6 focus:ring-8 focus:ring-blue-500 outline-none border-4 border-transparent focus:border-blue-600 cursor-pointer"
          >
            <img src={cat.emojiUrl} alt={cat.label} className="w-24 h-24 object-contain" referrerPolicy="no-referrer" />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
