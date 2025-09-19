import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { Post, CreatePostRequest, Like } from '../../models/post.model';
import { User } from '../../models/user.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="posts-container">
      <div class="posts-content">
        <div class="posts-header">
          <div class="header-left">
            <h1>Publicaciones</h1>
            <button class="nav-button" (click)="goToProfile()">
              <span class="nav-icon">👤</span>
              Mi Perfil
            </button>
          </div>
          <button class="create-post-btn" (click)="showCreatePost = !showCreatePost">
            {{ showCreatePost ? 'Cancelar' : 'Nueva Publicación' }}
          </button>
        </div>

        @if (showCreatePost) {
          <div class="create-post-section">
            <h2>Crear Nueva Publicación</h2>
            <form [formGroup]="createPostForm" (ngSubmit)="onCreatePost()">
              <div class="form-group">
                <label for="message">Mensaje</label>
                <textarea 
                  id="message"
                  formControlName="message"
                  placeholder="¿Qué estás pensando?"
                  rows="4"
                ></textarea>
                @if (createPostForm.get('message')?.invalid && createPostForm.get('message')?.touched) {
                  <div class="error-message">
                    El mensaje es requerido
                  </div>
                }
              </div>
              
              <div class="form-actions">
                <button 
                  type="submit" 
                  class="submit-btn"
                  [disabled]="createPostForm.invalid || isCreatingPost()"
                >
                  @if (isCreatingPost()) {
                    <span class="loading">Publicando...</span>
                  } @else {
                    <span>Publicar</span>
                  }
                </button>
              </div>
            </form>
          </div>
        }

        <div class="posts-section">
          <h2>Feed de Publicaciones</h2>
          
          @if (isLoadingPosts()) {
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p>Cargando publicaciones...</p>
            </div>
          } @else if (posts().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">📝</div>
              <h3>No hay publicaciones aún</h3>
              <p>Sé el primero en compartir algo con la comunidad</p>
            </div>
          } @else {
            <div class="posts-list">
              @for (post of posts(); track post.id) {
                <div class="post-card">
                  <div class="post-header">
                    <div class="post-author">
                      <div class="author-avatar">
                        {{ getAuthorInitials(post.authorAlias) }}
                      </div>
                      <div class="author-info">
                        <span class="author-name">{{ '@' + post.authorAlias }}</span>
                        <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="post-content">
                    <p>{{ post.message }}</p>
                  </div>
                  
                  <div class="post-actions">
                    <button 
                      class="like-button"
                      [class.liked]="hasUserLiked(post.id)"
                      (click)="toggleLike(post.id)"
                      [disabled]="isLikingPost()"
                    >
                      <span class="like-icon">{{ hasUserLiked(post.id) ? '❤️' : '🤍' }}</span>
                      <span class="like-count">{{ getLikesCount(post) }}</span>
                    </button>
                    
                    @if (isAdmin()) {
                      <button 
                        class="delete-button"
                        (click)="deletePost(post.id)"
                        [disabled]="isDeletingPost()"
                        title="Eliminar publicación (Solo Admin)"
                      >
                        <span class="delete-icon">🗑️</span>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .posts-container {
      min-height: 100vh;
      background: #f5f7fa;
    }

    .posts-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .posts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .nav-button {
      background: #3498db;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-button:hover {
      background: #2980b9;
      transform: translateY(-2px);
    }

    .nav-icon {
      font-size: 1rem;
    }

    .posts-header h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 2rem;
      font-weight: 600;
    }

    .create-post-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .create-post-btn:hover {
      background: #2980b9;
      transform: translateY(-2px);
    }

    .create-post-section {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
    }

    .create-post-section h2 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 1.5rem;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #34495e;
      font-weight: 500;
    }

    .form-group textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e8ed;
      border-radius: 8px;
      font-size: 1rem;
      font-family: inherit;
      resize: vertical;
      transition: border-color 0.3s ease;
    }

    .form-group textarea:focus {
      outline: none;
      border-color: #3498db;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 5px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }

    .submit-btn {
      background: #27ae60;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .submit-btn:hover:not(:disabled) {
      background: #229954;
      transform: translateY(-2px);
    }

    .submit-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
      transform: none;
    }

    .loading {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .posts-section {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .posts-section h2 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 1.5rem;
    }

    .loading-state {
      text-align: center;
      padding: 40px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #7f8c8d;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      margin: 0 0 10px 0;
      color: #34495e;
      font-size: 1.5rem;
    }

    .empty-state p {
      margin: 0;
      font-size: 1.1rem;
    }

    .posts-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .post-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .post-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .post-header {
      margin-bottom: 15px;
    }

    .post-author {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .author-avatar {
      width: 40px;
      height: 40px;
      background: #3498db;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .author-info {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-weight: 600;
      color: #2c3e50;
      font-size: 1rem;
    }

    .post-date {
      color: #7f8c8d;
      font-size: 0.875rem;
    }

    .post-content {
      margin-bottom: 15px;
    }

    .post-content p {
      margin: 0;
      color: #34495e;
      line-height: 1.6;
      font-size: 1rem;
    }

    .post-actions {
      display: flex;
      justify-content: flex-end;
    }

    .like-button {
      background: none;
      border: 2px solid #e1e8ed;
      border-radius: 20px;
      padding: 8px 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .like-button:hover:not(:disabled) {
      border-color: #e74c3c;
      background: #fdf2f2;
    }

    .like-button.liked {
      border-color: #e74c3c;
      background: #fdf2f2;
    }

    .like-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .like-icon {
      font-size: 1.2rem;
    }

    .like-count {
      font-weight: 500;
      color: #2c3e50;
    }

    .delete-button {
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      margin-left: 10px;
    }

    .delete-button:hover {
      background: #c0392b;
      transform: translateY(-2px);
    }

    .delete-button:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
      transform: none;
    }

    .delete-icon {
      font-size: 1rem;
    }
  `]
})
export class PostsComponent implements OnInit {
  createPostForm: FormGroup;
  showCreatePost = false;
  
  // Signals
  posts = signal<Post[]>([]);
  likes = signal<Like[]>([]);
  userLikes = signal<Map<number, boolean>>(new Map());
  isLoadingPosts = signal(false);
  isCreatingPost = signal(false);
  isLikingPost = signal(false);
  isDeletingPost = signal(false);
  
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private postService: PostService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.createPostForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    // Suscribirse al currentUser observable para recibir actualizaciones
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('🔄 PostsComponent - currentUser updated:', user);
      
      // Solo cargar posts y likes si hay un usuario autenticado
      if (user) {
        this.loadPosts();
        this.loadAllLikes();
      }
    });
  }

  loadAllLikes(): void {
    this.postService.getAllLikes().subscribe({
      next: (likes: Like[]) => {
        this.likes.set(likes);
      },
      error: (error: any) => {
        console.error('Error loading all likes:', error);
      }
    });
  }

  onCreatePost(): void {
    console.log('🔍 onCreatePost called');
    console.log('🔍 createPostForm.valid:', this.createPostForm.valid);
    console.log('🔍 currentUser:', this.currentUser);
    console.log('🔍 form value:', this.createPostForm.value);
    
    if (this.createPostForm.valid && this.currentUser) {
      console.log('✅ Proceeding with post creation');
      this.isCreatingPost.set(true);
      
      const postData: CreatePostRequest = {
        authorId: this.currentUser.id, // Usar el ID del usuario actual
        message: this.createPostForm.get('message')?.value
      };

      this.postService.createPost(postData).subscribe({
        next: (newPost) => {
          this.posts.update(posts => [newPost, ...posts]);
          this.createPostForm.reset();
          this.showCreatePost = false;
          this.isCreatingPost.set(false);
        },
        error: (error) => {
          console.error('Error creating post:', error);
          this.isCreatingPost.set(false);
          
          let errorMsg = 'Error al crear la publicación';
          if (error?.error?.message) {
            errorMsg = error.error.message;
          } else if (error?.message) {
            errorMsg = error.message;
          }
          
          this.notificationService.showError(errorMsg);
        }
      });
    }
  }

  loadPosts(): void {
    this.isLoadingPosts.set(true);
    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.loadUserLikes(); // Cargar estado de likes del usuario después de cargar posts
        this.isLoadingPosts.set(false);
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.isLoadingPosts.set(false);
        
        let errorMsg = 'Error al cargar las publicaciones';
        if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (error?.message) {
          errorMsg = error.message;
        }
        
        this.notificationService.showError(errorMsg);
      }
    });
  }

  loadLikes(): void {
    this.postService.getAllLikes().subscribe({
      next: (likes: Like[]) => {
        this.likes.set(likes);
      },
      error: (error: any) => {
        console.error('Error loading likes:', error);
      }
    });
  }

  loadUserLikes(): void {
    const posts = this.posts();
    const newUserLikes = new Map<number, boolean>();
    
    // Inicializar con valores por defecto
    posts.forEach(post => {
      newUserLikes.set(post.id, false);
    });
    
    // Cargar likes para cada post y verificar si el usuario actual ha dado like
    posts.forEach(post => {
      this.postService.getLikes(post.id).subscribe({
        next: (likes: Like[]) => {
          // Verificar si el usuario actual ha dado like
          const hasLiked = likes.some(like => like.userId === this.currentUser?.id);
          newUserLikes.set(post.id, hasLiked);
          this.userLikes.set(new Map(newUserLikes));
        },
        error: (error: any) => {
          console.error(`Error loading likes for post ${post.id}:`, error);
          newUserLikes.set(post.id, false);
          this.userLikes.set(new Map(newUserLikes));
        }
      });
    });
  }

  toggleLike(postId: number): void {
    console.log('🔍 toggleLike called for postId:', postId);
    console.log('🔍 currentUser:', this.currentUser);
    console.log('🔍 isLikingPost:', this.isLikingPost());
    
    if (!this.currentUser || this.isLikingPost()) {
      console.log('❌ Early return: no user or already liking');
      return;
    }

    console.log('✅ Proceeding with like/unlike');
    this.isLikingPost.set(true);
    
    if (this.hasUserLiked(postId)) {
      // Unlike the post
      this.postService.unlikePost(postId, this.currentUser.id).subscribe({
        next: () => {
          this.isLikingPost.set(false);
          this.notificationService.showSuccess('Like removido');
          this.userLikes.update(likes => {
            const newLikes = new Map(likes);
            newLikes.set(postId, false);
            return newLikes;
          });
          this.loadUserLikes(); // Recargar estado de likes del usuario
        },
        error: (error) => {
          this.isLikingPost.set(false);
          this.notificationService.showError('Error al quitar like');
          console.error('Error unliking post:', error);
        }
      });
    } else {
      // Like the post
      const likeData = { userId: this.currentUser.id };
      this.postService.addLike(postId, likeData).subscribe({
        next: (newLike) => {
          this.isLikingPost.set(false);
          this.notificationService.showSuccess('¡Post liked!');
          // Actualizar estado local inmediatamente
          this.userLikes.update(likes => {
            const newLikes = new Map(likes);
            newLikes.set(postId, true);
            return newLikes;
          });
          this.loadUserLikes(); // Recargar estado de likes del usuario
        },
        error: (error) => {
          console.error('Error adding like:', error);
          this.isLikingPost.set(false);
          
          let errorMsg = 'Error al dar like';
          if (error?.error?.message) {
            errorMsg = error.error.message;
          } else if (error?.message) {
            errorMsg = error.message;
          }
          
          // Si el error es porque ya dio like, actualizar la UI
          if (error.status === 400 && errorMsg.includes('ya dio')) {
            this.notificationService.showInfo('Ya diste like a esta publicación');
            this.userLikes.update(likes => {
              const newLikes = new Map(likes);
              newLikes.set(postId, true);
              return newLikes;
            });
            this.loadUserLikes(); // Recargar estado de likes del usuario
          } else {
            this.notificationService.showError(errorMsg);
          }
        }
      });
    }
  }

  hasUserLiked(postId: number): boolean {
    return this.userLikes().get(postId) || false;
  }

  getLikesCount(post: Post): number {
    return post.likesCount || 0;
  }

  getAuthorInitials(alias: string): string {
    return alias.charAt(0).toUpperCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isOwnPost(post: Post): boolean {
    return this.currentUser?.id === post.authorId;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  deletePost(postId: number): void {
    if (this.isDeletingPost()) return;
    
    // Solo los administradores pueden eliminar publicaciones
    if (!this.isAdmin()) {
      this.notificationService.showError('Solo los administradores pueden eliminar publicaciones');
      return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      this.isDeletingPost.set(true);

      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.isDeletingPost.set(false);
          this.notificationService.showSuccess('Publicación eliminada');
          this.loadPosts();
        },
        error: (error) => {
          this.isDeletingPost.set(false);
          this.notificationService.showError('Error al eliminar publicación');
          console.error('Error deleting post:', error);
        }
      });
    }
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}