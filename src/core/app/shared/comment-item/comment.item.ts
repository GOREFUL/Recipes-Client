/*
 * Files        : comment.item.ts, comment.item.html
 * Description  : Comment item. Provides comment and appropriate functions.
 * Author       : Kuts Vladyslav Ivanovich
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { GeneralSrvc } from '../../../services/general.service';
import { Comment } from '../../../models/entities/recipes-api/social/comment.entity';

@Component({
  selector: 'rcps-comment-item',
  standalone: true,
  templateUrl: 'comment.item.html',
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
})
export class CommentItem {
  @Input() public comment: Comment | undefined;

  @Output() public like = new EventEmitter<Comment>();
  @Output() public dislike = new EventEmitter<Comment>();
  @Output() public report = new EventEmitter<Comment>();

  public onLike(): void {
  if (this.comment) {
    this.ui.liked = !this.ui.liked;
    if (this.ui.liked) this.ui.disliked = false;
    this.like.emit(this.comment);
  }  }

  public onDislike(): void {
  if (this.comment) {
    this.ui.disliked = !this.ui.disliked;
    if (this.ui.disliked) this.ui.liked = false;
    this.dislike.emit(this.comment);
  }  }

  public onReport(): void {
    if (this.comment) this.report.emit(this.comment);
  }

  public formatDate(): string {
    return GeneralSrvc.formatDate(this.comment?.createdAt ?? 0);
  }
  ui = { liked: false, disliked: false };



}
