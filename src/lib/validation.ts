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

export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim().length === 0) {
    return { isValid: false, message: '密码不能为空' }
  }

  if (password.length < 6) {
    return { isValid: false, message: '密码长度至少需要6个字符' }
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
): ValidationResult {
  const usernameValidation = validateUsername(username)
  if (!usernameValidation.isValid) {
    return usernameValidation
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    return passwordValidation
  }

  return { isValid: true }
}
