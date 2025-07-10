import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownEditor } from '../MarkdownEditor';

// Mock the Card components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
}));

describe('MarkdownEditor', () => {
  it('应该正常渲染编辑器组件', () => {
    render(<MarkdownEditor />);
    
    expect(screen.getByText('编辑区域')).toBeInTheDocument();
    expect(screen.getByText('预览区域')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('在这里输入 Markdown 内容...')).toBeInTheDocument();
  });

  it('应该能够输入文本', () => {
    render(<MarkdownEditor />);
    
    const textarea = screen.getByPlaceholderText('在这里输入 Markdown 内容...');
    fireEvent.change(textarea, { target: { value: '测试内容' } });
    
    expect(textarea).toHaveValue('测试内容');
  });

  it('应该能够渲染基本的 Markdown 语法', () => {
    render(<MarkdownEditor />);
    
    const textarea = screen.getByPlaceholderText('在这里输入 Markdown 内容...');
    fireEvent.change(textarea, { 
      target: { 
        value: '# 标题\n**粗体文本**\n*斜体文本*' 
      } 
    });
    
    // 检查预览区域是否包含渲染后的内容
    expect(screen.getByText('标题')).toBeInTheDocument();
    expect(screen.getByText('粗体文本')).toBeInTheDocument();
    expect(screen.getByText('斜体文本')).toBeInTheDocument();
  });

  it('应该使用左右布局', () => {
    render(<MarkdownEditor />);
    
    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(2);
  });

  it('应该显示默认的欢迎内容', () => {
    render(<MarkdownEditor />);
    
    expect(screen.getByText('欢迎使用 Markdown 编辑器')).toBeInTheDocument();
  });
}); 