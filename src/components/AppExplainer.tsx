import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Zap, Shield, Info } from 'lucide-react';

export const AppExplainer = () => {
  return (
    <div className="p-8 bg-obsidian text-snow rounded-[2rem] border border-silver/10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-green rounded-xl flex items-center justify-center">
          <Info className="w-6 h-6 text-obsidian" />
        </div>
        <h2 className="text-2xl font-display uppercase tracking-widest">Flipverse Guide</h2>
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="w-8 h-8 bg-silver/5 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-green" />
          </div>
          <div>
            <h3 className="font-display text-lg mb-1">IMMERSE IN 3D</h3>
            <p className="text-sm text-silver/40 font-body">Drag or click the corners of the book to flip pages. Experience the tactile feel of a real book.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 bg-silver/5 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-green" />
          </div>
          <div>
            <h3 className="font-display text-lg mb-1">AI-POWERED COVERS</h3>
            <p className="text-sm text-silver/40 font-body">Upload any PDF and let Gemini generate a stunning artistic cover for your library.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 bg-silver/5 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-green" />
          </div>
          <div>
            <h3 className="font-display text-lg mb-1">DEEP FOCUS MODE</h3>
            <p className="text-sm text-silver/40 font-body">Switch between Light, Dark, and Sepia themes to find your perfect reading environment.</p>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-silver/10">
        <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-silver/20 mb-4 text-center">Engineered for Excellence</div>
        <div className="flex justify-center gap-4 opacity-20 grayscale">
          <BookOpen className="w-5 h-5" />
          <Sparkles className="w-5 h-5" />
          <Shield className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
