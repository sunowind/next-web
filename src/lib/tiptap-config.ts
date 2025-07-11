import Blockquote from '@tiptap/extension-blockquote'
import Bold from '@tiptap/extension-bold'
import BulletList from '@tiptap/extension-bullet-list'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import Heading from '@tiptap/extension-heading'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import StarterKit from '@tiptap/starter-kit'

export const tiptapExtensions = [
  StarterKit.configure({
    heading: false,
    listItem: false,
    bulletList: false,
    orderedList: false,
    bold: false,
    italic: false,
    code: false,
    codeBlock: false,
    blockquote: false,
  }),
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),
  ListItem,
  BulletList,
  OrderedList,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      target: '_blank',
      rel: 'noopener noreferrer',
      class: 'text-blue-600 hover:text-blue-800 underline',
    },
  }),
  Bold.configure({
    HTMLAttributes: {
      class: 'font-bold',
    },
  }),
  Italic.configure({
    HTMLAttributes: {
      class: 'italic',
    },
  }),
  Code.configure({
    HTMLAttributes: {
      class: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
    },
  }),
  CodeBlock.configure({
    HTMLAttributes: {
      class: 'bg-gray-100 p-3 rounded mb-3 overflow-x-auto font-mono text-sm',
    },
  }),
  Blockquote.configure({
    HTMLAttributes: {
      class: 'border-l-4 border-gray-300 pl-4 mb-3 italic',
    },
  }),
]

export const tiptapEditorProps = {
  extensions: tiptapExtensions,
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
    },
  },
  // 添加实时更新配置
  onUpdate: ({ editor }: { editor: any }) => {
    // 这个回调会在组件中处理
  },
}
