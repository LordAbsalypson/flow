import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type Language = 'English' | 'German' | 'Finnish';

interface SessionContextType {
  sessionId: string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const SessionContext = createContext<SessionContextType>({
  sessionId: '',
  language: 'English',
  setLanguage: () => {},
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [language, setLanguageState] = useState<Language>('English');

  useEffect(() => {
    let storedId = localStorage.getItem('flow_session_id');
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem('flow_session_id', storedId);
    }
    setSessionId(storedId);

    // Initialize language from URL or localStorage
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang') as Language;
    const storedLang = localStorage.getItem('flow_language') as Language;
    
    if (urlLang && ['English', 'German', 'Finnish'].includes(urlLang)) {
      setLanguageState(urlLang);
      localStorage.setItem('flow_language', urlLang);
    } else if (storedLang && ['English', 'German', 'Finnish'].includes(storedLang)) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('flow_language', lang);
    
    // Update URL without reloading
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url.toString());
  };

  if (!sessionId) return null;

  return (
    <SessionContext.Provider value={{ sessionId, language, setLanguage }}>
      {children}
    </SessionContext.Provider>
  );
};
