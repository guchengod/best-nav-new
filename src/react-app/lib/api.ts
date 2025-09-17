import type {APIResponse, MenuItem, MenuItemTree, SystemSettings, Tag, Website} from '../types/settings'

export type { MenuItem, Website, Tag, SystemSettings }

// 开发环境使用相对路径，生产环境使用绝对路径
// const BASE_URL = 'https://best-nav-server.sungaowei.com';

// API错误处理
class APIError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'APIError';
    }
}

// 获取JWT token
function getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
}

// 通用请求处理函数
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}, requiresAuth: boolean = false): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth) {
        const token = getAuthToken();
        if (!token) {
            throw new APIError('Authentication required');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });

        if (!response.ok) {
            if(response.status === 401){
                localStorage.removeItem('auth_token');
            }else{
                const errorData = await response.json().catch(() => null);
                throw new APIError(errorData?.error || `HTTP error! status: ${response.status}`);
            }
        }

        return await response.json();
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        throw new APIError('Network error');
    }
}

// API方法
export const api = {
    // 认证相关
    async login(username: string, password: string): Promise<APIResponse<{ token: string }>> {
        return fetchAPI('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },

    // 菜单管理
    async menus(): Promise<MenuItemTree[]> {
        const response = await fetchAPI<APIResponse<MenuItemTree[]>>('/api/menus');
        return response.data;
    },

    async getRootMenus(): Promise<MenuItem[]> {
        const response = await fetchAPI<APIResponse<MenuItem[]>>('/api/menus/root');
        return response.data;
    },

    async getMenus(page: number = 1, pageSize: number = 10): Promise<APIResponse<MenuItem[]>> {
        return fetchAPI<APIResponse<MenuItem[]>>(`/api/getmenus?page=${page}&pageSize=${pageSize}`);
    },

    async createMenu(menu: Omit<MenuItem, 'id'>): Promise<MenuItem> {
        const response = await fetchAPI<APIResponse<MenuItem>>('/api/menus', {
            method: 'POST',
            body: JSON.stringify(menu),
        }, true); // 需要认证
        return response.data;
    },

    async updateMenu(id: string, menu: Partial<MenuItem>): Promise<MenuItem> {
        const response = await fetchAPI<APIResponse<MenuItem>>(`/api/menus/${id}`, {
            method: 'PUT',
            body: JSON.stringify(menu),
        }, true); // 需要认证
        return response.data;
    },

    async deleteMenu(id: string): Promise<void> {
        await fetchAPI(`/api/menus/${id}`, {
            method: 'DELETE',
        }, true); // 需要认证
    },

    // 网站管理
    async getWebsites(params?: string): Promise<APIResponse<Website[]>> {
        return fetchAPI(`/api/websites${params ? `?${params}` : ''}`);
    },

    async getWebsitesByMenuId(menuId: string): Promise<APIResponse<Website[]>> {
        return this.getWebsites(`menuId=${menuId}`);
    },

    async createWebsite(website: Omit<Website, 'id'>): Promise<Website> {
        return fetchAPI('/api/websites', {
            method: 'POST',
            body: JSON.stringify(website),
        }, true); // 需要认证
    },

    async updateWebsite(website: Partial<Website>): Promise<Website> {
        return fetchAPI(`/api/websites/${website.id}`, {
            method: 'PUT',
            body: JSON.stringify(website),
        }, true); // 需要认证
    },

    async deleteWebsite(id: string): Promise<void> {
        return fetchAPI(`/api/websites/${id}`, {
            method: 'DELETE',
        }, true); // 需要认证
    },

    // 标签管理
    async getTags(): Promise<APIResponse<Tag[]>> {
        return fetchAPI('/api/tags');
    },

    async createTag(tag: Omit<Tag, 'id'>): Promise<Tag> {
        return fetchAPI('/api/tags', {
            method: 'POST',
            body: JSON.stringify(tag),
        }, true); // 需要认证
    },

    async updateTag(id: string, tag: Partial<Tag>): Promise<Tag> {
        return fetchAPI(`/api/tags/${id}`, {
            method: 'PUT',
            body: JSON.stringify(tag),
        }, true); // 需要认证
    },

    async deleteTag(id: string): Promise<void> {
        return fetchAPI(`/api/tags/${id}`, {
            method: 'DELETE',
        }, true); // 需要认证
    },

    // 系统设置
    async getSystemSettings(): Promise<SystemSettings> {
        return fetchAPI('/api/settings');
    },

    async updateSystemSettings(settings: SystemSettings): Promise<SystemSettings> {
        return fetchAPI('/api/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        }, true); // 需要认证
    },

    // 用户管理
    async getUsers(): Promise<any> {
        return fetchAPI('/api/users', {}, true);
    },

    async createUser(user: { username: string; password: string }): Promise<any> {
        return fetchAPI('/api/users', {
            method: 'POST',
            body: JSON.stringify(user),
        }, true);
    },

    async updateUser(id: string, user: { username?: string; password?: string }): Promise<any> {
        return fetchAPI(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(user),
        }, true);
    },

    async deleteUser(id: string): Promise<void> {
        return fetchAPI(`/api/users/${id}`, {
            method: 'DELETE',
        }, true);
    },
};

export default api;
