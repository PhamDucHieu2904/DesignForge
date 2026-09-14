export type BarcodeFormatId = 'ean13' | 'upca' | 'itf14' | 'code128' | 'gs1128' | 'qr';
export type BarcodeExportFormat = 'SVG' | 'PDF' | 'PNG';

export type BarcodeFormatDefinition = {
  id: BarcodeFormatId;
  title: string;
  note: string;
  placeholder: string;
  onlyDigits: boolean;
  maxLength: number;
};

export const MAX_BARCODE_INPUTS = 20;

export const barcodeFormats: BarcodeFormatDefinition[] = [
  { id: 'ean13', title: 'EAN 13', note: 'Nhập 12 chữ số – check digit cuối tự động tính.', placeholder: '123456789012', onlyDigits: true, maxLength: 12 },
  { id: 'upca', title: 'UPC-A', note: 'Nhập 11 chữ số – check digit cuối tự động tính.', placeholder: '01234567890', onlyDigits: true, maxLength: 11 },
  { id: 'itf14', title: 'ITF-14', note: 'Nhập 13 chữ số – check digit cuối tự động tính.', placeholder: '1234567890123', onlyDigits: true, maxLength: 13 },
  { id: 'code128', title: 'Code 128', note: 'Nhập chuỗi bất kỳ – check digit tự động tính.', placeholder: 'ABC-123', onlyDigits: false, maxLength: 48 },
  { id: 'gs1128', title: 'GS1-128', note: 'Nhập AI trong ngoặc đơn, không có khoảng trắng.', placeholder: '(01)12345678901231(10)LOT001', onlyDigits: false, maxLength: 80 },
  { id: 'qr', title: 'QR Code', note: 'Nhập văn bản, URL, số điện thoại…', placeholder: 'https://example.com', onlyDigits: false, maxLength: 500 },
];

const formatById = Object.fromEntries(barcodeFormats.map(format => [format.id, format])) as Record<BarcodeFormatId, BarcodeFormatDefinition>;

export function normalizeBarcodeValue(format: BarcodeFormatId, value: string): string {
  const meta = formatById[format];
  const normalized = meta.onlyDigits ? value.replace(/\D/g, '') : value;
  return normalized.slice(0, meta.maxLength);
}

export function calculateCheckDigit(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (!digits.length) return null;
  let sum = 0;
  for (let index = digits.length - 1, position = 0; index >= 0; index -= 1, position += 1) {
    sum += Number(digits[index]) * (position % 2 === 0 ? 3 : 1);
  }
  return String((10 - (sum % 10)) % 10);
}

export function completedBarcodeValue(format: BarcodeFormatId, value: string): string | null {
  const normalized = normalizeBarcodeValue(format, value).trim();
  if (!normalized) return null;
  if (format === 'gs1128') return normalized.replace(/[()\s]/g, '');
  const expected = format === 'ean13' ? 12 : format === 'upca' ? 11 : format === 'itf14' ? 13 : 0;
  if (expected) {
    if (normalized.length < expected) return null;
    const base = normalized.slice(0, expected);
    return `${base}${calculateCheckDigit(base) ?? ''}`;
  }
  return normalized;
}

const gs1FixedLength: Record<string, number> = {
  '00': 18,
  '01': 14, '02': 14, '03': 14, '04': 14,
  '11': 6, '12': 6, '13': 6, '14': 6, '15': 6, '16': 6, '17': 6,
  '20': 2,
  '31': 6, '32': 6, '33': 6, '34': 6, '35': 6, '36': 6,
  '41': 13,
};

export function parseGS1(value: string): { encoded: string; displayValue: string } | null {
  const clean = value.replace(/[()\s]/g, '');
  if (!clean) return null;
  let encoded = 'Ï';
  let displayValue = '';
  let index = 0;

  while (index < clean.length) {
    const ai2 = clean.slice(index, index + 2);
    const ai3 = clean.slice(index, index + 3);
    const ai4 = clean.slice(index, index + 4);
    let ai = ai2;
    let fixedLength = 0;
    let isVariable = true;

    if (gs1FixedLength[ai2] !== undefined) {
      fixedLength = gs1FixedLength[ai2];
      isVariable = false;
    } else if (['10', '21', '22', '30', '37', '90'].includes(ai2)) {
      ai = ai2;
    } else if (ai3.startsWith('41') && Number(ai3) <= 416) {
      ai = ai3;
      fixedLength = 13;
      isVariable = false;
    } else if (['240', '241', '242', '250', '251', '253', '254', '255', '420', '421', '422', '423', '424', '425', '426', '427'].includes(ai3)) {
      ai = ai3;
    } else if (['8003', '8004', '8008', '8018', '8020', '8110'].includes(ai4)) {
      ai = ai4;
    } else if (/^(31|32|33|34|35|36)/.test(ai4)) {
      ai = ai4;
      fixedLength = 6;
      isVariable = false;
    } else if (/^(39|80|81|82|9)/.test(ai4)) {
      ai = ai4;
    }

    if (!/^\d+$/.test(ai)) return null;
    index += ai.length;
    const data = isVariable ? clean.slice(index) : clean.slice(index, index + fixedLength);
    if (!data || (!isVariable && data.length < fixedLength)) return null;
    index = isVariable ? clean.length : index + fixedLength;
    encoded += ai + data;
    displayValue += `(${ai})${data}`;
    if (isVariable && index < clean.length) encoded += 'Ï';
  }

  return { encoded, displayValue };
}

export function validateBarcodeValue(format: BarcodeFormatId, value: string): { fullValue: string; error: null } | { fullValue: null; error: string } {
  const fullValue = completedBarcodeValue(format, value);
  if (!fullValue) {
    const meta = formatById[format];
    return { fullValue: null, error: meta.onlyDigits ? `${meta.title} cần đủ ${meta.maxLength} chữ số.` : `Vui lòng nhập ${meta.title}.` };
  }
  if (format === 'ean13' && !/^\d{13}$/.test(fullValue)) return { fullValue: null, error: 'EAN-13 cần đúng 13 chữ số.' };
  if (format === 'upca' && !/^\d{12}$/.test(fullValue)) return { fullValue: null, error: 'UPC-A cần đúng 12 chữ số.' };
  if (format === 'itf14' && !/^\d{14}$/.test(fullValue)) return { fullValue: null, error: 'ITF-14 cần đúng 14 chữ số.' };
  if (format === 'gs1128' && !parseGS1(value)) return { fullValue: null, error: 'Chuỗi GS1-128 không hợp lệ hoặc chứa AI không nhận dạng được.' };
  return { fullValue, error: null };
}

export function barcodePayload(format: BarcodeFormatId, fullValue: string): { data: string; text: string; jsBarcodeFormat: 'EAN13' | 'UPC' | 'ITF14' | 'CODE128' } {
  if (format === 'gs1128') {
    const parsed = parseGS1(fullValue);
    if (!parsed) throw new Error('Chuỗi GS1-128 không hợp lệ.');
    return { data: parsed.encoded, text: parsed.displayValue, jsBarcodeFormat: 'CODE128' };
  }
  const jsBarcodeFormat = format === 'ean13' ? 'EAN13' : format === 'upca' ? 'UPC' : format === 'itf14' ? 'ITF14' : 'CODE128';
  return { data: fullValue, text: fullValue, jsBarcodeFormat };
}
