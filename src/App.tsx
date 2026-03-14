import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import Landing from './components/Landing';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Auth } from './components/Auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Profile } from './components/Profile';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'library' | 'reader' | 'profile'>('landing');
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user && view === 'landing') {
        setView('library');
      }
    });
    return () => unsubscribe();
  }, [view]);

  const handleGetStarted = () => {
    if (user) {
      setView('library');
    } else {
      setShowAuth(true);
    }
  };

  const handleOpenBook = (id: string) => {
    setActiveBookId(id);
    setView('reader');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-green border-t-transparent"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-snow font-body selection:bg-green/30">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Landing onGetStarted={handleGetStarted} />
            </motion.div>
          )}

          {view === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Library 
                onOpenBook={handleOpenBook} 
                onRequireAuth={() => setShowAuth(true)}
                headerActions={
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setView('profile')}
                      className="p-2 bg-obsidian text-snow hover:bg-green hover:text-obsidian transition-all"
                    >
                      <UserIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => auth.signOut()}
                      className="p-2 bg-obsidian text-snow hover:bg-red-500 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                }
              />
            </motion.div>
          )}

          {view === 'reader' && activeBookId && (
            <motion.div
              key="reader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <Reader bookId={activeBookId} onBack={() => setView('library')} />
            </motion.div>
          )}

          {view === 'profile' && user && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Profile user={user} onClose={() => setView('library')} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAuth && !user && (
            <Auth />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default App;
