export interface User {
  id: number;
  firstName: string;
  lastName: string;
  alias: string;
  email: string;
  role: string;
  dateOfBirth: string;
  createdAt: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  alias: string;
  dateOfBirth: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
}
