import { NextRequest, NextResponse } from 'next/server'
const { prisma } = require('@/lib/prisma')

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: '用户名是必需的' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 设置30分钟过期时间
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

    // 删除该用户之前的验证码
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id }
    })

    // 创建新的验证码记录
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      }
    })

    return NextResponse.json({
      message: '验证码已生成',
      code,
      userId: user.id
    })
  } catch (error) {
    console.error('找回密码错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 