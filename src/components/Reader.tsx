import React, { useState, useEffect, useRef } from 'react';
import { Book, getBook, saveBook, updateBookProgress, BookmarkPin, Highlight, StickyNote } from '../lib/db';
import { loadPdf, renderPdfPage, extractPdfText, getPdfTextContent } from '../lib/pdf';
import * as pdfjsLib from 'pdfjs-dist';
import { BookFlip } from './BookFlip';
import { ArrowLeft, Moon, Sun, ZoomIn, ZoomOut, MessageSquare, Loader2, Maximize2, Minimize2, Settings2, Type, AlignLeft, Paperclip, RotateCcw, RotateCw, Highlighter, X, StickyNote as StickyNoteIcon, Sparkles, Trash2, Send, Zap } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import { cn } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';

const PIN_COLORS = ['#6ead3a', '#222022', '#ceccce', '#4c4947', '#efedef', '#8c4a4a'];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const Reader = ({ bookId, onBack }: { bookId: string; onBack: () => void }) => {
  const [book, setBook] = useState<Book | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfAspectRatio, setPdfAspectRatio] = useState<number>(1 / 1.4); // Default aspect ratio
  const [currentPage, setCurrentPage] = useState(0);
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [zoom, setZoom] = useState(1);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'ai' | 'bookmarks' | 'highlights'>('ai');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // New Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineSpacing, setLineSpacing] = useState(1.6);
  const [brightness, setBrightness] = useState(100);
  const [pageTexts, setPageTexts] = useState<Record<number, string>>({});
  const [pageTextContent, setPageTextContent] = useState<Record<number, any>>({});
  const [selectionMenu, setSelectionMenu] = useState<{ x: number, y: number, text: string } | null>(null);

  // Bookmark Pins State
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [selectedPinColor, setSelectedPinColor] = useState<string | null>(null);
  const [trayRotation, setTrayRotation] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Highlighter State
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [highlightColor, setHighlightColor] = useState('#6ead3a'); // Signal Green
  const [drawingHighlight, setDrawingHighlight] = useState<{ page: number, startX: number, startY: number, currentX: number, currentY: number } | null>(null);

  // Sticky Note State
  const [isStickyMode, setIsStickyMode] = useState(false);
  const [stickyColor, setStickyColor] = useState('#ceccce'); // Warm Silver
  const [activeStickyId, setActiveStickyId] = useState<string | null>(null);

  const pinTransform = useMotionTemplate`translate(calc(${mouseX}px - 10px), calc(${mouseY}px - 10px)) rotate(15deg)`;
  const stickyTransform = useMotionTemplate`translate(calc(${mouseX}px - 10px), calc(${mouseY}px - 10px))`;
  const highlightTransform = useMotionTemplate`translate(calc(${mouseX}px - 10px), calc(${mouseY}px - 20px)) rotate(-15deg)`;

  useEffect(() => {
    if (!selectedPinColor && !isHighlightMode && !isStickyMode) return;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [selectedPinColor, isHighlightMode, isStickyMode, mouseX, mouseY]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPinColor(null);
        setIsTrayOpen(false);
        setIsHighlightMode(false);
        setIsStickyMode(false);
        setDrawingHighlight(null);
        setActiveStickyId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowToolbar(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!aiPanelOpen && !showSettings) setShowToolbar(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [aiPanelOpen, showSettings]);

  useEffect(() => {
    const loadData = async () => {
      const bookData = await getBook(bookId);
      if (bookData) {
        setBook(bookData);
        setCurrentPage(bookData.currentPage || 0);
        
        if (bookData.fileData) {
          const pdf = await loadPdf(bookData.fileData);
          setPdfDoc(pdf);
          
          // Get aspect ratio from first page
          const firstPage = await pdf.getPage(1);
          const viewport = firstPage.getViewport({ scale: 1 });
          setPdfAspectRatio(viewport.width / viewport.height);
        }
      }
    };
    loadData();
  }, [bookId]);

  useEffect(() => {
    if (!pdfDoc) return;

    const loadPages = async () => {
      const pagesToLoad = [currentPage, currentPage + 1, currentPage - 1];
      const newImages = { ...pageImages };
      const newTexts = { ...pageTexts };
      const newTextContent = { ...pageTextContent };

      for (const pageIdx of pagesToLoad) {
        if (pageIdx >= 0 && pageIdx < pdfDoc.numPages && !newImages[pageIdx]) {
          newImages[pageIdx] = await renderPdfPage(pdfDoc, pageIdx + 1, bookId);
          newTexts[pageIdx] = await extractPdfText(pdfDoc, pageIdx + 1);
          newTextContent[pageIdx] = await getPdfTextContent(pdfDoc, pageIdx + 1);
        }
      }
      setPageImages(newImages);
      setPageTexts(newTexts);
      setPageTextContent(newTextContent);
    };

    loadPages();
    updateBookProgress(bookId, currentPage, Date.now());
  }, [pdfDoc, currentPage, bookId]);

  const handlePageChange = (index: number) => {
    setCurrentPage(index);
  };

  const handleAskAi = async (query?: string) => {
    const q = query || aiQuery;
    if (!q.trim() || !pdfDoc) return;

    setIsAiLoading(true);
    setAiResponse('');
    setAiPanelOpen(true);
    
    try {
      const text = pageTexts[currentPage] || await extractPdfText(pdfDoc, currentPage + 1);
      const prompt = `Context from current page (Page ${currentPage + 1}):\n${text}\n\nQuestion: ${q}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      setAiResponse(response.text || "I couldn't generate a response.");
    } catch (error) {
      console.error('AI Error:', error);
      setAiResponse("Sorry, I encountered an error while processing your request.");
    } finally {
      setIsAiLoading(false);
      setAiQuery('');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePageClick = (e: React.MouseEvent) => {
    if (!book) return;

    if (selectedPinColor) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newPin: BookmarkPin = {
        id: uuidv4(),
        page: currentPage,
        x,
        y,
        color: selectedPinColor
      };

      const updatedBook = { ...book, pins: [...(book.pins || []), newPin] };
      setBook(updatedBook);
      saveBook(updatedBook);
      setSelectedPinColor(null);
    } else if (isStickyMode) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newSticky: StickyNote = {
        id: uuidv4(),
        page: currentPage,
        x,
        y,
        text: '',
        color: stickyColor
      };

      const updatedBook = { ...book, stickyNotes: [...(book.stickyNotes || []), newSticky] };
      setBook(updatedBook);
      saveBook(updatedBook);
      setIsStickyMode(false);
      setActiveStickyId(newSticky.id);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isHighlightMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDrawingHighlight({ page: currentPage, startX: x, startY: y, currentX: x, currentY: y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drawingHighlight) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDrawingHighlight(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
  };

  const handlePointerUp = () => {
    if (!drawingHighlight || !book) return;

    const x = Math.min(drawingHighlight.startX, drawingHighlight.currentX);
    const y = Math.min(drawingHighlight.startY, drawingHighlight.currentY);
    const width = Math.abs(drawingHighlight.startX - drawingHighlight.currentX);
    const height = Math.abs(drawingHighlight.startY - drawingHighlight.currentY);

    if (width > 1 && height > 1) {
      const newHighlight: Highlight = {
        id: uuidv4(),
        page: currentPage,
        x,
        y,
        width,
        height,
        color: highlightColor
      };

      const updatedBook = { ...book, highlights: [...(book.highlights || []), newHighlight] };
      setBook(updatedBook);
      saveBook(updatedBook);
    }

    setDrawingHighlight(null);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionMenu({
        x: rect.left + rect.width / 2,
        y: rect.top,
        text: selection.toString().trim()
      });
    } else {
      setSelectionMenu(null);
    }
  };

  const removePin = (id: string) => {
    if (!book) return;
    const updatedBook = { ...book, pins: (book.pins || []).filter(p => p.id !== id) };
    setBook(updatedBook);
    saveBook(updatedBook);
  };

  const removeHighlight = (id: string) => {
    if (!book) return;
    const updatedBook = { ...book, highlights: (book.highlights || []).filter(h => h.id !== id) };
    setBook(updatedBook);
    saveBook(updatedBook);
  };

  const removeStickyNote = (id: string) => {
    if (!book) return;
    const updatedBook = { ...book, stickyNotes: (book.stickyNotes || []).filter(s => s.id !== id) };
    setBook(updatedBook);
    saveBook(updatedBook);
  };

  const renderPage = (index: number) => {
    if (!book) return null;

    const pagePins = (book.pins || []).filter(p => p.page === index);
    const pageHighlights = (book.highlights || []).filter(h => h.page === index);
    const pageStickyNotes = (book.stickyNotes || []).filter(s => s.page === index);
    const imgUrl = pageImages[index];

    return (
      <div 
        className={`w-full h-full relative overflow-hidden ${theme === 'dark' ? 'bg-obsidian' : 'bg-snow'} ${selectedPinColor ? 'cursor-crosshair' : ''} ${isHighlightMode ? 'cursor-crosshair touch-none' : ''} ${isStickyMode ? 'cursor-crosshair' : ''}`}
        onClick={handlePageClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {isTextMode ? (
          <div 
            className={`w-full h-full p-8 sm:p-12 overflow-y-auto ${theme === 'dark' ? 'bg-obsidian text-snow/80' : 'bg-snow text-obsidian/80'}`}
            style={{ 
              fontSize: `${fontSize}px`, 
              lineHeight: lineSpacing,
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {pageTexts[index] !== undefined ? (
              <div className="whitespace-pre-wrap pb-12">{pageTexts[index]}</div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-green animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            {imgUrl ? (
              <div className="relative max-w-full max-h-full" style={{ aspectRatio: pdfAspectRatio }}>
                <img 
                  src={imgUrl} 
                  alt={`Page ${index + 1}`} 
                  className={`w-full h-full object-contain pointer-events-none select-none ${theme === 'dark' ? 'invert hue-rotate-180' : ''}`}
                  style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease' }}
                />
                
                {/* Text Layer for Selection */}
                {pageTextContent[index] && (
                  <div 
                    className={cn(
                      "absolute inset-0 z-30 opacity-0 transition-opacity",
                      isHighlightMode ? "select-text cursor-text opacity-5" : "pointer-events-none select-none"
                    )}
                    onMouseUp={handleTextSelection}
                    style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease' }}
                  >
                    {pageTextContent[index].items.map((item: any, i: number) => {
                      const { transform, width, height, str } = item;
                      const { width: pageWidth, height: pageHeight } = pageTextContent[index].viewport;
                      
                      const left = (transform[4] / pageWidth) * 100;
                      const bottom = (transform[5] / pageHeight) * 100;
                      const itemWidth = (width / pageWidth) * 100;
                      const itemHeight = (height / pageHeight) * 100;

                      return (
                        <span
                          key={i}
                          className="absolute whitespace-pre"
                          style={{
                            left: `${left}%`,
                            bottom: `${bottom}%`,
                            width: `${itemWidth}%`,
                            height: `${itemHeight}%`,
                            fontSize: `${transform[0]}px`
                          }}
                        >
                          {str}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Highlights */}
                {pageHighlights.map(h => (
                  <div
                    key={h.id}
                    className="absolute z-10 mix-blend-multiply opacity-50 group/highlight"
                    style={{
                      left: `${h.x}%`,
                      top: `${h.y}%`,
                      width: `${h.width}%`,
                      height: `${h.height}%`,
                      backgroundColor: h.color
                    }}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeHighlight(h.id); }}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/highlight:opacity-100 transition-opacity"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </div>
                ))}

                {/* Drawing Highlight */}
                {drawingHighlight && drawingHighlight.page === index && (
                  <div
                    className="absolute z-20 mix-blend-multiply opacity-30"
                    style={{
                      left: `${Math.min(drawingHighlight.startX, drawingHighlight.currentX)}%`,
                      top: `${Math.min(drawingHighlight.startY, drawingHighlight.currentY)}%`,
                      width: `${Math.abs(drawingHighlight.startX - drawingHighlight.currentX)}%`,
                      height: `${Math.abs(drawingHighlight.startY - drawingHighlight.currentY)}%`,
                      backgroundColor: highlightColor
                    }}
                  />
                )}

                {/* Pins */}
                {pagePins.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute z-40 group/pin"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    <div 
                      className="w-5 h-5 rounded-full shadow-lg border-2 border-white flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform rotate-15"
                      style={{ backgroundColor: p.color }}
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removePin(p.id); }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 bg-obsidian text-snow text-[8px] px-2 py-1 rounded-none opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest font-bold"
                    >
                      Remove
                    </button>
                  </motion.div>
                ))}

                {/* Sticky Notes */}
                {pageStickyNotes.map(s => (
                  <div
                    key={s.id}
                    className="absolute z-40"
                    style={{ left: `${s.x}%`, top: `${s.y}%` }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveStickyId(activeStickyId === s.id ? null : s.id); }}
                      className="w-6 h-6 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform relative group"
                      style={{ color: s.color }}
                    >
                      <StickyNoteIcon className="w-6 h-6 fill-current" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeStickyNote(s.id); }}
                        className="absolute -top-4 -right-4 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </button>

                    <AnimatePresence>
                      {activeStickyId === s.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-64 p-4 rounded-none shadow-2xl border border-white/10 backdrop-blur-md"
                          style={{ backgroundColor: `${s.color}dd` }}
                        >
                          <textarea
                            autoFocus
                            className="w-full h-32 bg-transparent border-none resize-none focus:outline-none text-obsidian placeholder:text-obsidian/50 text-xs font-medium"
                            placeholder="TYPE YOUR NOTE..."
                            value={s.text}
                            onChange={(e) => {
                              const updatedNotes = book.stickyNotes!.map(sn => 
                                sn.id === s.id ? { ...sn, text: e.target.value } : sn
                              );
                              const updatedBook = { ...book, stickyNotes: updatedNotes };
                              setBook(updatedBook);
                              saveBook(updatedBook);
                            }}
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => {
                                const query = `Explain this note: ${s.text}`;
                                setAiQuery(query);
                                setAiPanelOpen(true);
                                handleAskAi(query);
                              }}
                              className="text-[10px] font-bold uppercase tracking-widest bg-obsidian/20 hover:bg-obsidian/30 text-obsidian px-3 py-1.5 rounded-none flex items-center gap-1.5 transition-colors"
                            >
                              <Sparkles className="w-3 h-3" /> Explain
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-green animate-spin" />
                <p className="text-silver uppercase tracking-widest text-xs font-bold">Rendering Page...</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!book) return null;

  return (
    <div className={`w-full h-full flex flex-col ${theme === 'dark' ? 'bg-obsidian text-snow' : 'bg-snow text-obsidian'} transition-colors duration-500`}>
      {/* Immersive Toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-obsidian/80 backdrop-blur-xl border-b border-white/5"
          >
            <div className="flex items-center gap-6">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-none transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <h2 className="text-xs font-bold uppercase tracking-widest truncate max-w-[200px]">{book.title}</h2>
                <span className="text-[10px] text-silver uppercase tracking-widest font-bold">Page {currentPage + 1} of {book.totalPages}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-none border border-white/5">
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 hover:bg-white/10 rounded-none transition-colors"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button 
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="p-2 hover:bg-white/10 rounded-none transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                className="p-2 hover:bg-white/10 rounded-none transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button 
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/10 rounded-none transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button 
                onClick={() => setAiPanelOpen(!aiPanelOpen)}
                className={cn(
                  "p-2 rounded-none transition-all flex items-center gap-2",
                  aiPanelOpen ? "bg-green text-obsidian shadow-lg" : "hover:bg-white/10"
                )}
                title="AI Assistant"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button 
                onClick={() => setIsHighlightMode(!isHighlightMode)}
                className={cn(
                  "p-2 rounded-none transition-all",
                  isHighlightMode ? "bg-green text-obsidian shadow-lg" : "hover:bg-white/10"
                )}
                title="Highlighter"
              >
                <Highlighter className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsStickyMode(!isStickyMode)}
                className={cn(
                  "p-2 rounded-none transition-all",
                  isStickyMode ? "bg-green text-obsidian shadow-lg" : "hover:bg-white/10"
                )}
                title="Sticky Note"
              >
                <StickyNoteIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsTrayOpen(!isTrayOpen)}
                className={cn(
                  "p-2 rounded-none transition-all",
                  isTrayOpen ? "bg-green text-obsidian shadow-lg" : "hover:bg-white/10"
                )}
                title="Bookmark Pins"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    "p-2 rounded-none transition-all",
                    showSettings ? "bg-green text-obsidian shadow-lg" : "hover:bg-white/10"
                  )}
                  title="Reader Settings"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                
                <AnimatePresence>
                  {showSettings && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute top-full right-0 mt-4 w-72 p-6 rounded-none shadow-2xl border ${theme === 'dark' ? 'bg-obsidian border-white/10' : 'bg-snow border-black/5'} backdrop-blur-xl z-50 flex flex-col gap-6`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest">Reader Mode</span>
                        <button 
                          onClick={() => setIsTextMode(!isTextMode)}
                          className={`w-12 h-6 rounded-none transition-colors relative ${isTextMode ? 'bg-green' : 'bg-silver/30'}`}
                        >
                          <div className={`w-4 h-4 bg-obsidian absolute top-1 transition-all ${isTextMode ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-silver">
                          <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5" /> Brightness</span>
                          <span>{brightness}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="50" max="150" 
                          value={brightness} 
                          onChange={e => setBrightness(Number(e.target.value))}
                          className="w-full accent-green h-1 bg-silver/20 appearance-none cursor-pointer"
                        />
                      </div>

                      <div className={`space-y-3 transition-opacity ${!isTextMode ? 'opacity-40 pointer-events-none' : ''}`}>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-silver">
                          <span className="flex items-center gap-1.5"><Type className="w-3.5 h-3.5" /> Font Size</span>
                          <span>{fontSize}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="12" max="32" 
                          value={fontSize} 
                          onChange={e => setFontSize(Number(e.target.value))}
                          className="w-full accent-green h-1 bg-silver/20 appearance-none cursor-pointer"
                        />
                      </div>

                      <div className={`space-y-3 transition-opacity ${!isTextMode ? 'opacity-40 pointer-events-none' : ''}`}>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-silver">
                          <span className="flex items-center gap-1.5"><AlignLeft className="w-3.5 h-3.5" /> Line Spacing</span>
                          <span>{lineSpacing}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" max="2.5" step="0.1"
                          value={lineSpacing} 
                          onChange={e => setLineSpacing(Number(e.target.value))}
                          className="w-full accent-green h-1 bg-silver/20 appearance-none cursor-pointer"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Floating Cursors */}
      <AnimatePresence>
        {selectedPinColor && (
          <motion.div 
            style={{ x: mouseX, y: mouseY, transform: pinTransform }}
            className="fixed top-0 left-0 pointer-events-none z-[100] flex flex-col items-center gap-2"
          >
            <div className="w-5 h-5 rounded-full border-2 border-white shadow-xl" style={{ backgroundColor: selectedPinColor }} />
            <span className="bg-obsidian text-snow text-[8px] px-2 py-1 rounded-none uppercase tracking-widest font-bold border border-white/10">Place Pin</span>
          </motion.div>
        )}
        {isStickyMode && (
          <motion.div 
            style={{ x: mouseX, y: mouseY, transform: stickyTransform }}
            className="fixed top-0 left-0 pointer-events-none z-[100] flex flex-col items-center gap-2"
          >
            <StickyNoteIcon className="w-6 h-6 shadow-xl" style={{ color: stickyColor }} />
            <span className="bg-obsidian text-snow text-[8px] px-2 py-1 rounded-none uppercase tracking-widest font-bold border border-white/10">Place Note</span>
          </motion.div>
        )}
        {isHighlightMode && (
          <motion.div 
            style={{ x: mouseX, y: mouseY, transform: highlightTransform }}
            className="fixed top-0 left-0 pointer-events-none z-[100] flex flex-col items-center gap-2"
          >
            <Highlighter className="w-6 h-6 shadow-xl" style={{ color: highlightColor }} />
            <span className="bg-obsidian text-snow text-[8px] px-2 py-1 rounded-none uppercase tracking-widest font-bold border border-white/10">Highlight Mode</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookmark Tray */}
      <AnimatePresence>
        {isTrayOpen && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-6"
          >
            <div className="bg-obsidian/90 backdrop-blur-2xl p-8 rounded-none border border-white/10 shadow-2xl flex items-center gap-8">
              <button 
                onClick={() => setTrayRotation(r => r - 45)}
                className="p-3 bg-white/5 hover:bg-green hover:text-obsidian transition-all rounded-none"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              <div className="relative w-48 h-48 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: trayRotation }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-silver block mb-1">Select</span>
                    <span className="text-lg font-display text-green uppercase tracking-tighter">Stationery</span>
                  </div>
                </div>
                {PIN_COLORS.map((color, i) => {
                  const angle = (i * (360 / PIN_COLORS.length)) + trayRotation;
                  const radius = 80;
                  const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
                  const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;

                  return (
                    <motion.button
                      key={color}
                      onClick={() => { setSelectedPinColor(color); setIsTrayOpen(false); }}
                      className={cn(
                        "absolute w-10 h-10 rounded-full border-2 border-white shadow-xl transition-all hover:scale-125 z-10",
                        selectedPinColor === color ? "ring-4 ring-green" : ""
                      )}
                      style={{ 
                        backgroundColor: color,
                        left: `calc(50% + ${x}px - 20px)`,
                        top: `calc(50% + ${y}px - 20px)`
                      }}
                      whileHover={{ scale: 1.2 }}
                    />
                  );
                })}
              </div>

              <button 
                onClick={() => setTrayRotation(r => r + 45)}
                className="p-3 bg-white/5 hover:bg-green hover:text-obsidian transition-all rounded-none"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={() => setIsTrayOpen(false)}
              className="bg-obsidian text-snow px-6 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest border border-white/10 hover:bg-red-500 transition-colors"
            >
              Close Tray
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main 
        className="flex-1 relative overflow-hidden flex items-center justify-center"
        style={{ filter: `brightness(${brightness}%)` }}
      >
        <div className="w-full h-full max-w-5xl mx-auto py-20 px-4">
          <BookFlip 
            totalPages={book.totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            renderPage={renderPage}
          />
        </div>

        {/* Selection Menu */}
        <AnimatePresence>
          {selectionMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: -10, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="fixed z-[100] bg-obsidian text-snow p-1 rounded-none shadow-2xl border border-white/10 flex items-center gap-1"
              style={{ left: selectionMenu.x, top: selectionMenu.y, transform: 'translateX(-50%)' }}
            >
              <button 
                onClick={() => {
                  const newHighlight: Highlight = {
                    id: uuidv4(),
                    page: currentPage,
                    x: 0, y: 0, width: 0, height: 0, // Placeholder for text selection
                    color: highlightColor,
                    text: selectionMenu.text
                  };
                  const updatedBook = { ...book, highlights: [...(book.highlights || []), newHighlight] };
                  setBook(updatedBook);
                  saveBook(updatedBook);
                  setSelectionMenu(null);
                }}
                className="p-2 hover:bg-green hover:text-obsidian transition-all rounded-none flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
              >
                <Highlighter className="w-3 h-3" /> Highlight
              </button>
              <div className="w-px h-4 bg-white/10" />
              <button 
                onClick={() => {
                  handleAskAi(`Explain this text: "${selectionMenu.text}"`);
                  setSelectionMenu(null);
                }}
                className="p-2 hover:bg-green hover:text-obsidian transition-all rounded-none flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
              >
                <Sparkles className="w-3 h-3" /> Explain
              </button>
              <div className="w-px h-4 bg-white/10" />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(selectionMenu.text);
                  setSelectionMenu(null);
                }}
                className="p-2 hover:bg-green hover:text-obsidian transition-all rounded-none flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
              >
                Copy
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Immersive Progress Bar */}
        <div className="fixed bottom-0 left-0 w-full z-40 px-8 py-6 pointer-events-none">
          <div className="max-w-4xl mx-auto flex items-center gap-6 pointer-events-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest text-silver w-12">{currentPage + 1}</span>
            <div className="flex-1 h-1 bg-white/5 rounded-none overflow-hidden relative group cursor-pointer">
              <div 
                className="absolute top-0 left-0 h-full bg-green transition-all duration-300"
                style={{ width: `${((currentPage + 1) / book.totalPages) * 100}%` }}
              />
              <input 
                type="range"
                min="0"
                max={book.totalPages - 1}
                value={currentPage}
                onChange={(e) => handlePageChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-silver w-12 text-right">{book.totalPages}</span>
          </div>
        </div>
      </main>

      {/* AI Assistant Sidebar */}
      <AnimatePresence>
        {aiPanelOpen && (
          <motion.aside
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="fixed top-0 right-0 h-full w-[400px] z-[60] bg-obsidian border-l border-white/10 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green">
                  <Sparkles className="w-5 h-5 text-obsidian" />
                </div>
                <h3 className="text-lg font-display uppercase tracking-tighter">AI Assistant</h3>
              </div>
              <button 
                onClick={() => setAiPanelOpen(false)}
                className="p-2 hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-white/10">
              {(['ai', 'bookmarks', 'highlights'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSidebarTab(tab)}
                  className={cn(
                    "flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative",
                    sidebarTab === tab ? "text-green" : "text-silver hover:text-snow"
                  )}
                >
                  {tab}
                  {sidebarTab === tab && (
                    <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-green" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {sidebarTab === 'ai' && (
                  <motion.div
                    key="ai-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <button 
                      onClick={() => handleAskAi("Summarize this page and explain the key concepts.")}
                      className="w-full py-4 bg-green text-obsidian text-xs font-bold uppercase tracking-widest hover:bg-snow transition-all flex items-center justify-center gap-3"
                    >
                      <Zap className="w-4 h-4" /> Explain Page
                    </button>

                    {aiResponse && (
                      <div className="bg-white/5 p-6 border border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1 h-4 bg-green" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-silver">Response</span>
                        </div>
                        <div className="text-silver text-sm leading-relaxed font-light whitespace-pre-wrap">
                          {aiResponse}
                        </div>
                      </div>
                    )}
                    
                    {isAiLoading && (
                      <div className="flex flex-col items-center py-12 gap-4">
                        <Loader2 className="w-8 h-8 text-green animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-silver animate-pulse">Processing...</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {sidebarTab === 'bookmarks' && (
                  <motion.div
                    key="bookmarks-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {(book.pins || []).length === 0 ? (
                      <div className="text-center py-12">
                        <Paperclip className="w-12 h-12 text-silver/10 mx-auto mb-4" />
                        <p className="text-silver uppercase tracking-widest text-[10px] font-bold">No bookmarks yet</p>
                      </div>
                    ) : (
                      (book.pins || []).map(pin => (
                        <div 
                          key={pin.id}
                          className="bg-white/5 p-4 border border-white/10 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pin.color }} />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold uppercase tracking-widest">Page {pin.page + 1}</span>
                              <span className="text-[10px] text-silver uppercase tracking-widest">Bookmark</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handlePageChange(pin.page)}
                              className="p-2 hover:bg-green hover:text-obsidian transition-all"
                            >
                              Go to
                            </button>
                            <button 
                              onClick={() => removePin(pin.id)}
                              className="p-2 hover:bg-red-500 text-snow transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {sidebarTab === 'highlights' && (
                  <motion.div
                    key="highlights-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {(book.highlights || []).length === 0 ? (
                      <div className="text-center py-12">
                        <Highlighter className="w-12 h-12 text-silver/10 mx-auto mb-4" />
                        <p className="text-silver uppercase tracking-widest text-[10px] font-bold">No highlights yet</p>
                      </div>
                    ) : (
                      (book.highlights || []).map(h => (
                        <div 
                          key={h.id}
                          className="bg-white/5 p-4 border border-white/10 space-y-3 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-silver">Page {h.page + 1}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleAskAi(`Explain this highlight: "${h.text}"`)}
                                className="p-1.5 hover:bg-green hover:text-obsidian transition-all"
                                title="Explain with AI"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => removeHighlight(h.id)}
                                className="p-1.5 hover:bg-red-500 text-snow transition-all"
                                title="Remove Highlight"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          {h.text && (
                            <p className="text-xs text-snow/80 leading-relaxed italic border-l border-white/10 pl-3">
                              "{h.text}"
                            </p>
                          )}
                          <button 
                            onClick={() => handlePageChange(h.page)}
                            className="text-[10px] font-bold uppercase tracking-widest text-green hover:text-snow transition-colors"
                          >
                            Jump to Page
                          </button>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {sidebarTab === 'ai' && (
              <div className="p-6 border-t border-white/10 bg-white/5">
                <div className="relative">
                  <textarea
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAskAi())}
                    placeholder="ASK AI SOMETHING..."
                    className="w-full bg-obsidian border border-white/10 p-4 pr-12 text-xs uppercase tracking-widest focus:outline-none focus:border-green resize-none min-h-[100px] placeholder:text-silver/30"
                  />
                  <button 
                    onClick={() => handleAskAi()}
                    disabled={isAiLoading || !aiQuery.trim()}
                    className="absolute bottom-4 right-4 p-2 bg-green text-obsidian disabled:opacity-50 hover:bg-snow transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};
