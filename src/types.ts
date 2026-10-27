export interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  meal: string;
  time: string;
  difficulty?: string;
  calories?: string;
  ingredients: string[];
  steps: string[];
  tips?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  done: boolean;
  addedAt: number;
}

export type MealType = 'فطور' | 'غداء' | 'عشاء' | 'تحلاية';

export interface WeeklyPlan {
  [day: string]: {
    [meal: string]: string; // recipe ID
  };
}

export type TabType = 'ai' | 'pantry' | 'planner' | 'favorites' | 'shopping';

export interface ActiveTimer {
  id: string;
  recipeName: string;
  stepNumber: number;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}
