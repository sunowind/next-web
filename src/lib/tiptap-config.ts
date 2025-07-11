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
    },
  }),
  Bold,
  Italic,
  Code,
  CodeBlock,
  Blockquote,
]

export const tiptapEditorProps = {
  extensions: tiptapExtensions,
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
    },
  },
}
