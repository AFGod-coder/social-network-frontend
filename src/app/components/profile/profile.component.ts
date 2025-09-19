import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <div class="profile-avatar">
          <div class="avatar-circle">
            {{ getInitials() }}
          </div>
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ user()?.firstName }} {{ user()?.lastName }}</h1>
          <p class="profile-alias">{{ '@' + (user()?.alias || '') }}</p>
          <p class="profile-email">{{ user()?.email }}</p>
        </div>
        <div class="profile-actions">
          <button class="action-button primary" (click)="goToPosts()">
            <span class="button-icon">📝</span>
            Ver Publicaciones
          </button>
          <button class="action-button" (click)="logout()">
            <span class="button-icon">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div class="profile-details">
        <div class="detail-card">
          <h3>Información Personal</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Nombre completo:</span>
              <span class="detail-value">{{ user()?.firstName }} {{ user()?.lastName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Alias:</span>
              <span class="detail-value">{{ '@' + (user()?.alias || '') }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Correo electrónico:</span>
              <span class="detail-value">{{ user()?.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Fecha de nacimiento:</span>
              <span class="detail-value">{{ formatDate(user()?.dateOfBirth) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Rol:</span>
              <span class="detail-value">{{ user()?.role }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Miembro desde:</span>
              <span class="detail-value">{{ formatDate(user()?.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="navigation-actions">
        <button class="nav-button primary" routerLink="/posts">
          <span class="button-icon">📝</span>
          Ver Publicaciones
        </button>
        <button class="nav-button secondary" routerLink="/posts">
          <span class="button-icon">✏️</span>
          Crear Publicación
        </button>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      background: var(--bg-secondary);
      position: relative;
      padding: 20px;
    }

    .profile-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 300px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 0;
    }

    .profile-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      box-shadow: var(--shadow-xl);
      padding: 48px;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      gap: 40px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
      animation: fadeIn 0.6s ease-out;
    }

    .profile-avatar {
      flex-shrink: 0;
    }

    .avatar-circle {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 56px;
      font-weight: 700;
      box-shadow: var(--shadow-xl);
      position: relative;
      overflow: hidden;
    }

    .avatar-circle::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
      animation: shimmer 3s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }

    .profile-info {
      flex: 1;
    }

    .profile-name {
      font-size: 36px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 12px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .profile-alias {
      font-size: 20px;
      color: var(--primary-color);
      margin: 0 0 12px 0;
      font-weight: 600;
    }

    .profile-email {
      font-size: 18px;
      color: var(--text-secondary);
      margin: 0;
      font-weight: 500;
    }

    .profile-actions {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .action-button {
      background: var(--danger-color);
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: var(--shadow-md);
      position: relative;
      overflow: hidden;
    }

    .action-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .action-button:hover::before {
      left: 100%;
    }

    .action-button:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .action-button.primary {
      background: var(--primary-color);
    }

    .action-button.primary:hover {
      background: var(--primary-hover);
    }

    .profile-details {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      box-shadow: var(--shadow-xl);
      padding: 48px;
      margin-bottom: 32px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
      animation: fadeIn 0.8s ease-out;
    }

    .detail-card h3 {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 40px 0;
      text-align: center;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 24px;
      background: var(--bg-primary);
      border-radius: 16px;
      border-left: 4px solid var(--primary-color);
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
      position: relative;
      overflow: hidden;
    }

    .detail-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, var(--primary-color), var(--primary-hover));
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .detail-item:hover::before {
      transform: scaleX(1);
    }

    .detail-item:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .detail-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .navigation-actions {
      display: flex;
      gap: 24px;
      justify-content: center;
      position: relative;
      z-index: 1;
    }

    .nav-button {
      padding: 20px 40px;
      border: none;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: white;
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;
    }

    .nav-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .nav-button:hover::before {
      left: 100%;
    }

    .nav-button.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .nav-button.secondary {
      background: linear-gradient(135deg, var(--success-color) 0%, var(--success-hover) 100%);
    }

    .nav-button:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
    }

    .button-icon {
      font-size: 20px;
    }

    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 24px;
        padding: 32px;
      }

      .avatar-circle {
        width: 120px;
        height: 120px;
        font-size: 48px;
      }

      .profile-name {
        font-size: 28px;
      }

      .profile-details {
        padding: 32px;
      }

      .detail-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .navigation-actions {
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }

      .nav-button {
        width: 100%;
        max-width: 300px;
        justify-content: center;
        padding: 16px 32px;
      }
    }

    @media (max-width: 480px) {
      .profile-container {
        padding: 16px;
      }
      
      .profile-header,
      .profile-details {
        padding: 24px;
      }
      
      .profile-name {
        font-size: 24px;
      }
      
      .avatar-circle {
        width: 100px;
        height: 100px;
        font-size: 40px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user.set(user);
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  getInitials(): string {
    const user = this.user();
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  logout(): void {
    this.authService.logout();
    this.notificationService.showInfo('Sesión cerrada correctamente');
    this.router.navigate(['/login']);
  }

  goToPosts(): void {
    this.router.navigate(['/posts']);
  }

}
