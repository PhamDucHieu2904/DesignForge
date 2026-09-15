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

test('homepage discovery intro stays compact and uses the requested copy', async () => {
  const source = await readFile(join(root, 'src', 'main.tsx'), 'utf8');
  assert.match(source, /<h1>Ở đây có chút công cụ cho <span>designer mới nhú<\/span><\/h1>/);
  assert.match(source, /Một số công cụ có thể hữu ích cho người bắt đầu thiết kế/);
  assert.match(source, /Thấy hay thì cho tôi xin 1 tràng pháo tay là được/);
  assert.doesNotMatch(source, /YOUR NEXT IDEA STARTS HERE/);
  assert.doesNotMatch(source, /Khám phá công cụ, tài nguyên và kiến thức thiết kế/);
  assert.doesNotMatch(source, /Không gian cho<br\/>/);
});

test('homepage keeps one global footer and presents creator credit on one line', async () => {
  const source = await readFile(join(root, 'src', 'main.tsx'), 'utf8');
  const styles = await readFile(join(root, 'src', 'styles.css'), 'utf8');
  assert.doesNotMatch(source, /className="site-footer"/);
  assert.match(source, /className="global-footer"/);
  assert.match(source, /by Hyper D²<\/span><a href="mailto:hieuphamdesdev@gmail\.com">/);
  assert.match(styles, /\.creator-credit\{display:flex;align-items:center;gap:8px;[^}]*font-size:14px/);
});

test('homepage feature cover links to Barcode Generator and ships its visual asset', async () => {
  const [source, buildScript] = await Promise.all([
    readFile(join(root, 'src', 'main.tsx'), 'utf8'),
    readFile(join(root, 'scripts', 'build.mjs'), 'utf8'),
  ]);
  assert.match(source, /className="gallery-cover cover-barcode" href="#\/tools"/);
  assert.match(source, /Barcode Generator/);
  assert.match(source, /Cần thêm code khác, cần bổ sung thêm chức năng thì liên hệ/);
  assert.doesNotMatch(source, /BARCODE \/ QR TOOLS|DESIGNFORGE TOOL/);
  assert.match(await readFile(join(root, 'src', 'styles.css'), 'utf8'), /\.cover-barcode \.gallery-caption\{align-items:end;margin-top:auto\}/);
  assert.match(buildScript, /barcode-background\.webp/);
});

test('homepage feature cover links to Image Filter Lab and ships its thumbnail', async () => {
  const [source, buildScript] = await Promise.all([
    readFile(join(root, 'src', 'main.tsx'), 'utf8'),
    readFile(join(root, 'scripts', 'build.mjs'), 'utf8'),
  ]);
  assert.match(source, /className="gallery-cover cover-image-filter" href="#\/tools\?collection=image-filter"/);
  assert.match(source, /initialCollection\?: ToolCollection/);
  assert.match(source, /Image Filter Lab/);
  assert.match(source, /Công cụ chuyển ảnh thành các hiệu ứng \(Phù hợp in Flexo\)/);
  assert.match(buildScript, /image-filter-lab-thumb\.webp/);
  const styles = await readFile(join(root, 'src', 'styles.css'), 'utf8');
  assert.match(styles, /\.cover-image-filter \.gallery-caption\{[^}]*background:rgba\(255,255,255,\.6\)/);
  assert.match(styles, /\.cover-image-filter \.gallery-caption\{[^}]*backdrop-filter:blur\(22px\) saturate\(145%\)/);
  assert.match(styles, /\.cover-image-filter \.gallery-caption\{[^}]*border-radius:20px/);
});

test('homepage feature cover links to Promt Library and ships its thumbnail', async () => {
  const [source, buildScript, styles] = await Promise.all([
    readFile(join(root, 'src', 'main.tsx'), 'utf8'),
    readFile(join(root, 'scripts', 'build.mjs'), 'utf8'),
    readFile(join(root, 'src', 'styles.css'), 'utf8'),
  ]);
  assert.match(source, /className="gallery-cover cover-promt" href="#\/prompts" aria-label="Mở Promt Library"/);
  assert.match(source, /Promt Library/);
  assert.match(source, /Promt poster tùm lum tùm la sẽ update dần thêm/);
  assert.match(buildScript, /promt-library\.webp/);
  assert.match(styles, /\.cover-promt \.gallery-caption\{[^}]*background:rgba\(0,0,0,\.2\)/);
  assert.match(styles, /\.cover-promt \.gallery-caption\{[^}]*backdrop-filter:blur\(10px\) saturate\(125%\)/);
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
  const toolbarPosition = html.indexOf('class="edit-top-toolbar"');
  const canvasMainPosition = html.indexOf('class="edit-canvas-main"');
  const inspectorPosition = html.indexOf('class="editor-inspector"');
  assert.ok(libraryPosition >= 0 && libraryPosition < canvasPosition && canvasPosition < inspectorPosition);
  assert.ok(canvasPosition < toolbarPosition && toolbarPosition < canvasMainPosition);
  assert.match(html, /id="inspector-properties"/);
  assert.doesNotMatch(html, /PHÍM TẮT|inspector-note/);
  assert.doesNotMatch(layoutScript, /appendChild\(toolbar\)/);
  assert.match(layoutScript, /Dùng thanh thuộc tính phía trên canvas/);
  assert.match(styles, /\.edit-canvas-panel > \.edit-top-toolbar/);
  assert.match(styles, /\.pdf-panel--edit \.drop-zone \{[\s\S]*background: var\(--df-canvas\);/);
  assert.match(styles, /\.edit-top-toolbar \.etb-zoom-wrap \{ flex: 0 0 72px; width: 72px; max-width: 72px; \}/);
  assert.match(styles, /grid-template-columns: max-content minmax\(0, 1fr\);/);
  assert.match(styles, /\.edit-bottom-toolbar \{\s+justify-content: center;/);
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

test('Prompt Library is separate from the tools marketplace', async () => {
  const [catalog, main] = await Promise.all([
    readFile(join(root, 'src', 'data', 'catalog.ts'), 'utf8'),
    readFile(join(root, 'src', 'main.tsx'), 'utf8'),
  ]);
  assert.doesNotMatch(catalog, /prompt-builder|Prompt Builder/);
  assert.doesNotMatch(main, /id: 'prompt', label: 'Prompt'/);
  assert.match(main, /if \(view === 'prompts'\) return <PromptLibraryPage/);
});

test('barcode row actions stay anchored to the input box', async () => {
  const [main, styles] = await Promise.all([
    readFile(join(root, 'src', 'main.tsx'), 'utf8'),
    readFile(join(root, 'src', 'styles.css'), 'utf8'),
  ]);
  assert.doesNotMatch(main, /barcode-input-row is-ghost/);
  assert.match(main, /<div className="barcode-row-actions">/);
  assert.match(styles, /\.barcode-row-actions\{position:absolute;z-index:3;right:10px;bottom:10px;top:auto/);
});

test('Color Halftone keeps a pure engine boundary and a dedicated workspace route', async () => {
  const [main, engine, styles] = await Promise.all([
    readFile(join(root, 'src', 'main.tsx'), 'utf8'),
    readFile(join(root, 'src', 'features', 'image-filter', 'engine.ts'), 'utf8'),
    readFile(join(root, 'src', 'styles.css'), 'utf8'),
  ]);
  assert.match(main, /activeTool\.id === 'image-filter'/);
  assert.match(main, /ImageFilterWorkspace/);
  assert.doesNotMatch(main, /image-filter-heading/);
  assert.doesNotMatch(main, /image-filter-effect/);
  assert.match(main, /image-filter-info-list/);
  assert.match(main, /className=\{source \? '' : 'is-empty'\}/);
  assert.match(engine, /export function createHalftoneDots/);
  assert.match(engine, /export function buildHalftoneSvg/);
  assert.match(styles, /\.image-filter-workspace/);
  assert.match(styles, /\.image-filter-info-list/);
  assert.match(styles, /\.image-filter-dropzone canvas\.is-empty\{display:none\}/);
});

test('Prompt Library ships all eight legacy templates through typed feature boundaries', async () => {
  const [templatesSource, page, repository, build] = await Promise.all([
    readFile(join(root, 'src', 'features', 'prompts', 'templates.json'), 'utf8'),
    readFile(join(root, 'src', 'features', 'prompts', 'PromptLibraryPage.tsx'), 'utf8'),
    readFile(join(root, 'src', 'features', 'prompts', 'repository.ts'), 'utf8'),
    readFile(join(root, 'scripts', 'build.mjs'), 'utf8'),
  ]);
  const templates = JSON.parse(templatesSource);
  assert.equal(templates.length, 8);
  assert.ok(templates.every(template => template.master && template.fields.length && template.thumbnail));
  assert.match(page, /PromptLibraryPage/);
  assert.doesNotMatch(page, /Prompt có thể tái sử dụng/);
  assert.match(page, /Poster nước giải khát/);
  assert.match(page, /Poster thực phẩm/);
  assert.match(page, /Poster sản phẩm làm đẹp/);
  assert.match(page, /Aloe vera/);
  assert.match(page, /promptTemplateTaxonomy/);
  assert.match(page, /return template\.thumbnail\.replace/);
  assert.doesNotMatch(page, /return `\/\$\{template\.thumbnail/);
  assert.match(page, /Tạo prompt/);
  assert.match(page, /Sao chép prompt/);
  assert.match(repository, /designforge:prompt-draft:v1:/);
  assert.match(build, /src\/assets\/prompts/);
});

test('GitHub Pages deployment builds the project under its repository base path', async () => {
  const [workflow, build, readme] = await Promise.all([
    readFile(join(root, '.github', 'workflows', 'deploy-pages.yml'), 'utf8'),
    readFile(join(root, 'scripts', 'build.mjs'), 'utf8'),
    readFile(join(root, 'README.md'), 'utf8'),
  ]);
  assert.match(workflow, /BASE_PATH: \/DesignForge/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(build, /process\.env\.BASE_PATH/);
  assert.match(build, /dist\/\.nojekyll/);
  assert.match(readme, /phamduchieu2904\.github\.io\/DesignForge/);
});
