// import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
// import {AppSidebar} from "./app-sidebar";
// import {Header} from "./header";
// import {ScrollToTop} from "./scroll-to-top";
// import { ViewProvider } from "@/components/ui/view-context";
// import { useView } from "@/components/ui/view-context";
// import Content from "./content";
// import NoteContent from "./note-content";
// import NoteSidebar from "./note-sidebar";
// import { GalleryContent } from "./gallery-content";
// import { GallerySidebar } from "./gallery-sidebar";
// import { AboutContent } from "./about-content";
// import { AboutSidebar } from "./about-sidebar";
// import { FriendsSidebar } from './friends-sidebar'
// import { FriendsContent } from './friends-content'
// import { motion } from "framer-motion";
// import { ScrollArea } from "@/components/ui/scroll-area"
// function MainContent() {
//     const { currentView } = useView();
//     return (
//         // <motion.div
//         //     initial={{ opacity: 0, y: 10 }}
//         //     animate={{ opacity: 1, y: 0 }}
//         //     exit={{ opacity: 0, y: -10 }}
//         //     transition={{ duration: 0.3 }}
//         // >
//         //     {(() => {
//         //         switch (currentView) {
//         //             case 'navigation':
//         //                 return <Content />;
//         //             case 'notes':
//         //                 return <NoteContent />;
//         //             case 'gallery':
//         //                 return <GalleryContent />;
//         //             case 'about':
//         //                 return <AboutContent />;
//         //             case 'friends':
//         //                 return <FriendsContent />;
//         //             default:
//         //                 return <Content />;
//         //         }
//         //     })()}
//         // </motion.div>
//         (() => {
//             switch (currentView) {
//                 case 'navigation':
//                     return <Content />;
//                 case 'notes':
//                     return <NoteContent />;
//                 case 'gallery':
//                     return <GalleryContent />;
//                 case 'about':
//                     return <AboutContent />;
//                 case 'friends':
//                     return <FriendsContent />;
//                 default:
//                     return <Content />;
//             }
//         })()
//     );
// }
//
// function Sidebar() {
//     const { currentView } = useView();
//     return (
//         // <motion.div
//         //     initial={{ opacity: 0, x: -10 }}
//         //     animate={{ opacity: 1, x: 0 }}
//         //     exit={{ opacity: 0, x: 10 }}
//         //     transition={{ duration: 0.3 }}
//         // >
//         //     {(() => {
//         //         switch (currentView) {
//         //             case 'navigation':
//         //                 return <AppSidebar />;
//         //             case 'notes':
//         //                 return <NoteSidebar />;
//         //             case 'gallery':
//         //                 return <GallerySidebar />;
//         //             case 'about':
//         //                 return <AboutSidebar />;
//         //             case 'friends':
//         //                 return <FriendsSidebar />;
//         //             default:
//         //                 return <AppSidebar />;
//         //         }
//         //     })()}
//         // </motion.div>
//
//         (() => {
//             switch (currentView) {
//                 case 'navigation':
//                     return <AppSidebar />;
//                 case 'notes':
//                     return <NoteSidebar />;
//                 case 'gallery':
//                     return <GallerySidebar />;
//                 case 'about':
//                     return <AboutSidebar />;
//                 case 'friends':
//                     return <FriendsSidebar />;
//                 default:
//                     return <AppSidebar />;
//             }
//         })()
//     );
// }
//
// export default function Layout() {
//     return (
//         <ViewProvider>
//             {/*<SidebarProvider className="flex h-screen w-full">*/}
//             {/*    <div className="flex flex-1 w-full">*/}
//             {/*        <Sidebar />*/}
//             {/*        <main className="flex-1 flex flex-col min-w-0 relative">*/}
//             {/*            <Header />*/}
//             {/*            <div className="flex-1 w-full h-[calc(100vh-4rem)]">*/}
//             {/*                <ScrollArea className="h-full">*/}
//             {/*                    <MainContent />*/}
//             {/*                </ScrollArea>*/}
//             {/*            </div>*/}
//             {/*            <ScrollToTop />*/}
//             {/*        </main>*/}
//             {/*    </div>*/}
//             {/*</SidebarProvider>*/}
//
//
//             <div>
//                 <SidebarProvider>
//                     <Sidebar />
//                     <main className="main flex flex-col flex-1">
//                         <div id = "mainContent"  className="flex-grow overflow-auto">
//                             <Header />
//                             <ScrollArea>
//                                <div id="minContent" className="p-8">
//                                    <MainContent />
//                                </div>
//                             </ScrollArea>
//                             <ScrollToTop />
//                         </div>
//                     </main>
//                 </SidebarProvider>
//             </div>
//
//         </ViewProvider>
//     );
// }

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
import { useEffect, useState } from "react";
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
    const [sidebarWidth, setSidebarWidth] = useState("16rem"); // 默认 256px
    const { setTheme } = useTheme();
    const { i18n } = useTranslation();

    // 初始化加载系统设置
    useEffect(() => {
        const initSettings = async () => {
            try {
                const settings = await api.getSystemSettings();
                if (settings) {
                    const data = settings.data
                    // 应用侧边栏宽度
                    if (data.sidebarWidth) {
                        setSidebarWidth(`${data.sidebarWidth}px`);
                    }
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
                <SidebarProvider style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}>
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