'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

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
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          用户注册
        </CardTitle>
        <CardDescription className="text-center">
          请输入您的注册信息
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 用户名字段 */}
          <div className="space-y-2">
            <Label htmlFor="username">
              用户名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="请输入用户名"
              {...register('username', {
                required: '用户名不能为空',
                minLength: { value: 3, message: '用户名至少需3个字符' },
                maxLength: { value: 20, message: '用户名不能超过20个字符' },
              })}
              className={errors.username ? 'border-red-500' : ''}
              aria-describedby={errors.username ? 'username-error' : undefined}
            />
            {errors.username && (
              <p id="username-error" className="text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* 密码字段 */}
          <div className="space-y-2">
            <Label htmlFor="password">
              密码 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              {...register('password', {
                required: '密码不能为空',
                minLength: { value: 6, message: '密码至少需6个字符' },
              })}
              className={errors.password ? 'border-red-500' : ''}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* 确认密码字段 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              确认密码 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              {...register('confirmPassword', {
                required: '请确认密码',
                validate: (value) =>
                  value === watchPassword || '两次输入的密码不一致',
              })}
              className={errors.confirmPassword ? 'border-red-500' : ''}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            />
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* 提交按钮 */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                注册中...
              </>
            ) : (
              '注册'
            )}
          </Button>

          {/* 提交结果提示 */}
          {submitMessage && (
            <Alert variant={submitMessage.type === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>
                {submitMessage.text}
                {submitMessage.type === 'success' && (
                  <p className="text-sm mt-1">即将跳转到登录页面...</p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </form>

        {/* 登录链接 */}
        <div className="mt-6 text-center">
          <span className="text-sm text-muted-foreground">
            已有账号？{' '}
            <a
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              立即登录
            </a>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
