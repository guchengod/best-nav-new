export interface APIResponse<T> {
    data: T;
    error?: string;
    msg?: string;
    pagination?: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

// 菜单项类型
export interface MenuItem {
    id: string;
    name?: string;
    icon?: string;
    url: string;
    parentId?: string;
    parentName?: string;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface MenuItemTree {
    id: string
    name: string
    icon: string
    url: string
    parentId: string | null
    sortOrder: number
    children: MenuItemTree[]
    createdAt: string
    updatedAt: string
}

// 网站项类型
export interface Website {
    id: string;
    name: string;
    url: string;
    icon: string;
    description: string;
    tags: TagRe[];
    menuId?: string;
    alive: boolean;
    menu:{name:string}
}

// 标签类型
export interface Tag {
    id: string;
    name: string;
    color: string;
}

export interface TagRe{
    tag: Tag
}


// 系统设置类型
export interface SystemSettings {
    id: string;
    theme: 'light' | 'dark' | 'system' | string;
    language: string;
    sidebarWidth: number;
}

// --- 图库相关类型 ---
export interface GalleryCategory {
    id: string;
    userId?: string;
    name: string;
    description?: string;
    sortOrder: number;
}

export interface GalleryImage {
    id: string;
    userId?: string;
    url: string;
    title: string;
    description?: string;
    categoryId?: string;
    category?: { name: string };
    isFavorite: boolean;
    date: string; // ISO date string or YYYY-MM-DD
    width?: number;
    height?: number;
}