export interface MealSchedule {
  id: number;
  userId: string;
  foodId: number;
  quantity: number;
  mealTime: string;
  repeat: string;
  createdAt: string;
}
