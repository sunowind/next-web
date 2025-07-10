import {
  validatePassword,
  validateRegisterInput,
  validateUsername,
} from '../validation'

// Mock zxcvbn
jest.mock('zxcvbn', () => ({
  __esModule: true,
  default: jest.fn((password: string) => {
    // Return weak score for simple passwords like "123456"
    if (password === '123456' || password === '123' || password === '12345') {
      return {
        score: 1,
        feedback: {
          suggestions: ['使用更长的密码'],
        },
      }
    }
    // Return medium score for passwords like "password123"
    if (password.length >= 8) {
      return {
        score: 3,
        feedback: {
          suggestions: [],
        },
      }
    }
    // Return medium score for 6-7 character passwords
    return {
      score: 2,
      feedback: {
        suggestions: [],
      },
    }
  }),
}))

describe('validation', () => {
  describe('validateUsername', () => {
    it('should return valid for correct username', () => {
      const result = validateUsername('testuser')
      expect(result.isValid).toBe(true)
    })

    it('should return invalid for empty username', () => {
      const result = validateUsername('')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名不能为空')
    })

    it('should return invalid for whitespace-only username', () => {
      const result = validateUsername('   ')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名不能为空')
    })

    it('should return invalid for short username', () => {
      const result = validateUsername('ab')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名长度至少需要3个字符')
    })

    it('should return invalid for long username', () => {
      const result = validateUsername('a'.repeat(21))
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名长度不能超过20个字符')
    })

    it('should return invalid for username with special characters', () => {
      const result = validateUsername('user@name')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名只能包含字母、数字和下划线')
    })

    it('should return valid for username with letters, numbers, and underscores', () => {
      const result = validateUsername('user_123')
      expect(result.isValid).toBe(true)
    })
  })

  describe('validatePassword', () => {
    it('should return valid for strong password', () => {
      const result = validatePassword('StrongPassword123!')
      expect(result.isValid).toBe(true)
    })

    it('should return invalid for empty password', () => {
      const result = validatePassword('')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('密码不能为空')
    })

    it('should return invalid for whitespace-only password', () => {
      const result = validatePassword('   ')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('密码不能为空')
    })

    it('should return invalid for short password', () => {
      const result = validatePassword('12345')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('密码长度至少需要6个字符')
    })

    it('should return invalid for weak password', () => {
      const result = validatePassword('123456')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('密码强度太弱，请使用更复杂的密码')
    })

    it('should return valid for medium strength password', () => {
      const result = validatePassword('password123')
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateRegisterInput', () => {
    it('should return valid for correct input', () => {
      const result = validateRegisterInput('testuser', 'StrongPassword123!')
      expect(result.isValid).toBe(true)
    })

    it('should return invalid for invalid username', () => {
      const result = validateRegisterInput('ab', 'StrongPassword123!')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名长度至少需要3个字符')
    })

    it('should return invalid for invalid password', () => {
      const result = validateRegisterInput('testuser', '123')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('密码长度至少需要6个字符')
    })

    it('should prioritize username validation over password validation', () => {
      const result = validateRegisterInput('ab', '123')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名长度至少需要3个字符')
    })
  })
})
