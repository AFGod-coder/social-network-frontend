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
            <h1>Feed de Publicaciones</h1>
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
              <div class="empty-icon">📱</div>
              <h3>Tu feed está vacío</h3>
              <p>No hay publicaciones de otros usuarios en este momento.</p>
              <p>¡Sé el primero en crear una publicación o invita a más amigos!</p>
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
      background: var(--bg-secondary);
      position: relative;
    }

    .posts-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 0;
    }

    .posts-content {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      position: relative;
      z-index: 1;
    }

    .posts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 32px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      box-shadow: var(--shadow-xl);
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: fadeIn 0.6s ease-out;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .nav-button {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 20px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: var(--shadow-md);
    }

    .nav-button:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .nav-icon {
      font-size: 1rem;
    }

    .posts-header h1 {
      margin: 0;
      color: var(--text-primary);
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .create-post-btn {
      background: linear-gradient(135deg, var(--success-color) 0%, var(--success-hover) 100%);
      color: white;
      border: none;
      padding: 16px 28px;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      box-shadow: var(--shadow-md);
      position: relative;
      overflow: hidden;
    }

    .create-post-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .create-post-btn:hover::before {
      left: 100%;
    }

    .create-post-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .create-post-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      padding: 40px;
      border-radius: 20px;
      box-shadow: var(--shadow-xl);
      margin-bottom: 32px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: slideIn 0.4s ease-out;
    }

    .create-post-section h2 {
      margin: 0 0 24px 0;
      color: var(--text-primary);
      font-size: 1.75rem;
      font-weight: 700;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .form-group textarea {
      width: 100%;
      padding: 16px 20px;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      font-size: 1rem;
      font-family: inherit;
      resize: vertical;
      transition: var(--transition);
      background: var(--bg-primary);
      font-weight: 500;
      min-height: 120px;
    }

    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      transform: translateY(-1px);
    }

    .error-message {
      color: var(--danger-color);
      font-size: 0.875rem;
      margin-top: 6px;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }

    .submit-btn {
      background: linear-gradient(135deg, var(--success-color) 0%, var(--success-hover) 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      box-shadow: var(--shadow-md);
      position: relative;
      overflow: hidden;
    }

    .submit-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .submit-btn:hover:not(:disabled)::before {
      left: 100%;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .submit-btn:disabled {
      background: var(--secondary-color);
      cursor: not-allowed;
      transform: none;
      opacity: 0.6;
    }

    .loading {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .posts-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      padding: 40px;
      border-radius: 20px;
      box-shadow: var(--shadow-xl);
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: fadeIn 0.6s ease-out;
    }

    .posts-section h2 {
      margin: 0 0 24px 0;
      color: var(--text-primary);
      font-size: 1.75rem;
      font-weight: 700;
    }

    .loading-state {
      text-align: center;
      padding: 60px;
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--bg-tertiary);
      border-top: 4px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 24px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: var(--text-secondary);
    }

    .empty-icon {
      font-size: 5rem;
      margin-bottom: 24px;
      opacity: 0.7;
    }

    .empty-state h3 {
      margin: 0 0 12px 0;
      color: var(--text-primary);
      font-size: 1.75rem;
      font-weight: 600;
    }

    .empty-state p {
      margin: 0;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .posts-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .post-card {
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid var(--border-color);
      transition: var(--transition);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
    }

    .post-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
      opacity: 0;
      transition: var(--transition);
    }

    .post-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .post-card:hover::before {
      opacity: 1;
    }

    .post-header {
      margin-bottom: 16px;
    }

    .post-author {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .author-avatar {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      box-shadow: var(--shadow-md);
    }

    .author-info {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 1.1rem;
    }

    .post-date {
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .post-content {
      margin-bottom: 20px;
    }

    .post-content p {
      margin: 0;
      color: var(--text-primary);
      line-height: 1.7;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .post-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
    }

    .like-button {
      background: var(--bg-primary);
      border: 2px solid var(--border-color);
      border-radius: 24px;
      padding: 12px 20px;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      position: relative;
      overflow: hidden;
    }

    .like-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.1), transparent);
      transition: left 0.5s;
    }

    .like-button:hover:not(:disabled)::before {
      left: 100%;
    }

    .like-button:hover:not(:disabled) {
      border-color: var(--danger-color);
      background: rgba(239, 68, 68, 0.05);
      transform: translateY(-1px);
    }

    .like-button.liked {
      border-color: var(--danger-color);
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger-color);
    }

    .like-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .like-icon {
      font-size: 1.3rem;
    }

    .like-count {
      font-weight: 600;
      color: var(--text-primary);
    }

    .delete-button {
      background: var(--danger-color);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 16px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: var(--transition);
      box-shadow: var(--shadow-sm);
    }

    .delete-button:hover:not(:disabled) {
      background: var(--danger-hover);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .delete-button:disabled {
      background: var(--secondary-color);
      cursor: not-allowed;
      transform: none;
    }

    .delete-icon {
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .posts-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }
      
      .header-left {
        flex-direction: column;
        gap: 16px;
      }
      
      .posts-header h1 {
        font-size: 2rem;
      }
      
      .create-post-section,
      .posts-section {
        padding: 24px;
      }
      
      .post-card {
        padding: 20px;
      }
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
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      if (user) {
        this.loadPosts();
        this.loadAllLikes();
      } else {
        this.posts.set([]);
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
    if (this.createPostForm.valid && this.currentUser) {
      this.isCreatingPost.set(true);
      
      const postData: CreatePostRequest = {
        authorId: this.currentUser.id,
        message: this.createPostForm.get('message')?.value
      };

      this.postService.createPost(postData).subscribe({
        next: (newPost) => {
          this.createPostForm.reset();
          this.showCreatePost = false;
          this.isCreatingPost.set(false);
          this.notificationService.showSuccess('¡Publicación creada exitosamente!');
        },
        error: (error) => {
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
    if (!this.currentUser) {
      return;
    }

    this.isLoadingPosts.set(true);
    
    this.postService.getFeed(this.currentUser.id).subscribe({
      next: (posts) => {
        this.posts.set(posts);
        
        if (posts.length > 0 && posts[0].hasUserLiked !== undefined) {
          this.isLoadingPosts.set(false);
        } else {
          this.loadUserLikes();
          this.isLoadingPosts.set(false);
        }
      },
      error: (error) => {
        this.isLoadingPosts.set(false);
        
        let errorMsg = 'Error al cargar el feed de publicaciones';
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
    if (!this.currentUser || this.isLikingPost()) {
      return;
    }

    this.isLikingPost.set(true);
    
    if (this.hasUserLiked(postId)) {
      // Unlike the post
      this.postService.unlikePost(postId, this.currentUser.id).subscribe({
        next: () => {
          this.isLikingPost.set(false);
          this.notificationService.showSuccess('Like removido');
          
          this.posts.update(posts => 
            posts.map(post => 
              post.id === postId 
                ? { ...post, likesCount: Math.max(0, post.likesCount - 1), hasUserLiked: false }
                : post
            )
          );
          this.userLikes.update(likes => {
            const newLikes = new Map(likes);
            newLikes.set(postId, false);
            return newLikes;
          });
        },
        error: (error) => {
          this.isLikingPost.set(false);
          this.notificationService.showError('Error al quitar like');
        }
      });
    } else {
      // Like the post
      const likeData = { userId: this.currentUser.id };
      this.postService.addLike(postId, likeData).subscribe({
        next: (newLike) => {
          this.isLikingPost.set(false);
          this.notificationService.showSuccess('¡Post liked!');
          
          // ✅ Optimización: Actualizar el post directamente en lugar de recargar todo
          this.posts.update(posts => 
            posts.map(post => 
              post.id === postId 
                ? { ...post, likesCount: post.likesCount + 1, hasUserLiked: true }
                : post
            )
          );
          
          // Actualizar estado local como fallback
          this.userLikes.update(likes => {
            const newLikes = new Map(likes);
            newLikes.set(postId, true);
            return newLikes;
          });
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
    // ✅ Optimización: Primero verificar si el post ya tiene esta información
    const post = this.posts().find(p => p.id === postId);
    if (post && post.hasUserLiked !== undefined) {
      return post.hasUserLiked;
    }
    
    // Fallback: usar el estado local si el backend no incluye esta información
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