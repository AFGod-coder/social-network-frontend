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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .profile-header {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 40px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 30px;
    }

    .profile-avatar {
      flex-shrink: 0;
    }

    .avatar-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 48px;
      font-weight: bold;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .profile-info {
      flex: 1;
    }

    .profile-name {
      font-size: 32px;
      font-weight: 700;
      color: #333;
      margin: 0 0 8px 0;
    }

    .profile-alias {
      font-size: 18px;
      color: #667eea;
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    .profile-email {
      font-size: 16px;
      color: #666;
      margin: 0;
    }

    .profile-actions {
      flex-shrink: 0;
    }

    .action-button {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-button:hover {
      background: #c0392b;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(231, 76, 60, 0.3);
    }

    .action-button.primary {
      background: #3498db;
    }

    .action-button.primary:hover {
      background: #2980b9;
      box-shadow: 0 8px 20px rgba(52, 152, 219, 0.3);
    }

    .profile-details {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 40px;
      margin-bottom: 20px;
    }

    .detail-card h3 {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0 0 30px 0;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }

    .detail-label {
      font-size: 14px;
      font-weight: 500;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .navigation-actions {
      display: flex;
      gap: 20px;
      justify-content: center;
    }

    .nav-button {
      padding: 16px 32px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: white;
    }

    .nav-button.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .nav-button.secondary {
      background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    }

    .nav-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    }

    .button-icon {
      font-size: 18px;
    }

    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 20px;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }

      .navigation-actions {
        flex-direction: column;
        align-items: center;
      }

      .nav-button {
        width: 100%;
        max-width: 300px;
        justify-content: center;
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
