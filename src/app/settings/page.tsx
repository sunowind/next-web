import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, User, Settings } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">账户设置</h1>
              <Link href="/dashboard">
                <Button variant="outline">返回仪表盘</Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* 修改密码卡片 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">修改密码</CardTitle>
                  </div>
                  <CardDescription>
                    更新您的登录密码以提升账户安全性
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/settings/change-password">
                    <Button className="w-full">
                      修改密码
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* 个人资料卡片 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">个人资料</CardTitle>
                  </div>
                  <CardDescription>
                    查看和编辑您的个人信息
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full">
                      查看资料
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* 安全设置卡片 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">安全设置</CardTitle>
                  </div>
                  <CardDescription>
                    管理您的账户安全选项
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    即将推出
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 