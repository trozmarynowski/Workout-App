import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { Camera, Save, User } from 'lucide-react';

export function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    bio: '',
    avatarUrl: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('wt_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveProfile = () => {
    localStorage.setItem('wt_profile', JSON.stringify(profile));
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-24 pt-6 px-4 max-w-md mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Profil</h2>
        {isEditing ? (
          <button
            onClick={saveProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon text-black font-bold hover:bg-neon/90 transition-colors"
          >
            <Save size={18} /> Zapisz
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-lg bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition-colors"
          >
            Edytuj
          </button>
        )}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-neon bg-neutral-800 flex items-center justify-center">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-neutral-500" />
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera size={24} className="text-white" />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-bold text-neutral-400 mb-2">Imię / Nick</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-neon focus:ring-1 focus:ring-neon transition-all mb-4"
                placeholder="Podaj swoje imię..."
              />
            ) : (
              <div className="text-xl font-bold text-white mb-4 text-center">
                {profile.name || 'Nie podano imienia'}
              </div>
            )}

            <label className="block text-sm font-bold text-neutral-400 mb-2">O mnie / Cel treningowy</label>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-neon focus:ring-1 focus:ring-neon transition-all min-h-[100px] resize-none"
                placeholder="Napisz kilka słów o sobie..."
              />
            ) : (
              <div className="text-neutral-300 text-center whitespace-pre-wrap">
                {profile.bio || 'Wypełnij profil i napisz coś o sobie!'}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
