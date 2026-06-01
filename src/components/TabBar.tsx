import { Screen } from '../types';
import { Home, Play, History, Dumbbell, Calculator, User } from 'lucide-react';

interface TabBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isWorkoutActive: boolean;
}

export function TabBar({ currentScreen, onNavigate, isWorkoutActive }: TabBarProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 bg-neutral-900 border-t border-neutral-800 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            currentScreen === 'dashboard' ? 'text-neon' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Home size={20} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Start</span>
        </button>
        
        <button
          onClick={() => onNavigate('exercises')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            currentScreen === 'exercises' ? 'text-neon' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Dumbbell size={20} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Baza</span>
        </button>

        <button
          onClick={() => onNavigate('calculator')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            currentScreen === 'calculator' ? 'text-neon' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Calculator size={20} />
          <span className="text-[10px] font-medium uppercase tracking-wider">1RM</span>
        </button>

        {isWorkoutActive && (
          <button
            onClick={() => onNavigate('workout')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentScreen === 'workout' ? 'text-neon' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <div className={`p-1.5 rounded-full ${currentScreen === 'workout' ? 'bg-neon/20' : 'bg-neutral-800'}`}>
              <Play size={16} className={currentScreen === 'workout' ? 'text-neon' : ''} fill="currentColor" />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider">Trening</span>
          </button>
        )}

        <button
          onClick={() => onNavigate('history')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            currentScreen === 'history' ? 'text-neon' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <History size={20} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Historia</span>
        </button>
        
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            currentScreen === 'profile' ? 'text-neon' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <User size={20} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Profil</span>
        </button>
      </div>
    </div>
  );
}
