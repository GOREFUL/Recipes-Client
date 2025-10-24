import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Post } from '../../models/entities/recipes-api/business/post.entity';


@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private mockCounter = 1;

  // Генерация постов для теста
  private generatePosts(count: number): Post[] {
    const posts: Post[] = [];

    const foodImages = [
        "https://images.unsplash.com/photo-1600891964599-f61ba0e24092", // пицца
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836", // бургеры
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836", // паста
        "https://images.unsplash.com/photo-1521305916504-4a1121188589", // суши
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd", // салат
        "https://images.unsplash.com/photo-1496412705862-e0088f16f791"  // десерт
      ];
    for (let i = 0; i < count; i++) {
      const id = this.mockCounter++;
      const isVideo = id % 2 === 0;
      posts.push({
        id,
        type: isVideo ? 'video' : 'image',
        mediaUrl: isVideo
          ? 'https://files.catbox.moe/asr9jr.mp4'
          : `${foodImages[id % foodImages.length]}?auto=format&fit=crop&w=800&h=600`,
        title: `Post #${id}`,
        likes: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 100)
      });
    }
    return posts;
  }

  // Получение запросов
  getPosts(count: number = 5): Observable<Post[]> {
    const data = this.generatePosts(count);
    return of(data).pipe(delay(500));
  }

  // Лайк на постик
  likePost(id: number): Observable<Post> {
    const post: Post = {
      id,
      type: Math.random() > 0.5 ? 'image' : 'video',
      mediaUrl: '',
      title: '',
      likes: Math.floor(Math.random() * 500) + 1,
      comments: Math.floor(Math.random() * 100)
    };
    return of(post).pipe(delay(100));
  }
}
