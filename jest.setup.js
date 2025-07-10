import 'whatwg-fetch'
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Add fetch polyfill for Node.js environment
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock fetch for testing (will be overridden in individual tests)
global.fetch = jest.fn()

// Mock Next.js modules
jest.mock('next/server', () => {
  class MockResponse {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new Map(Object.entries(init.headers || {}))
      this.ok = this.status >= 200 && this.status < 300
    }

    json() {
      return Promise.resolve(this.body)
    }

    text() {
      return Promise.resolve(JSON.stringify(this.body))
    }
  }

  class MockNextRequest {
    constructor(url, init = {}) {
      this.url = url
      this.method = init.method || 'GET'
      this.headers = new Map(Object.entries(init.headers || {}))
      this.body = init.body || null
    }

    json() {
      return Promise.resolve(this.body ? JSON.parse(this.body) : {})
    }

    text() {
      return Promise.resolve(this.body || '')
    }
  }

  const NextResponse = {
    json: jest.fn((data, init = {}) => {
      return new MockResponse(data, init)
    }),
    redirect: jest.fn((url, init = {}) => {
      return new MockResponse(null, { ...init, status: 302, headers: { Location: url } })
    }),
    next: jest.fn(() => {
      return new MockResponse(null, { status: 200 })
    }),
    rewrite: jest.fn((url) => {
      return new MockResponse(null, { status: 200, headers: { 'x-rewrite-url': url } })
    })
  }

  return {
    NextResponse,
    NextRequest: MockNextRequest
  }
})

// Mock localStorage
const localStorageMock = (() => {
  let store = {}

  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn(key => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {}

  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn(key => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Setup basic Web APIs for server-side testing
if (typeof globalThis.TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})

// 屏蔽 console.error 日志
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    // 只屏蔽特定的错误信息，保留其他错误
    if (
      typeof args[0] === 'string' && 
      (args[0].includes('找回密码错误:') ||
       args[0].includes('重置密码错误:') ||
       args[0].includes('验证码验证错误:') ||
       args[0].includes('登录API错误:') ||
       args[0].includes('修改密码错误:') ||
       args[0].includes('认证检查失败:'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
