import { drizzle } from 'drizzle-orm/d1';
import { menus, websites, tags, websiteTags, systemSettings, users } from './schema';

export function createDb(d1: D1Database) {
  return drizzle(d1);
}

export type Menu = typeof menus.$inferSelect;
export type Website = typeof websites.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type WebsiteTag = typeof websiteTags.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type User = typeof users.$inferSelect;

export type MenuWithWebsites = Menu & {
  websites: Website[];
  children: MenuWithWebsites[];
};

export type WebsiteWithTags = Website & {
  tags: Tag[];
};
export { menus, websites, tags, websiteTags, systemSettings, users };
