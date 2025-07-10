# 用户故事 1-2：用户登录

## 故事描述

作为一名注册用户，我希望能够通过登录页面输入账号和密码，安全地访问我的个人信息和系统功能。

## 验收标准

- 用户可以通过用户名/邮箱和密码登录
- 登录时对账号和密码进行校验，防止未授权访问
- 登录失败时，系统给出明确的错误提示
- 支持记住我/自动登录功能
- 登录成功后重定向到合适的页面

## 业务价值

- 确保只有合法用户可以访问系统
- 提升用户体验，减少登录障碍
- 建立用户会话管理基础

---

## 技术实现建议（Tech Lead）

- 前端：使用 React Hook Form 实现登录表单，支持"记住我"功能
- 后端：使用 Supabase Auth 进行身份认证，JWT token 管理
- 安全：防止暴力破解，实现登录失败次数限制

## 技术难点

- JWT token 的安全存储与管理
- 防止暴力破解和自动化攻击
- 多设备会话管理

## 测试建议

- 单元测试：表单校验、API 异常处理
- 集成测试：登录流程基本功能测试
- 安全测试：暴力破解防护测试

---

## 详细实现步骤

### 前端实现步骤

1. **创建登录页面组件**
   - 创建 `app/auth/login/page.tsx`（Next.js App Router）
   - 创建 `components/auth/login-form.tsx` 组件
   - 使用 Shadcn UI 组件库设计界面

2. **表单设计与验证**
   - 使用 React Hook Form 创建登录表单
   - 添加字段：用户名/邮箱、密码
   - 实现表单验证：
     - 用户名/邮箱：必填，格式验证
     - 密码：必填，最小长度检查

3. **记住我功能**
   - 添加"记住我"复选框
   - 使用 secure cookie 存储登录状态
   - 实现自动登录逻辑

4. **状态管理**
   - 使用 Supabase Auth 管理用户状态
   - 创建 `lib/auth-context.tsx` 认证上下文
   - 实现登录状态持久化

5. **路由保护**
   - 创建 `components/auth/protected-route.tsx` 组件
   - 实现路由守卫逻辑
   - 未登录用户重定向到登录页

6. **错误处理与用户体验**
   - 显示登录失败错误信息
   - 添加加载状态指示器
   - 实现登录成功后的跳转逻辑

### 后端实现步骤

1. **Supabase Auth 配置**
   - 配置 Supabase 认证策略
   - 设置 JWT token 过期时间
   - 配置登录流程和重定向

2. **登录 API 端点**
   - 创建 `app/api/auth/login/route.ts`
   - 使用 Supabase Auth 进行用户认证
   - 生成 JWT token 并设置 cookie

3. **密码验证**
   - 使用 Supabase Auth 内置密码验证
   - 实现安全的密码比对
   - 防止时序攻击

4. **JWT Token 管理**
   - 使用 Supabase Auth 管理 JWT token
   - 设置合适的过期时间
   - 实现 token 刷新机制

5. **安全措施**
   - 实现登录失败次数限制
   - 添加 IP 地址记录
   - 实现账户锁定机制
   - 防止暴力破解攻击

6. **会话管理**
   - 使用 Supabase Auth 管理用户会话
   - 添加会话过期时间
   - 实现会话清理机制

### 数据库设计（Prisma Schema）

1. **用户表扩展**
   ```prisma
   model User {
     id        String   @id @default(cuid())
     username  String   @unique @db.VarChar(20)
     email     String   @unique
     password  String
     lastLogin DateTime?
     loginCount Int      @default(0)
     isActive  Boolean   @default(true)
     createdAt DateTime  @default(now())
     updatedAt DateTime  @updatedAt
     
     @@map("users")
   }
   ```

2. **登录失败记录表**
   ```prisma
   model LoginAttempt {
     id        String   @id @default(cuid())
     username  String
     ipAddress String
     success   Boolean  @default(false)
     createdAt DateTime @default(now())
     
     @@map("login_attempts")
   }
   ```

### 安全实现

1. **速率限制**
   - 使用 Redis 或内存存储实现速率限制
   - 限制登录尝试频率
   - 实现渐进式延迟

2. **密码策略**
   - 强制密码复杂度要求
   - 实现密码历史记录
   - 定期密码过期提醒

3. **审计日志**
   - 记录所有登录尝试
   - 记录成功和失败的登录
   - 实现安全事件监控

### 中间件实现

1. **认证中间件**
   - 创建 `middleware.ts` 进行路由保护
   - 验证 JWT token
   - 添加用户信息到请求上下文

2. **限流中间件**
   - 实现登录请求限流
   - 防止暴力破解攻击
   - 记录异常登录行为

### 基本测试步骤

1. **API 测试**
   - 测试正常登录流程
   - 测试错误凭据处理
   - 测试账户锁定机制
   - 测试 token 过期处理

2. **前端测试**
   - 表单验证测试
   - 记住我功能测试
   - 路由保护测试
   - 错误处理测试

3. **安全测试**
   - 暴力破解防护测试
   - XSS 和 CSRF 防护测试
   - Token 安全性测试
   - 会话管理测试

### 性能优化

1. **前端优化**
   - 使用 React Server Components 减少客户端 JavaScript
   - 实现表单字段懒加载
   - 优化认证状态管理

2. **后端优化**
   - 使用数据库索引优化查询
   - 实现缓存机制
   - 优化 JWT token 验证性能

### 监控和日志

1. **登录监控**
   - 监控登录成功率
   - 监控登录转化率
   - 监控异常登录行为

2. **安全监控**
   - 监控暴力破解尝试
   - 监控异常 IP 地址
   - 监控登录频率异常

