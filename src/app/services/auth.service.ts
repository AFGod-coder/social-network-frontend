import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError, catchError } from 'rxjs';
import { AuthRequest, AuthResponse, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8084/api/v1/bff/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          this.saveAuthData(response);
          this.isAuthenticatedSubject.next(true);
          this.loadUserProfile(response.userId);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          this.saveAuthData(response);
          this.isAuthenticatedSubject.next(true);
          this.loadUserProfile(response.userId);
        })
      );
  }

  logout(): void {
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private saveAuthData(response: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('userId', response.userId.toString());
      localStorage.setItem('authTimestamp', Date.now().toString());
    }
  }

  private clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('authTimestamp');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private checkAuthStatus(): void {
    if (typeof window !== 'undefined') {
      const token = this.getToken();
      const userId = localStorage.getItem('userId');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token && userId && refreshToken) {
        if (!this.isTokenExpired()) {
          // Token válido, cargar perfil
          this.isAuthenticatedSubject.next(true);
          this.loadUserProfile(parseInt(userId));
        } else if (!this.isRefreshTokenExpired()) {
          // Token expirado pero refresh token válido, intentar refrescar
          this.refreshToken().subscribe({
            next: () => {
              this.isAuthenticatedSubject.next(true);
              this.loadUserProfile(parseInt(userId));
            },
            error: () => {
              this.logout();
            }
          });
        } else {
          // Ambos tokens expirados, hacer logout
          this.logout();
        }
      } else {
        // No hay tokens, asegurar que el estado sea no autenticado
        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
      }
    }
  }

  private loadUserProfile(userId: number): void {
    this.http.get<User>(`${this.API_URL}/users/${userId}`)
      .subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          console.log('Perfil de usuario cargado:', user);
        },
        error: (error) => {
          console.error('Error cargando perfil de usuario:', error);
          // Solo hacer logout si es un error 401 (no autorizado)
          if (error.status === 401) {
            this.logout();
          }
        }
      });
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.saveAuthData(response);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      // Agregar un margen de 10 minutos para evitar problemas de sincronización
      return payload.exp < (currentTime + 600);
    } catch {
      return true;
    }
  }

  isRefreshTokenExpired(): boolean {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) return true;

    try {
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}