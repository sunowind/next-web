import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReactElement } from 'react';

/**
 * 解析Markdown文本为React元素
 * @param markdown - Markdown文本
 * @returns React元素
 */
export function parseMarkdown(markdown: string): ReactElement {
  return React.createElement(ReactMarkdown, {
    remarkPlugins: [remarkGfm],
    components: {
      h1: ({ children }: { children: React.ReactNode }) => 
        React.createElement('h1', { className: 'text-2xl font-bold mb-4' }, children),
      h2: ({ children }: { children: React.ReactNode }) => 
        React.createElement('h2', { className: 'text-xl font-bold mb-3' }, children),
      h3: ({ children }: { children: React.ReactNode }) => 
        React.createElement('h3', { className: 'text-lg font-bold mb-2' }, children),
      p: ({ children }: { children: React.ReactNode }) => 
        React.createElement('p', { className: 'mb-2' }, children),
      strong: ({ children }: { children: React.ReactNode }) => 
        React.createElement('strong', { className: 'font-bold' }, children),
      em: ({ children }: { children: React.ReactNode }) => 
        React.createElement('em', { className: 'italic' }, children),
      code: ({ children }: { children: React.ReactNode }) => 
        React.createElement('code', { className: 'bg-gray-100 px-1 py-0.5 rounded text-sm' }, children),
      pre: ({ children }: { children: React.ReactNode }) => 
        React.createElement('pre', { className: 'bg-gray-100 p-3 rounded mb-3 overflow-x-auto' }, children),
      blockquote: ({ children }: { children: React.ReactNode }) => 
        React.createElement('blockquote', { className: 'border-l-4 border-gray-300 pl-4 mb-3 italic' }, children),
      ul: ({ children }: { children: React.ReactNode }) => 
        React.createElement('ul', { className: 'list-disc list-inside mb-3' }, children),
      ol: ({ children }: { children: React.ReactNode }) => 
        React.createElement('ol', { className: 'list-decimal list-inside mb-3' }, children),
      li: ({ children }: { children: React.ReactNode }) => 
        React.createElement('li', { className: 'mb-1' }, children),
      a: ({ href, children }: { href?: string; children: React.ReactNode }) => 
        React.createElement('a', { 
          href, 
          className: 'text-blue-600 hover:underline', 
          target: '_blank', 
          rel: 'noopener noreferrer' 
        }, children),
    }
  }, markdown);
}

/**
 * 验证Markdown文本是否包含潜在的危险内容
 * @param markdown - Markdown文本
 * @returns 是否安全
 */
export function isMarkdownSafe(markdown: string): boolean {
  // 检查是否包含脚本标签
  const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  if (scriptPattern.test(markdown)) {
    return false;
  }

  // 检查是否包含javascript:协议
  const javascriptPattern = /javascript:/gi;
  if (javascriptPattern.test(markdown)) {
    return false;
  }

  // 检查是否包含data:协议
  const dataPattern = /data:/gi;
  if (dataPattern.test(markdown)) {
    return false;
  }

  return true;
}

/**
 * 清理Markdown文本，移除潜在的危险内容
 * @param markdown - Markdown文本
 * @returns 清理后的Markdown文本
 */
export function sanitizeMarkdown(markdown: string): string {
  // 移除脚本标签
  let sanitized = markdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 用回调函数精确处理危险协议链接
  sanitized = sanitized.replace(/\[([^\]]+)\]\((.*?)\)/gi, (match, text, url) => {
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
      return `[${text}]()`;
    }
    return match;
  });

  // 兜底移除剩余的javascript:和data:协议
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');

  return sanitized;
} 