import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { validateUsername, validatePassword } from '@/lib/validation'
import { LoginRequest, LoginResponse } from '@/types/user'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

const MAX_LOGIN_ATTEMPTS = 5
const LOCK_DURATION_MINUTES = 15

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

    // 验证用户名格式
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.isValid) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: '用户名格式不正确' },
        { status: 400 },
      )
    }

    // 验证密码格式
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: '密码格式不正确' },
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

    // 检查账户是否被锁定
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60))
      return NextResponse.json<LoginResponse>(
        { 
          success: false, 
          message: `账户已被锁定，请在${remainingTime}分钟后重试` 
        },
        { status: 423 },
      )
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      // 增加失败计数
      const newFailedCount = user.failedLoginCount + 1
      let lockedUntil = null

      // 如果失败次数达到上限，锁定账户
      if (newFailedCount >= MAX_LOGIN_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: newFailedCount,
          lockedUntil,
        },
      })

      if (lockedUntil) {
        return NextResponse.json<LoginResponse>(
          { 
            success: false, 
            message: `登录失败次数过多，账户已被锁定${LOCK_DURATION_MINUTES}分钟` 
          },
          { status: 423 },
        )
      }

      return NextResponse.json<LoginResponse>(
        { 
          success: false, 
          message: `用户名或密码错误，还有${MAX_LOGIN_ATTEMPTS - newFailedCount}次尝试机会` 
        },
        { status: 401 },
      )
    }

    // 登录成功，重置失败计数和锁定时间
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
      },
    })

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
    console.error('登录失败:', error)

    return NextResponse.json<LoginResponse>(
      { success: false, message: '服务器内部错误，请稍后重试' },
      { status: 500 },
    )
  }
} 