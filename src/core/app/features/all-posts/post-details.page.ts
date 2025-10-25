import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

import { PostSrvc, Post } from '../../../services/network/post.service';
import { DishSrvc } from '../../../services/network/dish.service';

type DishLite = { id: number; name: string; description?: string };

@Component({
  selector: 'rcps-post-details-page',
  standalone: true,
  templateUrl: 'post-details.page.html',
  imports: [CommonModule, MatIconModule],
})
export class PostDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postApi = inject(PostSrvc);
  private readonly dishApi = inject(DishSrvc);

  post: Post | null = null;
  relatedDish: DishLite | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.onBack(); return; }

    // попробуем из сигнала; если нет — дотянем по id
    const cached = this.postApi.posts().find(p => p.id === id) || null;
    if (cached) {
      this.post = cached;
      this.loadDishIfAny(cached.dishId);
    } else {
      this.postApi.getPostById(id).subscribe({
        next: (p) => { this.post = p; this.loadDishIfAny(p?.dishId); },
        error: () => this.onBack(),
      });
    }
  }

  private loadDishIfAny(dishId?: number) {
    if (!dishId) return;
    this.dishApi.getById(dishId).subscribe({
      next: (d: any) => this.relatedDish = d ? { id: d.id, name: d.name, description: d.description } : null,
      error: () => this.relatedDish = null,
    });
  }

  isVideo(url?: string): boolean {
    if (!url) return false;
    return /\.(mp4|webm)(\?.*)?$/i.test(url);
  }
  onLike(delta = +1): void {
    if (!this.post) return;
    const oldLikes = this.post.likes ?? 0;
    const oldDis   = this.post.dislikes ?? 0;

    this.post.likes = oldLikes + delta;
    this.postApi.changeLikes(this.post.id, delta).subscribe({
      next: (r) => {
        if (r.likes != null)    this.post!.likes = r.likes;
        if (r.dislikes != null) this.post!.dislikes = r.dislikes;
      },
      error: () => { this.post!.likes = oldLikes; this.post!.dislikes = oldDis; },
    });
  }

  onDislike(delta = +1): void {
    if (!this.post) return;
    const oldLikes = this.post.likes ?? 0;
    const oldDis   = this.post.dislikes ?? 0;

    this.post.dislikes = oldDis + delta;
    this.postApi.changeDislikes(this.post.id, delta).subscribe({
      next: (r) => {
        if (r.likes != null)    this.post!.likes = r.likes;
        if (r.dislikes != null) this.post!.dislikes = r.dislikes;
      },
      error: () => { this.post!.likes = oldLikes; this.post!.dislikes = oldDis; },
    });
  }
  onBack(): void {
    this.router.navigate(['/posts']);
  }

  onSelectDish(dish: DishLite): void {
    if (!dish?.id) return;
    this.router.navigate(['/dishes', dish.id]);
  }
}
