// mock ESM 依赖，避免 Jest 报错
jest.mock('react-markdown', () => () => null)
jest.mock('remark-gfm', () => ({}))

import { htmlToMarkdown, isMarkdownSafe, sanitizeMarkdown } from '../markdown'

describe('markdown工具函数', () => {
  describe('htmlToMarkdown', () => {
    it('应该将HTML标题转换为Markdown', () => {
      const html = '<h1>标题1</h1><h2>标题2</h2><h3>标题3</h3>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toBe('# 标题1\n## 标题2\n### 标题3')
    })

    it('应该将HTML粗体和斜体转换为Markdown', () => {
      const html = '<strong>粗体文本</strong> 和 <em>斜体文本</em>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toBe('**粗体文本** 和 *斜体文本*')
    })

    it('应该将HTML代码转换为Markdown', () => {
      const html = '<code>内联代码</code> 和 <pre><code>代码块</code></pre>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toBe('`内联代码` 和 `代码块`')
    })

    it('应该将HTML引用转换为Markdown', () => {
      const html = '<blockquote>引用内容</blockquote>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toBe('> 引用内容')
    })

    it('应该将HTML列表转换为Markdown', () => {
      const html =
        '<ul><li>项目1</li><li>项目2</li></ul><ol><li>有序1</li><li>有序2</li></ol>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toBe('- 项目1\n- 项目2\n1. $1\n2. $1')
    })

    it('应该将HTML链接转换为Markdown', () => {
      const html = '<a href="https://example.com">链接文本</a>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toBe('[链接文本](https://example.com)')
    })

    it('应该处理HTML实体', () => {
      const html = '<p>文本 &lt; 和 &gt; 和 &amp;</p>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toBe('文本 < 和 > 和 &')
    })

    it('应该处理空HTML', () => {
      const markdown = htmlToMarkdown('')
      expect(markdown).toBe('')
    })

    it('应该清理多余的空行', () => {
      const html = '<p>段落1</p><p>段落2</p><p>段落3</p>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toBe('段落1\n\n段落2\n\n段落3')
    })
  })

  describe('isMarkdownSafe', () => {
    it('应该检测脚本标签', () => {
      const dangerousMarkdown = '<script>alert("xss")</script># 标题'
      expect(isMarkdownSafe(dangerousMarkdown)).toBe(false)
    })

    it('应该检测javascript协议', () => {
      const dangerousMarkdown = '[点击](javascript:alert("xss"))'
      expect(isMarkdownSafe(dangerousMarkdown)).toBe(false)
    })

    it('应该检测data协议', () => {
      const dangerousMarkdown =
        '[图片](data:text/html,<script>alert("xss")</script>)'
      expect(isMarkdownSafe(dangerousMarkdown)).toBe(false)
    })

    it('应该允许安全的Markdown内容', () => {
      const safeMarkdown = '# 标题\n**粗体** [链接](https://example.com)'
      expect(isMarkdownSafe(safeMarkdown)).toBe(true)
    })

    it('应该允许包含HTML标签但不包含脚本', () => {
      const safeMarkdown = '<div>内容</div><p>段落</p>'
      expect(isMarkdownSafe(safeMarkdown)).toBe(true)
    })
  })

  describe('sanitizeMarkdown', () => {
    it('应该移除脚本标签', () => {
      const dangerousMarkdown = '<script>alert("xss")</script># 标题'
      const sanitized = sanitizeMarkdown(dangerousMarkdown)
      expect(sanitized).toBe('# 标题')
      expect(sanitized).not.toContain('<script>')
    })

    it('应该移除javascript协议', () => {
      const dangerousMarkdown = '[点击](javascript:alert("xss"))'
      const sanitized = sanitizeMarkdown(dangerousMarkdown)
      expect(sanitized).toBe('[点击]())')
    })

    it('应该移除data协议', () => {
      const dangerousMarkdown =
        '[图片](data:text/html,<script>alert("xss")</script>)'
      const sanitized = sanitizeMarkdown(dangerousMarkdown)
      expect(sanitized).toBe('[图片]()')
    })

    it('应该保留安全的Markdown内容', () => {
      const safeMarkdown = '# 标题\n**粗体** [链接](https://example.com)'
      const sanitized = sanitizeMarkdown(safeMarkdown)
      expect(sanitized).toBe(safeMarkdown)
    })

    it('应该处理多个危险内容', () => {
      const dangerousMarkdown =
        '<script>alert("xss")</script>[点击](javascript:alert("xss"))# 标题'
      const sanitized = sanitizeMarkdown(dangerousMarkdown)
      expect(sanitized).toBe('[点击]())# 标题')
    })
  })
})
