import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api, socket } from './api';
import { v4 as uuidv4 } from 'uuid';
import { X } from 'lucide-react';

export const Rate: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  
  const [rating, setRating] = useState<number | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState<string>('');
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [showGdprPopup, setShowGdprPopup] = useState(false);
  const [searchParams] = useSearchParams();
  const lang = searchParams.get('lang') || 'English';

  const gdprContent = {
    English: {
      button: "Privacy Info",
      title: "Data Privacy Information",
      text: "This app uses cookies and local storage to save your session. A random unique ID (UUID) is generated to link your ratings to your device. No personal data (like your name or email) is collected or stored. By using this app, you agree to this data processing."
    },
    German: {
      button: "Datenschutz-Info",
      title: "Datenschutzinformationen",
      text: "Diese App verwendet Cookies und lokalen Speicher, um Ihre Sitzung zu speichern. Eine zufällige eindeutige ID (UUID) wird generiert, um Ihre Bewertungen mit Ihrem Gerät zu verknüpfen. Es werden keine persönlichen Daten (wie Ihr Name oder Ihre E-Mail-Adresse) gesammelt oder gespeichert. Durch die Nutzung dieser App stimmen Sie dieser Datenverarbeitung zu."
    },
    Finnish: {
      button: "Tietosuojatiedot",
      title: "Tietosuojatiedot",
      text: "Tämä sovellus käyttää evästeitä ja paikallista tallennustilaa istuntosi tallentamiseen. Satunnainen yksilöllinen tunnus (UUID) luodaan arvioidesi yhdistämiseksi laitteeseesi. Henkilökohtaisia tietoja (kuten nimeäsi tai sähköpostiosoitettasi) ei kerätä tai tallenneta. Käyttämällä tätä sovellusta hyväksyt tämän tietojenkäsittelyn."
    }
  };

  const currentGdpr = gdprContent[lang as keyof typeof gdprContent] || gdprContent.English;

  const emojis = [
    { id: 'sad', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pensive%20face/3D/pensive_face_3d.png' },
    { id: 'happy', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smiling%20face%20with%20smiling%20eyes/3D/smiling_face_with_smiling_eyes_3d.png' },
    { id: 'angry', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pouting%20face/3D/pouting_face_3d.png' },
    { id: 'calm', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Relieved%20face/3D/relieved_face_3d.png' },
    { id: 'confused', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Face%20with%20rolling%20eyes/3D/face_with_rolling_eyes_3d.png' },
    { id: 'relaxing', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Yawning%20face/3D/yawning_face_3d.png' },
  ];

  useEffect(() => {
    let storedUserId = localStorage.getItem('flow_voter_id');
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('flow_voter_id', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Listen to the session document to know which song is currently playing
  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const data = await api.sessions.get(sessionId);
        if (data.currentHistoryId && data.currentHistoryId !== currentHistoryId) {
          setCurrentHistoryId(data.currentHistoryId);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSession();

    const handleSessionUpdated = (data: any) => {
      if (data.id === sessionId && data.currentHistoryId !== currentHistoryId) {
        setCurrentHistoryId(data.currentHistoryId);
      }
    };

    socket.on('sessionUpdated', handleSessionUpdated);
    return () => {
      socket.off('sessionUpdated', handleSessionUpdated);
    };
  }, [sessionId, currentHistoryId]);

  // Listen to the current history document to sync rating and emoji
  useEffect(() => {
    if (!currentHistoryId || !userId) return;

    const fetchHistory = async () => {
      try {
        const data = await api.history.getSingle(currentHistoryId);
        setSongTitle(data.title || '');
        const userRating = data.ratings && data.ratings[userId] ? data.ratings[userId] : null;
        const userEmoji = data.emojis && data.emojis[userId] ? data.emojis[userId] : null;
        setRating(userRating);
        setEmoji(userEmoji);
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();

    const handleHistoryUpdated = (data: any) => {
      if (data.id === currentHistoryId) {
        fetchHistory();
      }
    };

    socket.on('historyUpdated', handleHistoryUpdated);
    return () => {
      socket.off('historyUpdated', handleHistoryUpdated);
    };
  }, [currentHistoryId, userId]);

  const handleRate = async (newRating: number) => {
    if (!currentHistoryId || !userId) return;
    setRating(newRating);
    try {
      await api.history.vote(currentHistoryId, userId, { rating: newRating });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEmoji = async (newEmoji: string) => {
    if (!currentHistoryId || !userId) return;
    setEmoji(newEmoji);
    try {
      await api.history.vote(currentHistoryId, userId, { emoji: newEmoji });
    } catch (error) {
      console.error(error);
    }
  };

  if (!currentHistoryId) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="text-3xl sm:text-4xl font-bold text-center">Waiting for a song to play...</div>
      </div>
    );
  }

  const selectedEmojiObj = emojis.find(e => e.id === emoji);

  return (
    <div className="flex flex-col items-center flex-1 p-2 sm:p-4 font-sans w-full">
      <div className="w-full max-w-md flex flex-col items-center gap-4 sm:gap-6 mt-4 sm:mt-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center underline decoration-4 underline-offset-8 mb-2 sm:mb-4 px-2">{songTitle}</h2>
        
        <div className="text-7xl sm:text-8xl md:text-9xl font-bold mb-2 sm:mb-4 h-20 sm:h-24 flex items-center justify-center">
          {rating !== null ? rating : ''}
        </div>

        <div className="flex justify-center gap-2 sm:gap-4 w-full mb-6 sm:mb-8 flex-wrap px-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => handleRate(num)}
              className={`w-12 h-12 min-w-[3rem] min-h-[3rem] sm:w-14 sm:h-14 sm:min-w-[3.5rem] sm:min-h-[3.5rem] md:w-16 md:h-16 md:min-w-[4rem] md:min-h-[4rem] shrink-0 rounded-full text-2xl sm:text-3xl md:text-4xl font-bold flex items-center justify-center border-4 border-black transition-all cursor-pointer ${
                rating === num 
                  ? 'bg-white text-black scale-110' 
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
              aria-label={`Rate ${num} out of 5`}
            >
              {num}
            </button>
          ))}
        </div>

        <div className="h-24 sm:h-32 mb-6 sm:mb-8 flex items-center justify-center">
          {selectedEmojiObj && (
            <img src={selectedEmojiObj.url} alt={selectedEmojiObj.id} className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-xl" referrerPolicy="no-referrer" />
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-[280px] sm:max-w-none px-4 sm:px-0">
          {emojis.map((e) => (
            <button
              key={e.id}
              onClick={() => handleEmoji(e.id)}
              className={`p-2 bg-white border-4 border-black transition-all flex items-center justify-center cursor-pointer aspect-square ${
                emoji === e.id 
                  ? 'scale-110 shadow-xl' 
                  : 'hover:bg-gray-100'
              }`}
              aria-label={`Select emoji ${e.id}`}
            >
              <img src={e.url} alt={e.id} className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
        
        <div className="text-lg sm:text-xl md:text-2xl text-gray-600 text-center mt-6 sm:mt-8 px-4">
          Your vote is saved automatically.
        </div>

        <button 
          onClick={() => setShowGdprPopup(true)}
          className="mt-8 text-sm sm:text-base text-gray-500 underline cursor-pointer hover:text-gray-700"
        >
          {currentGdpr.button}
        </button>
      </div>

      {showGdprPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => setShowGdprPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-4 pr-8">{currentGdpr.title}</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {currentGdpr.text}
            </p>
            <button 
              onClick={() => setShowGdprPopup(false)}
              className="mt-6 w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-xl hover:bg-blue-600 cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
