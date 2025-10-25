import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Post } from '../../../models/entities/recipes-api/business/post.entity'; // 👈 твой интерфейс

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

  onLike(): void {
    if (this.post) this.like.emit(this.post);
  }

  onDislike(): void {
    if (this.post) this.dislike.emit(this.post);
  }
}
