import { Exercise, ExerciseCategory } from './types';

export const CATEGORIES: ExerciseCategory[] = [
  { name: 'Klatka piersiowa', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop' },
  { name: 'Plecy', image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=800&auto=format&fit=crop' },
  { name: 'Nogi', image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=800&auto=format&fit=crop' },
  { name: 'Barki', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop' },
  { name: 'Biceps', image: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?q=80&w=800&auto=format&fit=crop' },
  { name: 'Triceps', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop' }
];

export const EXERCISES: Exercise[] = [
  // CHEST
  { id: 'c1', name: 'Wyciskanie sztangi leżąc', muscleGroup: 'Klatka piersiowa', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop' },
  { id: 'c2', name: 'Wyciskanie hantli leżąc', muscleGroup: 'Klatka piersiowa', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop' },
  { id: 'c3', name: 'Wyciskanie hantli skos dodatni', muscleGroup: 'Klatka piersiowa', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop' },
  { id: 'c4', name: 'Rozpiętki hantlami', muscleGroup: 'Klatka piersiowa', image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=800&auto=format&fit=crop' },
  { id: 'c5', name: 'Pompki', muscleGroup: 'Klatka piersiowa', image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop' },
  { id: 'c6', name: 'Maszyna chest press', muscleGroup: 'Klatka piersiowa', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop' },
  { id: 'c7', name: 'Pompki na poręczach', muscleGroup: 'Klatka piersiowa', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop' },
  
  // BACK
  { id: 'b1', name: 'Martwy ciąg', muscleGroup: 'Plecy', image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=800&auto=format&fit=crop' },
  { id: 'b2', name: 'Podciąganie na drążku', muscleGroup: 'Plecy', image: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Marine_Pull-ups.jpg' },
  { id: 'b3', name: 'Wiosłowanie sztangą', muscleGroup: 'Plecy', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop' },
  { id: 'b4', name: 'Wiosłowanie hantlem jednorącz', muscleGroup: 'Plecy', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop' },
  { id: 'b5', name: 'Ściąganie drążka wyciągu górnego', muscleGroup: 'Plecy', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop' },
  { id: 'b6', name: 'Wiosłowanie na wyciągu siedząc', muscleGroup: 'Plecy', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop' },

  // LEGS
  { id: 'l1', name: 'Przysiady', muscleGroup: 'Nogi', image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=800&auto=format&fit=crop' },
  { id: 'l2', name: 'Wykroki', muscleGroup: 'Nogi', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop' },
  { id: 'l3', name: 'Suwnica', muscleGroup: 'Nogi', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop' },
  { id: 'l4', name: 'Prostowanie nóg na maszynie', muscleGroup: 'Nogi', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop' },
  { id: 'l5', name: 'Uginanie nóg na maszynie', muscleGroup: 'Nogi', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop' },
  { id: 'l6', name: 'Wspięcia na palce', muscleGroup: 'Nogi', image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=800&auto=format&fit=crop' },

  // SHOULDERS
  { id: 's1', name: 'Wyciskanie nad głowę', muscleGroup: 'Barki', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop' },
  { id: 's2', name: 'Unoszenie hantli bokiem', muscleGroup: 'Barki', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop' },
  { id: 's3', name: 'Face pull', muscleGroup: 'Barki', image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=800&auto=format&fit=crop' },
  { id: 's4', name: 'Arnold press', muscleGroup: 'Barki', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop' },

  // BICEPS
  { id: 'bi1', name: 'Uginanie bicepsów hantlami', muscleGroup: 'Biceps', image: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?q=80&w=800&auto=format&fit=crop' },
  { id: 'bi2', name: 'Uginanie sztangi', muscleGroup: 'Biceps', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop' },
  { id: 'bi3', name: 'Hammer curl', muscleGroup: 'Biceps', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop' },
  
  // TRICEPS
  { id: 't1', name: 'Prostowanie ramion na wyciągu', muscleGroup: 'Triceps', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop' },
  { id: 't2', name: 'Francuskie wyciskanie', muscleGroup: 'Triceps', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop' },
  { id: 't3', name: 'Dipy', muscleGroup: 'Triceps', image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Dips.jpg' },
];
