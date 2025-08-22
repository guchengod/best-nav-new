

import '@/lib/prism';
import { useState, useCallback, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {
  HeadingNode,
  QuoteNode,
  $createHeadingNode,
  $createQuoteNode,
} from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { TRANSFORMERS } from '@lexical/markdown';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { createPortal } from 'react-dom';
import { mergeRegister } from '@lexical/utils';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Pencil, 
  Save, 
  Quote as QuoteIcon, 
  Hash as HashIcon, 
  ListOrdered as ListOrderedIcon, 
  List as ListIcon, 
  Code as CodeIcon,
  Bold,
  Italic,
  Underline,
  Link
} from "lucide-react";

interface NoteContentProps {
  title?: string;
  onTitleChange?: (newTitle: string) => void;
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      
      // Check if selection has a link
      const node = selection.getNodes()[0];
      const parent = node.getParent();
      setIsLink(parent?.getType() === 'link');
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1
      )
    );
  }, [editor, updateToolbar]);

  const insertLink = useCallback(() => {
    if (!linkUrl) return;
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
    setShowLinkDialog(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  return <div className="flex items-center gap-1 p-2 border-b">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
      }}
      className={isBold ? 'bg-gray-200' : ''}
    >
      <Bold className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
      }}
      className={isItalic ? 'bg-gray-200' : ''}
    >
      <Italic className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
      }}
      className={isUnderline ? 'bg-gray-200' : ''}
    >
      <Underline className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowLinkDialog(true)}
      className={isLink ? 'bg-gray-200' : ''}
    >
      <Link className="h-4 w-4" />
    </Button>
    <div className="w-px h-6 bg-gray-200 mx-1" />
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h1'));
          }
        });
      }}
    >
      <HashIcon className="h-4 w-4" />
      <span className="ml-1">H1</span>
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        });
      }}
    >
      <QuoteIcon className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      }}
    >
      <ListOrderedIcon className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      }}
    >
      <ListIcon className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => new CodeNode());
          }
        });
      }}
    >
      <CodeIcon className="h-4 w-4" />
    </Button>

    {showLinkDialog && createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Insert Link</h3>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="min-w-[300px]"
            />
            <Button onClick={insertLink}>Insert</Button>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
          </div>
        </div>
      </div>,
      document.body
    )}
  </div>;
}

function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updateToolbar = useCallback(() => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPosition({
        top: rect.top - 40,
        left: rect.left + (rect.width / 2) - 100,
      });
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1
      )
    );
  }, [editor, updateToolbar]);

  if (!isVisible) {
    return null;
  }

  return createPortal(
    <div
      className="fixed z-50 flex items-center space-x-1 bg-white border rounded-md shadow-lg px-2 py-1"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Button 
        variant="ghost" 
        size="sm" 
        className="px-2"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="px-2"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="px-2"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="px-2"
        onClick={() => {
          const url = prompt('Enter URL:');
          if (url) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
          }
        }}
      >
        <Link className="h-4 w-4" />
      </Button>
    </div>,
    document.body
  );
}

const editorConfig = {
  namespace: 'NoteEditor',
  theme: {
    paragraph: 'my-2',
    heading: {
      h1: 'text-3xl font-bold my-4',
      h2: 'text-2xl font-bold my-3',
      h3: 'text-xl font-bold my-2',
    },
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
      code: 'bg-gray-100 rounded-md px-1 py-0.5 font-mono',
    },
    list: {
      ol: 'list-decimal ml-6 my-2',
      ul: 'list-disc ml-6 my-2',
      listitem: 'my-1',
    },
    quote: 'border-l-4 border-gray-200 pl-4 my-4 italic',
    code: 'block bg-gray-100 rounded-md p-4 font-mono my-4 overflow-auto',
    link: 'text-blue-500 hover:underline cursor-pointer',
  },
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    CodeNode,
    CodeHighlightNode,
    HorizontalRuleNode,
    AutoLinkNode,
    LinkNode,
  ],
  onError: (error: Error) => {
    console.error(error);
  },
};

function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export default function NoteContent({ title = "未命名笔记", onTitleChange }: NoteContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);

  const handleTitleChange = () => {
    setIsEditing(false);
    if (onTitleChange) {
      onTitleChange(editableTitle);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-2 p-4">
        {isEditing ? (
          <Input
            value={editableTitle}
            onChange={(e) => setEditableTitle(e.target.value)}
            onBlur={handleTitleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTitleChange();
              }
            }}
            autoFocus
          />
        ) : (
          <h1 className="text-2xl font-bold flex-1">{title}</h1>
        )}
        <Button
          variant="sidebar"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
          className="rounded-md"
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex-1 border rounded-lg mx-4 mb-4">
        <LexicalComposer initialConfig={editorConfig}>
          <div className="h-full flex flex-col">
            <ToolbarPlugin />
            <div className="flex-1 overflow-auto">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="min-h-[500px] outline-none p-4" />
                }
                placeholder={
                  <div className="absolute top-[57px] left-[1rem] text-gray-400 pointer-events-none">
                    开始输入...
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <FloatingToolbarPlugin />
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
}
