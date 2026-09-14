import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';
import { barcodePayload, parseGS1, validateBarcodeValue, type BarcodeExportFormat, type BarcodeFormatId } from './engine';

type RenderedCode = {
  width: number;
  height: number;
  viewBox: string;
  markup: string;
};

export type GeneratedBarcodeFile = {
  name: string;
  blob: Blob;
};

const BARCODE_OPTIONS = {
  width: 2,
  height: 80,
  displayValue: true,
  font: 'Arial',
  fontSize: 20,
  textMargin: 2,
  margin: 8,
  background: '#ffffff',
  lineColor: '#000000',
};

const QR_SIZE = 140;
const PADDING = 30;
const GAP = 20;
const SVG_NS = 'http://www.w3.org/2000/svg';

function validatedCodes(format: BarcodeFormatId, values: string[]): string[] {
  const filled = values.filter(value => value.trim());
  if (!filled.length) throw new Error('Vui lòng nhập ít nhất một mã.');
  return filled.map(value => {
    const result = validateBarcodeValue(format, value);
    if (result.fullValue === null) throw new Error(result.error);
    return result.fullValue;
  });
}

function renderLinearCode(format: BarcodeFormatId, fullValue: string): RenderedCode {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const payload = barcodePayload(format, fullValue);
  JsBarcode(svg, payload.data, { ...BARCODE_OPTIONS, format: payload.jsBarcodeFormat, text: payload.text });
  const width = Number.parseFloat(svg.getAttribute('width') || '') || 200;
  const height = Number.parseFloat(svg.getAttribute('height') || '') || 120;
  return { width, height, viewBox: `0 0 ${width} ${height}`, markup: svg.innerHTML };
}

async function renderQrCode(fullValue: string, includeText: boolean): Promise<RenderedCode> {
  const rawSvg = await QRCode.toString(fullValue, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 0,
    width: QR_SIZE,
    color: { dark: '#000000ff', light: '#ffffffff' },
  });
  const root = new DOMParser().parseFromString(rawSvg, 'image/svg+xml').documentElement;
  const textHeight = includeText ? 28 : 0;
  const label = fullValue.length > 36 ? `${fullValue.slice(0, 36)}…` : fullValue;
  const labelMarkup = includeText ? `<text x="${QR_SIZE / 2}" y="${QR_SIZE + 20}" text-anchor="middle" font-size="20" font-family="Arial, sans-serif" fill="#000000">${escapeXml(label)}</text>` : '';
  return { width: QR_SIZE, height: QR_SIZE + textHeight, viewBox: `0 0 ${QR_SIZE} ${QR_SIZE + textHeight}`, markup: `<svg width="${QR_SIZE}" height="${QR_SIZE}" viewBox="${root.getAttribute('viewBox') || `0 0 ${QR_SIZE} ${QR_SIZE}`}">${root.innerHTML}</svg>${labelMarkup}` };
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[character] ?? character));
}

function serializeSingleSvg(item: RenderedCode): string {
  return `<svg xmlns="${SVG_NS}" width="${item.width}" height="${item.height}" viewBox="${item.viewBox}"><rect width="100%" height="100%" fill="#ffffff"/>${item.markup}</svg>`;
}

function serializeVerticalArtboard(items: RenderedCode[]): string {
  const width = Math.max(...items.map(item => item.width)) + PADDING * 2;
  const height = items.reduce((total, item) => total + item.height, 0) + GAP * (items.length - 1) + PADDING * 2;
  let y = PADDING;
  const content = items.map(item => {
    const x = PADDING + (width - PADDING * 2 - item.width) / 2;
    const nested = `<svg x="${x}" y="${y}" width="${item.width}" height="${item.height}" viewBox="${item.viewBox}">${item.markup}</svg>`;
    y += item.height + GAP;
    return nested;
  }).join('');
  return `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#ffffff"/>${content}</svg>`;
}

function svgToPngBlob(svg: string, width: number, height: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const source = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(width * 2);
      canvas.height = Math.ceil(height * 2);
      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(source);
        reject(new Error('Trình duyệt không hỗ trợ xuất canvas.'));
        return;
      }
      context.scale(2, 2);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(source);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Không thể tạo file PNG.')), 'image/png');
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error('Không thể chuyển mã sang PNG.'));
    };
    image.src = source;
  });
}

async function renderCodes(format: BarcodeFormatId, fullCodes: string[], includeQrText: boolean): Promise<RenderedCode[]> {
  if (format === 'qr') return Promise.all(fullCodes.map(code => renderQrCode(code, includeQrText)));
  return fullCodes.map(code => renderLinearCode(format, code));
}

async function buildPdf(items: RenderedCode[]): Promise<Blob> {
  const document = await PDFDocument.create();
  for (const item of items) {
    const png = await svgToPngBlob(serializeSingleSvg(item), item.width, item.height);
    const embedded = await document.embedPng(new Uint8Array(await png.arrayBuffer()));
    const page = document.addPage([item.width + PADDING * 2, item.height + PADDING * 2]);
    page.drawImage(embedded, { x: PADDING, y: PADDING, width: item.width, height: item.height });
  }
  const bytes = await document.save();
  const buffer = new Uint8Array(bytes.length);
  buffer.set(bytes);
  return new Blob([buffer.buffer], { type: 'application/pdf' });
}

export async function createBarcodeExport(format: BarcodeFormatId, values: string[], output: BarcodeExportFormat): Promise<GeneratedBarcodeFile[]> {
  const fullCodes = validatedCodes(format, values);
  if (output === 'SVG') {
    const items = await renderCodes(format, fullCodes, format === 'qr');
    return [{ name: format === 'qr' ? 'qrcodes.svg' : 'barcodes.svg', blob: new Blob([serializeVerticalArtboard(items)], { type: 'image/svg+xml;charset=utf-8' }) }];
  }
  const items = await renderCodes(format, fullCodes, false);
  if (output === 'PDF') return [{ name: format === 'qr' ? 'qrcodes.pdf' : 'barcodes.pdf', blob: await buildPdf(items) }];
  return Promise.all(items.map(async (item, index) => ({
    name: format === 'qr' ? (items.length > 1 ? `qrcode_${index + 1}.png` : 'qrcode.png') : (items.length > 1 ? `barcode_${index + 1}.png` : 'barcode.png'),
    blob: await svgToPngBlob(serializeSingleSvg(item), item.width, item.height),
  })));
}

export function downloadGeneratedFiles(files: GeneratedBarcodeFile[]): void {
  files.forEach((file, index) => {
    window.setTimeout(() => {
      const url = URL.createObjectURL(file.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, index * 150);
  });
}

export function getGs1DisplayValue(value: string): string | null {
  return parseGS1(value)?.displayValue ?? null;
}
