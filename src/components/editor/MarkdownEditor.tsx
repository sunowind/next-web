'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isMarkdownSafe, sanitizeMarkdown } from '@/lib/markdown';
import { Eye, EyeOff, Maximize2, Minimize2, Split } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

// 动态导入react-md-editor以解决SSR问题
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

type ViewMode = 'edit' | 'preview' | 'live';

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# 欢迎使用 Markdown 编辑器\n\n在这里编写你的 Markdown 内容...\n\n## 功能特性\n\n- ✅ 实时预览\n- ✅ 工具栏快捷操作\n- ✅ 语法高亮\n- ✅ 全屏编辑\n- ✅ 安全内容过滤\n- ✅ 视图模式切换\n- ✅ 键盘快捷键支持\n\n## 支持的语法\n\n### 文本格式\n\n**粗体文本** 和 *斜体文本*\n\n### 代码\n\n行内代码：`const hello = "world"`\n\n代码块：\n```javascript\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```\n\n### 列表\n\n- 无序列表项 1\n- 无序列表项 2\n  - 嵌套列表项\n\n1. 有序列表项 1\n2. 有序列表项 2\n\n### 链接和引用\n\n[链接示例](https://example.com)\n\n> 这是一个引用块\n> 可以包含多行内容\n\n### 表格\n\n| 功能 | 状态 | 说明 |\n|------|------|------|\n| 编辑 | ✅ | 支持 |\n| 预览 | ✅ | 实时 |\n| 工具栏 | ✅ | 完整 |\n\n## 快捷键\n\n- `Ctrl/Cmd + P`: 切换预览模式\n- `Ctrl/Cmd + Shift + P`: 切换到分屏模式\n- `F11`: 全屏预览');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // 切换视图模式
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => {
      switch (prev) {
        case 'edit':
          return 'preview';
        case 'preview':
          return 'live';
        case 'live':
          return 'edit';
        default:
          return 'live';
      }
    });
  }, []);

  // 切换全屏模式
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + P: 切换预览模式
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        toggleViewMode();
      }
      // Ctrl/Cmd + Shift + P: 切换到分屏模式
      else if ((e.ctrlKey || e.metaKey) && e.key === 'P' && e.shiftKey) {
        e.preventDefault();
        setViewMode('live');
      }
      // F11: 全屏预览
      else if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      // Escape: 退出全屏
      else if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleViewMode, toggleFullscreen, isFullscreen]);

  // 获取视图模式对应的预览设置
  const getPreviewMode = () => {
    switch (viewMode) {
      case 'edit':
        return 'edit';
      case 'preview':
        return 'preview';
      case 'live':
        return 'live';
      default:
        return 'live';
    }
  };

  // 获取视图模式的显示名称
  const getViewModeLabel = () => {
    switch (viewMode) {
      case 'edit':
        return '编辑模式';
      case 'preview':
        return '预览模式';
      case 'live':
        return '分屏模式';
      default:
        return '分屏模式';
    }
  };

  // 获取视图模式的图标
  const getViewModeIcon = () => {
    switch (viewMode) {
      case 'edit':
        return <EyeOff className="w-4 h-4" />;
      case 'preview':
        return <Eye className="w-4 h-4" />;
      case 'live':
        return <Split className="w-4 h-4" />;
      default:
        return <Split className="w-4 h-4" />;
    }
  };

  const containerHeight = isFullscreen ? '100vh' : 'calc(100vh-200px)';

  return (
    <div
      className={`w-full h-[${containerHeight}] ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
    >
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Markdown 编辑器 - {getViewModeLabel()}
            </h2>

            <div className="flex items-center gap-2">
              {/* 视图模式切换按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleViewMode}
                className="flex items-center gap-2"
                title={`当前: ${getViewModeLabel()}, 点击切换 (Ctrl+P)`}
              >
                {getViewModeIcon()}
                {getViewModeLabel()}
              </Button>

              {/* 全屏切换按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="flex items-center gap-2"
                title={isFullscreen ? '退出全屏 (Esc)' : '全屏预览 (F11)'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                {isFullscreen ? '退出全屏' : '全屏'}
              </Button>

              {/* 错误提示 */}
              {error && (
                <div className="px-3 py-1 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* 快捷键提示 */}
          <div className="mb-2 text-xs text-gray-500">
            快捷键: Ctrl+P (切换模式) | Ctrl+Shift+P (分屏) | F11 (全屏)
          </div>

          <div className="flex-1 overflow-hidden">
            <MDEditor
              value={markdown}
              onChange={handleMarkdownChange}
              height={isFullscreen ? window.innerHeight - 120 : 600}
              data-color-mode="light"
              visibleDragBar={false}
              preview={getPreviewMode()}
              hideToolbar={false}
              toolbarHeight={40}
              textareaProps={{
                placeholder: '在这里编写你的 Markdown 内容...',
                'aria-label': 'Markdown编辑器',
                style: {
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                }
              }}
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