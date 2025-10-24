/*
 * Files        : comments.page.ts, comments.page.html
 * Description  : Comments page. Gives possibility to operate comments of the post.
 * Author       : Kuts Vladyslav Ivanovich
 */

import { Component, inject, Input, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CommentItem } from '../../shared/comment-item/comment.item';

import { CommentSrvc } from '../../../services/network/comment.service';
import { UtilsFactory } from '../../../factories/utils.factory';

import { Comment } from '../../../models/entities/recipes-api/social/comment.entity';

@Component
({
  selector: 'rcps-comments-page',
  templateUrl: 'comments.page.html',
  imports:
  [
    CommonModule,
    FormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,

    CommentItem
  ]
})
/**
 * Comments page of the post
*/
export class CommentsPage
{
  private readonly _commentSrvc: CommentSrvc = inject(CommentSrvc)

  @Input() public comments: Comment[] | undefined

  public readonly text: string = ''

  public onSend(): void
  {
    if (!this.text.trim())
      return;

    const comment = UtilsFactory.createComment(0, this.text);
    this._commentSrvc.add(0, comment);
  }

  onLike(comment: Comment): void
  { this._commentSrvc.like(comment.id) }

  onDislike(comment: Comment): void
  { this._commentSrvc.dislike(comment.id) }

  onReport(comment: Comment): void
  { this._commentSrvc.report(comment.id, { reason: "something" }); }
}