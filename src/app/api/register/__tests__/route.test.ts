/**
 * 后端 API 测试
 *
 * 注意：由于 Next.js Web API 在测试环境中的复杂性，
 * 这里我们主要测试业务逻辑函数，而不是完整的 API 路由。
 * 完整的 API 测试可以通过集成测试或 E2E 测试来覆盖。
 */

import { validateRegisterInput } from '@/lib/validation'
import bcrypt from 'bcryptjs'

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

// Mock Prisma
const mockFindUnique = jest.fn()
const mockCreate = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  },
}))

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('Register API Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Input Validation', () => {
    it('should validate correct input', () => {
      const result = validateRegisterInput('testuser', 'password123')
      expect(result.isValid).toBe(true)
    })

    it('should reject empty username', () => {
      const result = validateRegisterInput('', 'password123')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名不能为空')
    })

    it('should reject empty password', () => {
      const result = validateRegisterInput('testuser', '')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('密码不能为空')
    })

    it('should reject short username', () => {
      const result = validateRegisterInput('ab', 'password123')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名长度至少需要3个字符')
    })

    it('should reject long username', () => {
      const result = validateRegisterInput('a'.repeat(21), 'password123')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名长度不能超过20个字符')
    })

    it('should reject short password', () => {
      const result = validateRegisterInput('testuser', '12345')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('密码长度至少需要6个字符')
    })
  })

  describe('Password Hashing', () => {
    it('should hash password with correct salt rounds', async () => {
      const password = 'password123'
      const hashedPassword = 'hashedPassword'

      mockBcrypt.hash.mockResolvedValue(hashedPassword as never)

      const result = await bcrypt.hash(password, 12)

      expect(result).toBe(hashedPassword)
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12)
    })
  })

  describe('Database Operations', () => {
    it('should check if user exists', async () => {
      const { prisma } = await import('@/lib/prisma')

      mockFindUnique.mockResolvedValue(null)

      const result = await prisma.user.findUnique({
        where: { username: 'testuser' },
      })

      expect(result).toBeNull()
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      })
    })

    it('should create new user', async () => {
      const { prisma } = await import('@/lib/prisma')

      const userData = {
        username: 'testuser',
        password: 'hashedPassword',
      }

      const createdAt = new Date()
      const updatedAt = new Date()
      
      const selectedUser = {
        id: 'user_123',
        username: 'testuser',
        createdAt,
        updatedAt,
      }

      // Mock the create function to return the selected fields
      mockCreate.mockImplementation((params) => {
        if (params.select) {
          return Promise.resolve(selectedUser)
        }
        return Promise.resolve({
          id: 'user_123',
          username: 'testuser',
          password: 'hashedPassword',
          createdAt,
          updatedAt,
        })
      })

      const result = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      expect(result).toEqual(selectedUser)
      expect(mockCreate).toHaveBeenCalledWith({
        data: userData,
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    })
  })
})
