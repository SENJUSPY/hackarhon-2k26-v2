import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check, Star, Mail, Phone, MapPin, Github, Twitter, Linkedin, BookOpen, Zap, Shield, Globe } from 'lucide-react';

const Landing = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const scrollRef = useRef(null);
  
  // Intersection Observer for fade-in-up animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in-up');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-snow min-h-screen overflow-x-hidden" ref={scrollRef}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-obsidian text-snow px-6 py-4 flex justify-between items-center border-b border-silver/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-obsidian" />
          </div>
          <span className="font-display text-2xl uppercase tracking-tighter">Flipverse</span>
        </div>
        <div className="hidden md:flex items-center gap-8 uppercase text-xs tracking-[0.2em] font-medium">
          <a href="#features" className="hover:text-green transition-colors green-underline">Features</a>
          <a href="#stats" className="hover:text-green transition-colors green-underline">Impact</a>
          <a href="#testimonials" className="hover:text-green transition-colors green-underline">Community</a>
          <a href="#contact" className="hover:text-green transition-colors green-underline">Connect</a>
        </div>
        <button 
          onClick={onGetStarted}
          className="bg-green text-obsidian px-6 py-2 uppercase text-xs font-bold tracking-widest hover:bg-snow transition-all active:scale-95"
        >
          Enter App
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 bg-obsidian overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-green uppercase tracking-[0.4em] text-xs font-bold mb-6 block">Future of Reading</span>
              <h1 className="text-7xl md:text-9xl text-snow leading-[0.85] mb-8 font-extrabold">
                IMMERSE <br />
                <span className="text-silver/30">IN EVERY</span> <br />
                PAGE.
              </h1>
              <p className="text-silver text-lg md:text-xl max-w-xl mb-10 font-light leading-relaxed">
                Flipverse redefines the digital reading experience with editorial-grade typography, 
                seamless 3D interactions, and a minimalist interface designed for deep focus.
              </p>
              <div className="flex flex-wrap gap-6">
                <button 
                  onClick={onGetStarted}
                  className="bg-green text-obsidian px-10 py-4 uppercase text-sm font-bold tracking-[0.2em] flex items-center gap-3 hover:bg-snow transition-all group"
                >
                  Start Reading <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
                <button className="border border-silver/30 text-snow px-10 py-4 uppercase text-sm font-bold tracking-[0.2em] hover:bg-silver/10 transition-all">
                  View Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Text */}
        <div className="absolute -bottom-10 -right-20 text-[20vw] font-display font-black text-snow/[0.02] leading-none select-none pointer-events-none uppercase">
          Digital
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="py-32 px-6 bg-snow">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl fade-in-up">
              <span className="text-green uppercase tracking-[0.4em] text-xs font-bold mb-4 block">Core Capabilities</span>
              <h2 className="text-5xl md:text-7xl text-obsidian leading-none">ENGINEERED FOR <br /> LITERARY EXCELLENCE.</h2>
            </div>
            <div className="fade-in-up">
              <p className="text-graphite max-w-xs text-sm uppercase tracking-widest leading-loose">
                We stripped away the noise to leave only what matters: the connection between you and the author.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-silver/20 border border-silver/20">
            {[
              { 
                icon: <Zap className="w-8 h-8" />, 
                title: "Instant Rendering", 
                desc: "Proprietary PDF engine that loads massive documents in milliseconds with zero lag." 
              },
              { 
                icon: <Shield className="w-8 h-8" />, 
                title: "Private by Design", 
                desc: "Your library stays yours. Local-first architecture ensures your data never leaves your device." 
              },
              { 
                icon: <Globe className="w-8 h-8" />, 
                title: "Cross-Platform", 
                desc: "Seamlessly sync your progress across mobile, tablet, and desktop without missing a beat." 
              }
            ].map((feature, i) => (
              <div key={i} className="bg-obsidian p-12 group hover:bg-obsidian/95 transition-all border-l-4 border-green fade-in-up">
                <div className="text-green mb-8 transform group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-snow text-3xl mb-4 uppercase tracking-tight">{feature.title}</h3>
                <p className="text-silver/60 leading-relaxed font-light">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stat Counter Row */}
      <section id="stats" className="py-24 bg-obsidian text-snow border-y border-silver/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { val: "500K+", label: "Active Readers" },
              { val: "12M+", label: "Pages Flipped" },
              { val: "99.9%", label: "Uptime Rate" },
              { val: "4.9/5", label: "User Rating" }
            ].map((stat, i) => (
              <div key={i} className="fade-in-up">
                <div className="text-5xl md:text-7xl font-display font-bold text-green mb-2">{stat.val}</div>
                <div className="text-silver/40 uppercase tracking-[0.3em] text-[10px] font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Strip */}
      <section id="testimonials" className="py-32 bg-snow overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-20 fade-in-up">
            <span className="text-green uppercase tracking-[0.4em] text-xs font-bold mb-4 block">Voices of Flipverse</span>
            <h2 className="text-5xl md:text-7xl text-obsidian uppercase">Loved by Creators.</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {[
              {
                name: "Elena Rossi",
                role: "Creative Director",
                text: "The typography in Flipverse is unmatched. It's the first digital reader that actually respects the layout of a physical book."
              },
              {
                name: "Marcus Thorne",
                role: "Tech Journalist",
                text: "Brutalist aesthetics meet peak performance. It's fast, it's beautiful, and it's essential for my daily research."
              }
            ].map((t, i) => (
              <div key={i} className="max-w-lg bg-obsidian p-12 relative fade-in-up">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-green flex items-center justify-center">
                  <Star className="w-6 h-6 text-obsidian fill-obsidian" />
                </div>
                <p className="text-snow text-xl font-light italic leading-relaxed mb-8">
                  \"{t.text}\"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-silver/20 rounded-full" />
                  <div>
                    <div className="text-snow font-bold uppercase tracking-widest text-xs">{t.name}</div>
                    <div className="text-green uppercase tracking-widest text-[10px]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA Section */}
      <section id="contact" className="py-32 bg-obsidian relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="fade-in-up">
              <h2 className="text-6xl md:text-8xl text-snow leading-none mb-8">READY TO <br /> <span className="text-green">EVOLVE?</span></h2>
              <p className="text-silver text-lg mb-12 max-w-md font-light">
                Join the thousands of readers who have already made the switch to a more intentional digital experience.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 border border-silver/30 flex items-center justify-center group-hover:bg-green group-hover:border-green transition-all">
                    <Mail className="w-5 h-5 text-snow group-hover:text-obsidian" />
                  </div>
                  <span className="text-silver uppercase tracking-widest text-sm group-hover:text-snow transition-colors">hello@flipverse.io</span>
                </div>
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 border border-silver/30 flex items-center justify-center group-hover:bg-green group-hover:border-green transition-all">
                    <MapPin className="w-5 h-5 text-snow group-hover:text-obsidian" />
                  </div>
                  <span className="text-silver uppercase tracking-widest text-sm group-hover:text-snow transition-colors">Berlin, Germany</span>
                </div>
              </div>
            </div>
            
            <div className="bg-snow p-12 fade-in-up">
              <h3 className="text-obsidian text-3xl mb-8 uppercase tracking-tight">Send a Message</h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] font-bold text-graphite/50 mb-2">Full Name</label>
                  <input type="text" className="w-full bg-transparent border-b border-silver py-3 focus:outline-none focus:border-green transition-colors" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] font-bold text-graphite/50 mb-2">Email Address</label>
                  <input type="email" className="w-full bg-transparent border-b border-silver py-3 focus:outline-none focus:border-green transition-colors" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] font-bold text-graphite/50 mb-2">Message</label>
                  <textarea rows={4} className="w-full bg-transparent border-b border-silver py-3 focus:outline-none focus:border-green transition-colors resize-none" placeholder="How can we help?" />
                </div>
                <button className="w-full bg-obsidian text-snow py-4 uppercase text-xs font-bold tracking-[0.3em] hover:bg-green hover:text-obsidian transition-all">
                  Send Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-obsidian text-silver py-20 px-6 border-t border-silver/10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-green flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-obsidian" />
                </div>
                <span className="font-display text-xl uppercase tracking-tighter text-snow">Flipverse</span>
              </div>
              <p className="max-w-xs text-xs uppercase tracking-widest leading-loose opacity-50">
                Crafting digital experiences that respect the human mind. Built for readers, by readers.
              </p>
            </div>
            
            <div className="flex gap-12">
              <div className="flex flex-col gap-4 uppercase text-[10px] tracking-[0.2em] font-bold">
                <span className="text-snow mb-2">Product</span>
                <a href="#" className="hover:text-green transition-colors">Library</a>
                <a href="#" className="hover:text-green transition-colors">Reader</a>
                <a href="#" className="hover:text-green transition-colors">AI Covers</a>
              </div>
              <div className="flex flex-col gap-4 uppercase text-[10px] tracking-[0.2em] font-bold">
                <span className="text-snow mb-2">Company</span>
                <a href="#" className="hover:text-green transition-colors">About</a>
                <a href="#" className="hover:text-green transition-colors">Careers</a>
                <a href="#" className="hover:text-green transition-colors">Legal</a>
              </div>
            </div>
            
            <div className="flex gap-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 border border-silver/20 flex items-center justify-center hover:bg-green hover:border-green hover:text-obsidian transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-silver/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.3em] opacity-30">
            <span>© 2026 Flipverse Technologies. All rights reserved.</span>
            <div className="flex gap-8">
              <a href="#" className="hover:text-green transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-green transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
