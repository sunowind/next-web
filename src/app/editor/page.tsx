import { MarkdownEditor } from '@/components/editor/MarkdownEditor';

export default function EditorPage() {
    return (
        <div className="min-h-screen bg-background">
            <MarkdownEditor
                initialValue={`# Welcome to Markdown Editor

This is a **professional** Markdown editor built with Monaco Editor.

## Features

- Real-time preview
- Syntax highlighting
- Toolbar shortcuts
- VS Code-like experience

### Getting Started

1. Start typing in the editor
2. Use the toolbar buttons for formatting
3. Toggle preview on/off
4. Enjoy the professional editing experience!

> This editor provides a modern, responsive interface for content creation.

\`\`\`javascript
// You can even write code blocks
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

- Feature 1
- Feature 2
- Feature 3

1. First step
2. Second step
3. Third step

[Link to documentation](https://example.com)

![Image description](https://via.placeholder.com/300x200)`}
            />
        </div>
    );
} 