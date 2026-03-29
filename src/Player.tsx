import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSongData, SongData } from './geminiService';
import { Info, SkipForward, Maximize, Minimize, ArrowLeft, Feather } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSession } from './SessionContext';
import { db, collection, addDoc, doc, setDoc, handleFirestoreError, OperationType } from './firebase';

export const Player: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { sessionId } = useSession();
  
  const [song, setSong] = useState<SongData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSimpleLyrics, setShowSimpleLyrics] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSong = async () => {
      try {
        setLoading(true);
        const data = await fetchSongData(category || 'random');
        setSong(data);
        
        // Create history doc
        if (sessionId) {
          const historyRef = collection(db, 'history');
          const newDoc = await addDoc(historyRef, {
            sessionId,
            videoId: data.videoId,
            title: data.title,
            artist: data.artist,
            timestamp: new Date().toISOString(),
            ratings: {},
            emojis: {},
          });
          
          // Update session doc
          await setDoc(doc(db, 'sessions', sessionId), {
            currentHistoryId: newDoc.id
          }, { merge: true });
        }
      } catch (error) {
        console.error("Error loading song:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSong();
  }, [category, sessionId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleNext = () => {
    navigate('/selection');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="text-5xl font-bold animate-pulse">Finding a song...</div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="text-5xl font-bold">Could not find a song.</div>
        <button onClick={() => navigate('/selection')} className="mt-8 bg-blue-500 text-white px-8 py-4 rounded-2xl text-3xl font-bold cursor-pointer">Go Back</button>
      </div>
    );
  }

  const baseUrl = window.location.origin;
  const qrUrl = `${baseUrl}/vote/${sessionId}`;

  return (
    <div className="flex flex-col gap-6 flex-1 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/selection')}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:bg-gray-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
          Back
        </button>
        <button 
          onClick={toggleFullscreen}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:bg-gray-400 transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {/* Top Row: Player & Next Song */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Player Container */}
          <div className="flex-1 flex flex-col gap-6">
            <div 
              ref={containerRef} 
              className={`relative bg-black rounded-[2rem] overflow-hidden shadow-2xl flex items-center justify-center ${
                isFullscreen ? 'w-screen h-screen rounded-none' : 'aspect-video w-full max-w-5xl mx-auto'
              }`}
            >
              <iframe
                src={`https://www.youtube.com/embed/${song.videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              ></iframe>
              
              {/* Omnipresent QR Code Overlay */}
              <div className={`absolute bottom-4 right-4 bg-white p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-2 transition-transform ${
                isFullscreen ? 'scale-125 origin-bottom-right bottom-8 right-8' : ''
              }`}>
                <QRCodeSVG value={qrUrl} size={isFullscreen ? 120 : 100} />
                <span className="text-sm font-bold text-center">Scan to Rate</span>
              </div>
            </div>
          </div>

          {/* Next Song Button (Side) */}
          <div className="lg:w-80 flex shrink-0">
            <button 
              onClick={handleNext}
              className="w-full bg-blue-500 text-white p-8 rounded-[2rem] shadow-xl hover:bg-blue-600 transition-colors flex flex-col items-center justify-center gap-6 group cursor-pointer"
            >
              <SkipForward size={80} className="group-hover:scale-110 transition-transform" />
              <span className="text-5xl font-bold text-center">Next Song</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Info & Lyrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl flex flex-col gap-4">
            <h2 className="text-5xl font-bold leading-tight">{song.title}</h2>
            <p className="text-3xl text-gray-600">{song.artist}</p>
            
            <div className="bg-gray-100 p-6 rounded-2xl mt-4">
              <h4 className="text-3xl font-bold mb-4 flex items-center gap-2"><Info size={28} /> Info</h4>
              <p className="text-2xl leading-relaxed">{song.info}</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-4xl font-bold">Lyrics</h3>
              <div className="flex bg-gray-200 rounded-xl p-1">
                <button 
                  onClick={() => setShowSimpleLyrics(true)}
                  className={`px-6 py-3 rounded-lg text-2xl font-bold transition-colors cursor-pointer flex items-center gap-2 ${showSimpleLyrics ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                  <Feather size={24} /> Summary
                </button>
                <button 
                  onClick={() => setShowSimpleLyrics(false)}
                  className={`px-6 py-3 rounded-lg text-2xl font-bold transition-colors cursor-pointer ${!showSimpleLyrics ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                  Original
                </button>
              </div>
            </div>
            
            <div className={`relative flex-1 bg-gray-50 p-6 rounded-2xl text-3xl leading-relaxed whitespace-pre-wrap transition-all duration-300 ${isLyricsExpanded ? '' : 'max-h-[300px] overflow-hidden'}`}>
              {showSimpleLyrics ? song.simplifiedLyrics : song.originalLyrics}
              
              {!isLyricsExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent flex items-end justify-center pb-4">
                  <button 
                    onClick={() => setIsLyricsExpanded(true)}
                    className="bg-gray-800 text-white px-6 py-3 rounded-xl text-2xl font-bold hover:bg-gray-700 transition-colors shadow-lg cursor-pointer"
                  >
                    Read More
                  </button>
                </div>
              )}
            </div>
            {isLyricsExpanded && (
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={() => setIsLyricsExpanded(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl text-2xl font-bold hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Show Less
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
