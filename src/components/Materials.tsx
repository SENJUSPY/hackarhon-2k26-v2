import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Download, 
  ExternalLink, 
  Filter,
  ChevronRight,
  GraduationCap,
  Book as BookIcon,
  FileText,
  Loader2
} from 'lucide-react';
import { loadMaterials } from '../data/loader';
import { BRANCH_CONFIG } from '../data/branches';

interface Material {
  id: string;
  title: string;
  filename: string;
  subject: string;
  semester: string;
  type?: string;
}

interface MaterialsProps {
  course: 'btech' | 'diploma';
  branch: string;
  onOpenMaterial: (material: Material) => void;
}

export const Materials = ({ course, branch, onOpenMaterial }: MaterialsProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string | 'all'>('all');

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const data = await loadMaterials(course, branch);
        setMaterials(data || []);
      } catch (error) {
        console.error('Error loading materials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [course, branch]);

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                         m.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSemester = selectedSemester === 'all' || m.semester === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  const semesters = Array.from(new Set(materials.map(m => m.semester))).sort();

  const branchName = BRANCH_CONFIG[course]?.find(b => b.id === branch)?.name || branch;

  return (
    <div className="min-h-screen bg-bg pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-accent mb-2">
              <GraduationCap className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">{course.toUpperCase()} • {branchName}</span>
            </div>
            <h1 className="text-5xl font-display text-dark leading-none mb-2">ACADEMIC MATERIALS</h1>
            <p className="text-body/60 font-body text-sm">Curated resources for your engineering journey.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
              <input 
                type="text" 
                placeholder="Search materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted/20 border-none rounded-full focus:ring-2 focus:ring-accent outline-none font-body text-sm text-dark"
              />
            </div>
            <div className="relative">
              <select 
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="appearance-none pl-10 pr-10 py-2 bg-muted/20 border-none rounded-full focus:ring-2 focus:ring-accent outline-none font-body text-sm text-dark cursor-pointer"
              >
                <option value="all">All Semesters</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30 pointer-events-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-accent mb-4" />
            <p className="font-display text-xl text-dark/40 uppercase tracking-widest">Fetching Resources...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="py-20 text-center bg-muted/5 rounded-3xl border-2 border-dashed border-muted/20">
            <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-2xl font-display text-dark mb-2">NO MATERIALS FOUND</h3>
            <p className="text-body/40 font-body max-w-xs mx-auto">
              We couldn't find any materials matching your criteria. Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <motion.div 
                key={material.id}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-muted/10 group"
              >
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-20 bg-muted/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                    <BookIcon className="w-8 h-8 text-muted group-hover:text-accent transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-muted/20 rounded text-[8px] font-bold uppercase text-body/60">{material.semester}</span>
                      <span className="px-2 py-0.5 bg-accent/10 rounded text-[8px] font-bold uppercase text-accent">{material.type || 'PDF'}</span>
                    </div>
                    <h3 className="font-display text-lg text-dark truncate mb-1">{material.title}</h3>
                    <p className="text-xs text-body/40 font-body mb-4">{material.subject}</p>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => onOpenMaterial(material)}
                        className="flex-1 py-2 bg-dark text-bg text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-accent hover:text-dark transition-all flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-3 h-3" /> View
                      </button>
                      <button className="p-2 bg-muted/10 text-dark rounded-full hover:bg-muted/20 transition-all">
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-16 p-8 bg-dark rounded-[2.5rem] text-bg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl font-display leading-none mb-4">CONTRIBUTE TO THE COMMUNITY</h2>
              <p className="text-muted/60 font-body text-sm">
                Have high-quality notes or question papers? Share them with your fellow students and help build 
                the most comprehensive engineering resource library.
              </p>
            </div>
            <button className="px-8 py-4 bg-accent text-dark font-display uppercase tracking-widest text-sm rounded-2xl hover:scale-105 transition-all flex items-center gap-2">
              Upload Material <ExternalLink className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>
      </div>
    </div>
  );
};
