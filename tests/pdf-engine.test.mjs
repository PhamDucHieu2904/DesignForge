import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
import { PDFDocument } from 'pdf-lib';

async function loadExporter() {
  const result = await build({
    entryPoints: ['src/features/pdf/exporter.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    write: false,
  });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

async function pdfFile(name, sizes) {
  const pdf = await PDFDocument.create();
  sizes.forEach(size => pdf.addPage(size));
  return new File([await pdf.save()], name, { type: 'application/pdf' });
}

const PNG_120_X_80 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAHgAAABQCAYAAADSm7GJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADUSURBVHhe7dExEQAgEMCwF4slZKIBdiTkOmTp2ln73LjmD7E0GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdgXINxDcY1GNdg3AN6ppHVP2izAAAAAABJRU5ErkJggg==', 'base64');

test('image combine creates one fit-sized page per image', async () => {
  const { combineImagesToPdf } = await loadExporter();
  const files = [new File([PNG_120_X_80], 'a.png', { type: 'image/png' }), new File([PNG_120_X_80], 'b.png', { type: 'image/png' })];
  const bytes = await combineImagesToPdf(files, 'fit', 'high');
  const combined = await PDFDocument.load(bytes);
  assert.equal(combined.getPageCount(), 2);
  assert.deepEqual(combined.getPages().map(page => page.getSize()), [{ width: 120, height: 80 }, { width: 120, height: 80 }]);
});

test('PDF merge preserves source order and page count', async () => {
  const { mergePdfFiles } = await loadExporter();
  const files = [await pdfFile('one.pdf', [[200, 300]]), await pdfFile('two.pdf', [[200, 300], [210, 310]])];
  const bytes = await mergePdfFiles(files, 'high');
  const merged = await PDFDocument.load(bytes);
  assert.equal(merged.getPageCount(), 3);
  assert.deepEqual(merged.getPages().map(page => page.getSize()), [
    { width: 200, height: 300 },
    { width: 200, height: 300 },
    { width: 210, height: 310 },
  ]);
});

test('compact merge scales each copied page like the legacy tool', async () => {
  const { mergePdfFiles } = await loadExporter();
  const bytes = await mergePdfFiles([await pdfFile('one.pdf', [[200, 300]])], 'compact');
  const merged = await PDFDocument.load(bytes);
  assert.deepEqual(merged.getPage(0).getSize(), { width: 80, height: 120 });
});
