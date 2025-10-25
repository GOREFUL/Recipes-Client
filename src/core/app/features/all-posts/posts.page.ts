import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AddPostDialog } from '../../shared/add-post-dialog/add-post.dialog';
import { PostItem } from '../../shared/post-card/post.item';

import { PostSrvc } from '../../../services/network/post.service';
import { Post } from '../../../models/entities/recipes-api/business/post.entity';

@Component({
  selector: 'rcps-posts-page',
  templateUrl: 'posts.page.html',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    PostItem,
  ],
})
export class PostsPage implements OnInit {
  private readonly matDialog = inject(MatDialog);
  private readonly router = inject(Router);
  public readonly postSrvc = inject(PostSrvc);

  ngOnInit(): void {
    this.postSrvc.loadAll();
  }
  public onAdd(): void {
    const dialogRef = this.matDialog.open(AddPostDialog, {
      width: '600px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((value: Post | undefined) => {
      if (value) {
        this.postSrvc.create(value).subscribe(() => this.postSrvc.loadAll());
      }
    });
  }

  public onRefresh(): void {
    this.postSrvc.loadAll();
  }

  public onSelectPost(post: Post): void {
    this.router.navigate(['/posts', post.id]);
  }
}
