jest.mock('next/server', () => {
  const mockJson = jest.fn((body, { status }) => ({ body, status, cookies: { delete: jest.fn() } }))
  return {
    NextResponse: { json: mockJson },
    mockJson,
  }
})

import { POST } from '../route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/auth', () => ({
  getAuthFromRequest: jest.fn(),
  getAuthFromCookie: jest.fn(),
}))

jest.mock('@/lib/jwt', () => ({
  signToken: jest.fn(),
  blacklistToken: jest.fn(),
  isTokenBlacklisted: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    userActivityLog: {
      create: jest.fn(),
    },
  },
}))

const mockGetAuthFromRequest = require('@/lib/auth').getAuthFromRequest
const mockGetAuthFromCookie = require('@/lib/auth').getAuthFromCookie
const mockBlacklistToken = require('@/lib/jwt').blacklistToken
const mockPrisma = require('@/lib/prisma').prisma
const mockJson = require('next/server').mockJson

describe('POST /api/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (headers: Record<string, string> = {}, cookies: Record<string, string> = {}) => {
    return {
      method: 'POST',
      headers: {
        get: (name: string) => {
          const found = Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase())
          return found ? headers[found] : null
        },
        has: (name: string) => {
          return Object.keys(headers).some(k => k.toLowerCase() === name.toLowerCase())
        },
      },
      cookies: {
        get: (name: string) => {
          const value = cookies[name]
          return value ? { value } : undefined
        },
        delete: jest.fn(),
      },
      nextUrl: {
        searchParams: {
          get: jest.fn(),
        },
      },
    } as unknown as NextRequest
  }

  it('should return 401 when no valid auth is found', async () => {
    mockGetAuthFromRequest.mockReturnValue(null)
    mockGetAuthFromCookie.mockReturnValue(null)

    const request = createMockRequest()
    const response = await POST(request)
    expect(mockJson).toHaveBeenCalledWith(
      { success: false, message: '未找到有效的认证信息' },
      { status: 401 }
    )
    expect(response.status).toBe(401)
    expect((response.body! as unknown as { success: boolean }).success).toBe(false)
  })

  it('should successfully logout with valid auth from header', async () => {
    const mockAuth = { userId: 'user123', username: 'testuser' }
    const mockToken = 'valid-jwt-token'
    mockGetAuthFromRequest.mockReturnValue(mockAuth)
    mockGetAuthFromCookie.mockReturnValue(null)
    mockPrisma.userActivityLog.create.mockResolvedValue({})

    const request = createMockRequest({ 'Authorization': `Bearer ${mockToken}` })
    const response = await POST(request)
    expect(mockJson).toHaveBeenCalledWith(
      { success: true, message: '登出成功' },
      { status: 200 }
    )
    expect(response.status).toBe(200)
    expect((response.body! as unknown as { success: boolean }).success).toBe(true)
    expect(mockBlacklistToken).toHaveBeenCalledWith(mockToken)
    expect(mockPrisma.userActivityLog.create).toHaveBeenCalledWith({
      data: { userId: 'user123', activityType: 'logout' },
    })
  })

  it('should successfully logout with valid auth from cookie', async () => {
    const mockAuth = { userId: 'user123', username: 'testuser' }
    const mockToken = 'valid-jwt-token'
    mockGetAuthFromRequest.mockReturnValue(null)
    mockGetAuthFromCookie.mockReturnValue(mockAuth)
    mockPrisma.userActivityLog.create.mockResolvedValue({})

    const request = createMockRequest({}, { 'auth_token': mockToken })
    const response = await POST(request)
    expect(mockJson).toHaveBeenCalledWith(
      { success: true, message: '登出成功' },
      { status: 200 }
    )
    expect(response.status).toBe(200)
    expect((response.body! as unknown as { success: boolean }).success).toBe(true)
    expect(mockBlacklistToken).toHaveBeenCalledWith(mockToken)
    expect(mockPrisma.userActivityLog.create).toHaveBeenCalledWith({
      data: { userId: 'user123', activityType: 'logout' },
    })
  })

  it('should handle database error gracefully', async () => {
    const mockAuth = { userId: 'user123', username: 'testuser' }
    const mockToken = 'valid-jwt-token'
    mockGetAuthFromRequest.mockReturnValue(mockAuth)
    mockGetAuthFromCookie.mockReturnValue(null)
    mockPrisma.userActivityLog.create.mockRejectedValue(new Error('Database error'))

    const request = createMockRequest({ 'Authorization': `Bearer ${mockToken}` })
    const response = await POST(request)
    expect(mockJson).toHaveBeenCalledWith(
      { success: true, message: '登出成功' },
      { status: 200 }
    )
    expect(response.status).toBe(200)
    expect((response.body! as unknown as { success: boolean }).success).toBe(true)
    expect(mockBlacklistToken).toHaveBeenCalledWith(mockToken)
  })

  it('should handle missing token gracefully', async () => {
    const mockAuth = { userId: 'user123', username: 'testuser' }
    mockGetAuthFromRequest.mockReturnValue(mockAuth)
    mockGetAuthFromCookie.mockReturnValue(null)

    const request = createMockRequest()
    const response = await POST(request)
    expect(mockJson).toHaveBeenCalledWith(
      { success: true, message: '登出成功' },
      { status: 200 }
    )
    expect(response.status).toBe(200)
    expect((response.body! as unknown as { success: boolean }).success).toBe(true)
    expect(mockBlacklistToken).not.toHaveBeenCalled()
  })

  it('should return 500 on unexpected error', async () => {
    mockGetAuthFromRequest.mockImplementation(() => { throw new Error('Unexpected error') })
    const request = createMockRequest()
    const response = await POST(request)
    expect(mockJson).toHaveBeenCalledWith(
      { success: false, message: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
    expect(response.status).toBe(500)
    expect((response.body! as unknown as { success: boolean }).success).toBe(false)
  })
}) 