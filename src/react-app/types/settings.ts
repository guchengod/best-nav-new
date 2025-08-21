export interface APIResponse<T> {
    data: T;
    error?: string;
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
    tags: Tag[];
    menuId?: string;
    alive: boolean;
}

// 标签类型
export interface Tag {
    id: string;
    name: string;
    color: string;
}

// 系统设置类型
export interface SystemSettings {
    theme: 'light' | 'dark' | 'system' | string;
    language: string;
    sidebarWidth: number;
    showTagColors: boolean;
}
