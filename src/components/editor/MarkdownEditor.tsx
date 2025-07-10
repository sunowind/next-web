'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { parseMarkdown, sanitizeMarkdown, isMarkdownSafe } from '@/lib/markdown';

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# 欢迎使用 Markdown 编辑器\n\n在这里编写你的 Markdown 内容...');
  const [debouncedMarkdown, setDebouncedMarkdown] = useState(markdown);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
      {/* 编辑区域 */}
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-3">编辑区域</h2>
          <textarea
            value={markdown}
            onChange={handleInputChange}
            className="w-full flex-1 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="在这里输入 Markdown 内容..."
          />
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