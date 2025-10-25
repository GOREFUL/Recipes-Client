// src/core/app/features/post/posts/posts.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AddPostDialog } from '../../shared/add-post-dialog/add-post.dialog';
import { PostSrvc, Post, PostDto } from '../../../services/network/post.service';

@Component({
  selector: 'rcps-posts-page',
  standalone: true,
  templateUrl: 'posts.page.html',
  imports: [CommonModule, MatButtonModule, MatIconModule],
})
export class PostsPage implements OnInit {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  public postSrvc = inject(PostSrvc);

  ngOnInit(): void {
    this.postSrvc.loadMine();
  }

  onAdd(): void {
    const ref = this.dialog.open(AddPostDialog, {
      width: '600px',
      disableClose: true,
    });

    ref.afterClosed().subscribe((dto?: PostDto) => {
      if (!dto) return;
      this.postSrvc.create(dto).subscribe({
        next: () => this.postSrvc.loadMine(),
        error: () => this.postSrvc.loadMine(),
      });
    });
  }

  onRefresh(): void {
    this.postSrvc.loadMine();
  }

  onOpen(post: Post): void {
    if (!post?.id) return;
    this.router.navigate(['/posts', post.id]);
  }

  onDelete(post: Post): void {
    if (!post?.id) return;
    if (!confirm('Delete this post?')) return;

    this.postSrvc.delete(post.id).subscribe({
      next: () => this.postSrvc.loadMine(),
      error: () => this.postSrvc.loadMine(),
    });
  }

  public onSelectPost(post: Post): void {
    this.router.navigate(['/posts', post.id]);
  }
}
