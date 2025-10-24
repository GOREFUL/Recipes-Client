/*
 * File        : post.entity.ts
 * Description : Post entity
 * Author      : Kuts Vladyslav Ivanovich
 */

import { SocialData } from './social-data.entity';
import { MediaUnit } from './media-unit.entity';
import { Comment } from './comment.entity';

export interface Post
{
  id: number;
  name: string;
  description: string;
  socialData: SocialData;
  createdAt: number,
  mediaUnit: MediaUnit;
  comments: Comment[];
}