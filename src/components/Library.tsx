import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Book as BookIcon, 
  Clock, 
  Trash2, 
  MoreVertical, 
  Upload, 
  Sparkles,
  ChevronRight,
  Grid,
  List as ListIcon,
  X
} from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import { GoogleGenAI } from "@google/genai";
import localforage from 'localforage';

// Initialize localforage
localforage.config({
  name: 'flipverse',
  storeName: 'books'
});

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface Book {
  id: string;
  title: string;
  coverUrl?: string;
  currentPage: number;
  totalPages: number;
  lastOpened: number;
  type: string;
}

interface LibraryProps {
  onOpenBook: (id: string) => void;
  onRequireAuth: () => void;
}

export const Library = ({ onOpenBook, onRequireAuth }: LibraryProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [pendingCoverBooks, setPendingCoverBooks] = useState<Book[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      onRequireAuth();
      return;
    }

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'books'),
      orderBy('lastOpened', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      setBooks(booksData);
    });

    return () => unsubscribe();
  }, [onRequireAuth]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setUploadProgress(50);

      const bookData = {
        title: file.name.replace('.pdf', ''),
        currentPage: 0,
        totalPages: pdf.numPages,
        lastOpened: Date.now(),
        type: 'pdf',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'users', auth.currentUser.uid, 'books'), bookData);
      
      // Store PDF blob locally
      await localforage.setItem(docRef.id, arrayBuffer);
      
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        // Check if we should suggest AI covers
        setPendingCoverBooks(prev => [...prev, { id: docRef.id, ...bookData }]);
        setShowAIModal(true);
      }, 500);

    } catch (error) {
      console.error('Error uploading PDF:', error);
      setIsUploading(false);
    }
  };

  const generateAICover = async (book: Book) => {
    if (!auth.currentUser) return;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A cinematic, high-quality, artistic book cover for a book titled "${book.title}". Minimalist, editorial style, professional lighting.` }]
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        const coverUrl = `data:image/png;base64,${imagePart.inlineData.data}`;
        await updateDoc(doc(db, 'users', auth.currentUser.uid, 'books', book.id), {
          coverUrl
        });
      }
    } catch (error) {
      console.error('Error generating AI cover:', error);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!auth.currentUser) return;
    await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'books', id));
    await localforage.removeItem(id);
    setShowDeleteModal(null);
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const recentlyOpened = books.slice(0, 3);

  return (
    <div className="min-h-screen bg-bg pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div id="library-header">
            <h1 className="text-5xl font-display text-dark leading-none mb-2">YOUR LIBRARY</h1>
            <p className="text-body/60 font-body text-sm">Manage and read your digital collection.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64" id="search-bar">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
              <input 
                type="text" 
                placeholder="Search books..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted/20 border-none rounded-full focus:ring-2 focus:ring-accent outline-none font-body text-sm text-dark"
              />
            </div>
            <button 
              id="upload-button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-accent text-dark rounded-full hover:bg-dark hover:text-bg transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".pdf" 
              className="hidden" 
            />
          </div>
        </div>

        {/* Recently Opened */}
        {!search && recentlyOpened.length > 0 && (
          <div className="mb-16" id="recent-books">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs uppercase font-bold tracking-[0.3em] text-dark/40 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Recently Opened
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentlyOpened.map((book) => (
                <motion.div 
                  key={book.id}
                  layoutId={`book-${book.id}`}
                  onClick={() => onOpenBook(book.id)}
                  className="group cursor-pointer bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-muted/10"
                >
                  <div className="flex gap-6 items-center">
                    <div className="w-24 aspect-[3/4] bg-muted/20 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} className="w-full h-full object-cover" alt={book.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-dark/5">
                          <BookIcon className="w-8 h-8 text-dark/10" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-xl text-dark truncate mb-1">{book.title}</h3>
                      <div className="text-[10px] uppercase font-bold text-body/40 mb-4">
                        {Math.round((book.currentPage / book.totalPages) * 100)}% COMPLETED
                      </div>
                      <div className="w-full h-1 bg-muted/20 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(book.currentPage / book.totalPages) * 100}%` }}
                          className="h-full bg-accent"
                        />
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Books Grid */}
        <div id="all-books">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs uppercase font-bold tracking-[0.3em] text-dark/40">
              {search ? `SEARCH RESULTS (${filteredBooks.length})` : 'ALL BOOKS'}
            </h2>
            <div className="flex items-center gap-2 bg-muted/10 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-dark' : 'text-dark/40 hover:text-dark'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-dark' : 'text-dark/40 hover:text-dark'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="py-20 text-center bg-muted/5 rounded-3xl border-2 border-dashed border-muted/20">
              <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookIcon className="w-8 h-8 text-muted" />
              </div>
              <h3 className="text-2xl font-display text-dark mb-2">YOUR LIBRARY IS EMPTY</h3>
              <p className="text-body/40 font-body max-w-xs mx-auto">
                Drop your first PDF here or use the button above to start your collection.
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8" : "space-y-4"}>
              {filteredBooks.map((book) => (
                viewMode === 'grid' ? (
                  <motion.div 
                    key={book.id}
                    layout
                    whileHover={{ y: -10 }}
                    className="group"
                  >
                    <div 
                      onClick={() => onOpenBook(book.id)}
                      className="aspect-[3/4] bg-white rounded-2xl shadow-sm group-hover:shadow-2xl transition-all overflow-hidden relative cursor-pointer border border-muted/10"
                    >
                      {book.coverUrl ? (
                        <img src={book.coverUrl} className="w-full h-full object-cover" alt={book.title} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-dark/5">
                          <BookIcon className="w-12 h-12 text-dark/10 mb-4" />
                          <div className="text-[10px] font-bold uppercase text-dark/30 line-clamp-3">{book.title}</div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="px-6 py-2 bg-accent text-dark font-display uppercase tracking-widest text-xs">Read Now</button>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-start">
                      <div className="min-w-0">
                        <h4 className="font-display text-sm text-dark truncate group-hover:text-accent transition-colors">{book.title}</h4>
                        <div className="text-[10px] font-bold text-body/40">{book.totalPages} PAGES</div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowDeleteModal(book.id); }}
                        className="p-1 text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key={book.id}
                    layout
                    className="flex items-center gap-6 p-4 bg-white rounded-2xl border border-muted/10 hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-16 bg-muted/20 rounded-lg overflow-hidden flex-shrink-0">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} className="w-full h-full object-cover" alt={book.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookIcon className="w-4 h-4 text-dark/10" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-lg text-dark truncate">{book.title}</h4>
                      <div className="text-[10px] font-bold text-body/40 uppercase">{book.totalPages} PAGES • {Math.round((book.currentPage / book.totalPages) * 100)}% READ</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => onOpenBook(book.id)}
                        className="px-4 py-2 bg-dark text-bg text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-accent hover:text-dark transition-all"
                      >
                        Open
                      </button>
                      <button 
                        onClick={() => setShowDeleteModal(book.id)}
                        className="p-2 text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-dark/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" 
                  />
                  <motion.circle 
                    cx="50" cy="50" r="45" 
                    fill="none" stroke="#6ead3a" strokeWidth="8" 
                    strokeDasharray="283"
                    animate={{ strokeDashoffset: 283 - (283 * uploadProgress) / 100 }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-accent" />
                </div>
              </div>
              <h2 className="text-3xl font-display text-bg mb-2 uppercase tracking-widest">Processing Book</h2>
              <p className="text-muted/40 font-body">Analyzing PDF structure and extracting metadata...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Cover Modal */}
      <AnimatePresence>
        {showAIModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-dark/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-lg w-full bg-bg p-10 rounded-[3rem] text-center relative"
            >
              <button 
                onClick={() => setShowAIModal(false)}
                className="absolute top-8 right-8 p-2 text-dark/20 hover:text-dark transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-4xl font-display text-dark leading-none mb-4">GENERATE AI COVERS?</h2>
              <p className="text-body/60 font-body mb-10">
                You just added {pendingCoverBooks.length} book(s). Would you like to automatically generate 
                beautiful AI covers for them using Gemini?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowAIModal(false)}
                  className="py-4 border-2 border-dark/10 text-dark font-display uppercase tracking-widest rounded-2xl hover:bg-muted/10 transition-all"
                >
                  Maybe Later
                </button>
                <button 
                  onClick={async () => {
                    setShowAIModal(false);
                    for(const book of pendingCoverBooks) {
                      await generateAICover(book);
                    }
                    setPendingCoverBooks([]);
                  }}
                  className="py-4 bg-dark text-bg font-display uppercase tracking-widest rounded-2xl hover:bg-accent hover:text-dark transition-all shadow-xl"
                >
                  Generate Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-dark/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-bg p-10 rounded-[3rem] text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-display text-dark leading-none mb-4 uppercase">Delete Resource?</h2>
              <p className="text-body/60 font-body mb-10">
                Are you sure you want to remove this book from your library? This action cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowDeleteModal(null)}
                  className="py-4 border-2 border-dark/10 text-dark font-display uppercase tracking-widest rounded-2xl hover:bg-muted/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteBook(showDeleteModal)}
                  className="py-4 bg-red-500 text-white font-display uppercase tracking-widest rounded-2xl hover:bg-red-600 transition-all shadow-xl shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
