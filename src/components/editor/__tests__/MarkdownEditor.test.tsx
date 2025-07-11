import { render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { MarkdownEditor } from '../MarkdownEditor';

// Mock TipTap
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => ({
    getHTML: jest.fn(() => '<h1>欢迎使用 Markdown 编辑器</h1><p>在这里编写你的 Markdown 内容...</p>'),
    onUpdate: jest.fn(),
    commands: {
      setContent: jest.fn(),
    },
    isDestroyed: false,
  })),
  EditorContent: ({ editor }: { editor: any }) => (
    <div data-testid="tiptap-editor" contentEditable>
      <h1>欢迎使用 Markdown 编辑器</h1>
      <p>在这里编写你的 Markdown 内容...</p>
    </div>
  ),
}));

// Mock markdown工具函数
jest.mock('@/lib/markdown', () => ({
  parseMarkdown: jest.fn((markdown: string) => {
    // 返回React元素而不是HTMLDivElement
    return React.createElement('div', {
      dangerouslySetInnerHTML: {
        __html: markdown
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
          .replace(/\*(.*)\*/gim, '<em>$1</em>')
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
    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
  });

  it('应该显示初始的Markdown内容', () => {
    render(<MarkdownEditor />);
    const editor = screen.getByTestId('tiptap-editor');
    expect(within(editor).getByText('欢迎使用 Markdown 编辑器')).toBeInTheDocument();
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

  it('应该显示TipTap编辑器', () => {
    render(<MarkdownEditor />);

    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
    expect(screen.getByTestId('tiptap-editor')).toHaveAttribute('contenteditable');
  });
}); 