import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedService } from '../../../services/network/feed.service';
import { Post } from '../../../models/entities/recipes-api/business/post.entity';

@Component({
  selector: 'app-post-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-feed.page.html'
})
export class PostFeedComponent implements OnInit {
  posts: Post[] = [];
  loading = false;
  sortMode: 'subscriptions' | 'recommendations' = 'recommendations';
  public loadingMore = false;

  constructor(private feedService: FeedService) {}

  ngOnInit() {
    this.loadInitialPosts();
  }

  loadInitialPosts() {
    this.loading = true;
    this.feedService.getPosts().subscribe(data => {
      this.posts = data;
      this.loading = false;
    });
  }

  toggleSort() {
    this.posts = [];
    this.loadInitialPosts();
  }

  likePost(post: Post) {
    post.likes++;
  }

  openComments(post: Post) {
    console.log('Open comments for post', post.id);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.loadingMore || this.loading) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= scrollHeight - 150) {
      this.loadMorePosts();
    }
  }

  loadMorePosts() {
    this.loadingMore = true;
    this.feedService.getPosts(3).subscribe(data => {
      this.posts.push(...data);
      this.loadingMore = false;
    });
  }
}
