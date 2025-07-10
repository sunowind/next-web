'use client'

import { useEffect, useState } from 'react'
import { getStoredAuth, AuthUser } from '@/lib/auth'
import { LogoutButton } from '@/components/common/logout-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-lg text-gray-700 dark:text-gray-300">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center space-y-4">
          <div className="text-lg text-red-600">未找到用户信息，请重新登录</div>
          <Button asChild>
            <a href="/login">前往登录</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">仪表盘</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-14 px-4 flex flex-col items-center">
        {/* Welcome Section */}
        <section className="w-full mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            欢迎回来，<span className="text-blue-600 dark:text-blue-400">{user.username}</span>！
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            这里是你的开发者仪表盘，专注于高效与极简。
          </p>
        </section>

        {/* User Info Grid */}
        <section className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <Card className="rounded-2xl shadow-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <CardHeader className="pb-1 border-b border-neutral-100 dark:border-neutral-800">
              <CardTitle className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">用户ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-mono text-gray-900 dark:text-gray-100 break-all pt-2 pb-1">{user.id}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <CardHeader className="pb-1 border-b border-neutral-100 dark:border-neutral-800">
              <CardTitle className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">用户名</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base text-gray-900 dark:text-gray-100 pt-2 pb-1">{user.username}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <CardHeader className="pb-1 border-b border-neutral-100 dark:border-neutral-800">
              <CardTitle className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">注册时间</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base text-gray-900 dark:text-gray-100 pt-2 pb-1">{new Date(user.createdAt).toLocaleDateString()}</div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="w-full">
          <div className="text-base font-bold text-neutral-700 dark:text-neutral-200 mb-4">快捷操作</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <a href="/profile" className="group block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-md p-6 text-center transition hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-8 h-8 text-blue-500 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="font-semibold text-gray-900 dark:text-gray-100">个人资料</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">查看和编辑信息</div>
              </div>
            </a>
            <a href="/settings" className="group block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-md p-6 text-center transition hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-8 h-8 text-green-500 group-hover:text-green-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="font-semibold text-gray-900 dark:text-gray-100">账户设置</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">密码与安全</div>
              </div>
            </a>
            <a href="/analytics" className="group block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-md p-6 text-center transition hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-8 h-8 text-purple-500 group-hover:text-purple-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className="font-semibold text-gray-900 dark:text-gray-100">数据分析</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">统计信息</div>
              </div>
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
