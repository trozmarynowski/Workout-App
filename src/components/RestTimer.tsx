import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, X, Timer, Bell, VolumeX, Volume2, Minus, Plus } from 'lucide-react';

interface RestTimerProps {
  onDismiss?: () => void;
}

export function RestTimer({ onDismiss }: RestTimerProps) {
  const [initialTime, setInitialTime] = useState(90); // default 90s
  const [timeLeft, setTimeLeft] = useState(90);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create synthesizer beep sound when time is up
    if (typeof window !== 'undefined') {
      // Create a small audio buffer or synth beep using Web Audio API
      // That's more reliable and self-contained than an external URL
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playAlertSound();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (
        freq: number, 
        startTime: number, 
        duration: number, 
        volume: number, 
        type: 'sine' | 'triangle' = 'sine'
      ) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Soft envelope: longer attack for smooth/soft swell (0.15s), exponential decay
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.18);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      
      // Warm, deep cinematic ambient chord with staggered soft entry
      // Using G major/add9 structure in a lower register with triangle and sine waves
      playTone(196.00, now,       2.5, 0.20, 'triangle'); // G3 (Deep woody body)
      playTone(293.66, now + 0.1, 2.2, 0.15, 'triangle'); // D4 (Warm fifth)
      playTone(392.00, now + 0.2, 2.0, 0.10, 'sine');     // G4 (Pure mellow octave)
      playTone(493.88, now + 0.3, 1.8, 0.08, 'sine');     // B4 (Soft warm third chime)

    } catch (e) {
      console.error('Audio play failed', e);
    }
  };

  const handleQuickSelect = (seconds: number) => {
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
  };

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const adjustTime = (amount: number) => {
    const newTime = Math.max(10, timeLeft + amount);
    setTimeLeft(newTime);
    if (!isActive) {
      setInitialTime(newTime);
    }
  };

  const formatMMSS = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Percentage for progress circle SVG (radius = 40, circumference ~ 251.2)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = initialTime > 0 
    ? circumference - (timeLeft / initialTime) * circumference 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 50 }}
      drag={!isMinimized}
      dragConstraints={{ left: -100, right: 100, top: -400, bottom: 20 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[320px] bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden touch-none"
    >
      {/* Timer top border / status */}
      <div className="bg-neutral-900 px-4 py-2 flex items-center justify-between border-b border-neutral-900 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <Timer size={14} className="text-neon" />
          <span className="text-[10px] font-mono font-bold text-neutral-400 tracking-wider">REST TIMER</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 text-neutral-500 hover:text-white transition-colors"
            title={soundEnabled ? "Wycisz" : "Włącz dźwięk"}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-[10px] font-bold uppercase tracking-wider bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded transition-colors"
          >
            {isMinimized ? "Rozwiń" : "Zwiń"}
          </button>
          <button
            onClick={onDismiss}
            className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isMinimized ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4"
          >
            {/* Visual countdown & controls row */}
            <div className="flex items-center justify-between mb-4">
              {/* Left decrease button */}
              <button
                onClick={() => adjustTime(-15)}
                className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 flex items-center justify-center transition-all active:scale-90"
              >
                <Minus size={16} />
                <span className="sr-only">-15s</span>
              </button>

              {/* Central Circle Display */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    className="stroke-neutral-900"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r={radius}
                    className="stroke-neon"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ ease: 'linear', duration: 0.2 }}
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-mono font-bold text-white tracking-widest">
                    {formatMMSS(timeLeft)}
                  </span>
                  {timeLeft === 0 && (
                    <span className="text-[10px] text-neon font-bold animate-pulse absolute bottom-2">
                      KONIEC!
                    </span>
                  )}
                </div>
              </div>

              {/* Right increase button */}
              <button
                onClick={() => adjustTime(15)}
                className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 flex items-center justify-center transition-all active:scale-90"
              >
                <Plus size={16} />
                <span className="sr-only">+15s</span>
              </button>
            </div>

            {/* Quick choices */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[60, 90, 120].map((s) => (
                <button
                  key={s}
                  onClick={() => handleQuickSelect(s)}
                  className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
                    initialTime === s
                      ? 'bg-neon/10 border-neon/30 text-neon'
                      : 'bg-neutral-900/50 border-neutral-850 hover:border-neutral-700 text-neutral-400'
                  }`}
                >
                  {s}s
                </button>
              ))}
            </div>

            {/* Main Action Controllers */}
            <div className="flex gap-2">
              <button
                onClick={toggleActive}
                className={`flex-1 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  isActive
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
                    : 'bg-neon text-black hover:brightness-110'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause size={14} fill="currentColor" /> Pauza
                  </>
                ) : (
                  <>
                    <Play size={14} fill="currentColor" /> Start
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                className="px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                title="Resetuj"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Minimized view */
          <div className="flex items-center justify-between p-3 bg-neutral-950 font-mono">
            <span className={`text-base font-bold tracking-widest ${isActive ? 'text-neon animate-pulse' : 'text-neutral-400'}`}>
              {formatMMSS(timeLeft)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={toggleActive}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive ? 'bg-amber-500/10 text-amber-500' : 'bg-neon text-black'
                }`}
              >
                {isActive ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
              </button>
              <button
                onClick={resetTimer}
                className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
