// import { cn } from '@/lib/utils'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { useState, useEffect, useRef, useCallback } from 'react'
// import { Heart, Download, Share2, Loader2, Play, Pause, ChevronLeft, ChevronRight, MoreVertical, X } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { useNavigation } from "@/context/navigation-context"
// import { api } from '@/lib/api'
// import { GalleryImage } from '@/types/settings'
// import { toast } from '@/hooks/use-toast'
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
//
// interface GalleryContentProps {
//     className?: string
// }
//
// // Helper to format date
// const formatDate = (dateStr: string) => {
//     const date = new Date(dateStr);
//     return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
// }
//
// export function GalleryContent({ className }: GalleryContentProps) {
//     const { selectedCategory } = useNavigation()
//     const [images, setImages] = useState<GalleryImage[]>([])
//     const [loading, setLoading] = useState(false)
//
//     // Lightbox State
//     const [lightboxOpen, setLightboxOpen] = useState(false)
//     const [currentImageIndex, setCurrentImageIndex] = useState(0)
//     const [isPlaying, setIsPlaying] = useState(false)
//     const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null)
//
//     useEffect(() => {
//         loadImages()
//     }, [ selectedCategory])
//
//     const loadImages = async () => {
//         setLoading(true)
//         try {
//             const categoryId = selectedCategory || 'all'
//             const res = await api.getGalleryImages(`categoryId=${categoryId}`)
//             setImages(res.data || [])
//         } catch (e) {
//             console.error(e)
//             setImages([])
//         } finally {
//             setLoading(false)
//         }
//     }
//
//     // Group images by date
//     const groupedImages = (images || []).reduce((acc, image) => {
//         const dateKey = image.date ? image.date.split('T')[0] : '未知日期';
//         if (!acc[dateKey]) acc[dateKey] = [];
//         acc[dateKey].push(image);
//         return acc;
//     }, {} as Record<string, GalleryImage[]>);
//
//     // Sort dates descending
//     const sortedDates = Object.keys(groupedImages).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
//
//     // Lightbox Handlers
//     const openLightbox = (image: GalleryImage) => {
//         const index = images.findIndex(img => img.id === image.id);
//         setCurrentImageIndex(index);
//         setLightboxOpen(true);
//         setIsPlaying(false);
//     }
//
//     const closeLightbox = () => {
//         setLightboxOpen(false);
//         stopSlideshow();
//     }
//
//     const nextImage = useCallback(() => {
//         setCurrentImageIndex(prev => (prev + 1) % images.length);
//     }, [images.length]);
//
//     const prevImage = useCallback(() => {
//         setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
//     }, [images.length]);
//
//     const toggleSlideshow = () => {
//         if (isPlaying) {
//             stopSlideshow();
//         } else {
//             startSlideshow();
//         }
//     }
//
//     const startSlideshow = () => {
//         setIsPlaying(true);
//         slideInterval.current = setInterval(() => {
//             nextImage();
//         }, 3000);
//     }
//
//     const stopSlideshow = () => {
//         setIsPlaying(false);
//         if (slideInterval.current) {
//             clearInterval(slideInterval.current);
//             slideInterval.current = null;
//         }
//     }
//
//     // Keyboard navigation
//     useEffect(() => {
//         const handleKeyDown = (e: KeyboardEvent) => {
//             if (!lightboxOpen) return;
//             if (e.key === 'ArrowRight') nextImage();
//             if (e.key === 'ArrowLeft') prevImage();
//             if (e.key === 'Escape') closeLightbox();
//             if (e.key === ' ') { e.preventDefault(); toggleSlideshow(); }
//         };
//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, [lightboxOpen, nextImage, prevImage, isPlaying]);
//
//     const currentImage = images[currentImageIndex];
//
//     const handleToggleFavorite = async () => {
//         if (!currentImage) return;
//         try {
//             await api.updateGalleryImage(currentImage.id, { isFavorite: !currentImage.isFavorite });
//             setImages(prev => prev.map(img => img.id === currentImage.id ? { ...img, isFavorite: !img.isFavorite } : img));
//             toast({ title: !currentImage.isFavorite ? "已收藏" : "已取消收藏" });
//         } catch (e) {
//             toast({ variant: "destructive", title: "操作失败" });
//         }
//     }
//
//     const handleDownload = () => {
//         if (!currentImage) return;
//         const link = document.createElement('a');
//         link.href = currentImage.url;
//         link.download = currentImage.title || 'image';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     }
//
//     const handleShare = (e?: React.MouseEvent, url?: string) => {
//         e?.stopPropagation();
//         const targetUrl = url || currentImage?.url;
//         if (!targetUrl) return;
//
//         // 需求：分享的时候把当前访问的网址加上
//         const shareText = `${window.location.href}${targetUrl}`;
//
//         navigator.clipboard.writeText(shareText);
//         toast({ title: "链接已复制", description: "包含图片地址和当前页面链接" });
//     }
//
//     return (
//         <div className={cn("h-full relative bg-background", className)}>
//             <ScrollArea className="h-full">
//                 <div className="container mx-auto p-4 sm:p-6 pb-24">
//                     {loading ? (
//                         <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8" /></div>
//                     ) : (
//                         <div className="space-y-8">
//                             {sortedDates.map(date => (
//                                 <div key={date}>
//                                     <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-background/80 backdrop-blur z-10 py-2">{formatDate(date)}</h3>
//                                     {/* Waterfall Layout using CSS columns */}
//                                     <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
//                                         {groupedImages[date].map(image => (
//                                             <div
//                                                 key={image.id}
//                                                 className="break-inside-avoid group relative cursor-pointer rounded-lg overflow-hidden bg-muted mb-4"
//                                                 onClick={() => openLightbox(image)}
//                                             >
//                                                 <img
//                                                     src={image.url}
//                                                     alt={image.title}
//                                                     className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
//                                                     loading="lazy"
//                                                 />
//                                                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             ))}
//                             {images.length === 0 && <div className="text-center text-muted-foreground py-20">暂无照片</div>}
//                         </div>
//                     )}
//                 </div>
//             </ScrollArea>
//
//             {/* Lightbox Overlay */}
//             {lightboxOpen && currentImage && (
//                 <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200">
//                     {/* Top Toolbar */}
//                     <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/50 to-transparent text-white">
//                         <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                                 <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
//                                     <MoreVertical className="h-5 w-5" />
//                                 </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="start">
//                                 <DropdownMenuItem onClick={handleDownload}><Download className="mr-2 h-4 w-4"/> 下载</DropdownMenuItem>
//                                 <DropdownMenuItem onClick={handleShare}><Share2 className="mr-2 h-4 w-4"/> 分享</DropdownMenuItem>
//                                 <DropdownMenuItem onClick={handleToggleFavorite}>
//                                     <Heart className={cn("mr-2 h-4 w-4", currentImage.isFavorite ? "fill-red-500 text-red-500" : "")}/>
//                                     {currentImage.isFavorite ? "取消收藏" : "收藏"}
//                                 </DropdownMenuItem>
//                             </DropdownMenuContent>
//                         </DropdownMenu>
//
//                         <span className="text-sm font-medium opacity-80">{currentImageIndex + 1} / {images.length}</span>
//
//                         <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={closeLightbox}>
//                             <X className="h-6 w-6" />
//                         </Button>
//                     </div>
//
//                     {/* Main Image Area */}
//                     <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4">
//                         <img
//                             src={currentImage.url}
//                             alt={currentImage.title}
//                             className="max-w-full max-h-full object-contain shadow-2xl"
//                         />
//
//                         {/* Nav Buttons */}
//                         <Button
//                             variant="ghost" size="icon"
//                             className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full hidden md:flex"
//                             onClick={(e) => { e.stopPropagation(); prevImage(); }}
//                         >
//                             <ChevronLeft className="h-8 w-8" />
//                         </Button>
//                         <Button
//                             variant="ghost" size="icon"
//                             className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full hidden md:flex"
//                             onClick={(e) => { e.stopPropagation(); nextImage(); }}
//                         >
//                             <ChevronRight className="h-8 w-8" />
//                         </Button>
//                     </div>
//
//                     {/* Bottom Info & Controls */}
//                     <div className="p-6 bg-gradient-to-t from-black/80 to-transparent text-white flex justify-between items-end">
//                         <div className="max-w-[70%]">
//                             <h2 className="text-xl font-bold mb-1">{currentImage.title}</h2>
//                             {currentImage.description && <p className="text-sm opacity-80 line-clamp-2">{currentImage.description}</p>}
//                             <p className="text-xs opacity-50 mt-2">{formatDate(currentImage.date)}</p>
//                         </div>
//                         <div>
//                             <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-10 w-10" onClick={toggleSlideshow} title={isPlaying ? "暂停" : "自动播放"}>
//                                 {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     )
// }

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, Download, Share2, Loader2, Play, Pause, ChevronLeft, ChevronRight, MoreVertical, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigation } from "@/context/navigation-context"
import { api } from '@/lib/api'
import { GalleryImage } from '@/types/settings'
import { toast } from '@/hooks/use-toast'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface GalleryContentProps {
    className?: string
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function GalleryContent({ className }: GalleryContentProps) {
    const { selectedCategory } = useNavigation()
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(false)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        loadImages()
    }, [selectedCategory])

    const loadImages = async () => {
        setLoading(true)
        try {
            const categoryId = selectedCategory || 'all'
            const res = await api.getGalleryImages(`categoryId=${categoryId}`)
            setImages(res.data || [])
        } catch (e) {
            console.error(e)
            setImages([])
        } finally {
            setLoading(false)
        }
    }

    const groupedImages = (images || []).reduce((acc, image) => {
        const dateKey = image.date ? image.date.split('T')[0] : '未知日期';
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(image);
        return acc;
    }, {} as Record<string, GalleryImage[]>);

    const sortedDates = Object.keys(groupedImages).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const openLightbox = (image: GalleryImage) => {
        const index = images.findIndex(img => img.id === image.id);
        setCurrentImageIndex(index);
        setLightboxOpen(true);
        setIsPlaying(false);
    }

    const closeLightbox = () => {
        setLightboxOpen(false);
        stopSlideshow();
    }

    const nextImage = useCallback(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback(() => {
        setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    const toggleSlideshow = () => {
        if (isPlaying) {
            stopSlideshow();
        } else {
            startSlideshow();
        }
    }

    const startSlideshow = () => {
        setIsPlaying(true);
        slideInterval.current = setInterval(() => {
            nextImage();
        }, 3000);
    }

    const stopSlideshow = () => {
        setIsPlaying(false);
        if (slideInterval.current) {
            clearInterval(slideInterval.current);
            slideInterval.current = null;
        }
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxOpen) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeLightbox();
            if (e.key === ' ') { e.preventDefault(); toggleSlideshow(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, nextImage, prevImage, isPlaying]);

    const currentImage = images[currentImageIndex];

    const handleToggleFavorite = async () => {
        if (!currentImage) return;
        try {
            await api.updateGalleryImage(currentImage.id, { isFavorite: !currentImage.isFavorite });
            setImages(prev => prev.map(img => img.id === currentImage.id ? { ...img, isFavorite: !img.isFavorite } : img));
            toast({ title: !currentImage.isFavorite ? "已收藏" : "已取消收藏" });
        } catch (e) {
            toast({ variant: "destructive", title: "操作失败" });
        }
    }

    const handleDownload = () => {
        if (!currentImage) return;
        const link = document.createElement('a');
        link.href = currentImage.url;
        link.download = currentImage.title || 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleShare = (e?: React.MouseEvent, url?: string) => {
        e?.stopPropagation();
        const targetInternalUrl = url || currentImage?.url;
        if (!targetInternalUrl) return;

        // 使用 /api/share/img/ 前缀
        const sharePath = targetInternalUrl.replace('/api/rfile/', '/api/share/img/');
        const fullShareUrl = `${window.location.origin}${sharePath}`;

        // 修改：只复制 URL
        navigator.clipboard.writeText(fullShareUrl);
        toast({ title: "链接已复制" });
    }

    return (
        <div className={cn("h-full relative bg-background", className)}>
            <ScrollArea className="h-full">
                <div className="container mx-auto p-4 sm:p-6 pb-24">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8" /></div>
                    ) : (
                        <div className="space-y-8">
                            {sortedDates.map(date => (
                                <div key={date}>
                                    <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-background/80 backdrop-blur z-10 py-2">{formatDate(date)}</h3>
                                    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                                        {groupedImages[date].map(image => (
                                            <div
                                                key={image.id}
                                                className="break-inside-avoid group relative cursor-pointer rounded-lg overflow-hidden bg-muted mb-4"
                                                onClick={() => openLightbox(image)}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={image.title}
                                                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {images.length === 0 && <div className="text-center text-muted-foreground py-20">暂无照片</div>}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Lightbox */}
            {lightboxOpen && currentImage && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200">
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/50 to-transparent text-white">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={handleDownload}><Download className="mr-2 h-4 w-4"/> 下载</DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => handleShare(e)}><Share2 className="mr-2 h-4 w-4"/> 分享</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleToggleFavorite}>
                                    <Heart className={cn("mr-2 h-4 w-4", currentImage.isFavorite ? "fill-red-500 text-red-500" : "")}/>
                                    {currentImage.isFavorite ? "取消收藏" : "收藏"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <span className="text-sm font-medium opacity-80">{currentImageIndex + 1} / {images.length}</span>

                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={closeLightbox}>
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4">
                        <img
                            src={currentImage.url}
                            alt={currentImage.title}
                            className="max-w-full max-h-full object-contain shadow-2xl"
                        />

                        <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full hidden md:flex" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                            <ChevronLeft className="h-8 w-8" />
                        </Button>
                        <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full hidden md:flex" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                            <ChevronRight className="h-8 w-8" />
                        </Button>
                    </div>

                    <div className="p-6 bg-gradient-to-t from-black/80 to-transparent text-white flex justify-between items-end">
                        <div className="max-w-[70%]">
                            <h2 className="text-xl font-bold mb-1">{currentImage.title}</h2>
                            {currentImage.description && <p className="text-sm opacity-80 line-clamp-2">{currentImage.description}</p>}
                            <p className="text-xs opacity-50 mt-2">{formatDate(currentImage.date)}</p>
                        </div>
                        <div>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-10 w-10" onClick={toggleSlideshow} title={isPlaying ? "暂停" : "自动播放"}>
                                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}