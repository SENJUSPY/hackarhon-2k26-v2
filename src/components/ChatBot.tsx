import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { BOT_RESPONSES } from '../constants';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: number;
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = sessionStorage.getItem('poly_chat_history');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const initialMessage: Message = {
        id: '1',
        text: "Hi! I'm PolyBot. How can I help you with your studies today?",
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages([initialMessage]);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('poly_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Bot logic
    setTimeout(() => {
      const responseText = getBotResponse(inputText);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  const getBotResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    for (const [key, response] of Object.entries(BOT_RESPONSES)) {
      if (lowerInput.includes(key)) return response;
    }

    return "I'm not sure about that. Try asking about 'syllabus', 'notes', or 'exams'!";
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-96 h-[500px] bg-dark border border-muted/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-accent text-dark flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-dark rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider">PolyBot</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-70">Online Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-dark/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.sender === 'bot' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id}
                  className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl font-body text-sm ${
                    msg.sender === 'bot' 
                      ? 'bg-muted/10 text-bg rounded-tl-none' 
                      : 'bg-accent text-dark rounded-tr-none font-medium'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-muted/10 bg-dark/50">
              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask PolyBot..."
                  className="w-full bg-muted/5 border border-muted/20 rounded-2xl py-3 pl-4 pr-12 text-bg font-body focus:outline-none focus:border-accent transition-colors"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-dark rounded-xl hover:scale-105 transition-transform"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-accent text-dark rounded-full shadow-2xl flex items-center justify-center group relative"
      >
        <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
      </motion.button>
    </div>
  );
};
