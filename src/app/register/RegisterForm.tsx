'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    mode: 'onChange',
  })

  const watchPassword = watch('password', '')

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
        // 延迟重定向，让用户看到成功消息
        setTimeout(() => {
          router.push('/login')
        }, 2000)
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
            用户名 <span className="text-red-500">*</span>
          </label>
          <input
            id="username"
            type="text"
            {...register('username', {
              required: '用户名不能为空',
              minLength: { value: 3, message: '用户名至少需要3个字符' },
              maxLength: { value: 20, message: '用户名不能超过20个字符' },
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入用户名"
            aria-describedby={errors.username ? 'username-error' : undefined}
          />
          {errors.username && (
            <p id="username-error" className="mt-1 text-sm text-red-500">
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
            密码 <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            {...register('password', {
              required: '密码不能为空',
              minLength: { value: 6, message: '密码至少需要6个字符' },
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入密码"
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* 确认密码字段 */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            确认密码 <span className="text-red-500">*</span>
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
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="mt-1 text-sm text-red-500">
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
          aria-describedby={submitMessage ? 'submit-message' : undefined}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              注册中...
            </span>
          ) : (
            '注册'
          )}
        </button>

        {/* 提交结果提示 */}
        {submitMessage && (
          <div
            id="submit-message"
            className={`p-3 rounded-md ${
              submitMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
            role="alert"
          >
            {submitMessage.text}
            {submitMessage.type === 'success' && (
              <p className="text-sm mt-1">即将跳转到登录页面...</p>
            )}
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
