"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Check, MoreHorizontal, X } from "lucide-react"

export interface Tag {
    id: string
    name: string
    color: string
}

interface MultipleTagProps {
    tags: Tag[]
    selectedTags: Tag[]
    onTagsChange: (tags: Tag[]) => void
    placeholder?: string
}

export function MultipleTag({
    tags,
    selectedTags,
    onTagsChange,
    placeholder = "选择标签..."
}: MultipleTagProps) {
    const [open, setOpen] = React.useState(false)
    const inputRef = React.useRef<HTMLDivElement>(null)

    return (
        <div className="relative w-full">
            <div
                ref={inputRef}
                className="flex flex-wrap items-center gap-1 p-2 min-h-[40px] rounded-md border focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                onClick={() => inputRef.current?.focus()}
            >
                {selectedTags.map((tag) => (
                    <Badge
                        key={tag.id}
                        variant="outline"
                        className="flex items-center gap-1 py-0.5 px-2"
                        style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                            borderColor: tag.color
                        }}
                    >
                        {tag.name}
                        <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation()
                                const newTags = selectedTags.filter(t => t.id !== tag.id)
                                onTagsChange(newTags)
                            }}
                        />
                    </Badge>
                ))}
                <div className="flex-1 flex items-center">
                    <Input
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                        placeholder={selectedTags.length === 0 ? placeholder : ""}
                    />
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger>
                            <MoreHorizontal className="h-4 w-4 shrink-0 opacity-50 cursor-pointer hover:opacity-100" />
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="搜索标签..." />
                                <CommandList>
                                    <CommandEmpty>未找到标签</CommandEmpty>
                                    <CommandGroup>
                                        <ScrollArea className="h-[200px]">
                                            {tags.map((tag) => {
                                                const isSelected = selectedTags.some(t => t.id === tag.id)
                                                return (
                                                    <CommandItem
                                                        key={tag.id}
                                                        value={tag.name}
                                                        onSelect={() => {
                                                            if (!isSelected) {
                                                                const newTags = [...selectedTags, tag]
                                                                onTagsChange(newTags)
                                                            }
                                                            setOpen(false)
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 w-full">
                                                            <Check
                                                                className={cn(
                                                                    "h-4 w-4",
                                                                    isSelected ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <span
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: tag.color }}
                                                            />
                                                            <span className="truncate flex-1">{tag.name}</span>
                                                        </div>
                                                    </CommandItem>
                                                )
                                            })}
                                        </ScrollArea>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    )
}
