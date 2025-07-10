import { MarkdownEditor } from '@/components/editor/MarkdownEditor';

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Markdown 编辑器</h1>
        <MarkdownEditor />
      </div>
    </div>
  );
} 