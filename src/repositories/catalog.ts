import { allCatalog, prompts, resources, skills, tools } from '../data/catalog';
import type { CatalogItem, ToolDefinition } from '../domain/types';

export type CatalogRepository = {
  list(kind?: CatalogItem['kind']): Promise<CatalogItem[]>;
  search(query: string): Promise<CatalogItem[]>;
  findTool(slug: string): Promise<ToolDefinition | undefined>;
};

export const localCatalogRepository: CatalogRepository = {
  async list(kind) {
    if (kind === 'tool') return tools;
    if (kind === 'resource') return resources;
    if (kind === 'skill') return skills;
    if (kind === 'prompt') return prompts;
    return allCatalog;
  },
  async search(query) {
    const needle = query.trim().toLocaleLowerCase('vi-VN');
    if (!needle) return allCatalog;
    return allCatalog.filter(item => [item.title, item.summary, item.category, ...item.tags].join(' ').toLocaleLowerCase('vi-VN').includes(needle));
  },
  async findTool(slug) { return tools.find(item => item.slug === slug); },
};
