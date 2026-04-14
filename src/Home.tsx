import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Library, ShieldAlert, X } from 'lucide-react';
import { useSession } from './SessionContext';
import { translations } from './translations';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useSession();
  const t = translations[language];

  const [gdprStatus, setGdprStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [showModal, setShowModal] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  useEffect(() => {
    const storedTime = localStorage.getItem('flow_gdpr_time');
    if (storedTime && Date.now() - parseInt(storedTime) < 24 * 60 * 60 * 1000) {
      setGdprStatus('accepted');
    } else {
      setGdprStatus('pending');
      setShowModal(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('flow_gdpr_time', Date.now().toString());
    setGdprStatus('accepted');
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setGdprStatus('rejected');
    setShowModal(false);
  };

  const handlePlayClick = () => {
    if (gdprStatus === 'accepted') {
      navigate('/selection');
    } else {
      setShowModal(true);
    }
  };

  const gdprBorder = gdprStatus === 'accepted' ? 'border-green-500' : (gdprStatus === 'rejected' ? 'border-red-500' : 'border-gray-200');

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-12 relative">
      <h1 className="text-6xl font-bold text-center mb-4">{t.welcome}</h1>
      <button
        onClick={handlePlayClick}
        className="bg-white text-black text-6xl font-bold py-12 px-24 rounded-[3rem] shadow-xl hover:bg-gray-100 transition-colors flex items-center gap-6 focus:ring-8 focus:ring-blue-500 outline-none border-4 border-transparent focus:border-blue-600 cursor-pointer"
        aria-label={t.play}
      >
        {t.play} <Play size={64} fill="currentColor" />
      </button>

      <button
        onClick={() => navigate('/library')}
        className="bg-gray-200 text-black text-4xl font-bold py-8 px-16 rounded-3xl shadow-md hover:bg-gray-300 transition-colors flex items-center gap-4 focus:ring-8 focus:ring-gray-400 outline-none border-4 border-transparent focus:border-gray-600 cursor-pointer"
        aria-label={t.library}
      >
        {t.library} <Library size={40} />
      </button>

      <button
        onClick={() => navigate('/gdpr')}
        className={`absolute bottom-6 left-6 bg-white text-gray-600 text-xl font-bold py-3 px-6 rounded-xl shadow-md hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer border-4 ${gdprBorder}`}
        aria-label={t.gdpr}
      >
        <ShieldAlert size={24} />
        {t.gdpr}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative flex flex-col gap-6">
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-gray-500 hover:text-black cursor-pointer"
            >
              <X size={32} />
            </button>
            <h3 className="text-4xl font-bold pr-12 text-blue-600">{t.gdprModalTitle}</h3>
            <p className="text-2xl text-gray-700 leading-relaxed">
              {t.gdprModalText}
            </p>
            
            <button 
              onClick={() => navigate('/gdpr')}
              className="text-blue-500 underline text-xl font-bold self-start hover:text-blue-700 cursor-pointer"
            >
              {t.gdprModalLink}
            </button>

            <div className="bg-gray-100 p-6 rounded-2xl flex items-start gap-4 mt-4">
              <input 
                type="checkbox" 
                id="gdpr-check" 
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
                className="w-8 h-8 mt-1 cursor-pointer"
              />
              <label htmlFor="gdpr-check" className="text-xl font-bold text-gray-800 cursor-pointer select-none">
                {t.gdprModalCheckbox}
              </label>
            </div>

            <button 
              onClick={handleAccept}
              disabled={!checkboxChecked}
              className={`mt-4 w-full py-4 rounded-2xl font-bold text-2xl transition-colors ${
                checkboxChecked ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t.gdprModalAccept}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
