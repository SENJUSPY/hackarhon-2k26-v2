import React, { useState, useEffect } from 'react';
import { db, logOut } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, updateProfile as updateAuthProfile } from 'firebase/auth';
import { X, Edit2, Save, LogOut, Loader2, User as UserIcon } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
}

interface ProfileProps {
  user: User;
  onClose: () => void;
}

export function Profile({ user, onClose }: ProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData(data);
          setEditName(data.name);
        }
      } catch (error) {
        console.error('Error fetching user data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user.uid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { name: editName });
      await updateAuthProfile(user, { displayName: editName });
      setUserData(prev => prev ? { ...prev, name: editName } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-obsidian/90 backdrop-blur-sm z-[100] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-obsidian/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-obsidian border border-white/10 w-full max-w-lg rounded-none shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UserIcon className="w-5 h-5 text-green" />
            <h2 className="text-lg font-display uppercase tracking-tighter text-snow">User Profile</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-green text-obsidian rounded-none flex items-center justify-center text-4xl font-bold mb-4">
              {userData?.name?.charAt(0) || user.email?.charAt(0)}
            </div>
            {isEditing ? (
              <div className="w-full max-w-xs">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-center text-snow focus:outline-none focus:border-green"
                  autoFocus
                />
              </div>
            ) : (
              <h3 className="text-2xl text-snow font-display uppercase tracking-tight">{userData?.name}</h3>
            )}
            <p className="text-silver/50 text-sm mt-1">{user.email}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            <div className="p-4 bg-white/5 border border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-silver/40 block mb-1">Account ID</span>
              <span className="text-xs font-mono text-silver truncate block">{user.uid}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/10 flex gap-4">
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green text-obsidian py-3 uppercase text-xs font-bold tracking-widest hover:bg-snow transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 border border-white/20 text-snow py-3 uppercase text-xs font-bold tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          )}
          <button
            onClick={() => logOut()}
            className="px-6 border border-red-500/30 text-red-500 py-3 uppercase text-xs font-bold tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
