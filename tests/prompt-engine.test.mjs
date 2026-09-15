import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { transform } from 'esbuild';

const source = await readFile(new URL('../src/features/prompts/engine.ts', import.meta.url), 'utf8');
const compiled = await transform(source, { loader: 'ts', format: 'esm', target: 'es2022' });
const engine = await import(`data:text/javascript;base64,${Buffer.from(compiled.code).toString('base64')}`);

const template = {
  id: 'sample', category: 'juice', title: 'Sample', cardTitle: 'Sample', caption: 'Sample', thumbnail: '', thumbnailAlt: '',
  fields: [
    { key: 'fruit', label: 'Trái cây', value: 'Cam' },
    { key: 'slogan', label: 'Slogan', value: '', optional: true, fallback: '[SLOGAN]' },
  ],
  master: 'Fruit: {{fruit}} / {{slogan}} / [LEGACY]',
  legacyReplacements: { '[LEGACY]': 'fruit' },
};

test('prompt engine preserves defaults, optional fallbacks and legacy literals', () => {
  const values = engine.createPromptValues(template);
  assert.deepEqual(values, { fruit: 'Cam', slogan: '' });
  assert.equal(engine.renderPrompt(template, values), 'Fruit: Cam / [SLOGAN] / Cam');
});

test('prompt validation reports required fields only', () => {
  assert.deepEqual(engine.getMissingPromptFields(template, { fruit: '', slogan: '' }), ['Trái cây']);
});
