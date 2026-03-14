/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { AppExplainer } from './components/AppExplainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | undefined>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setShowAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {currentBookId ? (
          <motion.div 
            key="reader"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-screen w-full"
          >
            <Reader bookId={currentBookId} onBack={() => setCurrentBookId(null)} />
          </motion.div>
        ) : (
          <motion.div 
            key="library"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-screen"
          >
            <Library 
              onOpenBook={setCurrentBookId} 
              onRequireAuth={() => {
                setAuthMessage("Please enter your details for our verification of humans and for your materials/resources purpose so we need your details");
                setShowAuth(true);
              }} 
              headerActions={
                user ? (
                  <button 
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-2 sm:gap-3 bg-zinc-900/80 backdrop-blur-md pl-1.5 pr-3 sm:pr-4 py-1.5 rounded-full border border-zinc-800 hover:bg-zinc-800 transition-colors whitespace-nowrap"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs sm:text-sm">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium text-zinc-200 hidden sm:block">{user.displayName || user.email}</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setAuthMessage(undefined);
                      setShowAuth(true);
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Sign In
                  </button>
                )
              }
            />
            {showProfile && user && <Profile user={user} onClose={() => setShowProfile(false)} />}
            {showAuth && !user && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="relative w-full max-w-md my-auto">
                  <button 
                    onClick={() => setShowAuth(false)}
                    className="absolute -top-12 right-0 text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 p-2 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <Auth 
                    isModal={true} 
                    message={authMessage} 
                    initialIsLogin={!authMessage}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <AppExplainer />
    </ErrorBoundary>
  );
}
