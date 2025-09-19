import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h1 class="register-title">Crear Cuenta</h1>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Nombre</label>
              <input 
                type="text" 
                id="firstName" 
                formControlName="firstName" 
                class="form-input"
                [class.error]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                placeholder="Tu nombre"
              >
              @if (registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched) {
                <span class="error-message">El nombre es requerido</span>
              }
            </div>

            <div class="form-group">
              <label for="lastName">Apellido</label>
              <input 
                type="text" 
                id="lastName" 
                formControlName="lastName" 
                class="form-input"
                [class.error]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                placeholder="Tu apellido"
              >
              @if (registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched) {
                <span class="error-message">El apellido es requerido</span>
              }
            </div>
          </div>

          <div class="form-group">
            <label for="alias">Alias</label>
            <input 
              type="text" 
              id="alias" 
              formControlName="alias" 
              class="form-input"
              [class.error]="registerForm.get('alias')?.invalid && registerForm.get('alias')?.touched"
              placeholder="tu_alias"
            >
            @if (registerForm.get('alias')?.invalid && registerForm.get('alias')?.touched) {
              <span class="error-message">El alias es requerido</span>
            }
          </div>

          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-input"
              [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              placeholder="tu@email.com"
            >
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <span class="error-message">El correo electrónico es requerido</span>
            }
          </div>

          <div class="form-group">
            <label for="dateOfBirth">Fecha de Nacimiento</label>
            <input 
              type="date" 
              id="dateOfBirth" 
              formControlName="dateOfBirth" 
              class="form-input"
              [class.error]="registerForm.get('dateOfBirth')?.invalid && registerForm.get('dateOfBirth')?.touched"
            >
            @if (registerForm.get('dateOfBirth')?.invalid && registerForm.get('dateOfBirth')?.touched) {
              <span class="error-message">La fecha de nacimiento es requerida</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              class="form-input"
              [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              placeholder="Mínimo 6 caracteres"
            >
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <span class="error-message">La contraseña debe tener al menos 6 caracteres</span>
            }
          </div>

          @if (errorMessage()) {
            <div class="error-alert">
              {{ errorMessage() }}
            </div>
          }

          <button 
            type="submit" 
            class="register-button"
            [disabled]="registerForm.invalid || isLoading()"
          >
            @if (isLoading()) {
              <span class="loading-spinner"></span>
              Creando cuenta...
            } @else {
              Crear Cuenta
            }
          </button>
        </form>

        <div class="login-link">
          <p>¿Ya tienes una cuenta? <a routerLink="/login">Inicia sesión aquí</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 500px;
    }

    .register-title {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
      font-size: 28px;
      font-weight: 600;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 500;
      color: #555;
      font-size: 14px;
    }

    .form-input {
      padding: 12px 16px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 4px;
    }

    .error-alert {
      background: #fee;
      border: 1px solid #fcc;
      color: #c33;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
    }

    .register-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 14px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .register-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .register-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .login-link {
      text-align: center;
      margin-top: 20px;
      color: #666;
    }

    .login-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .login-link a:hover {
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      alias: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const userData: RegisterRequest = this.registerForm.value;
      
      this.authService.register(userData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/posts']);
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Register error:', error);
          
          let errorMsg = 'Error al crear la cuenta. Por favor, verifica los datos e intenta nuevamente.';
          if (error?.error?.message) {
            errorMsg = error.error.message;
          } else if (error?.message) {
            errorMsg = error.message;
          }
          
          this.errorMessage.set(errorMsg);
        }
      });
    }
  }
}
