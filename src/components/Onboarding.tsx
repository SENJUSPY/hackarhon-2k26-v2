import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, GraduationCap, Ruler, ChevronLeft } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { COURSES } from '../constants';
import { BRANCH_CONFIG } from '../data/branches';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

export const Onboarding = ({ userId, onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!selectedCourse || !selectedBranch) return;
    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      const path = `users/${userId}`;
      try {
        await updateDoc(userRef, {
          course: selectedCourse,
          branch: selectedBranch,
          onboardingCompleted: true
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
      onComplete();
    } catch (error) {
      console.error('Error updating onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const branches = selectedCourse ? BRANCH_CONFIG[selectedCourse as keyof typeof BRANCH_CONFIG] : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-4xl w-full text-center"
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <div className="mb-12">
                <h2 className="text-5xl font-display text-bg mb-4 tracking-tighter">SELECT YOUR PATH</h2>
                <p className="text-muted font-body text-lg">Choose your current academic course to personalize your experience.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {COURSES.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className={`relative p-10 rounded-[2.5rem] text-left transition-all duration-500 border-2 group ${
                      selectedCourse === course.id 
                        ? 'bg-accent border-accent text-dark shadow-[0_20px_50px_rgba(110,173,58,0.3)]' 
                        : 'bg-dark border-muted/20 text-bg hover:border-accent/50'
                    }`}
                  >
                    <div className="text-5xl mb-6">{course.icon}</div>
                    <h3 className="text-2xl font-display mb-2">{course.title}</h3>
                    <p className={`text-sm font-body ${selectedCourse === course.id ? 'text-dark/70' : 'text-muted/50'}`}>
                      {course.desc}
                    </p>
                    
                    {selectedCourse === course.id && (
                      <motion.div 
                        layoutId="check"
                        className="absolute top-6 right-6 w-8 h-8 bg-dark rounded-full flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 text-accent" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>

              <button
                disabled={!selectedCourse}
                onClick={() => setStep(2)}
                className={`px-12 py-5 rounded-2xl font-display text-xl uppercase tracking-widest transition-all flex items-center gap-3 mx-auto ${
                  selectedCourse
                    ? 'bg-accent text-dark hover:scale-105 shadow-xl'
                    : 'bg-muted/20 text-muted cursor-not-allowed'
                }`}
              >
                Next Step
                <ArrowRight className="w-6 h-6" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <div className="mb-12">
                <button 
                  onClick={() => setStep(1)}
                  className="mb-8 flex items-center gap-2 text-muted hover:text-accent transition-colors text-xs uppercase font-bold tracking-widest mx-auto"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Course
                </button>
                <h2 className="text-5xl font-display text-bg mb-4 tracking-tighter">CHOOSE YOUR BRANCH</h2>
                <p className="text-muted font-body text-lg">Select your engineering specialization to get relevant materials.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => setSelectedBranch(branch.id)}
                    className={`p-6 rounded-2xl text-center transition-all duration-300 border-2 ${
                      selectedBranch === branch.id 
                        ? 'bg-accent border-accent text-dark shadow-lg' 
                        : 'bg-dark border-muted/20 text-bg hover:border-accent/30'
                    }`}
                  >
                    <h3 className="text-lg font-display">{branch.name}</h3>
                  </button>
                ))}
              </div>

              <button
                disabled={!selectedBranch || isLoading}
                onClick={handleComplete}
                className={`px-12 py-5 rounded-2xl font-display text-xl uppercase tracking-widest transition-all flex items-center gap-3 mx-auto ${
                  selectedBranch && !isLoading
                    ? 'bg-accent text-dark hover:scale-105 shadow-xl'
                    : 'bg-muted/20 text-muted cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Setting up...' : 'Complete Setup'}
                <Check className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex justify-center gap-2">
          <div className={`w-8 h-2 rounded-full transition-all duration-500 ${step === 1 ? 'bg-accent' : 'bg-muted/30'}`}></div>
          <div className={`w-8 h-2 rounded-full transition-all duration-500 ${step === 2 ? 'bg-accent' : 'bg-muted/30'}`}></div>
        </div>
      </motion.div>
    </div>
  );
};
