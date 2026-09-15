export type PromptField = {
  key: string;
  label: string;
  value: string;
  placeholder?: string;
  fallback?: string;
  optional?: boolean;
  advanced?: boolean;
  options?: string[];
};

export type PromptTemplate = {
  id: string;
  category: string;
  title: string;
  cardTitle: string;
  caption: string;
  thumbnail: string;
  thumbnailAlt: string;
  advancedLabel?: string;
  fields: PromptField[];
  master: string;
  legacyReplacements?: Record<string, string>;
};

export type PromptValues = Record<string, string>;
