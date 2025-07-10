'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/components/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { ChangePasswordRequest, ChangePasswordResponse } from '@/types/user'

interface ChangePasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  
  const { token } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ChangePasswordFormData>()

  const newPassword = watch('newPassword')

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const requestData: ChangePasswordRequest = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      })

      const result: ChangePasswordResponse = await response.json()

      if (result.success) {
        setSubmitMessage({ type: 'success', text: result.message })
        reset() // 清除表单数据
      } else {
        setSubmitMessage({ type: 'error', text: result.message })
      }
    } catch {
      setSubmitMessage({ type: 'error', text: '修改密码失败，请稍后重试' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">修改密码</CardTitle>
        <CardDescription className="text-center">
          请输入当前密码和新密码来修改您的登录密码
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 当前密码字段 */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">当前密码</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="请输入当前密码"
                {...register('currentPassword', {
                  required: '当前密码不能为空',
                })}
                className={errors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* 新密码字段 */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">新密码</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="请输入新密码"
                {...register('newPassword', {
                  required: '新密码不能为空',
                  minLength: {
                    value: 6,
                    message: '新密码至少需要6个字符'
                  }
                })}
                className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword.message}</p>
            )}
            <p className="text-xs text-gray-500">
              密码要求：至少6个字符
            </p>
          </div>

          {/* 确认新密码字段 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认新密码</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="请再次输入新密码"
                {...register('confirmPassword', {
                  required: '请确认新密码',
                  validate: (value) => value === newPassword || '两次输入的密码不一致'
                })}
                className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
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
                修改中...
              </>
            ) : (
              '修改密码'
            )}
          </Button>

          {/* 提交结果提示 */}
          {submitMessage && (
            <Alert variant={submitMessage.type === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>{submitMessage.text}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  )
} 