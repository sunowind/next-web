import { prisma } from '@/lib/prisma'
import { validateRegisterInput } from '@/lib/validation'
import { RegisterRequest, RegisterResponse } from '@/types/user'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

// 简单的内存存储用于速率限制（生产环境应使用 Redis）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// 速率限制配置
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15分钟
const RATE_LIMIT_MAX_REQUESTS = 5 // 15分钟内最多5次注册尝试

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    // 重置或创建新记录
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  // 增加计数
  record.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count }
}

export async function POST(request: NextRequest) {
  try {
    // 速率限制检查
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.allowed) {
      return NextResponse.json<RegisterResponse>(
        {
          success: false,
          message: '注册请求过于频繁，请15分钟后再试',
        },
        { status: 429 },
      )
    }

    const body: RegisterRequest = await request.json()
    const { username, email, password } = body

    // 验证请求数据
    if (!username || !password) {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: '用户名和密码不能为空' },
        { status: 400 },
      )
    }

    // 使用验证函数验证输入
    const validation = validateRegisterInput(username, password, email)
    if (!validation.isValid) {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: validation.message! },
        { status: 400 },
      )
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: '用户名已存在' },
        { status: 409 },
      )
    }

    // 如果提供了邮箱，检查邮箱是否已存在
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (existingEmail) {
        return NextResponse.json<RegisterResponse>(
          { success: false, message: '该邮箱已被注册' },
          { status: 409 },
        )
      }
    }

    // 加密密码
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email: email || null,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json<RegisterResponse>(
      {
        success: true,
        message: '注册成功！请使用新账号登录',
        user: { username: user.username, email: user.email },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('注册失败:', error)

    // 处理数据库约束错误
    if (
      error instanceof Error &&
      error.message.includes('UNIQUE constraint failed')
    ) {
      if (error.message.includes('email')) {
        return NextResponse.json<RegisterResponse>(
          { success: false, message: '该邮箱已被注册' },
          { status: 409 },
        )
      }
      return NextResponse.json<RegisterResponse>(
        { success: false, message: '用户名已存在' },
        { status: 409 },
      )
    }

    return NextResponse.json<RegisterResponse>(
      { success: false, message: '服务器内部错误，请稍后重试' },
      { status: 500 },
    )
  }
}
