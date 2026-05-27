import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, orderBy, limit, getDocs, setDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { LogIn, Users, Dumbbell, UserPlus, UserCheck } from 'lucide-react';
import { formatTime, formatDate } from '../utils';

interface SharedWorkout {
  id: string;
  userId: string;
  userDisplayName: string;
  workoutStartTime: number;
  duration: number;
  totalVolume: number;
  notes: string;
  createdAt: number;
}

export function Social() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [feed, setFeed] = useState<SharedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Ensure user profile exists
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          try {
            await setDoc(userRef, {
              displayName: currentUser.displayName || 'Anonim',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              createdAt: Date.now()
            });
          } catch (e) {
            console.error(e);
          }
        }
        
        // Load following
        try {
          const followingRef = collection(db, 'users', currentUser.uid, 'following');
          const followingSnap = await getDocs(followingRef);
          const fMap: Record<string, boolean> = {};
          followingSnap.forEach(d => {
            fMap[d.id] = true;
          });
          setFollowingMap(fMap);
        } catch(e) {
          console.error(e);
        }
      } else {
        setFollowingMap({});
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    async function loadFeed() {
      try {
        const q = query(collection(db, 'sharedWorkouts'), orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q);
        const workouts: SharedWorkout[] = [];
        snap.forEach(doc => {
          workouts.push({ id: doc.id, ...doc.data() } as SharedWorkout);
        });
        setFeed(workouts);
      } catch (error) {
        console.error("Failed to load feed", error);
      } finally {
        setLoading(false);
      }
    }
    
    // We can load feed even for non-authenticated users!
    loadFeed();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFollow = async (targetUserId: string) => {
    if (!user) return;
    try {
      const isFollowing = followingMap[targetUserId];
      const followingRef = doc(db, 'users', user.uid, 'following', targetUserId);
      const followerRef = doc(db, 'users', targetUserId, 'followers', user.uid);
      
      if (isFollowing) {
        await deleteDoc(followingRef);
        await deleteDoc(followerRef);
        setFollowingMap(prev => ({ ...prev, [targetUserId]: false }));
      } else {
        const now = Date.now();
        await setDoc(followingRef, {
          userId: targetUserId,
          timestamp: now
        });
        await setDoc(followerRef, {
          userId: user.uid,
          timestamp: now
        });
        setFollowingMap(prev => ({ ...prev, [targetUserId]: true }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pb-24 pt-8 px-4"
    >
      <div className="flex items-center justify-between mb-6 px-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Users size={28} /> Społeczność
        </h1>
        {user ? (
          <img src={user.photoURL || ''} alt="Profile" className="w-10 h-10 rounded-full border border-neutral-800" />
        ) : (
          <button 
            onClick={handleLogin}
            className="bg-neutral-800 hover:bg-neutral-700 text-white p-2 rounded-full transition-colors flex items-center gap-2 px-4 shadow-sm text-sm font-bold uppercase tracking-wider"
          >
            <LogIn size={16} /> Zaloguj
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-neutral-500 text-center py-10 font-medium">Ładowanie...</div>
        ) : feed.length > 0 ? (
          feed.map(w => (
            <div key={w.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neon/10 flex items-center justify-center border border-neon/20">
                    <Dumbbell size={14} className="text-neon" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{w.userDisplayName}</p>
                    <p className="text-xs text-neutral-500">{formatDate(w.workoutStartTime)}</p>
                  </div>
                </div>
                {user && user.uid !== w.userId && (
                  <button 
                    onClick={() => handleToggleFollow(w.userId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      followingMap[w.userId] 
                        ? 'bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700' 
                        : 'bg-neon text-black hover:brightness-110'
                    }`}
                  >
                    {followingMap[w.userId] ? (
                      <><UserCheck size={14} /> Obserwujesz</>
                    ) : (
                      <><UserPlus size={14} /> Obserwuj</>
                    )}
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-neutral-950 rounded-xl p-3 border border-neutral-800/50">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Czas Trwania</span>
                  <p className="text-white font-bold text-sm tracking-wide">{formatTime(w.duration || 0)}</p>
                </div>
                <div className="bg-neutral-950 rounded-xl p-3 border border-neutral-800/50">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Objętość</span>
                  <p className="text-white font-bold text-sm tracking-wide">{w.totalVolume.toFixed(0)} <span className="text-neutral-500 text-xs font-normal">kg</span></p>
                </div>
              </div>
              
              {w.notes && (
                 <p className="text-sm text-neutral-300 italic">"{w.notes}"</p>
              )}
            </div>
          ))
        ) : (
          <div className="bg-neutral-900 border border-dash border-neutral-800 rounded-2xl p-8 text-center text-neutral-500">
            <Users size={32} className="mx-auto mb-3 text-neutral-600" />
            <p>Brak aktywności w sieci.</p>
            <p className="text-xs mt-2">Udostępnij pierwszy trening ze swojej Historii!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
