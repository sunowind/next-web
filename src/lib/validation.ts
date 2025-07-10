import zxcvbn from 'zxcvbn'

export interface ValidationResult {
  isValid: boolean
  message?: string
}

export function validateUsername(username: string): ValidationResult {
  if (!username || username.trim().length === 0) {
    return { isValid: false, message: '用户名不能为空' }
  }

  if (username.length < 3) {
    return { isValid: false, message: '用户名长度至少需要3个字符' }
  }

  if (username.length > 20) {
    return { isValid: false, message: '用户名长度不能超过20个字符' }
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    return { isValid: false, message: '用户名只能包含字母、数字和下划线' }
  }

  return { isValid: true }
}

export function validateEmail(email?: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: true } // Email is optional
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  if (!emailRegex.test(email)) {
    return { isValid: false, message: '请输入有效的邮箱地址' }
  }

  return { isValid: true }
}

export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim().length === 0) {
    return { isValid: false, message: '密码不能为空' }
  }

  if (password.length < 8) {
    return { isValid: false, message: '密码长度至少需要8个字符' }
  }

  if (password.length > 50) {
    return { isValid: false, message: '密码长度不能超过50个字符' }
  }

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (!hasUpperCase) {
    return { isValid: false, message: '密码必须包含至少一个大写字母' }
  }

  if (!hasLowerCase) {
    return { isValid: false, message: '密码必须包含至少一个小写字母' }
  }

  if (!hasNumbers) {
    return { isValid: false, message: '密码必须包含至少一个数字' }
  }

  if (!hasSpecialChar) {
    return { isValid: false, message: '密码必须包含至少一个特殊字符' }
  }

  // 使用 zxcvbn 检查密码强度
  const strength = zxcvbn(password)
  if (strength.score < 2) {
    return {
      isValid: false,
      message: '密码强度太弱，请使用更复杂的密码',
    }
  }

  return { isValid: true }
}

export function validateRegisterInput(
  username: string,
  password: string,
  email?: string,
): ValidationResult {
  const usernameValidation = validateUsername(username)
  if (!usernameValidation.isValid) {
    return usernameValidation
  }

  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    return emailValidation
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    return passwordValidation
  }

  return { isValid: true }
}
