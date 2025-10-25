import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { PostSrvc, Post } from '../../../services/network/post.service';

@Component({
  selector: 'rcps-home-page',
  standalone: true,
  templateUrl: 'home.page.html',
  imports: [CommonModule, MatButtonModule, MatIconModule],
})
export class HomePage implements OnInit {
  private router = inject(Router);
  public postSrvc = inject(PostSrvc);

  ngOnInit(): void {
    // При желании можно ограничить "за последние 24 часа"
    // const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    // this.postSrvc.loadFresh({ sinceUtc: since, page: 1, pageSize: 20 });
    this.postSrvc.loadFresh({ page: 1, pageSize: 20 });
  }

  isVideo(url?: string): boolean {
    if (!url) return false;
    return /\.(mp4|webm)(\?.*)?$/i.test(url);
  }

  open(post: Post) {
    if (!post?.id) return;
    this.router.navigate(['/posts', post.id]);
  }

  refresh() {
    this.postSrvc.loadFresh({ page: 1, pageSize: 20 });
  }
}
