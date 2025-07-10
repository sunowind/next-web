// mock ESM 依赖，避免 Jest 报错
jest.mock('react-markdown', () => () => null);
jest.mock('remark-gfm', () => ({}));

import { isMarkdownSafe, sanitizeMarkdown } from '../markdown';

describe('markdown工具函数', () => {
  describe('isMarkdownSafe', () => {
    it('应该检测脚本标签', () => {
      const dangerousMarkdown = '<script>alert("xss")</script># 标题';
      expect(isMarkdownSafe(dangerousMarkdown)).toBe(false);
    });

    it('应该检测javascript协议', () => {
      const dangerousMarkdown = '[点击](javascript:alert("xss"))';
      expect(isMarkdownSafe(dangerousMarkdown)).toBe(false);
    });

    it('应该检测data协议', () => {
      const dangerousMarkdown = '[图片](data:text/html,<script>alert("xss")</script>)';
      expect(isMarkdownSafe(dangerousMarkdown)).toBe(false);
    });

    it('应该允许安全的Markdown内容', () => {
      const safeMarkdown = '# 标题\n**粗体** [链接](https://example.com)';
      expect(isMarkdownSafe(safeMarkdown)).toBe(true);
    });

    it('应该允许包含HTML标签但不包含脚本', () => {
      const safeMarkdown = '<div>内容</div><p>段落</p>';
      expect(isMarkdownSafe(safeMarkdown)).toBe(true);
    });
  });

  describe('sanitizeMarkdown', () => {
    it('应该移除脚本标签', () => {
      const dangerousMarkdown = '<script>alert("xss")</script># 标题';
      const sanitized = sanitizeMarkdown(dangerousMarkdown);
      expect(sanitized).toBe('# 标题');
      expect(sanitized).not.toContain('<script>');
    });

    it('应该移除javascript协议', () => {
      const dangerousMarkdown = '[点击](javascript:alert("xss"))';
      const sanitized = sanitizeMarkdown(dangerousMarkdown);
      expect(sanitized).toBe('[点击]()');
    });

    it('应该移除data协议', () => {
      const dangerousMarkdown = '[图片](data:text/html,<script>alert("xss")</script>)';
      const sanitized = sanitizeMarkdown(dangerousMarkdown);
      expect(sanitized).toBe('[图片]()');
    });

    it('应该保留安全的Markdown内容', () => {
      const safeMarkdown = '# 标题\n**粗体** [链接](https://example.com)';
      const sanitized = sanitizeMarkdown(safeMarkdown);
      expect(sanitized).toBe(safeMarkdown);
    });

    it('应该处理多个危险内容', () => {
      const dangerousMarkdown = '<script>alert("xss")</script>[点击](javascript:alert("xss"))# 标题';
      const sanitized = sanitizeMarkdown(dangerousMarkdown);
      expect(sanitized).toBe('[点击]()# 标题');
    });
  });
}); 