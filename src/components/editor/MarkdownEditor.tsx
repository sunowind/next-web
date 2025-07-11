'use client';

import { Card, CardContent } from '@/components/ui/card';
import { isMarkdownSafe, parseMarkdown, sanitizeMarkdown } from '@/lib/markdown';
import { useCallback, useMemo, useState } from 'react';

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# 欢迎使用 Markdown 编辑器\n\n在这里编写你的 Markdown 内容...');
  const [debouncedMarkdown, setDebouncedMarkdown] = useState(markdown);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  // 防抖处理函数
  const debounceUpdate = useCallback((newMarkdown: string) => {
    const now = Date.now();
    setLastUpdateTime(now);
    setIsLoading(true); // 开始加载

    setTimeout(() => {
      if (now === lastUpdateTime) {
        setDebouncedMarkdown(newMarkdown);
        setIsLoading(false); // 结束加载
      }
    }, 500);
  }, [lastUpdateTime]);

  // 处理textarea输入变化
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMarkdown = e.target.value;
    setMarkdown(newMarkdown);
    debounceUpdate(newMarkdown);
  };

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
    try {
      const result = parseMarkdown(safeMarkdown);
      return result;
    } catch (err) {
      setError('Markdown解析失败');
      return <div className="text-red-500">解析失败</div>;
    }
  }, [safeMarkdown]);

  return (
    <div className="grid grid-cols-2 gap-6 h-[calc(100vh-200px)]">
      {/* 编辑区域 */}
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-3">编辑区域</h2>
          <div className="flex-1 border rounded-md overflow-hidden">
            <textarea
              value={markdown}
              onChange={handleTextareaChange}
              className="w-full h-full p-4 resize-none focus:outline-none font-mono text-sm"
              placeholder="在这里编写你的 Markdown 内容..."
            />
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