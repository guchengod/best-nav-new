// import {Context, Hono} from "hono";
// import {cors} from 'hono/cors';
// import * as jose from 'jose';
// import {and, asc, count, desc, eq, inArray, like, or, sql} from 'drizzle-orm';
// import {createDb,} from './db';
// import {Menu, SystemSettings, Tag, Website} from './type.ts';
// import { menus, systemSettings, tags, users, websites, websiteTags } from "./db/schema.ts";
//
// // This ensures c.env.DB is correctly typed
// type Bindings = {
//     DB: D1Database;
//     BUCKET: R2Bucket;
//     JWT_SECRET: string;
//     GITHUB_CLIENT_ID: string;
//     GITHUB_CLIENT_SECRET: string;
// };
//
// type Variables = {
//     user: any;
// };
//
// const app = new Hono<{ Bindings: Bindings }>();
//
// async function md5(message: string): Promise<string> {
//     const msgBuffer = new TextEncoder().encode(message);
//     const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
//     const hashArray = Array.from(new Uint8Array(hashBuffer));
//     return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
// }
//
// // CORS middleware
// app.use('*', cors({
//     origin: '*',
//     allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     maxAge: 86400,
// }));
//
// // URL Check middleware
// const urlCheckMiddleware = async (c: Context<{ Bindings: Bindings }>, next: () => Promise<void>) => {
//     const currentTime = Date.now();
//     const lastCheckKey = 'last_url_check';
//
//     const globalThis = self as any;
//     const lastCheck = globalThis[lastCheckKey] || 0;
//
//     if (currentTime - lastCheck >= 1800000) {
//         globalThis[lastCheckKey] = currentTime;
//         c.executionCtx.waitUntil(checkUrls(c.env.DB));
//     }
//
//     await next();
// };
//
// app.use('*', urlCheckMiddleware);
//
// // Auth middleware
// async function authMiddleware(c: Context<{ Bindings: Bindings; Variables: Variables; }>, next: () => Promise<void>) {
//     const authHeader = c.req.header('Authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return c.json({ error: 'Unauthorized' }, 401);
//     }
//
//     const token = authHeader.split(' ')[1];
//     try {
//         const secret = new TextEncoder().encode(c.env.JWT_SECRET);
//         const { payload } = await jose.jwtVerify(token, secret);
//         c.set("user", payload);
//         await next();
//     } catch (error) {
//         console.error('JWT verification error:', error);
//         return c.json({ error: 'Invalid token' }, 401);
//     }
// }
//
// // --- R2 Storage & Icon Routes ---
//
// // Upload file to R2
// app.post('/api/upload', authMiddleware, async (c) => {
//     try {
//         const body = await c.req.parseBody();
//         const file = body['file'];
//
//         if (file instanceof File) {
//             const extension = file.name.split('.').pop() || 'png';
//             const key = `uploads/${crypto.randomUUID()}.${extension}`;
//
//             await c.env.BUCKET.put(key, file);
//
//             // Return the path to our proxy route
//             const url = `/api/rfile/${key}`;
//             return c.json({ url });
//         }
//         return c.json({ error: 'No file uploaded' }, 400);
//     } catch (error) {
//         console.error('Upload error:', error);
//         return c.json({ error: 'Upload failed' }, 500);
//     }
// });
//
// // Serve files from R2
// app.get('/api/rfile/:key{.*}', async (c) => {
//     const key = c.req.param('key');
//
//     try {
//         const object = await c.env.BUCKET.get(key);
//
//         if (!object) {
//             return c.notFound();
//         }
//
//         const headers = new Headers();
//         object.writeHttpMetadata(headers);
//         headers.set('etag', object.httpEtag);
//
//         return new Response(object.body, {
//             headers,
//         });
//     } catch (error) {
//         console.error('R2 fetch error:', error);
//         return c.notFound();
//     }
// });
//
// // Fetch icon from URL and save to R2
// app.post('/api/fetch-icon', authMiddleware, async (c) => {
//     try {
//         const { url } = await c.req.json();
//         if (!url) return c.json({ error: 'URL is required' }, 400);
//
//         let domain = '';
//         try {
//             const urlObj = new URL(url);
//             domain = urlObj.hostname;
//         } catch (e) {
//             return c.json({ error: 'Invalid URL' }, 400);
//         }
//
//         // Use Google's favicon service as it's reliable and handles many edge cases
//         const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
//
//         const response = await fetch(iconUrl);
//         if (!response.ok) throw new Error('Failed to fetch icon from external service');
//
//         const blob = await response.blob();
//         const key = `icons/${domain}-${crypto.randomUUID()}.png`;
//
//         await c.env.BUCKET.put(key, blob);
//
//         return c.json({ url: `/api/rfile/${key}` });
//     } catch (error) {
//         console.error('Fetch icon error:', error);
//         return c.json({ error: 'Failed to fetch icon' }, 500);
//     }
// });
//
// // --- Existing Routes ---
//
// // Menu routes
// app.get('/api/menus', async (c) => {
//     const db = createDb(c.env.DB);
//     const allMenus = await db.select().from(menus);
//     // @ts-ignore
//     const menuTree = buildMenuTree(allMenus);
//     return c.json({ data: menuTree });
// });
//
// app.get('/api/getmenus', async (c) => {
//     const db = createDb(c.env.DB);
//     const page = parseInt(c.req.query('page') || '1');
//     const pageSize = parseInt(c.req.query('pageSize') || '10');
//     const sortBy = c.req.query('sortBy') || 'createdAt';
//     const sortOrder = c.req.query('sortOrder') || 'desc';
//     const search = c.req.query('search') || '';
//
//     try {
//         const offset = (page - 1) * pageSize;
//
//         // 构建 WHERE 条件
//         const whereConditions = [];
//         if (search) {
//             whereConditions.push(
//                 or(
//                     like(menus.name, `%${search}%`),
//                     like(menus.url, `%${search}%`)
//                 )
//             );
//         }
//
//         // 获取总数
//         const countResult = await db.select({ count: count() })
//             .from(menus)
//             .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
//         const total = countResult[0].count;
//
//         // 构建排序
//         const sortableColumns = {
//             name: menus.name,
//             createdAt: menus.createdAt,
//             updatedAt: menus.updatedAt,
//             sortOrder: menus.sortOrder
//         };
//         const sortColumn = sortableColumns[sortBy as keyof typeof sortableColumns] || menus.createdAt;
//
//         // 执行查询
//         const results = await db.select()
//             .from(menus)
//             .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
//             .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
//             .limit(pageSize)
//             .offset(offset);
//
//         // 2. 收集所有唯一的parentId（排除空值）
//         const parentIds = [...new Set(results.map(item => item.parentId).filter((id): id is string => !!id))];
//
//         // 3. 查询所有父菜单的id和name
//         const parentMenus = parentIds.length > 0
//             ? await db.select({ id: menus.id, name: menus.name })
//                 .from(menus)
//                 .where(inArray(menus.id, parentIds))
//             : [];
//
//         // 4. 创建父菜单映射表（id -> name）
//         const parentMap = Object.fromEntries(
//             parentMenus.map(menu => [menu.id, menu.name])
//         );
//
//         // 5. 为每个结果添加parentName
//         const resultsWithParentName = results.map(item => ({
//             ...item,
//             parentName: item.parentId ? (parentMap[item.parentId] || null) : null
//         }));
//
//         return c.json({
//             data: resultsWithParentName,
//             pagination: {
//                 total,
//                 page,
//                 pageSize,
//                 totalPages: Math.ceil(total / pageSize),
//                 hasMore: offset + results.length < total
//             }
//         });
//     } catch (error) {
//         console.error('Failed to fetch menus:', error);
//         return c.json({ error: 'Failed to fetch menus' }, 500);
//     }
// });
//
// app.get('/api/menus/root', async (c) => {
//     const db = createDb(c.env.DB);
//     try {
//         const rootMenus = await db
//             .select()
//             .from(menus)
//             .orderBy(menus.sortOrder);
//
//         return c.json({ data: rootMenus });
//     } catch (error) {
//         console.error('Failed to fetch root menus:', error);
//         return c.json({ error: 'Failed to fetch root menus' }, 500);
//     }
// });
//
// app.post('/api/menus', authMiddleware, async (c) => {
//     const body = await c.req.json<{
//         name: string;
//         icon?: string;
//         url?: string;
//         parentId: string;
//         sortOrder?: number;
//     }>();
//
//     const db = createDb(c.env.DB);
//     const id = crypto.randomUUID();
//     const now = new Date().toISOString();
//
//     const insertData = {
//         id,
//         name: body.name,
//         icon: body.icon || null,
//         url: body.url || null,
//         parentId: body.parentId,
//         sortOrder: body.sortOrder || 0,
//         createdAt: now,
//         updatedAt: now,
//     };
//     try{
//         const result = await db.insert(menus).values(insertData);
//         return c.json({
//             data: { id },
//             result
//         });
//     }catch (error){
//         console.error('Failed add menus:', error);
//         return c.json({ err: error }, 500);
//     }
// });
//
// app.put('/api/menus/:id', authMiddleware, async (c) => {
//     const id = c.req.param('id');
//     const body = await c.req.json<Partial<Menu>>();
//     const db = createDb(c.env.DB);
//
//     const result = await db
//         .update(menus)
//         .set({
//             ...body,
//             updatedAt: new Date().toISOString(),
//         })
//         .where(eq(menus.id, id));
//
//     return c.json({ data: { id },result: result });
// });
//
// app.delete('/api/menus/:id', authMiddleware, async (c) => {
//     const id = c.req.param('id');
//     const db = createDb(c.env.DB);
//     const [deleteMenu] = await db.select().from(menus).where(eq(menus.id, id)).limit(1);
//
//     if (!deleteMenu.parentId || deleteMenu.parentId === "0") {
//         const children = await db.select().from(menus).where(eq(menus.parentId, id))
//         if (children.length > 0) {
//             return  c.json({ msg: '请先删除该菜单下的子菜单' ,success: true });
//         }
//     }
//     await db.delete(menus).where(eq(menus.id, id));
//     return c.json({ data: { success: true ,msg: '删除成功'} });
// });
//
// app.get('/api/websites', async (c) => {
//     const db = createDb(c.env.DB);
//     const menuId = c.req.query('menuId');
//     const search = c.req.query('search');
//     const page = parseInt(c.req.query('page') || '1');
//     const pageSize = parseInt(c.req.query('pageSize') || '10');
//     const offset = (page - 1) * pageSize;
//
//     try {
//         const conditions = [];
//         if (menuId) {
//             conditions.push(eq(websites.menuId, menuId));
//         }
//         if (search) {
//             conditions.push(
//                 or(
//                     like(websites.name, `%${search}%`),
//                     like(websites.description, `%${search}%`)
//                 )
//             );
//         }
//
//         const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
//
//         const [data, totalResult] = await Promise.all([
//             db.query.websites.findMany({
//                 with: {
//                     menu: {
//                         columns: {
//                             name: true
//                         }
//                     },
//                     tags: {
//                         columns: {},
//                         with: {
//                             tag: {
//                                 columns: {
//                                     name: true,
//                                     color: true,
//                                 }
//                             }
//                         }
//                     }
//                 },
//                 where: whereClause,
//                 orderBy: (websites, { asc }) => [asc(websites.sortOrder)],
//                 limit: pageSize,
//                 offset: offset
//             }),
//             db.select({ count: count() })
//                 .from(websites)
//                 .where(whereClause)
//         ]);
//
//         const total = totalResult[0]?.count || 0;
//         return c.json({
//             data: data,
//             pagination: {
//                 total,
//                 page,
//                 pageSize,
//                 totalPages: Math.ceil(total / pageSize)
//             }
//         });
//     } catch (error) {
//         console.error('Failed to fetch websites:', error);
//         return c.json({ error: 'Failed to fetch websites' }, 500);
//     }
// });
//
// app.get('/api/websites/:menuId', async (c) => {
//     const menuId = c.req.param('menuId');
//     const db = createDb(c.env.DB);
//
//     const websiteList = await db
//         .select()
//         .from(websites)
//         .where(eq(websites.menuId, menuId))
//         .orderBy(desc(websites.sortOrder));
//
//     return c.json({ data: websiteList });
// });
//
// app.post('/api/websites', authMiddleware, async (c) => {
//     const body = await c.req.json<{
//         name: string;
//         url: string;
//         icon?: string;
//         description?: string;
//         alive: boolean;
//         menuId?: string;
//         sortOrder: number;
//         tags?: { id?: string; name: string }[];
//     }>();
//
//     const db = createDb(c.env.DB);
//     const websiteId = crypto.randomUUID();
//
//     const { tags: tagData, ...websiteData } = body;
//
//     await db.transaction(async (tx) => {
//         await tx.insert(websites).values({
//             id: websiteId,
//             ...websiteData,
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString(),
//         });
//
//         if (tagData?.length) {
//             for (const tag of tagData) {
//                 let tagId = tag.id;
//                 if (!tagId) {
//                     tagId = crypto.randomUUID();
//                     await tx.insert(tags).values({
//                         id: tagId,
//                         name: tag.name,
//                         createdAt: new Date().toISOString(),
//                         updatedAt: new Date().toISOString(),
//                     });
//                 }
//                 await tx.insert(websiteTags).values({
//                     websiteId: websiteId,
//                     tagId: tagId,
//                     createdAt: new Date().toISOString(),
//                 });
//             }
//         }
//     });
//
//     return c.json({ data: { id: websiteId } }, 201);
// });
//
// app.put('/api/websites/:id', authMiddleware, async (c) => {
//     const id = c.req.param('id');
//     const body = await c.req.json<Partial<Website>>();
//     const db = createDb(c.env.DB);
//
//     const { tags: newTags, ...websiteData } = body;
//
//     await db.transaction(async (tx) => {
//         await tx
//             .update(websites)
//             .set({
//                 ...websiteData,
//                 updatedAt: new Date().toISOString(),
//             })
//             .where(eq(websites.id, id));
//
//         if (newTags) {
//             await tx.delete(websiteTags).where(eq(websiteTags.websiteId, id));
//             if (newTags.length) {
//                 await tx.insert(websiteTags).values(
//                     newTags.map(tag => ({
//                         websiteId: id,
//                         tagId: tag.id,
//                         createdAt: new Date().toISOString(),
//                     }))
//                 );
//             }
//         }
//     });
//
//     return c.json({ data: { id } });
// });
//
// app.delete('/api/websites/:id', authMiddleware, async (c) => {
//     const id = c.req.param('id');
//     const db = createDb(c.env.DB);
//
//     await db.delete(websites).where(eq(websites.id, id));
//     return c.json({ data: { success: true } });
// });
//
// // Tag routes
// app.get('/api/tags', async (c) => {
//     const db = createDb(c.env.DB);
//     const results = await db.select().from(tags);
//     return c.json({ data: results });
// });
//
// app.post('/api/tags', authMiddleware, async (c) => {
//     const body = await c.req.json<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>();
//     const db = createDb(c.env.DB);
//     const id = crypto.randomUUID();
//
//     const result = await db.insert(tags).values({
//         id,
//         ...body,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//     });
//
//     return c.json({ data: { id } ,result: result}, 201);
// });
//
// app.put('/api/tags/:id', authMiddleware, async (c) => {
//     const id = c.req.param('id');
//     const body = await c.req.json<Partial<Tag>>();
//     const db = createDb(c.env.DB);
//
//     const result = await db
//         .update(tags)
//         .set({
//             ...body,
//             updatedAt: new Date().toISOString(),
//         })
//         .where(eq(tags.id, id));
//
//     return c.json({ data: { id } ,result: result});
// });
//
// app.delete('/api/tags/:id', authMiddleware, async (c) => {
//     const id = c.req.param('id');
//     const db = createDb(c.env.DB);
//
//     await db.delete(tags).where(eq(tags.id, id));
//     return c.json({ data: { success: true } });
// });
//
// // System settings routes
// app.get('/api/settings', async (c) => {
//     const db = createDb(c.env.DB);
//     const settings = await db.select().from(systemSettings).limit(1);
//     return c.json({ data: settings[0] });
// });
//
// app.put('/api/settings', authMiddleware, async (c) => {
//     const body = await c.req.json<Omit<SystemSettings, 'id' | 'createdAt' | 'updatedAt'>>();
//     const db = createDb(c.env.DB);
//     const id = 'default';
//
//     const result = await db
//         .insert(systemSettings)
//         .values({
//             id,
//             ...body,
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString(),
//         })
//         .onConflictDoUpdate({
//             target: systemSettings.id,
//             set: {
//                 ...body,
//                 updatedAt: new Date().toISOString(),
//             },
//         });
//
//     return c.json({ data: { id } ,result: result});
// });
//
// // User routes
// app.get('/api/users', authMiddleware, async (c) => {
//     const db = createDb(c.env.DB);
//     try {
//         const allUsers = await db
//             .select({
//                 id: users.id,
//                 username: users.username,
//                 createdAt: users.createdAt,
//                 updatedAt: users.updatedAt,
//             })
//             .from(users)
//             .orderBy(desc(users.createdAt));
//
//         return c.json({ data: allUsers });
//     } catch (error) {
//         console.error('Failed to fetch users:', error);
//         return c.json({ error: 'Failed to fetch users' }, 500);
//     }
// });
//
// app.post('/api/users', authMiddleware, async (c) => {
//     const { username, password } = await c.req.json();
//     const db = createDb(c.env.DB);
//     const id = crypto.randomUUID();
//
//     try {
//         const existingUser = await db
//             .select()
//             .from(users)
//             .where(eq(users.username, username))
//             .get();
//
//         if (existingUser) {
//             return c.json({ error: 'Username already exists' }, 400);
//         }
//
//         const hashedPassword = await md5(password);
//         await db.insert(users).values({
//             id,
//             username,
//             password: hashedPassword,
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString(),
//         });
//
//         return c.json({ data: { id } }, 201);
//     } catch (error) {
//         console.error('Failed to create user:', error);
//         return c.json({ error: 'Failed to create user' }, 500);
//     }
// });
//
// app.put('/api/users/:id', authMiddleware, async (c) => {
//     const id = c.req.param('id');
//     const { username, password } = await c.req.json();
//     const db = createDb(c.env.DB);
//
//     try {
//         if (username) {
//             const existingUser = await db
//                 .select()
//                 .from(users)
//                 .where(and(
//                     eq(users.username, username),
//                     sql`${users.id} != ${id}`
//                 ))
//                 .get();
//
//             if (existingUser) {
//                 return c.json({ error: 'Username already exists' }, 400);
//             }
//         }
//
//         const updateData = {
//             updatedAt: new Date().toISOString(),
//             username: username ? username : undefined,
//             password: password ? await md5(password) : undefined
//         };
//
//         if (username) updateData.username = username;
//         if (password) {
//             const hashedPassword = await md5(password);
//             updateData.password = hashedPassword;
//         }
//
//         await db
//             .update(users)
//             .set(updateData)
//             .where(eq(users.id, id));
//
//         return c.json({ data: { id } });
//     } catch (error) {
//         console.error('Failed to update user:', error);
//         return c.json({ error: 'Failed to update user' }, 500);
//     }
// });
//
// app.delete('/api/users/:id', authMiddleware, async (c) => {
//     const id = c.req.param('id');
//     const db = createDb(c.env.DB);
//
//     try {
//         const allUsers = await db.select().from(users);
//         if (allUsers.length === 1) {
//             return c.json({ error: 'Cannot delete the last administrator' }, 400);
//         }
//
//         await db.delete(users).where(eq(users.id, id));
//         return c.json({ data: { success: true } });
//     } catch (error) {
//         console.error('Failed to delete user:', error);
//         return c.json({ error: 'Failed to delete user' }, 500);
//     }
// });
//
// // Login route
// app.post('/api/login', async (c) => {
//     const { username, password } = await c.req.json();
//     const db = createDb(c.env.DB);
//
//     try {
//         const user = await db
//             .select()
//             .from(users)
//             .where(eq(users.username, username))
//             .get();
//
//         if (!user) {
//             return c.json({ error: 'Invalid username or password' }, 401);
//         }
//
//         const hashedPassword = await md5(password);
//         if (hashedPassword !== user.password) {
//             return c.json({ error: 'Invalid username or password' }, 401);
//         }
//
//         const secret = new TextEncoder().encode(c.env.JWT_SECRET);
//         const token = await new jose.SignJWT({ sub: user.id })
//             .setProtectedHeader({ alg: 'HS256' })
//             .setIssuedAt()
//             .setExpirationTime('24h')
//             .sign(secret);
//
//         return c.json({ data: { token } });
//     } catch (error) {
//         console.error('Login error:', error);
//         return c.json({ error: 'Login failed' }, 500);
//     }
// });
//
// // GitHub OAuth callback route
// app.get('/auth/github/callback', async (c) => {
//     try {
//         const code = c.req.query('code');
//
//         const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 Accept: 'application/json',
//             },
//             body: JSON.stringify({
//                 client_id: c.env.GITHUB_CLIENT_ID,
//                 client_secret: c.env.GITHUB_CLIENT_SECRET,
//                 code,
//             }),
//         });
//
//         const tokenData:{access_token: string} = await tokenRes.json();
//
//         const userRes = await fetch('https://api.github.com/user', {
//             headers: {
//                 Authorization: `Bearer ${tokenData.access_token}`,
//             },
//         });
//
//         const userData: { id: string, login: string, name: string, avatar_url: string } = await userRes.json();
//
//         const secret = new TextEncoder().encode(c.env.JWT_SECRET);
//         const token = await new jose.SignJWT({
//             userId: userData.id,
//             login: userData.login,
//             name: userData.name,
//             avatar: userData.avatar_url,
//         })
//             .setProtectedHeader({ alg: 'HS256' })
//             .setExpirationTime('24h')
//             .sign(secret);
//
//         return c.redirect(`https://sungaowei.com/auth/callback?token=${token}`);
//     } catch (error) {
//         console.error('Authentication error:', error);
//         return c.json({ error: 'Authentication failed' }, 500);
//     }
// });
//
// function buildMenuTree(menuList: Menu[]): Menu[] {
//     const menuMap = new Map<string, Menu>();
//     const rootMenus: Menu[] = [];
//
//     // First pass: Create menu map with initialized children
//     menuList.forEach(menu => {
//         menuMap.set(menu.id, { ...menu, children: [] });
//     });
//
//     // Second pass: Build tree structure
//     menuList.forEach(menu => {
//         const menuWithChildren = menuMap.get(menu.id)!;
//
//         // Check if it's a root menu (parentId is null, undefined, or "0")
//         if (!menu.parentId || menu.parentId === "0") {
//             rootMenus.push(menuWithChildren);
//         } else {
//             const parent = menuMap.get(menu.parentId);
//             if (parent) {
//                 parent.children = parent.children || [];
//                 parent.children.push(menuWithChildren);
//             }
//         }
//     });
//
//     // Sort the entire tree recursively
//     const sortTree = (menus: Menu[]) => {
//         menus.sort((a, b) => {
//             // Handle null sortOrder by treating them as Infinity
//             const orderA = a.sortOrder ?? Infinity;
//             const orderB = b.sortOrder ?? Infinity;
//             return orderA - orderB;
//         });
//
//         menus.forEach(menu => {
//             if (menu.children && menu.children.length > 0) {
//                 sortTree(menu.children);
//             }
//         });
//     };
//
//     sortTree(rootMenus);
//     return rootMenus;
// }
//
// async function checkUrls(d1: D1Database) {
//     const db = createDb(d1);
//     const allWebsites = await db.select().from(websites);
//
//     for (const website of allWebsites) {
//         try {
//             const response = await fetch(website.url, { method: 'HEAD' });
//             const alive = response.ok;
//
//             if (alive !== website.alive) {
//                 await db
//                     .update(websites)
//                     .set({ alive, updatedAt: new Date().toISOString() })
//                     .where(eq(websites.id, website.id));
//             }
//         } catch (error) {
//             console.error(`Error checking ${website.url}:`, error);
//             if (website.alive) {
//                 await db
//                     .update(websites)
//                     .set({ alive: false, updatedAt: new Date().toISOString() })
//                     .where(eq(websites.id, website.id));
//             }
//         }
//     }
// }
//
// export default app;


import {Context, Hono} from "hono";
import {cors} from 'hono/cors';
import * as jose from 'jose';
import {and, asc, count, desc, eq, inArray, like, or, sql} from 'drizzle-orm';
import {createDb,} from './db';
import {Menu, SystemSettings, Tag, Website} from './type.ts';
import {
    menus,
    systemSettings,
    tags,
    users,
    websites,
    websiteTags,
    galleryCategories,
    galleryImages,
    gallerySettings
} from "./db/schema.ts";

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

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

async function md5(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

const getUserId = (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
    const user = c.get('user');
    // 兼容旧 Token (sub) 和新 Token (userId)
    return user.userId || user.sub;
};

// --- R2 Storage & Icon Routes ---

// Upload file to R2
app.post('/api/upload', authMiddleware, async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];

        if (file instanceof File) {
            const extension = file.name.split('.').pop() || 'png';
            const key = `icons/${crypto.randomUUID()}.${extension}`; // Store in icons folder

            await c.env.BUCKET.put(key, file);

            // Return the path to our proxy route
            const url = `/api/rfile/${key}`;
            return c.json({ url });
        }
        return c.json({ error: 'No file uploaded' }, 400);
    } catch (error) {
        console.error('Upload error:', error);
        return c.json({ error: 'Upload failed' }, 500);
    }
});

// Serve files from R2
app.get('/api/rfile/:key{.*}', async (c) => {
    const key = c.req.param('key');

    try {
        const object = await c.env.BUCKET.get(key);

        if (!object) {
            return c.notFound();
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        return new Response(object.body, {
            headers,
        });
    } catch (error) {
        console.error('R2 fetch error:', error);
        return c.notFound();
    }
});

// Fetch icon from URL and save to R2
app.post('/api/fetch-icon', authMiddleware, async (c) => {
    try {
        const { url } = await c.req.json();
        if (!url) return c.json({ error: 'URL is required' }, 400);

        let domain = '';
        try {
            const urlObj = new URL(url);
            domain = urlObj.hostname;
        } catch (e) {
            return c.json({ error: 'Invalid URL:'+e }, 400);
        }

        // Use Google's favicon service as it's reliable
        const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

        const response = await fetch(iconUrl);
        if (!response.ok) throw new Error('Failed to fetch icon from external service');

        const blob = await response.blob();
        const key = `icons/${domain}-${crypto.randomUUID()}.png`;

        await c.env.BUCKET.put(key, blob);

        return c.json({ url: `/api/rfile/${key}` });
    } catch (error) {
        console.error('Fetch icon error:', error);
        return c.json({ error: 'Failed to fetch icon' }, 500);
    }
});

// --- Existing Routes ---

// Menu routes
app.get('/api/menus', async (c) => {
    const db = createDb(c.env.DB);
    const allMenus = await db.select().from(menus);
    // @ts-ignore
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

        const countResult = await db.select({ count: count() })
            .from(menus)
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
        const total = countResult[0].count;

        const sortableColumns = {
            name: menus.name,
            createdAt: menus.createdAt,
            updatedAt: menus.updatedAt,
            sortOrder: menus.sortOrder
        };
        const sortColumn = sortableColumns[sortBy as keyof typeof sortableColumns] || menus.createdAt;

        const results = await db.select()
            .from(menus)
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
            .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
            .limit(pageSize)
            .offset(offset);

        // 2. 收集所有唯一的parentId（排除空值）
        const parentIds = [...new Set(results.map(item => item.parentId).filter((id): id is string => !!id))];

        // 3. 查询所有父菜单的id和name
        const parentMenus = parentIds.length > 0
            ? await db.select({ id: menus.id, name: menus.name })
                .from(menus)
                .where(inArray(menus.id, parentIds))
            : [];

        const parentMap = Object.fromEntries(
            parentMenus.map(menu => [menu.id, menu.name])
        );

        const resultsWithParentName = results.map(item => ({
            ...item,
            parentName: item.parentId ? (parentMap[item.parentId] || null) : null
        }));

        return c.json({
            data: resultsWithParentName,
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
            .orderBy(menus.sortOrder);

        return c.json({ data: rootMenus });
    } catch (error) {
        console.error('Failed to fetch root menus:', error);
        return c.json({ error: 'Failed to fetch root menus' }, 500);
    }
});

app.post('/api/menus', authMiddleware, async (c) => {
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

    const insertData = {
        id,
        name: body.name,
        icon: body.icon || null,
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
    const [deleteMenu] = await db.select().from(menus).where(eq(menus.id, id)).limit(1);

    if (!deleteMenu.parentId || deleteMenu.parentId === "0") {
        const children = await db.select().from(menus).where(eq(menus.parentId, id))
        if (children.length > 0) {
            return  c.json({ msg: '请先删除该菜单下的子菜单' ,success: true });
        }
    }
    await db.delete(menus).where(eq(menus.id, id));
    return c.json({ data: { success: true ,msg: '删除成功'} });
});

app.get('/api/websites', async (c) => {
    const db = createDb(c.env.DB);
    const menuId = c.req.query('menuId');
    const search = c.req.query('search');
    const page = parseInt(c.req.query('page') || '1');
    const pageSize = parseInt(c.req.query('pageSize') || '10');
    const offset = (page - 1) * pageSize;

    try {
        const conditions = [];
        if (menuId) {
            conditions.push(eq(websites.menuId, menuId));
        }
        if (search) {
            conditions.push(
                or(
                    like(websites.name, `%${search}%`),
                    like(websites.description, `%${search}%`)
                )
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [data, totalResult] = await Promise.all([
            db.query.websites.findMany({
                with: {
                    menu: {
                        columns: {
                            name: true
                        }
                    },
                    tags: {
                        columns: {},
                        with: {
                            tag: {
                                columns: {
                                    id: true,
                                    name: true,
                                    color: true,
                                }
                            }
                        }
                    }
                },
                where: whereClause,
                orderBy: (websites, { asc }) => [asc(websites.sortOrder)],
                limit: pageSize,
                offset: offset
            }),
            db.select({ count: count() })
                .from(websites)
                .where(whereClause)
        ]);

        const total = totalResult[0]?.count || 0;
        return c.json({
            data: data,
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

app.post('/api/websites', authMiddleware, async (c) => {
    const body = await c.req.json<{
        name: string;
        url: string;
        icon?: string;
        description?: string;
        alive: boolean;
        menuId?: string;
        sortOrder: number;
        tags?: { id?: string; name: string }[];
    }>();

    const db = createDb(c.env.DB);
    const websiteId = crypto.randomUUID();

    const { tags: tagData, ...websiteData } = body;

    try {
        // 1. 检查 URL 是否已存在
        const existingWebsite = await db.select().from(websites).where(eq(websites.url, websiteData.url)).get();
        if (existingWebsite) {
            return c.json({ error: '网站链接已存在' }, 400);
        }

        // 注意：移除 db.transaction，改为顺序执行以避免 D1 开发环境 "Failed query: begin" 错误
        // 2. 插入网站数据
        await db.insert(websites).values({
            id: websiteId,
            name: websiteData.name,
            url: websiteData.url,
            icon: websiteData.icon || null,
            description: websiteData.description || null,
            menuId: websiteData.menuId || null,
            alive: true,
            sortOrder: websiteData.sortOrder || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // 3. 处理标签
        if (tagData?.length) {
            for (const tag of tagData) {
                let tagId = tag.id;
                // 如果是新标签（没有 ID），先创建标签
                if (!tagId) {
                    tagId = crypto.randomUUID();
                    // 检查标签名是否已存在
                    const existingTag = await db.select().from(tags).where(eq(tags.name, tag.name)).get();
                    if (existingTag) {
                        tagId = existingTag.id;
                    } else {
                        await db.insert(tags).values({
                            id: tagId,
                            name: tag.name,
                            color: '#000000', // 默认颜色
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        });
                    }
                }

                // 创建关联
                await db.insert(websiteTags).values({
                    websiteId: websiteId,
                    tagId: tagId,
                    createdAt: new Date().toISOString(),
                });
            }
        }

        return c.json({ data: { id: websiteId } }, 201);
    } catch (error: any) {
        console.error('Add website error:', error);
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return c.json({ error: '网站链接已存在' }, 400);
        }
        return c.json({ error: 'Failed to add website: ' + error.message }, 500);
    }
});

//todo 生产环境代码
// app.post('/api/websites', authMiddleware, async (c) => {
//     const body = await c.req.json<{
//         name: string;
//         url: string;
//         icon?: string;
//         description?: string;
//         alive: boolean;
//         menuId?: string;
//         sortOrder: number;
//         tags?: { id?: string; name: string }[];
//     }>();
//
//     const db = createDb(c.env.DB);
//     const websiteId = crypto.randomUUID();
//
//     const { tags: tagData, ...websiteData } = body;
//
//     try {
//         // 1. 检查 URL 是否已存在
//         const existingWebsite = await db.select().from(websites).where(eq(websites.url, websiteData.url)).get();
//         if (existingWebsite) {
//             return c.json({ error: '网站链接已存在' }, 400);
//         }
//
//         await db.transaction(async (tx) => {
//             // 2. 插入网站数据，确保提供默认值
//             await tx.insert(websites).values({
//                 id: websiteId,
//                 name: websiteData.name,
//                 url: websiteData.url,
//                 icon: websiteData.icon || null,
//                 description: websiteData.description || null,
//                 menuId: websiteData.menuId || null,
//                 alive: true, // 默认为 true
//                 sortOrder: websiteData.sortOrder || 0,
//                 createdAt: new Date().toISOString(),
//                 updatedAt: new Date().toISOString(),
//             });
//
//             // 3. 处理标签
//             if (tagData?.length) {
//                 for (const tag of tagData) {
//                     let tagId = tag.id;
//                     // 如果是新标签（没有 ID），先创建标签
//                     if (!tagId) {
//                         tagId = crypto.randomUUID();
//                         // 检查标签名是否已存在
//                         const existingTag = await tx.select().from(tags).where(eq(tags.name, tag.name)).get();
//                         if (existingTag) {
//                             tagId = existingTag.id;
//                         } else {
//                             await tx.insert(tags).values({
//                                 id: tagId,
//                                 name: tag.name,
//                                 color: '#000000', // 默认颜色
//                                 createdAt: new Date().toISOString(),
//                                 updatedAt: new Date().toISOString(),
//                             });
//                         }
//                     }
//
//                     // 创建关联
//                     await tx.insert(websiteTags).values({
//                         websiteId: websiteId,
//                         tagId: tagId,
//                         createdAt: new Date().toISOString(),
//                     });
//                 }
//             }
//         });
//
//         return c.json({ data: { id: websiteId } }, 201);
//     } catch (error: any) {
//         console.error('Add website error:', error);
//         // 如果是唯一约束错误，返回 400
//         if (error.message && error.message.includes('UNIQUE constraint failed')) {
//             return c.json({ error: '网站链接已存在' }, 400);
//         }
//         return c.json({ error: 'Failed to add website: ' + error.message }, 500);
//     }
// });

app.put('/api/websites/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<Website>>();
    const db = createDb(c.env.DB);

    const { tags: newTags, ...websiteData } = body;

    try {
        // 修复: 移除 transaction
        await db.update(websites).set({ ...websiteData, updatedAt: new Date().toISOString() }).where(eq(websites.id, id));

        if (newTags) {
            await db.delete(websiteTags).where(eq(websiteTags.websiteId, id));
            if (newTags.length) {
                for(const tag of newTags) {
                    // @ts-ignore
                    const tagId = tag.id || tag.tag?.id;
                    if(tagId) {
                        await db.insert(websiteTags).values({ websiteId: id, tagId: tagId, createdAt: new Date().toISOString() });
                    }
                }
            }
        }
        return c.json({ data: { id } });
    } catch(error: any) {
        console.error('Update website error:', error);
        return c.json({ error: 'Failed to update website'+error }, 500);
    }
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
    const id = '1';

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

        if (username) updateData.username = username;
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

        if (!user) {
            return c.json({ error: 'Invalid username or password' }, 401);
        }

        const hashedPassword = await md5(password);
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

        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const userData: { id: string, login: string, name: string, avatar_url: string } = await userRes.json();

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

        return c.redirect(`https://sungaowei.com/auth/callback?token=${token}`);
    } catch (error) {
        console.error('Authentication error:', error);
        return c.json({ error: 'Authentication failed' }, 500);
    }
});

function buildMenuTree(menuList: Menu[]): Menu[] {
    const menuMap = new Map<string, Menu>();
    const rootMenus: Menu[] = [];

    menuList.forEach(menu => {
        menuMap.set(menu.id, { ...menu, children: [] });
    });

    menuList.forEach(menu => {
        const menuWithChildren = menuMap.get(menu.id)!;

        if (!menu.parentId || menu.parentId === "0") {
            rootMenus.push(menuWithChildren);
        } else {
            const parent = menuMap.get(menu.parentId);
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(menuWithChildren);
            }
        }
    });

    const sortTree = (menus: Menu[]) => {
        menus.sort((a, b) => {
            const orderA = a.sortOrder ?? Infinity;
            const orderB = b.sortOrder ?? Infinity;
            return orderA - orderB;
        });

        menus.forEach(menu => {
            if (menu.children && menu.children.length > 0) {
                sortTree(menu.children);
            }
        });
    };

    sortTree(rootMenus);
    return rootMenus;
}

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


// Get Gallery Categories (Scoped to User)
app.get('/api/gallery/categories', authMiddleware, async (c) => {
    const db = createDb(c.env.DB);
    const userId = getUserId(c);

    try {
        const result = await db.select()
            .from(galleryCategories)
            .where(eq(galleryCategories.userId, userId))
            .orderBy(asc(galleryCategories.sortOrder));
        return c.json({ data: result });
    } catch (error) {
        return c.json({ error: 'Failed to fetch categories:'+error }, 500);
    }
});

app.post('/api/gallery/categories', authMiddleware, async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);
    const userId = getUserId(c);
    const id = crypto.randomUUID();

    await db.insert(galleryCategories).values({
        id,
        userId: userId,
        name: body.name,
        description: body.description,
        sortOrder: body.sortOrder || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
    return c.json({ data: { id } }, 201);
});

app.put('/api/gallery/categories/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const db = createDb(c.env.DB);
    const userId = getUserId(c);

    await db.update(galleryCategories)
        .set({ ...body, updatedAt: new Date().toISOString() })
        .where(and(eq(galleryCategories.id, id), eq(galleryCategories.userId, userId)));
    return c.json({ data: { id } });
});

app.delete('/api/gallery/categories/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    const db = createDb(c.env.DB);
    const userId = getUserId(c);

    await db.delete(galleryCategories)
        .where(and(eq(galleryCategories.id, id), eq(galleryCategories.userId, userId)));
    return c.json({ data: { success: true } });
});

// Get Gallery Images (Scoped to User)
app.get('/api/gallery/images', authMiddleware, async (c) => {
    const db = createDb(c.env.DB);
    const userId = getUserId(c);
    const categoryId = c.req.query('categoryId');
    const isFavorite = c.req.query('isFavorite');
    const search = c.req.query('search');
    const page = parseInt(c.req.query('page') || '1');
    const pageSize = parseInt(c.req.query('pageSize') || '20');
    const offset = (page - 1) * pageSize;

    const conditions = [eq(galleryImages.userId, userId)]; // 强制用户隔离

    if (categoryId && categoryId !== 'all' && categoryId !== 'favorites') {
        conditions.push(eq(galleryImages.categoryId, categoryId));
    }
    if (categoryId === 'favorites' || isFavorite === 'true') {
        conditions.push(eq(galleryImages.isFavorite, true));
    }
    if (search) {
        conditions.push(or(like(galleryImages.title, `%${search}%`), like(galleryImages.description, `%${search}%`))!);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    try {
        const [data, totalResult] = await Promise.all([
            db.query.galleryImages.findMany({
                with: {
                    category: { columns: { name: true } }
                },
                where: whereClause,
                orderBy: [desc(galleryImages.date), desc(galleryImages.createdAt)],
                limit: pageSize,
                offset: offset
            }),
            db.select({ count: count() }).from(galleryImages).where(whereClause)
        ]);

        const total = totalResult[0]?.count || 0;
        return c.json({
            data,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        console.error(error);
        return c.json({ error: 'Failed to fetch images：'+error }, 500);
    }
});

app.post('/api/gallery/images', authMiddleware, async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);
    const userId = getUserId(c);
    const id = crypto.randomUUID();

    await db.insert(galleryImages).values({
        id,
        userId: userId,
        url: body.url,
        title: body.title || 'Untitled',
        description: body.description,
        categoryId: body.categoryId || null,
        width: body.width,
        height: body.height,
        date: body.date || new Date().toISOString(), // 允许前端传拍摄日期，否则用当前时间
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
    return c.json({ data: { id } }, 201);
});

app.put('/api/gallery/images/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const db = createDb(c.env.DB);
    const userId = getUserId(c);

    await db.update(galleryImages)
        .set({ ...body, updatedAt: new Date().toISOString() })
        .where(and(eq(galleryImages.id, id), eq(galleryImages.userId, userId)));
    return c.json({ data: { id } });
});

app.delete('/api/gallery/images/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    const db = createDb(c.env.DB);
    const userId = getUserId(c);

    // 这里可以增加删除 R2 文件的逻辑，如果需要更严格的清理

    await db.delete(galleryImages)
        .where(and(eq(galleryImages.id, id), eq(galleryImages.userId, userId)));
    return c.json({ data: { success: true } });
});

app.get('/api/gallery/settings', authMiddleware, async (c) => {
    const db = createDb(c.env.DB);
    const userId = getUserId(c);

    try {
        const result = await db.select().from(gallerySettings).where(eq(gallerySettings.userId, userId)).limit(1);
        // 如果没有设置，返回默认空对象或初始值
        const settings = result.length > 0 ? result[0] : { trustedDomains: '' };
        return c.json({ data: settings });
    } catch (error) {
        console.error("Fetch gallery settings error:", error);
        return c.json({ error: 'Failed to fetch gallery settings' }, 500);
    }
});

// Update Gallery Settings (Upsert)
app.put('/api/gallery/settings', authMiddleware, async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);
    const userId = getUserId(c);

    try {
        // 检查是否已存在
        const existing = await db.select().from(gallerySettings).where(eq(gallerySettings.userId, userId)).limit(1);

        if (existing.length > 0) {
            await db.update(gallerySettings)
                .set({
                    trustedDomains: body.trustedDomains,
                    updatedAt: new Date().toISOString()
                })
                .where(eq(gallerySettings.userId, userId));
        } else {
            await db.insert(gallerySettings).values({
                id: crypto.randomUUID(),
                userId: userId,
                trustedDomains: body.trustedDomains,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
        return c.json({ success: true });
    } catch (error) {
        console.error("Update gallery settings error:", error);
        return c.json({ error: 'Failed to update gallery settings' }, 500);
    }
});

// NEW: Dedicated Share Endpoint (With Trusted Domain Check)
app.get('/api/share/img/:key{.*}', async (c) => {
    const key = c.req.param('key');
    const db = createDb(c.env.DB);
    // 构造对应的内部 URL 来查找数据库记录
    const internalUrl = `/api/rfile/${key}`;

    try {
        // 1. 查找图片归属
        const imageRecord = await db.select()
            .from(galleryImages)
            .where(eq(galleryImages.url, internalUrl))
            .get();

        if (imageRecord) {
            // 2. 获取该用户的设置
            const settings = await db.select()
                .from(gallerySettings)
                .where(eq(gallerySettings.userId, imageRecord.userId))
                .get();

            // 3. 检查 Referer
            if (settings && settings.trustedDomains) {
                const referer = c.req.header('Referer');

                // 只有当有 Referer 时才检查（浏览器直接访问/下载通常没有 Referer 或允许）
                // 如果需要禁止直接访问，可以在这里处理
                if (referer) {
                    try {
                        const refererUrl = new URL(referer);
                        const refererDomain = refererUrl.hostname;

                        const allowedDomains = settings.trustedDomains
                            .split(/[\n,]/)
                            .map(d => d.trim())
                            .filter(Boolean);

                        if (allowedDomains.length > 0) {
                            const isAllowed = allowedDomains.some(d =>
                                refererDomain === d || refererDomain.endsWith(`.${d}`)
                            );

                            if (!isAllowed) {
                                return c.text('Access Denied: Domain not trusted', 403);
                            }
                        }
                    } catch (e) {
                        // Referer 格式错误，安全起见可以拦截或忽略
                    }
                }
            }
        }

        // 4. 返回文件
        const object = await c.env.BUCKET.get(key);
        if (!object) return c.notFound();

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000');

        return new Response(object.body, { headers });
    } catch (error) {
        console.error('Share fetch error:', error);
        return c.notFound();
    }
});

export default app;