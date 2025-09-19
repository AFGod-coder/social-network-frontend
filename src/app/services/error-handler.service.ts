import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface ErrorMessage {
  message: string;
  type: 'error' | 'warning' | 'info';
  details?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: ErrorMessage;

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = {
        message: 'Error de conexión',
        type: 'error',
        details: error.error.message
      };
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = {
            message: 'Solicitud inválida',
            type: 'error',
            details: error.error?.message || 'Los datos enviados no son válidos'
          };
          break;
        case 401:
          errorMessage = {
            message: 'No autorizado',
            type: 'error',
            details: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente'
          };
          break;
        case 403:
          errorMessage = {
            message: 'Acceso denegado',
            type: 'error',
            details: 'No tienes permisos para realizar esta acción'
          };
          break;
        case 404:
          errorMessage = {
            message: 'Recurso no encontrado',
            type: 'error',
            details: 'El recurso solicitado no existe'
          };
          break;
        case 409:
          errorMessage = {
            message: 'Conflicto',
            type: 'warning',
            details: error.error?.message || 'Ya existe un recurso con estos datos'
          };
          break;
        case 422:
          errorMessage = {
            message: 'Datos inválidos',
            type: 'error',
            details: error.error?.message || 'Los datos proporcionados no son válidos'
          };
          break;
        case 500:
          errorMessage = {
            message: 'Error del servidor',
            type: 'error',
            details: 'Ha ocurrido un error interno del servidor'
          };
          break;
        default:
          errorMessage = {
            message: 'Error inesperado',
            type: 'error',
            details: `Error ${error.status}: ${error.statusText}`
          };
      }
    }

    console.error('Error handled:', errorMessage);
    return throwError(() => errorMessage);
  }

  getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.details) {
      return error.details;
    }
    
    return 'Ha ocurrido un error inesperado';
  }
}
