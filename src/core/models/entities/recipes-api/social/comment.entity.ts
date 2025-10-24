/*
 * File        : comment.entity.ts
 * Description : Comment entity
 * Author      : Kuts Vladyslav Ivanovich
*/
export interface Comment
{
  id: number
  text: string;
  likes: number;
  createdAt: number;
}