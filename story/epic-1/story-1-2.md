# 用户故事 1-2：用户登录

## 故事描述

作为一名注册用户，我希望能够通过登录页面输入账号和密码，安全地访问系统功能。

## 验收标准

- 用户可以通过用户名和密码登录
- 登录时对账号和密码进行校验
- 登录失败时，系统给出明确的错误提示
- 登录成功后重定向到合适的页面

## 业务价值

- 确保只有合法用户可以访问系统
- 提供基本的用户身份验证

---

## 技术实现建议（Tech Lead）

- 前端：使用 React Hook Form 实现登录表单
- 后端：使用 身份认证
- 安全：基本的密码验证

## 技术难点

- JWT token 的基本管理
- 用户身份验证

## 测试建议

- 单元测试：表单校验、API 异常处理
- 集成测试：登录流程基本功能测试

---

## 详细实现步骤

### 前端实现步骤

1. **创建登录页面组件**
   - 创建 `app/auth/login/page.tsx`（Next.js App Router）
   - 创建 `components/auth/login-form.tsx` 组件
   - 使用 Shadcn UI 组件库设计界面

2. **表单设计与验证**
   - 使用 React Hook Form 创建登录表单
   - 添加字段：用户名、密码
   - 实现基本表单验证：
     - 用户名：必填
     - 密码：必填

3. **状态管理**
   - 使用 Supabase Auth 管理用户状态
   - 创建 `lib/auth-context.tsx` 认证上下文

4. **路由保护**
   - 创建 `components/auth/protected-route.tsx` 组件
   - 实现基本路由守卫逻辑
   - 未登录用户重定向到登录页

5. **错误处理与用户体验**
   - 显示登录失败错误信息
   - 添加加载状态指示器
   - 实现登录成功后的跳转逻辑

### 后端实现步骤

1. **Supabase Auth 配置**
   - 配置 Supabase 认证策略
   - 设置基本 JWT token 过期时间

2. **登录 API 端点**
   - 创建 `app/api/auth/login/route.ts`
   - 使用 Supabase Auth 进行用户认证
   - 生成 JWT token

3. **密码验证**
   - 使用 Supabase Auth 内置密码验证
   - 实现基本的密码比对

4. **JWT Token 管理**
   - 使用 Supabase Auth 管理 JWT token
   - 设置合适的过期时间

### 数据库设计（Prisma Schema）

1. **用户表扩展**
   ```prisma
   model User {
     id        String   @id @default(cuid())
     username  String   @unique @db.VarChar(20)
     password  String
     lastLogin DateTime?
     createdAt DateTime  @default(now())
     updatedAt DateTime  @updatedAt
     
     @@map("users")
   }
   ```

### 中间件实现

1. **认证中间件**
   - 创建 `middleware.ts` 进行路由保护
   - 验证 JWT token
   - 添加用户信息到请求上下文

### 基本测试步骤

1. **API 测试**
   - 测试正常登录流程
   - 测试错误凭据处理
   - 测试基本 token 验证

2. **前端测试**
   - 表单验证测试
   - 路由保护测试
   - 错误处理测试

