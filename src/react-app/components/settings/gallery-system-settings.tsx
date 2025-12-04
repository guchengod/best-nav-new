import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from '@/lib/api'
import { toast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'

export function GallerySystemSettings() {
    const [trustedDomains, setTrustedDomains] = useState("")
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        setLoading(true)
        try {
            const res = await api.getGallerySettings()
            if (res.data) {
                setTrustedDomains(res.data.trustedDomains || "")
            }
        } catch (e) {
            console.error(e)
            toast({ variant: "destructive", title: "加载失败", description: "无法加载图库设置" })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.updateGallerySettings({ trustedDomains })
            toast({ title: "保存成功" })
        } catch (e) {
            toast({ variant: "destructive", title: "保存失败" })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>分享图片的信任网址</Label>
                <p className="text-sm text-muted-foreground">
                    在此处配置用于分享的域名白名单或相关说明（当前仅作为记录，后续可扩展校验功能）。
                </p>
                <Textarea
                    value={trustedDomains}
                    onChange={(e) => setTrustedDomains(e.target.value)}
                    placeholder="https://example.com"
                    rows={4}
                />
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    保存
                </Button>
            </div>
        </div>
    )
}