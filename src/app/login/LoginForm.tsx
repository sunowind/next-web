'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { LoginResponse } from '@/types/user'
import { useAuth } from '@/components/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface LoginFormData {
  username: string
  password: string
}

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  
  const router = useRouter()
  const { login } = useAuth()

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

      if (result.success && result.token && result.user) {
        login(result.token, result.user)
        setSubmitMessage({ type: 'success', text: result.message })
        
        // 重定向到dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
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
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">用户登录</CardTitle>
        <CardDescription className="text-center">
          请输入您的账号信息进行登录
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 用户名字段 */}
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              type="text"
              placeholder="请输入用户名"
              {...register('username', {
                required: '用户名不能为空',
              })}
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* 密码字段 */}
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              {...register('password', {
                required: '密码不能为空',
              })}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </Button>

          {/* 提交结果提示 */}
          {submitMessage && (
            <Alert variant={submitMessage.type === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>{submitMessage.text}</AlertDescription>
            </Alert>
          )}
        </form>

        {/* 注册链接 */}
        <div className="mt-6 text-center">
          <span className="text-sm text-muted-foreground">
            还没有账号？{' '}
            <a
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              立即注册
            </a>
          </span>
        </div>

        {/* 找回密码链接 */}
        <div className="mt-2 text-center">
          <span className="text-sm text-muted-foreground">
            忘记密码？{' '}
            <a
              href="/auth/forgot-password"
              className="text-primary hover:underline font-medium"
            >
              找回密码
            </a>
          </span>
        </div>
      </CardContent>
    </Card>
  )
} 