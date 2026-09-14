import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

test('the first prototype contains the planned content groups', async () => {
  const source = await readFile(join(root, 'src', 'main.tsx'), 'utf8');
  for (const label of ['Khám phá', 'Công cụ', 'Tài nguyên', 'Skill', 'Prompt', 'Đã lưu']) assert.match(source, new RegExp(label));
});

test('AI background removal is absent from shipped source', async () => {
  const files = await readdir(join(root, 'src'), { recursive: true });
  const source = (await Promise.all(files.filter(file => /\.(tsx|ts|css)$/.test(file)).map(file => readFile(join(root, 'src', file), 'utf8')))).join('\n').toLowerCase();
  assert.equal(source.includes('remove bg'), false);
  assert.equal(source.includes('remove background'), false);
});

test('PDF Editor ships advanced text replacement without experimental AI code', async () => {
  const editorRoot = join(root, 'src', 'pdf-editor');
  const files = await readdir(editorRoot, { recursive: true });
  const sourceFiles = files.filter(file => /\.(html|css|js)$/.test(file) && !file.startsWith('vendor'));
  const source = (await Promise.all(sourceFiles.map(file => readFile(join(editorRoot, file), 'utf8')))).join('\n');
  assert.match(source, /Thay chữ nâng cao/i);
  assert.match(source, /initSmartTextTool/);
  assert.doesNotMatch(source, /\bAI\b|ComfyUI|remove.?background/i);
});

test('PDF Editor uses a responsive library, canvas and inspector workspace', async () => {
  const editorRoot = join(root, 'src', 'pdf-editor');
  const [html, layoutScript, styles] = await Promise.all([
    readFile(join(editorRoot, 'index.html'), 'utf8'),
    readFile(join(editorRoot, 'js', 'editor-layout.js'), 'utf8'),
    readFile(join(editorRoot, 'standalone.css'), 'utf8'),
  ]);
  const libraryPosition = html.indexOf('id="panel-edit"');
  const canvasPosition = html.indexOf('id="panel-edit-canvas"');
  const inspectorPosition = html.indexOf('class="editor-inspector"');
  assert.ok(libraryPosition >= 0 && libraryPosition < canvasPosition && canvasPosition < inspectorPosition);
  assert.match(html, /id="inspector-properties"/);
  assert.match(layoutScript, /mount\.appendChild\(toolbar\)/);
  assert.match(styles, /\.editor-inspector \.edit-top-toolbar/);
  assert.match(styles, /@media \(max-width:980px\)[\s\S]*\.editor-inspector \{ order:2;/);
  assert.doesNotMatch(styles, /@media \(max-width:1100px\) \{ \.editor-inspector \{ display:none;/);
});

test('PDF Editor inspector observer avoids a self-triggering mutation loop', async () => {
  const layout = await readFile(join(root, 'src', 'pdf-editor', 'js', 'editor-layout.js'), 'utf8');
  assert.match(layout, /element\.textContent !== value/);
  assert.doesNotMatch(layout, /if \(stageStatus\) stageStatus\.textContent\s*=/);
});

test('PDF Editor reports readiness to its route shell', async () => {
  const [main, editor] = await Promise.all([
    readFile(join(root, 'src', 'main.tsx'), 'utf8'),
    readFile(join(root, 'src', 'pdf-editor', 'index.html'), 'utf8'),
  ]);
  assert.match(main, /designforge-pdf-editor-ready/);
  assert.match(editor, /postMessage\('designforge-pdf-editor-ready'/);
});

test('tool registry keeps barcode and qr-related capabilities discoverable', async () => {
  const source = await readFile(join(root, 'src', 'data', 'catalog.ts'), 'utf8');
  assert.match(source, /Barcode & QR/);
  assert.match(source, /EAN-13/);
  assert.match(source, /GS1-128/);
  assert.match(source, /QR Code/);
});
