'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# 欢迎使用 Markdown 编辑器\n\n在这里编写你的 Markdown 内容...');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const renderMarkdown = (text: string) => {
    // 简单的 Markdown 渲染逻辑
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br />');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
      {/* 编辑区域 */}
      <Card className="h-full">
        <CardContent className="p-4 h-full">
          <h2 className="text-lg font-semibold mb-3">编辑区域</h2>
          <textarea
            value={markdown}
            onChange={handleInputChange}
            className="w-full h-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="在这里输入 Markdown 内容..."
          />
        </CardContent>
      </Card>

      {/* 预览区域 */}
      <Card className="h-full">
        <CardContent className="p-4 h-full overflow-auto">
          <h2 className="text-lg font-semibold mb-3">预览区域</h2>
          <div 
            className="prose prose-sm max-w-none h-full"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
          />
        </CardContent>
      </Card>
    </div>
  );
} 