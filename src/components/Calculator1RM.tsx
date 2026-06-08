import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ChevronRight, Check } from 'lucide-react';

export function Calculator1RM() {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  // Epley Formula: 1RM = weight * (1 + reps / 30)
  // Brzycki Formula: 1RM = weight * (36 / (37 - reps))
  const calculate1RM = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    
    if (!w || !r || r < 1) return null;

    return {
      epley: w * (1 + r / 30),
      brzycki: w * (36 / (37 - r)),
      lombardi: w * Math.pow(r, 0.10)
    };
  };

  const results = calculate1RM();
  const average1RM = results ? (results.epley + results.brzycki + results.lombardi) / 3 : null;

  const getPercentages = (rm: number) => {
    return [
      { p: 100, reps: '1', val: rm },
      { p: 95, reps: '2', val: rm * 0.95 },
      { p: 90, reps: '3-4', val: rm * 0.90 },
      { p: 85, reps: '5-6', val: rm * 0.85 },
      { p: 80, reps: '7-8', val: rm * 0.80 },
      { p: 75, reps: '9-10', val: rm * 0.75 },
      { p: 70, reps: '11-12', val: rm * 0.70 },
      { p: 65, reps: '14-15', val: rm * 0.65 },
      { p: 60, reps: '16-20', val: rm * 0.60 },
    ];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pb-24 pt-8 px-4"
    >
      <h1 className="text-3xl font-bold text-white mb-6 px-2 flex items-center gap-2">
        <Calculator size={28} /> Kalkulator 1RM
      </h1>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg mx-2 mb-8">
        <p className="text-neutral-400 text-sm mb-6">
          Oblicz swój szacowany maksymalny ciężar na jedno powtórzenie (1 Rep Max) oraz procentowe obciążenia treningowe.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Ciężar (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0"
              className="w-full bg-neutral-950 border border-neutral-800 text-white font-bold text-lg rounded-xl p-4 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon text-center [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Powtórzenia
            </label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="0"
              className="w-full bg-neutral-950 border border-neutral-800 text-white font-bold text-lg rounded-xl p-4 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon text-center [color-scheme:dark]"
            />
          </div>
        </div>

        {average1RM && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-950 rounded-xl p-5 border border-neon/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            <p className="text-neon text-xs font-bold uppercase tracking-wider mb-1 text-center">Szacowany 1RM</p>
            <p className="text-white font-black text-5xl tracking-tight text-center">
              {average1RM.toFixed(1)} <span className="text-xl text-neutral-500 font-bold">kg</span>
            </p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {average1RM && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-2"
          >
            <h2 className="text-white font-bold text-lg mb-4">Procenty 1RM</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="grid grid-cols-3 bg-neutral-950 px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-800">
                <div>% 1RM</div>
                <div className="text-center">Powtórzenia</div>
                <div className="text-right">Ciężar</div>
              </div>
              
              <div className="divide-y divide-neutral-800/50">
                {getPercentages(average1RM).map((item, idx) => (
                  <div key={item.p} className={`grid grid-cols-3 px-4 py-3 items-center ${idx === 0 ? 'bg-neon/5' : ''}`}>
                    <div className={`font-bold ${idx === 0 ? 'text-neon' : 'text-neutral-300'}`}>
                      {item.p}%
                    </div>
                    <div className="text-center text-neutral-500 text-sm">
                      ~{item.reps}
                    </div>
                    <div className={`text-right font-mono font-bold ${idx === 0 ? 'text-white' : 'text-neutral-300'}`}>
                      {item.val.toFixed(1)} kg
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
