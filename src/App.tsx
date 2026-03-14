import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import Landing from './components/Landing';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Auth } from './components/Auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, User as UserIcon, AlertCircle, BookOpen } from 'lucide-react';
import { Profile } from './components/Profile';
import { Onboarding } from './components/Onboarding';
import { EmailVerification } from './components/EmailVerification';
import { ChatBot } from './components/ChatBot';
import { useTutorial } from './components/Tutorial';
import { Materials } from './components/Materials';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'library' | 'materials' | 'reader' | 'profile'>('landing');
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);

  // Initialize tutorial
  useTutorial(!!user && !!userProfile && userProfile.onboardingCompleted && view === 'library');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserProfile(null);
        setLoading(false);
        setView('landing');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleGetStarted = () => {
    if (user) {
      setView('library');
    } else {
      setShowAuth(true);
    }
  };

  const handleOpenBook = (id: string) => {
    setActiveBookId(id);
    setActiveMaterial(null);
    setView('reader');
  };

  const handleOpenMaterial = (material: any) => {
    setActiveMaterial(material);
    setActiveBookId(null);
    setView('reader');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Verification & Onboarding Logic
  if (user && !user.emailVerified) {
    return <EmailVerification />;
  }

  if (user && userProfile && !userProfile.onboardingCompleted) {
    return <Onboarding userId={user.uid} onComplete={() => {}} />;
  }

  if (user && !userProfile && !loading) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-accent mb-6" />
        <h2 className="text-3xl font-display text-bg mb-4">PROFILE NOT FOUND</h2>
        <p className="text-muted/60 font-body mb-8 max-w-md">
          We couldn't find your academic profile. This might be due to a connection issue or a setup error.
        </p>
        <button 
          onClick={() => auth.signOut()}
          className="px-8 py-4 bg-accent text-dark font-display uppercase tracking-widest rounded-2xl hover:bg-bg transition-all"
        >
          Sign Out & Try Again
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg font-body selection:bg-accent/30">
        {/* Navigation Bar (Logged In) */}
        {user && view !== 'landing' && view !== 'reader' && (
          <nav className="fixed top-0 left-0 right-0 z-[80] bg-bg/80 backdrop-blur-md border-b border-muted/10 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('library')}>
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-dark" />
                  </div>
                  <span className="font-display text-xl tracking-tighter hidden sm:block">
                    <span className="text-dark">POLY</span>
                    <span className="text-accent">DIME</span>
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-muted/10 p-1 rounded-xl">
                  <button 
                    onClick={() => setView('library')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                      view === 'library' ? 'bg-white text-dark shadow-sm' : 'text-dark/40 hover:text-dark'
                    }`}
                  >
                    My Library
                  </button>
                  <button 
                    onClick={() => setView('materials')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                      view === 'materials' ? 'bg-white text-dark shadow-sm' : 'text-dark/40 hover:text-dark'
                    }`}
                  >
                    Materials
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setView('profile')}
                  className={`p-2 transition-all rounded-full ${
                    view === 'profile' ? 'bg-accent text-dark' : 'bg-dark text-bg hover:bg-accent hover:text-dark'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => auth.signOut()}
                  className="p-2 bg-dark text-bg hover:bg-red-500 transition-all rounded-full"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </nav>
        )}

        {/* Unverified Banner */}
        {user && !user.emailVerified && (
          <div className="bg-accent text-dark py-2 px-4 text-center font-display text-xs tracking-widest flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            PLEASE VERIFY YOUR EMAIL TO UNLOCK ALL FEATURES
          </div>
        )}

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
              />
            </motion.div>
          )}

          {view === 'materials' && userProfile && (
            <motion.div
              key="materials"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Materials 
                course={userProfile.course} 
                branch={userProfile.branch} 
                onOpenMaterial={handleOpenMaterial} 
              />
            </motion.div>
          )}

          {view === 'reader' && (activeBookId || activeMaterial) && (
            <motion.div
              key="reader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <Reader 
                bookId={activeBookId || undefined} 
                material={activeMaterial || undefined}
                onBack={() => setView(activeMaterial ? 'materials' : 'library')} 
              />
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
            <div className="fixed inset-0 z-[100]">
              <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={() => setShowAuth(false)} />
              <Auth onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
            </div>
          )}
        </AnimatePresence>

        {user && <ChatBot />}
      </div>
    </ErrorBoundary>
  );
};

export default App;
