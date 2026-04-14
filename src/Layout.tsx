import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession, Language } from './SessionContext';
import { Globe } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useSession();
  
  const isVotePage = location.pathname.startsWith('/vote');

  return (
    <div className="min-h-screen bg-gray-300 text-black font-sans flex flex-col items-center">
      <header className="w-full p-4 flex justify-between items-center bg-blue-500 text-white shadow-md">
        <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center">
          <div 
            className={`flex items-center gap-2 ${isVotePage ? '' : 'cursor-pointer'}`} 
            onClick={() => { if (!isVotePage) navigate('/'); }}
            role={isVotePage ? 'presentation' : 'button'}
            tabIndex={isVotePage ? -1 : 0}
            aria-label={isVotePage ? undefined : "Go to Home"}
          >
            <div className="flex gap-1">
              <div className="w-3 h-8 bg-white rounded-full"></div>
              <div className="w-3 h-12 bg-white rounded-full"></div>
              <div className="w-3 h-8 bg-white rounded-full"></div>
            </div>
            <h1 className="text-4xl font-bold ml-2">Flow</h1>
          </div>
          
          {!isVotePage && (
            <div className="flex items-center gap-2 bg-blue-600 rounded-xl px-4 py-2">
              <Globe size={24} />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-white text-xl font-bold outline-none cursor-pointer"
              >
                <option value="English" className="text-black">English</option>
                <option value="German" className="text-black">Deutsch</option>
                <option value="Finnish" className="text-black">Suomi</option>
              </select>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-6 flex flex-col">
        {children}
      </main>
    </div>
  );
};
