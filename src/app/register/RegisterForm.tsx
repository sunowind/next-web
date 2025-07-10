'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import zxcvbn from 'zxcvbn'

interface RegisterFormData {
  username: string
  password: string
  confirmPassword: string
}

interface RegisterResponse {
  success: boolean
  message: string
}

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const watchPassword = watch('password', '')

  // 密码强度检测
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, feedback: '' }
    const result = zxcvbn(password)
    const strengthLabels = ['很弱', '弱', '一般', '强', '很强']
    const strengthColors = [
      'text-red-500',
      'text-orange-500',
      'text-yellow-500',
      'text-blue-500',
      'text-green-500',
    ]

    return {
      score: result.score,
      label: strengthLabels[result.score],
      color: strengthColors[result.score],
      feedback: result.feedback.suggestions.join(' '),
    }
  }

  const passwordStrength = getPasswordStrength(watchPassword)

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      })

      const result: RegisterResponse = await response.json()

      if (result.success) {
        setSubmitMessage({ type: 'success', text: result.message })
      } else {
        setSubmitMessage({ type: 'error', text: result.message })
      }
    } catch {
      setSubmitMessage({ type: 'error', text: '注册失败，请稍后重试' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
        用户注册
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 用户名字段 */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            用户名
          </label>
          <input
            id="username"
            type="text"
            {...register('username', {
              required: '用户名不能为空',
              minLength: { value: 3, message: '用户名至少需要3个字符' },
              maxLength: { value: 20, message: '用户名不能超过20个字符' },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: '用户名只能包含字母、数字和下划线',
              },
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入用户名"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* 密码字段 */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            密码
          </label>
          <input
            id="password"
            type="password"
            {...register('password', {
              required: '密码不能为空',
              minLength: { value: 6, message: '密码至少需要6个字符' },
              validate: (value) => {
                const strength = zxcvbn(value)
                return strength.score >= 2 || '密码强度太弱，请使用更复杂的密码'
              },
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入密码"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}

          {/* 密码强度指示器 */}
          {watchPassword && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">密码强度:</span>
                <span
                  className={`text-sm font-medium ${passwordStrength.color}`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordStrength.score === 0
                      ? 'bg-red-500'
                      : passwordStrength.score === 1
                        ? 'bg-orange-500'
                        : passwordStrength.score === 2
                          ? 'bg-yellow-500'
                          : passwordStrength.score === 3
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                />
              </div>
              {passwordStrength.feedback && (
                <p className="mt-1 text-xs text-gray-600">
                  {passwordStrength.feedback}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 确认密码字段 */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            确认密码
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', {
              required: '请确认密码',
              validate: (value) =>
                value === watchPassword || '两次输入的密码不一致',
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请再次输入密码"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          } text-white`}
        >
          {isSubmitting ? '注册中...' : '注册'}
        </button>

        {/* 提交结果提示 */}
        {submitMessage && (
          <div
            className={`p-3 rounded-md ${
              submitMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {submitMessage.text}
          </div>
        )}
      </form>

      {/* 登录链接 */}
      <div className="mt-6 text-center">
        <span className="text-sm text-gray-600">
          已有账号？{' '}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            立即登录
          </a>
        </span>
      </div>
    </div>
  )
}
