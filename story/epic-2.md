# Epic 2: 基于Monaco Editor的Markdown编辑器

## 背景与目标

实现一个基于Monaco Editor的Markdown编辑器，提供专业的代码编辑体验和实时预览功能。

**核心功能：**

- 基于Monaco Editor的Markdown文本编辑
- 实时预览
- 文档保存
- 语法高亮和智能提示

**技术约束：**

- 使用Monaco Editor作为编辑器核心
- 基于浏览器实现
- 轻量级，无复杂功能
- 类似Typora的简洁界面

## 用户故事

### 作为用户，我希望：

1. 在左侧使用Monaco Editor编辑Markdown文本，享受专业的编辑体验
2. 在右侧实时看到渲染后的效果
3. 能够保存我的文档到本地
4. 享受Monaco Editor提供的语法高亮、自动补全等功能

## 验收标准

- [ ] 左侧集成Monaco Editor作为Markdown编辑区域
- [ ] 右侧显示Markdown预览区域
- [ ] 编辑时实时更新预览
- [ ] Monaco Editor支持Markdown语法高亮
- [ ] 支持基本的Markdown语法（标题、列表、链接、图片等）
- [ ] 提供保存功能（下载为.md文件）
- [ ] Monaco Editor提供智能提示和自动补全功能

## 技术实现要点

- 使用React + TypeScript
- 集成Monaco Editor (`@monaco-editor/react`)
- Markdown解析库（如marked.js）
- 文件下载功能
- Monaco Editor配置为Markdown模式
