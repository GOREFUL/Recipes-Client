// src/core/app/shared/add-post-dialog/add-post.dialog.ts
/*
 * Dialog: Add Post
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { DishSrvc, MyDish } from '../../../services/network/dish.service';
import { PostDto } from '../../../services/network/post.service';

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
  private dialogRef = inject(MatDialogRef<AddPostDialog, PostDto | undefined>);
  private fb = inject(FormBuilder);
  private dishApi = inject(DishSrvc);

  dishes: { id: number; name: string }[] = [];

  formGroup = this.fb.group({
    dishId: ['', Validators.required],
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    mediaUrl: [
      '',
      [
        Validators.required,
        // любая http/https ссылка (и картинка, и видео)
        Validators.pattern(/^https?:\/\/\S+$/i),
      ],
    ],
  });

  get f() { return this.formGroup.controls; }

  ngOnInit(): void {
    // единичный запрос "мои блюда" для выпадающего списка
    this.dishApi.getMyOnce().subscribe({
      next: (list: MyDish[]) =>
        this.dishes = (list ?? []).map(d => ({ id: d.id, name: d.name })),
      error: () => this.dishes = [],
    });
  }

  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const v = this.formGroup.value;

    // Бэкенд ждёт именно такие поля:
    // { name, description, dishId, mediaUrl }
    const dto: PostDto = {
      name: v.title!,                           // title -> name
      description: v.description || '',
      dishId: Number(v.dishId),
      mediaUrl: v.mediaUrl!,                         // mediaUrl -> url
    };

    this.dialogRef.close(dto);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
