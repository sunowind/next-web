// Mock prisma (必须放在最顶部)
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    passwordReset: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

import { POST } from '../route'
// 用require方式引入prisma，确保mock生效
const { prisma } = require('@/lib/prisma')

describe('/api/auth/forgot-password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该返回400当用户名缺失时', async () => {
    const request = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('用户名是必需的')
  })

  it('应该返回404当用户不存在时', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ username: 'nonexistent' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('用户不存在')
  })

  it('应该成功生成验证码当用户存在时', async () => {
    const mockUser = {
      id: 'user123',
      username: 'testuser',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    prisma.user.findUnique.mockResolvedValue(mockUser)
    prisma.passwordReset.deleteMany.mockResolvedValue({})
    prisma.passwordReset.create.mockResolvedValue({
      id: 'reset123',
      userId: 'user123',
      code: '123456',
      expiresAt: new Date(),
    })

    const request = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('验证码已生成')
    expect(data.code).toBeDefined()
    expect(data.userId).toBe('user123')
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { username: 'testuser' },
    })
    expect(prisma.passwordReset.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user123' },
    })
    expect(prisma.passwordReset.create).toHaveBeenCalled()
  })

  it('应该处理服务器错误', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('服务器内部错误')
  })
}) 