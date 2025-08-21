

import React from 'react'
import { ScrollArea } from './ui/scroll-area'
import { cn } from '../lib/utils'
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from './ui/sidebar'
import { Users, Heart, Star, Coffee } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface FriendCategory {
    id: string
    title: string
    icon: React.ElementType
    color?: string
}

const friendCategories: FriendCategory[] = [
    {
        id: 'all',
        title: 'friends.sidebar.all',
        icon: Users,
        color: 'text-blue-500'
    },
    {
        id: 'favorites',
        title: 'friends.sidebar.favorites',
        icon: Heart,
        color: 'text-red-500'
    },
    {
        id: 'featured',
        title: 'friends.sidebar.featured',
        icon: Star,
        color: 'text-yellow-500'
    },
    {
        id: 'partners',
        title: 'friends.sidebar.partners',
        icon: Coffee,
        color: 'text-green-500'
    }
]

interface FriendsSidebarProps {
    className?: string
}

export function FriendsSidebar({ className }: FriendsSidebarProps) {
    const { t } = useTranslation()

    return (
        <Sidebar className={`w-64 transition-width duration-300 ease-in-out border-r ${className}`}>
            <SidebarHeader className="border-b px-6 py-3">
                <h2 className="text-lg font-semibold tracking-tight">{t('friends.sidebar.title')}</h2>
            </SidebarHeader>
            <SidebarContent>
                <ScrollArea className="h-full">
                    <div className="p-3">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {friendCategories.map((category) => (
                                        <SidebarMenuItem key={category.id}>
                                            <SidebarMenuButton
                                                onClick={() => {
                                                    const element = document.getElementById(category.id);
                                                    element?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className={cn(
                                                    "w-full px-4 py-2 rounded-md",
                                                    "focus:outline-none focus:ring-2 focus:ring-offset-2",
                                                    "transition-colors duration-200"
                                                )}
                                            >
                                                <category.icon className={cn(
                                                    "h-4 w-4",
                                                    category.color,
                                                    "transition-colors group-hover:scale-110"
                                                )} />
                                                <span className="text-sm font-medium">
                                                    {t(category.title)}
                                                </span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </div>
                </ScrollArea>
            </SidebarContent>
        </Sidebar>
    )
}
