
import React from 'react'
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
import { Image as ImageIcon, FolderHeart, Clock, Heart } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface GalleryItem {
  id: string
  title: string
  count: number
  icon: React.ElementType
  color?: string
}

const galleries: GalleryItem[] = [
  {
    id: 'all',
    title: '所有照片',
    count: 128,
    icon: ImageIcon,
  },
  {
    id: 'favorites',
    title: '我的收藏',
    count: 23,
    icon: Heart,
    color: 'text-red-500',
  },
  {
    id: 'recent',
    title: '最近查看',
    count: 45,
    icon: Clock,
  }
]

const albums: GalleryItem[] = [
  {
    id: 'nature',
    title: '自然风光',
    count: 32,
    icon: FolderHeart,
  },
  {
    id: 'city',
    title: '城市风景',
    count: 48,
    icon: FolderHeart,
  },
  {
    id: 'portrait',
    title: '人像写真',
    count: 28,
    icon: FolderHeart,
  },
  {
    id: 'food',
    title: '美食记录',
    count: 20,
    icon: FolderHeart,
  }
]

interface GallerySidebarProps {
  className?: string
}

export function GallerySidebar({ className }: GallerySidebarProps) {
  const [selectedId, setSelectedId] = React.useState('all')

  return (
    <Sidebar className={cn("w-64 transition-width duration-300 ease-in-out border-r", className)}>
      <SidebarHeader className="border-b px-3 py-2">
        <h2 className="text-lg font-semibold tracking-tight">相册库</h2>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8rem)] px-3">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {galleries.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setSelectedId(item.id)}
                      isActive={selectedId === item.id}
                      className={cn(
                        "w-full px-4 py-2 rounded-md",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2",
                        "transition-colors duration-200"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", item.color)} />
                      <span>{item.title}</span>
                      <span className="ml-auto text-xs text-[color:var(--sidebar-muted-foreground)]">
                        {item.count}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <Separator className="my-4" />
          
          <SidebarGroup>
            <div className="mb-2 px-2 text-xs font-semibold tracking-tight text-[color:var(--sidebar-muted-foreground)]">
              相册分类
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {albums.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setSelectedId(item.id)}
                      isActive={selectedId === item.id}
                      className={cn(
                        "w-full px-4 py-2 rounded-md",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2",
                        "transition-colors duration-200"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      <span className="ml-auto text-xs text-[color:var(--sidebar-muted-foreground)]">
                        {item.count}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t p-3">
        <p className="text-xs text-[color:var(--sidebar-muted-foreground)]">
          共 {galleries.reduce((acc, item) => acc + item.count, 0)} 张照片
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
