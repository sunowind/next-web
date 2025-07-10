'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 检查本地存储中的认证信息
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('auth_token')
        const userStr = localStorage.getItem('user')

        if (token && userStr) {
          const userData = JSON.parse(userStr) as AuthUser
          setUser(userData)
        }
      } catch (error) {
        console.error('认证检查失败:', error)
        // 清除无效的认证信息
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 