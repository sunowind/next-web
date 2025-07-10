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
    
    // Clear localStorage
    localStorage.clear()
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

    expect(screen.getByText('用户登录')).toBeInTheDocument()
    expect(screen.getByLabelText('用户名')).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
    expect(screen.getByText('还没有账号？')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: '登录' })
    
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('用户名不能为空')).toBeInTheDocument()
      expect(screen.getByText('密码不能为空')).toBeInTheDocument()
    })
  })

  it('handles successful login', async () => {
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

    await act(async () => {
      await user.type(screen.getByLabelText('用户名'), 'testuser')
      await user.type(screen.getByLabelText('密码'), 'password123')
      await user.click(screen.getByRole('button', { name: '登录' }))
    })

    await waitFor(() => {
      expect(screen.getByText('登录成功')).toBeInTheDocument()
    })

    // Check that token is stored in localStorage
    expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token')

    // Advance timers to trigger navigation
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
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

    await act(async () => {
      await user.type(screen.getByLabelText('用户名'), 'testuser')
      await user.type(screen.getByLabelText('密码'), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: '登录' }))
    })

    await waitFor(() => {
      expect(screen.getByText('用户名或密码错误')).toBeInTheDocument()
    })

    // Check that no token is stored
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('handles network error', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    await act(async () => {
      await user.type(screen.getByLabelText('用户名'), 'testuser')
      await user.type(screen.getByLabelText('密码'), 'password123')
      await user.click(screen.getByRole('button', { name: '登录' }))
    })

    await waitFor(() => {
      expect(screen.getByText('登录失败，请稍后重试')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    // Mock a delayed response
    let resolvePromise: (value: unknown) => void
    const mockPromise = new Promise(resolve => {
      resolvePromise = resolve
    })
    
    mockFetch.mockImplementationOnce(() => mockPromise)

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    await act(async () => {
      await user.type(screen.getByLabelText('用户名'), 'testuser')
      await user.type(screen.getByLabelText('密码'), 'password123')
      await user.click(screen.getByRole('button', { name: '登录' }))
    })

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText('登录中...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '登录中...' })).toBeDisabled()
    })

    // Resolve the promise
    await act(async () => {
      resolvePromise!({
        json: async () => ({ success: false, message: 'Error' })
      })
    })
  })
}) 