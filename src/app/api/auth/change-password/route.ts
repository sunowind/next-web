import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export interface ChangePasswordResult {
  success: boolean
  message: string
  status: number
}

export async function changePasswordLogic(
  currentPassword: string,
  newPassword: string,
  userId: string
): Promise<ChangePasswordResult> {
  try {
    // 验证新密码基本要求
    if (newPassword.length < 6) {
      return {
        success: false,
        message: '新密码至少需要6个字符',
        status: 400
      }
    }

    if (currentPassword === newPassword) {
      return {
        success: false,
        message: '新密码不能与当前密码相同',
        status: 400
      }
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return {
        success: false,
        message: '用户不存在',
        status: 404
      }
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return {
        success: false,
        message: '当前密码不正确',
        status: 400
      }
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // 更新用户密码
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    })

    // 记录密码修改活动
    await prisma.userActivityLog.create({
      data: {
        userId: user.id,
        activityType: 'password_change'
      }
    })

    return {
      success: true,
      message: '密码修改成功',
      status: 200
    }
  } catch (error) {
    console.error('修改密码错误:', error)
    return {
      success: false,
      message: '服务器内部错误',
      status: 500
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()

    // 验证请求参数
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '当前密码和新密码都是必需的' },
        { status: 400 }
      )
    }

    // 从请求头获取认证token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // 验证JWT token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 调用业务逻辑
    const result = await changePasswordLogic(currentPassword, newPassword, decoded.userId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      }, { status: result.status })
    } else {
      return NextResponse.json({
        error: result.message
      }, { status: result.status })
    }
  } catch (error) {
    console.error('修改密码API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 