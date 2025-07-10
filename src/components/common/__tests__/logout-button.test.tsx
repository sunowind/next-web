import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LogoutButton } from '../logout-button'
import { useAuth } from '@/components/auth/auth-context'
import { clearAuth } from '@/lib/auth'

// Mock dependencies
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('@/components/auth/auth-context', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  clearAuth: jest.fn(),
}))

jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...args) => args.filter(Boolean).join(' ')),
}))

// Mock fetch
global.fetch = jest.fn()

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockClearAuth = clearAuth as jest.MockedFunction<typeof clearAuth>
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('LogoutButton', () => {
  const mockLogout = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock useAuth
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'testuser', createdAt: new Date(), updatedAt: new Date() },
      isLoading: false,
      login: jest.fn(),
      logout: mockLogout,
      isAuthenticated: true,
    })

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        removeItem: jest.fn(),
      },
      writable: true,
    })
  })

  it('renders logout button with default text', () => {
    render(<LogoutButton />)
    
    expect(screen.getByRole('button', { name: /退出登录/i })).toBeInTheDocument()
    expect(screen.getByText('退出登录')).toBeInTheDocument()
  })

  it('renders custom children text', () => {
    render(<LogoutButton>退出系统</LogoutButton>)
    
    expect(screen.getByRole('button', { name: /退出系统/i })).toBeInTheDocument()
    expect(screen.getByText('退出系统')).toBeInTheDocument()
  })

  it('shows loading state when logging out', async () => {
    mockFetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
    )

    render(<LogoutButton />)
    
    const button = screen.getByRole('button', { name: /退出登录/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('退出中...')).toBeInTheDocument()
    })
  })

  it('calls logout API and clears auth on successful logout', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })

    render(<LogoutButton />)
    
    const button = screen.getByRole('button', { name: /退出登录/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
      })
      expect(mockClearAuth).toHaveBeenCalled()
      expect(mockLogout).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('handles API failure gracefully', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Internal Server Error' })

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

    render(<LogoutButton />)
    
    const button = screen.getByRole('button', { name: /退出登录/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockClearAuth).toHaveBeenCalled()
      expect(mockLogout).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
      expect(consoleSpy).toHaveBeenCalledWith('登出API调用失败:', 'Internal Server Error')
    })

    consoleSpy.mockRestore()
  })

  it('handles network error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(<LogoutButton />)
    
    const button = screen.getByRole('button', { name: /退出登录/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockClearAuth).toHaveBeenCalled()
      expect(mockLogout).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
      expect(consoleSpy).toHaveBeenCalledWith('登出失败:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('calls onLogout callback when provided', async () => {
    const onLogoutMock = jest.fn()
    mockFetch.mockResolvedValueOnce({ ok: true })

    render(<LogoutButton onLogout={onLogoutMock} />)
    
    const button = screen.getByRole('button', { name: /退出登录/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(onLogoutMock).toHaveBeenCalled()
    })
  })

  it('handles missing auth token gracefully', async () => {
    // Mock localStorage to return null
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        removeItem: jest.fn(),
      },
      writable: true,
    })

    render(<LogoutButton />)
    
    const button = screen.getByRole('button', { name: /退出登录/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled()
      expect(mockClearAuth).toHaveBeenCalled()
      expect(mockLogout).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('applies custom className', () => {
    render(<LogoutButton className="custom-class" />)
    
    const button = screen.getByRole('button', { name: /退出登录/i })
    expect(button).toHaveClass('custom-class')
  })

  it('renders with custom variant prop', () => {
    render(<LogoutButton variant="outline" />)
    const button = screen.getByRole('button', { name: /退出登录/i })
    expect(button).toBeInTheDocument()
  })

  it('hides icon when showIcon is false', () => {
    render(<LogoutButton showIcon={false} />)
    
    const button = screen.getByRole('button', { name: /退出登录/i })
    // 检查没有LogOut图标
    expect(button.querySelector('svg')).not.toBeInTheDocument()
  })

  it('shows icon by default', () => {
    render(<LogoutButton />)
    
    const button = screen.getByRole('button', { name: /退出登录/i })
    // 检查有LogOut图标
    expect(button.querySelector('svg')).toBeInTheDocument()
  })
}) 