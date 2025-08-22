import { integer, sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at').default(sql`datetime('now')`),
  updatedAt: text('updated_at').default(sql`datetime('now')`),
});

export const menus = sqliteTable('menus', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
  url: text('url'),
  parentId: text('parent_id').notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: text('created_at').default(sql`datetime('now')`),
  updatedAt: text('updated_at').default(sql`datetime('now')`),
});

export const websites = sqliteTable('websites', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull().unique(),
  icon: text('icon'),
  description: text('description'),
  alive: integer('alive', { mode: 'boolean' }).default(true),
  menuId: text('menu_id').references(() => menus.id, { onDelete: 'set null' }),
  sortOrder: integer('sort_order').default(0),
  createdAt: text('created_at').default(sql`datetime('now')`),
  updatedAt: text('updated_at').default(sql`datetime('now')`),
});

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color'),
  createdAt: text('created_at').default(sql`datetime('now')`),
  updatedAt: text('updated_at').default(sql`datetime('now')`),
});

export const websiteTags = sqliteTable('website_tags', {
  websiteId: text('website_id')
    .notNull()
    .references(() => websites.id, { onDelete: 'cascade' }),
  tagId: text('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').default(sql`datetime('now')`),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.websiteId, table.tagId] }),
  };
});

export const systemSettings = sqliteTable('system_settings', {
  id: text('id').primaryKey(),
  theme: text('theme', { enum: ['light', 'dark', 'system'] }).default('system'),
  language: text('language', { enum: ['zh', 'en'] }).default('zh'),
  sidebarWidth: integer('sidebar_width').default(240),
  showTagColors: integer('show_tag_colors', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`datetime('now')`),
  updatedAt: text('updated_at').default(sql`datetime('now')`),
});
