export type Locale = 'zh' | 'en';

export interface MealPlan {
  fixedBreakfast: FixedBreakfast;
  weekPlan: DayPlan[];
  shoppingList: ShoppingList;
  recipes: Recipe[];
  mealPrepTips: string[];
  executionReminders: string[];
}

export interface FixedBreakfast {
  smoothie: Ingredient[];
  you: string;
  wife: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface ProteinItem {
  name: string;
  amount: number;
  weightBasis: 'raw';
}

export interface PersonWeighing {
  rice: number;
  protein: ProteinItem;
  vegetable: number;
  oil: number;
  powder: number;
}

export interface DayPlan {
  day: number;
  dayType: '虾仁日' | '牛肉日';
  menu: string;
  you: PersonWeighing;
  wife: PersonWeighing;
}

export interface Recipe {
  day: number;
  title: string;
  steps: string[];
}

export interface ShoppingList {
  breakfast: ShoppingItem[];
  staple: ShoppingItem[];
  protein: ShoppingItem[];
  vegetable: ShoppingItem[];
  oil: ShoppingItem[];
  pantry: ShoppingItem[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  displayAmount: string;
  note?: string;
}
