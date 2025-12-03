// import { useEffect, useState } from 'react'
// import { Button } from "@/components/ui/button"
// import { Label } from "@/components/ui/label"
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select"
// import { Switch } from "@/components/ui/switch"
// import { Slider } from "@/components/ui/slider"
// import { SystemSettings } from '@/types/settings'
// import { api } from '@/lib/api'
// import { toast } from "@/hooks/use-toast"
// import { useTranslation } from 'react-i18next'
// import { useTheme } from "../theme-provider"
//
// // 默认设置
// const defaultSettings: SystemSettings = {
//     theme: 'system',
//     language: 'zh',
//     sidebarWidth: 240,
//     showTagColors: true,
// }
//
// export function SystemSettingsPanel() {
//     const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
//     const [isLoading, setIsLoading] = useState(false)
//     const { t, i18n } = useTranslation()
//     const { setTheme } = useTheme()
//
//     // 加载系统设置
//     const loadSettings = async () => {
//         try {
//             setIsLoading(true)
//             const response = await api.getSystemSettings()
//             if (response) {
//                 // 确保数据类型正确，特别是 boolean 和 number
//                 const loadedSettings = {
//                     ...defaultSettings,
//                     ...response,
//                     showTagColors: Boolean(response.showTagColors),
//                     sidebarWidth: Number(response.sidebarWidth) || 240
//                 }
//                 setSettings(loadedSettings)
//
//                 // 同步应用设置到当前界面
//                 i18n.changeLanguage(loadedSettings.language)
//                 setTheme(loadedSettings.theme as any)
//             }
//         } catch (error) {
//             console.error(error)
//             toast({
//                 variant: "destructive",
//                 title: t('system.loadError'),
//                 description: t('system.loadErrorDesc'),
//             })
//         } finally {
//             setIsLoading(false)
//         }
//     }
//
//     useEffect(() => {
//         loadSettings()
//     }, [])
//
//     const handleSave = async () => {
//         try {
//             setIsLoading(true)
//             await api.updateSystemSettings(settings)
//
//             // 保存后立即应用变更
//             i18n.changeLanguage(settings.language)
//             setTheme(settings.theme as any)
//             // TODO: 这里可以添加逻辑应用 sidebarWidth 和 showTagColors 到全局 Context 或 CSS 变量
//
//             toast({
//                 title: t('system.saveSuccess'),
//                 description: t('system.saveSuccessDesc'),
//             })
//         } catch (error) {
//             console.error(error)
//             toast({
//                 variant: "destructive",
//                 title: t('system.saveError'),
//                 description: t('system.saveErrorDesc'),
//             })
//         } finally {
//             setIsLoading(false)
//         }
//     }
//
//     return (
//         <div className="space-y-6">
//             <div className="space-y-6">
//                 {/* 主题设置 */}
//                 <div className="flex items-center justify-between">
//                     <div className="space-y-1">
//                         <Label>{t('system.theme')}</Label>
//                         <p className="text-sm text-muted-foreground">
//                             {t('system.themeDesc')}
//                         </p>
//                     </div>
//                     <Select
//                         value={settings.theme}
//                         onValueChange={(value) => setSettings({ ...settings, theme: value })}
//                         disabled={isLoading}
//                     >
//                         <SelectTrigger className="w-40">
//                             <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="light">{t('system.themeLight')}</SelectItem>
//                             <SelectItem value="dark">{t('system.themeDark')}</SelectItem>
//                             <SelectItem value="system">{t('system.themeSystem')}</SelectItem>
//                         </SelectContent>
//                     </Select>
//                 </div>
//
//                 {/* 语言设置 */}
//                 <div className="flex items-center justify-between">
//                     <div className="space-y-1">
//                         <Label>{t('system.language')}</Label>
//                         <p className="text-sm text-muted-foreground">
//                             {t('system.languageDesc')}
//                         </p>
//                     </div>
//                     <Select
//                         value={settings.language}
//                         onValueChange={(value) => setSettings({ ...settings, language: value })}
//                         disabled={isLoading}
//                     >
//                         <SelectTrigger className="w-40">
//                             <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="zh">{t('system.languageZh')}</SelectItem>
//                             <SelectItem value="en">{t('system.languageEn')}</SelectItem>
//                         </SelectContent>
//                     </Select>
//                 </div>
//
//                 {/* 侧边栏宽度 */}
//                 <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                         <div className="space-y-1">
//                             <Label>{t('system.sidebarWidth')}</Label>
//                             <p className="text-sm text-muted-foreground">
//                                 {t('system.sidebarWidthDesc')}
//                             </p>
//                         </div>
//                         <span className="text-sm font-medium">{settings.sidebarWidth}px</span>
//                     </div>
//                     <Slider
//                         value={[settings.sidebarWidth]}
//                         onValueChange={([value]) => setSettings({ ...settings, sidebarWidth: value })}
//                         min={200}
//                         max={400}
//                         step={10}
//                         disabled={isLoading}
//                         className="w-full"
//                     />
//                 </div>
//
//                 {/* 显示标签颜色 */}
//                 <div className="flex items-center justify-between">
//                     <div className="space-y-1">
//                         <Label>{t('system.showTagColors')}</Label>
//                         <p className="text-sm text-muted-foreground">
//                             {t('system.showTagColorsDesc')}
//                         </p>
//                     </div>
//                     <Switch
//                         checked={settings.showTagColors}
//                         onCheckedChange={(checked) => setSettings({ ...settings, showTagColors: checked })}
//                         disabled={isLoading}
//                     />
//                 </div>
//             </div>
//
//             <div className="flex justify-end pt-4 border-t">
//                 <Button onClick={handleSave} disabled={isLoading}>
//                     {isLoading ? t('common.saving') : t('common.save')}
//                 </Button>
//             </div>
//         </div>
//     )
// }

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { SystemSettings } from '@/types/settings'
import { api } from '@/lib/api'
import { toast } from "@/hooks/use-toast"
import { useTranslation } from 'react-i18next'
import { useTheme } from "../theme-provider"

// 默认设置
const defaultSettings: SystemSettings = {
    id: '1',
    theme: 'system',
    language: 'zh',
    sidebarWidth: 240,
}

export function SystemSettingsPanel() {
    const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
    const [isLoading, setIsLoading] = useState(false)
    const { t, i18n } = useTranslation()
    const { setTheme } = useTheme()

    // 加载系统设置
    const loadSettings = async () => {
        try {
            setIsLoading(true)
            const response = await api.getSystemSettings()
            if (response) {
                // 确保数据类型正确
                const loadedSettings = {
                    ...defaultSettings,
                    ...response.data,
                    sidebarWidth: Number(response.data.sidebarWidth) || 240
                }
                setSettings(loadedSettings)

                // 同步应用设置到当前界面
                i18n.changeLanguage(loadedSettings.language)
                setTheme(loadedSettings.theme as any)
            }
        } catch (error) {
            console.error(error)
            toast({
                variant: "destructive",
                title: t('system.loadError'),
                description: t('system.loadErrorDesc'),
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadSettings()
    }, [])

    const handleSave = async () => {
        try {
            setIsLoading(true)
            await api.updateSystemSettings(settings)

            // 保存后立即应用变更
            i18n.changeLanguage(settings.language)
            setTheme(settings.theme as any)

            toast({
                title: t('system.saveSuccess'),
                description: t('system.saveSuccessDesc'),
            })

            // 延迟刷新以应用侧边栏宽度等全局样式
            setTimeout(() => {
                window.location.reload()
            }, 1000)

        } catch (error) {
            console.error(error)
            toast({
                variant: "destructive",
                title: t('system.saveError'),
                description: t('system.saveErrorDesc'),
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-6">
                {/* 主题设置 */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label>{t('system.theme')}</Label>
                        <p className="text-sm text-muted-foreground">
                            {t('system.themeDesc')}
                        </p>
                    </div>
                    <Select
                        value={settings.theme}
                        onValueChange={(value) => setSettings({ ...settings, theme: value })}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">{t('system.themeLight')}</SelectItem>
                            <SelectItem value="dark">{t('system.themeDark')}</SelectItem>
                            <SelectItem value="system">{t('system.themeSystem')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* 语言设置 */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label>{t('system.language')}</Label>
                        <p className="text-sm text-muted-foreground">
                            {t('system.languageDesc')}
                        </p>
                    </div>
                    <Select
                        value={settings.language}
                        onValueChange={(value) => setSettings({ ...settings, language: value })}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="zh">{t('system.languageZh')}</SelectItem>
                            <SelectItem value="en">{t('system.languageEn')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? t('common.saving') : t('common.save')}
                </Button>
            </div>
        </div>
    )
}