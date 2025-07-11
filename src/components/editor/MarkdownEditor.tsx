'use client';

import { Card, CardContent } from '@/components/ui/card';
import { isMarkdownSafe, parseMarkdown, sanitizeMarkdown } from '@/lib/markdown';
import { tiptapEditorProps } from '@/lib/tiptap-config';
import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect, useMemo, useState } from 'react';

// 简单的HTML到Markdown转换函数
function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1')
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    })
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '1. $1\n');
    })
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# 欢迎使用 Markdown 编辑器\n\n在这里编写你的 Markdown 内容...');
  const [debouncedMarkdown, setDebouncedMarkdown] = useState(markdown);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TipTap editor instance
  const editor = useEditor({
    ...tiptapEditorProps,
    content: markdown,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdownContent = htmlToMarkdown(html);
      setMarkdown(markdownContent);
    },
  });

  // 防抖处理，500ms延迟
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMarkdown(markdown);
    }, 500);

    return () => clearTimeout(timer);
  }, [markdown]);

  // 安全检查和清理
  const safeMarkdown = useMemo(() => {
    if (!isMarkdownSafe(debouncedMarkdown)) {
      setError('检测到潜在的危险内容，已自动清理');
      return sanitizeMarkdown(debouncedMarkdown);
    }
    setError(null);
    return debouncedMarkdown;
  }, [debouncedMarkdown]);

  // 解析Markdown，使用useMemo缓存结果
  const parsedContent = useMemo(() => {
    setIsLoading(true);
    try {
      const result = parseMarkdown(safeMarkdown);
      setIsLoading(false);
      return result;
    } catch (err) {
      setIsLoading(false);
      setError('Markdown解析失败');
      return <div className="text-red-500">解析失败</div>;
    }
  }, [safeMarkdown]);

  // 更新编辑器内容
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const currentHtml = editor.getHTML();
      const currentMarkdown = htmlToMarkdown(currentHtml);
      if (currentMarkdown !== markdown) {
        editor.commands.setContent(markdown);
      }
    }
  }, [editor, markdown]);

  return (
    <div className="grid grid-cols-2 gap-6 h-[calc(100vh-200px)]">
      {/* 编辑区域 */}
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-3">编辑区域</h2>
          <div className="flex-1 border rounded-md overflow-hidden">
            {editor && <EditorContent editor={editor} />}
          </div>
        </CardContent>
      </Card>

      {/* 预览区域 */}
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">预览区域</h2>
            {isLoading && <div className="text-sm text-gray-500">更新中...</div>}
          </div>

          {error && (
            <div className="mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-auto border rounded-md p-4 bg-white">
            <div className="prose prose-sm max-w-none">
              {parsedContent}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 