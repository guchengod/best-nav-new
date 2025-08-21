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
} from './ui/sidebar.tsx'
import { User2, Code2, Briefcase, Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AboutSection {
    id: string
    title: string
    icon: React.ElementType
    color?: string
}

const aboutSections: AboutSection[] = [
    {
        id: 'introduction',
        title: 'about.sidebar.introduction',
        icon: User2,
        color: 'text-blue-500'
    },
    {
        id: 'skills',
        title: 'about.sidebar.skills',
        icon: Code2,
        color: 'text-green-500'
    },
    {
        id: 'projects',
        title: 'about.sidebar.projects',
        icon: Briefcase,
        color: 'text-yellow-500'
    },
    {
        id: 'contact',
        title: 'about.sidebar.contact',
        icon: Mail,
        color: 'text-red-500'
    }
]

interface AboutSidebarProps {
    className?: string
}

export function AboutSidebar({ className }: AboutSidebarProps) {
    const { t } = useTranslation()

    return (
        <Sidebar className={`w-64 transition-width duration-300 ease-in-out border-r ${className}`}>
            <SidebarHeader className="border-b px-6 py-3">
                <h2 className="text-lg font-semibold tracking-tight">{t('about.sidebar.title')}</h2>
            </SidebarHeader>
            <SidebarContent>
                <ScrollArea className="h-full">
                    <div className="p-3">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {aboutSections.map((section) => (
                                        <SidebarMenuItem key={section.id}>
                                            <SidebarMenuButton
                                                onClick={() => {
                                                    const element = document.getElementById(section.id);
                                                    element?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className={cn(
                                                    "w-full px-4 py-2 rounded-md",
                                                    "focus:outline-none focus:ring-2 focus:ring-offset-2",
                                                    "transition-colors duration-200"
                                                )}
                                            >
                                                <section.icon className={cn(
                                                    "h-4 w-4",
                                                    section.color,
                                                    "transition-colors group-hover:scale-110"
                                                )} />
                                                <span className="text-sm font-medium">
                                                    {t(section.title)}
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
