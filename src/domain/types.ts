export type ContentKind = 'tool' | 'resource' | 'skill' | 'prompt';
export type Runtime = 'client' | 'external' | 'planned';

export type CatalogItem = {
  id: string;
  slug: string;
  kind: ContentKind;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  icon: IconName;
  runtime?: Runtime;
  availability?: 'ready' | 'beta' | 'planned';
  meta?: string;
};

export type IconName = 'spark' | 'scan' | 'file' | 'image' | 'pen' | 'layers' | 'search' | 'arrow' | 'bookmark' | 'menu' | 'close' | 'sliders' | 'film' | 'external';

export type ToolDefinition = CatalogItem & {
  kind: 'tool';
  capabilities: string[];
  inputFormats?: string[];
  outputFormats?: string[];
};
