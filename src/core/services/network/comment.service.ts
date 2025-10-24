import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';

import { Comment } from '../../models/entities/recipes-api/social/comment.entity';

import { environment } from '../../../environments/environment.dev';

@Injectable ({ providedIn: 'root' })
export class CommentSrvc
{
    private readonly _baseUrl: string = `${environment.apiUrl}/comments`;

    private readonly _httpClient: HttpClient = inject(HttpClient)

    private readonly _comments: WritableSignal<Comment[] | undefined> = signal(undefined)

    public get comments(): Signal<Comment[] | undefined>
    { return this._comments.asReadonly(); }

    /*
    * Add a new comment.
    */
    public add(postId: number, comment: Comment): void
    { this._httpClient.post<Comment>(`${this._baseUrl}/${postId}`, comment).subscribe(); }

    /*
    * Like a comment by ID.
    */
    public like(commentId: number): void
    { this._httpClient.post<void>(`${this._baseUrl}/${commentId}/like`, {}).subscribe(); }

    /*
    * Dislike a comment by ID.
    */
    public dislike(commentId: number): void
    { this._httpClient.post<void>(`${this._baseUrl}/${commentId}/dislike`, {}).subscribe(); }

    /*
    * Report a comment with a reason.
    */
    public report(commentId: number, report: { reason: string }): Observable<void>
    { return this._httpClient.post<void>(`${this._baseUrl}/${commentId}/report`, report); }

    /*
    * Load all comments (optional).
    */
    public getAll(postId: number): void
    {
      this._httpClient.get<Comment[]>(`${this._baseUrl}/${postId}`).subscribe
      ({
        next: (comments) => this._comments.set(comments)
      })
    }

}