import { Role } from '@prisma/client'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Auth types
export interface SignupRequest {
  name: string
  email: string
  password: string
  phone: string
  role: Role
  // Driver-specific (optional)
  vehicleType?: 'BIKE' | 'AUTO' | 'CAR'
  vehicleNumber?: string
  vehicleModel?: string
  licensePlate?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    phone: string
    role: Role
  }
}

export interface JWTPayload {
  userId: string
  email: string
  role: Role
}