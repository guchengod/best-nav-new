// import { useEffect, useRef, useState } from 'react'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select"
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table"
//
// import { Badge } from "@/components/ui/badge"
// import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Upload, Globe, Loader2 } from "lucide-react"
// import { Website, MenuItem, MenuItemTree, Tag } from '@/types/settings'
// import { api } from '@/lib/api'
// import { toast } from "@/hooks/use-toast"
// import { Toaster } from "@/components/ui/toaster"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
// import { MultipleTag } from "@/components/ui/multiple-tag"
//
// export function WebsiteSettings() {
//     const [searchTerm, setSearchTerm] = useState("")
//     const [isAdding, setIsAdding] = useState(false)
//     const [isEditing, setIsEditing] = useState<string | null>(null)
//     const [websites, setWebsites] = useState<Website[]>([])
//     const [newWebsite, setNewWebsite] = useState<Partial<Website>>({})
//     const [menuTree, setMenuTree] = useState<MenuItemTree[]>([])
//     const [parentMenus, setParentMenus] = useState<MenuItemTree[]>([])
//     const [childMenus, setChildMenus] = useState<MenuItemTree[]>([])
//     const [selectedParentMenu, setSelectedParentMenu] = useState<string>('')
//     const [currentPage, setCurrentPage] = useState(1)
//     const [totalPages, setTotalPages] = useState(1)
//     const [pageSize] = useState(10)
//     const [loading, setLoading] = useState(false)
//     const [tags, setTags] = useState<Tag[]>([])
//     const [selectedTags, setSelectedTags] = useState<Tag[]>([])
//     const [uploading, setUploading] = useState(false)
//     const [fetchingIcon, setFetchingIcon] = useState(false)
//     const fileInputRef = useRef<HTMLInputElement>(null)
//
//     // 加载标签数据
//     const loadTags = async () => {
//         try {
//             const data = await api.getTags()
//             setTags(data.data)
//         } catch (error) {
//             console.error('加载标签失败:', error)
//             toast({
//                 variant: "destructive",
//                 title: "加载失败",
//                 description: "无法加载标签数据，请稍后重试",
//             })
//         }
//     }
//
//     // 重置表单
//     const resetForm = () => {
//         setNewWebsite({})
//         setSelectedTags([])
//         setSelectedParentMenu('')
//         setChildMenus([])
//         setIsAdding(false)
//         setIsEditing(null)
//     }
//
//     // 加载网站列表
//     const loadWebsites = async (page: number = currentPage) => {
//         setLoading(true)
//         try {
//             const response = await api.getWebsites(`page=${page}&pageSize=${pageSize}&search=${searchTerm}`)
//             setWebsites(response.data)
//             if (response.pagination) {
//                 setTotalPages(response.pagination.totalPages)
//             }
//         } catch (error) {
//             toast({
//                 variant: "destructive",
//                 title: "加载失败",
//                 description: "无法加载网站列表，请稍后重试",
//             })
//             console.log("加载网站列表失败:", error)
//         } finally {
//             setLoading(false)
//         }
//     }
//
//     const handlePageChange = (newPage: number) => {
//         setCurrentPage(newPage)
//         loadWebsites(newPage)
//     }
//
//     // 加载菜单树
//     const loadMenus = async () => {
//         try {
//             const tree = await api.menus()
//             setMenuTree(tree)
//             // 筛选出所有一级菜单
//             const parents = tree.filter(menu => !menu.parentId || menu.parentId === '0')
//             setParentMenus(parents)
//         } catch (error) {
//             toast({
//                 variant: "destructive",
//                 title: "加载失败",
//                 description: "无法加载菜单数据，请稍后重试",
//             })
//             console.log(error)
//         }
//     }
//
//     // 当一级菜单选择改变时，更新二级菜单列表
//     useEffect(() => {
//         if (selectedParentMenu) {
//             const parent = menuTree.find(m => m.id === selectedParentMenu)
//             setChildMenus(parent?.children || [])
//             // 如果切换了一级菜单，清空已选的二级菜单（除非是编辑模式初始化时）
//             if (newWebsite.menuId && !parent?.children?.find(c => c.id === newWebsite.menuId)) {
//                 setNewWebsite(prev => ({ ...prev, menuId: '' }))
//             }
//         } else {
//             setChildMenus([])
//         }
//     }, [selectedParentMenu, menuTree])
//
//     useEffect(() => {
//         loadWebsites(1) // 搜索时重置页码
//     }, [searchTerm])
//
//     useEffect(() => {
//         const loadData = async () => {
//             await Promise.all([
//                 loadWebsites(),
//                 loadMenus(),
//                 loadTags()
//             ])
//         }
//         loadData()
//     }, [])
//
//     const handleEdit = (website: Website) => {
//         const tagIds = website.tags?.map(tagRef => tagRef.tag.id) || []
//         const websiteTags = tags.filter(tag => tagIds.includes(tag.id))
//
//         setNewWebsite(website)
//         setIsEditing(website.id)
//         setIsAdding(true)
//         setSelectedTags(websiteTags)
//
//         // 查找该网站所属的二级菜单的父级菜单
//         // 1. 遍历所有一级菜单
//         for (const parent of menuTree) {
//             // 2. 检查该父菜单的子菜单中是否包含当前网站的 menuId
//             const found = parent.children?.find(child => child.id === website.menuId)
//             if (found) {
//                 setSelectedParentMenu(parent.id)
//                 // useEffect 会自动更新 childMenus
//                 break
//             }
//         }
//     }
//
//     const handleCancel = () => {
//         resetForm()
//     }
//
//     const handleDelete = async (id: string) => {
//         if (!confirm("确定要删除这个网站吗？")) return
//
//         try {
//             await api.deleteWebsite(id)
//             toast({
//                 title: "删除成功",
//                 description: "网站已删除",
//             })
//             loadWebsites()
//         } catch (error) {
//             toast({
//                 variant: "destructive",
//                 title: "删除失败",
//                 description: "无法删除网站，请稍后重试",
//             })
//             console.log(error)
//         }
//     }
//
//     const handleSave = async () => {
//         try {
//             if (!newWebsite.name?.trim() || !newWebsite.url?.trim() || !newWebsite.menuId) {
//                 toast({
//                     variant: "destructive",
//                     title: "验证失败",
//                     description: "请填写必要的信息（名称、链接、菜单）",
//                 })
//                 return
//             }
//
//             const websiteData = {
//                 ...newWebsite,
//                 name: newWebsite.name.trim(),
//                 url: newWebsite.url.trim(),
//                 description: newWebsite.description?.trim(),
//                 tags: selectedTags.map(tag => ({ id: tag.id, name: tag.name }))
//             }
//
//             if (isEditing) {
//                 await api.updateWebsite(websiteData as unknown as Website)
//                 toast({
//                     title: "更新成功",
//                     description: "网站已更新",
//                 })
//             } else {
//                 await api.createWebsite(websiteData as unknown as Omit<Website, 'id'>)
//                 toast({
//                     title: "添加成功",
//                     description: "网站已添加",
//                 })
//             }
//             resetForm()
//             loadWebsites()
//         } catch (error) {
//             toast({
//                 variant: "destructive",
//                 title: "操作失败",
//                 description: "保存失败，请稍后重试",
//             })
//             console.log(error)
//         }
//     }
//
//     // 处理文件上传
//     const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0]
//         if (!file) return
//
//         setUploading(true)
//         try {
//             const { url } = await api.uploadFile(file)
//             setNewWebsite(prev => ({ ...prev, icon: url }))
//             toast({
//                 title: "上传成功",
//                 description: "图标已上传",
//             })
//         } catch (error) {
//             toast({
//                 variant: "destructive",
//                 title: "上传失败",
//                 description: "无法上传图标，请稍后重试",
//             })
//         } finally {
//             setUploading(false)
//             // 清空 input，允许重复上传同一文件
//             if (fileInputRef.current) fileInputRef.current.value = ''
//         }
//     }
//
//     // 处理自动获取图标
//     const handleFetchIcon = async () => {
//         if (!newWebsite.url) {
//             toast({
//                 variant: "destructive",
//                 title: "错误",
//                 description: "请先填写网站链接",
//             })
//             return
//         }
//
//         setFetchingIcon(true)
//         try {
//             const { url } = await api.fetchIcon(newWebsite.url)
//             setNewWebsite(prev => ({ ...prev, icon: url }))
//             toast({
//                 title: "获取成功",
//                 description: "图标已自动获取",
//             })
//         } catch (error) {
//             toast({
//                 variant: "destructive",
//                 title: "获取失败",
//                 description: "无法自动获取图标，请手动上传",
//             })
//         } finally {
//             setFetchingIcon(false)
//         }
//     }
//
//     return (
//         <div className="space-y-4">
//             <Dialog open={isAdding} onOpenChange={(open) => {
//                 if (!open) resetForm()
//             }}>
//                 <DialogContent className="max-w-4xl">
//                     <DialogHeader>
//                         <DialogTitle>{isEditing ? '修改网站' : '添加网站'}</DialogTitle>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                         <div className="space-y-2">
//                             <Label>网站名称</Label>
//                             <Input
//                                 value={newWebsite.name || ''}
//                                 onChange={(e) => setNewWebsite({ ...newWebsite, name: e.target.value })}
//                                 placeholder="输入网站名称"
//                             />
//                         </div>
//                         <div className="space-y-2">
//                             <Label>网站链接</Label>
//                             <Input
//                                 value={newWebsite.url || ''}
//                                 onChange={(e) => setNewWebsite({ ...newWebsite, url: e.target.value })}
//                                 placeholder="输入网站链接 (例如 https://example.com)"
//                             />
//                         </div>
//                         <div className="space-y-2">
//                             <Label>网站图标</Label>
//                             <div className="flex gap-2 items-center">
//                                 <div className="flex-1">
//                                     <Input
//                                         value={newWebsite.icon || ''}
//                                         onChange={(e) => setNewWebsite({ ...newWebsite, icon: e.target.value })}
//                                         placeholder="输入图标链接或使用右侧按钮"
//                                     />
//                                 </div>
//                                 <input
//                                     type="file"
//                                     ref={fileInputRef}
//                                     className="hidden"
//                                     accept="image/*"
//                                     onChange={handleFileUpload}
//                                 />
//                                 <Button
//                                     variant="outline"
//                                     size="icon"
//                                     onClick={() => fileInputRef.current?.click()}
//                                     disabled={uploading}
//                                     title="上传图标"
//                                 >
//                                     {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
//                                 </Button>
//                                 <Button
//                                     variant="outline"
//                                     size="icon"
//                                     onClick={handleFetchIcon}
//                                     disabled={fetchingIcon}
//                                     title="自动获取图标"
//                                 >
//                                     {fetchingIcon ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
//                                 </Button>
//                             </div>
//                             {newWebsite.icon && (
//                                 <div className="mt-2 flex items-center gap-2">
//                                     <span className="text-sm text-muted-foreground">预览：</span>
//                                     <img
//                                         src={newWebsite.icon}
//                                         alt="Icon Preview"
//                                         className="h-8 w-8 object-contain border rounded p-1"
//                                         onError={(e) => (e.target as HTMLImageElement).src = '/favicon.ico'}
//                                     />
//                                 </div>
//                             )}
//                         </div>
//                         <div className="space-y-2">
//                             <Label>网站描述</Label>
//                             <Textarea
//                                 value={newWebsite.description || ''}
//                                 onChange={(e) => setNewWebsite({ ...newWebsite, description: e.target.value })}
//                                 placeholder="输入网站描述"
//                             />
//                         </div>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="space-y-2">
//                                 <Label>一级菜单</Label>
//                                 <Select
//                                     value={selectedParentMenu}
//                                     onValueChange={setSelectedParentMenu}
//                                 >
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="选择一级菜单" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         {parentMenus.map((menu) => (
//                                             <SelectItem key={menu.id} value={menu.id}>
//                                                 {menu.name}
//                                             </SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                             <div className="space-y-2">
//                                 <Label>二级菜单</Label>
//                                 <Select
//                                     value={newWebsite.menuId || ''}
//                                     onValueChange={(value) => setNewWebsite({ ...newWebsite, menuId: value })}
//                                     disabled={!selectedParentMenu}
//                                 >
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="选择二级菜单" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         {childMenus.map((menu) => (
//                                             <SelectItem key={menu.id} value={menu.id}>
//                                                 {menu.name}
//                                             </SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>
//                         <div className="space-y-2">
//                             <Label>标签</Label>
//                             <MultipleTag
//                                 tags={tags}
//                                 selectedTags={selectedTags}
//                                 onTagsChange={(newTags) => {
//                                     setSelectedTags(newTags)
//                                 }}
//                             />
//                         </div>
//                     </div>
//                     <DialogFooter>
//                         <Button variant="outline" onClick={handleCancel}>
//                             取消
//                         </Button>
//                         <Button onClick={handleSave}>
//                             {isEditing ? '保存' : '添加'}
//                         </Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//
//             <div className="space-y-4">
//                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                     <h2 className="text-lg font-semibold">网站列表</h2>
//                     <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
//                         <Input
//                             placeholder="搜索网站..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="w-full sm:w-[200px]"
//                         />
//                         <Button onClick={() => setIsAdding(true)} className="whitespace-nowrap">
//                             <Plus className="mr-2 h-4 w-4" />
//                             添加网站
//                         </Button>
//                     </div>
//                 </div>
//
//                 <Table>
//                     <TableHeader>
//                         <TableRow>
//                             <TableHead className="w-16 text-center">序号</TableHead>
//                             <TableHead className="w-40">名称</TableHead>
//                             <TableHead className="w-40">链接</TableHead>
//                             <TableHead className="w-40">描述</TableHead>
//                             <TableHead className="w-40">菜单</TableHead>
//                             <TableHead className="w-40">标签</TableHead>
//                             <TableHead className="w-24 text-right">操作</TableHead>
//                         </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                         {loading ? (
//                             <TableRow>
//                                 <TableCell colSpan={7} className="text-center py-8">
//                                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
//                                 </TableCell>
//                             </TableRow>
//                         ) : websites.length === 0 ? (
//                             <TableRow>
//                                 <TableCell colSpan={7} className="text-center py-8">
//                                     暂无数据
//                                 </TableCell>
//                             </TableRow>
//                         ) : (
//                             websites.map((website, index) => {
//                                 return (
//                                     <TableRow key={website.id}>
//                                         <TableCell className="text-center">
//                                             {(currentPage - 1) * pageSize + index + 1}
//                                         </TableCell>
//                                         <TableCell>
//                                             <div className="truncate" title={website.name}>{website.name}</div>
//                                         </TableCell>
//                                         <TableCell>
//                                             <div className="truncate" title={website.url}>{website.url}</div>
//                                         </TableCell>
//                                         <TableCell>
//                                             <div className="truncate" title={website.description}>{website.description}</div>
//                                         </TableCell>
//                                         <TableCell>
//                                             {website.menu?.name || '-'}
//                                         </TableCell>
//                                         <TableCell>
//                                             <div className="flex flex-wrap gap-1">
//                                                 {website.tags?.map((tag) => (
//                                                     <Badge
//                                                         key={tag.tag.id}
//                                                         variant="outline"
//                                                         className="truncate max-w-[80px]"
//                                                         style={{
//                                                             color: tag.tag.color,
//                                                             borderColor: tag.tag.color
//                                                         }}
//                                                         title={tag.tag.name}
//                                                     >
//                                                         {tag.tag.name}
//                                                     </Badge>
//                                                 ))}
//                                             </div>
//                                         </TableCell>
//                                         <TableCell>
//                                             <div className="flex justify-end space-x-2">
//                                                 <Button
//                                                     variant="ghost"
//                                                     size="sm"
//                                                     onClick={() => handleEdit(website)}
//                                                 >
//                                                     <Pencil className="h-4 w-4" />
//                                                 </Button>
//                                                 <Button
//                                                     variant="ghost"
//                                                     size="sm"
//                                                     onClick={() => handleDelete(website.id)}
//                                                 >
//                                                     <Trash2 className="h-4 w-4" />
//                                                 </Button>
//                                             </div>
//                                         </TableCell>
//                                     </TableRow>
//                                 )
//                             })
//                         )}
//                     </TableBody>
//                 </Table>
//
//                 {/* 分页 */}
//                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//                     <div className="text-sm text-muted-foreground">
//                         共 {totalPages} 页
//                     </div>
//                     <div className="flex items-center space-x-2">
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handlePageChange(currentPage - 1)}
//                             disabled={currentPage === 1 || loading}
//                         >
//                             <ChevronLeft className="h-4 w-4" />
//                         </Button>
//                         <div className="text-sm">
//                             第 {currentPage} 页
//                         </div>
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handlePageChange(currentPage + 1)}
//                             disabled={currentPage === totalPages || loading}
//                         >
//                             <ChevronRight className="h-4 w-4" />
//                         </Button>
//                     </div>
//                 </div>
//
//                 <Toaster />
//             </div>
//         </div>
//     )
// }
import { useEffect, useRef, useState } from 'react'
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
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Upload, Globe, Loader2 } from "lucide-react"
import { Website, MenuItemTree, Tag } from '@/types/settings'
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
    const [menuTree, setMenuTree] = useState<MenuItemTree[]>([])
    const [parentMenus, setParentMenus] = useState<MenuItemTree[]>([])
    const [childMenus, setChildMenus] = useState<MenuItemTree[]>([])
    const [selectedParentMenu, setSelectedParentMenu] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [pageSize] = useState(10)
    const [loading, setLoading] = useState(false)
    const [tags, setTags] = useState<Tag[]>([])
    const [selectedTags, setSelectedTags] = useState<Tag[]>([])
    const [uploading, setUploading] = useState(false)
    const [fetchingIcon, setFetchingIcon] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

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
        setChildMenus([])
        setIsAdding(false)
        setIsEditing(null)
    }

    // 加载网站列表
    const loadWebsites = async (page: number = currentPage) => {
        setLoading(true)
        try {
            const response = await api.getWebsites(`page=${page}&pageSize=${pageSize}&search=${searchTerm}`)
            setWebsites(response.data)
            if (response.pagination) {
                setTotalPages(response.pagination.totalPages)
            }
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

    // 加载菜单树 - 修复：获取完整树结构
    const loadMenus = async () => {
        try {
            const tree = await api.menus()
            setMenuTree(tree)
            // 筛选出所有一级菜单 (parentId 为 null 或 "0")
            const parents = tree.filter(menu => !menu.parentId || menu.parentId === '0')
            setParentMenus(parents)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "加载失败",
                description: "无法加载菜单数据，请稍后重试",
            })
            console.log(error)
        }
    }

    // 当一级菜单选择改变时，更新二级菜单列表
    useEffect(() => {
        if (selectedParentMenu) {
            // 在完整树中查找选中的一级菜单
            const parent = menuTree.find(m => m.id === selectedParentMenu)
            // 如果找到，设置其子菜单，否则置空
            setChildMenus(parent?.children || [])

            // 如果切换了一级菜单，且当前的 menuId 不在新的一级菜单的子菜单中，清空 menuId
            if (newWebsite.menuId) {
                const isChild = parent?.children?.some(c => c.id === newWebsite.menuId);
                if (!isChild) {
                    setNewWebsite(prev => ({ ...prev, menuId: '' }))
                }
            }
        } else {
            setChildMenus([])
        }
    }, [selectedParentMenu, menuTree])

    useEffect(() => {
        loadWebsites(1) // 搜索时重置页码
    }, [searchTerm])

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
        const tagIds = website.tags?.map(tagRef => tagRef.tag.id) || []
        const websiteTags = tags.filter(tag => tagIds.includes(tag.id))

        setNewWebsite(website)
        setIsEditing(website.id)
        setIsAdding(true)
        setSelectedTags(websiteTags)

        // 查找该网站所属的二级菜单的父级菜单
        // 遍历所有一级菜单（roots）
        for (const root of parentMenus) {
            // 检查该 root 的 children 中是否包含 website.menuId
            const found = root.children?.find(child => child.id === website.menuId)
            if (found) {
                setSelectedParentMenu(root.id)
                // useEffect 会自动更新 childMenus
                break
            }
        }
    }

    const handleCancel = () => {
        resetForm()
    }

    const handleDelete = async (id: string) => {
        if (!confirm("确定要删除这个网站吗？")) return

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
                tags: selectedTags.map(tag => ({ id: tag.id, name: tag.name }))
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
        } catch (error: any) {
            // 处理后端返回的错误信息
            const errorMessage = error.message || "操作失败";
            toast({
                variant: "destructive",
                title: "操作失败",
                description: errorMessage,
            })
            console.log(error)
        }
    }

    // 处理文件上传
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const { url } = await api.uploadFile(file)
            setNewWebsite(prev => ({ ...prev, icon: url }))
            toast({
                title: "上传成功",
                description: "图标已上传",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "上传失败",
                description: "无法上传图标，请稍后重试",
            })
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // 处理自动获取图标
    const handleFetchIcon = async () => {
        if (!newWebsite.url) {
            toast({
                variant: "destructive",
                title: "错误",
                description: "请先填写网站链接",
            })
            return
        }

        setFetchingIcon(true)
        try {
            const { url } = await api.fetchIcon(newWebsite.url)
            setNewWebsite(prev => ({ ...prev, icon: url }))
            toast({
                title: "获取成功",
                description: "图标已自动获取",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "获取失败",
                description: "无法自动获取图标，请手动上传",
            })
        } finally {
            setFetchingIcon(false)
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
                                placeholder="输入网站链接 (例如 https://example.com)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>网站图标</Label>
                            <div className="flex gap-2 items-center">
                                <div className="flex-1">
                                    <Input
                                        value={newWebsite.icon || ''}
                                        onChange={(e) => setNewWebsite({ ...newWebsite, icon: e.target.value })}
                                        placeholder="输入图标链接或使用右侧按钮"
                                    />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    title="上传图标"
                                >
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleFetchIcon}
                                    disabled={fetchingIcon}
                                    title="自动获取图标"
                                >
                                    {fetchingIcon ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                                </Button>
                            </div>
                            {newWebsite.icon && (
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">预览：</span>
                                    <img
                                        src={newWebsite.icon}
                                        alt="Icon Preview"
                                        className="h-8 w-8 object-contain border rounded p-1"
                                        onError={(e) => (e.target as HTMLImageElement).src = '/favicon.ico'}
                                    />
                                </div>
                            )}
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
                                        {parentMenus.map((menu) => (
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
                                    disabled={!selectedParentMenu || childMenus.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择二级菜单" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {childMenus.map((menu) => (
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
                                            {website.menu?.name || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {website.tags?.map((tag) => (
                                                    <Badge
                                                        key={tag.tag.id}
                                                        variant="outline"
                                                        className="truncate max-w-[80px]"
                                                        style={{
                                                            color: tag.tag.color,
                                                            borderColor: tag.tag.color
                                                        }}
                                                        title={tag.tag.name}
                                                    >
                                                        {tag.tag.name}
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