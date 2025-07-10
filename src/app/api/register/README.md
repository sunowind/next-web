# 用户注册 API

## 概述

用户注册 API 提供了完整的用户注册功能，包括输入验证、密码强度检查、密码加密和数据库存储。

## 端点

```
POST /api/register
```

## 请求体

```json
{
  "username": "string",
  "password": "string"
}
```

## 响应

### 成功响应 (201)

```json
{
  "success": true,
  "message": "注册成功",
  "user": {
    "username": "testuser"
  }
}
```

### 错误响应 (400)

```json
{
  "success": false,
  "message": "具体错误信息"
}
```

### 用户已存在 (409)

```json
{
  "success": false,
  "message": "用户名已存在"
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
- 必须唯一

### 密码

- 不能为空
- 最小长度：6 个字符
- 强度要求：使用 zxcvbn 检查，分数必须 ≥ 2

## 安全特性

1. **密码加密**：使用 bcrypt 加密，salt rounds = 12
2. **输入验证**：前后端双重验证
3. **错误处理**：统一错误响应格式
4. **数据库约束**：用户名唯一性约束

## 技术栈

- **框架**：Next.js 15 App Router
- **数据库**：SQLite + Prisma ORM
- **密码加密**：bcryptjs
- **密码强度检查**：zxcvbn
- **验证**：自定义验证函数

## 测试

### 手动测试结果

1. ✅ 成功注册新用户
2. ✅ 密码强度验证
3. ✅ 用户名重复检查
4. ✅ 输入验证
5. ✅ 错误处理

### 自动化测试

- 前端组件测试：12 个测试用例，全部通过
- 后端验证函数测试：17 个测试用例，全部通过
- 总测试覆盖率：29 个测试用例，全部通过

## 数据库结构

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 使用示例

```bash
# 成功注册
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"StrongPassword123!"}'

# 密码太弱
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'

# 用户名已存在
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"StrongPassword123!"}'
```
