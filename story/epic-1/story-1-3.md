# 用户故事 1-3：用户登出

## 故事描述

作为一名已登录用户，我希望能够安全地退出系统，保护我的账户信息。

## 验收标准

- 用户可以在任意页面安全登出
- 登出后，用户会被重定向到登录页
- 登出后，用户的会话信息被清除

## 业务价值

- 提升系统安全性，防止账号被滥用
- 满足用户的基本安全需求

---

## 技术实现建议（Tech Lead）

- 前端：在用户界面提供登出按钮，调用登出 API
- 后端：使用 Supabase Auth 销毁会话
- 安全：登出后清除本地敏感信息

## 技术难点

- JWT token 的基本失效处理
- 用户状态的清理

## 测试建议

- 单元测试：登出 API、状态清理
- 集成测试：登出流程基本功能测试

---

## 详细实现步骤

### 前端实现步骤

1. **登出按钮组件**
   - 在导航栏或用户菜单中添加登出按钮
   - 创建 `components/common/logout-button.tsx`

2. **登出逻辑实现**
   - 创建 `lib/auth.ts` 中的登出 API 调用
   - 使用 Supabase Auth 进行登出
   - 清除本地存储的认证信息：
     - localStorage 中的 token
     - sessionStorage 中的用户数据

3. **状态清理**
   - 清除认证上下文中的用户状态
   - 重置 Supabase Auth 状态

4. **路由重定向**
   - 登出后重定向到登录页
   - 使用 Next.js router 实现页面跳转

5. **用户体验优化**
   - 显示登出成功提示
   - 添加加载状态指示器

### 后端实现步骤

1. **登出 API 端点**
   - 创建 `app/api/auth/logout/route.ts`
   - 使用 Supabase Auth 进行登出
   - 处理登出请求和响应

2. **会话清理**
   - 使用 Supabase Auth 清理用户会话
   - 清除服务器端会话数据

3. **基本日志记录**
   - 记录用户登出事件
   - 记录登出时间

### 数据库设计（Prisma Schema）

1. **用户活动日志表**
   ```prisma
   model UserActivityLog {
     id           String   @id @default(cuid())
     userId       String
     activityType String   // 'login', 'logout'
     createdAt    DateTime @default(now())
     
     @@map("user_activity_logs")
   }
   ```

### 中间件实现

1. **认证中间件更新**
   - 在认证中间件中检查用户状态
   - 拒绝使用已失效的 token

### 基本测试步骤

1. **API 测试**
   - 测试正常登出流程
   - 测试无效 token 登出

2. **前端测试**
   - 登出按钮功能测试
   - 状态清理测试
   - 路由重定向测试



