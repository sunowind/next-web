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

  it('应该包含页面标题', () => {
    render(<EditorPage />);
    
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('Markdown 编辑器');
  });

  it('应该包含容器布局', () => {
    render(<EditorPage />);
    
    const container = screen.getByText('Markdown 编辑器').closest('.container');
    expect(container).toBeInTheDocument();
  });
}); 