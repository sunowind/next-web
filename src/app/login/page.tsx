import { LoginForm } from '@/app/login/LoginForm'
import { PublicRoute } from '@/components/auth/protected-route'

export default function LoginPage() {
  return (
    <PublicRoute>
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoginForm />
      </main>
    </PublicRoute>
  )
} 