# 用户登录 API

## 概述

用户登录 API 提供了完整的用户身份验证功能，包括输入验证、密码验证、安全防护和JWT token生成。

## 端点

```
POST /api/login
```

## 请求体

```json
{
  "username": "string",
  "password": "string"
}
```

## 响应

### 成功响应 (200)

```json
{
  "success": true,
  "message": "登录成功",
  "user": {
    "id": "clusp1234567890",
    "username": "testuser",
    "createdAt": "2024-01-10T12:00:00.000Z",
    "updatedAt": "2024-01-10T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 输入验证错误 (400)

```json
{
  "success": false,
  "message": "用户名和密码不能为空"
}
```

### 认证失败 (401)

```json
{
  "success": false,
  "message": "用户名或密码错误，还有3次尝试机会"
}
```

### 账户锁定 (423)

```json
{
  "success": false,
  "message": "账户已被锁定，请在10分钟后重试"
}
```

### 服务器错误 (500)

```json
{
  "success": false,
  "message": "服务器内部错误，请稍后重试"
}
```

## 验证规则

### 用户名

- 不能为空
- 长度：3-20 个字符
- 只能包含字母、数字和下划线
- 必须在数据库中存在

### 密码

- 不能为空
- 最小长度：6 个字符
- 必须与数据库中存储的加密密码匹配

## 安全特性

### 1. 登录失败限制

- **最大尝试次数**: 5次
- **锁定时间**: 15分钟
- **计数逻辑**: 每次登录失败后增加失败计数
- **重置条件**: 登录成功后重置为0

### 2. 账户锁定机制

- 当失败次数达到5次时，账户将被锁定15分钟
- 锁定期间任何登录尝试都将被拒绝
- 锁定时间过期后自动解锁

### 3. 密码安全

- 使用bcrypt加密存储
- 登录时进行安全比对
- 不明文传输或存储密码

### 4. JWT Token

- 使用HS256算法签名
- 默认有效期：7天
- 包含用户ID和用户名信息

## 数据库更新

### 失败登录处理

当登录失败时，系统会更新用户记录：

```sql
UPDATE users SET 
  failedLoginCount = failedLoginCount + 1,
  lockedUntil = CASE 
    WHEN failedLoginCount + 1 >= 5 THEN datetime('now', '+15 minutes')
    ELSE NULL
  END
WHERE id = ?
```

### 成功登录处理

当登录成功时，系统会重置安全字段：

```sql
UPDATE users SET 
  failedLoginCount = 0,
  lockedUntil = NULL
WHERE id = ?
```

## 使用示例

### JavaScript/TypeScript

```typescript
const loginUser = async (username: string, password: string) => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (data.success) {
      // 保存token
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // 重定向到首页
      window.location.href = '/'
    } else {
      console.error('登录失败:', data.message)
    }
  } catch (error) {
    console.error('网络错误:', error)
  }
}
```

### cURL

```bash
# 成功登录
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"StrongPassword123!"}'

# 响应
{
  "success": true,
  "message": "登录成功",
  "user": {
    "id": "clusp1234567890",
    "username": "testuser",
    "createdAt": "2024-01-10T12:00:00.000Z",
    "updatedAt": "2024-01-10T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 错误处理

### 1. 输入验证错误

```bash
# 空用户名
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"","password":"password123"}'

# 响应: 400 Bad Request
{
  "success": false,
  "message": "用户名和密码不能为空"
}
```

### 2. 认证失败

```bash
# 错误密码
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"wrongpassword"}'

# 响应: 401 Unauthorized
{
  "success": false,
  "message": "用户名或密码错误，还有4次尝试机会"
}
```

### 3. 账户锁定

```bash
# 超过最大尝试次数
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"wrongpassword"}'

# 响应: 423 Locked
{
  "success": false,
  "message": "登录失败次数过多，账户已被锁定15分钟"
}
```

## 技术栈

- **框架**: Next.js 15 App Router
- **数据库**: SQLite + Prisma ORM
- **密码加密**: bcryptjs
- **JWT**: jsonwebtoken
- **验证**: 自定义验证函数

## 相关文件

- `src/app/api/login/route.ts` - API路由实现
- `src/lib/jwt.ts` - JWT工具函数
- `src/lib/auth.ts` - 认证工具函数
- `src/lib/validation.ts` - 输入验证函数
- `src/types/user.ts` - TypeScript类型定义
- `prisma/schema.prisma` - 数据库模式
- `middleware.ts` - Next.js中间件

## 测试

### 自动化测试

- 前端组件测试：11个测试用例
- 后端API测试：15个测试用例
- 覆盖率：输入验证、认证逻辑、安全特性、错误处理

### 手动测试

```bash
# 运行测试套件
npm test -- --testPathPatterns="login"

# 运行开发服务器
npm run dev

# 访问登录页面
http://localhost:3000/login
```

## 安全建议

1. **环境变量**: 在生产环境中设置强密码的JWT_SECRET
2. **HTTPS**: 在生产环境中强制使用HTTPS
3. **日志监控**: 记录和监控登录失败尝试
4. **双因子认证**: 考虑添加2FA增强安全性
5. **会话管理**: 实现自动登出机制

## 更新历史

- v1.0.0 - 基础登录功能实现
- v1.1.0 - 添加登录失败限制和账户锁定
- v1.2.0 - 完善错误处理和JWT token管理 