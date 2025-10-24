/*
 * Files        : post.item.ts, post.item.html
 * Description  : Post item. Provides post and appropriate functions.
 * Author       : Kuts Vladyslav Ivanovich
 */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Post } from '../../../models/entities/recipes-api/social/post.entity';

@Component({
  selector: 'rcps-post-item',
  standalone: true,
  templateUrl: 'post.item.html',
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
})
export class PostItem {
  @Input() post: Post | undefined;

  @Output() like = new EventEmitter<Post>();
  @Output() dislike = new EventEmitter<Post>();

  // если mediaUnit.video — URL/Blob — просто отдаём строку
  get videoUrl(): string | null {
    const url = this.post?.mediaUnit?.video as unknown as string | undefined;
    return url && url.length ? url : null;
  }

  onLike(): void    { if (this.post) this.like.emit(this.post); }
  onDislike(): void { if (this.post) this.dislike.emit(this.post); }

  timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const min = 60_000, hr = 60 * min, day = 24 * hr;
    if (diff < hr) return `${Math.max(1, Math.floor(diff / min))} min ago`;
    if (diff < day) return `${Math.floor(diff / hr)} h ago`;
    return `${Math.floor(diff / day)} d ago`;
  }
}
