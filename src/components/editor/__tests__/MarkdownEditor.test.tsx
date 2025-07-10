import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from '../MarkdownEditor';
import React from 'react';

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
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('应该显示初始的Markdown内容', () => {
    render(<MarkdownEditor />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('# 欢迎使用 Markdown 编辑器\n\n在这里编写你的 Markdown 内容...');
  });

  it('应该实时更新预览内容', async () => {
    const user = userEvent.setup();
    render(<MarkdownEditor />);
    
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, '# 新标题\n**粗体文本**');
    
    // 等待防抖处理
    await waitFor(() => {
      expect(screen.getByText('新标题')).toBeInTheDocument();
      expect(screen.getByText('粗体文本')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('应该实现防抖处理', async () => {
    const user = userEvent.setup();
    render(<MarkdownEditor />);
    
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'a');
    await user.type(textarea, 'b');
    await user.type(textarea, 'c');
    // 立即检查，应该还没有更新到预览区域
    const preview = screen.getByText('预览区域').parentElement!.parentElement!.querySelector('.prose');
    expect(within(preview!).queryByText('abc')).not.toBeInTheDocument();
    // 等待防抖时间后应该更新
    await waitFor(() => {
      expect(within(preview!).getByText('abc')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('应该处理危险内容并显示警告', async () => {
    const user = userEvent.setup();
    render(<MarkdownEditor />);
    
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, '<script>alert("xss")</script># 安全标题');
    
    // 等待防抖处理
    await waitFor(() => {
      expect(screen.getByText('检测到潜在的危险内容，已自动清理')).toBeInTheDocument();
      expect(screen.getByText('安全标题')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('应该正确处理Markdown解析错误', async () => {
    // Mock parseMarkdown抛出错误
    const { parseMarkdown } = require('@/lib/markdown');
    parseMarkdown.mockImplementationOnce(() => {
      throw new Error('解析错误');
    });

    const user = userEvent.setup();
    render(<MarkdownEditor />);
    
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, '错误内容');
    
    await waitFor(() => {
      expect(screen.getByText('Markdown解析失败')).toBeInTheDocument();
      expect(screen.getByText('解析失败')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('应该正确渲染基本的Markdown语法', async () => {
    const user = userEvent.setup();
    render(<MarkdownEditor />);
    
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, '# 一级标题');
    await user.type(textarea, '\n## 二级标题');
    await user.type(textarea, '\n**粗体文本**');
    
    await waitFor(() => {
      expect(screen.getByText('一级标题')).toBeInTheDocument();
      expect(screen.getByText('二级标题')).toBeInTheDocument();
      expect(screen.getByText('粗体文本')).toBeInTheDocument();
    }, { timeout: 1000 });
  });
}); 