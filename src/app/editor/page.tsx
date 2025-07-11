import { MarkdownEditor } from '@/components/editor/MarkdownEditor';

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Markdown 编辑器</h1>
          <p className="text-muted-foreground">
            功能完整的 Markdown 编辑器，支持实时预览、工具栏快捷操作和语法高亮
          </p>
        </div>
        <MarkdownEditor />
      </div>
    </div>
  );
} 