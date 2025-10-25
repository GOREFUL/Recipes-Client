/*
 * File        : add-post.dialog.ts
 * Description : Dialog for creating a new post (uses ModelFactory).
 * Author      : Kuts Vladyslav Ivanovich
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { Post } from '../../../models/entities/recipes-api/business/post.entity';
import { ModelFactory } from '../../../factories/model.factory';

@Component({
  selector: 'rcps-add-post-dialog',
  standalone: true,
  templateUrl: 'add-post.dialog.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
  ],
})
export class AddPostDialog implements OnInit {
  private readonly _dialogRef = inject(MatDialogRef<AddPostDialog>);
  private readonly _fb = inject(FormBuilder);

  // Бэк сюда кидаь
  dishes: { id: number; name: string }[] = [];

  formGroup = this._fb.group({
    dishId: ['', Validators.required], 
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    mediaUrl: [
      '',
      [Validators.required, Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)],
    ],
  });

  get f() {
    return this.formGroup.controls;
  }

  ngOnInit(): void {
    // TODO: load dishes from backend
  }

  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const { title, description, mediaUrl, dishId } = this.formGroup.value;

    const post: Post = ModelFactory.createPost(
      0,
      mediaUrl!,
      description || '',
      title!,
      Number(dishId)
    );

    this._dialogRef.close(post);
  }

  onClose(): void {
    this._dialogRef.close();
  }
}
