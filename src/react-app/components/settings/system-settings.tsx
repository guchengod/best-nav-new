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
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { SystemSettings } from '@/types/settings'
import { api } from '@/lib/api'
import { toast } from "@/hooks/use-toast"
import { useTranslation } from 'react-i18next'

const defaultSettings: SystemSettings = {
    theme: 'system',
    language: 'zh',
    sidebarWidth: 256,
    showTagColors: true
}

export function SystemSettingsPanel() {
    const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
    const [isLoading, setIsLoading] = useState(false)
    const { t } = useTranslation()

    // 加载系统设置
    const loadSettings = async () => {
        try {
            setIsLoading(true)
            const data = await api.getSystemSettings()
            setSettings(data)
        } catch (error) {
            toast({
                variant: "destructive",
                title: t('system.loadError'),
                description: t('system.loadErrorDesc'),
            })
            setSettings(defaultSettings)
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
            toast({
                title: t('system.saveSuccess'),
                description: t('system.saveSuccessDesc'),
            })
        } catch (error) {
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
            <div className="space-y-4">
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

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>{t('system.sidebarWidth')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('system.sidebarWidthDesc')}
                            </p>
                        </div>
                        <span className="text-sm">{settings.sidebarWidth}px</span>
                    </div>
                    <Slider
                        value={[settings.sidebarWidth]}
                        onValueChange={([value]) => setSettings({ ...settings, sidebarWidth: value })}
                        min={200}
                        max={400}
                        step={8}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label>{t('system.showTagColors')}</Label>
                        <p className="text-sm text-muted-foreground">
                            {t('system.showTagColorsDesc')}
                        </p>
                    </div>
                    <Switch
                        checked={settings.showTagColors}
                        onCheckedChange={(checked) => setSettings({ ...settings, showTagColors: checked })}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? t('common.saving') : t('common.save')}
                </Button>
            </div>
        </div>
    )
}
