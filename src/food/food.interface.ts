// src/foods/interfaces/food.interface.ts
export interface Ingredient {
  name: string;
  amount: string;
}

export interface Food {
  id?: number;
  name: string;
  kcal: number;
  fat: number;
  protein: number;
  carbo: number;
  level: 'Easy' | 'Medium' | 'Hard';
  cooking_time: number;
  ingredients: Ingredient[];
  recipe: string[];
  description: string;
  keywords: string[];
}
