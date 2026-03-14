import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';
import { auth } from '../lib/firebase';
import { sendEmailVerification } from 'firebase/auth';

export const EmailVerification = () => {
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setIsSent(true);
      setTimeout(() => setIsSent(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-dark p-10 rounded-[2.5rem] text-center shadow-2xl border border-muted/10"
      >
        <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Mail className="w-10 h-10 text-accent" />
        </div>

        <h2 className="text-3xl font-display text-bg mb-4 uppercase tracking-tight">Verify Your Email</h2>
        <p className="text-muted font-body mb-8">
          We've sent a verification link to <span className="text-accent font-medium">{auth.currentUser?.email}</span>. Please check your inbox and click the link to activate your account.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-accent text-dark rounded-2xl font-display text-lg uppercase tracking-wider hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
          >
            I've Verified
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            disabled={isLoading || isSent}
            onClick={handleResend}
            className="w-full py-4 bg-transparent border border-muted/20 text-muted rounded-2xl font-display text-sm uppercase tracking-widest hover:bg-muted/5 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isSent ? (
              <CheckCircle className="w-4 h-4 text-accent" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isSent ? 'Email Sent!' : 'Resend Verification Email'}
          </button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-body"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}

        <p className="mt-10 text-xs text-muted/40 font-body uppercase tracking-[0.2em]">
          PolyDime Security System
        </p>
      </motion.div>
    </div>
  );
};
