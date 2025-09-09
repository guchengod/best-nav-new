import {Context, Hono} from "hono";
import {cors} from 'hono/cors';
import * as jose from 'jose';
import {and, asc, count, desc, eq, like, or, sql} from 'drizzle-orm';
import {createDb, menus, systemSettings, tags, users, websites, websiteTags} from './db';
import {Menu, SystemSettings, Tag, Website} from './type.ts';

// This ensures c.env.DB is correctly typed
type Bindings = {
    DB: D1Database;
    BUCKET: R2Bucket;
    JWT_SECRET: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
};

type Variables = {
    user: any;
};

const app = new Hono<{ Bindings: Bindings }>();

async function md5(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

//
// // Accessing D1 is via the c.env.YOUR_BINDING property
// app.get("/query/users/:id", async (c) => {
//
//     const userId = c.req.param("id");
//     try {
//         const { results } = await c.env.DB.prepare(
//             "SELECT * FROM users WHERE user_id = ?",
//         )
//             .bind(userId)
//             .run<OrderRow>();
//         return c.json(results);
//     } catch (e) {
//         // Type guard to safely handle the unknown error type
//         if (e instanceof Error) {
//             // Log the detailed error for your own records
//             console.error("DB Error:", e.message);
//         } else {
//             // Log the value if it's not a standard Error object
//             console.error("DB Error:", e);
//         }
//
//         // Return a generic error message to the client
//         return c.json({ err: "An internal server error occurred" }, 500);
//     }
// });
//
//
//
//
//
// app.get("/api/", (c) => c.json({ name: "Cloudflare" }));
//




// CORS middleware
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    maxAge: 86400,
}));

// URL Check middleware
const urlCheckMiddleware = async (c: Context<{ Bindings: Bindings }>, next: () => Promise<void>) => {
    const currentTime = Date.now();
    const lastCheckKey = 'last_url_check';

    const globalThis = self as any;
    const lastCheck = globalThis[lastCheckKey] || 0;

    if (currentTime - lastCheck >= 1800000) {
        globalThis[lastCheckKey] = currentTime;
        c.executionCtx.waitUntil(checkUrls(c.env.DB));
    }

    await next();
};

app.use('*', urlCheckMiddleware);

// Auth middleware
async function authMiddleware(c: Context<{ Bindings: Bindings; Variables: Variables; }>, next: () => Promise<void>) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.split(' ')[1];
    try {
        const secret = new TextEncoder().encode(c.env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        c.set("user", payload);
        await next();
    } catch (error) {
        console.error('JWT verification error:', error);
        return c.json({ error: 'Invalid token' }, 401);
    }
}

// Menu routes
app.get('/api/menus', async (c) => {
    const db = createDb(c.env.DB);
    const allMenus = await db.select().from(menus);
    const menuTree = buildMenuTree(allMenus);
    return c.json({ data: menuTree });
});

app.get('/api/getmenus', async (c) => {
    const db = createDb(c.env.DB);
    const page = parseInt(c.req.query('page') || '1');
    const pageSize = parseInt(c.req.query('pageSize') || '10');
    const sortBy = c.req.query('sortBy') || 'createdAt';
    const sortOrder = c.req.query('sortOrder') || 'desc';
    const search = c.req.query('search') || '';

    try {
        const offset = (page - 1) * pageSize;

        // 构建 WHERE 条件
        const whereConditions = [];
        if (search) {
            whereConditions.push(
                or(
                    like(menus.name, `%${search}%`),
                    like(menus.url, `%${search}%`)
                )
            );
        }

        // 获取总数
        const countResult = await db.select({ count: count() })
            .from(menus)
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
        const total = countResult[0].count;

        // 构建排序
        const sortableColumns = {
            name: menus.name,
            createdAt: menus.createdAt,
            updatedAt: menus.updatedAt,
            sortOrder: menus.sortOrder
        };
        const sortColumn = sortableColumns[sortBy as keyof typeof sortableColumns] || menus.createdAt;

        // 执行查询
        const results = await db.select()
            .from(menus)
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
            .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
            .limit(pageSize)
            .offset(offset);

        return c.json({
            data: results,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
                hasMore: offset + results.length < total
            }
        });
    } catch (error) {
        console.error('Failed to fetch menus:', error);
        return c.json({ error: 'Failed to fetch menus' }, 500);
    }
});

app.get('/api/menus/root', async (c) => {
    const db = createDb(c.env.DB);
    try {
        const rootMenus = await db
            .select()
            .from(menus)
            // .where(eq(menus.parentId,"0"))
            .orderBy(menus.sortOrder);

        return c.json({ data: rootMenus });
    } catch (error) {
        console.error('Failed to fetch root menus:', error);
        return c.json({ error: 'Failed to fetch root menus' }, 500);
    }
});

app.post('/api/menus', authMiddleware, async (c) => {
    // 使用更精确的类型
    const body = await c.req.json<{
        name: string;
        icon?: string;
        url?: string;
        parentId: string;
        sortOrder?: number;
    }>();

    const db = createDb(c.env.DB);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // 确保所有必需字段都有值
    const insertData = {
        id,
        name: body.name,
        icon: body.icon || null, // 处理可选字段
        url: body.url || null,
        parentId: body.parentId,
        sortOrder: body.sortOrder || 0,
        createdAt: now,
        updatedAt: now,
    };
    try{
        const result = await db.insert(menus).values(insertData);
        return c.json({
            data: { id },
            result
        });
    }catch (error){
        console.error('Failed add menus:', error);
        return c.json({ err: error }, 500);
    }


});

app.put('/api/menus/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<Menu>>();
    const db = createDb(c.env.DB);

    const result = await db
        .update(menus)
        .set({
            ...body,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(menus.id, id));

    return c.json({ data: { id },result: result });
});

app.delete('/api/menus/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    const db = createDb(c.env.DB);

    await db.delete(menus).where(eq(menus.id, id));
    return c.json({ data: { success: true } });
});

app.get('/api/websites', async (c) => {
    const db = createDb(c.env.DB);
    const menuId = c.req.query('menuId');
    const search = c.req.query('search');
    const page = parseInt(c.req.query('page') || '1');
    const pageSize = parseInt(c.req.query('pageSize') || '20');
    const offset = (page - 1) * pageSize;

    try {
        // 构建 where 条件
        const whereConditions = [];
        if (menuId) {
            whereConditions.push(eq(websites.menuId, menuId));
        }
        if (search) {
            whereConditions.push(
                or(
                    like(websites.name, `%${search}%`),
                    like(websites.description, `%${search}%`)
                )
            );
        }

        // 获取总数
        const countResult = await db
            .select({ count: count() })
            .from(websites)
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
        const total = countResult[0]?.count || 0;

        // 获取分页数据（包含标签）
        const results = await db
            .select({
                websites,
                tags: tags
            })
            .from(websites)
            .leftJoin(websiteTags, eq(websites.id, websiteTags.websiteId))
            .leftJoin(tags, eq(websiteTags.tagId, tags.id))
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
            .orderBy(desc(websites.sortOrder))
            .limit(pageSize)
            .offset(offset);

        // 处理结果，将标签合并到网站数据中
        const websiteMap = new Map();
        results.forEach((row) => {
            if (!websiteMap.has(row.websites.id)) {
                websiteMap.set(row.websites.id, {
                    ...row.websites,
                    tags: []
                });
            }
            if (row.tags) {
                websiteMap.get(row.websites.id).tags.push(row.tags);
            }
        });

        return c.json({
            data: Array.from(websiteMap.values()),
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        console.error('Failed to fetch websites:', error);
        return c.json({ error: 'Failed to fetch websites' }, 500);
    }
});

app.get('/api/websites/:menuId', async (c) => {
    const menuId = c.req.param('menuId');
    const db = createDb(c.env.DB);

    const websiteList = await db
        .select()
        .from(websites)
        .where(eq(websites.menuId, menuId))
        .orderBy(desc(websites.sortOrder));

    return c.json({ data: websiteList });
});

// app.post('/api/websites', authMiddleware, async (c) => {
//     const body = await c.req.json<Omit<Website, 'id' | 'createdAt' | 'updatedAt'>>();
//     const db = createDb(c.env.DB);
//     const id = crypto.randomUUID();
//
//     const { tags: websiteTags, ...websiteData } = body;
//
//     await db.transaction(async (tx) => {
//         // Create website
//         await tx.insert(websites).values({
//             id,
//             ...websiteData,
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString(),
//         });
//
//         // Add tags
//         if (websiteTags?.length) {
//             await tx.insert(websiteTags).values(
//                 websiteTags.map(tag => ({
//                     websiteId: id,
//                     tagId: tag.id,
//                     createdAt: new Date().toISOString(),
//                 }))
//             );
//         }
//     });
//
//     return c.json({ data: { id } }, 201);
// });

app.post('/api/websites', authMiddleware, async (c) => {
    const body = await c.req.json<{
        name: string;
        url: string;
        icon?: string;
        description?: string;
        alive: boolean;
        menuId?: string;
        sortOrder: number;
        tags?: { id?: string; name: string }[]; // 包含 tag 信息的对象
    }>();

    const db = createDb(c.env.DB);
    const websiteId = crypto.randomUUID();

    const { tags: tagData, ...websiteData } = body;

    await db.transaction(async (tx) => {
        // Create website
        await tx.insert(websites).values({
            id: websiteId,
            ...websiteData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Process tags
        if (tagData?.length) {
            for (const tag of tagData) {
                let tagId = tag.id;

                // 如果 tag 没有 ID，创建新 tag
                if (!tagId) {
                    tagId = crypto.randomUUID();
                    await tx.insert(tags).values({
                        id: tagId,
                        name: tag.name,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    });
                }

                // 创建关联
                await tx.insert(websiteTags).values({
                    // id: crypto.randomUUID(),
                    websiteId: websiteId,
                    tagId: tagId,
                    createdAt: new Date().toISOString(),
                });
            }
        }
    });

    return c.json({ data: { id: websiteId } }, 201);
});

app.put('/api/websites/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<Website>>();
    const db = createDb(c.env.DB);

    const { tags: newTags, ...websiteData } = body;

    await db.transaction(async (tx) => {
        // Update website
        await tx
            .update(websites)
            .set({
                ...websiteData,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(websites.id, id));

        // Update tags if provided
        if (newTags) {
            // Remove old tags
            await tx.delete(websiteTags).where(eq(websiteTags.websiteId, id));

            // Add new tags
            if (newTags.length) {
                await tx.insert(websiteTags).values(
                    newTags.map(tag => ({
                        websiteId: id,
                        tagId: tag.id,
                        createdAt: new Date().toISOString(),
                    }))
                );
            }
        }
    });

    return c.json({ data: { id } });
});

app.delete('/api/websites/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    const db = createDb(c.env.DB);

    await db.delete(websites).where(eq(websites.id, id));
    return c.json({ data: { success: true } });
});

// Tag routes
app.get('/api/tags', async (c) => {
    const db = createDb(c.env.DB);
    const results = await db.select().from(tags);
    return c.json({ data: results });
});

app.post('/api/tags', authMiddleware, async (c) => {
    const body = await c.req.json<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>();
    const db = createDb(c.env.DB);
    const id = crypto.randomUUID();

    const result = await db.insert(tags).values({
        id,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    return c.json({ data: { id } ,result: result}, 201);
});

app.put('/api/tags/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<Tag>>();
    const db = createDb(c.env.DB);

    const result = await db
        .update(tags)
        .set({
            ...body,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(tags.id, id));

    return c.json({ data: { id } ,result: result});
});

app.delete('/api/tags/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    const db = createDb(c.env.DB);

    await db.delete(tags).where(eq(tags.id, id));
    return c.json({ data: { success: true } });
});

// System settings routes
app.get('/api/settings', async (c) => {
    const db = createDb(c.env.DB);
    const settings = await db.select().from(systemSettings).limit(1);
    return c.json({ data: settings[0] });
});

app.put('/api/settings', authMiddleware, async (c) => {
    const body = await c.req.json<Omit<SystemSettings, 'id' | 'createdAt' | 'updatedAt'>>();
    const db = createDb(c.env.DB);
    const id = 'default';

    const result = await db
        .insert(systemSettings)
        .values({
            id,
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
            target: systemSettings.id,
            set: {
                ...body,
                updatedAt: new Date().toISOString(),
            },
        });

    return c.json({ data: { id } ,result: result});
});

// User routes
app.get('/api/users', authMiddleware, async (c) => {
    const db = createDb(c.env.DB);
    try {
        const allUsers = await db
            .select({
                id: users.id,
                username: users.username,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .orderBy(desc(users.createdAt));

        return c.json({ data: allUsers });
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return c.json({ error: 'Failed to fetch users' }, 500);
    }
});

app.post('/api/users', authMiddleware, async (c) => {
    const { username, password } = await c.req.json();
    const db = createDb(c.env.DB);
    const id = crypto.randomUUID();

    try {
        // 检查用户名是否已存在
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .get();

        if (existingUser) {
            return c.json({ error: 'Username already exists' }, 400);
        }

        const hashedPassword = await md5(password);
        await db.insert(users).values({
            id,
            username,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return c.json({ data: { id } }, 201);
    } catch (error) {
        console.error('Failed to create user:', error);
        return c.json({ error: 'Failed to create user' }, 500);
    }
});

app.put('/api/users/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    const { username, password } = await c.req.json();
    const db = createDb(c.env.DB);

    try {
        // 如果更新用户名，检查新用户名是否已存在
        if (username) {
            const existingUser = await db
                .select()
                .from(users)
                .where(and(
                    eq(users.username, username),
                    sql`${users.id} != ${id}`
                ))
                .get();

            if (existingUser) {
                return c.json({ error: 'Username already exists' }, 400);
            }
        }

        const updateData = {
            updatedAt: new Date().toISOString(),
            username: username ? username : undefined,
            password: password ? await md5(password) : undefined
        };

        if (username) {
            updateData.username = username;
        }

        if (password) {
            const hashedPassword = await md5(password);
            updateData.password = hashedPassword;
        }

        await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id));

        return c.json({ data: { id } });
    } catch (error) {
        console.error('Failed to update user:', error);
        return c.json({ error: 'Failed to update user' }, 500);
    }
});

app.delete('/api/users/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    const db = createDb(c.env.DB);

    try {
        // 检查是否是最后一个管理员
        const allUsers = await db.select().from(users);
        if (allUsers.length === 1) {
            return c.json({ error: 'Cannot delete the last administrator' }, 400);
        }

        await db.delete(users).where(eq(users.id, id));
        return c.json({ data: { success: true } });
    } catch (error) {
        console.error('Failed to delete user:', error);
        return c.json({ error: 'Failed to delete user' }, 500);
    }
});

// Login route
app.post('/api/login', async (c) => {
    const { username, password } = await c.req.json();
    const db = createDb(c.env.DB);

    try {
        const user = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .get();
        console.log('name', user);
        if (!user) {
            return c.json({ error: 'Invalid username or password' }, 401);
        }

        const hashedPassword = await md5(password);
        console.log('hashedPassword', hashedPassword);
        if (hashedPassword !== user.password) {
            return c.json({ error: 'Invalid username or password' }, 401);
        }

        const secret = new TextEncoder().encode(c.env.JWT_SECRET);
        const token = await new jose.SignJWT({ sub: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secret);

        return c.json({ data: { token } });
    } catch (error) {
        console.error('Login error:', error);
        return c.json({ error: 'Login failed' }, 500);
    }
});

// GitHub OAuth callback route
app.get('/auth/github/callback', async (c) => {
    try {
        const code = c.req.query('code');

        // Exchange code for access token
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: c.env.GITHUB_CLIENT_ID,
                client_secret: c.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData:{access_token: string} = await tokenRes.json();

        // Get user data from GitHub
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const userData: { id: string, login: string, name: string, avatar_url: string } = await userRes.json();

        // Create JWT
        const secret = new TextEncoder().encode(c.env.JWT_SECRET);
        const token = await new jose.SignJWT({
            userId: userData.id,
            login: userData.login,
            name: userData.name,
            avatar: userData.avatar_url,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(secret);

        // Redirect to frontend with token
        return c.redirect(`https://sungaowei.com/auth/callback?token=${token}`);
    } catch (error) {
        console.error('Authentication error:', error);
        return c.json({ error: 'Authentication failed' }, 500);
    }
});

// Helper functions
function buildMenuTree(menuList: Menu[]): Menu[] {
    const menuMap = new Map<string, Menu>();
    const rootMenus: Menu[] = [];

    // First pass: Create menu map
    menuList.forEach(menu => {
        menuMap.set(menu.id, { ...menu, children: [] });
    });

    // Second pass: Build tree structure
    menuList.forEach(menu => {
        const menuWithChildren = menuMap.get(menu.id)!;
        if (menu.parentId) {
            const parent = menuMap.get(menu.parentId);
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(menuWithChildren);
            }
        } else {
            rootMenus.push(menuWithChildren);
        }

    });

    return rootMenus;
}

// Protected routes
app.post('/api/sites', authMiddleware, async (c) => {
    // const db = createDb(c.env.DB);
    // const data = await c.req.json();
    //
    // try {
    //     const result = await db.insert(sites).values({
    //         categoryId: data.category_id,
    //         name: data.name,
    //         url: data.url,
    //         icon: data.icon,
    //         description: data.description,
    //         tags: data.tags,
    //         categories: data.categories,
    //         alive: true,
    //     }).returning();
    //
    //     return c.json({ site: result[0] });
    // } catch (error) {
    //     console.log('Error adding site:', error);
    //     return c.json({ error: 'Failed to add site' }, 500);
    // }
    console.log('Not implemented'+c);
});

// Function to check URLs
async function checkUrls(d1: D1Database) {
    const db = createDb(d1);
    const allWebsites = await db.select().from(websites);

    for (const website of allWebsites) {
        try {
            const response = await fetch(website.url, { method: 'HEAD' });
            const alive = response.ok;

            if (alive !== website.alive) {
                await db
                    .update(websites)
                    .set({ alive, updatedAt: new Date().toISOString() })
                    .where(eq(websites.id, website.id));
            }
        } catch (error) {
            console.error(`Error checking ${website.url}:`, error);
            if (website.alive) {
                await db
                    .update(websites)
                    .set({ alive: false, updatedAt: new Date().toISOString() })
                    .where(eq(websites.id, website.id));
            }
        }
    }
}

export default app;
