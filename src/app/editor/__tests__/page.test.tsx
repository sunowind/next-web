import { render, screen } from '@testing-library/react';
import EditorPage from '../page';

// Mock the MarkdownEditor component
jest.mock('@/components/editor/MarkdownEditor', () => ({
  MarkdownEditor: () => <div data-testid="markdown-editor">Markdown Editor Component</div>,
}));

describe('EditorPage', () => {
  it('应该正常渲染编辑器页面', () => {
    render(<EditorPage />);

    expect(screen.getByText('Markdown 编辑器')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
  });

  it('应该包含页面标题和描述', () => {
    render(<EditorPage />);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('Markdown 编辑器');

    const description = screen.getByText('功能完整的 Markdown 编辑器，支持实时预览、工具栏快捷操作和语法高亮');
    expect(description).toBeInTheDocument();
  });

  it('应该包含容器布局', () => {
    render(<EditorPage />);

    const container = screen.getByText('Markdown 编辑器').closest('.container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('mx-auto', 'max-w-7xl');
  });

  it('应该有正确的页面结构', () => {
    render(<EditorPage />);

    // 检查主容器
    const mainContainer = screen.getByText('Markdown 编辑器').closest('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('bg-background');

    // 检查标题区域
    const titleSection = screen.getByText('Markdown 编辑器').closest('div');
    expect(titleSection).toHaveClass('mb-6');
  });

  it('应该正确渲染MarkdownEditor组件', () => {
    render(<EditorPage />);

    const editor = screen.getByTestId('markdown-editor');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveTextContent('Markdown Editor Component');
  });

  it('标题应该有正确的样式', () => {
    render(<EditorPage />);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-3xl', 'font-bold', 'mb-2');
  });

  it('描述文本应该有正确的样式', () => {
    render(<EditorPage />);

    const description = screen.getByText('功能完整的 Markdown 编辑器，支持实时预览、工具栏快捷操作和语法高亮');
    expect(description).toHaveClass('text-muted-foreground');
  });
}); 