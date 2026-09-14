import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { transform } from 'esbuild';

const source = await readFile(new URL('../src/features/barcode/engine.ts', import.meta.url), 'utf8');
const compiled = await transform(source, { loader: 'ts', format: 'esm', target: 'es2022' });
const engine = await import(`data:text/javascript;base64,${Buffer.from(compiled.code).toString('base64')}`);

test('barcode check digits match the legacy calculators', () => {
  assert.equal(engine.completedBarcodeValue('ean13', '123456789012'), '1234567890128');
  assert.equal(engine.completedBarcodeValue('upca', '01234567890'), '012345678905');
  assert.equal(engine.completedBarcodeValue('itf14', '1234567890123'), '12345678901231');
});

test('numeric formats preserve leading zeroes and reject incomplete values', () => {
  assert.equal(engine.normalizeBarcodeValue('upca', '00 123-A'), '00123');
  assert.equal(engine.validateBarcodeValue('ean13', '123').fullValue, null);
});

test('GS1 parser keeps FNC1 encoding and human-readable application identifiers', () => {
  const parsed = engine.parseGS1('(01)12345678901231(10)LOT001');
  assert.ok(parsed);
  assert.equal(parsed.encoded, 'Ï011234567890123110LOT001');
  assert.equal(parsed.displayValue, '(01)12345678901231(10)LOT001');
});
