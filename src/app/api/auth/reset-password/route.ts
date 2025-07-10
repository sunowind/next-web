import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { userId, code, newPassword } = await request.json()

    if (!userId || !code || !newPassword) {
      return NextResponse.json(
        { error: '用户ID、验证码和新密码都是必需的' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
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

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 更新用户密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    // 标记验证码为已使用
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    })

    return NextResponse.json({
      message: '密码重置成功'
    })
  } catch (error) {
    console.error('重置密码错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 