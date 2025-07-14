'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isMarkdownSafe, parseMarkdownToHtml, sanitizeMarkdown } from '@/lib/markdown';
import { Bold, Code, Eye, EyeOff, Heading1, Heading2, Heading3, Italic, Link, List, Maximize2, Minimize2, Quote, Split } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type ViewMode = 'edit' | 'preview' | 'live';

interface MarkdownEditorProps {
  initialValue?: string;
}

export function MarkdownEditor({ initialValue = '' }: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(initialValue);
  const [html, setHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 处理markdown内容变化
  const handleMarkdownChange = useCallback((value: string) => {
    const newMarkdown = value;

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

  // 实时更新HTML预览
  useEffect(() => {
    const htmlContent = parseMarkdownToHtml(markdown);
    setHtml(htmlContent);
  }, [markdown]);

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

  // 工具栏功能
  const insertText = useCallback((text: string) => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);

      let insertText = text;
      if (selectedText) {
        // 如果有选中文本，进行相应的格式化
        if (text === '**' || text === '*') {
          insertText = `${text}${selectedText}${text}`;
        } else if (text.startsWith('#')) {
          insertText = `${text} ${selectedText}`;
        } else if (text === '>') {
          insertText = `${text} ${selectedText}`;
        } else if (text === '-') {
          insertText = `${text} ${selectedText}`;
        } else if (text === '`') {
          insertText = `${text}${selectedText}${text}`;
        } else {
          insertText = `${text}${selectedText}`;
        }
      }

      const newValue = textarea.value.substring(0, start) + insertText + textarea.value.substring(end);
      setMarkdown(newValue);

      // 设置光标位置
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + insertText.length, start + insertText.length);
      }, 0);
    }
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

  // 获取视图模式对应的显示名称
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
      role="application"
      aria-label="Markdown编辑器应用"
    >
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" id="editor-title">
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
                aria-label={`切换视图模式，当前: ${getViewModeLabel()}`}
                aria-describedby="editor-title"
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
                aria-label={isFullscreen ? '退出全屏模式' : '进入全屏模式'}
                aria-pressed={isFullscreen}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                {isFullscreen ? '退出全屏' : '全屏'}
              </Button>

              {/* 错误提示 */}
              {error && (
                <div
                  className="px-3 py-1 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800"
                  role="alert"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* 快捷键提示 */}
          <div
            id="editor-shortcuts"
            className="mb-2 text-xs text-gray-500"
            role="region"
            aria-label="快捷键说明"
          >
            快捷键: Ctrl+P (切换模式) | Ctrl+Shift+P (分屏) | F11 (全屏) | Ctrl+B (粗体) | Ctrl+I (斜体) | Ctrl+K (链接)
          </div>

          {/* 工具栏 */}
          <div className="flex items-center gap-1 mb-4 p-2 bg-muted rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertText('# ')}
              title="一级标题"
              aria-label="插入一级标题"
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertText('## ')}
              title="二级标题"
              aria-label="插入二级标题"
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertText('### ')}
              title="三级标题"
              aria-label="插入三级标题"
            >
              <Heading3 className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertText('**')}
              title="粗体 (Ctrl+B)"
              aria-label="粗体格式"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertText('*')}
              title="斜体 (Ctrl+I)"
              aria-label="斜体格式"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertText('`')}
              title="行内代码"
              aria-label="行内代码"
            >
              <Code className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertText('- ')}
              title="无序列表"
              aria-label="无序列表"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertText('> ')}
              title="引用"
              aria-label="引用块"
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertText('[链接文字](链接地址)')}
              title="插入链接"
              aria-label="插入链接"
            >
              <Link className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full flex gap-4">
              {/* 编辑区域 */}
              {(viewMode === 'edit' || viewMode === 'live') && (
                <div className={`${viewMode === 'live' ? 'w-1/2' : 'w-full'} h-full`}>
                  <textarea
                    id="markdown-editor"
                    value={markdown}
                    onChange={(e) => handleMarkdownChange(e.target.value)}
                    className="w-full h-full p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent font-mono text-sm"
                    placeholder="在这里编写你的 Markdown 内容..."
                    aria-label="Markdown编辑器文本输入区域"
                    aria-describedby="editor-title editor-shortcuts"
                  />
                </div>
              )}

              {/* 预览区域 */}
              {(viewMode === 'preview' || viewMode === 'live') && (
                <div className={`${viewMode === 'live' ? 'w-1/2' : 'w-full'} h-full overflow-y-auto`}>
                  <div
                    className="markdown-preview p-4 border border-border rounded-lg h-full overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: html }}
                    aria-label="Markdown预览区域"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 