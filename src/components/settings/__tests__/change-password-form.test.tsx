import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangePasswordForm } from '../change-password-form'
import { useAuth } from '@/components/auth/auth-context'

// Mock dependencies
jest.mock('@/components/auth/auth-context')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('ChangePasswordForm', () => {
  const mockToken = 'test-token'

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: mockToken,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false
    })

    // Mock fetch
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('表单渲染', () => {
    it('应该正确渲染表单字段', () => {
      render(<ChangePasswordForm />)

      expect(screen.getAllByText('修改密码')).toHaveLength(2) // 标题和按钮
      expect(screen.getByLabelText('当前密码')).toBeInTheDocument()
      expect(screen.getByLabelText('新密码')).toBeInTheDocument()
      expect(screen.getByLabelText('确认新密码')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '修改密码' })).toBeInTheDocument()
    })

    it('应该显示密码要求提示', () => {
      render(<ChangePasswordForm />)

      expect(screen.getByText('密码要求：至少6个字符')).toBeInTheDocument()
    })
  })

  describe('密码可见性切换', () => {
    it('应该能够切换当前密码的可见性', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      const currentPasswordInput = screen.getByLabelText('当前密码')
      const toggleButton = currentPasswordInput.parentElement?.querySelector('button')

      expect(currentPasswordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButton!)
      expect(currentPasswordInput).toHaveAttribute('type', 'text')

      await user.click(toggleButton!)
      expect(currentPasswordInput).toHaveAttribute('type', 'password')
    })

    it('应该能够切换新密码的可见性', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      const newPasswordInput = screen.getByLabelText('新密码')
      const toggleButton = newPasswordInput.parentElement?.querySelector('button')

      expect(newPasswordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButton!)
      expect(newPasswordInput).toHaveAttribute('type', 'text')

      await user.click(toggleButton!)
      expect(newPasswordInput).toHaveAttribute('type', 'password')
    })

    it('应该能够切换确认密码的可见性', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      const confirmPasswordInput = screen.getByLabelText('确认新密码')
      const toggleButton = confirmPasswordInput.parentElement?.querySelector('button')

      expect(confirmPasswordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButton!)
      expect(confirmPasswordInput).toHaveAttribute('type', 'text')

      await user.click(toggleButton!)
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('表单验证', () => {
    it('应该显示错误当当前密码为空', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      const submitButton = screen.getByRole('button', { name: '修改密码' })
      await user.click(submitButton)

      expect(screen.getByText('当前密码不能为空')).toBeInTheDocument()
    })

    it('应该显示错误当新密码为空', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      const currentPasswordInput = screen.getByLabelText('当前密码')
      const submitButton = screen.getByRole('button', { name: '修改密码' })

      await user.type(currentPasswordInput, 'oldpass123')
      await user.click(submitButton)

      expect(screen.getByText('新密码不能为空')).toBeInTheDocument()
    })

    it('应该显示错误当新密码长度不足', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      const currentPasswordInput = screen.getByLabelText('当前密码')
      const newPasswordInput = screen.getByLabelText('新密码')
      const submitButton = screen.getByRole('button', { name: '修改密码' })

      await user.type(currentPasswordInput, 'oldpass123')
      await user.type(newPasswordInput, '12345')
      await user.click(submitButton)

      expect(screen.getByText('新密码至少需要6个字符')).toBeInTheDocument()
    })

    it('应该显示错误当确认密码为空', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      const currentPasswordInput = screen.getByLabelText('当前密码')
      const newPasswordInput = screen.getByLabelText('新密码')
      const submitButton = screen.getByRole('button', { name: '修改密码' })

      await user.type(currentPasswordInput, 'oldpass123')
      await user.type(newPasswordInput, 'newpass123')
      await user.click(submitButton)

      expect(screen.getByText('请确认新密码')).toBeInTheDocument()
    })

    it('应该显示错误当确认密码与新密码不一致', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      const currentPasswordInput = screen.getByLabelText('当前密码')
      const newPasswordInput = screen.getByLabelText('新密码')
      const confirmPasswordInput = screen.getByLabelText('确认新密码')
      const submitButton = screen.getByRole('button', { name: '修改密码' })

      await user.type(currentPasswordInput, 'oldpass123')
      await user.type(newPasswordInput, 'newpass123')
      await user.type(confirmPasswordInput, 'differentpass123')
      await user.click(submitButton)

      expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument()
    })
  })

  describe('表单提交', () => {
    it('应该成功提交表单并显示成功消息', async () => {
      const user = userEvent.setup()
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: '密码修改成功'
        })
      } as Response)

      render(<ChangePasswordForm />)

      const currentPasswordInput = screen.getByLabelText('当前密码')
      const newPasswordInput = screen.getByLabelText('新密码')
      const confirmPasswordInput = screen.getByLabelText('确认新密码')
      const submitButton = screen.getByRole('button', { name: '修改密码' })

      await user.type(currentPasswordInput, 'oldpass123')
      await user.type(newPasswordInput, 'newpass123')
      await user.type(confirmPasswordInput, 'newpass123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify({
            currentPassword: 'oldpass123',
            newPassword: 'newpass123'
          })
        })
      })

      await waitFor(() => {
        expect(screen.getByText('密码修改成功')).toBeInTheDocument()
      })
    })

    it('应该显示错误消息当API返回错误', async () => {
      const user = userEvent.setup()
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          message: '当前密码不正确'
        })
      } as Response)

      render(<ChangePasswordForm />)

      const currentPasswordInput = screen.getByLabelText('当前密码')
      const newPasswordInput = screen.getByLabelText('新密码')
      const confirmPasswordInput = screen.getByLabelText('确认新密码')
      const submitButton = screen.getByRole('button', { name: '修改密码' })

      await user.type(currentPasswordInput, 'wrongpass123')
      await user.type(newPasswordInput, 'newpass123')
      await user.type(confirmPasswordInput, 'newpass123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('当前密码不正确')).toBeInTheDocument()
      })
    })

    it('应该显示错误消息当网络请求失败', async () => {
      const user = userEvent.setup()
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(<ChangePasswordForm />)

      const currentPasswordInput = screen.getByLabelText('当前密码')
      const newPasswordInput = screen.getByLabelText('新密码')
      const confirmPasswordInput = screen.getByLabelText('确认新密码')
      const submitButton = screen.getByRole('button', { name: '修改密码' })

      await user.type(currentPasswordInput, 'oldpass123')
      await user.type(newPasswordInput, 'newpass123')
      await user.type(confirmPasswordInput, 'newpass123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('修改密码失败，请稍后重试')).toBeInTheDocument()
      })
    })

    it('应该在提交时显示加载状态', async () => {
      const user = userEvent.setup()
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      
      // 延迟响应以测试加载状态
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({
              success: true,
              message: '密码修改成功'
            })
          } as Response), 100)
        )
      )

      render(<ChangePasswordForm />)

      const currentPasswordInput = screen.getByLabelText('当前密码')
      const newPasswordInput = screen.getByLabelText('新密码')
      const confirmPasswordInput = screen.getByLabelText('确认新密码')
      const submitButton = screen.getByRole('button', { name: '修改密码' })

      await user.type(currentPasswordInput, 'oldpass123')
      await user.type(newPasswordInput, 'newpass123')
      await user.type(confirmPasswordInput, 'newpass123')
      await user.click(submitButton)

      expect(screen.getByText('修改中...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('应该在成功提交后清除表单', async () => {
      const user = userEvent.setup()
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: '密码修改成功'
        })
      } as Response)

      render(<ChangePasswordForm />)

      const currentPasswordInput = screen.getByLabelText('当前密码')
      const newPasswordInput = screen.getByLabelText('新密码')
      const confirmPasswordInput = screen.getByLabelText('确认新密码')
      const submitButton = screen.getByRole('button', { name: '修改密码' })

      await user.type(currentPasswordInput, 'oldpass123')
      await user.type(newPasswordInput, 'newpass123')
      await user.type(confirmPasswordInput, 'newpass123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('密码修改成功')).toBeInTheDocument()
      })

      // 验证表单被清除
      expect(currentPasswordInput).toHaveValue('')
      expect(newPasswordInput).toHaveValue('')
      expect(confirmPasswordInput).toHaveValue('')
    })
  })
}) 