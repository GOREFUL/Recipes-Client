import { CookInfo } from './cook-info.entity';
import { Macronutrients } from './macronutrients.entity';
import { Ingredient } from './ingredient.entity';
import { Image } from './image.entity';
import { Cuisine } from './cuisine.entity';
import { Allergy } from './allergy.entity';

export interface Dish
{
  id: number;
  name: string;
  description: string;
  cookInfo: CookInfo;
  macronutrients: Macronutrients;
  ingredients: Ingredient[];
  images: Image[];
  allergies: Allergy[];
  cuisines: Cuisine[];
}