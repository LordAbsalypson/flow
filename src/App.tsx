import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './SessionContext';
import { Layout } from './Layout';
import { Home } from './Home';
import { Selection } from './Selection';
import { Player } from './Player';
import { Feedback } from './Feedback';
import { Library } from './Library';
import { Rate } from './Rate';
import { GdprInfo } from './GdprInfo';

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/selection" element={<Selection />} />
            <Route path="/play/:category" element={<Player />} />
            <Route path="/feedback/:historyId" element={<Feedback />} />
            <Route path="/library" element={<Library />} />
            <Route path="/vote/:sessionId" element={<Rate />} />
            <Route path="/gdpr" element={<GdprInfo />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SessionProvider>
  );
}
