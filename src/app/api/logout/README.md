# 用户登出 API

## 概述

用户登出 API 提供了安全的用户退出功能，包括JWT token失效、会话清理和本地存储清除。

## 端点

```
POST /api/logout
```

## 请求头

```
Authorization: Bearer <token>
Content-Type: application/json
```

或者通过Cookie传递token：

```
Cookie: auth_token=<token>
```

## 响应

### 成功响应 (200)

```json
{
  "success": true,
  "message": "登出成功"
}
```

### 认证失败 (401)

```json
{
  "success": false,
  "message": "未找到有效的认证信息"
}
```

### 服务器错误 (500)

```json
{
  "success": false,
  "message": "服务器内部错误，请稍后重试"
}
```

## 安全特性

### 1. JWT Token失效

- 登出时自动将token加入黑名单
- 黑名单中的token无法通过验证
- 防止token被重复使用

### 2. 会话清理

- 清除服务器端会话数据
- 删除认证相关的cookie
- 清理本地存储的敏感信息

### 3. 双重验证

- 支持Authorization header和Cookie两种认证方式
- 自动检测并处理不同的token传递方式

## 使用示例

### JavaScript/TypeScript

```typescript
const logoutUser = async () => {
  try {
    const auth = getStoredAuth()
    
    if (!auth) {
      clearAuth()
      return { success: true, message: '已清除本地认证信息' }
    }

    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    
    // 清除本地存储
    clearAuth()
    
    if (result.success) {
      // 重定向到登录页
      window.location.href = '/login'
    }
    
    return result
  } catch (error) {
    console.error('登出失败:', error)
    // 即使API调用失败，也清除本地存储
    clearAuth()
    return { success: false, message: '登出失败，但已清除本地认证信息' }
  }
}
```

### cURL

```bash
# 使用Authorization header
curl -X POST http://localhost:3000/api/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"

# 使用Cookie
curl -X POST http://localhost:3000/api/logout \
  -H "Cookie: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

## 前端集成

### LogoutButton组件

```tsx
import { LogoutButton } from '@/components/logout-button'

function Header() {
  return (
    <header>
      <h1>我的应用</h1>
      <LogoutButton />
    </header>
  )
}
```

### 自定义样式

```tsx
<LogoutButton 
  className="custom-logout-btn"
  onLogout={() => console.log('用户已登出')}
>
  退出系统
</LogoutButton>
```

## 错误处理

### 1. 网络错误

```typescript
try {
  await logout()
} catch (error) {
  // 网络错误时，确保清除本地存储
  clearAuth()
  window.location.href = '/login'
}
```

### 2. API错误

```typescript
const result = await logout()
if (!result.success) {
  console.warn('登出API调用失败:', result.message)
  // 即使API失败，本地存储已被清除，可以安全重定向
}
```

## 技术实现

### JWT黑名单机制

```typescript
// 添加token到黑名单
blacklistToken(token)

// 验证时检查黑名单
export function verifyToken(token: string): JWTPayload | null {
  if (tokenBlacklist.has(token)) {
    return null
  }
  // ... 其他验证逻辑
}
```

### 自动清理

```typescript
// 定期清理过期的黑名单token
export function cleanupBlacklist(): void {
  const now = Date.now() / 1000
  for (const token of tokenBlacklist) {
    const decoded = jwt.decode(token) as JWTPayload
    if (decoded && decoded.exp && decoded.exp < now) {
      tokenBlacklist.delete(token)
    }
  }
}
```

## 测试

### 自动化测试

- API端点测试：5个测试用例
- 组件测试：8个测试用例
- 工具函数测试：12个测试用例
- 覆盖率：认证逻辑、错误处理、安全特性

### 手动测试

```bash
# 运行测试套件
npm test -- --testPathPattern="logout"

# 运行开发服务器
npm run dev

# 测试登出流程
1. 登录系统
2. 访问受保护页面
3. 点击登出按钮
4. 验证重定向到登录页
5. 尝试访问受保护页面（应该被重定向）
```

## 安全建议

1. **HTTPS**: 在生产环境中强制使用HTTPS
2. **Token过期**: 设置合理的JWT过期时间
3. **黑名单清理**: 定期清理过期的黑名单token
4. **日志监控**: 记录登出事件用于安全审计
5. **多设备登出**: 考虑实现"登出所有设备"功能

## 性能考虑

1. **内存使用**: 黑名单使用Set数据结构，O(1)查找
2. **清理策略**: 定期清理过期token，避免内存泄漏
3. **缓存策略**: 在生产环境中考虑使用Redis存储黑名单

## 相关文件

- `src/app/api/logout/route.ts` - API路由实现
- `src/lib/auth.ts` - 认证工具函数
- `src/lib/jwt.ts` - JWT工具函数（包含黑名单）
- `src/components/logout-button.tsx` - 登出按钮组件
- `src/types/user.ts` - TypeScript类型定义

## 更新历史

- v1.0.0 - 基础登出功能实现
- v1.1.0 - 添加JWT黑名单机制
- v1.2.0 - 完善错误处理和组件化 