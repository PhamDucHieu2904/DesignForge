import { build } from 'esbuild';
import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  outfile: 'dist/assets/app.js',
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
].map(file => copyFile(`src/assets/${file}`, `dist/assets/${file}`)));
await Promise.all([
  'mona-sans-vietnamese-wght-normal.woff2',
  'mona-sans-latin-ext-wght-normal.woff2',
  'mona-sans-latin-wght-normal.woff2',
].map(file => copyFile(`node_modules/@fontsource-variable/mona-sans/files/${file}`, `dist/assets/${file}`)));
await cp('src/pdf-editor', 'dist/pdf-editor', { recursive: true });
const html = await readFile('index.html', 'utf8');
await writeFile('dist/index.html', html.replace('/src/main.tsx', '/assets/app.js').replace('</head>', '    <link rel="stylesheet" href="/assets/app.css" />\n  </head>'));
console.log('DesignForge built to dist/');
