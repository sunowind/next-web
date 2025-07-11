import React, { ReactElement } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * 将HTML转换为Markdown格式
 * @param html - HTML字符串
 * @returns Markdown字符串
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return ''

  return (
    html
      // 处理标题
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n')

      // 处理粗体和斜体
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')

      // 处理代码
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```')

      // 处理引用
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, (match, content) => {
        // 处理引用内的换行
        const lines = content
          .split('\n')
          .map((line: string) => `> ${line.trim()}`)
          .join('\n')
        return lines + '\n'
      })

      // 处理列表
      .replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      })
      .replace(/<ol[^>]*>(.*?)<\/ol>/gi, (match, content) => {
        let counter = 1
        return content.replace(
          /<li[^>]*>(.*?)<\/li>/gi,
          () => `${counter++}. $1\n`,
        )
      })

      // 处理链接
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')

      // 处理段落和换行
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n')

      // 清理HTML标签
      .replace(/<[^>]*>/g, '')

      // 处理HTML实体
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')

      // 清理多余的空行和空格
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}

/**
 * 解析Markdown文本为React元素
 * @param markdown - Markdown文本
 * @returns React元素
 */
export function parseMarkdown(markdown: string): ReactElement {
  return React.createElement(
    ReactMarkdown,
    {
      remarkPlugins: [remarkGfm],
      components: {
        h1: ({
          children,
          ...props
        }: {
          children?: React.ReactNode
          [key: string]: unknown
        }) =>
          React.createElement(
            'h1',
            { className: 'text-2xl font-bold mb-4', ...props },
            children,
          ),
        h2: ({
          children,
          ...props
        }: {
          children?: React.ReactNode
          [key: string]: unknown
        }) =>
          React.createElement(
            'h2',
            { className: 'text-xl font-bold mb-3', ...props },
            children,
          ),
        h3: ({
          children,
          ...props
        }: {
          children?: React.ReactNode
          [key: string]: unknown
        }) =>
          React.createElement(
            'h3',
            { className: 'text-lg font-bold mb-2', ...props },
            children,
          ),
        p: ({
          children,
          ...props
        }: {
          children?: React.ReactNode
          [key: string]: unknown
        }) =>
          React.createElement('p', { className: 'mb-2', ...props }, children),
        strong: ({
          children,
          ...props
        }: {
          children?: React.ReactNode
          [key: string]: unknown
        }) =>
          React.createElement(
            'strong',
            { className: 'font-bold', ...props },
            children,
          ),
        em: ({
          children,
          ...props
        }: {
          children?: React.ReactNode
          [key: string]: unknown
        }) =>
          React.createElement(
            'em',
            { className: 'italic', ...props },
            children,
          ),
        code: ({
          children,
          ...props
        }: {
          children?: React.ReactNode
          [key: string]: unknown
        }) =>
          React.createElement(
            'code',
            { className: 'bg-gray-100 px-1 py-0.5 rounded text-sm', ...props },
            children,
          ),
        pre: ({
          children,
          ...props
        }: {
          children?: React.ReactNode
          [key: string]: unknown
        }) =>
          React.createElement(
            'pre',
            {
              className: 'bg-gray-100 p-3 rounded mb-3 overflow-x-auto',
              ...props,
            },
            children,
          ),
        blockquote: ({
          children,
          ...props
        }: {
          children?: React.ReactNode
          [key: string]: unknown
        }) =>
          React.createElement(
            'blockquote',
            {
              className: 'border-l-4 border-gray-300 pl-4 mb-3 italic',
              ...props,
            },
            children,
          ),
        ul: ({
          children,
          ...props
        }: {
          children?: React.ReactNode
          [key: string]: unknown
        }) =>
          React.createElement(
            'ul',
            { className: 'list-disc list-inside mb-3', ...props },
            children,
          ),
        ol: ({
          children,
          ...props
        }: {
          children?: React.ReactNode
          [key: string]: unknown
        }) =>
          React.createElement(
            'ol',
            { className: 'list-decimal list-inside mb-3', ...props },
            children,
          ),
        li: ({
          children,
          ...props
        }: {
          children?: React.ReactNode
          [key: string]: unknown
        }) =>
          React.createElement('li', { className: 'mb-1', ...props }, children),
        a: ({
          href,
          children,
          ...props
        }: {
          href?: string
          children?: React.ReactNode
          [key: string]: unknown
        }) =>
          React.createElement(
            'a',
            {
              href,
              className: 'text-blue-600 hover:underline',
              target: '_blank',
              rel: 'noopener noreferrer',
              ...props,
            },
            children,
          ),
      },
    },
    markdown,
  )
}

/**
 * 验证Markdown文本是否包含潜在的危险内容
 * @param markdown - Markdown文本
 * @returns 是否安全
 */
export function isMarkdownSafe(markdown: string): boolean {
  // 检查是否包含脚本标签
  const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
  if (scriptPattern.test(markdown)) {
    return false
  }

  // 检查是否包含javascript:协议
  const javascriptPattern = /javascript:/gi
  if (javascriptPattern.test(markdown)) {
    return false
  }

  // 检查是否包含data:协议
  const dataPattern = /data:/gi
  if (dataPattern.test(markdown)) {
    return false
  }

  return true
}

/**
 * 清理Markdown文本，移除潜在的危险内容
 * @param markdown - Markdown文本
 * @returns 清理后的Markdown文本
 */
export function sanitizeMarkdown(markdown: string): string {
  // 移除脚本标签
  let sanitized = markdown.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    '',
  )

  // 用回调函数精确处理危险协议链接
  sanitized = sanitized.replace(
    /\[([^\]]+)\]\((.*?)\)/gi,
    (match, text, url) => {
      const trimmed = url.trim().toLowerCase()
      if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
        return `[${text}]()`
      }
      return match
    },
  )

  // 兜底移除剩余的javascript:和data:协议
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/data:/gi, '')

  return sanitized
}
