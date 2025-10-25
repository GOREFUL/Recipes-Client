import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

import { Post } from '../../../models/entities/recipes-api/business/post.entity';
import { Dish } from '../../../models/entities/recipes-api/business/dish.entity';

import { PostSrvc } from '../../../services/network/post.service';
import { DishSrvc } from '../../../services/network/dish.service';

@Component({
  selector: 'rcps-post-details-page',
  standalone: true,
  templateUrl: 'post-details.page.html',
  imports: [CommonModule, MatIconModule],
})
export class PostDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postSrvc = inject(PostSrvc);
  private readonly dishSrvc = inject(DishSrvc);

  post: Post | null = null;
  relatedDish: Dish | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')!);
    this.post = this.postSrvc.posts()?.find((p) => p.id === id) || null;

    if (this.post) {
      this.relatedDish =
        this.dishSrvc.dishes()?.find((d) => d.id === this.post!.dishId) || null;
    }
  }

  onBack(): void {
    this.router.navigate(['/posts']);
  }

  onSelectDish(dish: Dish): void {
    this.router.navigate(['/dishes', dish.id]);
  }
}
