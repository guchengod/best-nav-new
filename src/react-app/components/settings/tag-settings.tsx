import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Pencil, Trash2, Plus } from "lucide-react"
import { Tag } from '@/types/settings'
import { api } from '@/lib/api'
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export function TagSettings() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [tags, setTags] = useState<Tag[]>([])
    const [editingTag, setEditingTag] = useState<Partial<Tag> | null>(null)

    // 加载标签数据
    const loadTags = async () => {
        try {
            const data = await api.getTags()
            setTags(data.data)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "加载失败",
                description: "无法加载标签数据，请稍后重试",
            })
            console.log(error)
        }
    }

    useEffect(() => {
        loadTags()
    }, [])

    const handleAddClick = () => {
        setEditingTag({})
        setDialogOpen(true)
    }

    const handleEditClick = (tag: Tag) => {
        setEditingTag(tag)
        setDialogOpen(true)
    }

    const handleSave = async () => {
        try {
            if (editingTag?.id) {
                await api.updateTag(editingTag.id, editingTag)
                toast({
                    title: "更新成功",
                    description: "标签已更新",
                })
            } else {
                await api.createTag(editingTag as Omit<Tag, 'id'>)
                toast({
                    title: "添加成功",
                    description: "新标签已添加",
                })
            }
            setDialogOpen(false)
            setEditingTag(null)
            loadTags()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "保存失败",
                description: "无法保存标签数据，请稍后重试",
            })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await api.deleteTag(id)
            toast({
                title: "删除成功",
                description: "标签已删除",
            })
            loadTags()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "删除失败",
                description: "无法删除标签，请稍后重试",
            })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">标签列表</h2>
                <Button onClick={handleAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加标签
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">序号</TableHead>
                        <TableHead>名称</TableHead>
                        <TableHead>颜色</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tags.map((tag, index) => (
                        <TableRow key={tag.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{tag.name}</TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <div 
                                        className="w-6 h-6 rounded border"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    <span>{tag.color}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditClick(tag)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(tag.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTag?.id ? '编辑标签' : '添加标签'}</DialogTitle>
                        <DialogDescription>
                            {editingTag?.id ? '修改标签信息' : '创建新的标签'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 p-4">
                        <div className="space-y-2">
                            <Label>标签名称</Label>
                            <Input
                                value={editingTag?.name || ''}
                                onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                                placeholder="输入标签名称"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>颜色</Label>
                            <div className="flex space-x-2">
                                <Input
                                    type="color"
                                    value={editingTag?.color || '#000000'}
                                    onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                                    className="w-20"
                                />
                                <Input
                                    value={editingTag?.color || ''}
                                    onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                取消
                            </Button>
                            <Button onClick={handleSave}>
                                保存
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
