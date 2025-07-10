# 用户故事 1-6：删除用户

## 故事描述

作为一名管理员，我希望能够删除不再需要的用户账号，以维护系统的安全。

## 验收标准

- 管理员可以在后台删除用户账号
- 删除操作需二次确认，防止误删
- 删除后，用户数据被标记为已删除
- 记录删除操作的基本日志

## 业务价值

- 保证系统用户数据的准确性
- 维护系统资源的高效利用

---

## 技术实现建议（Tech Lead）

- 前端：后台管理界面提供删除用户操作，二次确认弹窗
- 后端：删除用户 API，支持软删除，基本权限校验
- 安全：权限校验，只有管理员可操作

## 技术难点

- 数据删除的基本处理
- 权限控制

## 测试建议

- 单元测试：删除 API、权限校验
- 集成测试：删除流程基本功能测试

---

## 详细实现步骤

### 前端实现步骤

1. **用户管理页面**
   - 创建 `app/admin/users/page.tsx`
   - 创建 `components/admin/user-management.tsx`
   - 实现用户列表展示

2. **用户列表组件**
   - 显示用户基本信息：ID、用户名、创建时间、状态
   - 添加操作列，包含删除按钮
   - 实现用户状态标识（活跃、已删除）

3. **删除确认对话框**
   - 创建 `components/common/delete-confirm-dialog.tsx`
   - 显示要删除的用户信息
   - 要求管理员输入确认文本（如"DELETE"）
   - 添加基本警告信息

4. **权限控制**
   - 实现基本的权限检查
   - 只有管理员角色可以访问删除功能

5. **操作反馈**
   - 显示删除操作进度
   - 成功删除后更新用户列表
   - 显示操作结果通知

### 后端实现步骤

1. **删除用户 API**
   - 创建 `app/api/admin/users/[id]/route.ts`
   - 验证管理员权限
   - 处理用户删除请求

2. **权限验证**
   - 实现基本的管理员权限检查
   - 验证用户是否有删除权限

3. **数据删除策略**
   - 实现软删除：
     - 设置 `deletedAt` 时间戳
     - 设置 `isActive = false`
     - 保留数据用于基本审计

4. **基本日志记录**
   - 记录删除操作详情
   - 记录操作人和时间戳

### 数据库设计（Prisma Schema）

1. **用户表更新**
   ```prisma
   model User {
     id        String    @id @default(cuid())
     username  String    @unique @db.VarChar(20)
     password  String
     isActive  Boolean   @default(true)
     deletedAt DateTime?
     deletedBy String?
     createdAt DateTime  @default(now())
     updatedAt DateTime  @updatedAt
     
     @@map("users")
   }
   ```

2. **删除操作日志表**
   ```prisma
   model UserDeletionLog {
     id           String   @id @default(cuid())
     deletedUserId String
     deletedByUserId String
     deletionReason String?
     createdAt    DateTime @default(now())
     
     @@map("user_deletion_logs")
   }
   ```

### 基本测试步骤

1. **API 测试**
   - 测试正常删除流程
   - 测试权限验证
   - 测试软删除功能

2. **前端测试**
   - 用户列表显示测试
   - 删除确认对话框测试
   - 权限控制测试

