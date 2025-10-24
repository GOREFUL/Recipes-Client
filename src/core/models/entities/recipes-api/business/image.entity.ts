/*
 * File        : image.entity.ts
 * Description : Image entity
 * Author      : Kuts Vladyslav Ivanovich
 * Version     : 1.0.0
 */

export interface Image
{
  image: Blob | File;
  description: string;
}