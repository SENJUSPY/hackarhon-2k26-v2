import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, 
  Mail, 
  GraduationCap, 
  Hash, 
  BookOpen, 
  Award,
  Edit2,
  Check,
  X
} from 'lucide-react';

interface ProfileProps {
  user: FirebaseUser;
  onClose: () => void;
}

export const Profile = ({ user, onClose }: ProfileProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        setEditedProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user.uid]);

  const handleSave = async () => {
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, editedProfile);
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-4xl w-full bg-bg rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        {/* Left Side - Visual */}
        <div className="md:w-1/3 bg-dark p-12 text-bg flex flex-col items-center text-center">
          <div className="w-32 h-32 bg-accent rounded-full flex items-center justify-center mb-8 relative group">
            <UserIcon className="w-16 h-16 text-dark" />
            <div className="absolute inset-0 bg-dark/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Edit2 className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-3xl font-display leading-none mb-2">{profile?.name || 'Scholar'}</h2>
          <p className="text-muted/40 text-sm font-body mb-8">{profile?.email}</p>
          
          <div className="w-full space-y-4">
            <div className="bg-muted/5 p-4 rounded-2xl border border-muted/10">
              <div className="text-[10px] uppercase font-bold tracking-widest text-accent mb-1">Status</div>
              <div className="font-display text-xl uppercase">{profile?.course || 'STUDENT'}</div>
            </div>
            <div className="bg-muted/5 p-4 rounded-2xl border border-muted/10">
              <div className="text-[10px] uppercase font-bold tracking-widest text-accent mb-1">Academic Rank</div>
              <div className="font-display text-xl">TOP SCHOLAR</div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="mt-auto flex items-center gap-2 text-muted/40 hover:text-bg transition-colors text-xs uppercase font-bold tracking-widest"
          >
            <X className="w-4 h-4" /> Close Profile
          </button>
        </div>

        {/* Right Side - Details */}
        <div className="md:w-2/3 p-12 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-4xl font-display text-dark leading-none">ACADEMIC PROFILE</h3>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`p-3 rounded-2xl transition-all ${isEditing ? 'bg-accent text-dark' : 'bg-muted/10 text-dark hover:bg-dark hover:text-bg'}`}
            >
              {isEditing ? <Check className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-dark/30 flex items-center gap-2">
                <UserIcon className="w-3 h-3" /> Full Name
              </label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                  className="w-full px-4 py-3 bg-muted/10 rounded-xl outline-none focus:ring-2 focus:ring-accent font-body"
                />
              ) : (
                <div className="text-lg font-body text-dark">{profile?.name}</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-dark/30 flex items-center gap-2">
                <Hash className="w-3 h-3" /> Roll Number
              </label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editedProfile.rollNumber}
                  onChange={(e) => setEditedProfile({...editedProfile, rollNumber: e.target.value})}
                  className="w-full px-4 py-3 bg-muted/10 rounded-xl outline-none focus:ring-2 focus:ring-accent font-body"
                />
              ) : (
                <div className="text-lg font-body text-dark">{profile?.rollNumber}</div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-dark/30 flex items-center gap-2">
                <GraduationCap className="w-3 h-3" /> College Name
              </label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editedProfile.collegeName}
                  onChange={(e) => setEditedProfile({...editedProfile, collegeName: e.target.value})}
                  className="w-full px-4 py-3 bg-muted/10 rounded-xl outline-none focus:ring-2 focus:ring-accent font-body"
                />
              ) : (
                <div className="text-lg font-body text-dark">{profile?.collegeName}</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-dark/30 flex items-center gap-2">
                <Award className="w-3 h-3" /> Branch
              </label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editedProfile.branch}
                  onChange={(e) => setEditedProfile({...editedProfile, branch: e.target.value})}
                  className="w-full px-4 py-3 bg-muted/10 rounded-xl outline-none focus:ring-2 focus:ring-accent font-body"
                />
              ) : (
                <div className="text-lg font-body text-dark">{profile?.branch}</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-dark/30 flex items-center gap-2">
                <GraduationCap className="w-3 h-3" /> Course
              </label>
              {isEditing ? (
                <select 
                  value={editedProfile.course}
                  onChange={(e) => setEditedProfile({...editedProfile, course: e.target.value})}
                  className="w-full px-4 py-3 bg-muted/10 rounded-xl outline-none focus:ring-2 focus:ring-accent font-body"
                >
                  <option value="btech">B.Tech</option>
                  <option value="diploma">Diploma</option>
                </select>
              ) : (
                <div className="text-lg font-body text-dark uppercase">{profile?.course}</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-dark/30 flex items-center gap-2">
                <BookOpen className="w-3 h-3" /> Year of Course
              </label>
              {isEditing ? (
                <select 
                  value={editedProfile.yearOfCourse}
                  onChange={(e) => setEditedProfile({...editedProfile, yearOfCourse: e.target.value})}
                  className="w-full px-4 py-3 bg-muted/10 rounded-xl outline-none focus:ring-2 focus:ring-accent font-body"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              ) : (
                <div className="text-lg font-body text-dark">{profile?.yearOfCourse}</div>
              )}
            </div>
          </div>

          <div className="mt-12 p-8 bg-dark rounded-3xl text-bg">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-display text-xl">ACADEMIC PROGRESS</h4>
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-display text-accent">12</div>
                <div className="text-[8px] uppercase font-bold tracking-widest opacity-40">Resources Read</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display text-accent">2.4k</div>
                <div className="text-[8px] uppercase font-bold tracking-widest opacity-40">Pages Studied</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display text-accent">48h</div>
                <div className="text-[8px] uppercase font-bold tracking-widest opacity-40">Study Time</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
