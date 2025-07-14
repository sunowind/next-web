import { MarkdownEditor } from '@/components/editor/MarkdownEditor';

export default function EditorPage() {
  const defaultMarkdown = `# 欢迎使用 Markdown 编辑器

在这里编写你的 Markdown 内容...

## 功能特性

- ✅ 实时预览
- ✅ 完整工具栏快捷操作
- ✅ 基础 Markdown 语法支持
- ✅ 代码高亮支持
- ✅ 全屏编辑
- ✅ 安全内容过滤
- ✅ 视图模式切换
- ✅ 键盘快捷键支持

## 支持的语法

### 标题语法

# 一级标题
## 二级标题
### 三级标题

### 文本格式

**粗体文本** 和 *斜体文本*

### 代码支持

行内代码：\`const hello = "world"\`

代码块：
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### 列表支持

#### 无序列表
- 无序列表项 1
- 无序列表项 2
  - 嵌套列表项

#### 有序列表
1. 有序列表项 1
2. 有序列表项 2

### 链接和引用

[链接示例](https://example.com)

> 这是一个引用块
> 可以包含多行内容

### 分割线

---

## 快捷键

- \`Ctrl/Cmd + P\`: 切换预览模式
- \`Ctrl/Cmd + Shift + P\`: 切换到分屏模式
- \`F11\`: 全屏预览`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Markdown 编辑器</h1>
          <p className="text-muted-foreground">
            功能完整的 Markdown 编辑器，支持实时预览、工具栏快捷操作和语法高亮
          </p>
        </div>
        <MarkdownEditor initialValue={defaultMarkdown} />
      </div>
    </div>
  );
} 