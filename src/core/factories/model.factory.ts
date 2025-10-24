/*
 * File        : model.factory.ts
 * Description : Main factory of the model.
 * Author      : Kuts Vladyslav Ivanovich
 */

import { Post } from "../models/entities/recipes-api/social/post.entity";
import { Dish } from "../models/entities/recipes-api/business/dish.entity";
import { Comment } from "../models/entities/recipes-api/social/comment.entity";

import { MediaUnit } from "../models/entities/recipes-api/social/media-unit.entity";
import { SocialData } from "../models/entities/recipes-api/social/social-data.entity";
import { CookInfo } from "../models/entities/recipes-api/business/cook-info.entity";
import { Macronutrients } from "../models/entities/recipes-api/business/macronutrients.entity";
import { Micronutrients } from "../models/entities/recipes-api/business/micronutrients.entity";
import { Step } from "../models/entities/recipes-api/business/step.entity";
import { Image } from "../models/entities/recipes-api/business/image.entity";

export class ModelFactory
{
    public static createCookInfo
    (
        time: string = "",
        yieldVal: number = 0,
        servingSize: number = 0,
        note: string = ""
    ): CookInfo
    { return { time, yield: yieldVal, servingSize, note }; }

    public static createMacronutrients
    (
        kcal: number = 0,
        saturatedFat: number = 0,
        transFat: number = 0,
        sugars: number = 0,
        fiber: number = 0,
        protein: number = 0,
        salt: number = 0
    ): Macronutrients
    { return { kcal, saturatedFat, transFat, sugars, fiber, protein, salt }; }

    public static createMicronutrients
    (
        sodium: number = 0,
        calcium: number = 0,
        iron: number = 0,
        vitaminD: number = 0,
        potassium: number = 0
    ): Micronutrients
    { return { sodium, calcium, iron, vitaminD, potassium }; }

    public static createDish
    (
        id: number = 0,
        name: string = "",
        description: string = "",
        cookInfo: CookInfo = this.createCookInfo(),
        macronutrients: Macronutrients = this.createMacronutrients(),
        micronutrients: Micronutrients = this.createMicronutrients(),
        steps: Step[] = [],
        images: Image[] = []
    ): Dish
    {
        return {
            id,
            name,
            description,
            cookInfo,
            macronutrients,
            micronutrients,
            steps,
            images
        };
    }

    public static createPost
    (
        name: string = "", description: string = "",
        mediaUnit: MediaUnit = this.createMediaUnit(),
        socialData: SocialData = this.createSocialData(),
        createdAt: number = Date.now(),
        comments: Comment[] = []
    ): Post
    {
        return {
            name,
            description,
            socialData,
            createdAt,
            mediaUnit,
            comments
        };
    }

    public static createComment(id: number = 0, text: string = "", likes: number = 0, createdAt: number = 0): Comment
    { return { id, text, likes, createdAt } }

    public static createMediaUnit(video: Blob | File = new Blob()): MediaUnit
    { return { video } }

    public static createSocialData(likes: number = 0, dislikes: number = 0): SocialData
    { return { likes, dislikes } }
}