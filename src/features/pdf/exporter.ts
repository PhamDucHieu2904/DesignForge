import { PDFDocument } from 'pdf-lib';
import * as UTIF from 'utif';

export type ImagePaperSize = 'fit' | 'a4v' | 'a4h';
export type PdfQuality = 'high' | 'medium' | 'compact';

// High always preserves the source dimensions. JPG/PNG bytes are embedded directly.
const QUALITY_SCALE: Record<PdfQuality, number> = { high: 1, medium: 0.6, compact: 0.35 };
const COMPRESS_SCALE: Record<PdfQuality, number> = { high: 1, medium: 0.65, compact: 0.4 };
const A4_W_PT = 595;
const A4_H_PT = 842;

function isTiff(file: File): boolean {
  return /\.tiff?$/i.test(file.name) || file.type === 'image/tiff';
}

function canvasToBlob(canvas: HTMLCanvasElement, type: 'image/png' | 'image/jpeg', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Không thể chuyển đổi ảnh.')), type, quality));
}

async function decodeTiff(file: File): Promise<HTMLCanvasElement> {
  const buffer = await file.arrayBuffer();
  const pages = UTIF.decode(buffer);
  if (!pages.length) throw new Error(`Không thể đọc TIFF: ${file.name}`);
  UTIF.decodeImage(buffer, pages[0]);
  const rgba = UTIF.toRGBA8(pages[0]);
  const canvas = document.createElement('canvas');
  canvas.width = pages[0].width;
  canvas.height = pages[0].height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Trình duyệt không hỗ trợ canvas.');
  context.putImageData(new ImageData(new Uint8ClampedArray(rgba), canvas.width, canvas.height), 0, 0);
  return canvas;
}

async function decodeImage(file: File): Promise<HTMLCanvasElement> {
  if (isTiff(file)) return decodeTiff(file);
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Trình duyệt không hỗ trợ canvas.');
  }
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas;
}

async function imageBytes(file: File, quality: PdfQuality): Promise<{ bytes: ArrayBuffer; mime: 'image/png' | 'image/jpeg' }> {
  const scale = QUALITY_SCALE[quality];
  if (scale === 1 && file.type === 'image/jpeg' && !isTiff(file)) return { bytes: await file.arrayBuffer(), mime: 'image/jpeg' };
  if (scale === 1 && file.type === 'image/png' && !isTiff(file)) return { bytes: await file.arrayBuffer(), mime: 'image/png' };
  const source = await decodeImage(file);
  if (scale < 1) {
    const resized = document.createElement('canvas');
    resized.width = Math.max(1, Math.round(source.width * scale));
    resized.height = Math.max(1, Math.round(source.height * scale));
    resized.getContext('2d')?.drawImage(source, 0, 0, resized.width, resized.height);
    return { bytes: await (await canvasToBlob(resized, 'image/jpeg', 0.82)).arrayBuffer(), mime: 'image/jpeg' };
  }
  return { bytes: await (await canvasToBlob(source, 'image/png')).arrayBuffer(), mime: 'image/png' };
}

export async function combineImagesToPdf(files: File[], paperSize: ImagePaperSize, quality: PdfQuality): Promise<Uint8Array> {
  if (!files.length) throw new Error('Hãy chọn ít nhất một ảnh.');
  const pdf = await PDFDocument.create();
  for (const file of files) {
    const source = await imageBytes(file, quality);
    const image = source.mime === 'image/jpeg' ? await pdf.embedJpg(source.bytes) : await pdf.embedPng(source.bytes);
    const imageSize = image.scale(1);
    const [pageW, pageH] = paperSize === 'fit' ? [imageSize.width, imageSize.height] : paperSize === 'a4v' ? [A4_W_PT, A4_H_PT] : [A4_H_PT, A4_W_PT];
    const page = pdf.addPage([pageW, pageH]);
    const ratio = Math.min(pageW / imageSize.width, pageH / imageSize.height);
    const width = imageSize.width * ratio;
    const height = imageSize.height * ratio;
    page.drawImage(image, { x: (pageW - width) / 2, y: (pageH - height) / 2, width, height });
  }
  return pdf.save();
}

export async function mergePdfFiles(files: File[], quality: PdfQuality): Promise<Uint8Array> {
  if (!files.length) throw new Error('Hãy chọn ít nhất một file PDF.');
  const output = await PDFDocument.create();
  const scale = COMPRESS_SCALE[quality];
  for (const file of files) {
    let source: PDFDocument;
    try {
      source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    } catch {
      throw new Error(`Không thể đọc PDF: ${file.name}`);
    }
    const pages = await output.copyPages(source, source.getPageIndices());
    for (const page of pages) {
      if (scale < 1) {
        const { width, height } = page.getSize();
        page.setSize(width * scale, height * scale);
        page.scaleContent(scale, scale);
      }
      output.addPage(page);
    }
  }
  return output.save();
}

export function downloadPdf(bytes: Uint8Array, name: string): void {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
