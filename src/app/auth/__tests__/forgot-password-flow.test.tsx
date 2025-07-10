import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ForgotPasswordPage from '../forgot-password/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

describe('找回密码流程', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(fetch as jest.Mock).mockClear()
    mockPush.mockClear()
  })

  it('应该显示找回密码表单', () => {
    render(<ForgotPasswordPage />)
    
    expect(screen.getByText('找回密码')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('用户名')).toBeInTheDocument()
    expect(screen.getByText('发送验证码')).toBeInTheDocument()
  })

  it('应该处理用户名输入', () => {
    render(<ForgotPasswordPage />)
    
    const usernameInput = screen.getByPlaceholderText('用户名')
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    
    expect(usernameInput).toHaveValue('testuser')
  })

  it('应该成功发送找回密码请求', async () => {
    const mockResponse = {
      message: '验证码已生成',
      code: '123456',
      userId: 'user123',
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<ForgotPasswordPage />)
    
    const usernameInput = screen.getByPlaceholderText('用户名')
    const submitButton = screen.getByText('发送验证码')
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'testuser' }),
      })
    })

    await waitFor(() => {
      expect(screen.getByText('验证码已生成，请检查您的邮箱')).toBeInTheDocument()
    })

    // 验证跳转到验证码页面
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/verify-code?userId=user123&code=123456')
    }, { timeout: 3000 })
  })

  it('应该处理用户不存在的错误', async () => {
    const mockResponse = {
      error: '用户不存在',
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse,
    })

    render(<ForgotPasswordPage />)
    
    const usernameInput = screen.getByPlaceholderText('用户名')
    const submitButton = screen.getByText('发送验证码')
    
    fireEvent.change(usernameInput, { target: { value: 'nonexistent' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('用户不存在')).toBeInTheDocument()
    })
  })

  it('应该处理网络错误', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<ForgotPasswordPage />)
    
    const usernameInput = screen.getByPlaceholderText('用户名')
    const submitButton = screen.getByText('发送验证码')
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('网络错误，请重试')).toBeInTheDocument()
    })
  })

  it('应该显示加载状态', async () => {
    ;(fetch as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<ForgotPasswordPage />)
    
    const usernameInput = screen.getByPlaceholderText('用户名')
    const submitButton = screen.getByText('发送验证码')
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByText('发送中...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
}) 