import { build } from 'esbuild';
import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const requestedBasePath = process.env.BASE_PATH?.trim() ?? '';
const basePath = requestedBasePath && requestedBasePath !== '/'
  ? `/${requestedBasePath.replace(/^\/+|\/+$/g, '')}`
  : '';
const buildId = process.env.GITHUB_SHA?.slice(0, 8).replace(/[^a-zA-Z0-9_-]/g, '') ?? '';
const bundleName = buildId ? `app-${buildId}` : 'app';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  outfile: `dist/assets/${bundleName}.js`,
  external: ['/assets/*'],
  sourcemap: true,
  jsx: 'automatic',
  minify: process.env.NODE_ENV === 'production',
});
await Promise.all([
  'barcode-ean13.png',
  'barcode-upca.png',
  'barcode-itf14.png',
  'barcode-code128.png',
  'barcode-gs1128.png',
  'barcode-qr.png',
  'barcode-background.webp',
  'image-filter-lab-thumb.webp',
  'promt-library.webp',
].map(file => copyFile(`src/assets/${file}`, `dist/assets/${file}`)));
await cp('src/assets/prompts', 'dist/assets/prompts', { recursive: true });
await Promise.all([
  'mona-sans-vietnamese-wght-normal.woff2',
  'mona-sans-latin-ext-wght-normal.woff2',
  'mona-sans-latin-wght-normal.woff2',
].map(file => copyFile(`node_modules/@fontsource-variable/mona-sans/files/${file}`, `dist/assets/${file}`)));
await cp('src/pdf-editor', 'dist/pdf-editor', { recursive: true });
const html = await readFile('index.html', 'utf8');
await writeFile('dist/index.html', html.replace('/src/main.tsx', `${basePath}/assets/${bundleName}.js`).replace('</head>', `    <link rel="stylesheet" href="${basePath}/assets/${bundleName}.css" />\n  </head>`));
await writeFile('dist/.nojekyll', '');

if (basePath) {
  await Promise.all([
    `dist/assets/${bundleName}.js`,
    `dist/assets/${bundleName}.css`,
    'dist/pdf-editor/standalone.css',
  ].map(async file => {
    const content = await readFile(file, 'utf8');
    await writeFile(file, content
      .replaceAll('/assets/', `${basePath}/assets/`)
      .replaceAll('/pdf-editor/', `${basePath}/pdf-editor/`));
  }));
}
console.log('DesignForge built to dist/');
