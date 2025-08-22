import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'

interface Friend {
    id: string
    name: string
    avatar: string
    description: string
    url: string
    category: string
    tags?: string[]
}

const friends: Friend[] = [
    {
        id: '1',
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        description: 'A full-stack developer and tech blogger',
        url: 'https://example.com',
        category: 'featured',
        tags: ['Developer', 'Blogger', 'Tech']
    },
    {
        id: '2',
        name: 'Jane Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        description: 'UI/UX designer and creative artist',
        url: 'https://example.com',
        category: 'favorites',
        tags: ['Designer', 'Artist', 'Creative']
    },
    {
        id: '3',
        name: 'Alex Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        description: 'Open source contributor and community leader',
        url: 'https://example.com',
        category: 'partners',
        tags: ['Open Source', 'Community', 'Leader']
    }
]

interface FriendsContentProps {
    className?: string
}

export function FriendsContent({ className }: FriendsContentProps) {
    const { t } = useTranslation()

    return (
        <div className={cn("h-full flex flex-col", className)}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <h1 className="text-2xl font-bold">{t('friends.content.title')}</h1>
            </div>
            <ScrollArea className="flex-1">
                <div className="container p-2 sm:p-4 md:p-6">
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                        {friends.map((friend) => (
                            <a
                                key={friend.id}
                                href={friend.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col h-24 p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-background"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <img 
                                        src={friend.avatar} 
                                        alt={friend.name} 
                                        className="w-5 h-5 rounded-full" 
                                    />
                                    <span className="text-xs font-medium truncate flex-1">
                                        {friend.name}
                                    </span>
                                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                    {friend.description}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-auto">
                                    {friend.tags?.slice(0, 2).map((tag, index) => (
                                        <span 
                                            key={index} 
                                            className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {friend.tags && friend.tags.length > 2 && (
                                        <span className="text-[10px] text-muted-foreground">
                                            +{friend.tags.length - 2}
                                        </span>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
