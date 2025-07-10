/* eslint-disable @typescript-eslint/no-unused-vars */
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { LoginForm } from '../LoginForm'
import { AuthProvider } from '@/components/auth/auth-context'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock setTimeout to avoid timing issues in tests
jest.useFakeTimers()

// Wrapper component for testing with AuthProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
    jest.clearAllTimers()
    
    // Clear localStorage and sessionStorage
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  it('renders all form elements correctly', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    expect(screen.getByRole('heading', { name: '用户登录' })).toBeInTheDocument()
    expect(screen.getByLabelText('用户名')).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toBeInTheDocument()
    expect(screen.getByLabelText('记住我')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
    expect(screen.getByText('还没有账号？')).toBeInTheDocument()
    expect(screen.getByText('忘记密码？')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: '登录' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('用户名不能为空')).toBeInTheDocument()
      expect(screen.getByText('密码不能为空')).toBeInTheDocument()
    })
  })

  it('validates username format', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const usernameInput = screen.getByLabelText('用户名')
    const submitButton = screen.getByRole('button', { name: '登录' })

    // Test short username
    await user.type(usernameInput, 'ab')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('用户名至少需要3个字符')).toBeInTheDocument()
    })

    // Test long username
    await user.clear(usernameInput)
    await user.type(usernameInput, 'a'.repeat(21))
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('用户名不能超过20个字符')).toBeInTheDocument()
    })

    // Test invalid characters
    await user.clear(usernameInput)
    await user.type(usernameInput, 'user@name')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('用户名只能包含字母、数字和下划线')).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText('密码')
    const submitButton = screen.getByRole('button', { name: '登录' })

    await user.type(passwordInput, '12345')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('密码至少需要6个字符')).toBeInTheDocument()
    })
  })

  it('handles successful login with sessionStorage (rememberMe unchecked)', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const mockResponse = {
      success: true,
      message: '登录成功',
      user: { id: '1', username: 'testuser', createdAt: new Date(), updatedAt: new Date() },
      token: 'mock-jwt-token'
    }

    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    await user.type(screen.getByLabelText('用户名'), 'testuser')
    await user.type(screen.getByLabelText('密码'), 'password123')
    await user.click(screen.getByRole('button', { name: '登录' }))

    await waitFor(() => {
      expect(screen.getByText('登录成功')).toBeInTheDocument()
    })

    // Check that token is stored in sessionStorage (rememberMe was false)
    expect(sessionStorage.getItem('auth_token')).toBe('mock-jwt-token')
    expect(localStorage.getItem('auth_token')).toBeNull()

    // Advance timers to trigger navigation
    act(() => {
      jest.advanceTimersByTime(1500)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('handles successful login with localStorage (rememberMe checked)', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const mockResponse = {
      success: true,
      message: '登录成功',
      user: { id: '1', username: 'testuser', createdAt: new Date(), updatedAt: new Date() },
      token: 'mock-jwt-token'
    }

    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    await user.type(screen.getByLabelText('用户名'), 'testuser')
    await user.type(screen.getByLabelText('密码'), 'password123')
    await user.click(screen.getByLabelText('记住我'))
    await user.click(screen.getByRole('button', { name: '登录' }))

    await waitFor(() => {
      expect(screen.getByText('登录成功')).toBeInTheDocument()
    })

    // Check that token is stored in localStorage (rememberMe was true)
    expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token')
    expect(sessionStorage.getItem('auth_token')).toBeNull()

    // Advance timers to trigger navigation
    act(() => {
      jest.advanceTimersByTime(1500)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('handles login failure', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const mockResponse = {
      success: false,
      message: '用户名或密码错误'
    }

    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    await user.type(screen.getByLabelText('用户名'), 'testuser')
    await user.type(screen.getByLabelText('密码'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: '登录' }))

    await waitFor(() => {
      expect(screen.getByText('用户名或密码错误')).toBeInTheDocument()
    })
  })

  it('handles network error', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    await user.type(screen.getByLabelText('用户名'), 'testuser')
    await user.type(screen.getByLabelText('密码'), 'password123')
    await user.click(screen.getByRole('button', { name: '登录' }))

    await waitFor(() => {
      expect(screen.getByText('登录失败，请稍后重试')).toBeInTheDocument()
    })
  })

  it('disables submit button during login process', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    let resolvePromise: () => void
    const mockPromise = new Promise<Response>((resolve) => {
      resolvePromise = () => resolve({
        json: async () => ({ success: true, message: '登录成功', token: 'token', user: {} }),
      } as Response)
    })

    mockFetch.mockImplementationOnce(() => mockPromise)

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    await user.type(screen.getByLabelText('用户名'), 'testuser')
    await user.type(screen.getByLabelText('密码'), 'password123')
    
    const submitButton = screen.getByRole('button', { name: '登录' })
    await user.click(submitButton)

    // Button should be disabled and show loading text
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '登录中...' })).toBeDisabled()
    })

    // Clean up by resolving the promise
    resolvePromise!()
  })

  it('handles redirect parameter correctly', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    // Mock URLSearchParams to return redirect parameter
    const mockGet = jest.fn().mockReturnValue('/profile')
    jest.spyOn(URLSearchParams.prototype, 'get').mockImplementation(mockGet)

    const mockResponse = {
      success: true,
      message: '登录成功',
      user: { id: '1', username: 'testuser', createdAt: new Date(), updatedAt: new Date() },
      token: 'mock-jwt-token'
    }

    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    await user.type(screen.getByLabelText('用户名'), 'testuser')
    await user.type(screen.getByLabelText('密码'), 'password123')
    await user.click(screen.getByRole('button', { name: '登录' }))

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(screen.getByText('登录成功')).toBeInTheDocument()
    })

    // Verify that URLSearchParams.get was called with 'redirect'
    expect(mockGet).toHaveBeenCalledWith('redirect')
    
    // Advance timers to trigger navigation
    act(() => {
      jest.advanceTimersByTime(1500)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile')
    })
  })

  it('sends correct request body', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const mockResponse = {
      success: true,
      message: '登录成功',
      user: { id: '1', username: 'testuser', createdAt: new Date(), updatedAt: new Date() },
      token: 'mock-jwt-token'
    }

    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    await user.type(screen.getByLabelText('用户名'), 'testuser')
    await user.type(screen.getByLabelText('密码'), 'password123')
    await user.click(screen.getByRole('button', { name: '登录' }))

    expect(mockFetch).toHaveBeenCalledWith('/api/login', {
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

  it('toggles password visibility', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText('密码') as HTMLInputElement
    const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button

    // Initially password should be hidden
    expect(passwordInput.type).toBe('password')

    // Click to show password
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('text')

    // Click to hide password again
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })
}) 