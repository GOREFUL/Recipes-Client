export interface Post {
    id: number;
    type: 'image' | 'video';
    mediaUrl: string;
    title: string;
    likes: number;
    comments: number;
  }
  