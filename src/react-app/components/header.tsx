import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe, Moon, Sun, Laptop, User } from "lucide-react"
import { useTheme } from "./theme-provider"
import { useTranslation } from 'react-i18next'
import { Link } from "@/components/ui/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useView } from "@/components/ui/view-context"
import { useState } from 'react'
import { Login } from "./login"

export function Header() {
    const { setTheme } = useTheme()
    const { t, i18n } = useTranslation()
    const { setCurrentView } = useView()
    const [showLogin, setShowLogin] = useState(false)
    const username = localStorage.getItem('username')

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang)
    }

    const handleLogout = () => {
        localStorage.removeItem('username')
        localStorage.removeItem('token')
        window.location.reload()
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-screen-2xl w-full mx-auto relative">
                <div className={cn(
                    "flex h-14 items-center justify-center",
                    "transition-all duration-300"
                )}>
                    {/* Sidebar Trigger */}
                    <div className="fixed left-4 top-[14px] z-50">
                        <SidebarTrigger className="bg-background text-foreground hover:bg-muted focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"/>
                    </div>

                    {/* Centered Navigation */}
                    <nav className={cn(
                        "flex items-center justify-center",
                        "space-x-2 xs:space-x-4 sm:space-x-6 md:space-x-8 lg:space-x-12",
                        "text-[13px] xs:text-sm"
                    )}>
                        <Link 
                            href="/" 
                            className="whitespace-nowrap font-medium transition-transform duration-300 ease-in-out hover:scale-105 hover:text-primary"
                            onClick={() => setCurrentView('navigation')}
                        >
                            {t('nav.home')}
                        </Link>
                        <Link 
                            href="#" 
                            className="whitespace-nowrap font-medium transition-transform duration-300 ease-in-out hover:scale-105 hover:text-primary"
                            onClick={() => setCurrentView('notes')}
                        >
                            {t('nav.notes')}
                        </Link>
                        <Link href="/#" className="whitespace-nowrap font-medium transition-transform duration-300 ease-in-out hover:scale-105 hover:text-primary"
                            onClick={() => setCurrentView('gallery')}>
                            {t('nav.gallery')}
                        </Link>
                        <Link 
                            href="#" 
                            className="whitespace-nowrap font-medium transition-transform duration-300 ease-in-out hover:scale-105 hover:text-primary"
                            onClick={() => setCurrentView('about')}
                        >
                            {t('nav.about')}
                        </Link>
                        <Link href="#" className="whitespace-nowrap font-medium transition-transform duration-300 ease-in-out hover:scale-105 hover:text-primary"
                            onClick={() => setCurrentView('friends')}
                        >
                            {t('nav.friends')}
                        </Link>
                    </nav>
                    
                    {/* Right-aligned icons */}
                    <div className="fixed right-4 top-[14px] flex items-center gap-1 sm:gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Globe className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => changeLanguage('zh')}>
                                    中文
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                                    English
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Sun className="h-4 w-4 dark:hidden" />
                                    <Moon className="h-4 w-4 hidden dark:block" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setTheme("light")}>
                                    <Sun className="mr-2 h-4 w-4" />
                                    Light
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>
                                    <Moon className="mr-2 h-4 w-4" />
                                    Dark
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>
                                    <Laptop className="mr-2 h-4 w-4" />
                                    System
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {username ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="relative"
                                        title={t('header.userProfile')}
                                    >
                                        <User className="h-5 w-5" />
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-none absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleLogout}>
                                        {t('header.logout')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowLogin(true)}
                                className="relative"
                                title={t('header.login')}
                            >
                                <User className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <Login open={showLogin} onOpenChange={setShowLogin} />
        </header>
    )
}
