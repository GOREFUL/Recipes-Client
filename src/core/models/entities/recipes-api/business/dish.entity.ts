/*
 * File        : dish.entity.ts
 * Description : Dish entity
 * Author      : Kuts Vladyslav Ivanovich
 */

import { CookInfo } from './cook-info.entity';
import { Macronutrients } from './macronutrients.entity';
import { Micronutrients } from './micronutrients.entity';
import { Step } from './step.entity';
import { Image } from './image.entity';

export interface Dish
{
  id: number;
  name: string;
  description: string;
  cookInfo: CookInfo;
  macronutrients: Macronutrients;
  micronutrients: Micronutrients;
  steps: Step[];
  images: Image[];
}