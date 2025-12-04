import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Pencil, Trash2, Plus } from "lucide-react"
import { api } from '@/lib/api'
import { GalleryCategory } from '@/types/settings'
import { toast } from "@/hooks/use-toast"
import { Label } from '@/components/ui/label'

export function GalleryCategorySettings({ onSuccess }: { onSuccess?: () => void }) {
    const [categories, setCategories] = useState<GalleryCategory[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentCategory, setCurrentCategory] = useState<Partial<GalleryCategory>>({})

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const res = await api.getGalleryCategories()
        setCategories(res.data || [])
    }

    const handleSave = async () => {
        if (!currentCategory.name) return
        try {
            if (currentCategory.id) {
                await api.updateGalleryCategory(currentCategory.id, currentCategory)
            } else {
                await api.createGalleryCategory(currentCategory)
            }
            setDialogOpen(false)
            loadData()
            onSuccess?.()
            toast({ title: "保存成功" })
        } catch (e) {
            toast({ variant: "destructive", title: "保存失败" })
        }
    }

    const handleDelete = async (id: string) => {
        if(!confirm("删除分类会将该分类下的图片设为无分类，确定删除？")) return
        try {
            await api.deleteGalleryCategory(id)
            loadData()
            onSuccess?.()
            toast({ title: "删除成功" })
        } catch (e) {
            toast({ variant: "destructive", title: "删除失败" })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <h3 className="text-lg font-medium">分类列表</h3>
                <Button onClick={() => { setCurrentCategory({}); setDialogOpen(true) }}><Plus className="mr-2 h-4 w-4"/> 添加分类</Button>
            </div>
            <div className="border rounded-md max-h-[400px] overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>名称</TableHead>
                            <TableHead>描述</TableHead>
                            <TableHead>排序</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length > 0 ? categories.map(c => (
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">{c.name}</TableCell>
                                <TableCell>{c.description}</TableCell>
                                <TableCell>{c.sortOrder}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => { setCurrentCategory(c); setDialogOpen(true) }}><Pencil className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4"/></Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">暂无分类</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{currentCategory.id ? '编辑分类' : '添加分类'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>名称</Label>
                            <Input value={currentCategory.name || ''} onChange={e => setCurrentCategory({...currentCategory, name: e.target.value})} placeholder="例如：风景、人像" />
                        </div>
                        <div className="space-y-2">
                            <Label>描述</Label>
                            <Input value={currentCategory.description || ''} onChange={e => setCurrentCategory({...currentCategory, description: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>排序</Label>
                            <Input type="number" value={currentCategory.sortOrder || 0} onChange={e => setCurrentCategory({...currentCategory, sortOrder: parseInt(e.target.value)})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave}>保存</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}