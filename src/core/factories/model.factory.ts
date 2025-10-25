/*
 * File        : model.factory.ts
 * Description : Main factory of the model.
 * Author      : Kuts Vladyslav Ivanovich
 */

import { Post } from "../models/entities/recipes-api/business/post.entity";
import { Dish } from "../models/entities/recipes-api/business/dish.entity";

import { CookInfo } from "../models/entities/recipes-api/business/cook-info.entity";
import { Macronutrients } from "../models/entities/recipes-api/business/macronutrients.entity";
import { Image } from "../models/entities/recipes-api/business/image.entity";
import { Ingredient } from "../models/entities/recipes-api/business/ingredient.entity";
import { Allergy } from "../models/entities/recipes-api/business/allergy.entity";
import { Cuisine } from "../models/entities/recipes-api/business/cuisine.entity";

export class ModelFactory {

  public static createCookInfo(
    time: string = "",
    yieldVal: number = 0,
    servingSize: number = 0,
    note: string = ""
  ): CookInfo {
    return { time, yield: yieldVal, servingSize, note };
  }

  public static createMacronutrients(
    kcal: number = 0,
    saturatedFat: number = 0,
    transFat: number = 0,
    sugars: number = 0,
    fiber: number = 0,
    protein: number = 0,
    salt: number = 0
  ): Macronutrients {
    return { kcal, saturatedFat, transFat, sugars, fiber, protein, salt };
  }

  public static createIngredient(
    name: string = "",
    value: number = 0,
    measure: string = ""
  ): Ingredient {
    return { name, value, measure };
  }

  public static createAllergy(name: string = ""): Allergy {
    return { name };
  }

  public static createCuisine(name: string = ""): Cuisine {
    return { name };
  }

  public static createImage(
    image: string = "",
    description: string = ""
  ): Image {
    return { image, description };
  }

  public static createDish(
    id: number = 0,
    name: string = "",
    description: string = "",
    cookInfo: CookInfo = this.createCookInfo(),
    macronutrients: Macronutrients = this.createMacronutrients(),
    ingredients: Ingredient[] = [],
    images: Image[] = [],
    allergies: Allergy[] = [],
    cuisines: Cuisine[] = []
  ): Dish {
    return {
      id,
      name,
      description,
      cookInfo,
      macronutrients,
      ingredients,
      images,
      allergies,
      cuisines
    };
  }

  public static createPost(
    id: number = 0,
    mediaUrl: string = "",
    description: string = "",
    title: string = "",
    dishId: number = 0
  ): Post {
    return {
      id,
      mediaUrl,
      description,
      title,
      dishId
    };
  }
}
