import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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

describe('MarkdownEditor Integration Tests', () => {
  it('应该能够完成完整的编辑和预览流程', async () => {
    render(<MarkdownEditor />);
    
    // 1. 检查初始状态
    expect(screen.getByText('欢迎使用 Markdown 编辑器')).toBeInTheDocument();
    
    // 2. 清空编辑器并输入新的内容
    const textarea = screen.getByPlaceholderText('在这里输入 Markdown 内容...');
    fireEvent.change(textarea, { target: { value: '' } });
    fireEvent.change(textarea, { 
      target: { 
        value: '# 我的文档\n\n这是一个**测试文档**。\n\n- 列表项1\n- 列表项2' 
      } 
    });
    
    // 3. 验证编辑区域的内容
    expect(textarea).toHaveValue('# 我的文档\n\n这是一个**测试文档**。\n\n- 列表项1\n- 列表项2');
    
    // 4. 验证预览区域的内容
    await waitFor(() => {
      expect(screen.getByText('我的文档')).toBeInTheDocument();
      expect(screen.getByText('测试文档')).toBeInTheDocument();
    });
  });

  it('应该能够处理实时输入更新', async () => {
    render(<MarkdownEditor />);
    
    const textarea = screen.getByPlaceholderText('在这里输入 Markdown 内容...');
    
    // 逐步输入内容
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    await waitFor(() => {
      // 只断言预览区内容
      const preview = screen.getByText('预览区域').parentElement as HTMLElement;
      expect(within(preview).getByText('Hello')).toBeInTheDocument();
    });
    
    fireEvent.change(textarea, { target: { value: 'Hello **World**' } });
    await waitFor(() => {
      const preview = screen.getByText('预览区域').parentElement as HTMLElement;
      expect(within(preview).getByText('Hello')).toBeInTheDocument();
      expect(within(preview).getByText('World')).toBeInTheDocument();
    });
  });

  it('应该能够处理特殊字符和格式', async () => {
    render(<MarkdownEditor />);
    
    const textarea = screen.getByPlaceholderText('在这里输入 Markdown 内容...');
    fireEvent.change(textarea, { 
      target: { 
        value: '## 二级标题\n\n*斜体文本*\n\n### 三级标题' 
      } 
    });
    
    await waitFor(() => {
      expect(screen.getByText('二级标题')).toBeInTheDocument();
      expect(screen.getByText('斜体文本')).toBeInTheDocument();
      expect(screen.getByText('三级标题')).toBeInTheDocument();
    });
  });
}); 