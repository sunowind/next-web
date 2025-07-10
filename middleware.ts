import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthFromRequest, getAuthFromCookie } from '@/lib/auth'

// 需要认证的路由
const protectedPaths = [
  '/profile',
  '/settings',
  '/admin',
]

// 认证用户不应该访问的路由（如登录、注册页面）
const authPaths = [
  '/login',
  '/register',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否为需要认证的路由
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath || isAuthPath) {
    // 尝试从Authorization header或cookie获取认证信息
    const auth = getAuthFromRequest(request) || getAuthFromCookie(request)

    if (isProtectedPath && !auth) {
      // 访问受保护的路由但未认证，重定向到登录页
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (isAuthPath && auth) {
      // 已认证用户访问登录/注册页面，重定向到首页
      const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // 匹配所有路径，除了API路由、静态文件等
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 