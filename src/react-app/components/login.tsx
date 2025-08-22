import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { api } from '@/lib/api'
import { useToast } from "../hooks/use-toast"
import { useTranslation } from 'react-i18next'
import { Lock, User } from "lucide-react"

interface LoginProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function Login({ open, onOpenChange }: LoginProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const { t } = useTranslation()

    const handleLogin = async () => {
        if (!username || !password) {
            toast({
                variant: "destructive",
                title: t('login.error'),
                description: t('login.fillAllFields'),
            })
            return
        }

        setLoading(true)
        try {
            const response = await api.login(username, password)
            if (response.error) {
                console.error(response.error,42)
                toast({
                    variant: "destructive",
                    title: t('login.failed'),
                    description: t('login.invalidCredentials'),
                })
                return
            }
            if (response.data) {
                localStorage.setItem('auth_token', response.data.token)
                localStorage.setItem('username', username)
                toast({
                    title: t('login.success'),
                    description: t('login.welcomeBack', { username }),
                })
                onOpenChange(false)
                window.location.reload()
            }
        } catch (error) {
            console.error(error,62)
            toast({
                variant: "destructive",
                title: t('login.failed'),
                description: t('login.invalidCredentials'),
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
                <div className="flex flex-col">
                    <div className="bg-primary p-6">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-primary-foreground">
                                {t('login.title')}
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-medium">
                                    {t('login.username')}
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        placeholder={t('login.usernamePlaceholder')}
                                        className="pl-10"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    {t('login.password')}
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder={t('login.passwordPlaceholder')}
                                        className="pl-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleLogin()
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <Button 
                            className="w-full" 
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? t('login.loggingIn') : t('login.submit')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
