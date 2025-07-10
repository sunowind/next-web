import { validateUsername, validatePassword, validateRegisterInput } from '../validation'

describe('Validation Functions', () => {
  describe('validateUsername', () => {
    it('should accept valid username', () => {
      const result = validateUsername('testuser')
      expect(result.isValid).toBe(true)
    })

    it('should reject empty username', () => {
      const result = validateUsername('')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名不能为空')
    })

    it('should reject short username', () => {
      const result = validateUsername('ab')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名长度至少需要3个字符')
    })

    it('should reject long username', () => {
      const result = validateUsername('a'.repeat(21))
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名长度不能超过20个字符')
    })
  })

  describe('validatePassword', () => {
    it('should accept valid password', () => {
      const result = validatePassword('password123')
      expect(result.isValid).toBe(true)
    })

    it('should reject empty password', () => {
      const result = validatePassword('')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('密码不能为空')
    })

    it('should reject short password', () => {
      const result = validatePassword('12345')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('密码长度至少需要6个字符')
    })
  })

  describe('validateRegisterInput', () => {
    it('should accept valid input', () => {
      const result = validateRegisterInput('testuser', 'password123')
      expect(result.isValid).toBe(true)
    })

    it('should reject invalid username', () => {
      const result = validateRegisterInput('ab', 'password123')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('用户名长度至少需要3个字符')
    })

    it('should reject invalid password', () => {
      const result = validateRegisterInput('testuser', '12345')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('密码长度至少需要6个字符')
    })
  })
})
