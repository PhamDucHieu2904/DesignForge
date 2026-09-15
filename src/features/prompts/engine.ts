import type { PromptTemplate, PromptValues } from './types';

export function createPromptValues(template: PromptTemplate): PromptValues {
  return Object.fromEntries(template.fields.map(field => [field.key, field.value]));
}

export function getMissingPromptFields(template: PromptTemplate, values: PromptValues): string[] {
  return template.fields
    .filter(field => !field.optional && !(values[field.key] ?? '').trim())
    .map(field => field.label);
}

export function renderPrompt(template: PromptTemplate, values: PromptValues): string {
  let result = template.master;
  for (const [token, fieldKey] of Object.entries(template.legacyReplacements ?? {})) {
    result = result.split(token).join((values[fieldKey] ?? '').trim());
  }
  for (const field of template.fields) {
    const value = (values[field.key] ?? '').trim() || field.fallback || '';
    result = result.split(`{{${field.key}}}`).join(value);
  }
  return result.trim();
}
