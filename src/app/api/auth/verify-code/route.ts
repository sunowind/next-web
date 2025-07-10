import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json()

    if (!userId || !code) {
      return NextResponse.json(
        { error: '用户ID和验证码都是必需的' },
        { status: 400 }
      )
    }

    // 查找验证码记录
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        userId,
        code,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
    })

    if (!resetRecord) {
      return NextResponse.json(
        { error: '验证码无效或已过期' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: '验证码验证成功',
      valid: true
    })
  } catch (error) {
    console.error('验证码验证错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 