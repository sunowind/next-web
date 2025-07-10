// Mock prisma (必须放在最顶部)
jest.mock('@/lib/prisma', () => ({
  prisma: {
    passwordReset: {
      findFirst: jest.fn(),
    },
  },
}))

import { POST } from '../route'
// 用import方式引入prisma，确保mock生效
import { prisma } from '@/lib/prisma'

describe('/api/auth/verify-code', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该返回400当参数缺失时', async () => {
    const request = new Request('http://localhost:3000/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('用户ID和验证码都是必需的')
  })

  it('应该返回400当验证码无效时', async () => {
    prisma.passwordReset.findFirst.mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123', code: 'invalid' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('验证码无效或已过期')
  })

  it('应该成功验证有效的验证码', async () => {
    const mockResetRecord = {
      id: 'reset123',
      userId: 'user123',
      code: '123456',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟后过期
      usedAt: null,
    }

    prisma.passwordReset.findFirst.mockResolvedValue(mockResetRecord)

    const request = new Request('http://localhost:3000/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123', code: '123456' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('验证码验证成功')
    expect(data.valid).toBe(true)
    expect(prisma.passwordReset.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user123',
        code: '123456',
        expiresAt: {
          gt: expect.any(Date),
        },
        usedAt: null,
      },
    })
  })

  it('应该处理服务器错误', async () => {
    prisma.passwordReset.findFirst.mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost:3000/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123', code: '123456' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('服务器内部错误')
  })
}) 