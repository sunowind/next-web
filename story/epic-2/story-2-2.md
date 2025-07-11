# 用户故事 2-2：基础预览功能

## 故事描述

作为一名内容创作者，我希望在编辑Markdown时能够看到渲染效果，以便了解格式是否正确。

## 验收标准

- [ ] 编辑内容时，预览区域能够更新
- [ ] 预览更新基本及时（< 500ms）
- [ ] 预览区域支持滚动查看
- [ ] 预览内容与编辑内容对应
- [ ] TipTap编辑器内容能够实时转换为Markdown预览

## 业务价值

- 提供基本的预览功能
- 帮助用户确认格式
- 提升编辑体验

---

## 技术实现建议（Tech Lead）

- 前端：使用React hooks + TipTap编辑器 + Markdown扩展
- 编辑器：使用TipTap的Markdown扩展和导出功能
- 后端：无需后端，纯前端实现
- 安全：TipTap内置XSS防护

## 技术难点

- 实时预览的性能优化
- TipTap内容与Markdown格式的转换
- 防抖处理避免频繁更新

## 测试建议

- 单元测试：TipTap内容转换功能测试
- 集成测试：实时预览功能测试

---

## 详细实现步骤

### 前端实现步骤

1. **集成TipTap Markdown扩展**
   - 安装 `@tiptap/extension-markdown` 扩展
   - 配置TipTap编辑器支持Markdown导入导出
   - 创建 `lib/tiptap-config.ts` 配置文件

2. **实现实时预览**
   - 使用TipTap的 `onUpdate` 回调监听内容变化
   - 使用 `editor.storage.markdown.getMarkdown()` 获取Markdown内容
   - 实现防抖处理（500ms延迟）

3. **预览区域优化**
   - 使用 `react-markdown` 渲染TipTap导出的Markdown
   - 添加基本的CSS样式
   - 实现滚动同步（可选）

4. **性能优化**
   - 使用 `useMemo` 缓存转换结果
   - 实现防抖避免频繁转换
   - 添加加载状态指示

### 后端实现步骤

无需后端实现，纯前端功能。

### 基本测试步骤

1. **TipTap转换测试**
   - 测试富文本到Markdown转换
   - 测试特殊字符处理
   - 测试转换准确性

2. **实时预览测试**
   - 测试输入时预览更新
   - 测试防抖功能
   - 测试性能表现

---

## 相关文件

- 前端文件：
  - `components/editor/MarkdownEditor.tsx`
  - `lib/tiptap-config.ts`
  - `lib/markdown.ts`

## 注意事项

- 利用TipTap内置的安全特性
- 实现防抖避免性能问题
- 考虑添加错误处理机制
- 确保预览区域的样式与编辑区域协调 