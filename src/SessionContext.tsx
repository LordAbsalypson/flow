import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface SessionContextType {
  sessionId: string;
}

const SessionContext = createContext<SessionContextType>({
  sessionId: '',
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let storedId = localStorage.getItem('flow_session_id');
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem('flow_session_id', storedId);
    }
    setSessionId(storedId);
  }, []);

  if (!sessionId) return null;

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
};
