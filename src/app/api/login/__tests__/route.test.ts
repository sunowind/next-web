import { POST } from '../route'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

jest.mock('@/lib/jwt', () => ({
  signToken: jest.fn(),
}))

jest.mock('@/lib/validation', () => ({
  validateUsername: jest.fn(),
  validatePassword: jest.fn(),
}))

const mockPrisma = require('@/lib/prisma').prisma
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const mockJwt = require('@/lib/jwt')
const mockValidation = require('@/lib/validation')

describe('Login API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementations
    mockValidation.validateUsername.mockReturnValue({ isValid: true })
    mockValidation.validatePassword.mockReturnValue({ isValid: true })
  })

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  describe('Input Validation', () => {
    it('should reject empty username', async () => {
      const request = createRequest({ username: '', password: 'password123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('用户名和密码不能为空')
    })

    it('should reject empty password', async () => {
      const request = createRequest({ username: 'testuser', password: '' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('用户名和密码不能为空')
    })

    it('should reject invalid username format', async () => {
      mockValidation.validateUsername.mockReturnValue({ 
        isValid: false, 
        message: '用户名格式不正确' 
      })

      const request = createRequest({ username: 'test@user', password: 'password123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('用户名格式不正确')
    })

    it('should reject invalid password format', async () => {
      mockValidation.validatePassword.mockReturnValue({ 
        isValid: false, 
        message: '密码格式不正确' 
      })

      const request = createRequest({ username: 'testuser', password: '123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('密码格式不正确')
    })
  })

  describe('User Authentication', () => {
    it('should reject non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const request = createRequest({ username: 'nonexistent', password: 'password123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe('用户名或密码错误')
    })

    it('should reject incorrect password', async () => {
      const mockUser = {
        id: 'user_123',
        username: 'testuser',
        password: 'hashedpassword',
        failedLoginCount: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(false)

      const request = createRequest({ username: 'testuser', password: 'wrongpassword' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe('用户名或密码错误，还有4次尝试机会')

      // Should update failed login count
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user_123' },
        data: {
          failedLoginCount: 1,
          lockedUntil: null,
        },
      })
    })

    it('should successfully authenticate valid user', async () => {
      const mockUser = {
        id: 'user_123',
        username: 'testuser',
        password: 'hashedpassword',
        failedLoginCount: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true)
      mockJwt.signToken.mockReturnValue('mock-jwt-token')

      const request = createRequest({ username: 'testuser', password: 'correctpassword' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('登录成功')
      expect(data.token).toBe('mock-jwt-token')
      expect(data.user).toEqual({
        id: 'user_123',
        username: 'testuser',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      })

      // Should reset failed login count
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user_123' },
        data: {
          failedLoginCount: 0,
          lockedUntil: null,
        },
      })
    })
  })

  describe('Security Features', () => {
    it('should lock account after max failed attempts', async () => {
      const mockUser = {
        id: 'user_123',
        username: 'testuser',
        password: 'hashedpassword',
        failedLoginCount: 4, // One less than max
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(false)

      const request = createRequest({ username: 'testuser', password: 'wrongpassword' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(423)
      expect(data.success).toBe(false)
      expect(data.message).toBe('登录失败次数过多，账户已被锁定15分钟')

      // Should update with lock
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user_123' },
        data: {
          failedLoginCount: 5,
          lockedUntil: expect.any(Date),
        },
      })
    })

    it('should reject login for locked account', async () => {
      const futureTime = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      const mockUser = {
        id: 'user_123',
        username: 'testuser',
        password: 'hashedpassword',
        failedLoginCount: 5,
        lockedUntil: futureTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const request = createRequest({ username: 'testuser', password: 'correctpassword' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(423)
      expect(data.success).toBe(false)
      expect(data.message).toContain('账户已被锁定，请在')
      expect(data.message).toContain('分钟后重试')
    })

    it('should allow login for expired lock', async () => {
      const pastTime = new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      const mockUser = {
        id: 'user_123',
        username: 'testuser',
        password: 'hashedpassword',
        failedLoginCount: 5,
        lockedUntil: pastTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true)
      mockJwt.signToken.mockReturnValue('mock-jwt-token')

      const request = createRequest({ username: 'testuser', password: 'correctpassword' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('登录成功')
    })

    it('should show remaining attempts correctly', async () => {
      const mockUser = {
        id: 'user_123',
        username: 'testuser',
        password: 'hashedpassword',
        failedLoginCount: 2,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(false)

      const request = createRequest({ username: 'testuser', password: 'wrongpassword' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe('用户名或密码错误，还有2次尝试机会')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'))

      const request = createRequest({ username: 'testuser', password: 'password123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('服务器内部错误，请稍后重试')
    })

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('服务器内部错误，请稍后重试')
    })
  })

  describe('JWT Token Generation', () => {
    it('should generate JWT token with correct payload', async () => {
      const mockUser = {
        id: 'user_123',
        username: 'testuser',
        password: 'hashedpassword',
        failedLoginCount: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true)
      mockJwt.signToken.mockReturnValue('mock-jwt-token')

      const request = createRequest({ username: 'testuser', password: 'correctpassword' })
      await POST(request)

      expect(mockJwt.signToken).toHaveBeenCalledWith({
        userId: 'user_123',
        username: 'testuser',
      })
    })
  })
}) 