# 用户故事 1-1：用户注册

## 故事描述

作为一名新用户，我希望能够通过注册页面创建一个新账号，以便能够访问系统功能。

## 验收标准

- 用户可以通过用户名和密码完成注册
- 注册时对用户名和密码进行基本校验
- 注册成功后，用户收到明确的注册成功提示
- 注册失败时，系统给出明确的错误提示

## 业务价值

- 为新用户提供基本的注册功能
- 建立用户数据基础

---

## 技术实现建议（Tech Lead）

- 前端：使用 React Hook Form 进行表单校验
- 后端：使用 Supabase Auth 进行用户认证
- 安全：防止重复注册，密码加密存储

## 技术难点

- 用户名唯一性校验
- 密码加密存储

## 测试建议

- 单元测试：表单校验、API 异常处理
- 集成测试：注册流程基本功能测试

---

## 详细实现步骤

### 前端实现步骤

1. **创建注册页面组件**
   - 创建 `app/auth/register/page.tsx`（Next.js App Router）
   - 创建 `components/auth/register-form.tsx` 组件
   - 使用 Shadcn UI 组件库设计界面

2. **表单设计与验证**
   - 使用 React Hook Form 创建表单
   - 添加字段：用户名、密码、确认密码
   - 实现基本表单验证：
     - 用户名：3-20字符
     - 密码：至少6字符
     - 确认密码：与密码一致

3. **UI/UX 优化**
   - 使用 Tailwind CSS 实现响应式设计
   - 添加加载状态指示器
   - 实现友好的错误提示

4. **API 集成**
   - 创建 `lib/auth.ts` 中的注册 API 调用
   - 使用 Supabase Auth 进行用户创建
   - 处理 API 响应和错误状态

### 后端实现步骤

1. **数据库设计（Prisma Schema）**
   ```prisma
   model User {
     id        String   @id @default(cuid())
     username  String   @unique @db.VarChar(20)
     password  String   // 加密后的密码
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     
     @@map("users")
   }
   ```

2. **Supabase Auth 配置**
   - 配置 Supabase 项目
   - 设置基本认证策略

3. **注册 API 端点**
   - 创建 `app/api/auth/register/route.ts`
   - 实现请求验证
   - 添加用户名唯一性检查
   - 使用 bcrypt 进行密码加密

4. **错误处理**
   - 定义标准错误响应格式
   - 实现基本的错误码和消息

### 基本测试步骤

1. **API 测试**
   - 测试正常注册流程
   - 测试重复用户名注册
   - 测试基本输入验证

2. **前端测试**
   - 表单验证测试
   - 错误处理测试
   - 基本用户体验测试

