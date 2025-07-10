import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '../RegisterForm'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('renders all form fields correctly', () => {
    render(<RegisterForm />)

    expect(screen.getByText('用户注册')).toBeInTheDocument()
    expect(screen.getByLabelText('用户名 *')).toBeInTheDocument()
    expect(screen.getByLabelText('密码 *')).toBeInTheDocument()
    expect(screen.getByLabelText('确认密码 *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument()
    expect(screen.getByText('已有账号？')).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const submitButton = screen.getByRole('button', { name: '注册' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('用户名不能为空')).toBeInTheDocument()
      expect(screen.getByText('密码不能为空')).toBeInTheDocument()
      expect(screen.getByText('请确认密码')).toBeInTheDocument()
    })
  })

  it('validates username format', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const usernameInput = screen.getByLabelText('用户名 *')
    const submitButton = screen.getByRole('button', { name: '注册' })

    // Test too short username
    await user.type(usernameInput, 'ab')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('用户名至少需要3个字符')).toBeInTheDocument()
    })

    // Test too long username
    await user.clear(usernameInput)
    await user.type(usernameInput, 'a'.repeat(21))
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('用户名不能超过20个字符')).toBeInTheDocument()
    })
  })

  it('validates password requirements', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText('密码 *')
    const submitButton = screen.getByRole('button', { name: '注册' })

    // Test too short password
    await user.type(passwordInput, '12345')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('密码至少需要6个字符')).toBeInTheDocument()
    })
  })

  it('validates password confirmation', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText('密码 *')
    const confirmPasswordInput = screen.getByLabelText('确认密码 *')
    const submitButton = screen.getByRole('button', { name: '注册' })

    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'different123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      success: true,
      message: '注册成功！请使用新账号登录',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<RegisterForm />)

    const usernameInput = screen.getByLabelText('用户名 *')
    const passwordInput = screen.getByLabelText('密码 *')
    const confirmPasswordInput = screen.getByLabelText('确认密码 *')
    const submitButton = screen.getByRole('button', { name: '注册' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123',
        }),
      })
    })

    await waitFor(() => {
      expect(screen.getByText('注册成功！请使用新账号登录')).toBeInTheDocument()
      expect(screen.getByText('即将跳转到登录页面...')).toBeInTheDocument()
    })
  })

  it('handles registration failure', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      success: false,
      message: '用户名已存在',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<RegisterForm />)

    const usernameInput = screen.getByLabelText('用户名 *')
    const passwordInput = screen.getByLabelText('密码 *')
    const confirmPasswordInput = screen.getByLabelText('确认密码 *')
    const submitButton = screen.getByRole('button', { name: '注册' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('用户名已存在')).toBeInTheDocument()
    })
  })

  it('handles network error', async () => {
    const user = userEvent.setup()

    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<RegisterForm />)

    const usernameInput = screen.getByLabelText('用户名 *')
    const passwordInput = screen.getByLabelText('密码 *')
    const confirmPasswordInput = screen.getByLabelText('确认密码 *')
    const submitButton = screen.getByRole('button', { name: '注册' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('注册失败，请稍后重试')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()

    // Mock a slow response
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, message: '注册成功！请使用新账号登录' }),
      }), 100))
    )

    render(<RegisterForm />)

    const usernameInput = screen.getByLabelText('用户名 *')
    const passwordInput = screen.getByLabelText('密码 *')
    const confirmPasswordInput = screen.getByLabelText('确认密码 *')
    const submitButton = screen.getByRole('button', { name: '注册' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(submitButton)

    // Check loading state
    expect(screen.getByText('注册中...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})
