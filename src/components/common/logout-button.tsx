'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { clearAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Loader2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoutButtonProps {
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  onLogout?: () => void
  showIcon?: boolean
}

export function LogoutButton({
  children = '退出登录',
  className,
  variant = 'destructive',
  size = 'default',
  onLogout,
  showIcon = true,
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      // 获取存储的认证信息
      const auth = localStorage.getItem('auth_token')
      
      if (auth) {
        // 调用登出API
        const response = await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          console.warn('登出API调用失败:', response.statusText)
        }
      }
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 无论API调用是否成功，都清除本地存储
      clearAuth()
      logout()
      
      // 调用自定义回调
      if (onLogout) {
        onLogout()
      }
      
      // 重定向到登录页
      router.push('/login')
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      variant={variant}
      size={size}
      className={cn(className)}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          退出中...
        </>
      ) : (
        <>
          {showIcon && <LogOut className="mr-2 h-4 w-4" />}
          {children}
        </>
      )}
    </Button>
  )
} 