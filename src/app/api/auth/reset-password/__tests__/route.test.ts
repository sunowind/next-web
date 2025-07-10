// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
}))

// Mock prisma (必须放在最顶部)
jest.mock('@/lib/prisma', () => ({
  prisma: {
    passwordReset: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
}))

import { POST } from '../route'
// 用require方式引入prisma，确保mock生效
const { prisma } = require('@/lib/prisma')

describe('/api/auth/reset-password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该返回400当参数缺失时', async () => {
    const request = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('用户ID、验证码和新密码都是必需的')
  })

  it('应该返回400当密码长度不足时', async () => {
    const request = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123', code: '123456', newPassword: '123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('密码长度至少为6位')
  })

  it('应该返回400当验证码无效时', async () => {
    prisma.passwordReset.findFirst.mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123', code: 'invalid', newPassword: 'newpassword123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('验证码无效或已过期')
  })

  it('应该成功重置密码', async () => {
    const mockResetRecord = {
      id: 'reset123',
      userId: 'user123',
      code: '123456',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟后过期
      usedAt: null,
    }

    prisma.passwordReset.findFirst.mockResolvedValue(mockResetRecord)
    prisma.user.update.mockResolvedValue({ id: 'user123' })
    prisma.passwordReset.update.mockResolvedValue({})

    const request = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123', code: '123456', newPassword: 'newpassword123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('密码重置成功')
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
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user123' },
      data: { password: 'hashedpassword' },
    })
  })

  it('应该处理服务器错误', async () => {
    prisma.passwordReset.findFirst.mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123', code: '123456', newPassword: 'newpassword123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('服务器内部错误')
  })
}) 