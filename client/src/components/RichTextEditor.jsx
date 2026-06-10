import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, Heading1, Heading2, Quote } from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b border-sage-gold bg-sage-gold/25 rounded-t-2xl">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-xl transition-all cursor-pointer hover:bg-sage-gold/20 ${editor.isActive('bold') ? 'bg-deep-forest text-paper-cream shadow-sm' : 'text-deep-forest/40'}`}
        type="button"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-xl transition-all cursor-pointer hover:bg-sage-gold/20 ${editor.isActive('italic') ? 'bg-deep-forest text-paper-cream shadow-sm' : 'text-deep-forest/40'}`}
        type="button"
      >
        <Italic className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-sage-gold mx-1 my-auto" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded-xl transition-all cursor-pointer hover:bg-sage-gold/20 ${editor.isActive('heading', { level: 1 }) ? 'bg-deep-forest text-paper-cream shadow-sm' : 'text-deep-forest/40'}`}
        type="button"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-xl transition-all cursor-pointer hover:bg-sage-gold/20 ${editor.isActive('heading', { level: 2 }) ? 'bg-deep-forest text-paper-cream shadow-sm' : 'text-deep-forest/40'}`}
        type="button"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-sage-gold mx-1 my-auto" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-xl transition-all cursor-pointer hover:bg-sage-gold/20 ${editor.isActive('bulletList') ? 'bg-deep-forest text-paper-cream shadow-sm' : 'text-deep-forest/40'}`}
        type="button"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded-xl transition-all cursor-pointer hover:bg-sage-gold/20 ${editor.isActive('blockquote') ? 'bg-deep-forest text-paper-cream shadow-sm' : 'text-deep-forest/40'}`}
        type="button"
      >
        <Quote className="w-4 h-4" />
      </button>
    </div>
  );
};

const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[250px] px-6 py-4 focus:outline-none text-deep-forest prose-p:text-deep-forest/80 prose-headings:text-deep-forest font-typewriter',
      },
    },
  });

  return (
    <div className="border border-sage-gold rounded-2xl overflow-hidden focus-within:border-ink-green/70 focus-within:ring-4 focus-within:ring-ink-green/5 transition-all duration-300 bg-[#fdfdf9]">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
