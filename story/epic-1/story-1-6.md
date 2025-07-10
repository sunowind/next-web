# 用户故事 1-6：删除用户

## 故事描述

作为一名管理员，我希望能够删除不再需要的用户账号，以维护系统的安全和数据的准确性。

## 验收标准

- 管理员可以在后台安全地删除用户账号
- 删除操作需二次确认，防止误删
- 删除后，相关数据按合规要求处理（如彻底删除或做标记）
- 记录删除操作的审计日志

## 业务价值

- 保证系统用户数据的准确性和安全性
- 满足合规和审计要求
- 维护系统资源的高效利用

---

## 技术实现建议（Tech Lead）

- 前端：后台管理界面提供删除用户操作，二次确认弹窗
- 后端：删除用户 API，支持软删除或彻底删除，合规处理数据
- 安全：权限校验，只有管理员可操作，实现审计日志

## 技术难点

- 数据删除的合规性（软删除/彻底删除）
- 关联数据的处理
- 权限控制的细粒度管理

## 测试建议

- 单元测试：删除 API、权限校验
- 集成测试：删除流程基本功能测试
- 安全测试：权限绕过防护测试

---

## 详细实现步骤

### 前端实现步骤

1. **用户管理页面**
   - 创建 `app/admin/users/page.tsx`
   - 创建 `components/admin/user-management.tsx`
   - 实现用户列表展示

2. **用户列表组件**
   - 显示用户基本信息：ID、用户名、邮箱、创建时间、状态
   - 添加操作列，包含编辑、删除按钮
   - 实现用户状态标识（活跃、禁用、已删除）

3. **删除确认对话框**
   - 创建 `components/common/delete-confirm-dialog.tsx`
   - 显示要删除的用户信息
   - 要求管理员输入确认文本（如"DELETE"）
   - 添加警告信息和风险提示

4. **权限控制**
   - 实现基于角色的访问控制（RBAC）
   - 只有管理员角色可以访问删除功能
   - 添加权限检查中间件

5. **操作反馈**
   - 显示删除操作进度
   - 成功删除后更新用户列表
   - 显示操作结果通知

6. **审计日志显示**
   - 在用户管理页面显示操作历史
   - 记录删除操作的执行人和时间
   - 提供操作回滚功能（可选）

### 后端实现步骤

1. **删除用户 API**
   - 创建 `app/api/admin/users/[id]/route.ts`
   - 验证管理员权限
   - 处理用户删除请求

2. **权限验证**
   - 实现管理员权限检查中间件
   - 验证用户是否有删除权限
   - 记录权限检查日志

3. **数据删除策略**
   - 实现软删除（推荐）：
     - 设置 `deletedAt` 时间戳
     - 设置 `isActive = false`
     - 保留数据用于审计
   - 或实现硬删除：
     - 彻底删除用户记录
     - 删除关联数据
     - 清理缓存

4. **关联数据处理**
   - 处理用户相关的所有数据：
     - 用户会话
     - 用户设置
     - 用户活动日志
     - 密码重置记录
   - 实现级联删除或标记删除

5. **数据合规处理**
   - 根据 GDPR 或其他法规要求处理数据
   - 实现数据保留策略
   - 提供数据导出功能（如需要）

6. **审计日志**
   - 记录删除操作详情
   - 保存操作前后的数据快照
   - 记录操作人和时间戳

### 数据库设计（Prisma Schema）

1. **用户表更新**
   ```prisma
   model User {
     id        String    @id @default(cuid())
     username  String    @unique @db.VarChar(20)
     email     String    @unique
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
     deletionType String   // 'soft', 'hard'
     deletionReason String?
     dataSnapshot Json?
     createdAt    DateTime @default(now())
     
     @@map("user_deletion_logs")
   }
   ```

3. **管理员权限表**
   ```prisma
   model AdminPermission {
     id             String    @id @default(cuid())
     userId         String
     permissionType String    // 'user_delete', 'user_manage'
     grantedBy      String?
     grantedAt      DateTime  @default(now())
     expiresAt      DateTime?
     isActive       Boolean   @default(true)
     
     @@map("admin_permissions")
   }
   ```

### 安全实现

1. **权限控制**
   - 实现细粒度的权限控制
   - 支持权限继承和委派
   - 实现权限审计和监控

2. **操作确认**
   - 要求二次确认删除操作
   - 实现操作超时机制
   - 添加操作撤销功能（在限定时间内）

3. **数据保护**
   - 防止误删除重要用户
   - 实现删除白名单机制
   - 添加删除限制规则

4. **审计和监控**
   - 记录所有删除操作
   - 监控异常删除行为
   - 实现删除操作告警

### 配置管理

1. **删除策略配置**
   ```env
   # 删除策略
   DEFAULT_DELETION_TYPE=soft
   HARD_DELETE_ENABLED=false
   DATA_RETENTION_DAYS=90
   
   # 权限配置
   ADMIN_ROLE_NAME=admin
   DELETE_CONFIRMATION_REQUIRED=true
   DELETE_CONFIRMATION_TIMEOUT=300 # 5分钟
   
   # 安全配置
   PROTECTED_USER_IDS=1,2,3
   MAX_DELETION_PER_DAY=10
   ```

2. **合规配置**
   - 配置数据保留期限
   - 设置删除通知要求
   - 配置审计日志保留策略

### 中间件实现

1. **权限中间件**
   - 验证用户权限
   - 检查操作限制
   - 记录权限检查日志

2. **审计中间件**
   - 记录操作日志
   - 保存数据快照
   - 实现操作追踪

3. **限流中间件**
   - 限制删除操作频率
   - 防止批量删除攻击
   - 实现操作配额管理

### 基本测试步骤

1. **API 测试**
   - 测试正常删除流程
   - 测试权限验证
   - 测试关联数据处理
   - 测试软删除/硬删除

2. **前端测试**
   - 用户列表显示测试
   - 删除确认对话框测试
   - 权限控制测试
   - 用户体验测试

3. **安全测试**
   - 权限绕过测试
   - 未授权访问测试
   - 批量删除防护测试
   - 数据泄露测试

### 监控和日志

1. **删除操作监控**
   - 监控删除操作频率
   - 监控删除操作成功率
   - 监控异常删除行为

2. **安全监控**
   - 监控权限使用情况
   - 监控异常操作模式
   - 监控数据保护状态

### 性能优化

1. **删除操作优化**
   - 优化关联数据处理
   - 实现批量删除优化
   - 优化审计日志记录

2. **数据库优化**
   - 使用索引优化查询
   - 实现数据清理策略
   - 优化存储空间使用

