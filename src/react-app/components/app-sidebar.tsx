import {
    ChevronDown,
    ChevronRight,
    MenuIcon,
    Globe,
    Cog,
    Settings,
    Tags,
    User
} from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { MenuSettings } from "./settings/menu-settings"
import { WebsiteSettings } from "./settings/website-settings"
import { TagSettings } from "./settings/tag-settings"
import { SystemSettingsPanel } from "./settings/system-settings"
import { UserSettings } from "./settings/user-settings"
import { api } from "@/lib/api"
import { useNavigate, useLocation } from "react-router-dom"
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuBadge,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { SettingsDialog } from "./settings/settings-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MenuItemTree } from "../types/settings"

const AppSidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [showSettings, setShowSettings] = useState(false)
    const [activeTab, setActiveTab] = useState<string>('menu')
    const [menus, setMenus] = useState<MenuItemTree[]>([])
    const [loading, setLoading] = useState(true)
    const [menuFlags, setMenuFlags] = useState<Record<string, boolean>>({})
    const isLoggedIn = !!localStorage.getItem('auth_token')

    // 设置菜单的状态
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [activeDialog, setActiveDialog] = useState<string | null>(null);

    useEffect(() => {
        loadMenus()
    }, [])

    const loadMenus = async () => {
        try {
            setLoading(true)
            const response = await api.menus()
            setMenus(response)
            // 初始化菜单展开状态为关闭
            const flags: Record<string, boolean> = {}
            response.forEach(menu => {
                flags[menu.id] = false
            })
            setMenuFlags(flags)
        } catch (error) {
            console.error('Failed to load menus:', error)
        } finally {
            setLoading(false)
        }
    }

    // 切换菜单状态
    const toggleMenu = (name: string) => {
        setMenuFlags((prev) => ({...prev, [name]: !prev[name]}));
    };

    // 处理子菜单点击
    const handleSubItemClick = (category: string, subCategory: string) => {
        // 暂时只处理菜单状态
        setMenuFlags(prev => ({...prev, [category]: true}));
    };

    // 处理设置项点击
    const handleSettingClick = (type: string) => {
        setActiveDialog(type)
    }

    const handleMenuClick = (menuId: string) => {
        setMenuFlags(prev => ({
            ...prev,
            [menuId]: !prev[menuId]
        }))
    }

    const handleSubMenuClick = async (menuId: string, subMenuId: string) => {
        try {
            // 如果当前 URL 已经包含相同的 subMenuId，则清除参数（显示所有网站）
            const currentMenuId = new URLSearchParams(location.search).get('menuId');
            if (currentMenuId === subMenuId) {
                navigate('/');
            } else {
                navigate(`/?menuId=${subMenuId}`);
            }
        } catch (error) {
            console.error('Failed to handle menu click:', error);
        }
    }

    return (
        <Sidebar className="w-64 transition-width duration-300 ease-in-out border-r bg-background text-foreground">
            <SidebarHeader 
                className="p-4 flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                onClick={() => {
                    // 清除 URL 参数并导航到首页
                    navigate('/', { replace: true });
                }}
            >
                <img
                    src="https://img.sungaowei.com/api/rfile/best-nav.png"
                    alt="Best Nav Logo"
                    className="w-8 h-8 dark:invert"
                />
                <span className="font-bold text-lg">最佳导航</span>
            </SidebarHeader>
            <SidebarContent>
                <ScrollArea>
                    <SidebarGroup>
                        <SidebarGroupContent className="space-y-1 p-2">
                            {menus.map((menu) => (
                                <SidebarMenu key={menu.id}>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton 
                                            onClick={() => handleMenuClick(menu.id)}
                                            className="w-full px-4 py-2 rounded-md focus:outline-none hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                                        >
                                            <div className="flex items-center">
                                                {menuFlags[menu.id] ? (
                                                    <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
                                                )}
                                                <span className="flex-1">{menu.name}</span>
                                                <SidebarMenuBadge>
                                                    {menu.children?.length || 0}
                                                </SidebarMenuBadge>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    {menuFlags[menu.id] && menu.children && (
                                        <SidebarMenuSub>
                                            {menu.children.map((subMenu) => (
                                                <SidebarMenuSubItem key={subMenu.id}>
                                                    <SidebarMenuButton
                                                        onClick={() => handleSubMenuClick(menu.id, subMenu.id)}
                                                        className="w-full px-8 py-2 rounded-md focus:outline-none hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                                                    >
                                                        <span>{subMenu.name}</span>
                                                    </SidebarMenuButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    )}
                                </SidebarMenu>
                            ))}
                        </SidebarGroupContent>
                    </SidebarGroup>
                </ScrollArea>
            </SidebarContent>
            {isLoggedIn && (
                            <SidebarFooter className="border-t">
                            <Collapsible 
                                open={settingsOpen} 
                                onOpenChange={setSettingsOpen}
                            >
                                <CollapsibleContent className="space-y-1">
                                    <SidebarMenu>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton 
                                                    onClick={() => handleSettingClick('menu')}
                                                    className="pl-4 bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    <MenuIcon className="h-4 w-4"/>
                                                    <span>菜单管理</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton 
                                                    onClick={() => handleSettingClick('website')}
                                                    className="pl-4 bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    <Globe className="h-4 w-4"/>
                                                    <span>网站管理</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton 
                                                    onClick={() => handleSettingClick('tags')}
                                                    className="pl-4 bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    <Tags className="h-4 w-4"/>
                                                    <span>标签管理</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton 
                                                    onClick={() => handleSettingClick('users')}
                                                    className="pl-4 bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    <User className="h-4 w-4"/>
                                                    <span>用户管理</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton 
                                                    onClick={() => handleSettingClick('system')}
                                                    className="pl-4 bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    <Cog className="h-4 w-4"/>
                                                    <span>系统设置</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        </SidebarMenu>
                                </CollapsibleContent>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton 
                                        className={cn(
                                            "w-full bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
                                            "focus:bg-muted focus:text-foreground focus:outline-none focus-visible:ring-0",
                                            "p-4 flex items-center"
                                        )}
                                    >
                                        <Settings className="h-4 w-4"/>
                                        <span className="font-medium ml-2">设置</span>
                                        <ChevronDown className={cn(
                                            "h-4 w-4 ml-auto transition-transform duration-200",
                                            !settingsOpen && "rotate-180"
                                        )}/>
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                            </Collapsible>
            
                            {/* 设置对话框 */}
                            <SettingsDialog
                                open={activeDialog === 'menu'}
                                onOpenChange={(open) => !open && setActiveDialog(null)}
                                title="菜单管理"
                                description="管理导航菜单的结构和内容"
                            >
                                <MenuSettings />
                            </SettingsDialog>
            
                            <SettingsDialog
                                open={activeDialog === 'website'}
                                onOpenChange={(open) => !open && setActiveDialog(null)}
                                title="网站管理"
                                description="管理导航网站的信息和分类"
                            >
                                <WebsiteSettings />
                            </SettingsDialog>
            
                            <SettingsDialog
                                open={activeDialog === 'tags'}
                                onOpenChange={(open) => !open && setActiveDialog(null)}
                                title="标签管理"
                                description="管理网站标签和分类"
                            >
                                <TagSettings />
                            </SettingsDialog>
            
                            <SettingsDialog
                                open={activeDialog === 'users'}
                                onOpenChange={(open) => !open && setActiveDialog(null)}
                                title="用户管理"
                                description="管理用户账号和权限"
                            >
                                <UserSettings />
                            </SettingsDialog>
            
                            <SettingsDialog
                                open={activeDialog === 'system'}
                                onOpenChange={(open) => !open && setActiveDialog(null)}
                                title="系统设置"
                                description="管理系统偏好和配置"
                            >
                                <SystemSettingsPanel />
                            </SettingsDialog>
                        </SidebarFooter>
                        )}
            
        </Sidebar>
    )
}

export { AppSidebar }
export default AppSidebar
