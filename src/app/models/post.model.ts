export interface Post {
  id: number;
  authorId: number;
  message: string;
  authorAlias: string;
  createdAt: string;
  likesCount: number;
}

export interface CreatePostRequest {
  authorId: number;
  message: string;
}

export interface Like {
  id: number;
  userId: number;
  postId: number;
  createdAt: string;
}

export interface CreateLikeRequest {
  userId: number;
}
