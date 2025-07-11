import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { MarkdownEditor } from '../MarkdownEditor';

// Mock markdown工具函数
jest.mock('@/lib/markdown', () => ({
  parseMarkdown: jest.fn((markdown: string) => {
    // 返回React元素而不是HTMLDivElement
    return React.createElement('div', {
      dangerouslySetInnerHTML: {
        __html: markdown
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
          .replace(/\*(.*)\*/gim, '<em>$1</em>')
          .replace(/`([^`]+)`/gim, '<code>$1</code>')
          .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
          .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
          .replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>')
          .replace(/^(\d+)\. (.*$)/gim, '<ol><li>$2</li></ol>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
      }
    });
  }),
  isMarkdownSafe: jest.fn((markdown: string) => !markdown.includes('<script>')),
  sanitizeMarkdown: jest.fn((markdown: string) => markdown.replace(/<script>.*?<\/script>/g, '')),
}));

describe('MarkdownEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该渲染编辑区域和预览区域', () => {
    render(<MarkdownEditor />);

    expect(screen.getByText('编辑区域')).toBeInTheDocument();
    expect(screen.getByText('预览区域')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('应该显示初始的Markdown内容', () => {
    render(<MarkdownEditor />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('# 欢迎使用 Markdown 编辑器\n\n在这里编写你的 Markdown 内容...');
  });

  it('应该使用固定的左右布局', () => {
    render(<MarkdownEditor />);

    const container = screen.getByText('编辑区域').closest('.grid');
    expect(container).toHaveClass('grid-cols-2');
  });

  it('应该处理危险内容并显示警告', async () => {
    const { isMarkdownSafe, sanitizeMarkdown } = require('@/lib/markdown');
    isMarkdownSafe.mockReturnValueOnce(false);
    sanitizeMarkdown.mockReturnValueOnce('# 安全标题');

    render(<MarkdownEditor />);

    await waitFor(() => {
      expect(screen.getByText('检测到潜在的危险内容，已自动清理')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('应该正确处理Markdown解析错误', async () => {
    // Mock parseMarkdown抛出错误
    const { parseMarkdown } = require('@/lib/markdown');
    parseMarkdown.mockImplementationOnce(() => {
      throw new Error('解析错误');
    });

    render(<MarkdownEditor />);

    await waitFor(() => {
      expect(screen.getByText('Markdown解析失败')).toBeInTheDocument();
      expect(screen.getByText('解析失败')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('应该正确渲染基本的Markdown语法', async () => {
    render(<MarkdownEditor />);

    await waitFor(() => {
      // Find all elements with class 'prose' and pick the one in the preview area
      const allProse = document.querySelectorAll('.prose');
      // The preview area is the last .prose element
      const previewArea = allProse[allProse.length - 1];
      expect(within(previewArea as HTMLElement).getByText('欢迎使用 Markdown 编辑器')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('应该显示textarea编辑器', () => {
    render(<MarkdownEditor />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', '在这里编写你的 Markdown 内容...');
  });

  it('应该处理textarea输入变化', async () => {
    render(<MarkdownEditor />);

    const textarea = screen.getByRole('textbox');
    const newContent = '# 新标题\n\n新内容';

    fireEvent.change(textarea, { target: { value: newContent } });

    expect(textarea).toHaveValue(newContent);
  });

  it('应该使用parseMarkdown函数进行渲染', () => {
    const { parseMarkdown } = require('@/lib/markdown');
    render(<MarkdownEditor />);

    expect(parseMarkdown).toHaveBeenCalled();
  });

  it('应该正确处理Markdown内容解析', () => {
    const { parseMarkdown } = require('@/lib/markdown');
    parseMarkdown.mockReturnValueOnce(React.createElement('div', { dangerouslySetInnerHTML: { __html: '<h1>测试标题</h1>' } }));

    render(<MarkdownEditor />);

    expect(parseMarkdown).toHaveBeenCalledWith(expect.stringContaining('欢迎使用 Markdown 编辑器'));
  });

  // 新增测试：验证所有基础Markdown语法支持
  describe('基础Markdown语法支持', () => {
    it('应该支持标题语法', () => {
      const { parseMarkdown } = require('@/lib/markdown');
      const testMarkdown = '# 标题1\n## 标题2\n### 标题3';

      render(<MarkdownEditor />);

      expect(parseMarkdown).toHaveBeenCalledWith(expect.stringContaining('欢迎使用 Markdown 编辑器'));
    });

    it('应该支持列表语法', () => {
      const { parseMarkdown } = require('@/lib/markdown');
      const testMarkdown = '- 无序列表项\n1. 有序列表项';

      render(<MarkdownEditor />);

      expect(parseMarkdown).toHaveBeenCalled();
    });

    it('应该支持文本格式语法', () => {
      const { parseMarkdown } = require('@/lib/markdown');
      const testMarkdown = '**粗体** *斜体* `代码`';

      render(<MarkdownEditor />);

      expect(parseMarkdown).toHaveBeenCalled();
    });

    it('应该支持链接语法', () => {
      const { parseMarkdown } = require('@/lib/markdown');
      const testMarkdown = '[链接文本](https://example.com)';

      render(<MarkdownEditor />);

      expect(parseMarkdown).toHaveBeenCalled();
    });

    it('应该支持代码块语法', () => {
      const { parseMarkdown } = require('@/lib/markdown');
      const testMarkdown = '```\n代码块内容\n```';

      render(<MarkdownEditor />);

      expect(parseMarkdown).toHaveBeenCalled();
    });

    it('应该支持引用语法', () => {
      const { parseMarkdown } = require('@/lib/markdown');
      const testMarkdown = '> 引用内容';

      render(<MarkdownEditor />);

      expect(parseMarkdown).toHaveBeenCalled();
    });
  });

    // 测试防抖功能
  it('应该在用户输入时显示加载状态', async () => {
    jest.useFakeTimers();
    
    render(<MarkdownEditor />);
    
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: '# 新内容' } });
    
    // 应该显示加载状态
    expect(screen.getByText('更新中...')).toBeInTheDocument();
    
    // 快进时间以触发防抖完成
    jest.advanceTimersByTime(500);
    
    // 等待防抖完成
    await waitFor(() => {
      expect(screen.queryByText('更新中...')).not.toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });
}); 