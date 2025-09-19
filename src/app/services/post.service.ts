import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { Post, CreatePostRequest, Like, CreateLikeRequest } from '../models/post.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly API_URL = 'http://localhost:8084/api/v1/bff';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/posts`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  getFeed(userId: number): Observable<Post[]> {
    console.log('🚀 PostService.getFeed called with userId:', userId);
    console.log('🚀 API_URL:', this.API_URL);
    console.log('🚀 Headers:', this.getHeaders());
    
    return this.http.get<Post[]>(`${this.API_URL}/feed?userId=${userId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('❌ Error in getFeed:', error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.API_URL}/posts/${id}`, {
      headers: this.getHeaders()
    });
  }

  createPost(postData: CreatePostRequest): Observable<Post> {
    console.log('🚀 PostService.createPost called with:', postData);
    console.log('🚀 API_URL:', this.API_URL);
    console.log('🚀 Headers:', this.getHeaders());
    
    return this.http.post<Post>(`${this.API_URL}/posts`, postData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('❌ Error in createPost:', error);
        return this.errorHandler.handleError(error);
      })
    );
  }


  getLikes(postId: number): Observable<Like[]> {
    return this.http.get<Like[]>(`${this.API_URL}/posts/${postId}/likes`, {
      headers: this.getHeaders()
    });
  }

  getUserLike(postId: number, userId: number): Observable<Like | null> {
    console.log('🚀 PostService.getUserLike called with:', { postId, userId });
    
    return this.getLikes(postId).pipe(
      map((likes: Like[]) => {
        const userLike = likes.find((like: Like) => like.userId === userId);
        console.log('🔍 User like found:', userLike);
        return userLike || null;
      }),
      catchError(error => {
        console.error('❌ Error in getUserLike:', error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  getAllLikes(): Observable<Like[]> {
    // Since there's no endpoint for all likes, we'll return an empty array
    // In a real implementation, you might want to create this endpoint
    return new Observable<Like[]>(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  unlikePost(postId: number, userId: number): Observable<void> {
    console.log('🚀 PostService.unlikePost called with:', { postId, userId });
    
    // Primero obtener el like del usuario para ese post
    return this.getLikes(postId).pipe(
      switchMap(likes => {
        const userLike = likes.find(like => like.userId === userId);
        if (userLike) {
          console.log('✅ Found user like, removing with likeId:', userLike.id);
          return this.removeLike(postId, userLike.id);
        } else {
          console.log('❌ User like not found for post:', postId, 'user:', userId);
          return throwError(() => new Error('Like no encontrado'));
        }
      }),
      catchError(error => {
        console.error('❌ Error in unlikePost:', error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Método optimizado para unlike directo si ya tenemos el likeId
  unlikePostDirect(postId: number, likeId: number): Observable<void> {
    console.log('🚀 PostService.unlikePostDirect called with:', { postId, likeId });
    
    return this.removeLike(postId, likeId);
  }

  deletePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/posts/${postId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  getLikesCount(postId: number): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/posts/${postId}/likes/count`, {
      headers: this.getHeaders()
    });
  }

  addLike(postId: number, likeData: CreateLikeRequest): Observable<Like> {
    console.log('🚀 PostService.addLike called with:', { postId, likeData });
    console.log('🚀 API_URL:', this.API_URL);
    console.log('🚀 Headers:', this.getHeaders());
    
    return this.http.post<Like>(`${this.API_URL}/posts/${postId}/likes`, likeData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('❌ Error in addLike:', error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  removeLike(postId: number, likeId: number): Observable<void> {
    console.log('🚀 PostService.removeLike called with:', { postId, likeId });
    console.log('🚀 API_URL:', this.API_URL);
    console.log('🚀 Headers:', this.getHeaders());
    
    return this.http.delete<void>(`${this.API_URL}/posts/${postId}/likes/${likeId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('❌ Error in removeLike:', error);
        return this.errorHandler.handleError(error);
      })
    );
  }
}
