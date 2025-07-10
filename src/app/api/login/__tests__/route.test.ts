// mock NextResponse
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      json: (body: unknown, options?: { status?: number }) => ({
        body,
        status: options?.status ?? 200,
        json: async () => body,
      }),
    },
  }
})

import { POST } from '../route'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('@/lib/jwt', () => ({
  signToken: jest.fn(),
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

import { prisma as mockPrisma } from '@/lib/prisma'
import { signToken as mockSignToken } from '@/lib/jwt'
import { compare as mockBcryptCompare } from 'bcryptjs'

// Helper function to create mock request
function createMockRequest(body: unknown) {
  return {
    json: async () => body,
  } as unknown as NextRequest
}
1
describe('POST /api/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 when username is missing', async () => {
    const request = createMockRequest({ password: 'password123' })
    const response = await POST(request)
    const data = response.body as unknown as { success: boolean; message: string }
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('用户名和密码不能为空')
  })

  it('should return 400 when password is missing', async () => {
    const request = createMockRequest({ username: 'testuser' })
    const response = await POST(request)
    const data = response.body as unknown as { success: boolean; message: string }
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('用户名和密码不能为空')
  })

  it('should return 401 when user does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    const request = createMockRequest({ username: 'nonexistent', password: 'password123' })
    const response = await POST(request)
    const data = response.body as unknown as { success: boolean; message: string }
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message).toBe('用户名或密码错误')
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { username: 'nonexistent' },
    })
  })

  it('should return 401 when password is incorrect', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockPrisma.user.findUnique.mockResolvedValue(mockUser)
    mockBcryptCompare.mockResolvedValue(false)
    const request = createMockRequest({ username: 'testuser', password: 'wrongpassword' })
    const response = await POST(request)
    const data = response.body as unknown as { success: boolean; message: string }
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message).toBe('用户名或密码错误')
    expect(mockBcryptCompare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword')
  })

  it('should return 200 and token when login is successful', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockPrisma.user.findUnique.mockResolvedValue(mockUser)
    mockBcryptCompare.mockResolvedValue(true)
    mockSignToken.mockReturnValue('mock-jwt-token')
    const request = createMockRequest({ username: 'testuser', password: 'password123' })
    const response = await POST(request)
    const data = response.body as unknown as { success: boolean; message: string; token: string; user: unknown }
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('登录成功')
    expect(data.token).toBe('mock-jwt-token')
    expect(data.user).toEqual({
      id: '1',
      username: 'testuser',
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
    })
    expect(mockSignToken).toHaveBeenCalledWith({
      userId: '1',
      username: 'testuser',
    })
  })

  it('should return 500 when database error occurs', async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'))
    const request = createMockRequest({ username: 'testuser', password: 'password123' })
    const response = await POST(request)
    const data = response.body as unknown as { success: boolean; message: string }
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe('服务器内部错误，请稍后重试')
  })
}) 