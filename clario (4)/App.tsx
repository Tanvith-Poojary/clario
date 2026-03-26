
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import { storageService } from './services/storageService';
import Dashboard from './pages/Dashboard';
import AiMotivator from './pages/AiMotivator';
import Journeys from './pages/Journeys';
import Community from './pages/Community';
import UnsentLetters from './pages/UnsentLetters';
import Profile from './pages/Profile';
import Resources from './pages/Resources';
import Auth from './pages/Auth';
import Navigation from './components/Navigation';
import { Logo } from './components/Logo';

const Splash: React.FC = () => (
  <div className="fixed inset-0 bg-motiora-dark flex items-center justify-center z-50 animate-fade-in">
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center">
        <Logo 
          size={96} 
          className="text-motiora-accent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
        />
      </div>
      <p className="text-motiora-muted text-sm">Entering quiet space...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Helper to fetch user data when auth state changes
  const fetchUserData = async () => {
    const u = await storageService.getUser();
    setUser(u);
  };

  useEffect(() => {
    // Use the storage service's auth subscription instead of Firebase directly
    const unsubscribe = storageService.subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Splash />;
  }

  // Auth Guard
  if (!user) {
    return <Auth />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-motiora-dark text-motiora-text font-sans selection:bg-motiora-accent/30 selection:text-white">
        <div className="flex flex-col md:flex-row min-h-screen">
          <Navigation />
          <main className="flex-1 p-4 md:p-8 md:ml-24 overflow-x-hidden">
             <Routes>
               <Route path="/" element={<Dashboard user={user} refreshUser={fetchUserData} />} />
               <Route path="/motivator" element={<AiMotivator />} />
               <Route path="/journeys" element={<Journeys />} />
               <Route path="/community" element={<Community />} />
               <Route path="/letters" element={<UnsentLetters />} />
               <Route path="/profile" element={<Profile refreshUser={fetchUserData} />} />
               <Route path="/resources" element={<Resources />} />
               <Route path="*" element={<Navigate to="/" replace />} />
             </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
