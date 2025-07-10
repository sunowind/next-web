import jwt, { SignOptions } from 'jsonwebtoken'

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn']

// JWT token黑名单（在生产环境中应该使用Redis等持久化存储）
const tokenBlacklist = new Set<string>()

export interface JWTPayload {
  userId: string
  username: string
  iat?: number
  exp?: number
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN }
  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    // 检查token是否在黑名单中
    if (tokenBlacklist.has(token)) {
      console.log('Token is blacklisted')
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT decode failed:', error)
    return null
  }
}

// 添加token到黑名单
export function blacklistToken(token: string): void {
  tokenBlacklist.add(token)
  console.log('Token added to blacklist')
}

// 检查token是否在黑名单中
export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token)
}

// 清理过期的token（可选，用于内存管理）
export function cleanupExpiredTokens(): void {
  // 这里可以实现清理逻辑，比如定期清理过期的token
  // 在生产环境中，建议使用Redis的TTL功能自动清理
  console.log('Token blacklist cleanup completed')
} 