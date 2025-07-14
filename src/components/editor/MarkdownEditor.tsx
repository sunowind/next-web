'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Bold,
    Code,
    Download,
    Edit3,
    Eye,
    Image,
    Italic,
    Link,
    List,
    ListOrdered,
    Maximize2,
    Minimize2,
    Monitor,
    Quote,
    Upload
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

// 动态导入Monaco Editor以避免SSR问题
const MonacoEditor = dynamic(
    () => import('@monaco-editor/react'),
    {
        ssr: false,
        loading: () => <div className="flex items-center justify-center h-96 bg-muted">Loading editor...</div>
    }
);

type ViewMode = 'edit' | 'preview' | 'live';

interface MarkdownEditorProps {
    initialValue?: string;
    onChange?: (value: string) => void;
}

// 防抖函数
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function MarkdownEditor({ initialValue = '', onChange }: MarkdownEditorProps) {
    const [content, setContent] = useState(initialValue);
    const [viewMode, setViewMode] = useState<ViewMode>('live');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const editorRef = useRef<import('monaco-editor').editor.IStandaloneCodeEditor | null>(null);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    // 使用防抖处理预览更新，延迟100ms以内
    const debouncedContent = useDebounce(content, 80);

    useEffect(() => {
        if (onChange) {
            onChange(content);
        }
    }, [content, onChange]);

    // 键盘快捷键处理
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + E: 切换到编辑模式
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                setViewMode('edit');
            }
            // Ctrl/Cmd + P: 切换到预览模式
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                setViewMode('preview');
            }
            // Ctrl/Cmd + L: 切换到实时预览模式
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                setViewMode('live');
            }
            // F11: 全屏切换
            if (e.key === 'F11') {
                e.preventDefault();
                setIsFullscreen(!isFullscreen);
            }
            // Escape: 退出全屏
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    const handleEditorDidMount = (editor: import('monaco-editor').editor.IStandaloneCodeEditor) => {
        editorRef.current = editor;
        setIsEditorReady(true);

        // 配置Monaco Editor的Markdown语言支持
        editor.updateOptions({
            suggest: {
                showWords: true,
                showSnippets: true,
                showClasses: false,
                showFunctions: false,
                showVariables: false,
                showModules: false,
                showProperties: false,
                showEvents: false,
                showOperators: false,
                showUnits: false,
                showValues: false,
                showConstants: false,
                showEnums: false,
                showEnumMembers: false,
                showKeywords: false,
                showColors: false,
                showFiles: false,
                showReferences: false,
                showFolders: false,
                showTypeParameters: false,
            },
            quickSuggestions: {
                other: true,
                comments: false,
                strings: false,
            },
            parameterHints: {
                enabled: true,
            },
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordBasedSuggestions: 'on',
        });
    };

    const insertText = (text: string, selection?: string) => {
        if (!editorRef.current) return;

        const editor = editorRef.current;
        const selection_ = editor.getSelection();
        const selectedText = editor.getModel().getValueInRange(selection_);

        const insertText = selection ? text.replace('{selection}', selectedText) : text;

        editor.executeEdits('', [{
            range: selection_,
            text: insertText,
            forceMoveMarkers: true
        }]);

        editor.focus();
    };

    const handleSave = () => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleLoad = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown,text/markdown';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target?.result as string;
                    setContent(text);
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const toolbarActions = [
        { icon: Bold, action: () => insertText('**{selection}**', '{selection}'), label: 'Bold', shortcut: 'Ctrl+B' },
        { icon: Italic, action: () => insertText('*{selection}*', '{selection}'), label: 'Italic', shortcut: 'Ctrl+I' },
        { icon: List, action: () => insertText('- '), label: 'Unordered List', shortcut: 'Ctrl+U' },
        { icon: ListOrdered, action: () => insertText('1. '), label: 'Ordered List', shortcut: 'Ctrl+O' },
        { icon: Quote, action: () => insertText('> '), label: 'Quote', shortcut: 'Ctrl+Q' },
        { icon: Code, action: () => insertText('`{selection}`', '{selection}'), label: 'Inline Code', shortcut: 'Ctrl+K' },
        { icon: Link, action: () => insertText('[text](url)'), label: 'Link', shortcut: 'Ctrl+L' },
        { icon: Image, action: () => insertText('![alt](url)'), label: 'Image', shortcut: 'Ctrl+M' },
    ];

    const fileActions = [
        { icon: Upload, action: handleLoad, label: 'Load File', shortcut: 'Ctrl+O' },
        { icon: Download, action: handleSave, label: 'Save File', shortcut: 'Ctrl+S' },
    ];

    const viewModeActions = [
        {
            icon: Edit3,
            mode: 'edit' as ViewMode,
            label: 'Edit Mode',
            shortcut: 'Ctrl+E',
            description: 'Pure editor view'
        },
        {
            icon: Eye,
            mode: 'preview' as ViewMode,
            label: 'Preview Mode',
            shortcut: 'Ctrl+P',
            description: 'Pure preview view'
        },
        {
            icon: Monitor,
            mode: 'live' as ViewMode,
            label: 'Live Preview',
            shortcut: 'Ctrl+L',
            description: 'Editor + preview side by side'
        },
    ];

    const renderMarkdown = useCallback((markdown: string) => {
        if (!markdown.trim()) {
            return '<p class="text-muted-foreground italic">Start typing to see the preview...</p>';
        }

        const html = markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')

            // Bold and italic
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

            // Inline code
            .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')

            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$2</code></pre>')

            // Blockquotes
            .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">$1</blockquote>')

            // Lists
            .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
            .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$2</li>')

            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">$1</a>')

            // Images
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')

            // Horizontal rules
            .replace(/^---$/gm, '<hr class="my-6 border-border" />')

            // Paragraphs
            .replace(/\n\n/g, '</p><p class="mb-4">')
            .replace(/^(.+)$/gm, '<p class="mb-4">$1')
            .replace(/<\/p><p class="mb-4">/g, '</p><p class="mb-4">')

            // Wrap lists properly
            .replace(/<li class="ml-4">/g, '<ul class="list-disc ml-6 mb-4"><li class="ml-4">')
            .replace(/<\/li>/g, '</li></ul>')

            // Clean up empty paragraphs
            .replace(/<p class="mb-4"><\/p>/g, '')
            .replace(/<p class="mb-4">\s*<\/p>/g, '');

        return html;
    }, []);

    const getEditorWidth = () => {
        switch (viewMode) {
            case 'edit':
                return 'w-full';
            case 'preview':
                return 'w-0';
            case 'live':
                return 'w-1/2';
            default:
                return 'w-1/2';
        }
    };

    const getPreviewWidth = () => {
        switch (viewMode) {
            case 'edit':
                return 'w-0';
            case 'preview':
                return 'w-full';
            case 'live':
                return 'w-1/2';
            default:
                return 'w-1/2';
        }
    };

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-screen'} flex flex-col`}>
            {/* Toolbar */}
            <div className="border-b bg-background p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {/* Formatting Tools */}
                        <div className="flex items-center space-x-1 border-r pr-2">
                            {toolbarActions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    onClick={action.action}
                                    title={`${action.label} (${action.shortcut})`}
                                    disabled={!isEditorReady}
                                >
                                    <action.icon className="h-4 w-4" />
                                </Button>
                            ))}
                        </div>

                        {/* File Operations */}
                        <div className="flex items-center space-x-1 border-r pr-2">
                            {fileActions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    onClick={action.action}
                                    title={`${action.label} (${action.shortcut})`}
                                >
                                    <action.icon className="h-4 w-4" />
                                </Button>
                            ))}
                        </div>

                        {/* View Mode Controls */}
                        <div className="flex items-center space-x-1 border-r pr-2">
                            {viewModeActions.map((action) => (
                                <Button
                                    key={action.mode}
                                    variant={viewMode === action.mode ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode(action.mode)}
                                    title={`${action.label} (${action.shortcut}) - ${action.description}`}
                                >
                                    <action.icon className="h-4 w-4" />
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen (F11)"}
                        >
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Editor and Preview */}
            <div className="flex-1 flex">
                {/* Editor */}
                <div className={`${getEditorWidth()} ${viewMode !== 'preview' ? 'border-r' : ''} transition-all duration-200`}>
                    {viewMode !== 'preview' && (
                        <MonacoEditor
                            height="100%"
                            language="markdown"
                            theme="vs-dark"
                            value={content}
                            onChange={(value) => setContent(value || '')}
                            onMount={handleEditorDidMount}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: 'JetBrains Mono, Consolas, monospace',
                                wordWrap: 'on',
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                folding: true,
                                foldingStrategy: 'indentation',
                                showFoldingControls: 'always',
                                renderWhitespace: 'selection',
                                renderControlCharacters: false,
                                renderLineHighlight: 'all',
                                cursorBlinking: 'smooth',
                                cursorSmoothCaretAnimation: 'on',
                                smoothScrolling: true,
                                mouseWheelZoom: true,
                                suggest: {
                                    showWords: true,
                                    showSnippets: true,
                                    showClasses: false,
                                    showFunctions: false,
                                    showVariables: false,
                                    showModules: false,
                                    showProperties: false,
                                    showEvents: false,
                                    showOperators: false,
                                    showUnits: false,
                                    showValues: false,
                                    showConstants: false,
                                    showEnums: false,
                                    showEnumMembers: false,
                                    showKeywords: false,
                                    showColors: false,
                                    showFiles: false,
                                    showReferences: false,
                                    showFolders: false,
                                    showTypeParameters: false,
                                },
                                quickSuggestions: {
                                    other: true,
                                    comments: false,
                                    strings: false,
                                },
                                parameterHints: {
                                    enabled: true,
                                },
                                acceptSuggestionOnCommitCharacter: true,
                                acceptSuggestionOnEnter: 'on',
                                tabCompletion: 'on',
                                wordBasedSuggestions: 'on',
                            }}
                        />
                    )}
                </div>

                {/* Preview */}
                <div className={`${getPreviewWidth()} transition-all duration-200 ${viewMode !== 'edit' ? 'overflow-y-auto' : ''}`}>
                    {viewMode !== 'edit' && (
                        <div className="h-full p-6">
                            <Card className="h-full">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <span>Preview</span>
                                        <div className="text-xs text-muted-foreground">
                                            {viewMode === 'live' && 'Live Preview'}
                                            {viewMode === 'preview' && 'Preview Only'}
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-full overflow-y-auto">
                                    <div
                                        ref={previewRef}
                                        className="prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{
                                            __html: renderMarkdown(debouncedContent)
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 