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
                <span class="error-message">
                  @if (registerForm.get('firstName')?.errors?.['required']) {
                    El nombre es requerido
                  } @else if (registerForm.get('firstName')?.errors?.['minlength']) {
                    El nombre debe tener al menos 2 caracteres
                  } @else if (registerForm.get('firstName')?.errors?.['maxlength']) {
                    El nombre no puede exceder 50 caracteres
                  } @else if (registerForm.get('firstName')?.errors?.['pattern']) {
                    El nombre solo puede contener letras y espacios
                  }
                </span>
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
                <span class="error-message">
                  @if (registerForm.get('lastName')?.errors?.['required']) {
                    El apellido es requerido
                  } @else if (registerForm.get('lastName')?.errors?.['minlength']) {
                    El apellido debe tener al menos 2 caracteres
                  } @else if (registerForm.get('lastName')?.errors?.['maxlength']) {
                    El apellido no puede exceder 50 caracteres
                  } @else if (registerForm.get('lastName')?.errors?.['pattern']) {
                    El apellido solo puede contener letras y espacios
                  }
                </span>
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
              <span class="error-message">
                @if (registerForm.get('alias')?.errors?.['required']) {
                  El alias es requerido
                } @else if (registerForm.get('alias')?.errors?.['minlength']) {
                  El alias debe tener al menos 3 caracteres
                } @else if (registerForm.get('alias')?.errors?.['maxlength']) {
                  El alias no puede exceder 20 caracteres
                } @else if (registerForm.get('alias')?.errors?.['pattern']) {
                  El alias solo puede contener letras, números y guiones bajos
                }
              </span>
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
              <span class="error-message">
                @if (registerForm.get('email')?.errors?.['required']) {
                  El correo electrónico es requerido
                } @else if (registerForm.get('email')?.errors?.['email']) {
                  Ingresa un correo electrónico válido
                } @else if (registerForm.get('email')?.errors?.['maxlength']) {
                  El correo no puede exceder 100 caracteres
                }
              </span>
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
              <span class="error-message">
                @if (registerForm.get('dateOfBirth')?.errors?.['required']) {
                  La fecha de nacimiento es requerida
                } @else if (registerForm.get('dateOfBirth')?.errors?.['tooYoung']) {
                  Debes tener al menos 13 años para registrarte
                } @else if (registerForm.get('dateOfBirth')?.errors?.['tooOld']) {
                  La fecha de nacimiento no es válida
                } @else if (registerForm.get('dateOfBirth')?.errors?.['ageInvalid']) {
                  La fecha de nacimiento no es válida
                }
              </span>
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
              <span class="error-message">
                @if (registerForm.get('password')?.errors?.['required']) {
                  La contraseña es requerida
                } @else if (registerForm.get('password')?.errors?.['minlength']) {
                  La contraseña debe tener al menos 8 caracteres
                } @else if (registerForm.get('password')?.errors?.['maxlength']) {
                  La contraseña no puede exceder 50 caracteres
                } @else if (registerForm.get('password')?.errors?.['weakPassword']) {
                  La contraseña debe contener al menos una mayúscula, una minúscula y un número
                }
              </span>
            }
            
            <!-- Indicador de fortaleza de contraseña -->
            @if (registerForm.get('password')?.value && registerForm.get('password')?.touched) {
              <div class="password-strength">
                <div class="strength-indicator">
                  <div class="strength-bar" [class]="getPasswordStrengthClass()"></div>
                </div>
                <span class="strength-text">{{ getPasswordStrengthText() }}</span>
              </div>
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
      position: relative;
      overflow: hidden;
    }

    .register-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.1;
    }

    .register-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      padding: 48px;
      width: 100%;
      max-width: 520px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
      animation: fadeIn 0.6s ease-out;
    }

    .register-title {
      text-align: center;
      color: var(--text-primary);
      margin-bottom: 40px;
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 14px;
      margin-bottom: 6px;
    }

    .form-input {
      padding: 16px 20px;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      font-size: 16px;
      transition: var(--transition);
      background: var(--bg-primary);
      font-weight: 500;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      transform: translateY(-1px);
    }

    .form-input.error {
      border-color: var(--danger-color);
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }

    .error-message {
      color: var(--danger-color);
      font-size: 13px;
      margin-top: 6px;
      font-weight: 500;
    }

    .password-strength {
      margin-top: 8px;
    }

    .strength-indicator {
      height: 4px;
      background: var(--bg-tertiary);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .strength-bar {
      height: 100%;
      transition: var(--transition);
      border-radius: 2px;
    }

    .strength-weak {
      width: 33%;
      background: var(--danger-color);
    }

    .strength-medium {
      width: 66%;
      background: var(--warning-color);
    }

    .strength-strong {
      width: 100%;
      background: var(--success-color);
    }

    .strength-text {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .error-alert {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      border: 1px solid #fca5a5;
      color: #dc2626;
      padding: 16px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error-alert::before {
      content: "⚠️";
      font-size: 16px;
    }

    .register-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 18px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 8px;
      position: relative;
      overflow: hidden;
    }

    .register-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .register-button:hover:not(:disabled)::before {
      left: 100%;
    }

    .register-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
    }

    .register-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .loading-spinner {
      width: 18px;
      height: 18px;
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
      margin-top: 32px;
      color: var(--text-secondary);
      font-size: 15px;
    }

    .login-link a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 600;
      transition: var(--transition);
    }

    .login-link a:hover {
      text-decoration: underline;
      color: var(--primary-hover);
    }

    @media (max-width: 640px) {
      .register-card {
        padding: 32px 24px;
        margin: 16px;
      }
      
      .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .register-title {
        font-size: 28px;
        margin-bottom: 32px;
      }
    }

    @media (max-width: 480px) {
      .register-container {
        padding: 16px;
      }
      
      .register-card {
        padding: 24px 20px;
      }
      
      .register-title {
        font-size: 24px;
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
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      alias: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]],
      dateOfBirth: ['', [
        Validators.required,
        this.ageValidator
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
        this.passwordStrengthValidator
      ]]
    });
  }

  // Validador personalizado para edad (mínimo 13 años)
  ageValidator(control: any) {
    if (!control.value) return null;
    
    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return { ageInvalid: true };
    }
    
    if (age < 13) {
      return { tooYoung: true };
    }
    
    if (age > 120) {
      return { tooOld: true };
    }
    
    return null;
  }

  // Validador personalizado para fortaleza de contraseña
  passwordStrengthValidator(control: any) {
    if (!control.value) return null;
    
    const password = control.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return { weakPassword: true };
    }
    
    return null;
  }

  getPasswordStrengthClass(): string {
    const password = this.registerForm.get('password')?.value || '';
    const strength = this.calculatePasswordStrength(password);
    
    switch (strength) {
      case 'weak': return 'strength-weak';
      case 'medium': return 'strength-medium';
      case 'strong': return 'strength-strong';
      default: return 'strength-weak';
    }
  }

  getPasswordStrengthText(): string {
    const password = this.registerForm.get('password')?.value || '';
    const strength = this.calculatePasswordStrength(password);
    
    switch (strength) {
      case 'weak': return 'Contraseña débil';
      case 'medium': return 'Contraseña media';
      case 'strong': return 'Contraseña fuerte';
      default: return '';
    }
  }

  calculatePasswordStrength(password: string): string {
    if (password.length < 6) return 'weak';
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    if (score < 3) return 'weak';
    if (score < 4) return 'medium';
    return 'strong';
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
