import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface AuthProps {
  message?: string;
  isModal?: boolean;
  initialIsLogin?: boolean;
}

export function Auth({ message, isModal, initialIsLogin = true }: AuthProps) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Create user document
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name,
          email,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isModal ? "w-full text-zinc-100" : "min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100 p-4 sm:p-8"}>
      <motion.div 
        initial={isModal ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 shadow-2xl ${isModal ? '' : 'mx-auto'}`}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 mb-4">
            <BookOpen className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-serif tracking-tight text-zinc-100">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          {message && (
            <p className="text-red-400 mt-4 text-center text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              {message}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-400 hover:text-zinc-100 text-sm transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
