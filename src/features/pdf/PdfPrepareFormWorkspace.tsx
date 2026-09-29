import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { PDFCheckBox, PDFDocument, PDFFont, PDFRadioGroup, PDFRef, PDFSignature, PDFTextField, StandardFonts, TextAlignment, rgb, type PDFField, type PDFForm } from 'pdf-lib';
import { Icon } from '../../components/Icon';
import { downloadPdf } from './exporter';

type FormFieldType = 'text' | 'checkbox' | 'date' | 'signature';
type PdfFormFont = 'helvetica' | 'times' | 'courier';
type PdfTextAlign = 'left' | 'center' | 'right';
type ResizeHandle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
const MIN_ZOOM = .1;
const MAX_ZOOM = 20;
type FormField = { id: string; type: FormFieldType; name: string; page: number; x: number; y: number; width: number; height: number; fontFamily?: PdfFormFont; fontSize?: number; textAlign?: PdfTextAlign; styleDirty?: boolean; sourceName?: string; sourceWidgetIndex?: number };
type FieldSnapshot = { fields: FormField[]; removedSourceNames: string[] };
type ClipboardField = Pick<FormField, 'type' | 'name' | 'x' | 'y' | 'width' | 'height' | 'fontFamily' | 'fontSize' | 'textAlign'>;
type SelectionBox = { x: number; y: number; width: number; height: number };
type BulkOrder = 'row-major' | 'column-major';
type PageInfo = { width: number; height: number; count: number };
type PdfJsPage = { getViewport: (options: { scale: number }) => { width: number; height: number }; render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> } };
type PdfJsDocument = { numPages: number; getPage: (page: number) => Promise<PdfJsPage> };
type PdfJs = { GlobalWorkerOptions: { workerSrc: string }; getDocument: (options: { data: Uint8Array }) => { promise: Promise<PdfJsDocument> } };

const fieldLabels: Record<FormFieldType, string> = { text: 'Văn bản', checkbox: 'Checkbox', date: 'Ngày tháng', signature: 'Chữ ký' };
const fieldHints: Record<FormFieldType, string> = { text: 'Ô nhập văn bản', checkbox: 'Ô chọn bật / tắt', date: 'Ô nhập ngày', signature: 'Vùng ký tên' };
const fontLabels: Record<PdfFormFont, string> = { helvetica: 'Arial / Helvetica', times: 'Times Roman', courier: 'Courier' };
const standardFonts: Record<PdfFormFont, StandardFonts> = { helvetica: StandardFonts.Helvetica, times: StandardFonts.TimesRoman, courier: StandardFonts.Courier };
const textAlignments: Record<PdfTextAlign, TextAlignment> = { left: TextAlignment.Left, center: TextAlignment.Center, right: TextAlignment.Right };

function isTextLikeField(field: Pick<FormField, 'type'>) {
  return field.type === 'text' || field.type === 'date';
}

function readImportedTextStyle(field: PDFTextField, widgetAppearance?: string) {
  const appearance = widgetAppearance || field.acroField.getDefaultAppearance() || '';
  const matches = [...appearance.matchAll(/\/([^\s/]+)\s+([+-]?(?:\d+\.?\d*|\.\d+))\s+Tf\b/g)];
  const match = matches[matches.length - 1];
  const pdfFontName = (match?.[1] || '').toLocaleLowerCase();
  const parsedSize = Number.parseFloat(match?.[2] || '');
  const fontFamily: PdfFormFont = pdfFontName.includes('times') ? 'times' : pdfFontName.includes('courier') ? 'courier' : 'helvetica';
  const alignment = field.getAlignment();
  const textAlign: PdfTextAlign = alignment === TextAlignment.Center ? 'center' : alignment === TextAlignment.Right ? 'right' : 'left';
  return { fontFamily, fontSize: Number.isFinite(parsedSize) && parsedSize > 0 ? parsedSize : 12, textAlign };
}

function removePdfFieldSafely(pdf: PDFDocument, form: PDFForm, field: PDFField) {
  const pages = pdf.getPages();
  const refsToDelete = new Set<PDFRef>();
  const removeAnnotation = (ref: PDFRef) => pages.forEach(page => {
    const annotations = page.node.Annots();
    const index = annotations?.indexOf(ref);
    if (index !== undefined && index >= 0) page.node.removeAnnot(ref);
  });

  field.acroField.getWidgets().forEach(widget => {
    const widgetRef = pdf.context.getObjectRef(widget.dict) || field.ref;
    refsToDelete.add(widgetRef);
    removeAnnotation(widgetRef);
  });
  removeAnnotation(field.ref);
  form.acroForm.removeField(field.acroField);
  const kids = field.acroField.normalizedEntries().Kids;
  for (let index = 0; index < kids.size(); index += 1) {
    const child = kids.get(index);
    if (child instanceof PDFRef) refsToDelete.add(child);
  }
  refsToDelete.add(field.ref);
  refsToDelete.forEach(ref => pdf.context.delete(ref));
}

/** PDF form field names must be unique. Treat names case-insensitively, as Acrobat does. */
function uniqueFieldName(value: string, collection: FormField[], excludedIds: string[] = []) {
  const base = value.trim() || 'field';
  const isTaken = (candidate: string) => collection.some(item => !excludedIds.includes(item.id) && item.name.trim().toLocaleLowerCase() === candidate.toLocaleLowerCase());
  if (!isTaken(base)) return base;
  let suffix = 2;
  let candidate = `${base}_${suffix}`;
  while (isTaken(candidate)) { suffix += 1; candidate = `${base}_${suffix}`; }
  return candidate;
}

export function fieldIdsInsideSelection(collection: FormField[], page: number, box: SelectionBox) {
  return collection.filter(field => field.page === page && field.x < box.x + box.width && field.x + field.width > box.x && field.y < box.y + box.height && field.y + field.height > box.y).map(field => field.id);
}

export function duplicateFormFields(sources: ClipboardField[], collection: FormField[], page: number, pasteCount: number) {
  const offset = .018 * ((pasteCount % 5) + 1);
  const additions: FormField[] = [];
  sources.forEach((source, index) => {
    const name = uniqueFieldName(`${source.name}_copy`, [...collection, ...additions]);
    additions.push({ ...source, id: `field-${Date.now()}-${index}-${pasteCount}`, name, page, x: Math.max(0, Math.min(1 - source.width, source.x + offset)), y: Math.max(0, Math.min(1 - source.height, source.y + offset)) });
  });
  return additions;
}

/**
 * Orders fields by visual rows or columns. Fields are first clustered by
 * overlapping bands so tiny drag-coordinate differences do not change the
 * reading order of a row or column.
 */
export function orderFieldsForBulkRename<T extends Pick<FormField, 'x' | 'y' | 'width' | 'height'>>(items: T[], order: BulkOrder) {
  const primaryStart = (item: T) => order === 'row-major' ? item.y : item.x;
  const primaryEnd = (item: T) => order === 'row-major' ? item.y + item.height : item.x + item.width;
  const crossStart = (item: T) => order === 'row-major' ? item.x : item.y;
  const ordered = [...items].sort((a, b) => primaryStart(a) - primaryStart(b) || crossStart(a) - crossStart(b));
  const groups: Array<{ items: T[]; end: number }> = [];
  ordered.forEach(item => {
    const start = primaryStart(item);
    const end = primaryEnd(item);
    const group = groups[groups.length - 1];
    if (!group || start >= group.end) groups.push({ items: [item], end });
    else { group.items.push(item); group.end = Math.max(group.end, end); }
  });
  return groups.flatMap(group => group.items.sort((a, b) => crossStart(a) - crossStart(b) || primaryStart(a) - primaryStart(b)));
}

function getPdfJs(): PdfJs | null {
  return (window as Window & { pdfjsLib?: PdfJs }).pdfjsLib || null;
}

function loadPdfJs(): Promise<PdfJs> {
  const current = getPdfJs();
  if (current) return Promise.resolve(current);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-designforge-pdfjs]');
    const script = existing || document.createElement('script');
    const finish = () => { const pdfjs = getPdfJs(); if (pdfjs) { pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js'; resolve(pdfjs); } else reject(new Error('Không thể tải bộ đọc PDF.')); };
    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', () => reject(new Error('Không thể tải bộ đọc PDF.')), { once: true });
    if (!existing) { script.src = '/assets/pdf.min.js'; script.async = true; script.dataset.designforgePdfjs = 'true'; document.head.appendChild(script); }
  });
}

export async function preparePdfForm(bytes: Uint8Array, fields: FormField[], removedSourceNames: Iterable<string>) {
  // Keep imported AcroForm appearance streams as-is. Some valid PDFs omit /DA;
  // pdf-lib's automatic appearance regeneration rejects those fields on save.
  const pdf = await PDFDocument.load(new Uint8Array(bytes), { ignoreEncryption: true });
  const form = pdf.getForm();
  const existingFields = new Map(form.getFields().map(item => [item.getName(), item]));
  const updatedExisting = new Set<string>();
  const embeddedFonts = new Map<PdfFormFont, PDFFont>();
  const getEmbeddedFont = async (family: PdfFormFont) => {
    const current = embeddedFonts.get(family);
    if (current) return current;
    const embedded = await pdf.embedFont(standardFonts[family]);
    embeddedFonts.set(family, embedded);
    return embedded;
  };
  for (const sourceName of removedSourceNames) {
    const source = existingFields.get(sourceName);
    if (source) removePdfFieldSafely(pdf, form, source);
  }
  for (const field of fields) {
    const targetPage = pdf.getPages()[field.page - 1];
    if (!targetPage) continue;
    const pageWidth = targetPage.getWidth();
    const pageHeight = targetPage.getHeight();
    const box = { x: field.x * pageWidth, y: pageHeight - (field.y + field.height) * pageHeight, width: field.width * pageWidth, height: field.height * pageHeight };
    if (field.sourceName) {
      const source = existingFields.get(field.sourceName);
      const widget = source?.acroField.getWidgets()[field.sourceWidgetIndex ?? 0];
      if (source && widget) {
        const sourceStyleField = fields.find(candidate => candidate.sourceName === field.sourceName && candidate.styleDirty && isTextLikeField(candidate));
        widget.setRectangle(box);
        widget.getOrCreateBorderStyle().setWidth(0);
        if (!updatedExisting.has(field.sourceName) && field.name.trim() && field.name !== field.sourceName && !existingFields.has(field.name)) source.acroField.setPartialName(field.name.trim());
        if (!updatedExisting.has(field.sourceName) && source instanceof PDFTextField && sourceStyleField) {
          const family = sourceStyleField.fontFamily || 'helvetica';
          const font = await getEmbeddedFont(family);
          const size = Math.max(4, Math.min(120, sourceStyleField.fontSize || 12));
          const appearance = `0 g /${font.name} ${size} Tf`;
          source.acroField.setDefaultAppearance(appearance);
          source.acroField.getWidgets().forEach(sourceWidget => sourceWidget.setDefaultAppearance(appearance));
          source.setAlignment(textAlignments[sourceStyleField.textAlign || 'left']);
          source.updateAppearances(font);
        }
        updatedExisting.add(field.sourceName);
        continue;
      }
    }
    if (field.type === 'checkbox') form.createCheckBox(field.name).addToPage(targetPage, { ...box, borderWidth: 0 });
    else {
      const family = field.fontFamily || 'helvetica';
      const font = await getEmbeddedFont(family);
      const size = Math.max(4, Math.min(120, field.fontSize || Math.max(8, Math.min(16, box.height * .42))));
      const text = form.createTextField(field.name);
      text.setAlignment(textAlignments[field.textAlign || 'left']);
      text.addToPage(targetPage, { ...box, borderWidth: 0, textColor: rgb(.12, .08, .18), font });
      // addToPage establishes the field's /DA entry before adjusting its size.
      text.setFontSize(size);
      text.updateAppearances(font);
    }
  }
  return pdf.save({ updateFieldAppearances: false });
}

export function PdfPrepareFormWorkspace({ onBack }: { onBack: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const bytesRef = useRef<Uint8Array | null>(null);
  const removedSourceNamesRef = useRef<Set<string>>(new Set());
  const historyRef = useRef<FieldSnapshot[]>([]);
  const clipboardRef = useRef<{ fields: ClipboardField[]; pasteCount: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [page, setPage] = useState(1);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [fieldType, setFieldType] = useState<FormFieldType>('text');
  const [fieldName, setFieldName] = useState('');
  const [bulkPrefix, setBulkPrefix] = useState('field_');
  const [bulkStart, setBulkStart] = useState('1');
  const [bulkOrder, setBulkOrder] = useState<BulkOrder>('row-major');
  const [status, setStatus] = useState('Import PDF để bắt đầu tạo form.');
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [zoom, setZoomState] = useState(1);
  const zoomRef = useRef(1);
  const zoomFrameRef = useRef<number | null>(null);
  const zoomAnchorRef = useRef<{ viewport: HTMLDivElement; pageX: number; pageY: number; cursorX: number; cursorY: number; zoom: number } | null>(null);
  const draftRef = useRef<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const moveRef = useRef<{ startX: number; startY: number; ids: string[]; origins: Record<string, Pick<FormField, 'x' | 'y'>>; historyRecorded: boolean } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; id: string; handle: ResizeHandle; origin: Pick<FormField, 'x' | 'y' | 'width' | 'height'>; historyRecorded: boolean } | null>(null);
  const marqueeRef = useRef<{ startX: number; startY: number; currentX: number; currentY: number; baseIds: string[] } | null>(null);
  const [draft, setDraft] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [marquee, setMarquee] = useState<SelectionBox | null>(null);

  const selected = fields.find(item => item.id === selectedIds[0]) || null;
  const currentPageFields = fields.filter(item => item.page === page);
  const selectedTextFields = currentPageFields.filter(item => selectedIds.includes(item.id) && isTextLikeField(item));
  const selectedTextStyle = selectedTextFields[0] || null;

  const recordHistory = () => {
    historyRef.current.push({ fields: fields.map(item => ({ ...item })), removedSourceNames: [...removedSourceNamesRef.current] });
    if (historyRef.current.length > 80) historyRef.current.shift();
  };

  const undoLast = () => {
    const previous = historyRef.current.pop();
    if (!previous) { setStatus('Không còn thao tác để hoàn tác.'); return; }
    removedSourceNamesRef.current = new Set(previous.removedSourceNames);
    setFields(previous.fields.map(item => ({ ...item })));
    setSelectedIds([]);
    setFieldName('');
    setStatus('Đã hoàn tác thao tác gần nhất.');
  };

  const copySelected = () => {
    const copied = selectedIds.map(id => fields.find(item => item.id === id)).filter((item): item is FormField => Boolean(item));
    if (!copied.length) return;
    clipboardRef.current = { fields: copied.map(({ type, name, x, y, width, height, fontFamily, fontSize, textAlign }) => ({ type, name, x, y, width, height, fontFamily, fontSize, textAlign })), pasteCount: 0 };
    setStatus(`Đã sao chép ${copied.length} trường. Nhấn Ctrl + V để dán.`);
  };

  const pasteCopied = () => {
    const clipboard = clipboardRef.current;
    if (!file || !clipboard?.fields.length) return;
    recordHistory();
    const additions = duplicateFormFields(clipboard.fields, fields, page, clipboard.pasteCount);
    clipboard.pasteCount += 1;
    setFields(current => [...current, ...additions]);
    setSelectedIds(additions.map(item => item.id));
    setFieldName(additions.length === 1 ? additions[0].name : '');
    setStatus(`Đã dán ${additions.length} trường với hậu tố “_copy”.`);
  };

  const setZoom = (next: number | ((current: number) => number)) => {
    if (zoomFrameRef.current !== null) {
      cancelAnimationFrame(zoomFrameRef.current);
      zoomFrameRef.current = null;
    }
    const value = typeof next === 'function' ? next(zoomRef.current) : next;
    zoomRef.current = value;
    zoomAnchorRef.current = null;
    setZoomState(value);
  };

  const updateZoom = (next: number) => {
    const value = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(next.toFixed(3))));
    zoomRef.current = value;
    zoomAnchorRef.current = null;
    setZoom(value);
  };

  useLayoutEffect(() => {
    const anchor = zoomAnchorRef.current;
    if (!anchor || anchor.zoom !== zoom) return;
    anchor.viewport.scrollLeft = Math.max(0, anchor.pageX * zoom - anchor.cursorX);
    anchor.viewport.scrollTop = Math.max(0, anchor.pageY * zoom - anchor.cursorY);
    zoomAnchorRef.current = null;
  }, [zoom]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => () => {
    if (zoomFrameRef.current !== null) cancelAnimationFrame(zoomFrameRef.current);
  }, []);

  useEffect(() => {
    if (!selected) return;
    setFieldName(selected.name);
    setFieldType(selected.type);
  }, [selected?.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      const key = event.key.toLocaleLowerCase();
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && key === 'c') {
        if (!selectedIds.length) return;
        event.preventDefault();
        copySelected();
        return;
      }
      if (modifier && key === 'v') {
        if (!clipboardRef.current?.fields.length) return;
        event.preventDefault();
        pasteCopied();
        return;
      }
      if (modifier && key === 'z') {
        event.preventDefault();
        undoLast();
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (!selectedIds.length) return;
        event.preventDefault();
        recordHistory();
        fields.filter(item => selectedIds.includes(item.id)).forEach(item => { if (item.sourceName) removedSourceNamesRef.current.add(item.sourceName); });
        setFields(current => current.filter(item => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        setFieldName('');
      }
      if (event.key === 'Escape') { setSelectedIds([]); setDraft(null); setMarquee(null); draftRef.current = null; marqueeRef.current = null; moveRef.current = null; resizeRef.current = null; }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIds, fields, file, page]);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      const bytes = bytesRef.current;
      const canvas = canvasRef.current;
      if (!bytes || !canvas) return;
      try {
        const pdfjs = await loadPdfJs();
        const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise;
        const pdfPage = await doc.getPage(page);
        const base = pdfPage.getViewport({ scale: 1 });
        const parentWidth = pageRef.current?.clientWidth || 620;
        const scale = Math.min(1.35, Math.max(.55, (parentWidth - 2) / base.width));
        const viewport = pdfPage.getViewport({ scale });
        if (cancelled) return;
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        canvas.style.aspectRatio = `${base.width} / ${base.height}`;
        await pdfPage.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : 'Không thể hiển thị trang PDF.');
      }
    };
    void render();
    return () => { cancelled = true; };
  }, [page, file]);

  const loadFile = async (next?: File) => {
    if (!next || next.type !== 'application/pdf' && !/\.pdf$/i.test(next.name)) { setStatus('Vui lòng chọn file PDF hợp lệ.'); return; }
    setBusy(true); setStatus('Đang mở PDF…');
    try {
      const bytes = new Uint8Array(await next.arrayBuffer());
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const first = pdf.getPages()[0];
      if (!first) throw new Error('PDF không có trang nào.');
      const pages = pdf.getPages();
      const pageRefs = new Map(pages.map((pdfPage, index) => [pdfPage.ref.toString(), index]));
      const importedFields: FormField[] = [];
      const form = pdf.getForm();
      form.getFields().forEach(field => {
        const fieldName = field.getName().trim() || `field_${importedFields.length + 1}`;
        const type: FormFieldType = field instanceof PDFCheckBox || field instanceof PDFRadioGroup ? 'checkbox' : field instanceof PDFSignature ? 'signature' : 'text';
        field.acroField.getWidgets().forEach((widget, sourceWidgetIndex) => {
          let pageIndex = pageRefs.get(widget.P()?.toString() || '');
          if (pageIndex === undefined) {
            const findWidgetPage = (form as unknown as { findWidgetPage?: (target: unknown) => { ref: { toString: () => string } } }).findWidgetPage;
            try {
              const resolvedPage = findWidgetPage?.call(form, widget);
              pageIndex = resolvedPage ? pageRefs.get(resolvedPage.ref.toString()) : undefined;
            } catch {
              pageIndex = undefined;
            }
          }
          if (pageIndex === undefined) return;
          const targetPage = pages[pageIndex];
          const { x: mediaX, y: mediaY, width: pageWidth, height: pageHeight } = targetPage.getMediaBox();
          const rectangle = widget.getRectangle();
          const x = Math.max(0, Math.min(1, (rectangle.x - mediaX) / pageWidth));
          const y = Math.max(0, Math.min(1, 1 - (rectangle.y + rectangle.height - mediaY) / pageHeight));
          const width = Math.max(.025, Math.min(1 - x, rectangle.width / pageWidth));
          const height = Math.max(.018, Math.min(1 - y, rectangle.height / pageHeight));
          const textStyle = field instanceof PDFTextField ? readImportedTextStyle(field, widget.getDefaultAppearance()) : {};
          importedFields.push({ id: `imported-${pageIndex + 1}-${fieldName}-${sourceWidgetIndex}-${importedFields.length}`, type, name: fieldName, page: pageIndex + 1, x, y, width, height, ...textStyle, sourceName: fieldName, sourceWidgetIndex });
        });
      });
      removedSourceNamesRef.current.clear();
      historyRef.current = [];
      clipboardRef.current = null;
      marqueeRef.current = null;
      bytesRef.current = bytes;
      setFile(next); setFields(importedFields); setSelectedIds([]); setMarquee(null); setPage(1); updateZoom(1);
      setPageInfo({ width: first.getWidth(), height: first.getHeight(), count: pdf.getPageCount() });
      setStatus(importedFields.length ? `${pdf.getPageCount()} trang · Đã nạp ${importedFields.length} trường có sẵn · Kéo trên trang để thêm trường.` : `${pdf.getPageCount()} trang · Kéo trên trang để tạo trường form.`);
    } catch (error) {
      bytesRef.current = null; setFile(null); setPageInfo(null); setStatus(error instanceof Error ? error.message : 'Không thể đọc PDF.');
    } finally { setBusy(false); }
  };

  const pointOnPage = (event: ReactPointerEvent<HTMLElement>) => {
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
  };
  const onCanvasWheel = (event: WheelEvent) => {
    event.preventDefault();
    const viewport = event.currentTarget as HTMLDivElement;
    const viewportRect = viewport.getBoundingClientRect();
    const cursorX = event.clientX - viewportRect.left;
    const cursorY = event.clientY - viewportRect.top;
    const oldZoom = zoomRef.current;
    const deltaUnit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
    const normalizedDelta = Math.max(-80, Math.min(80, event.deltaY * deltaUnit));
    const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number((oldZoom * Math.exp(-normalizedDelta * .0009)).toFixed(3))));
    if (nextZoom === oldZoom) return;
    const pending = zoomAnchorRef.current;
    const pageX = pending?.viewport === viewport ? pending.pageX : (viewport.scrollLeft + cursorX) / oldZoom;
    const pageY = pending?.viewport === viewport ? pending.pageY : (viewport.scrollTop + cursorY) / oldZoom;
    zoomRef.current = nextZoom;
    zoomAnchorRef.current = { viewport, pageX, pageY, cursorX, cursorY, zoom: nextZoom };
    if (zoomFrameRef.current === null) {
      zoomFrameRef.current = requestAnimationFrame(() => {
        zoomFrameRef.current = null;
        const pendingZoom = zoomRef.current;
        if (zoomAnchorRef.current) zoomAnchorRef.current.zoom = pendingZoom;
        setZoomState(pendingZoom);
      });
    }
  };
  useEffect(() => {
    const viewport = canvasScrollRef.current;
    if (!viewport) return;
    viewport.addEventListener('wheel', onCanvasWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onCanvasWheel);
  }, []);
  const startDraw = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!file || (event.target as HTMLElement).closest('[data-form-field]')) return;
    const point = pointOnPage(event);
    if (event.ctrlKey || event.metaKey) {
      marqueeRef.current = { startX: point.x, startY: point.y, currentX: point.x, currentY: point.y, baseIds: [...selectedIds] };
      setMarquee({ x: point.x, y: point.y, width: 0, height: 0 });
      pageRef.current?.setPointerCapture(event.pointerId);
      event.preventDefault();
      return;
    }
    setSelectedIds([]);
    setFieldName('');
    draftRef.current = { startX: point.x, startY: point.y, currentX: point.x, currentY: point.y }; setDraft({ x: point.x, y: point.y, width: 0, height: 0 }); pageRef.current?.setPointerCapture(event.pointerId);
  };
  const moveDraw = (event: ReactPointerEvent<HTMLDivElement>) => {
    const activeMarquee = marqueeRef.current;
    if (activeMarquee) {
      const point = pointOnPage(event);
      activeMarquee.currentX = point.x;
      activeMarquee.currentY = point.y;
      const box = { x: Math.min(activeMarquee.startX, point.x), y: Math.min(activeMarquee.startY, point.y), width: Math.abs(point.x - activeMarquee.startX), height: Math.abs(point.y - activeMarquee.startY) };
      const hits = fieldIdsInsideSelection(fields, page, box);
      setMarquee(box);
      setSelectedIds([...new Set([...activeMarquee.baseIds, ...hits])]);
      return;
    }
    const resize = resizeRef.current;
    if (resize) {
      const point = pointOnPage(event); const dx = point.x - resize.startX; const dy = point.y - resize.startY; const origin = resize.origin;
      if (!resize.historyRecorded && (Math.abs(dx) > .0005 || Math.abs(dy) > .0005)) { recordHistory(); resize.historyRecorded = true; }
      setFields(current => current.map(item => {
        if (item.id !== resize.id) return item;
        const minWidth = .025; const minHeight = .018;
        let x = origin.x; let y = origin.y; let width = origin.width; let height = origin.height;
        if (resize.handle.includes('w')) { x = Math.max(0, Math.min(origin.x + origin.width - minWidth, origin.x + dx)); width = origin.width + origin.x - x; }
        if (resize.handle.includes('e')) width = Math.max(minWidth, Math.min(1 - origin.x, origin.width + dx));
        if (resize.handle.includes('n')) { y = Math.max(0, Math.min(origin.y + origin.height - minHeight, origin.y + dy)); height = origin.height + origin.y - y; }
        if (resize.handle.includes('s')) height = Math.max(minHeight, Math.min(1 - origin.y, origin.height + dy));
        return { ...item, x, y, width, height };
      }));
      return;
    }
    const move = moveRef.current;
    if (move) {
      const point = pointOnPage(event); const dx = point.x - move.startX; const dy = point.y - move.startY;
      if (!move.historyRecorded && (Math.abs(dx) > .0005 || Math.abs(dy) > .0005)) { recordHistory(); move.historyRecorded = true; }
      setFields(current => current.map(item => move.ids.includes(item.id) ? { ...item, x: Math.max(0, Math.min(1 - item.width, move.origins[item.id].x + dx)), y: Math.max(0, Math.min(1 - item.height, move.origins[item.id].y + dy)) } : item));
      return;
    }
    const current = draftRef.current; if (!current) return;
    const point = pointOnPage(event); current.currentX = point.x; current.currentY = point.y;
    setDraft({ x: Math.min(current.startX, point.x), y: Math.min(current.startY, point.y), width: Math.abs(point.x - current.startX), height: Math.abs(point.y - current.startY) });
  };
  const endDraw = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (marqueeRef.current) { marqueeRef.current = null; setMarquee(null); pageRef.current?.releasePointerCapture?.(event.pointerId); return; }
    if (resizeRef.current) { resizeRef.current = null; pageRef.current?.releasePointerCapture?.(event.pointerId); return; }
    if (moveRef.current) { moveRef.current = null; pageRef.current?.releasePointerCapture?.(event.pointerId); return; }
    const current = draftRef.current; if (!current) return; draftRef.current = null; setDraft(null);
    const x = Math.min(current.startX, current.currentX); const y = Math.min(current.startY, current.currentY); const width = Math.abs(current.currentX - current.startX); const height = Math.abs(current.currentY - current.startY);
    if (width < .025 || height < .018) { pageRef.current?.releasePointerCapture?.(event.pointerId); return; }
    const id = `field-${Date.now()}`;
    const requestedName = fieldName.trim() || `${fieldType}_${fields.length + 1}`;
    const name = uniqueFieldName(requestedName, fields);
    recordHistory();
    setFields(currentFields => [...currentFields, { id, type: fieldType, name, page, x, y, width, height, ...(isTextLikeField({ type: fieldType }) ? { fontFamily: 'helvetica' as PdfFormFont, fontSize: 12, textAlign: 'left' as PdfTextAlign, styleDirty: true } : {}) }]); setSelectedIds([id]); setFieldName(name);
    if (name !== requestedName) setStatus(`Tên “${requestedName}” đã tồn tại, đã đổi thành “${name}”.`);
    pageRef.current?.releasePointerCapture?.(event.pointerId);
  };
  const cancelDraw = (event: ReactPointerEvent<HTMLDivElement>) => {
    draftRef.current = null; marqueeRef.current = null; moveRef.current = null; resizeRef.current = null; setDraft(null); setMarquee(null); pageRef.current?.releasePointerCapture?.(event.pointerId);
  };
  const selectField = (id: string, additive = false) => setSelectedIds(current => additive ? current.includes(id) ? current.filter(item => item !== id) : [...current, id] : [id]);
  const startMove = (event: ReactPointerEvent<HTMLButtonElement>, field: FormField) => {
    const additive = event.shiftKey || event.ctrlKey || event.metaKey;
    const ids = additive ? (selectedIds.includes(field.id) ? selectedIds : [...selectedIds, field.id]) : selectedIds.includes(field.id) ? selectedIds : [field.id];
    const movableIds = ids.filter(id => fields.some(item => item.id === id && item.page === page));
    setSelectedIds(ids);
    const point = pointOnPage(event); const origins = Object.fromEntries(fields.filter(item => movableIds.includes(item.id)).map(item => [item.id, { x: item.x, y: item.y }])) as Record<string, Pick<FormField, 'x' | 'y'>>;
    moveRef.current = { startX: point.x, startY: point.y, ids: movableIds, origins, historyRecorded: false }; pageRef.current?.setPointerCapture(event.pointerId); event.stopPropagation();
  };
  const startResize = (event: ReactPointerEvent<HTMLSpanElement>, field: FormField, handle: ResizeHandle) => {
    const point = pointOnPage(event);
    setSelectedIds([field.id]);
    resizeRef.current = { startX: point.x, startY: point.y, id: field.id, handle, origin: { x: field.x, y: field.y, width: field.width, height: field.height }, historyRecorded: false };
    pageRef.current?.setPointerCapture(event.pointerId); event.stopPropagation(); event.preventDefault();
  };
  const commitFieldName = () => {
    if (selectedIds.length !== 1) return;
    const selectedId = selectedIds[0];
    const currentField = fields.find(item => item.id === selectedId);
    if (!currentField) return;
    const requestedName = fieldName.trim() || `${currentField.type}_1`;
    const relatedIds = currentField.sourceName
      ? fields.filter(item => item.sourceName === currentField.sourceName).map(item => item.id)
      : [selectedId];
    const name = uniqueFieldName(requestedName, fields, relatedIds);
    if (relatedIds.every(id => fields.find(item => item.id === id)?.name === name)) { setFieldName(name); return; }
    recordHistory();
    setFields(current => current.map(item => relatedIds.includes(item.id) ? { ...item, name } : item));
    setFieldName(name);
    if (name !== requestedName) setStatus(`Tên “${requestedName}” đã tồn tại, đã đổi thành “${name}”.`);
  };
  const bulkRename = () => {
    const selectedFields = selectedIds.map(id => fields.find(item => item.id === id)).filter((item): item is FormField => Boolean(item));
    if (selectedFields.length < 2) return;
    const parsedStart = Number.parseInt(bulkStart, 10);
    const start = Number.isFinite(parsedStart) ? parsedStart : 1;
    const orderedFields = orderFieldsForBulkRename(selectedFields, bulkOrder);
    const selectedSet = new Set(orderedFields.map(item => item.id));
    const outside = fields.filter(item => !selectedSet.has(item.id));
    const assigned: FormField[] = [];
    const names = orderedFields.map((field, index) => {
      const requestedName = `${bulkPrefix}${start + index}`.trim() || `field_${start + index}`;
      const name = uniqueFieldName(requestedName, [...outside, ...assigned]);
      assigned.push({ ...field, name });
      return name;
    });
    recordHistory();
    setFields(current => current.map(field => {
      const selectedIndex = orderedFields.findIndex(item => item.id === field.id);
      return selectedIndex === -1 ? field : { ...field, name: names[selectedIndex] };
    }));
    setFieldName('');
    setStatus(`Đã đổi tên ${orderedFields.length} trường theo thứ tự ${bulkOrder === 'row-major' ? 'trái qua phải, từ trên xuống dưới' : 'trên xuống dưới, từ trái qua phải'}.`);
  };
  const removeSelected = () => { if (!selectedIds.length) return; recordHistory(); fields.filter(item => selectedIds.includes(item.id)).forEach(item => { if (item.sourceName) removedSourceNamesRef.current.add(item.sourceName); }); setFields(current => current.filter(item => !selectedIds.includes(item.id))); setSelectedIds([]); setFieldName(''); };
  const updateSelectedTextStyle = (patch: Partial<Pick<FormField, 'fontFamily' | 'fontSize' | 'textAlign'>>) => {
    if (!selectedTextFields.length) return;
    const activeIds = new Set(selectedTextFields.map(item => item.id));
    recordHistory();
    setFields(current => current.map(item => activeIds.has(item.id) ? { ...item, ...patch, styleDirty: true } : item));
  };
  const alignSelected = (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const active = fields.filter(item => selectedIds.includes(item.id) && item.page === page); if (active.length < 2) return;
    const left = Math.min(...active.map(item => item.x)); const right = Math.max(...active.map(item => item.x + item.width)); const top = Math.min(...active.map(item => item.y)); const bottom = Math.max(...active.map(item => item.y + item.height));
    recordHistory();
    setFields(current => current.map(item => {
      if (!selectedIds.includes(item.id) || item.page !== page) return item;
      const x = direction === 'left' ? left : direction === 'right' ? right - item.width : direction === 'center' ? (left + right - item.width) / 2 : item.x;
      const y = direction === 'top' ? top : direction === 'bottom' ? bottom - item.height : direction === 'middle' ? (top + bottom - item.height) / 2 : item.y;
      return { ...item, x: Math.max(0, Math.min(1 - item.width, x)), y: Math.max(0, Math.min(1 - item.height, y)) };
    }));
  };
  const distributeSelected = (axis: 'horizontal' | 'vertical') => {
    const active = fields.filter(item => selectedIds.includes(item.id) && item.page === page);
    if (active.length < 3) return;
    const ordered = [...active].sort((a, b) => axis === 'horizontal' ? (a.x - b.x || a.y - b.y) : (a.y - b.y || a.x - b.x));
    const start = axis === 'horizontal' ? ordered[0].x : ordered[0].y;
    const end = axis === 'horizontal' ? ordered[ordered.length - 1].x + ordered[ordered.length - 1].width : ordered[ordered.length - 1].y + ordered[ordered.length - 1].height;
    const occupied = ordered.reduce((total, item) => total + (axis === 'horizontal' ? item.width : item.height), 0);
    const gap = Math.max(0, (end - start - occupied) / (ordered.length - 1));
    recordHistory();
    let cursor = start;
    const positions = new Map(ordered.map(item => {
      const position = cursor;
      cursor += (axis === 'horizontal' ? item.width : item.height) + gap;
      return [item.id, position];
    }));
    setFields(current => current.map(item => {
      const position = positions.get(item.id);
      if (position === undefined) return item;
      return axis === 'horizontal' ? { ...item, x: Math.max(0, Math.min(1 - item.width, position)) } : { ...item, y: Math.max(0, Math.min(1 - item.height, position)) };
    }));
  };
  const exportForm = async () => {
    const bytes = bytesRef.current; if (!bytes || !fields.length) { setStatus('Hãy import PDF và tạo ít nhất một trường form.'); return; }
    setBusy(true); setStatus('Đang tạo form PDF…');
    try {
      const output = await preparePdfForm(bytes, fields, removedSourceNamesRef.current);
      if (!output.byteLength) throw new Error('PDF xuất ra không có dữ liệu.');
      downloadPdf(output, `${file?.name.replace(/\.pdf$/i, '') || 'document'}-form.pdf`); setStatus(`Đã tạo ${fields.length} trường form có thể điền.`);
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Không thể tạo form PDF.'); } finally { setBusy(false); }
  };

  return <div className="pdf-form-page">
    <button className="back-link" onClick={onBack}><Icon name="arrow" size={16}/> Tất cả công cụ</button>
    <div className="pdf-form-heading"><div><p className="eyebrow">PDF PREPARE FORM</p><h1>Tạo form cho PDF</h1><p>Import tài liệu, kéo khung trường lên từng trang rồi tải xuống PDF có thể điền như Acrobat.</p></div><span className="availability availability-ready"><span className="status-dot"/> Chạy trên thiết bị</span></div>
    <div className="pdf-form-workspace">
      <aside className="pdf-form-sidebar" aria-label="Công cụ tạo form">
        <input ref={inputRef} className="visually-hidden" type="file" accept="application/pdf,.pdf" onChange={event => { void loadFile(event.target.files?.[0]); event.target.value = ''; }}/>
        <button className="pdf-form-import" type="button" onClick={() => inputRef.current?.click()}><Icon name="file" size={20}/><span><strong>{file ? file.name : 'Import file PDF'}</strong><small>{file ? `${pageInfo?.count || 0} trang · ${fields.length} trường` : 'Chọn một file để bắt đầu'}</small></span><Icon name="arrow" size={17}/></button>
        <div className="pdf-form-sidebar-section"><p className="pdf-form-section-title">Loại trường</p><div className="pdf-form-type-grid">{(Object.keys(fieldLabels) as FormFieldType[]).map(type => <button key={type} className={fieldType === type ? 'is-active' : ''} type="button" onClick={() => setFieldType(type)}><span className={`pdf-form-type-icon is-${type}`}>{type === 'checkbox' ? '✓' : type === 'signature' ? '∿' : type === 'date' ? '◷' : 'T'}</span>{fieldLabels[type]}</button>)}</div><p className="pdf-form-help">Chọn loại rồi kéo trên trang để tạo khung.</p></div>
        <div className="pdf-form-sidebar-section"><label className="pdf-form-label" htmlFor="pdf-form-field-name">Tên trường đang chọn</label><input id="pdf-form-field-name" className="pdf-form-name" value={selectedIds.length === 1 ? fieldName : ''} disabled={selectedIds.length !== 1} placeholder={selectedIds.length === 1 ? 'Ví dụ: full_name' : 'Chọn một trường để đổi tên'} onChange={event => setFieldName(event.target.value)} onBlur={commitFieldName} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); commitFieldName(); } }}/>{selectedIds.length > 0 && <button className="pdf-form-remove" type="button" onClick={removeSelected}>{selectedIds.length === 1 ? 'Xóa trường này' : `Xóa ${selectedIds.length} trường đã chọn`}</button>}<p className="pdf-form-help">Tên trường không được trùng; tên trùng sẽ tự thêm số thứ tự.</p></div>
        {selectedIds.length > 1 && <div className="pdf-form-sidebar-section pdf-form-bulk-rename"><div className="pdf-form-bulk-heading"><label className="pdf-form-label" htmlFor="pdf-form-bulk-prefix">Đổi tên hàng loạt</label><span>{selectedIds.length} trường đã chọn</span></div><label className="pdf-form-bulk-label" htmlFor="pdf-form-bulk-prefix">Tiền tố</label><input id="pdf-form-bulk-prefix" className="pdf-form-name" value={bulkPrefix} onChange={event => setBulkPrefix(event.target.value)} placeholder="Ví dụ: product_"/><label className="pdf-form-bulk-label" htmlFor="pdf-form-bulk-start">Bắt đầu từ</label><input id="pdf-form-bulk-start" className="pdf-form-name" type="number" inputMode="numeric" value={bulkStart} onChange={event => setBulkStart(event.target.value)} min="0"/><label className="pdf-form-bulk-label" htmlFor="pdf-form-bulk-order">Thứ tự đánh số</label><select id="pdf-form-bulk-order" className="pdf-form-name" value={bulkOrder} onChange={event => setBulkOrder(event.target.value as BulkOrder)}><option value="row-major">Trái qua phải, từ trên xuống dưới</option><option value="column-major">Trên xuống dưới, từ trái qua phải</option></select><p className="pdf-form-help">Mẫu: {bulkPrefix || 'field_'}{bulkStart || '1'}, sau đó tăng dần theo thứ tự đã chọn.</p><button className="secondary-button pdf-form-bulk-apply" type="button" onClick={bulkRename}>Áp dụng tên hàng loạt</button></div>}
        <div className="pdf-form-sidebar-section pdf-form-summary"><div><span>Trang</span><strong>{pageInfo ? `${page} / ${pageInfo.count}` : '—'}</strong></div><div><span>Trường đã tạo</span><strong>{fields.length}</strong></div></div>
        <button className="primary-button pdf-form-export" type="button" disabled={!file || !fields.length || busy} onClick={() => void exportForm()}>{busy ? 'Đang xử lý…' : 'Tải PDF form'}</button>
        <p className="pdf-form-status" role="status">{status}</p>
      </aside>
      <section className="pdf-form-canvas-panel" aria-label="Trang PDF để đặt trường form">
        <div className="pdf-form-canvas-toolbar">
          <div className="pdf-form-canvas-title"><strong>{file ? `Trang ${page}` : 'Khu vực làm việc'}</strong><span>{file ? 'Kéo để vẽ · Ctrl + kéo để quét chọn · lăn chuột để zoom' : 'Chưa có PDF được chọn'}</span></div>
          {selectedTextStyle && <div className="pdf-form-text-toolbar" aria-label={`Định dạng ${selectedTextFields.length} trường văn bản`}>
            <label className="pdf-form-text-control pdf-form-font-control"><span>Phông chữ</span><select value={selectedTextStyle.fontFamily || 'helvetica'} onChange={event => updateSelectedTextStyle({ fontFamily: event.target.value as PdfFormFont })}>{(Object.keys(fontLabels) as PdfFormFont[]).map(font => <option key={font} value={font}>{fontLabels[font]}</option>)}</select></label>
            <label className="pdf-form-text-control pdf-form-size-control"><span>Cỡ chữ</span><input type="number" inputMode="decimal" min="4" max="120" step="1" value={selectedTextStyle.fontSize || 12} onChange={event => { const value = Number(event.target.value); if (Number.isFinite(value) && value >= 4 && value <= 120) updateSelectedTextStyle({ fontSize: value }); }}/></label>
            <div className="pdf-form-text-align" role="group" aria-label="Căn chữ">
              {(['left', 'center', 'right'] as PdfTextAlign[]).map(alignment => <button key={alignment} type="button" className={(selectedTextStyle.textAlign || 'left') === alignment ? 'is-active' : ''} onClick={() => updateSelectedTextStyle({ textAlign: alignment })} aria-label={alignment === 'left' ? 'Căn chữ trái' : alignment === 'center' ? 'Căn chữ giữa' : 'Căn chữ phải'} title={alignment === 'left' ? 'Căn chữ trái' : alignment === 'center' ? 'Căn chữ giữa' : 'Căn chữ phải'} aria-pressed={(selectedTextStyle.textAlign || 'left') === alignment}><span className={`pdf-form-text-align-icon is-${alignment}`} aria-hidden="true"><i/><i/><i/></span></button>)}
            </div>
          </div>}
          <div className="pdf-form-toolbar-actions"><div className="pdf-form-align-toolbar pdf-form-canvas-align-toolbar" aria-label="Căn chỉnh trường đã chọn">{([['left', 'Căn trái', '↤'], ['center', 'Căn giữa', '↔'], ['right', 'Căn phải', '↦'], ['top', 'Căn trên', '↥'], ['middle', 'Căn giữa dọc', '↕'], ['bottom', 'Căn dưới', '↧']] as const).map(([direction, label, icon]) => <button key={direction} type="button" disabled={currentPageFields.filter(item => selectedIds.includes(item.id)).length < 2} onClick={() => alignSelected(direction)} aria-label={label} title={label}>{icon}</button>)}{([['horizontal', 'Canh đều ngang', '⇥'], ['vertical', 'Canh đều dọc', '⇵']] as const).map(([axis, label, icon]) => <button key={axis} type="button" disabled={currentPageFields.filter(item => selectedIds.includes(item.id)).length < 3} onClick={() => distributeSelected(axis)} aria-label={label} title={`${label} (cần ít nhất 3 trường)`}>{icon}</button>)}</div><div className="pdf-form-page-nav"><button type="button" disabled={!pageInfo || page <= 1} onClick={() => setPage(current => current - 1)} aria-label="Trang trước">←</button><button type="button" disabled={!pageInfo || page >= (pageInfo?.count || 1)} onClick={() => setPage(current => current + 1)} aria-label="Trang sau">→</button></div><div className="pdf-form-zoom-controls" aria-label="Thu phóng"><button type="button" onClick={() => setZoom(current => Math.max(MIN_ZOOM, Number((current - .1).toFixed(1))))} aria-label="Thu nhỏ">−</button><output>{Math.round(zoom * 100)}%</output><button type="button" onClick={() => setZoom(current => Math.min(MAX_ZOOM, Number((current + .1).toFixed(1))))} aria-label="Phóng to">+</button><button className="pdf-form-zoom-reset" type="button" onClick={() => setZoom(1)}>Đặt lại</button></div></div>
        </div>
        <div ref={canvasScrollRef} className={`pdf-form-canvas-scroll ${dragging ? 'is-dragging' : ''}`} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); void loadFile(event.dataTransfer.files[0]); }}>
          {file ? <div className="pdf-form-page-zoom-shell" style={{ width: `${zoom * 100}%`, aspectRatio: pageInfo ? `${pageInfo.width} / ${pageInfo.height}` : '1 / 1' }}>
            <div ref={pageRef} className="pdf-form-page-preview" style={{ width: `${100 / zoom}%`, height: `${100 / zoom}%`, transform: `scale(${zoom})`, transformOrigin: 'top left', '--pdf-form-handle-size': `${7 / zoom}px`, '--pdf-form-handle-offset': `${-3.5 / zoom}px`, '--pdf-form-handle-radius': `${2 / zoom}px`, '--pdf-form-outline-width': `${1 / zoom}px`, '--pdf-form-label-size': `${11 / zoom}px`, '--pdf-form-label-padding-y': `${3 / zoom}px`, '--pdf-form-label-padding-x': `${6 / zoom}px`, '--pdf-form-field-radius': `${4 / zoom}px`, '--pdf-form-checkbox-size': `${17 / zoom}px`, '--pdf-form-signature-size': `${16 / zoom}px` } as CSSProperties} onPointerDown={startDraw} onPointerMove={moveDraw} onPointerUp={endDraw} onPointerCancel={cancelDraw}>
            <canvas ref={canvasRef} />
            {currentPageFields.map(field => <button key={field.id} type="button" data-form-field className={`pdf-form-field-overlay is-${field.type} ${selectedIds.includes(field.id) ? 'is-selected' : ''}`} style={{ left: `${field.x * 100}%`, top: `${field.y * 100}%`, width: `${field.width * 100}%`, height: `${field.height * 100}%` }} onPointerDown={event => startMove(event, field)} onClick={event => { if (event.detail === 0) selectField(field.id, event.shiftKey); }} aria-label={`${fieldLabels[field.type]} ${field.name}`}>{field.type === 'checkbox' ? '✓' : field.name}{selectedIds.length === 1 && selectedIds.includes(field.id) && (['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as ResizeHandle[]).map(handle => <span key={handle} className={`pdf-form-resize-handle is-${handle}`} role="presentation" onPointerDown={event => startResize(event, field, handle)} />)}</button>)}
            {draft && <div className="pdf-form-field-draft" style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%`, width: `${draft.width * 100}%`, height: `${draft.height * 100}%` }} />}
            {marquee && <div className="pdf-form-selection-marquee" aria-hidden="true" style={{ left: `${marquee.x * 100}%`, top: `${marquee.y * 100}%`, width: `${marquee.width * 100}%`, height: `${marquee.height * 100}%` }} />}
            </div>
          </div> : <button className="pdf-form-empty" type="button" onClick={() => inputRef.current?.click()}><span className="pdf-form-empty-icon"><Icon name="file" size={25}/></span><strong>Thả PDF vào đây</strong><small>hoặc bấm để chọn file từ thiết bị</small></button>}
        </div>
      </section>
      <aside className="pdf-form-layers-panel" aria-label="Danh sách trường form">
        <div className="pdf-form-layers-heading"><div><p className="pdf-form-section-title">LỚP &amp; TRƯỜNG</p><strong>{fields.length} trường</strong></div><button className="pdf-form-layers-select" type="button" disabled={!currentPageFields.length} onClick={() => setSelectedIds(currentPageFields.map(item => item.id))}>Chọn trang</button></div>
        <div className="pdf-form-layer-list">{fields.length ? fields.map(field => <button key={field.id} type="button" className={`pdf-form-layer-item ${selectedIds.includes(field.id) ? 'is-selected' : ''}`} onClick={event => { if (field.page !== page) setPage(field.page); selectField(field.id, event.shiftKey); }}><span className={`pdf-form-layer-type is-${field.type}`}>{field.type === 'checkbox' ? '✓' : field.type === 'signature' ? '∿' : field.type === 'date' ? '◷' : 'T'}</span><span className="pdf-form-layer-copy"><strong>{field.name}</strong><small>{fieldHints[field.type]} · Trang {field.page}</small></span><span className="pdf-form-layer-position">{Math.round(field.x * 100)}%</span></button>) : <p className="pdf-form-layer-empty">Chưa có trường nào. Kéo trên trang PDF để thêm.</p>}</div>
        <div className="pdf-form-layer-help"><span>Ctrl + kéo để quét chọn</span><span>Ctrl + C / Ctrl + V để nhân bản</span><span>Ctrl + Z để hoàn tác</span><span>Delete để xóa</span></div>
      </aside>
    </div>
  </div>;
}
