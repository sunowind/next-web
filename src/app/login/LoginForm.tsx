'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LoginRequest, LoginResponse } from '@/types/user'

interface LoginFormData {
  username: string
  password: string
  rememberMe: boolean
}

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      })

      const result: LoginResponse = await response.json()

      if (result.success && result.token) {
        // 保存token到localStorage或sessionStorage
        const storage = data.rememberMe ? localStorage : sessionStorage
        storage.setItem('auth_token', result.token)
        storage.setItem('user', JSON.stringify(result.user))

        setSubmitMessage({ type: 'success', text: result.message })
        
        // 重定向到目标页面
        const urlParams = new URLSearchParams(window.location.search)
        const redirect = urlParams.get('redirect') || '/dashboard'
        
        // 延迟重定向，让用户看到成功消息
        setTimeout(() => {
          window.location.href = redirect
        }, 1500)
      } else {
        setSubmitMessage({ type: 'error', text: result.message })
      }
    } catch {
      setSubmitMessage({ type: 'error', text: '登录失败，请稍后重试' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
        用户登录
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
        </div>

        {/* 记住我选项 */}
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            {...register('rememberMe')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
            记住我
          </label>
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
          {isSubmitting ? '登录中...' : '登录'}
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

      {/* 注册链接 */}
      <div className="mt-6 text-center">
        <span className="text-sm text-gray-600">
          还没有账号？{' '}
          <a
            href="/register"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            立即注册
          </a>
        </span>
      </div>

      {/* 忘记密码链接 */}
      <div className="mt-2 text-center">
        <a
          href="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          忘记密码？
        </a>
      </div>
    </div>
  )
} 