# 用户故事 1-5：修改密码

## 故事描述

作为一名已登录用户，我希望能够在个人设置中修改我的登录密码，以提升账户安全性。

## 验收标准

- 用户可以在个人中心/设置页面修改密码
- 修改密码时需验证旧密码，防止被他人篡改
- 新密码需符合安全要求（如长度、复杂度）
- 修改成功后，系统提示用户并可选择重新登录

## 业务价值

- 提升账户安全性，防止密码泄露风险
- 满足用户对安全的自主需求
- 建立密码安全策略基础

---

## 技术实现建议（Tech Lead）

- 前端：使用 React Hook Form 提供修改密码表单，需验证旧密码
- 后端：使用 Supabase Auth 校验旧密码，更新新密码，强密码校验
- 安全：修改密码后可选强制重新登录，实现密码历史检查

## 技术难点

- 旧密码校验的安全性
- 密码强度策略的实现
- 修改后会话管理
- 密码历史记录管理

## 测试建议

- 单元测试：密码校验、API 异常处理
- 集成测试：密码修改流程基本功能测试
- 安全测试：密码策略验证测试

---

## 详细实现步骤

### 前端实现步骤

1. **修改密码页面**
   - 创建 `app/settings/change-password/page.tsx`
   - 创建 `components/settings/change-password-form.tsx`
   - 使用 Shadcn UI 组件库设计界面

2. **表单设计**
   - 创建包含以下字段的表单：
     - 当前密码（必填）
     - 新密码（必填）
     - 确认新密码（必填）
   - 使用 React Hook Form 进行表单管理

3. **密码强度检测**
   - 集成 `zxcvbn` 进行密码强度检测
   - 实时显示密码强度指示器
   - 提供密码强度建议

4. **表单验证**
   - 验证当前密码不为空
   - 验证新密码符合安全要求：
     - 最小长度（8-12字符）
     - 包含大小写字母、数字、特殊字符
     - 不能与当前密码相同
   - 验证确认密码与新密码一致

5. **用户体验优化**
   - 添加密码可见性切换
   - 显示密码要求提示
   - 添加加载状态指示器
   - 实现友好的错误提示

6. **成功处理**
   - 显示修改成功提示
   - 提供重新登录选项
   - 清除表单数据
   - 可选的重定向到登录页

### 后端实现步骤

1. **修改密码 API**
   - 创建 `app/api/auth/change-password/route.ts`
   - 验证用户身份和权限
   - 处理密码修改请求

2. **旧密码验证**
   - 使用 Supabase Auth 验证当前密码
   - 实现安全的密码比对
   - 防止时序攻击

3. **新密码验证**
   - 验证新密码强度
   - 检查密码历史（防止重复使用）
   - 验证密码复杂度要求

4. **密码更新**
   - 使用 Supabase Auth 更新密码
   - 更新数据库中的密码信息
   - 记录密码修改时间

5. **会话管理**
   - 可选择使当前会话失效
   - 强制用户重新登录
   - 清除相关缓存

6. **安全审计**
   - 记录密码修改事件
   - 记录修改时间和 IP 地址
   - 保存安全审计日志

### 数据库设计（Prisma Schema）

1. **密码历史表**
   ```prisma
   model PasswordHistory {
     id        String   @id @default(cuid())
     userId    String
     password  String   // 加密存储
     createdAt DateTime @default(now())
     
     @@map("password_history")
   }
   ```

2. **用户设置表**
   ```prisma
   model UserSettings {
     id                              String @id @default(cuid())
     userId                          String @unique
     requireReloginOnPasswordChange Boolean @default(true)
     passwordChangeNotification     Boolean @default(true)
     createdAt                       DateTime @default(now())
     updatedAt                       DateTime @updatedAt
     
     @@map("user_settings")
   }
   ```

3. **安全事件日志表**
   ```prisma
   model SecurityEvent {
     id        String   @id @default(cuid())
     userId    String
     eventType String   // 'password_change', 'login', 'logout'
     ipAddress String?
     userAgent String?
     success   Boolean  @default(true)
     createdAt DateTime @default(now())
     
     @@map("security_events")
   }
   ```

### 安全实现

1. **密码策略**
   - 实现可配置的密码复杂度要求
   - 防止使用常见密码
   - 实现密码历史检查

2. **会话安全**
   - 可选择使所有活跃会话失效
   - 实现设备级别的会话管理
   - 提供会话活动监控

3. **防暴力破解**
   - 限制密码修改尝试次数
   - 实现账户临时锁定
   - 添加验证码验证

4. **审计和监控**
   - 记录所有密码修改尝试
   - 监控异常密码修改行为
   - 实现安全事件告警

### 配置管理

1. **密码策略配置**
   ```env
   # 密码策略
   MIN_PASSWORD_LENGTH=8
   MAX_PASSWORD_LENGTH=50
   REQUIRE_UPPERCASE=true
   REQUIRE_LOWERCASE=true
   REQUIRE_NUMBERS=true
   REQUIRE_SPECIAL_CHARS=true
   PASSWORD_HISTORY_SIZE=5
   
   # 安全设置
   FORCE_RELOGIN_ON_PASSWORD_CHANGE=true
   PASSWORD_CHANGE_NOTIFICATION=true
   MAX_PASSWORD_CHANGE_ATTEMPTS=3
   ```

2. **密码强度配置**
   - 配置密码复杂度要求
   - 设置密码历史保留数量
   - 配置常见密码黑名单

### 中间件实现

1. **认证中间件**
   - 验证用户登录状态
   - 检查用户权限
   - 处理认证失败情况

2. **密码策略中间件**
   - 验证密码复杂度
   - 检查密码历史
   - 应用密码策略规则

### 基本测试步骤

1. **API 测试**
   - 测试正常密码修改流程
   - 测试旧密码错误情况
   - 测试新密码不符合要求
   - 测试未授权访问

2. **前端测试**
   - 表单验证测试
   - 密码强度检测测试
   - 用户体验测试
   - 错误处理测试

3. **安全测试**
   - 密码策略验证测试
   - 会话管理测试
   - 暴力破解防护测试
   - 审计日志测试

### 监控和告警

1. **密码修改监控**
   - 监控密码修改频率
   - 监控密码修改成功率
   - 监控异常密码修改行为

2. **安全事件告警**
   - 监控异常密码修改尝试
   - 监控暴力破解行为
   - 监控安全策略违规

### 性能优化

1. **密码验证优化**
   - 优化密码哈希计算
   - 实现密码历史缓存
   - 优化数据库查询性能

2. **会话管理优化**
   - 优化会话清理逻辑
   - 实现智能缓存失效
   - 减少不必要的数据库操作

