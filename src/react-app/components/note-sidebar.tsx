import { useState, useEffect } from 'react';
import { File, Folder, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "./ui/sidebar";
import * as ContextMenu from '@radix-ui/react-context-menu';
import * as Dialog from '@radix-ui/react-dialog';

interface TreeNode {
  id: string;
  title: string;
  type: 'file' | 'folder' | 'root';
  children?: TreeNode[];
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  onSelect: (node: TreeNode) => void;
  onAddChild: (parentId: string, title: string) => void;
  onDelete: (nodeId: string) => void;
  onRename: (nodeId: string, newTitle: string) => void;
  onConvertToFolder: (nodeId: string) => void;
  onMove: (nodeId: string, targetId: string) => void;
  allFolders: TreeNode[];
}

const defaultData: TreeNode[] = [
  {
    id: 'root',
    title: '笔记',
    type: 'root',
    children: [
      {
        id: '1',
        title: '前端开发',
        type: 'folder',
        children: [
          { id: '1-1', title: 'React基础', type: 'file' },
          { id: '1-2', title: 'TypeScript教程', type: 'file' },
        ],
      },
      {
        id: '2',
        title: '后端开发',
        type: 'folder',
        children: [
          { id: '2-1', title: 'Node.js基础', type: 'file' },
          { id: '2-2', title: '数据库设计', type: 'file' },
        ],
      },
    ],
  },
];

function TreeItem({ 
  node, 
  level, 
  onSelect, 
  onAddChild, 
  onDelete,
  onRename,
  onConvertToFolder,
  onMove,
  allFolders 
}: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(node.type === 'root');
  const [wasFile, setWasFile] = useState(node.type === 'file');
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(node.title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 获取要删除的所有文件
  const getFilesToDelete = (node: TreeNode): string[] => {
    let files: string[] = [];
    if (node.type === 'file') {
      files.push(node.title);
    }
    if (node.children) {
      node.children.forEach(child => {
        files = files.concat(getFilesToDelete(child));
      });
    }
    return files;
  };

  useEffect(() => {
    if (node.type === 'folder' && wasFile) {
      setIsExpanded(true);
      setWasFile(false);
    }
  }, [node.type, wasFile]);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'folder' || node.type === 'root') {
      onAddChild(node.id, '新笔记');
      setIsExpanded(true);
    } else if (node.type === 'file') {
      onConvertToFolder(node.id);
    }
  };

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== node.title) {
      onRename(node.id, newTitle.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div
            className={cn(
              "flex items-center py-2 px-2 hover:bg-muted rounded-lg cursor-pointer group",
              "transition-colors duration-200"
            )} 
            style={{ paddingLeft: `${level * 16}px` }}
            onClick={() => {
              if (node.type !== 'file') {
                setIsExpanded(!isExpanded);
              }
              onSelect(node);
            }}
          >
            <div className="flex-1 flex items-center">
              {node.type === 'file' ? (
                <File className="h-4 w-4" />
              ) : (
                <Folder className="h-4 w-4" />
              )}
              {isRenaming ? (
                <Input
                  className="ml-2 h-6"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRename();
                    } else if (e.key === 'Escape') {
                      setIsRenaming(false);
                      setNewTitle(node.title);
                    }
                  }}
                  onBlur={handleRename}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="ml-2">{node.title}</span>
              )}
            </div>
            
            <div className="hidden group-hover:flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleAddClick}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </ContextMenu.Trigger>

        <ContextMenu.Portal>
          <ContextMenu.Content className="min-w-[160px] rounded-md p-1 shadow-md z-50 border border-border">
            <ContextMenu.Item 
              className="text-sm px-2 py-1.5 outline-none cursor-pointer hover:bg-accent rounded-sm flex items-center"
              onClick={() => {
                setIsRenaming(true);
                setNewTitle(node.title);
              }}
            >
              重命名
            </ContextMenu.Item>
            <ContextMenu.Item 
              className="text-sm px-2 py-1.5 outline-none cursor-pointer hover:bg-accent rounded-sm text-red-600 flex items-center"
              onClick={() => setShowDeleteDialog(true)}
            >
              删除
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>

      <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <Dialog.Title className="text-lg font-semibold mb-4">确认删除</Dialog.Title>
            <div className="mb-6">
              {node.type === 'folder' ? (
                <div>
                  <p className="mb-2">将删除以下文件：</p>
                  <div className="max-h-[200px] overflow-y-auto border rounded p-2">
                    {getFilesToDelete(node).map((file, index) => (
                      <div key={index} className="py-1">{file}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>是否删除文件 "{node.title}"？</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                取消
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  onDelete(node.id);
                  setShowDeleteDialog(false);
                }}
              >
                确认删除
              </Button>
            </div>
            <Dialog.Close asChild>
              <button className="absolute right-4 top-4 opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      
      {node.type !== 'file' && isExpanded && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((childNode) => (
            <TreeItem
              key={childNode.id}
              node={childNode}
              level={level + 1}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onRename={onRename}
              onConvertToFolder={onConvertToFolder}
              onMove={onMove}
              allFolders={allFolders}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NoteSidebar() {
  const [treeData, setTreeData] = useState<TreeNode[]>(defaultData);

  const getAllFolders = (nodes: TreeNode[]): TreeNode[] => {
    let folders: TreeNode[] = [];
    nodes.forEach(node => {
      if (node.type === 'folder') {
        folders.push(node);
      }
      if (node.children) {
        folders = folders.concat(getAllFolders(node.children));
      }
    });
    return folders;
  };

  const handleSelect = (node: TreeNode) => {
    console.log('Selected:', node);
  };

  const handleAddChild = (parentId: string, title: string) => {
    const newNode: TreeNode = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      type: 'file'
    };

    const addChild = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === parentId) {
          return {
            ...node,
            type: 'folder',
            children: [...(node.children || []), newNode]
          };
        }
        if (node.children) {
          return {
            ...node,
            children: addChild(node.children)
          };
        }
        return node;
      });
    };

    setTreeData(addChild(treeData));
  };

  const handleDelete = (nodeId: string) => {
    const deleteNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.reduce((acc: TreeNode[], node) => {
        if (node.id === nodeId) {
          return acc;
        }
        
        const newNode = { ...node };
        if (node.children) {
          newNode.children = deleteNode(node.children);
          // 如果删除后没有子节点且不是根节点，将类型改为文件
          if (newNode.children.length === 0 && node.type !== 'root') {
            newNode.type = 'file';
            delete newNode.children;
          }
        }
        
        return [...acc, newNode];
      }, []);
    };

    setTreeData(prevData => {
      // 如果要删除的是根节点的直接子节点，特殊处理
      const isRootChild = prevData.some(node => node.id === nodeId);
      if (isRootChild) {
        return prevData.filter(node => node.id !== nodeId);
      }
      return deleteNode(prevData);
    });
  };

  const handleRename = (nodeId: string, newTitle: string) => {
    const renameNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            title: newTitle
          };
        }
        if (node.children) {
          return {
            ...node,
            children: renameNode(node.children)
          };
        }
        return node;
      });
    };

    setTreeData(renameNode(treeData));
  };

  const handleConvertToFolder = (nodeId: string) => {
    handleAddChild(nodeId, '新笔记');
  };

  const allFolders = getAllFolders(treeData);

  return (
    <Sidebar className="w-64 transition-width duration-300 ease-in-out border-r">
      <SidebarHeader className="h-14">
        <h2 className="text-lg font-semibold px-4">笔记目录</h2>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2">
          {treeData.map((node) => (
            <TreeItem
              key={node.id}
              node={node}
              level={0}
              onSelect={handleSelect}
              onAddChild={handleAddChild}
              onDelete={handleDelete}
              onRename={handleRename}
              onConvertToFolder={handleConvertToFolder}
              onMove={() => {}}
              allFolders={allFolders}
            />
          ))}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-sm text-muted-foreground">
          共 {treeData.length} 个笔记本
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
