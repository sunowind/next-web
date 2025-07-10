import { changePasswordLogic } from '../route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    userActivityLog: {
      create: jest.fn()
    }
  }
}))

jest.mock('bcryptjs')

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: jest.MockedFunction<any>
    update: jest.MockedFunction<any>
  },
  userActivityLog: {
    create: jest.MockedFunction<any>
  }
}
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

const mockUser = {
  id: 'user-123',
  username: 'testuser',
  password: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('changePasswordLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('参数验证', () => {
    it('应该返回400错误当新密码长度不足', async () => {
      const result = await changePasswordLogic('oldpass123', '12345', 'user-123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('新密码至少需要6个字符')
      expect(result.status).toBe(400)
    })

    it('应该返回400错误当新密码与当前密码相同', async () => {
      const result = await changePasswordLogic('samepass123', 'samepass123', 'user-123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('新密码不能与当前密码相同')
      expect(result.status).toBe(400)
    })
  })

  describe('用户验证', () => {
    it('应该返回404错误当用户不存在', async () => {
      mockPrisma.user.findUnique.mockImplementation(() => Promise.resolve(null))

      const result = await changePasswordLogic('oldpass123', 'newpass123', 'user-123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('用户不存在')
      expect(result.status).toBe(404)
    })
  })

  describe('密码验证', () => {
    it('应该返回400错误当当前密码不正确', async () => {
      mockPrisma.user.findUnique.mockImplementation(() => Promise.resolve(mockUser))
      mockBcrypt.compare.mockImplementation(() => Promise.resolve(false))

      const result = await changePasswordLogic('wrongpass123', 'newpass123', 'user-123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('当前密码不正确')
      expect(result.status).toBe(400)
    })
  })

  describe('成功场景', () => {
    it('应该成功修改密码', async () => {
      mockPrisma.user.findUnique.mockImplementation(() => Promise.resolve(mockUser))
      mockBcrypt.compare.mockImplementation(() => Promise.resolve(true))
      mockBcrypt.hash.mockImplementation(() => Promise.resolve('new-hashed-password'))
      mockPrisma.user.update.mockImplementation(() => Promise.resolve(mockUser))
      mockPrisma.userActivityLog.create.mockImplementation(() => Promise.resolve({
        id: 'log-123',
        userId: 'user-123',
        activityType: 'password_change',
        createdAt: new Date()
      }))

      const result = await changePasswordLogic('oldpass123', 'newpass123', 'user-123')

      expect(result.success).toBe(true)
      expect(result.message).toBe('密码修改成功')
      expect(result.status).toBe(200)

      // 验证bcrypt.compare被调用
      expect(mockBcrypt.compare).toHaveBeenCalledWith('oldpass123', 'hashed-password')

      // 验证bcrypt.hash被调用
      expect(mockBcrypt.hash).toHaveBeenCalledWith('newpass123', 10)

      // 验证用户密码被更新
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { password: 'new-hashed-password' }
      })

      // 验证活动日志被创建
      expect(mockPrisma.userActivityLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          activityType: 'password_change'
        }
      })
    })
  })

  describe('错误处理', () => {
    it('应该返回500错误当数据库操作失败', async () => {
      mockPrisma.user.findUnique.mockImplementation(() => Promise.resolve(mockUser))
      mockBcrypt.compare.mockImplementation(() => Promise.resolve(true))
      mockPrisma.user.update.mockImplementation(() => Promise.reject(new Error('Database error')))

      const result = await changePasswordLogic('oldpass123', 'newpass123', 'user-123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('服务器内部错误')
      expect(result.status).toBe(500)
    })
  })
}) 