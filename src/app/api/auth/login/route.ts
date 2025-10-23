import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs'
import { prisma } from "@/src/lib/prisma";
import { generateToken } from '@/src/lib/auth'
import { LoginRequest, ApiResponse, AuthResponse } from '@/src/lib/types'

export async function POST(request:NextRequest){
    try{
        const body: LoginRequest = await request.json()

        const { email, password } = body

        if(!email || !password){
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Missing required fields' },
                {status: 400}
            )
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        if(!existingUser){
            return NextResponse.json<ApiResponse>(
                {success: false, message: "Invalid Email or Password"},
                {status: 401}
            )
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser?.password)

        if(!isPasswordValid){
            return NextResponse.json<ApiResponse>(
                {success: false, message: "Invalid Email or Password"},
                {status: 401}
            )
        }

        const token = generateToken({
            userId: existingUser.id,
            email: existingUser.email,
            role: existingUser.role
        })

        return NextResponse.json<ApiResponse<AuthResponse>>(
            {
            success: true,
            data:{
                token,
                user:{
                    id: existingUser.id,
                    name: existingUser.name,
                    email: existingUser.email,
                    phone: existingUser.phone,
                    role: existingUser.role
                }
            }
        },
        {status: 200}
    )
    }
    catch(error){
    console.error('Signup error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
    }
}