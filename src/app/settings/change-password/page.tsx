import { ChangePasswordForm } from '@/components/settings/change-password-form'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    返回设置
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">修改密码</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <ChangePasswordForm />
        </main>
      </div>
    </ProtectedRoute>
  )
} 