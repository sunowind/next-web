import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { LoginRequest, LoginResponse } from '@/types/user'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { username, password } = body

    // 验证请求数据
    if (!username || !password) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: '用户名和密码不能为空' },
        { status: 400 },
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: '用户名或密码错误' },
        { status: 401 },
      )
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: '用户名或密码错误' },
        { status: 401 },
      )
    }

    // 生成JWT token
    const token = signToken({
      userId: user.id,
      username: user.username,
    })

    return NextResponse.json<LoginResponse>(
      {
        success: true,
        message: '登录成功',
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('登录API错误:', error)
    return NextResponse.json<LoginResponse>(
      { success: false, message: '服务器内部错误，请稍后重试' },
      { status: 500 },
    )
  }
} 