import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, Upload, Download, Share2, X } from "lucide-react"
import { api } from '@/lib/api'
import { GalleryImage, GalleryCategory } from '@/types/settings'
import { toast } from "@/hooks/use-toast"
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// 这是一个假设的 hook，如果不想引入新库，可以用原生事件

export function GalleryImageSettings() {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [categories, setCategories] = useState<GalleryCategory[]>([])
    const [loading, setLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentImage, setCurrentImage] = useState<Partial<GalleryImage>>({})

    // Upload State
    const [uploadQueue, setUploadQueue] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [imgs, cats] = await Promise.all([
                api.getGalleryImages(),
                api.getGalleryCategories()
            ])
            setImages(imgs.data)
            setCategories(cats.data)
        } catch (e) {
            toast({ variant: "destructive", title: "加载失败" })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!currentImage.url) return toast({ variant: "destructive", title: "请上传或输入图片地址" })

        try {
            if (currentImage.id) {
                await api.updateGalleryImage(currentImage.id, currentImage)
            } else {
                // 这里的创建是针对手动添加的单个图片，批量上传有单独逻辑
                await api.createGalleryImage(currentImage)
            }
            setDialogOpen(false)
            loadData()
            toast({ title: "保存成功" })
        } catch (e) {
            toast({ variant: "destructive", title: "保存失败" })
        }
    }

    const handleDelete = async (id: string) => {
        if(!confirm("确定删除?")) return
        try {
            await api.deleteGalleryImage(id)
            loadData()
            toast({ title: "删除成功" })
        } catch (e) {
            toast({ variant: "destructive", title: "删除失败" })
        }
    }

    const handleDownload = (url: string) => {
        const link = document.createElement('a')
        link.href = url
        link.download = url.split('/').pop() || 'image'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleShare = (url: string) => {
        navigator.clipboard.writeText(url)
        toast({ title: "链接已复制" })
    }

    // --- Drag & Drop Upload Logic ---
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
            setUploadQueue(prev => [...prev, ...newFiles])
        }
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setUploadQueue(prev => [...prev, ...newFiles])
        }
        e.target.value = '' // reset
    }

    const startBatchUpload = async () => {
        if (uploadQueue.length === 0) return;
        setIsUploading(true);
        setUploadProgress({ current: 0, total: uploadQueue.length });

        let successCount = 0;

        for (let i = 0; i < uploadQueue.length; i++) {
            const file = uploadQueue[i];
            try {
                const { url } = await api.uploadFile(file);
                // 自动创建图片记录
                await api.createGalleryImage({
                    url,
                    title: file.name.split('.')[0],
                    date: new Date().toISOString()
                });
                successCount++;
            } catch (e) {
                console.error(`Failed to upload ${file.name}`, e);
            }
            setUploadProgress(prev => ({ ...prev, current: i + 1 }));
        }

        setIsUploading(false);
        setUploadQueue([]);
        loadData();
        toast({ title: `批量上传完成，成功 ${successCount} 张` });
    };

    const removeFileFromQueue = (index: number) => {
        setUploadQueue(prev => prev.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-4 h-[80vh] flex flex-col">
            {/* Upload Area */}
            <div
                className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors relative"
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            >
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" id="file-upload" />
                <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">拖拽图片到此处，或 <label htmlFor="file-upload" className="text-primary cursor-pointer hover:underline">点击选择</label></p>
                </div>

                {uploadQueue.length > 0 && (
                    <div className="mt-4 w-full max-w-md mx-auto bg-background border rounded p-4 text-left">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-sm">待上传 ({uploadQueue.length})</h4>
                            <Button size="sm" onClick={startBatchUpload} disabled={isUploading}>
                                {isUploading ? `上传中 ${uploadProgress.current}/${uploadProgress.total}` : '开始上传'}
                            </Button>
                        </div>
                        <div className="max-h-[100px] overflow-y-auto space-y-1">
                            {uploadQueue.map((f, i) => (
                                <div key={i} className="text-xs flex justify-between items-center">
                                    <span className="truncate max-w-[200px]">{f.name}</span>
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFileFromQueue(i)}/>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Images Table */}
            <div className="flex-1 border rounded-md overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">预览</TableHead>
                            <TableHead>标题</TableHead>
                            <TableHead>分类</TableHead>
                            <TableHead>日期</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {images.map(img => (
                            <TableRow key={img.id}>
                                <TableCell><img src={img.url} className="h-10 w-10 object-cover rounded" /></TableCell>
                                <TableCell className="font-medium">{img.title}</TableCell>
                                <TableCell>{img.category?.name || '-'}</TableCell>
                                <TableCell>{new Date(img.date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleDownload(img.url)} title="下载"><Download className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleShare(img.url)} title="复制链接"><Share2 className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" onClick={() => { setCurrentImage(img); setDialogOpen(true) }} title="编辑"><Pencil className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(img.id)} title="删除" className="text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>编辑图片信息</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex justify-center">
                            {currentImage.url && <img src={currentImage.url} className="h-32 object-contain border rounded" />}
                        </div>
                        <div className="space-y-2">
                            <Label>标题</Label>
                            <Input value={currentImage.title || ''} onChange={e => setCurrentImage({...currentImage, title: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>分类</Label>
                            <Select value={currentImage.categoryId} onValueChange={val => setCurrentImage({...currentImage, categoryId: val})}>
                                <SelectTrigger><SelectValue placeholder="无分类" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>日期</Label>
                            <Input type="date" value={currentImage.date ? currentImage.date.split('T')[0] : ''} onChange={e => setCurrentImage({...currentImage, date: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>描述</Label>
                            <Textarea value={currentImage.description || ''} onChange={e => setCurrentImage({...currentImage, description: e.target.value})} />
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