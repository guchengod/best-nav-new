import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "./app-sidebar";
import {Header} from "./header";
import {ScrollToTop} from "./scroll-to-top";
import { ViewProvider } from "@/components/ui/view-context";
import { useView } from "@/components/ui/view-context";
import Content from "./content";
import NoteContent from "./note-content";
import NoteSidebar from "./note-sidebar";
import { GalleryContent } from "./gallery-content";
import { GallerySidebar } from "./gallery-sidebar";
import { AboutContent } from "./about-content";
import { AboutSidebar } from "./about-sidebar";
import { FriendsSidebar } from './friends-sidebar'
import { FriendsContent } from './friends-content'
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area"
function MainContent() {
    const { currentView } = useView();
    return (
        // <motion.div
        //     initial={{ opacity: 0, y: 10 }}
        //     animate={{ opacity: 1, y: 0 }}
        //     exit={{ opacity: 0, y: -10 }}
        //     transition={{ duration: 0.3 }}
        // >
        //     {(() => {
        //         switch (currentView) {
        //             case 'navigation':
        //                 return <Content />;
        //             case 'notes':
        //                 return <NoteContent />;
        //             case 'gallery':
        //                 return <GalleryContent />;
        //             case 'about':
        //                 return <AboutContent />;
        //             case 'friends':
        //                 return <FriendsContent />;
        //             default:
        //                 return <Content />;
        //         }
        //     })()}
        // </motion.div>
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
        // <motion.div
        //     initial={{ opacity: 0, x: -10 }}
        //     animate={{ opacity: 1, x: 0 }}
        //     exit={{ opacity: 0, x: 10 }}
        //     transition={{ duration: 0.3 }}
        // >
        //     {(() => {
        //         switch (currentView) {
        //             case 'navigation':
        //                 return <AppSidebar />;
        //             case 'notes':
        //                 return <NoteSidebar />;
        //             case 'gallery':
        //                 return <GallerySidebar />;
        //             case 'about':
        //                 return <AboutSidebar />;
        //             case 'friends':
        //                 return <FriendsSidebar />;
        //             default:
        //                 return <AppSidebar />;
        //         }
        //     })()}
        // </motion.div>

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
    return (
        <ViewProvider>
            {/*<SidebarProvider className="flex h-screen w-full">*/}
            {/*    <div className="flex flex-1 w-full">*/}
            {/*        <Sidebar />*/}
            {/*        <main className="flex-1 flex flex-col min-w-0 relative">*/}
            {/*            <Header />*/}
            {/*            <div className="flex-1 w-full h-[calc(100vh-4rem)]">*/}
            {/*                <ScrollArea className="h-full">*/}
            {/*                    <MainContent />*/}
            {/*                </ScrollArea>*/}
            {/*            </div>*/}
            {/*            <ScrollToTop />*/}
            {/*        </main>*/}
            {/*    </div>*/}
            {/*</SidebarProvider>*/}


            <div>
                <SidebarProvider>
                    <Sidebar />
                    <main className="main flex flex-col flex-1">
                        <div id = "mainContent"  className="flex-grow overflow-auto">
                            <Header />
                            <ScrollArea>
                                <MainContent />
                            </ScrollArea>
                            <ScrollToTop />
                        </div>
                    </main>
                </SidebarProvider>
            </div>

        </ViewProvider>
    );
}
