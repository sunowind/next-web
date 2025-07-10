import { verifyToken, JWTPayload } from '@/lib/jwt'
import { NextRequest } from 'next/server'

export interface AuthUser {
  id: string
  username: string
  createdAt: Date
  updatedAt: Date
}

// 客户端认证检查
export function getStoredAuth(): { token: string; user: AuthUser } | null {
  if (typeof window === 'undefined') return null

  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')

  if (!token || !userStr) return null

  try {
    const user = JSON.parse(userStr) as AuthUser
    return { token, user }
  } catch {
    return null
  }
}

// 清除认证信息
export function clearAuth(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  sessionStorage.removeItem('auth_token')
  sessionStorage.removeItem('user')
}

// 检查token是否有效
export function isTokenValid(token: string): boolean {
  const payload = verifyToken(token)
  return payload !== null
}

// 从请求中获取认证信息
export function getAuthFromRequest(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7) // Remove 'Bearer ' prefix
  return verifyToken(token)
}

// 从cookie中获取认证信息（备用方案）
export function getAuthFromCookie(request: NextRequest): JWTPayload | null {
  const token = request.cookies.get('auth_token')?.value
  
  if (!token) {
    return null
  }

  return verifyToken(token)
} 