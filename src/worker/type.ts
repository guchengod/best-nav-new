export type OrderRow = {
    Id: string;
    CustomerName: string;
    OrderDate: number;
};


// export interface Menu {
//     id: string;
//     name: string;
//     icon?: string;
//     url?: string;
//     parentId?: string;
//     sortOrder: number;
//     createdAt: string;
//     updatedAt: string;
//     children?: Menu[];
//     websites?: Website[];
// }

export interface Menu {
    id: string;
    name: string;
    icon: string | null; // 改为 string | null
    url: string | null;  // 改为 string | null
    parentId: string | null;
    sortOrder: number | null; // 改为 number | null
    createdAt: string | null; // 改为 string | null
    updatedAt: string | null; // 改为 string | null
    children?: Menu[];
    websites?: Website[];
}

export interface Website {
    id: string;
    name: string;
    url: string;
    icon?: string;
    description?: string;
    alive: boolean;
    menuId?: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    tags?: Tag[];
}

export interface Tag {
    id: string;
    name: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SystemSettings {
    id: string;
    theme: 'light' | 'dark' | 'system';
    language: 'zh' | 'en';
    sidebarWidth: number;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

export interface Variables {
    JWT_SECRET: string;
    user?: {
        userId: string;
        name: string;
        avatar?: string;
    };
}