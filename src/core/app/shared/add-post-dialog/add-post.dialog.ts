import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Post } from '../../../models/entities/recipes-api/social/post.entity';
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
  ],
})
export class AddPostDialog {
  private readonly _dialogRef = inject(MatDialogRef<AddPostDialog>);
  private readonly _fb = inject(FormBuilder);

  // настройки валидации видео
  readonly allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  readonly maxSizeMB = 100; // можно поменять
  videoError: string | null = null;
  previewUrl: string | null = null;
  isHovering = false;

  formGroup = this._fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    video: [null as File | null],
  });

  get f() { return this.formGroup.controls; }

  onDragOver(e: DragEvent) { e.preventDefault(); this.isHovering = true; }
  onDragLeave(e: DragEvent) { e.preventDefault(); this.isHovering = false; }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isHovering = false;
    if (!e.dataTransfer?.files?.length) return;
    this.setVideo(e.dataTransfer.files[0]);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setVideo(file);
  }

  private setVideo(file: File) {
    this.videoError = null;
    // type check
    if (!this.allowedTypes.includes(file.type)) {
      this.videoError = 'Unsupported format. Use MP4 / WebM / Ogg.';
      this.formGroup.patchValue({ video: null });
      this.revokePreview();
      return;
    }
    // size check
    if (file.size > this.maxSizeMB * 1024 * 1024) {
      this.videoError = `File is too big. Max ${this.maxSizeMB}MB.`;
      this.formGroup.patchValue({ video: null });
      this.revokePreview();
      return;
    }
    this.formGroup.patchValue({ video: file });
    this.makePreview(file);
  }

  clearVideo() {
    this.formGroup.patchValue({ video: null });
    this.revokePreview();
    this.videoError = null;
  }

  private makePreview(file: File) {
    this.revokePreview();
    this.previewUrl = URL.createObjectURL(file);
  }
  private revokePreview() {
    if (this.previewUrl) { URL.revokeObjectURL(this.previewUrl); this.previewUrl = null; }
  }

  fileSize(bytes: number): string {
    const kb = bytes / 1024, mb = kb / 1024;
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.ceil(kb)} KB`;
  }

  onSubmit(): void {
    if (this.formGroup.invalid || this.videoError) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const { name, description, video } = this.formGroup.value;
    const post: Post = ModelFactory.createPost(
      name!, description || '', ModelFactory.createMediaUnit(video!)
    );
    this._dialogRef.close(post);

    // Если понадобиться отправлять на бэкенд как FormData:
    // const fd = new FormData();
    // fd.append('name', name!);
    // fd.append('description', description || '');
    // if (video) fd.append('video', video);
  }

  onClose(): void { this._dialogRef.close(); }
}
