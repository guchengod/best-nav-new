import {SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "./app-sidebar";
import {Header} from "./header";
import {ScrollToTop} from "./scroll-to-top";
import { ViewProvider, useView } from "@/components/ui/view-context";
import Content from "./content";
import NoteContent from "./note-content";
import NoteSidebar from "./note-sidebar";
import { GalleryContent } from "./gallery-content";
import { GallerySidebar } from "./gallery-sidebar";
import { AboutContent } from "./about-content";
import { AboutSidebar } from "./about-sidebar";
import { FriendsSidebar } from './friends-sidebar'
import { FriendsContent } from './friends-content'
import { ScrollArea } from "@/components/ui/scroll-area"
import React, { useEffect } from "react";
import { api } from "@/lib/api";
import { useTheme } from "./theme-provider";
import { useTranslation } from "react-i18next";

function MainContent() {
    const { currentView } = useView();
    return (
        (() => {
            switch (currentView) {
                case 'navigation':
                    return <Content />;
                case 'notes':
                    return <NoteContent />;
                case 'gallery':
                    return <GalleryContent />;
                case 'about':
                    return <AboutContent />;
                case 'friends':
                    return <FriendsContent />;
                default:
                    return <Content />;
            }
        })()
    );
}

function Sidebar() {
    const { currentView } = useView();
    return (
        (() => {
            switch (currentView) {
                case 'navigation':
                    return <AppSidebar />;
                case 'notes':
                    return <NoteSidebar />;
                case 'gallery':
                    return <GallerySidebar />;
                case 'about':
                    return <AboutSidebar />;
                case 'friends':
                    return <FriendsSidebar />;
                default:
                    return <AppSidebar />;
            }
        })()
    );
}

export default function Layout() {
    const { setTheme } = useTheme();
    const { i18n } = useTranslation();

    // 初始化加载系统设置
    useEffect(() => {
        const initSettings = async () => {
            try {
                const settings = await api.getSystemSettings();
                if (settings) {
                    const data = settings.data
                    // 应用主题
                    if (data.theme) {
                        setTheme(data.theme as any);
                    }
                    // 应用语言
                    if (data.language) {
                        i18n.changeLanguage(data.language);
                    }
                }
            } catch (error) {
                console.error("Failed to load system settings:", error);
            }
        };
        initSettings();
    }, []);

    return (
        <ViewProvider>
            <div>
                {/* 通过 style 动态覆盖 sidebar width 变量 */}
                <SidebarProvider>
                    <Sidebar />
                    <main className="main flex flex-col flex-1">
                        <div id = "mainContent"  className="flex-grow overflow-auto">
                            <Header />
                            <ScrollArea>
                                <div id="minContent" className="p-8">
                                    <MainContent />
                                </div>
                            </ScrollArea>
                            <ScrollToTop />
                        </div>
                    </main>
                </SidebarProvider>
            </div>
        </ViewProvider>
    );
}