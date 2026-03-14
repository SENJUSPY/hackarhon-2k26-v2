import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Zap, Shield, ArrowRight, MessageSquare } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

const Landing = ({ onGetStarted }: LandingProps) => {
  const features = [
    {
      title: "BRANCH-SPECIFIC",
      desc: "Instant access to textbooks and notes tailored to your specific engineering branch.",
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      title: "SMART SUMMARIES",
      desc: "AI-powered summaries of complex engineering concepts to help you revise faster.",
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      title: "EXAM READY",
      desc: "Curated collection of previous year question papers and important exam materials.",
      icon: <Zap className="w-6 h-6" />
    },
    {
      title: "POLYBOT ASSIST",
      desc: "A dedicated academic chatbot to help you find resources and answer queries 24/7.",
      icon: <MessageSquare className="w-6 h-6" />
    }
  ];

  return (
    <div className="bg-bg overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-muted/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-dark rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <span className="font-display text-xl tracking-tighter text-dark">POLYDIME</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs uppercase font-bold tracking-widest text-dark/60 hover:text-accent transition-colors">Features</a>
            <button 
              onClick={onGetStarted}
              className="px-6 py-2 bg-dark text-bg text-xs uppercase font-bold tracking-widest hover:bg-accent hover:text-dark transition-all rounded-full"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-7xl md:text-9xl font-display leading-[0.85] text-dark mb-8">
                ENGINEER <br />
                <span className="text-accent">YOUR FUTURE.</span>
              </h1>
              <p className="text-xl text-body/80 font-body max-w-lg mb-12 leading-relaxed">
                PolyDime is the ultimate academic companion for engineering students. 
                Access curated notes, textbooks, and AI-powered study tools in one seamless platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={onGetStarted}
                  className="px-10 py-5 bg-dark text-bg font-display text-lg uppercase tracking-widest hover:bg-accent hover:text-dark transition-all flex items-center gap-3 group"
                >
                  Start Studying
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="aspect-[4/5] bg-muted/20 rounded-3xl overflow-hidden shadow-2xl relative group">
                <img 
                  src="https://picsum.photos/seed/engineering/800/1000" 
                  alt="Engineering Student" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="text-xs uppercase font-bold tracking-[0.3em] text-accent mb-2">The Academic Companion</div>
                  <div className="text-3xl font-display text-bg leading-none">CRAFTED FOR THE <br /> MODERN ENGINEER.</div>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-dark/5 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-dark text-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-5xl font-display leading-none mb-6">
              BUILT FOR <br />
              <span className="text-accent">ACADEMIC SUCCESS.</span>
            </h2>
            <p className="text-muted/60 font-body">
              We've gathered everything you need to excel in your engineering journey, from first year to final semester.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 border border-muted/10 hover:border-accent/50 transition-all group"
              >
                <div className="w-12 h-12 bg-muted/5 rounded-xl flex items-center justify-center mb-6 text-accent group-hover:bg-accent group-hover:text-dark transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-display mb-4">{feature.title}</h3>
                <p className="text-sm text-muted/40 font-body leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-accent">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-6xl md:text-8xl font-display text-dark leading-none mb-12">
              READY TO <br /> EXCEL?
            </h2>
            <button 
              onClick={onGetStarted}
              className="px-12 py-6 bg-dark text-bg font-display text-xl uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
            >
              Get Started Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-bg border-t border-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-dark rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <span className="font-display text-xl tracking-tighter text-dark">POLYDIME</span>
              </div>
              <p className="text-body/60 max-w-sm font-body">
                Your ultimate academic companion for engineering studies. 
                Empowering students with knowledge and AI tools.
              </p>
            </div>
            <div>
              <h4 className="font-display text-dark mb-6">PLATFORM</h4>
              <ul className="space-y-4 text-sm font-body text-body/60">
                <li><a href="#" className="hover:text-accent transition-colors">Library</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Notes</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">AI Help</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-dark mb-6">CONNECT</h4>
              <div className="flex items-center gap-4">
                <button className="w-10 h-10 bg-muted/20 rounded-full flex items-center justify-center hover:bg-accent hover:text-dark transition-all">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-muted/10 text-[10px] uppercase font-bold tracking-widest text-body/40">
            <div>© 2026 POLYDIME. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-dark transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-dark transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
