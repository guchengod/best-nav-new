import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Pencil, Trash2, Plus, User } from "lucide-react"
import { api } from '@/lib/api'
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from 'react-i18next'

interface UserFormData {
    username: string
    password: string
}

export function UserSettings() {
    const [users, setUsers] = useState<any[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserFormData & { id?: string } | null>(null)
    const { toast } = useToast()
    const { t } = useTranslation()

    const loadUsers = async () => {
        try {
            const response = await api.getUsers()
            setUsers(response.data)
        } catch (error) {
            toast({
                variant: "destructive",
                title: t('users.loadError'),
                description: t('users.loadErrorDesc'),
            })
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const handleAddClick = () => {
        setEditingUser({ username: '', password: '' })
        setDialogOpen(true)
    }

    const handleEditClick = (user: any) => {
        setEditingUser({ ...user, password: '' })
        setDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!editingUser) return

        try {
            if (editingUser.id) {
                await api.updateUser(editingUser.id, {
                    ...editingUser,
                    password: editingUser.password,
                })
                toast({
                    title: t('users.updateSuccess'),
                    description: t('users.updateSuccessDesc'),
                })
            } else {
                await api.createUser({
                    ...editingUser,
                    password: editingUser.password,
                })
                toast({
                    title: t('users.createSuccess'),
                    description: t('users.createSuccessDesc'),
                })
            }
            setDialogOpen(false)
            setEditingUser(null)
            loadUsers()
        } catch (error) {
            toast({
                variant: "destructive",
                title: t('users.error'),
                description: t('users.errorDesc'),
            })
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm(t('users.confirmDelete'))) {
            try {
                await api.deleteUser(id)
                toast({
                    title: t('users.deleteSuccess'),
                    description: t('users.deleteSuccessDesc'),
                })
                loadUsers()
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: t('users.deleteError'),
                    description: t('users.deleteErrorDesc'),
                })
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{t('users.title')}</h2>
                <Button onClick={handleAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('users.addUser')}
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('users.username')}</TableHead>
                        <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditClick(user)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(user.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser?.id ? t('users.editUser') : t('users.addUser')}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser?.id ? t('users.editUserDesc') : t('users.addUserDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 p-4">
                        <div className="space-y-2">
                            <Label>
                                {t('users.username')}
                            </Label>
                            <Input
                                value={editingUser?.username || ''}
                                onChange={(e) => setEditingUser({ ...editingUser!, username: e.target.value })}
                                placeholder={t('users.usernamePlaceholder')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>
                                {editingUser?.id ? t('users.newPassword') : t('users.password')}
                            </Label>
                            <Input
                                type="password"
                                value={editingUser?.password || ''}
                                onChange={(e) => setEditingUser({ ...editingUser!, password: e.target.value })}
                                placeholder={t('users.passwordPlaceholder')}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                {t('common.cancel')}
                            </Button>
                            <Button onClick={handleSubmit}>
                                {editingUser?.id ? t('common.save') : t('common.add')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
