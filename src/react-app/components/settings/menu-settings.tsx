import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { MenuItem } from '@/types/settings.ts'
import { api } from '@/lib/api.ts'
import { toast } from "@/hooks/use-toast.ts"
import { Toaster } from "@/components/ui/toaster"
import { Pagination } from "@/components/ui/pagination"

export function MenuSettings() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [menus, setMenus] = useState<MenuItem[]>([])
    const [parentMenus, setParentMenus] = useState<MenuItem[]>([])
    const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // 加载菜单数据
    const loadMenus = async (page = currentPage) => {
        try {
            const response = await api.getMenus(page, pageSize)
            setMenus(response.data)
            if (response.pagination) {
                setTotal(response.pagination.total)
                setTotalPages(response.pagination.totalPages)
                setCurrentPage(response.pagination.page)
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "加载失败",
                description: "无法加载菜单数据，请稍后重试",
            })
        }
    }

    // 加载一级菜单数据
    const loadParentMenus = async () => {
        try {
            const data = await api.getRootMenus()
            setParentMenus(data)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "加载失败",
                description: "无法加载父级菜单数据，请稍后重试",
            })
            console.log(error)
        }
    }

    useEffect(() => {
        loadMenus()
    }, [currentPage, pageSize])

    const handleAddClick = async () => {
        await loadParentMenus()
        setEditingMenu({createdAt: "", icon: "", id: "", name: "", parentId: "0", sortOrder: 0, updatedAt: "", url: ""})
        setDialogOpen(true)
    }

    const handleEditClick = async (menu: MenuItem) => {
        await loadParentMenus()
        setEditingMenu(menu)
        setDialogOpen(true)
    }

    const handleSave = async () => {
        try {
            if (editingMenu?.id) {
                await api.updateMenu(editingMenu.id, {
                    ...editingMenu,
                    sortOrder: editingMenu.sortOrder || 0
                })
                toast({
                    title: "更新成功",
                    description: "菜单已更新",
                })
            } else {
                await api.createMenu({url: "", ...editingMenu});
                toast({
                    title: "添加成功",
                    description: "新菜单已添加",
                })
            }
            setDialogOpen(false)
            setEditingMenu(null)
            loadMenus()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "保存失败",
                description: "无法保存菜单数据，请稍后重试",
            })
            console.log(error)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await api.deleteMenu(id)
            toast({
                title: "删除成功",
                description: "菜单已删除",
            })
            loadMenus()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "删除失败",
                description: "无法删除菜单，请稍后重试",
            })
            console.log(error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">菜单列表</h2>
                <Button onClick={handleAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加菜单
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">序号</TableHead>
                        <TableHead>名称</TableHead>
                        <TableHead>级别</TableHead>
                        <TableHead>父级菜单</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {menus.map((menu, index) => {
                        return (
                            <TableRow key={menu.id}>
                                <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                <TableCell>{menu.name}</TableCell>
                                <TableCell>{menu.parentId === '0' ?  '一级菜单': '二级菜单'}</TableCell>
                                <TableCell>{menu.parentName || '-'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditClick(menu)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(menu.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingMenu?.id ? '编辑菜单' : '添加菜单'}</DialogTitle>
                        <DialogDescription>
                            {editingMenu?.id ? '修改菜单信息' : '创建新的菜单项'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 p-4">
                        <div className="space-y-2">
                            <Label>菜单名称</Label>
                            <Input
                                value={editingMenu?.name || ''}
                                onChange={(e) => setEditingMenu({
                                    createdAt: "",
                                    icon: "",
                                    id: "",
                                    parentId: "",
                                    sortOrder: 0,
                                    updatedAt: "",
                                    url: "", ...editingMenu, name: e.target.value })}
                                placeholder="输入菜单名称"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>父级菜单</Label>
                            <Select
                                value={editingMenu?.parentId || '0'}
                                onValueChange={(value) => setEditingMenu({
                                    createdAt: "",
                                    icon: "",
                                    id: "",
                                    name: "",
                                    sortOrder: 0,
                                    updatedAt: "",
                                    url: "", ...editingMenu, parentId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="选择父级菜单" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0" key="0">无</SelectItem>
                                    {parentMenus
                                        .filter(menu => menu.id !== null && menu.id !== undefined && menu.id !== '' && menu.id !== '0')
                                        .map((menu) => (
                                        <SelectItem key={menu.id} value={menu.id}>
                                            {menu.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>排序</Label>
                            <Input
                                value={editingMenu?.sortOrder || 0}
                                onChange={(e) => setEditingMenu({
                                    createdAt: "",
                                    icon: "",
                                    id: "",
                                    name: "",
                                    parentId: "",
                                    updatedAt: "",
                                    url: "", ...editingMenu, sortOrder: parseInt(e.target.value) })}
                                type="number"
                            />
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

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
            <Toaster />
        </div>
    )
}
