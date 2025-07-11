'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isMarkdownSafe, sanitizeMarkdown } from '@/lib/markdown';
import { Eye, EyeOff, Maximize2, Minimize2, Split } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

// 动态导入 remark 和 rehype 插件
const getRemarkPlugins = async () => {
  if (typeof window === 'undefined') return [];
  try {
    const remarkGfm = await import('remark-gfm');
    return [[remarkGfm.default, {}]];
  } catch (error) {
    console.warn('Failed to load remark-gfm:', error);
    return [];
  }
};

const getRehypePlugins = async () => {
  if (typeof window === 'undefined') return [];
  try {
    const rehypeHighlight = await import('rehype-highlight');
    return [[rehypeHighlight.default, { detect: true }]];
  } catch (error) {
    console.warn('Failed to load rehype-highlight:', error);
    return [];
  }
};

// 动态导入react-md-editor以解决SSR问题
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

// 导入工具栏命令
const commands = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.commands),
  { ssr: false }
);

type ViewMode = 'edit' | 'preview' | 'live';

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# 欢迎使用 Markdown 编辑器\n\n在这里编写你的 Markdown 内容...\n\n## 功能特性\n\n- ✅ 实时预览\n- ✅ 完整工具栏快捷操作\n- ✅ GitHub Flavored Markdown 支持\n- ✅ 表格语法支持\n- ✅ 任务列表支持\n- ✅ 删除线支持\n- ✅ 代码高亮支持\n- ✅ 语法高亮\n- ✅ 全屏编辑\n- ✅ 安全内容过滤\n- ✅ 视图模式切换\n- ✅ 键盘快捷键支持\n\n## 支持的语法\n\n### 标题语法\n\n# 一级标题\n## 二级标题\n### 三级标题\n#### 四级标题\n##### 五级标题\n###### 六级标题\n\n### 文本格式\n\n**粗体文本** 和 *斜体文本* 以及 ~~删除线文本~~\n\n### 代码支持\n\n行内代码：`const hello = "world"`\n\n代码块：\n```javascript\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```\n\n```python\ndef greet(name):\n    return f"Hello, {name}!"\n```\n\n### 列表支持\n\n#### 无序列表\n- 无序列表项 1\n- 无序列表项 2\n  - 嵌套列表项\n  - 另一个嵌套项\n\n#### 有序列表\n1. 有序列表项 1\n2. 有序列表项 2\n   1. 嵌套有序列表\n   2. 另一个嵌套项\n\n#### 任务列表\n- [x] 已完成任务\n- [ ] 未完成任务\n- [x] 另一个已完成任务\n- [ ] 待办事项\n\n### 链接和引用\n\n[链接示例](https://example.com)\n\n> 这是一个引用块\n> 可以包含多行内容\n> \n> 甚至可以包含其他格式\n> **粗体引用** 和 *斜体引用*\n\n### 表格支持\n\n| 功能 | 状态 | 说明 | 优先级 |\n|------|------|------|--------|\n| 基础编辑 | ✅ | 支持 | 高 |\n| 实时预览 | ✅ | 实时 | 高 |\n| 工具栏 | ✅ | 完整 | 高 |\n| 表格编辑 | ✅ | GFM | 中 |\n| 任务列表 | ✅ | 支持 | 中 |\n| 代码高亮 | ✅ | 多语言 | 低 |\n\n### 分割线\n\n---\n\n### 图片支持\n\n![示例图片](https://via.placeholder.com/300x200?text=示例图片)\n\n## 快捷键\n\n- `Ctrl/Cmd + P`: 切换预览模式\n- `Ctrl/Cmd + Shift + P`: 切换到分屏模式\n- `F11`: 全屏预览\n- `Ctrl/Cmd + B`: 粗体\n- `Ctrl/Cmd + I`: 斜体\n- `Ctrl/Cmd + K`: 插入链接\n- `Ctrl/Cmd + Shift + C`: 插入代码块');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [remarkPlugins, setRemarkPlugins] = useState<any[]>([]);
  const [rehypePlugins, setRehypePlugins] = useState<any[]>([]);

  // 动态加载插件
  useEffect(() => {
    const loadPlugins = async () => {
      const [remarkPluginsResult, rehypePluginsResult] = await Promise.all([
        getRemarkPlugins(),
        getRehypePlugins()
      ]);
      setRemarkPlugins(remarkPluginsResult);
      setRehypePlugins(rehypePluginsResult);
    };

    loadPlugins();
  }, []);

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
              commands={commands && [
                // 标题按钮组 - 添加无障碍属性
                {
                  ...commands.title1,
                  buttonProps: {
                    'aria-label': '插入一级标题',
                    title: '插入一级标题 (Ctrl+1)',
                    'data-testid': 'title1-button'
                  }
                },
                {
                  ...commands.title2,
                  buttonProps: {
                    'aria-label': '插入二级标题',
                    title: '插入二级标题 (Ctrl+2)',
                    'data-testid': 'title2-button'
                  }
                },
                {
                  ...commands.title3,
                  buttonProps: {
                    'aria-label': '插入三级标题',
                    title: '插入三级标题 (Ctrl+3)',
                    'data-testid': 'title3-button'
                  }
                },
                {
                  ...commands.title4,
                  buttonProps: {
                    'aria-label': '插入四级标题',
                    title: '插入四级标题 (Ctrl+4)',
                    'data-testid': 'title4-button'
                  }
                },
                {
                  ...commands.title5,
                  buttonProps: {
                    'aria-label': '插入五级标题',
                    title: '插入五级标题 (Ctrl+5)',
                    'data-testid': 'title5-button'
                  }
                },
                {
                  ...commands.title6,
                  buttonProps: {
                    'aria-label': '插入六级标题',
                    title: '插入六级标题 (Ctrl+6)',
                    'data-testid': 'title6-button'
                  }
                },
                commands.divider,

                // 文本格式组 - 添加无障碍属性
                {
                  ...commands.bold,
                  buttonProps: {
                    'aria-label': '粗体格式',
                    title: '粗体 (Ctrl+B)',
                    'data-testid': 'bold-button'
                  }
                },
                {
                  ...commands.italic,
                  buttonProps: {
                    'aria-label': '斜体格式',
                    title: '斜体 (Ctrl+I)',
                    'data-testid': 'italic-button'
                  }
                },
                {
                  ...commands.strikethrough,
                  buttonProps: {
                    'aria-label': '删除线格式',
                    title: '删除线',
                    'data-testid': 'strikethrough-button'
                  }
                },
                commands.divider,

                // 列表组 - 添加无障碍属性
                {
                  ...commands.unorderedListCommand,
                  buttonProps: {
                    'aria-label': '无序列表',
                    title: '插入无序列表',
                    'data-testid': 'unordered-list-button'
                  }
                },
                {
                  ...commands.orderedListCommand,
                  buttonProps: {
                    'aria-label': '有序列表',
                    title: '插入有序列表',
                    'data-testid': 'ordered-list-button'
                  }
                },
                {
                  ...commands.checkedListCommand,
                  buttonProps: {
                    'aria-label': '任务列表',
                    title: '插入任务列表',
                    'data-testid': 'task-list-button'
                  }
                },
                commands.divider,

                // 链接和引用组 - 添加无障碍属性
                {
                  ...commands.link,
                  buttonProps: {
                    'aria-label': '插入链接',
                    title: '插入链接 (Ctrl+K)',
                    'data-testid': 'link-button'
                  }
                },
                {
                  ...commands.quote,
                  buttonProps: {
                    'aria-label': '引用块',
                    title: '插入引用块',
                    'data-testid': 'quote-button'
                  }
                },
                commands.divider,

                // 代码组 - 添加无障碍属性
                {
                  ...commands.code,
                  buttonProps: {
                    'aria-label': '行内代码',
                    title: '插入行内代码',
                    'data-testid': 'code-button'
                  }
                },
                {
                  ...commands.codeBlock,
                  buttonProps: {
                    'aria-label': '代码块',
                    title: '插入代码块',
                    'data-testid': 'code-block-button'
                  }
                },
                commands.divider,

                // 表格和其他 - 添加无障碍属性
                {
                  ...commands.table,
                  buttonProps: {
                    'aria-label': '表格',
                    title: '插入表格',
                    'data-testid': 'table-button'
                  }
                },
                {
                  ...commands.image,
                  buttonProps: {
                    'aria-label': '图片',
                    title: '插入图片',
                    'data-testid': 'image-button'
                  }
                },
                {
                  ...commands.hr,
                  buttonProps: {
                    'aria-label': '分割线',
                    title: '插入分割线',
                    'data-testid': 'hr-button'
                  }
                },
                commands.divider,

                // 全屏切换 - 添加无障碍属性
                {
                  ...commands.fullscreen,
                  buttonProps: {
                    'aria-label': '全屏切换',
                    title: '切换全屏模式',
                    'data-testid': 'fullscreen-button'
                  }
                },
              ]}
              textareaProps={{
                placeholder: '在这里编写你的 Markdown 内容...',
                'aria-label': 'Markdown编辑器文本输入区域',
                'aria-describedby': 'editor-title editor-shortcuts',
                'aria-multiline': true,
                'role': 'textbox',
                style: {
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                }
              }}
              previewOptions={{
                remarkPlugins,
                rehypePlugins,
                components: {
                  // 自定义表格样式
                  table: ({ children, ...props }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full border border-gray-300 border-collapse" {...props}>
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children, ...props }) => (
                    <thead className="bg-gray-50" {...props}>
                      {children}
                    </thead>
                  ),
                  tbody: ({ children, ...props }) => (
                    <tbody {...props}>
                      {children}
                    </tbody>
                  ),
                  tr: ({ children, ...props }) => (
                    <tr className="border-b border-gray-200" {...props}>
                      {children}
                    </tr>
                  ),
                  th: ({ children, ...props }) => (
                    <th className="px-4 py-2 text-left font-semibold border-r border-gray-300 last:border-r-0" {...props}>
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }) => (
                    <td className="px-4 py-2 border-r border-gray-300 last:border-r-0" {...props}>
                      {children}
                    </td>
                  ),
                  // 自定义任务列表样式
                  input: ({ type, checked, ...props }) => {
                    if (type === 'checkbox') {
                      return (
                        <input
                          type="checkbox"
                          checked={checked}
                          readOnly
                          className="mr-2 accent-blue-500"
                          {...props}
                        />
                      );
                    }
                    return <input type={type} {...props} />;
                  },
                  // 自定义代码块样式
                  code: ({ children, className, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';

                    if (language) {
                      return (
                        <code className={`${className} bg-gray-100 rounded px-1 py-0.5 text-sm font-mono`} {...props}>
                          {children}
                        </code>
                      );
                    }

                    return (
                      <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children, ...props }) => (
                    <pre className="bg-gray-100 rounded p-4 overflow-x-auto mb-4 text-sm font-mono" {...props}>
                      {children}
                    </pre>
                  ),
                  // 增强删除线样式
                  del: ({ children, ...props }) => (
                    <del className="text-gray-500 line-through" {...props}>
                      {children}
                    </del>
                  ),
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 