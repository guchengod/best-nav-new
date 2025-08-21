import { cn } from '../lib/utils'
import { ScrollArea } from './ui/scroll-area'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { useState } from 'react'
import { AspectRatio } from './ui/aspect-ratio'
import { Heart, Download, Share2, CalendarIcon, ArrowUpDown, ImageIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Pagination } from './ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

interface Image {
  id: number
  url: string
  title: string
  description: string
  date: string // ISO date string
}

// 示例图片数据
const images: Image[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1682686581580-d99b0230064e',
    title: '自然风光',
    description: '美丽的山川河流',
    date: '2024-01-15'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1682686581030-7fa4ea2b96c3',
    title: '城市风景',
    description: '繁华的都市夜景',
    date: '2024-01-10'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-2RYAWR9KrOs',
    title: '建筑艺术',
    description: '独特的建筑设计',
    date: '2024-01-05'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1682686580186-b55d2a91053c',
    title: '自然景观',
    description: '壮丽的自然风光',
    date: '2024-01-01'
  },
]

interface GalleryContentProps {
  className?: string
}

type SortType = 'date-asc' | 'date-desc' | 'name-asc' | 'name-desc';

export function GalleryContent({ className }: GalleryContentProps) {
  const [dateRange, setDateRange] = useState<{
    from: string;
    to: string;
  }>({
    from: '',
    to: ''
  })
  const [sortType, setSortType] = useState<SortType>('date-desc')
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const handleImageError = (imageId: number) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }))
    setLoadingImages(prev => ({ ...prev, [imageId]: false }))
  }

  const handleImageLoad = (imageId: number) => {
    setLoadingImages(prev => ({ ...prev, [imageId]: false }))
  }

  const filteredImages = images.filter(image => {
    if (!dateRange.from && !dateRange.to) return true
    const imageDate = new Date(image.date)
    const fromDate = dateRange.from ? new Date(dateRange.from) : null
    const toDate = dateRange.to ? new Date(dateRange.to) : null
    
    if (fromDate && toDate) {
      return imageDate >= fromDate && imageDate <= toDate
    } else if (fromDate) {
      return imageDate >= fromDate
    } else if (toDate) {
      return imageDate <= toDate
    }
    return true
  })

  const sortedImages = [...filteredImages].sort((a, b) => {
    switch (sortType) {
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'name-asc':
        return a.title.localeCompare(b.title)
      case 'name-desc':
        return b.title.localeCompare(a.title)
      default:
        return 0
    }
  })

  return (
    <div className={cn("h-full relative", className)}>
      <ScrollArea className="h-full">
        <div className="container mx-auto p-6 pb-24">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-auto"
                />
              </div>
              <span className="hidden text-muted-foreground sm:block">至</span>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground sm:hidden" />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-auto"
                />
              </div>
              {(dateRange.from || dateRange.to) && (
                <Button
                  variant="ghost"
                  onClick={() => setDateRange({ from: '', to: '' })}
                  className="h-9 px-4 text-sm"
                >
                  重置
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1 min-w-[100px] sm:flex-none",
                  sortType.startsWith('date') && "bg-muted"
                )}
                onClick={() => {
                  setSortType(prev => 
                    prev === 'date-asc' ? 'date-desc' : 'date-asc'
                  )
                }}
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                {sortType === 'date-asc' ? '时间升序' : sortType === 'date-desc' ? '时间降序' : '时间'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1 min-w-[100px] sm:flex-none",
                  sortType.startsWith('name') && "bg-muted"
                )}
                onClick={() => {
                  setSortType(prev => 
                    prev === 'name-asc' ? 'name-desc' : 'name-asc'
                  )
                }}
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                {sortType === 'name-asc' ? '名称升序' : sortType === 'name-desc' ? '名称降序' : '名称'}
              </Button>
            </div>
          </div>
          <div className="grid auto-rows-[200px] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sortedImages.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((image) => (
              <Dialog key={image.id}>
                <DialogTrigger asChild>
                  <div
                    className="group relative h-full cursor-pointer overflow-hidden rounded-lg bg-background"
                    onClick={() => {}}
                  >
                    <AspectRatio ratio={1} className="h-full">
                      {imageErrors[image.id] ? (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-muted text-muted-foreground">
                          <ImageIcon className="h-10 w-10 mb-2" />
                          <p className="text-sm">图片加载失败</p>
                        </div>
                      ) : (
                        <>
                          {loadingImages[image.id] !== false && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            </div>
                          )}
                          <img
                            src={image.url}
                            alt={image.title}
                            loading="lazy"
                            className={cn(
                              "h-full w-full object-cover transition-all duration-300 hover:scale-105",
                              loadingImages[image.id] !== false && "opacity-0"
                            )}
                            onError={() => handleImageError(image.id)}
                            onLoad={() => handleImageLoad(image.id)}
                          />
                        </>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <h3 className="text-xl font-semibold text-white text-center mb-2">{image.title}</h3>
                          <div className="flex gap-3">
                            <button className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40">
                              <Heart className="h-4 w-4" />
                            </button>
                            <button className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40">
                              <Download className="h-4 w-4" />
                            </button>
                            <button className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40">
                              <Share2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-black/40 backdrop-blur-sm">
                          <p className="text-sm text-gray-200 line-clamp-2">{image.description}</p>
                          <p className="text-sm text-gray-300 mt-1">{new Date(image.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </AspectRatio>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-screen max-h-screen w-screen h-screen p-0 border-0">
                  <div className="relative w-full h-full flex items-center justify-center bg-black/95">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="max-w-[95vw] max-h-[95vh] object-contain"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </ScrollArea>
      <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t">
        <div className="container mx-auto p-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">每页显示</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="36">36</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">张图片</span>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(sortedImages.length / pageSize)}
              onPageChange={setCurrentPage}
              className="mt-4 sm:mt-0"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
