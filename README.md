# Next.js SaaS Project

## 项目简介

本项目是一个现代化的 SaaS（软件即服务）应用模板，适用于快速搭建多租户、权限管理、数据管理等场景。旨在帮助开发者高效构建高质量的 Web 应用。

---

### 技术栈

- **Next.js**  – React 服务器端渲染与静态站点生成
- **TypeScript**  – 类型安全的 JavaScript 超集
- **Tailwind CSS**  – 实用优先的 CSS 框架
- **Shadcn UI**  – 现代化 UI 组件库
- **Prisma**  – 现代数据库 ORM
- **Supabase**  – 后端即服务（BaaS），提供认证、数据库等
- **Vercel**  – 云端部署平台

---

## 主要特性

- **用户管理**：支持注册、登录、资料编辑、用户列表等
- **数据管理**：可扩展的数据模型与管理界面
- **认证与授权**：集成 Supabase，支持 OAuth、邮箱登录等
- **基于角色的访问控制（RBAC）**：灵活配置不同角色的权限
- **仪表盘**：可视化数据与操作入口
- **Markdown 编辑器**：核心功能，支持富文本编辑与预览

---

## 环境要求

- Node.js >= 18.x
- npm >= 9.x
- 推荐使用 VSCode + Prettier + ESLint

---

## 环境变量与配置

1. 复制 `.env.example` 为 `.env.local`，并根据实际情况填写：
   - `DATABASE_URL`（Prisma 数据库连接）
   - `SUPABASE_URL`、`SUPABASE_ANON_KEY`（Supabase 配置）
   - 其他相关密钥
2. 如需部署到 Vercel，确保在 Vercel 控制台配置上述环境变量。

---

## 安装与启动

1. **安装依赖：**
   ```bash
   npm install
   ```
2. **本地开发：**
   ```bash
   npm run dev
   ```
   打开 [http://localhost:3000](http://localhost:3000) 查看应用。
3. **数据库迁移（如有）：**
   ```bash
   npx prisma migrate dev
   ```

---

## 常用脚本

- `npm run dev` – 启动开发服务器
- `npm run build` – 构建生产包
- `npm run start` – 启动生产环境
- `npm run lint` – 代码检查
- `npm run format` – 代码格式化
- `npx prisma studio` – Prisma 可视化数据库管理

---

## 项目结构

```text
src/app/      # 主应用代码
public/       # 静态资源
story/        # 用户故事与文档
```

---

## 常见问题（FAQ）

**Q: 如何更换数据库？**  
A: 修改 `.env.local` 中的 `DATABASE_URL`，并运行 `npx prisma migrate dev`。

**Q: Supabase 如何配置？**  
A: 在 Supabase 控制台获取 URL 和 Key，填入 `.env.local`。

**Q: 如何添加新页面？**  
A: 在 `src/app/` 下新增对应的页面文件即可。

---
