import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, GraduationCap, Hash, BookOpen, ArrowRight, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AUTH_ERRORS, APP_NAME } from '../constants';

interface AuthProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const Auth = ({ onClose, onSuccess }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [course, setCourse] = useState('btech');
  const [branch, setBranch] = useState('');
  const [yearOfCourse, setYearOfCourse] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const getErrorMessage = (code: string) => {
    return AUTH_ERRORS[code] || AUTH_ERRORS['default'];
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const path = `users/${user.uid}`;
        try {
          await setDoc(doc(db, 'users', user.uid), {
            name: user.displayName || '',
            email: user.email || '',
            collegeName: '',
            rollNumber: '',
            curriculum: 'Polytechnic Telangana, India',
            course: 'btech', // Default course
            branch: '',
            yearOfCourse: '',
            onboardingCompleted: false,
            emailVerified: user.emailVerified
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
      onSuccess?.();
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!isLogin && password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onSuccess?.();
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(result.user);
        const path = `users/${result.user.uid}`;
        try {
          await setDoc(doc(db, 'users', result.user.uid), {
            name,
            email,
            collegeName,
            rollNumber,
            curriculum: 'Polytechnic Telangana, India',
            course,
            branch,
            yearOfCourse,
            onboardingCompleted: false,
            emailVerified: false
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
        setMessage('Account created! Please check your email to verify your account.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/90 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-4xl w-full bg-bg rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        {/* Left Side - Branding */}
        <div className="md:w-1/3 bg-dark p-10 text-bg flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-dark" />
              </div>
              <span className="font-display text-2xl tracking-tighter">
                <span className="text-bg">POLY</span>
                <span className="text-accent">DIME</span>
              </span>
            </div>
            <h2 className="text-4xl font-display leading-none mb-6">
              {isLogin ? 'WELCOME BACK' : 'JOIN THE VERSE'}
            </h2>
            <p className="text-muted/60 text-sm font-body leading-relaxed">
              {isLogin 
                ? 'Your academic journey continues here. Sign in to access your materials.' 
                : 'Create your professional academic profile and access curated study resources.'}
            </p>
          </div>
          
          <div className="relative z-10 hidden md:block">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted/40 mb-2">Academic Excellence</div>
            <div className="font-display text-muted/60 text-xl tracking-widest">EST. 2026</div>
          </div>

          {/* Decorative background elements */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-2/3 p-10 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-end mb-4">
            {onClose && (
              <button 
                onClick={onClose}
                className="p-2 hover:bg-muted/20 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-dark/40" />
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-dark/40">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
                        <input 
                          type="text" 
                          required 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-muted/20 border-none rounded-2xl focus:ring-2 focus:ring-accent transition-all outline-none font-body"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-dark/40">Roll Number</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
                        <input 
                          type="text" 
                          required 
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-muted/20 border-none rounded-2xl focus:ring-2 focus:ring-accent transition-all outline-none font-body"
                          placeholder="22001-CM-001"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-dark/40">College Name</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
                        <input 
                          type="text" 
                          required 
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-muted/20 border-none rounded-2xl focus:ring-2 focus:ring-accent transition-all outline-none font-body"
                          placeholder="Government Polytechnic"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-dark/40">Course</label>
                      <select 
                        required
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full px-4 py-3 bg-muted/20 border-none rounded-2xl focus:ring-2 focus:ring-accent transition-all outline-none font-body appearance-none"
                      >
                        <option value="btech">B.Tech</option>
                        <option value="diploma">Diploma</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-dark/40">Branch</label>
                      <input 
                        type="text" 
                        required 
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-4 py-3 bg-muted/20 border-none rounded-2xl focus:ring-2 focus:ring-accent transition-all outline-none font-body"
                        placeholder="CME / ECE / EEE"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-dark/40">Year</label>
                      <select 
                        required
                        value={yearOfCourse}
                        onChange={(e) => setYearOfCourse(e.target.value)}
                        className="w-full px-4 py-3 bg-muted/20 border-none rounded-2xl focus:ring-2 focus:ring-accent transition-all outline-none font-body appearance-none"
                      >
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-dark/40">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-muted/20 border-none rounded-2xl focus:ring-2 focus:ring-accent transition-all outline-none font-body"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-dark/40">Password</label>
                    {isLogin && (
                      <button 
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[10px] uppercase font-bold tracking-widest text-accent hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-muted/20 border-none rounded-2xl focus:ring-2 focus:ring-accent transition-all outline-none font-body"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-dark/5 rounded-lg transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-dark/30" /> : <Eye className="w-4 h-4 text-dark/30" />}
                    </button>
                  </div>
                  {!isLogin && password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div 
                            key={i} 
                            className={`flex-1 rounded-full transition-all duration-500 ${
                              passwordStrength(password) >= i * 25 ? 'bg-accent' : 'bg-muted/30'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[8px] uppercase font-bold tracking-widest text-dark/30">
                        Password Strength: {passwordStrength(password)}%
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between"
                  >
                    <p className="text-red-600 text-xs font-medium">{error}</p>
                    <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {message && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-accent/10 border border-accent/20 rounded-2xl"
                  >
                    <p className="text-accent text-xs font-medium">{message}</p>
                  </motion.div>
                )}

                <div className="flex gap-4">
                  {onClose && (
                    <button 
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-4 bg-muted/20 text-dark rounded-2xl font-display uppercase tracking-widest hover:bg-muted/30 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] py-4 bg-dark text-bg rounded-2xl font-display uppercase tracking-widest hover:bg-accent hover:text-dark transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted/30"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                    <span className="bg-bg px-4 text-dark/30">Or continue with</span>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-4 bg-white border border-muted/30 text-dark rounded-2xl font-bold hover:bg-muted/10 transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  Google Account
                </button>

                <p className="text-center text-sm text-dark/60 mt-6">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-accent font-bold hover:underline ml-1"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
