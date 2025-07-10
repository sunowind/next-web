'use client'

import { useEffect, useState } from 'react'
import { getStoredAuth, clearAuth, AuthUser } from '@/lib/auth'

export default function Dashboard() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getStoredAuth()
    if (auth) {
      setUser(auth.user)
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-600">未找到用户信息，请重新登录</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                欢迎回来，{user.username}！
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">用户ID：</span>
                  <span className="text-sm text-gray-900">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">用户名：</span>
                  <span className="text-sm text-gray-900">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">注册时间：</span>
                  <span className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">更新时间：</span>
                  <span className="text-sm text-gray-900">
                    {new Date(user.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                功能导航
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <a
                  href="/profile"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">个人资料</p>
                    <p className="text-sm text-gray-500">查看和编辑个人信息</p>
                  </div>
                </a>
                
                <a
                  href="/settings"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">账户设置</p>
                    <p className="text-sm text-gray-500">修改密码和安全设置</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 