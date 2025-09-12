import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Website, MenuItem, Tag } from '@/types/settings'
import { api } from '@/lib/api'
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { MultipleTag } from "@/components/ui/multiple-tag"

export function WebsiteSettings() {
    const [searchTerm, setSearchTerm] = useState("")
    const [isAdding, setIsAdding] = useState(false)
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [websites, setWebsites] = useState<Website[]>([])
    const [newWebsite, setNewWebsite] = useState<Partial<Website>>({})
    const [menus, setMenus] = useState<MenuItem[]>([])
    const [secondLevelMenus, setSecondLevelMenus] = useState<MenuItem[]>([])
    const [selectedParentMenu, setSelectedParentMenu] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [pageSize] = useState(10)
    const [loading, setLoading] = useState(false)
    const [tags, setTags] = useState<Tag[]>([])
    const [selectedTags, setSelectedTags] = useState<Tag[]>([])
// 加载标签数据
    const loadTags = async () => {
        try {
            const data = await api.getTags()
            setTags(data.data)
        } catch (error) {
            console.error('加载标签失败:', error)
            toast({
                variant: "destructive",
                title: "加载失败",
                description: "无法加载标签数据，请稍后重试",
            })
        }
    }

    // 重置表单
    const resetForm = () => {
        setNewWebsite({})
        setSelectedTags([])
        setSelectedParentMenu('')
        setIsAdding(false)
        setIsEditing(null)
    }

    // 加载网站列表
    const loadWebsites = async (page: number = currentPage) => {
        setLoading(true)
        try {
            const response = await api.getWebsites(searchTerm)
            setWebsites(response.data)
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "加载失败",
                description: "无法加载网站列表，请稍后重试",
            })
            console.log("加载网站列表失败:", error)
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
        loadWebsites(newPage)
    }

    const loadMenus = async () => {
        try {
            const data = await api.getMenus()
            const parentMenus = data.data.filter(menu => !menu.parentId)
            setMenus(parentMenus)
            const childMenus = data.data.filter(menu => menu.parentId)
            setSecondLevelMenus(childMenus)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "加载失败",
                description: "无法加载菜单数据，请稍后重试",
            })
            console.log(error)
        }
    }

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                loadWebsites(),
                loadMenus(),
                loadTags()
            ])
        }
        loadData()
    }, [])

    const handleEdit = (website: Website) => {
        const tagIds = website.tags.map(tagId => tagId.id)
        const websiteTags = tags.filter(tag => tagIds.includes(tag.id))
        const menuItem = secondLevelMenus.find(menu => menu.id === website.menuId)
        
        setNewWebsite(website)
        setIsEditing(website.id)
        setIsAdding(true)
        setSelectedTags(websiteTags)
        
        if (menuItem?.parentId) {
            setSelectedParentMenu(menuItem.parentId)
        }
    }

    const handleCancel = () => {
        resetForm()
    }

    const handleDelete = async (id: string) => {
        try {
            await api.deleteWebsite(id)
            toast({
                title: "删除成功",
                description: "网站已删除",
            })
            loadWebsites()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "删除失败",
                description: "无法删除网站，请稍后重试",
            })
            console.log(error)
        }
    }

    const handleSave = async () => {
        try {
            if (!newWebsite.name?.trim() || !newWebsite.url?.trim() || !newWebsite.menuId) {
                toast({
                    variant: "destructive",
                    title: "验证失败",
                    description: "请填写必要的信息（名称、链接、菜单）",
                })
                return
            }

            const websiteData = {
                ...newWebsite,
                name: newWebsite.name.trim(),
                url: newWebsite.url.trim(),
                description: newWebsite.description?.trim(),
                tags: selectedTags.map(tag => tag.id)
            }

            if (isEditing) {

                await api.updateWebsite(websiteData as unknown as Website)
                toast({
                    title: "更新成功",
                    description: "网站已更新",
                })
            } else {
                await api.createWebsite(websiteData as unknown as Omit<Website, 'id'>)
                toast({
                    title: "添加成功",
                    description: "网站已添加",
                })
            }
            resetForm()
            loadWebsites()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "操作失败",
                description: "保存失败，请稍后重试",
            })
            console.log(error)
        }
    }

    return (
        <div className="space-y-4">
            <Dialog open={isAdding} onOpenChange={(open) => {
                if (!open) resetForm()
            }}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? '修改网站' : '添加网站'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>网站名称</Label>
                            <Input
                                value={newWebsite.name || ''}
                                onChange={(e) => setNewWebsite({ ...newWebsite, name: e.target.value })}
                                placeholder="输入网站名称"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>网站链接</Label>
                            <Input
                                value={newWebsite.url || ''}
                                onChange={(e) => setNewWebsite({ ...newWebsite, url: e.target.value })}
                                placeholder="输入网站链接"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>图标链接</Label>
                            <Input
                                value={newWebsite.icon || ''}
                                onChange={(e) => setNewWebsite({ ...newWebsite, icon: e.target.value })}
                                placeholder="输入图标链接"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>网站描述</Label>
                            <Textarea
                                value={newWebsite.description || ''}
                                onChange={(e) => setNewWebsite({ ...newWebsite, description: e.target.value })}
                                placeholder="输入网站描述"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>一级菜单</Label>
                                <Select
                                    value={selectedParentMenu}
                                    onValueChange={setSelectedParentMenu}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择一级菜单" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {menus.map((menu) => (
                                            <SelectItem key={menu.id} value={menu.id}>
                                                {menu.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>二级菜单</Label>
                                <Select
                                    value={newWebsite.menuId || ''}
                                    onValueChange={(value) => setNewWebsite({ ...newWebsite, menuId: value })}
                                    disabled={!selectedParentMenu}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择二级菜单" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {secondLevelMenus.filter(menu => menu.parentId === selectedParentMenu).map((menu) => (
                                            <SelectItem key={menu.id} value={menu.id}>
                                                {menu.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>标签</Label>
                            <MultipleTag
                                tags={tags}
                                selectedTags={selectedTags}
                                onTagsChange={(newTags) => {
                                    setSelectedTags(newTags)
                                    setNewWebsite({
                                        ...newWebsite,
                                        tags: newTags
                                    })
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel}>
                            取消
                        </Button>
                        <Button onClick={handleSave}>
                            {isEditing ? '保存' : '添加'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/*<Dialog defaultOpen={true} onOpenChange={() => {}}>*/}
            {/*    <DialogContent className="max-w-7xl max-h-[90vh]">*/}
            {/*        <DialogHeader>*/}
            {/*            <DialogTitle>网站列表</DialogTitle>*/}
            {/*            <div className="flex justify-between items-center mt-4">*/}
            {/*                <div className="flex items-center space-x-2">*/}
            {/*                    <Input*/}
            {/*                        placeholder="搜索网站..."*/}
            {/*                        value={searchTerm}*/}
            {/*                        onChange={(e) => setSearchTerm(e.target.value)}*/}
            {/*                        className="w-[200px]"*/}
            {/*                    />*/}
            {/*                </div>*/}
            {/*                <Button onClick={() => setIsAdding(true)}>*/}
            {/*                    <Plus className="mr-2 h-4 w-4" />*/}
            {/*                    添加网站*/}
            {/*                </Button>*/}
            {/*            </div>*/}
            {/*        </DialogHeader>*/}

            {/*        <div className="overflow-x-auto">*/}
            {/*            <Table>*/}
            {/*                <TableHeader>*/}
            {/*                    <TableRow>*/}
            {/*                        <TableHead className="w-16 text-center">序号</TableHead>*/}
            {/*                        <TableHead className="w-40">名称</TableHead>*/}
            {/*                        <TableHead className="w-40">链接</TableHead>*/}
            {/*                        <TableHead className="w-40">描述</TableHead>*/}
            {/*                        <TableHead className="w-40">菜单</TableHead>*/}
            {/*                        <TableHead className="w-40">标签</TableHead>*/}
            {/*                        <TableHead className="w-24 text-right">操作</TableHead>*/}
            {/*                    </TableRow>*/}
            {/*                </TableHeader>*/}
            {/*                <TableBody>*/}
            {/*                    {loading ? (*/}
            {/*                        <TableRow>*/}
            {/*                            <TableCell colSpan={7} className="text-center py-8">*/}
            {/*                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>*/}
            {/*                            </TableCell>*/}
            {/*                        </TableRow>*/}
            {/*                    ) : websites.length === 0 ? (*/}
            {/*                        <TableRow>*/}
            {/*                            <TableCell colSpan={7} className="text-center py-8">*/}
            {/*                                暂无数据*/}
            {/*                            </TableCell>*/}
            {/*                        </TableRow>*/}
            {/*                    ) : (*/}
            {/*                        websites.map((website, index) => {*/}
            {/*                            const menuItem = secondLevelMenus.find(menu => menu.id === website.menuId)*/}
            {/*                            const parentMenu = menus.find(menu => menu.id === menuItem?.parentId)*/}
            {/*                            const websiteTags = tags.filter(tag => website.tags.map(tag => tag.id)?.includes(tag.id)) || []*/}

            {/*                            return (*/}
            {/*                                <TableRow key={website.id}>*/}
            {/*                                    <TableCell className="text-center">{(currentPage - 1) * pageSize + index + 1}</TableCell>*/}
            {/*                                    <TableCell>*/}
            {/*                                        <div className="truncate" title={website.name}>{website.name}</div>*/}
            {/*                                    </TableCell>*/}
            {/*                                    <TableCell>*/}
            {/*                                        <div className="truncate" title={website.url}>{website.url}</div>*/}
            {/*                                    </TableCell>*/}
            {/*                                    <TableCell>*/}
            {/*                                        <div className="truncate" title={website.description}>{website.description}</div>*/}
            {/*                                    </TableCell>*/}
            {/*                                    <TableCell>*/}
            {/*                                        {menuItem && parentMenu && (*/}
            {/*                                            <div className="truncate" title={`${parentMenu.name} > ${menuItem.name}`}>*/}
            {/*                                                {parentMenu.name} &gt; {menuItem.name}*/}
            {/*                                            </div>*/}
            {/*                                        )}*/}
            {/*                                    </TableCell>*/}
            {/*                                    <TableCell>*/}
            {/*                                        <div className="flex flex-wrap gap-1">*/}
            {/*                                            {websiteTags.map((tag) => (*/}
            {/*                                                <Badge*/}
            {/*                                                    key={tag.id}*/}
            {/*                                                    variant="outline"*/}
            {/*                                                    className="truncate max-w-[80px]"*/}
            {/*                                                    style={{*/}
            {/*                                                        backgroundColor: `${tag.color}20`,*/}
            {/*                                                        color: tag.color,*/}
            {/*                                                        borderColor: tag.color*/}
            {/*                                                    }}*/}
            {/*                                                    title={tag.name}*/}
            {/*                                                >*/}
            {/*                                                    {tag.name}*/}
            {/*                                                </Badge>*/}
            {/*                                            ))}*/}
            {/*                                        </div>*/}
            {/*                                    </TableCell>*/}
            {/*                                    <TableCell>*/}
            {/*                                        <div className="flex justify-end space-x-2">*/}
            {/*                                            <Button*/}
            {/*                                                variant="ghost"*/}
            {/*                                                size="sm"*/}
            {/*                                                onClick={() => handleEdit(website)}*/}
            {/*                                            >*/}
            {/*                                                <Pencil className="h-4 w-4" />*/}
            {/*                                            </Button>*/}
            {/*                                            <Button*/}
            {/*                                                variant="ghost"*/}
            {/*                                                size="sm"*/}
            {/*                                                onClick={() => handleDelete(website.id)}*/}
            {/*                                            >*/}
            {/*                                                <Trash2 className="h-4 w-4" />*/}
            {/*                                            </Button>*/}
            {/*                                        </div>*/}
            {/*                                    </TableCell>*/}
            {/*                                </TableRow>*/}
            {/*                            )*/}
            {/*                        })*/}
            {/*                    )}*/}
            {/*                </TableBody>*/}
            {/*            </Table>*/}
            {/*        </div>*/}

            {/*        <div className="flex items-center justify-between mt-4">*/}
            {/*            <div className="text-sm text-muted-foreground">*/}
            {/*                共 {totalPages} 页*/}
            {/*            </div>*/}
            {/*            <div className="flex items-center space-x-2">*/}
            {/*                <Button*/}
            {/*                    variant="outline"*/}
            {/*                    size="sm"*/}
            {/*                    onClick={() => handlePageChange(currentPage - 1)}*/}
            {/*                    disabled={currentPage === 1 || loading}*/}
            {/*                >*/}
            {/*                    <ChevronLeft className="h-4 w-4" />*/}
            {/*                </Button>*/}
            {/*                <div className="text-sm">*/}
            {/*                    第 {currentPage} 页*/}
            {/*                </div>*/}
            {/*                <Button*/}
            {/*                    variant="outline"*/}
            {/*                    size="sm"*/}
            {/*                    onClick={() => handlePageChange(currentPage + 1)}*/}
            {/*                    disabled={currentPage === totalPages || loading}*/}
            {/*                >*/}
            {/*                    <ChevronRight className="h-4 w-4" />*/}
            {/*                </Button>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </DialogContent>*/}
            {/*</Dialog>*/}

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-lg font-semibold">网站列表</h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                        <Input
                            placeholder="搜索网站..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-[200px]"
                        />
                        <Button onClick={() => setIsAdding(true)} className="whitespace-nowrap">
                            <Plus className="mr-2 h-4 w-4" />
                            添加网站
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16 text-center">序号</TableHead>
                            <TableHead className="w-40">名称</TableHead>
                            <TableHead className="w-40">链接</TableHead>
                            <TableHead className="w-40">描述</TableHead>
                            <TableHead className="w-40">菜单</TableHead>
                            <TableHead className="w-40">标签</TableHead>
                            <TableHead className="w-24 text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                </TableCell>
                            </TableRow>
                        ) : websites.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    暂无数据
                                </TableCell>
                            </TableRow>
                        ) : (
                            websites.map((website, index) => {
                                const menuItem = secondLevelMenus.find(menu => menu.id === website.menuId)
                                const parentMenu = menus.find(menu => menu.id === menuItem?.parentId)
                                const websiteTags = tags.filter(tag => website.tags?.map((t: any) => t.id)?.includes(tag.id)) || []

                                return (
                                    <TableRow key={website.id}>
                                        <TableCell className="text-center">
                                            {(currentPage - 1) * pageSize + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="truncate" title={website.name}>{website.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="truncate" title={website.url}>{website.url}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="truncate" title={website.description}>{website.description}</div>
                                        </TableCell>
                                        <TableCell>
                                            {menuItem && parentMenu && (
                                                <div className="truncate" title={`${parentMenu.name} > ${menuItem.name}`}>
                                                    {parentMenu.name} &gt; {menuItem.name}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {websiteTags.map((tag) => (
                                                    <Badge
                                                        key={tag.id}
                                                        variant="outline"
                                                        className="truncate max-w-[80px]"
                                                        style={{
                                                            backgroundColor: `${tag.color}20`,
                                                            color: tag.color,
                                                            borderColor: tag.color
                                                        }}
                                                        title={tag.name}
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(website)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(website.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>

                {/* 分页 */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                        共 {totalPages} 页
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm">
                            第 {currentPage} 页
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || loading}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Toaster />
            </div>
        </div>
    )
}
