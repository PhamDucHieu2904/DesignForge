import type { PromptTemplate, PromptValues } from './types';
import { createPromptValues } from './engine';

const prefix = 'designforge:prompt-draft:v1:';

export const promptDraftRepository = {
  read(template: PromptTemplate): PromptValues {
    const defaults = createPromptValues(template);
    try {
      const saved = window.localStorage.getItem(`${prefix}${template.id}`);
      return saved ? { ...defaults, ...JSON.parse(saved) as PromptValues } : defaults;
    } catch {
      return defaults;
    }
  },
  write(templateId: string, values: PromptValues) {
    try { window.localStorage.setItem(`${prefix}${templateId}`, JSON.stringify(values)); } catch { /* Storage is optional. */ }
  },
  clear(templateId: string) {
    try { window.localStorage.removeItem(`${prefix}${templateId}`); } catch { /* Storage is optional. */ }
  },
};
