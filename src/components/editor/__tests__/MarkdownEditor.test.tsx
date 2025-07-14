import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react'; // Added missing import for React.useEffect
import { MarkdownEditor } from '../MarkdownEditor';

// Mock fetch
global.fetch = jest.fn();

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => {
    return function MockMonacoEditor({ value, onChange, onMount, height }: any) {
        // 保证onMount在渲染时就被调用
        React.useEffect(() => {
            onMount?.({ updateOptions: jest.fn(), getSelection: () => ({ startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }), getModel: () => ({ getValueInRange: () => '' }), executeEdits: jest.fn(), focus: jest.fn() });
        }, [onMount]);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onChange?.(e.target.value);
        };

        return (
            <div style={{ height }}>
                <textarea
                    data-testid="monaco-editor"
                    value={value || ''}
                    onChange={handleChange}
                    placeholder="Start typing..."
                    style={{ width: '100%', height: '100%', border: '1px solid #ccc' }}
                />
            </div>
        );
    };
});

// Mock Next.js dynamic import
jest.mock('next/dynamic', () => {
    return function MockDynamicImport(importFn: any, options: any) {
        // 直接返回 @monaco-editor/react 的 mock
        return require('@monaco-editor/react');
    };
});

describe('MarkdownEditor', () => {
    beforeEach(() => {
        // Mock window.matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });
    });

    it('renders with initial value', () => {
        const initialValue = '# Test Heading\n\nThis is a test.';
        render(<MarkdownEditor initialValue={initialValue} />);

        expect(screen.getByTestId('monaco-editor')).toHaveValue(initialValue);
    });

    it('updates content when typing', async () => {
        const user = userEvent.setup();
        render(<MarkdownEditor />);

        const editor = screen.getByTestId('monaco-editor');
        await user.type(editor, '# New Heading');

        expect(editor).toHaveValue('# New Heading');
    });

    it('shows preview by default in live mode', () => {
        render(<MarkdownEditor initialValue="# Test" />);

        expect(screen.getByText('Preview')).toBeInTheDocument();
        expect(screen.getByText('Live Preview')).toBeInTheDocument();
    });

    it('switches to edit mode when edit button is clicked', async () => {
        const user = userEvent.setup();
        render(<MarkdownEditor />);

        const editButton = screen.getByTitle(/Edit Mode/);
        await user.click(editButton);

        // Preview should be hidden in edit mode
        expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });

    it('switches to preview mode when preview button is clicked', async () => {
        const user = userEvent.setup();
        render(<MarkdownEditor initialValue="# Test" />);

        const previewButton = screen.getByTitle(/Preview Mode/);
        await user.click(previewButton);

        expect(screen.getByText('Preview Only')).toBeInTheDocument();
    });

    it('supports keyboard shortcuts', async () => {
        const user = userEvent.setup();
        render(<MarkdownEditor />);

        // Test Ctrl+E for edit mode
        await user.keyboard('{Control>}e{/Control}');
        expect(screen.queryByText('Preview')).not.toBeInTheDocument();

        // Test Ctrl+P for preview mode
        await user.keyboard('{Control>}p{/Control}');
        expect(screen.getByText('Preview Only')).toBeInTheDocument();

        // Test Ctrl+L for live mode
        await user.keyboard('{Control>}l{/Control}');
        expect(screen.getByText('Live Preview')).toBeInTheDocument();
    });

    it('renders markdown content in preview', () => {
        const markdownContent = `
# Heading 1
## Heading 2
**Bold text**
*Italic text*
- List item 1
- List item 2

\`\`\`javascript
console.log("Hello World");
\`\`\`
        `;

        render(<MarkdownEditor initialValue={markdownContent} />);

        // Check if markdown is rendered
        expect(screen.getByText('Heading 1')).toBeInTheDocument();
        expect(screen.getByText('Heading 2')).toBeInTheDocument();
        expect(screen.getByText('Bold text')).toBeInTheDocument();
        expect(screen.getByText('Italic text')).toBeInTheDocument();
    });

    it('shows toolbar with formatting buttons', () => {
        render(<MarkdownEditor />);

        // Check for formatting buttons
        expect(screen.getByTitle(/Bold/)).toBeInTheDocument();
        expect(screen.getByTitle(/Italic/)).toBeInTheDocument();
        expect(screen.getByTitle(/Unordered List/)).toBeInTheDocument();
        expect(screen.getByTitle(/Ordered List/)).toBeInTheDocument();
        expect(screen.getByTitle(/Quote/)).toBeInTheDocument();
        expect(screen.getByTitle(/Inline Code/)).toBeInTheDocument();
        expect(screen.getByTitle(/Link/)).toBeInTheDocument();
        expect(screen.getByTitle(/Image/)).toBeInTheDocument();
    });

    it('shows file operation buttons', () => {
        render(<MarkdownEditor />);

        expect(screen.getByTitle(/Load File/)).toBeInTheDocument();
        expect(screen.getByTitle(/Save File/)).toBeInTheDocument();
    });

    it('shows fullscreen toggle button', () => {
        render(<MarkdownEditor />);

        expect(screen.getByTitle(/Enter Fullscreen/)).toBeInTheDocument();
    });

    it('calls onChange callback when content changes', async () => {
        const onChange = jest.fn();
        const user = userEvent.setup();
        render(<MarkdownEditor onChange={onChange} />);

        const editor = screen.getByTestId('monaco-editor');
        await user.type(editor, 'New content');

        expect(onChange).toHaveBeenCalledWith('New content');
    });
}); 