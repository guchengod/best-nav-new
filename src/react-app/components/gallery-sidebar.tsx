//
// import React from 'react'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { cn } from '@/lib/utils'
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarHeader,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
// } from '@/components/ui/sidebar'
// import { Image as ImageIcon, FolderHeart, Clock, Heart } from 'lucide-react'
// import { Separator } from '@/components/ui/separator'
//
// interface GalleryItem {
//   id: string
//   title: string
//   count: number
//   icon: React.ElementType
//   color?: string
// }
//
// const galleries: GalleryItem[] = [
//   {
//     id: 'all',
//     title: '所有照片',
//     count: 128,
//     icon: ImageIcon,
//   },
//   {
//     id: 'favorites',
//     title: '我的收藏',
//     count: 23,
//     icon: Heart,
//     color: 'text-red-500',
//   },
//   {
//     id: 'recent',
//     title: '最近查看',
//     count: 45,
//     icon: Clock,
//   }
// ]
//
// const albums: GalleryItem[] = [
//   {
//     id: 'nature',
//     title: '自然风光',
//     count: 32,
//     icon: FolderHeart,
//   },
//   {
//     id: 'city',
//     title: '城市风景',
//     count: 48,
//     icon: FolderHeart,
//   },
//   {
//     id: 'portrait',
//     title: '人像写真',
//     count: 28,
//     icon: FolderHeart,
//   },
//   {
//     id: 'food',
//     title: '美食记录',
//     count: 20,
//     icon: FolderHeart,
//   }
// ]
//
// interface GallerySidebarProps {
//   className?: string
// }
//
// export function GallerySidebar({ className }: GallerySidebarProps) {
//   const [selectedId, setSelectedId] = React.useState('all')
//
//   return (
//     <Sidebar className={cn("w-64 transition-width duration-300 ease-in-out border-r", className)}>
//       <SidebarHeader className="border-b px-3 py-2">
//         <h2 className="text-lg font-semibold tracking-tight">相册库</h2>
//       </SidebarHeader>
//       <SidebarContent>
//         <ScrollArea className="h-[calc(100vh-8rem)] px-3">
//           <SidebarGroup>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 {galleries.map((item) => (
//                   <SidebarMenuItem key={item.id}>
//                     <SidebarMenuButton
//                       onClick={() => setSelectedId(item.id)}
//                       isActive={selectedId === item.id}
//                       className={cn(
//                         "w-full px-4 py-2 rounded-md",
//                         "focus:outline-none focus:ring-2 focus:ring-offset-2",
//                         "transition-colors duration-200"
//                       )}
//                     >
//                       <item.icon className={cn("h-4 w-4", item.color)} />
//                       <span>{item.title}</span>
//                       <span className="ml-auto text-xs text-[color:var(--sidebar-muted-foreground)]">
//                         {item.count}
//                       </span>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 ))}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//
//           <Separator className="my-4" />
//
//           <SidebarGroup>
//             <div className="mb-2 px-2 text-xs font-semibold tracking-tight text-[color:var(--sidebar-muted-foreground)]">
//               相册分类
//             </div>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 {albums.map((item) => (
//                   <SidebarMenuItem key={item.id}>
//                     <SidebarMenuButton
//                       onClick={() => setSelectedId(item.id)}
//                       isActive={selectedId === item.id}
//                       className={cn(
//                         "w-full px-4 py-2 rounded-md",
//                         "focus:outline-none focus:ring-2 focus:ring-offset-2",
//                         "transition-colors duration-200"
//                       )}
//                     >
//                       <item.icon className="h-4 w-4" />
//                       <span>{item.title}</span>
//                       <span className="ml-auto text-xs text-[color:var(--sidebar-muted-foreground)]">
//                         {item.count}
//                       </span>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 ))}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         </ScrollArea>
//       </SidebarContent>
//       <SidebarFooter className="border-t p-3">
//         <p className="text-xs text-[color:var(--sidebar-muted-foreground)]">
//           共 {galleries.reduce((acc, item) => acc + item.count, 0)} 张照片
//         </p>
//       </SidebarFooter>
//     </Sidebar>
//   )
// }

import React, { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Image as ImageIcon, FolderHeart, Heart, Settings, ImagePlus, FolderCog, Cog, ChevronDown } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useNavigation } from "@/context/navigation-context"
import { api } from '@/lib/api'
import { GalleryCategory } from '@/types/settings'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SettingsDialog } from './settings/settings-dialog'
import { GalleryImageSettings } from './settings/gallery-image-settings'
import { GalleryCategorySettings } from './settings/gallery-category-settings'
import {GallerySystemSettings} from "@/components/settings/gallery-system-settings.tsx";

interface GalleryItem {
    id: string
    title: string
    icon: React.ElementType
    color?: string
}

const defaultGalleries: GalleryItem[] = [
    { id: 'all', title: '所有照片', icon: ImageIcon },
    { id: 'favorites', title: '我的收藏', icon: Heart, color: 'text-red-500' },
]

export function GallerySidebar({ className }: { className?: string }) {
    const { setSelectedCategory } = useNavigation()
    const [activeId, setActiveId] = useState('all')
    const [categories, setCategories] = useState<GalleryCategory[]>([])

    // Settings state
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [activeDialog, setActiveDialog] = useState<string | null>(null)
    const isLoggedIn = !!localStorage.getItem('auth_token')

    useEffect(() => {
        if (isLoggedIn) {
            loadCategories()
        }
    }, [isLoggedIn])

    const loadCategories = async () => {
        try {
            const res = await api.getGalleryCategories()
            setCategories(res.data || [])
        } catch (e) {
            console.error(e)
        }
    }

    const handleSelect = (id: string) => {
        setActiveId(id)
        setSelectedCategory(id)
    }

    return (
        <Sidebar className={cn("w-64 transition-width duration-300 ease-in-out border-r", className)}>
            <SidebarHeader className="border-b px-3 py-2">
                <h2 className="text-lg font-semibold tracking-tight">相册库</h2>
            </SidebarHeader>
            <SidebarContent>
                <ScrollArea className="h-full px-3">
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {defaultGalleries.map((item) => (
                                    <SidebarMenuItem key={item.id}>
                                        <SidebarMenuButton
                                            onClick={() => handleSelect(item.id)}
                                            isActive={activeId === item.id}
                                        >
                                            <item.icon className={cn("h-4 w-4", item.color)} />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <Separator className="my-2" />

                    <SidebarGroup>
                        <div className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
                            相册分类
                        </div>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {categories.length > 0 ? categories.map((item) => (
                                    <SidebarMenuItem key={item.id}>
                                        <SidebarMenuButton
                                            onClick={() => handleSelect(item.id)}
                                            isActive={activeId === item.id}
                                        >
                                            <FolderHeart className="h-4 w-4" />
                                            <span>{item.name}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )) : (
                                    <div className="px-2 text-sm text-muted-foreground">暂无分类</div>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </ScrollArea>
            </SidebarContent>

            {isLoggedIn && (
                <SidebarFooter className="border-t p-0">
                    <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                        <CollapsibleContent className="space-y-1 p-2">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => setActiveDialog('images')}>
                                        <ImagePlus className="h-4 w-4"/>
                                        <span>图片管理</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => setActiveDialog('categories')}>
                                        <FolderCog className="h-4 w-4"/>
                                        <span>分类管理</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => setActiveDialog('system')}>
                                        <Cog className="h-4 w-4"/>
                                        <span>系统设置</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </CollapsibleContent>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="w-full p-4 h-auto flex justify-between hover:bg-accent">
                                <div className="flex items-center">
                                    <Settings className="h-4 w-4 mr-2"/>
                                    <span className="font-medium">图库设置</span>
                                </div>
                                <ChevronDown className={cn("h-4 w-4 transition-transform", !settingsOpen && "rotate-180")}/>
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                    </Collapsible>

                    <SettingsDialog
                        open={activeDialog === 'images'}
                        onOpenChange={(open) => {
                            if(!open) { setActiveDialog(null); loadCategories(); } // 关闭时刷新，可能图片上传影响了状态
                        }}
                        title="图片管理"
                    >
                        <GalleryImageSettings />
                    </SettingsDialog>
                    <SettingsDialog
                        open={activeDialog === 'categories'}
                        onOpenChange={(open) => {
                            if(!open) { setActiveDialog(null); loadCategories(); } // 关闭时刷新分类列表
                        }}
                        title="分类管理"
                    >
                        <GalleryCategorySettings onSuccess={loadCategories} />
                    </SettingsDialog>
                    <SettingsDialog
                        open={activeDialog === 'system'}
                        onOpenChange={(open) => !open && setActiveDialog(null)}
                        title="系统设置"
                    >
                        <GallerySystemSettings />
                    </SettingsDialog>
                </SidebarFooter>
            )}
        </Sidebar>
    )
}