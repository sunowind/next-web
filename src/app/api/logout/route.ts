import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest, getAuthFromCookie } from '@/lib/auth'
import { blacklistToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 尝试从Authorization header或cookie获取认证信息
    const auth = getAuthFromRequest(request) || getAuthFromCookie(request)

    if (!auth) {
      return NextResponse.json(
        { success: false, message: '未找到有效的认证信息' },
        { status: 401 }
      )
    }

    // 将token添加到黑名单
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : request.cookies.get('auth_token')?.value

    if (token) {
      blacklistToken(token)
    }

    // 记录用户登出事件到数据库
    try {
      await prisma.userActivityLog.create({
        data: {
          userId: auth.userId,
          activityType: 'logout',
        },
      })
    } catch (error) {
      console.error('记录登出日志失败:', error)
      // 日志记录失败不影响登出流程
    }

    // 创建响应，清除认证cookie
    const response = NextResponse.json(
      { success: true, message: '登出成功' },
      { status: 200 }
    )

    // 清除认证cookie
    response.cookies.delete('auth_token')

    return response
  } catch (error) {
    console.error('登出API错误:', error)
    return NextResponse.json(
      { success: false, message: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
} 