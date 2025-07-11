'use client';

import { Card, CardContent } from '@/components/ui/card';
import { isMarkdownSafe, sanitizeMarkdown } from '@/lib/markdown';
import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

// 动态导入react-md-editor以解决SSR问题
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# 欢迎使用 Markdown 编辑器\n\n在这里编写你的 Markdown 内容...\n\n## 功能特性\n\n- ✅ 实时预览\n- ✅ 工具栏快捷操作\n- ✅ 语法高亮\n- ✅ 全屏编辑\n- ✅ 安全内容过滤\n\n## 支持的语法\n\n### 文本格式\n\n**粗体文本** 和 *斜体文本*\n\n### 代码\n\n行内代码：`const hello = "world"`\n\n代码块：\n```javascript\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```\n\n### 列表\n\n- 无序列表项 1\n- 无序列表项 2\n  - 嵌套列表项\n\n1. 有序列表项 1\n2. 有序列表项 2\n\n### 链接和引用\n\n[链接示例](https://example.com)\n\n> 这是一个引用块\n> 可以包含多行内容\n\n### 表格\n\n| 功能 | 状态 | 说明 |\n|------|------|------|\n| 编辑 | ✅ | 支持 |\n| 预览 | ✅ | 实时 |\n| 工具栏 | ✅ | 完整 |');
  const [error, setError] = useState<string | null>(null);

  // 处理markdown内容变化
  const handleMarkdownChange = useCallback((value?: string) => {
    const newMarkdown = value || '';

    // 安全检查
    if (!isMarkdownSafe(newMarkdown)) {
      setError('检测到潜在的危险内容，已自动清理');
      const sanitized = sanitizeMarkdown(newMarkdown);
      setMarkdown(sanitized);
    } else {
      setError(null);
      setMarkdown(newMarkdown);
    }
  }, []);

  return (
    <div className="w-full h-[calc(100vh-200px)]">
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Markdown 编辑器</h2>
            {error && (
              <div className="px-3 py-1 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                {error}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <MDEditor
              value={markdown}
              onChange={handleMarkdownChange}
              height={600}
              data-color-mode="light"
              visibleDragBar={false}
              textareaProps={{
                placeholder: '在这里编写你的 Markdown 内容...',
                'aria-label': 'Markdown编辑器',
                style: {
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                }
              }}
              preview="edit"
              hideToolbar={false}
              toolbarHeight={40}
              previewOptions={{
                rehypePlugins: [],
                remarkPlugins: [],
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 