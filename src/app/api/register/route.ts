import { prisma } from '@/lib/prisma'
import { validateRegisterInput } from '@/lib/validation'
import { RegisterRequest, RegisterResponse } from '@/types/user'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { username, password } = body

    // 验证请求数据
    if (!username || !password) {
      return NextResponse.json<RegisterResponse>(
        { success: false, message: '用户名和密码不能为空' },
        { status: 400 },
      )
    }

    // 使用验证函数验证输入
    const validation = validateRegisterInput(username, password)
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

    // 加密密码
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json<RegisterResponse>(
      {
        success: true,
        message: '注册成功！请使用新账号登录',
        user: { username: user.username },
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
