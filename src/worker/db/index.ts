import { drizzle } from 'drizzle-orm/d1';
import {
    menus,
    websites,
    tags,
    websiteTags,
    systemSettings,
    users,
    menusRelations,
    websitesRelations,
    tagsRelations, websiteTagsRelations
} from './schema';

export const schema = {
    users,
    menus,
    menusRelations,
    websites,
    websitesRelations,
    tags,
    tagsRelations,
    websiteTags,
    websiteTagsRelations,
    systemSettings,
};

export function createDb(d1: D1Database) {
    return drizzle(d1, { schema });
}