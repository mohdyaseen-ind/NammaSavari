import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/src/lib/prisma'
import { generateToken } from '@/src/lib/auth'
import { SignupRequest, ApiResponse, AuthResponse } from '@/src/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()
    
    // Validation
    const { name, email, password, phone, role, vehicleType, vehicleNumber, vehicleModel, licensePlate } = body
    
    if (!name || !email || !password || !phone || !role) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    })

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User with this email or phone already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        isOnline: false,
        // Add driver details if role is DRIVER or BOTH
        driverDetails: (role === 'DRIVER' || role === 'BOTH') && vehicleType && vehicleNumber && vehicleModel && licensePlate
          ? {
              vehicleType,
              vehicleNumber,
              vehicleModel,
              licensePlate,
              rating: 5.0,
              totalRides: 0
            }
          : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true
      }
    })

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return NextResponse.json<ApiResponse<AuthResponse>>(
      {
        success: true,
        data: {
          token,
          user
        },
        message: 'User created successfully'
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}