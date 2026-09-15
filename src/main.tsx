import { StrictMode, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent as ReactDragEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { allCatalog, resources, skills, tools } from './data/catalog';
import type { CatalogItem, IconName, ToolDefinition } from './domain/types';
import { localCatalogRepository } from './repositories/catalog';
import { readSaved, writeSaved } from './repositories/saved';
import { Icon } from './components/Icon';
import { barcodeFormats, MAX_BARCODE_INPUTS, normalizeBarcodeValue, type BarcodeExportFormat, type BarcodeFormatId } from './features/barcode/engine';
import { createBarcodeExport, downloadGeneratedFiles } from './features/barcode/exporter';
import { combineImagesToPdf, downloadPdf, mergePdfFiles, type ImagePaperSize, type PdfQuality } from './features/pdf/exporter';
import { buildHalftoneSvg, createHalftoneDots, drawHalftoneDot, pxToMm, type HalftoneSettings, type HalftoneShape } from './features/image-filter/engine';
import { PromptLibraryPage } from './features/prompts/PromptLibraryPage';
import './styles.css';

type View = 'discover' | 'tools' | 'resources' | 'skills' | 'prompts' | 'saved';
type ToolState = { slug: string } | null;
type ToolCollection = 'all' | 'barcode' | 'pdf' | 'image-filter';

const toolCollectionIds: ToolCollection[] = ['all', 'barcode', 'pdf', 'image-filter'];

const nav: { view: View; label: string; icon: IconName }[] = [
  { view: 'discover', label: 'Khám phá', icon: 'spark' },
  { view: 'tools', label: 'Công cụ', icon: 'sliders' },
  { view: 'resources', label: 'Tài nguyên', icon: 'layers' },
  { view: 'skills', label: 'Skill', icon: 'pen' },
  { view: 'prompts', label: 'Prompt', icon: 'scan' },
];

function getRoute(): { view: View; tool: ToolState; collection?: ToolCollection } {
  const [path, query = ''] = window.location.hash.replace(/^#\/?/, '').split('?');
  const requestedCollection = new URLSearchParams(query).get('collection');
  const collection = toolCollectionIds.includes(requestedCollection as ToolCollection) ? requestedCollection as ToolCollection : undefined;
  if (path.startsWith('tools/')) return { view: 'tools', tool: { slug: path.slice(6) }, collection };
  const view = ['discover', 'tools', 'resources', 'skills', 'prompts', 'saved'].includes(path) ? path as View : 'discover';
  return { view, tool: null, collection };
}

function go(view: View, tool?: string) {
  window.location.hash = tool ? `/tools/${tool}` : `/${view === 'discover' ? '' : view}`;
}

function App() {
  const [route, setRoute] = useState(getRoute);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>(readSaved);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onHash = () => { setRoute(getRoute()); setMobileOpen(false); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => writeSaved(savedIds), [savedIds]);

  const toggleSaved = (id: string) => setSavedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const openTool = (slug: string) => slug === 'barcode' ? go('tools') : go('tools', slug);
  const activeToolSlug = route.tool?.slug;
  const activeTool = activeToolSlug ? tools.find(item => item.slug === activeToolSlug) : undefined;

  return <div className="app-shell">
    <header className="site-header">
      <a href="#/" className="brand-lockup"><span className="brand-symbol"><Icon name="layers" size={27}/></span><strong>DesignForge<span className="brand-period">.</span></strong></a>
      <nav className={`site-nav ${mobileOpen ? 'open' : ''}`} aria-label="Điều hướng chính">
        {nav.map(item => <a key={item.view} href={`#/${item.view === 'discover' ? '' : item.view}`} aria-current={route.view === item.view ? 'page' : undefined}>{item.label}</a>)}
      </nav>
      <div className="header-tools">
        <button className="icon-button" onClick={() => setSearchOpen(true)} aria-label="Mở tìm kiếm"><Icon name="search"/></button>
        <a className="library-button" href="#/saved"><Icon name="bookmark" size={17}/><span>Đã lưu</span><b>{savedIds.length}</b></a>
        <button className="icon-button navigation-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={mobileOpen}><Icon name={mobileOpen ? 'close' : 'menu'}/></button>
      </div>
    </header>
    <main id="main-content" className="main-content">
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} onOpen={(item) => { setSearchOpen(false); item.kind === 'tool' ? openTool(item.slug) : go(item.kind === 'resource' ? 'resources' : item.kind === 'skill' ? 'skills' : 'prompts'); }} />}
      {route.tool && activeTool ? activeTool.id === 'pdf-editor'
        ? <PdfEditorWorkspace onBack={() => go('tools')} />
        : activeTool.id === 'image-filter'
          ? <ImageFilterWorkspace onBack={() => go('tools')} />
        : <ToolWorkspace key={activeTool.id} tool={activeTool} onBack={() => go('tools')} />
        : <ViewPage view={route.view} query={query} setQuery={setQuery} savedIds={savedIds} toggleSaved={toggleSaved} onOpenTool={openTool} initialCollection={route.collection} />}
    </main>
    <footer className="global-footer">
      <a href="#/" className="brand-lockup"><span className="brand-symbol"><Icon name="layers" size={22}/></span><strong>DesignForge<span className="brand-period">.</span></strong></a>
      <p>Không gian sáng tạo của bạn.</p>
      <div className="creator-credit"><span>by Hyper D²</span><a href="mailto:hieuphamdesdev@gmail.com">hieuphamdesdev@gmail.com</a></div>
    </footer>
  </div>;
}

type FilterSource = { name: string; width: number; height: number; data: Uint8ClampedArray };

function ImageFilterWorkspace({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<FilterSource | null>(null);
  const [status, setStatus] = useState('Chưa có ảnh');
  const [settings, setSettings] = useState<HalftoneSettings>({ color: '#7C45D6', minSize: 0, maxSize: 12, spacing: 16, contrast: 100, ppi: 300, shape: 'circle' });
  const [dots, setDots] = useState<ReturnType<typeof createHalftoneDots>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source) return;
    canvas.width = source.width; canvas.height = source.height;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#fff'; context.fillRect(0, 0, source.width, source.height);
    const nextDots = createHalftoneDots(source.data, source.width, source.height, settings);
    context.fillStyle = settings.color;
    nextDots.forEach(dot => drawHalftoneDot(context, settings.shape, dot.x, dot.y, dot.diameter));
    setDots(nextDots);
    setStatus(`${source.width} × ${source.height} px`);
  }, [source, settings]);

  const loadImage = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) { setStatus('Vui lòng chọn file ảnh hợp lệ.'); return; }
    const url = URL.createObjectURL(file); const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, 2200 / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale)); const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const buffer = document.createElement('canvas'); buffer.width = width; buffer.height = height;
      const context = buffer.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      context.drawImage(image, 0, 0, width, height);
      setSource({ name: file.name.replace(/\.[^.]+$/, '') || 'image', width, height, data: context.getImageData(0, 0, width, height).data });
    };
    image.onerror = () => { URL.revokeObjectURL(url); setStatus('Không thể đọc ảnh này.'); }; image.src = url;
  };
  const update = <K extends keyof HalftoneSettings>(key: K, value: HalftoneSettings[K]) => setSettings(current => ({ ...current, [key]: value }));
  const reset = () => setSettings({ color: '#7C45D6', minSize: 0, maxSize: 12, spacing: 16, contrast: 100, ppi: 300, shape: 'circle' });
  const downloadBlob = (blob: Blob, name: string) => { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  const exportPng = () => { const canvas = canvasRef.current; if (canvas) canvas.toBlob(blob => blob && downloadBlob(blob, `${source?.name || 'image'}-halftone.png`), 'image/png'); };
  const exportSvg = () => { if (!source) return; downloadBlob(new Blob([buildHalftoneSvg(source.width, source.height, dots, settings)], { type: 'image/svg+xml;charset=utf-8' }), `${source.name}-halftone.svg`); };
  const measure = (px: number) => `${pxToMm(px, settings.ppi).toFixed(2).replace(/\.00$/, '')} mm`;
  return <div className="image-filter-page">
    <button className="back-link" onClick={onBack}><Icon name="arrow" size={16} /> Tất cả công cụ</button>
    <div className="image-filter-workspace">
      <aside className="image-filter-controls" aria-label="Điều khiển Color Halftone">
        <div className="image-filter-control-heading"><div><span className="panel-kicker">IMAGE FILTER</span><h1>Color Halftone</h1></div><span className="image-filter-status" role="status">{status}</span></div>
        <input ref={fileRef} className="visually-hidden" type="file" accept="image/*" onChange={event => { loadImage(event.target.files?.[0]); event.target.value = ''; }} />
        <section className="image-filter-control-section" aria-label="Ảnh đầu vào">
          <button className="image-filter-file-button" type="button" onClick={() => fileRef.current?.click()}><Icon name="image" size={18}/> Import image</button>
          <dl className="image-filter-info-list" aria-label="Thông tin ảnh"><div><dt>Input pixels</dt><dd>{source ? `${source.width} × ${source.height} px` : '—'}</dd></div><div><dt>Input size</dt><dd>{source ? `${measure(source.width)} × ${measure(source.height)}` : '—'}</dd></div><div><dt>PPI</dt><dd><input className="image-filter-info-input" type="number" min="36" max="2400" value={settings.ppi} aria-label="PPI" onChange={event => update('ppi', Number(event.target.value) || 300)} /></dd></div></dl>
        </section>
        <section className="image-filter-control-section" aria-label="Hiệu ứng">
          <label className="image-filter-label" htmlFor="image-filter-shape">Dot shape</label><select id="image-filter-shape" className="image-filter-select" value={settings.shape} onChange={event => update('shape', event.target.value as HalftoneShape)}><option value="circle">● Circle</option><option value="triangle">▲ Triangle</option><option value="square">■ Square</option><option value="diamond">◆ Diamond</option></select>
          <div className="image-filter-color-row"><label className="image-filter-label" htmlFor="image-filter-color">Halftone color</label><output>{settings.color}</output></div><div className="image-filter-color-control"><input id="image-filter-color" type="color" value={settings.color} onChange={event => update('color', event.target.value)} /><span>Chọn màu hạt</span></div>
        </section>
        <section className="image-filter-control-section" aria-label="Thông số hạt">
          <FilterRange label="Minimum dot size" value={settings.minSize} min={0} max={20} step={0.1} onChange={value => update('minSize', value)} suffix="px" ppi={settings.ppi} />
          <FilterRange label="Maximum dot size" value={settings.maxSize} min={1} max={40} step={0.1} onChange={value => update('maxSize', Math.max(value, settings.minSize))} suffix="px" ppi={settings.ppi} />
          <FilterRange label="Dot spacing" value={settings.spacing} min={4} max={48} step={0.1} onChange={value => update('spacing', value)} suffix="px" ppi={settings.ppi} />
          <FilterRange label="Contrast" value={settings.contrast} min={50} max={180} step={1} onChange={value => update('contrast', value)} suffix="%" ppi={settings.ppi} />
        </section>
        <div className="image-filter-actions"><button type="button" className="image-filter-secondary-btn" disabled={!source} onClick={reset}>Reset</button><button type="button" className="image-filter-export-btn" disabled={!source} onClick={exportPng}>Export PNG</button><button type="button" className="image-filter-svg-btn" disabled={!source} onClick={exportSvg}>Export SVG</button></div>
      </aside>
      <section className="image-filter-preview-area" aria-label="Khu vực xem trước">
        <div className="image-filter-preview-bar"><div><span>Preview</span><strong>{source?.name || 'Chưa có ảnh'}</strong></div><span>{source ? `${source.width} × ${source.height} px · ${settings.spacing} px grid` : 'Kéo ảnh vào khung hoặc chọn Import image'}</span></div>
        <div className={`image-filter-dropzone ${source ? 'has-image' : ''}`} tabIndex={0} role="button" onClick={() => !source && fileRef.current?.click()} onKeyDown={event => { if ((event.key === 'Enter' || event.key === ' ') && !source) fileRef.current?.click(); }} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (!source) loadImage(event.dataTransfer.files?.[0]); }}><canvas ref={canvasRef} className={source ? '' : 'is-empty'} aria-label="Preview ảnh halftone" aria-hidden={!source} />{!source && <div className="image-filter-empty"><span className="image-filter-empty-icon"><Icon name="image" size={28}/></span><strong>Drop an image here</strong><span>hoặc bấm Import image để bắt đầu</span></div>}</div>
      </section>
    </div>
  </div>;
}

function FilterRange({ label, value, min, max, step, suffix, ppi, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix: string; ppi: number; onChange: (value: number) => void }) {
  return <div className="image-filter-control-group"><div className="image-filter-label-row"><label className="image-filter-label">{label}</label><output>{value}{suffix}</output></div><input className="image-filter-range" type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} /><div className="image-filter-mm-note">{pxToMm(value, ppi).toFixed(2)} mm at {ppi} PPI</div></div>;
}

function SearchDialog({ onClose, onOpen }: { onClose: () => void; onOpen: (item: CatalogItem) => void }) {
  const [value, setValue] = useState('');
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);
  const results = useMemo(() => {
    const needle = value.toLocaleLowerCase('vi-VN').trim();
    return needle ? allCatalog.filter(item => [item.title, item.summary, item.category, ...item.tags].join(' ').toLocaleLowerCase('vi-VN').includes(needle)).slice(0, 7) : allCatalog.slice(0, 7);
  }, [value]);
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title">
      <div className="search-dialog-head"><div><p className="eyebrow">TÌM KIẾM</p><h2 id="search-title">Tìm đúng thứ bạn cần</h2></div><button className="icon-button" onClick={onClose} aria-label="Đóng tìm kiếm"><Icon name="close" /></button></div>
      <label className="search-dialog-input"><Icon name="search" /><input autoFocus value={value} onChange={(event) => setValue(event.target.value)} placeholder="Ví dụ: PDF, branding, font..." /></label>
      <div className="search-results" aria-live="polite">{results.length ? results.map(item => <button className="search-result" key={item.id} onClick={() => onOpen(item)}><span className="icon-tile small"><Icon name={item.icon} /></span><span><strong>{item.title}</strong><small>{item.kind === 'tool' ? 'Công cụ' : item.kind === 'resource' ? 'Tài nguyên' : item.kind === 'skill' ? 'Skill' : 'Prompt'} · {item.summary}</small></span><Icon name="arrow" size={18} /></button>) : <p className="empty-copy">Chưa có kết quả phù hợp. Thử từ khóa ngắn hơn.</p>}</div>
      <div className="search-hint"><span>Enter để mở kết quả</span><span>Esc để đóng</span></div>
    </section>
  </div>;
}

function ViewPage({ view, query, setQuery, savedIds, toggleSaved, onOpenTool, initialCollection }: { view: View; query: string; setQuery: (value: string) => void; savedIds: string[]; toggleSaved: (id: string) => void; onOpenTool: (slug: string) => void; initialCollection?: ToolCollection }) {
  if (view === 'discover') return <DiscoverPage savedIds={savedIds} toggleSaved={toggleSaved} onOpenTool={onOpenTool} />;
  if (view === 'tools') return <ToolsMarketplacePage query={query} setQuery={setQuery} savedIds={savedIds} toggleSaved={toggleSaved} onOpenTool={onOpenTool} initialCollection={initialCollection} />;
  if (view === 'prompts') return <PromptLibraryPage query={query} setQuery={setQuery} savedIds={savedIds} toggleSaved={toggleSaved} />;
  const source = view === 'resources' ? resources : view === 'skills' ? skills : allCatalog.filter(item => savedIds.includes(item.id));
  const title = view === 'resources' ? 'Kho tài nguyên được chọn lọc' : view === 'skills' ? 'Skill để làm việc có hệ thống' : 'Những thứ bạn đã lưu';
  const intro = view === 'resources' ? 'Nguồn tham khảo, font, mockup và checklist giúp quyết định thiết kế nhanh hơn.' : view === 'skills' ? 'Quy trình và checklist ngắn, đọc được và dùng được trong từng dự án.' : 'Các mục được lưu trên thiết bị này. Chưa có đồng bộ tài khoản.';
  const filtered = source.filter(item => !query.trim() || [item.title, item.summary, item.category, ...item.tags].join(' ').toLocaleLowerCase('vi-VN').includes(query.toLocaleLowerCase('vi-VN')));
  return <div className="page-wrap"><div className="page-heading compact"><div><p className="eyebrow">{view === 'saved' ? 'BỘ SƯU TẬP CỦA BẠN' : 'DESIGNFORGE LIBRARY'}</p><h1>{title}</h1><p>{intro}</p></div><div className="heading-meta"><span>{filtered.length} mục</span></div></div><div className="catalog-toolbar"><label className="inline-search"><Icon name="search" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm trong danh mục này..." aria-label="Tìm trong danh mục" /></label><button className="filter-button"><Icon name="sliders" /> Bộ lọc</button></div>{filtered.length ? <div className={`catalog-grid layout-${view}`}>{filtered.map(item => <CatalogCard key={item.id} item={item} saved={savedIds.includes(item.id)} onToggleSaved={toggleSaved} onOpenTool={onOpenTool} />)}</div> : <div className="empty-state"><span className="icon-tile large"><Icon name={view === 'saved' ? 'bookmark' : 'search'} /></span><h2>{view === 'saved' ? 'Chưa có mục nào được lưu' : 'Không tìm thấy kết quả'}</h2><p>{view === 'saved' ? 'Bấm biểu tượng lưu trên một card để giữ lại cho lần sau.' : 'Thử xóa bớt từ khóa hoặc bỏ bộ lọc.'}</p></div>}</div>;
}

function DiscoverPage({ savedIds, toggleSaved, onOpenTool }: { savedIds: string[]; toggleSaved: (id: string) => void; onOpenTool: (slug: string) => void }) {
  return <div className="page-wrap discovery">
    <section className="discovery-intro"><h1>Ở đây có chút công cụ cho <span>designer mới nhú</span></h1><p>Một số công cụ có thể hữu ích cho người bắt đầu thiết kế, đúng hơn đây là web tôi làm để phục vụ công việc cho bản thân nhưng biết đâu nó cũng giúp được cho bạn<br/>Thấy hay thì cho tôi xin 1 tràng pháo tay là được :)))</p></section>
    <section className="feature-gallery" aria-label="Bộ sưu tập nổi bật">
      <a className="gallery-cover cover-barcode" href="#/tools" aria-label="Mở Barcode Generator"><div className="gallery-caption"><div><h2>Barcode Generator</h2><p>Cần thêm code khác, cần bổ sung thêm chức năng thì liên hệ</p></div><span className="round-arrow"><Icon name="arrow"/></span></div></a>
      <a className="gallery-cover cover-image-filter" href="#/tools?collection=image-filter" aria-label="Mở Image Filter Lab trong danh sách công cụ"><div className="gallery-caption"><div><h2>Image Filter Lab</h2><p>Công cụ chuyển ảnh thành các hiệu ứng (Phù hợp in Flexo)</p></div><span className="round-arrow"><Icon name="arrow"/></span></div></a>
      <a className="gallery-cover cover-promt" href="#/prompts" aria-label="Mở Promt Library"><div className="gallery-caption"><div><h2>Promt Library</h2><p>Promt poster tùm lum tùm la sẽ update dần thêm</p></div><span className="round-arrow"><Icon name="arrow"/></span></div></a>
    </section>
    <nav className="category-rail" aria-label="Khám phá theo nhu cầu">{nav.slice(1).map((item,i)=><a href={`#/${item.view}`} key={item.view}><Icon name={item.icon}/><span>{item.label}</span><small>{[tools.length,resources.length,skills.length,allCatalog.filter(x=>x.kind==='prompt').length][i]} mục</small><Icon name="arrow" size={16}/></a>)}</nav>
    <section className="tool-shelf"><div className="shelf-intro"><p className="eyebrow">LESS FRICTION. MORE CREATING.</p><h2>Công việc nhỏ.<br/>Tiến độ lớn.</h2><p>Bộ công cụ thiết kế, luôn trong tầm tay.</p><a className="text-link" href="#/tools">Tất cả công cụ <Icon name="arrow"/></a></div><div className="quick-tools">{tools.map(item=><button key={item.id} onClick={()=>onOpenTool(item.slug)}><span className="icon-tile"><Icon name={item.icon}/></span><span><strong>{item.title}</strong><small>{item.category}</small></span><Icon name="arrow" size={18}/></button>)}</div></section>
    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">CURATED FOR YOUR CREATIVE FLOW</p><h2>Thư viện cảm hứng</h2></div><a className="text-link" href="#/resources">Khám phá tài nguyên <Icon name="arrow"/></a></div><div className="resource-strip">{resources.slice(0,3).map((item,index)=><CatalogCard key={item.id} item={item} saved={savedIds.includes(item.id)} onToggleSaved={toggleSaved} onOpenTool={onOpenTool} featured index={index}/>)}</div></section>
    <section className="learning-strip"><div><p className="eyebrow">LEARN. APPLY. REPEAT.</p><h2>Mỗi dự án,<br/>một bước tiến.</h2><a className="text-link" href="#/skills">Khám phá skill <Icon name="arrow"/></a></div><div>{skills.map((item,i)=><a href="#/skills" key={item.id}><span>0{i+1}</span><div><h3>{item.title}</h3><p>{item.summary}</p></div><Icon name="arrow"/></a>)}</div></section>
  </div>;
}

const toolCollections: { id: Exclude<ToolCollection, 'all'>; label: string; note: string; icon: IconName }[] = [
  { id: 'barcode', label: 'Barcode', note: 'Mã vạch & QR', icon: 'scan' },
  { id: 'pdf', label: 'PDF', note: 'Chuyển đổi & biên tập', icon: 'file' },
  { id: 'image-filter', label: 'Img Filter', note: 'Halftone & texture', icon: 'image' },
];

function matchesToolCollection(item: ToolDefinition, collection: ToolCollection) {
  if (collection === 'all') return true;
  if (collection === 'barcode') return item.id === 'barcode';
  if (collection === 'pdf') return item.category === 'PDF';
  if (collection === 'image-filter') return item.id === 'image-filter';
  return false;
}

function ToolsMarketplacePage({ query, setQuery, savedIds, toggleSaved, onOpenTool, initialCollection }: { query: string; setQuery: (value: string) => void; savedIds: string[]; toggleSaved: (id: string) => void; onOpenTool: (slug: string) => void; initialCollection?: ToolCollection }) {
  const [collection, setCollection] = useState<ToolCollection>(initialCollection || 'barcode');
  const [sort, setSort] = useState<'recommended' | 'alphabetical'>('recommended');
  useEffect(() => {
    setCollection(initialCollection || 'barcode');
    setQuery('');
  }, [initialCollection, setQuery]);
  const visibleTools = useMemo(() => {
    const needle = query.toLocaleLowerCase('vi-VN').trim();
    const result = tools.filter(item => matchesToolCollection(item, collection)).filter(item => !needle || [item.title, item.summary, item.category, ...item.tags].join(' ').toLocaleLowerCase('vi-VN').includes(needle));
    return sort === 'alphabetical' ? [...result].sort((a, b) => a.title.localeCompare(b.title, 'vi')) : result;
  }, [collection, query, sort]);

  const selectedCollectionLabel = collection === 'all' ? 'Tất cả công cụ' : toolCollections.find(item => item.id === collection)?.label;

  return <div className="tools-marketplace-page">
    <div className="tools-marketplace-layout">
      <aside className="tool-filter-panel" aria-label="Danh mục công cụ">
        <div className="tool-filter-head"><div><p className="panel-kicker">BỘ LỌC</p><h2>Chọn công cụ</h2></div><Icon name="sliders" size={19}/></div>
        <div className="tool-filter-list" role="tablist" aria-label="Nhóm công cụ">
          {toolCollections.map(item => <button key={item.id} className={collection === item.id ? 'is-active' : ''} onClick={() => { setCollection(item.id); setQuery(''); }} role="tab" aria-selected={collection === item.id}><span className="filter-item-icon"><Icon name={item.icon} size={18}/></span><span><strong>{item.label}</strong><small>{item.note}</small></span><b>{tools.filter(tool => matchesToolCollection(tool, item.id)).length}</b></button>)}
        </div>
        <div className="tool-filter-note"><span className="status-dot" /> Chạy trực tiếp trên trình duyệt<span>Không cần tải lên máy chủ.</span></div>
      </aside>

      <section className="tool-marketplace-main" aria-live="polite">
        <div className="marketplace-toolbar">
          <div className="marketplace-tabs"><button className={collection === 'all' ? 'is-active' : ''} onClick={() => { setCollection('all'); setQuery(''); }}>Công cụ <b>{visibleTools.length}</b></button><span>Đã chọn: {selectedCollectionLabel}</span></div>
          <div className="marketplace-actions"><label className="marketplace-search"><Icon name="search" size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm công cụ..." aria-label="Tìm công cụ" /></label><label className="marketplace-sort">Sắp xếp<select value={sort} onChange={event => setSort(event.target.value as 'recommended' | 'alphabetical')} aria-label="Sắp xếp công cụ"><option value="recommended">Đề xuất</option><option value="alphabetical">Tên A–Z</option></select></label></div>
        </div>
        {collection === 'barcode' && visibleTools.length ? <BarcodeToolPanel /> : collection === 'pdf' && visibleTools.length ? <PdfToolPanel items={visibleTools} savedIds={savedIds} onToggleSaved={toggleSaved} onOpenTool={onOpenTool} /> : visibleTools.length ? <div className="tool-marketplace-grid">{visibleTools.map(item => <ToolMarketplaceCard key={item.id} item={item} saved={savedIds.includes(item.id)} onToggleSaved={toggleSaved} onOpenTool={onOpenTool} />)}</div> : <div className="empty-state tool-marketplace-empty"><span className="icon-tile large"><Icon name="search" /></span><h2>Chưa có công cụ phù hợp</h2><p>Thử từ khóa khác hoặc chọn lại nhóm công cụ.</p></div>}
      </section>
    </div>
  </div>;
}

type PdfInlineMode = 'images' | 'merge';

function PdfToolPanel({ items, savedIds, onToggleSaved, onOpenTool }: { items: ToolDefinition[]; savedIds: string[]; onToggleSaved: (id: string) => void; onOpenTool: (slug: string) => void }) {
  const imageTool = items.find(item => item.id === 'images-to-pdf');
  const mergeTool = items.find(item => item.id === 'merge-pdf');
  const editorTool = items.find(item => item.id === 'pdf-editor');
  return <div className="pdf-inline-grid">
    {imageTool && <PdfInlineCard mode="images" />}
    {mergeTool && <PdfInlineCard mode="merge" />}
    {editorTool && <ToolMarketplaceCard item={editorTool} saved={savedIds.includes(editorTool.id)} onToggleSaved={onToggleSaved} onOpenTool={onOpenTool} />}
  </div>;
}

function PdfInlineCard({ mode }: { mode: PdfInlineMode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [paperSize, setPaperSize] = useState<ImagePaperSize>('fit');
  const [quality, setQuality] = useState<PdfQuality>('high');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success'; message: string } | null>(null);
  const isImages = mode === 'images';
  const title = isImages ? 'Combine images to PDF' : 'Merge PDFs File';
  const hint = isImages ? 'Drag images to combine' : 'Drag PDFs file to merge';
  const accepts = isImages ? 'image/*,.tif,.tiff' : '.pdf,application/pdf';

  const addFiles = (incoming: File[]) => {
    const valid = incoming.filter(file => isImages ? file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif|tiff?)$/i.test(file.name) : file.type === 'application/pdf' || /\.pdf$/i.test(file.name));
    setFiles(current => [...current, ...valid]);
    setFeedback(valid.length === incoming.length ? null : { tone: 'error', message: isImages ? 'Một số file không phải định dạng ảnh.' : 'Chỉ nhận file PDF.' });
  };
  const onDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };
  const moveFile = (index: number, direction: -1 | 1) => setFiles(current => {
    const target = index + direction;
    if (target < 0 || target >= current.length) return current;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  const createPdf = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const bytes = isImages ? await combineImagesToPdf(files, paperSize, quality) : await mergePdfFiles(files, quality);
      const name = isImages ? 'combined.pdf' : 'merged.pdf';
      downloadPdf(bytes, name);
      setFeedback({ tone: 'success', message: `Đã tạo ${name}` });
    } catch (error) {
      setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Không thể tạo PDF.' });
    } finally {
      setBusy(false);
    }
  };

  return <article className="pdf-inline-card">
    <h3>{title}</h3>
    <input ref={inputRef} className="visually-hidden" type="file" accept={accepts} multiple onChange={event => { addFiles(Array.from(event.target.files || [])); event.target.value = ''; }} />
    <div className={`pdf-inline-dropzone ${dragging ? 'is-dragging' : ''} ${files.length ? 'has-files' : ''}`} aria-label={`Khu vực thả file cho ${title}`} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
      {files.length ? <div className="pdf-file-list">{files.map((file, index) => <div className="pdf-file-item" key={`${file.name}-${file.lastModified}-${index}`} draggable onDragStart={event => event.dataTransfer.setData('text/plain', String(index))} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const source = Number(event.dataTransfer.getData('text/plain')); if (Number.isInteger(source) && source !== index) setFiles(current => { const next = [...current]; const [moved] = next.splice(source, 1); next.splice(index, 0, moved); return next; }); }}><span className="pdf-file-number">{index + 1}</span><Icon name={isImages ? 'image' : 'file'} size={16}/><span title={file.name}>{file.name}</span><div className="pdf-file-actions"><button type="button" disabled={index === 0} onClick={event => { event.stopPropagation(); moveFile(index, -1); }} aria-label={`Đưa ${file.name} lên trước`}>↑</button><button type="button" disabled={index === files.length - 1} onClick={event => { event.stopPropagation(); moveFile(index, 1); }} aria-label={`Đưa ${file.name} xuống sau`}>↓</button><button type="button" onClick={event => { event.stopPropagation(); setFiles(current => current.filter((_, fileIndex) => fileIndex !== index)); }} aria-label={`Xóa ${file.name}`}>×</button></div></div>)}</div> : <div className="pdf-drop-placeholder"><button type="button" className="pdf-drop-plus" onClick={event => { event.stopPropagation(); inputRef.current?.click(); }} aria-label={`Chọn file cho ${title}`}>+</button><span>{hint}</span></div>}
    </div>
    {files.length > 0 && <button className="pdf-add-more" type="button" onClick={() => inputRef.current?.click()}>+ Thêm file <span>{files.length} file</span></button>}
    <div className={`pdf-inline-options ${isImages ? '' : 'single'}`}>
      {isImages && <select value={paperSize} onChange={event => setPaperSize(event.target.value as ImagePaperSize)} aria-label="Kích thước trang"><option value="fit">Fit to Image</option><option value="a4v">A4 Vertical</option><option value="a4h">A4 Horizontal</option></select>}
      <select value={quality} onChange={event => setQuality(event.target.value as PdfQuality)} aria-label={isImages ? 'Chất lượng ảnh' : 'Mức nén PDF'}><option value="high">Quality: High</option><option value="medium">Quality: Medium</option><option value="compact">Quality: Compact</option></select>
    </div>
    <button className="pdf-inline-download" type="button" disabled={!files.length || busy} onClick={createPdf}>{busy ? 'Đang xử lý…' : 'Download PDF'}</button>
    <p className={`pdf-inline-feedback ${feedback ? `is-${feedback.tone}` : ''}`} aria-live="polite">{feedback?.message || ''}</p>
  </article>;
}

const barcodeThumbnails: Record<BarcodeFormatId, { src: string; width: number; height: number }> = {
  ean13: { src: '/assets/barcode-ean13.png', width: 460, height: 236 },
  upca: { src: '/assets/barcode-upca.png', width: 476, height: 236 },
  itf14: { src: '/assets/barcode-itf14.png', width: 572, height: 236 },
  code128: { src: '/assets/barcode-code128.png', width: 524, height: 236 },
  gs1128: { src: '/assets/barcode-gs1128.png', width: 920, height: 236 },
  qr: { src: '/assets/barcode-qr.png', width: 280, height: 280 },
};

type BarcodeFeedback = { tone: 'error' | 'success'; message: string } | null;

function BarcodeToolPanel() {
  const [values, setValues] = useState<Record<BarcodeFormatId, string[]>>(() => Object.fromEntries(barcodeFormats.map(format => [format.id, ['']])) as Record<BarcodeFormatId, string[]>);
  const [outputTypes, setOutputTypes] = useState<Record<BarcodeFormatId, BarcodeExportFormat>>(() => Object.fromEntries(barcodeFormats.map(format => [format.id, 'SVG'])) as Record<BarcodeFormatId, BarcodeExportFormat>);
  const [feedback, setFeedback] = useState<Record<BarcodeFormatId, BarcodeFeedback>>(() => Object.fromEntries(barcodeFormats.map(format => [format.id, null])) as Record<BarcodeFormatId, BarcodeFeedback>);
  const [busy, setBusy] = useState<Record<BarcodeFormatId, boolean>>(() => Object.fromEntries(barcodeFormats.map(format => [format.id, false])) as Record<BarcodeFormatId, boolean>);

  const updateValue = (format: BarcodeFormatId, index: number, value: string) => {
    setValues(current => ({ ...current, [format]: current[format].map((entry, entryIndex) => entryIndex === index ? normalizeBarcodeValue(format, value) : entry) }));
    setFeedback(current => ({ ...current, [format]: null }));
  };
  const addValue = (format: BarcodeFormatId) => {
    const nextIndex = values[format].length;
    if (nextIndex >= MAX_BARCODE_INPUTS) return;
    setValues(current => ({ ...current, [format]: [...current[format], ''] }));
    requestAnimationFrame(() => document.getElementById(`barcode-${format}-${nextIndex}`)?.focus());
  };
  const removeValue = (format: BarcodeFormatId) => {
    if (values[format].length <= 1) return;
    const nextIndex = values[format].length - 2;
    setValues(current => ({ ...current, [format]: current[format].slice(0, -1) }));
    setFeedback(current => ({ ...current, [format]: null }));
    requestAnimationFrame(() => document.getElementById(`barcode-${format}-${nextIndex}`)?.focus());
  };
  const download = async (format: BarcodeFormatId) => {
    setBusy(current => ({ ...current, [format]: true }));
    setFeedback(current => ({ ...current, [format]: null }));
    try {
      const files = await createBarcodeExport(format, values[format], outputTypes[format]);
      downloadGeneratedFiles(files);
      setFeedback(current => ({ ...current, [format]: { tone: 'success', message: files.length > 1 ? `Đã tạo ${files.length} file ${outputTypes[format]}.` : `Đã tạo ${files[0].name}.` } }));
    } catch (error) {
      setFeedback(current => ({ ...current, [format]: { tone: 'error', message: error instanceof Error ? error.message : 'Không thể tạo file.' } }));
    } finally {
      setBusy(current => ({ ...current, [format]: false }));
    }
  };

  return <div className="barcode-tool-panel">
    <div className="barcode-format-grid">
      {barcodeFormats.map((format, index) => {
        const hasValue = values[format.id].some(value => value.trim());
        const thumbnail = barcodeThumbnails[format.id];
        const output = outputTypes[format.id];
        const cardFeedback = feedback[format.id];
        return <article className={`barcode-format-card barcode-format-${format.id}`} key={format.id}>
          <div className="barcode-format-thumb"><img src={thumbnail.src} alt={`Mẫu ${format.title}`} width={thumbnail.width} height={thumbnail.height} loading={index < 3 ? 'eager' : 'lazy'} /></div>
          <div className="barcode-format-content">
            <div className="barcode-format-heading"><h3>{format.title}</h3><p>{format.note}</p></div>
            <div className="barcode-input-box" role="group" aria-labelledby={`barcode-${format.id}-label`}>
              <span className="barcode-input-label" id={`barcode-${format.id}-label`}>Input</span>
              <div className="barcode-input-list">
                {values[format.id].map((value, valueIndex) => <div className="barcode-input-row" key={`${format.id}-${valueIndex}`}><input id={`barcode-${format.id}-${valueIndex}`} value={value} onChange={event => updateValue(format.id, valueIndex, event.target.value)} placeholder="" maxLength={format.maxLength} inputMode={format.onlyDigits ? 'numeric' : 'text'} aria-label={`${format.title} input ${valueIndex + 1}`} aria-describedby={`barcode-${format.id}-feedback`} autoComplete="off" /></div>)}
              </div>
              <div className="barcode-row-actions"><button className="barcode-row-button add" type="button" onClick={() => addValue(format.id)} disabled={values[format.id].length >= MAX_BARCODE_INPUTS} aria-label={`Thêm input cho ${format.title}`}>+</button>{values[format.id].length >= 2 && <button className="barcode-row-button remove" type="button" onClick={() => removeValue(format.id)} aria-label={`Bớt một input của ${format.title}`}>−</button>}</div>
              <p className={`barcode-card-feedback ${cardFeedback ? `is-${cardFeedback.tone}` : ''}`} id={`barcode-${format.id}-feedback`} aria-live="polite">{cardFeedback?.message || ''}</p>
            </div>
            <div className="barcode-download-row"><select value={output} onChange={event => setOutputTypes(current => ({ ...current, [format.id]: event.target.value as BarcodeExportFormat }))} disabled={busy[format.id]} aria-label={`Định dạng xuất ${format.title}`}><option value="SVG">SVG</option><option value="PDF">PDF</option><option value="PNG">PNG</option></select><button className="primary-button barcode-download-button" type="button" disabled={!hasValue || busy[format.id]} onClick={() => download(format.id)}>{busy[format.id] ? `Đang tạo ${output}...` : `Download as ${output}`}</button></div>
          </div>
        </article>;
      })}
    </div>
  </div>;
}

function ToolMarketplaceCard({ item, saved, onToggleSaved, onOpenTool }: { item: ToolDefinition; saved: boolean; onToggleSaved: (id: string) => void; onOpenTool: (slug: string) => void }) {
  return <article className={`tool-marketplace-card tool-art-${item.id}`}>
    <div className="tool-marketplace-visual"><div className="tool-visual-grid" aria-hidden="true" /><span className="tool-visual-label">{item.category === 'PDF' ? 'DOCUMENT LAB' : item.id === 'barcode' ? 'CODE / PRINT' : item.id === 'image-filter' ? 'IMAGE STUDY' : 'PROMPT SYSTEM'}</span><span className="tool-visual-icon"><Icon name={item.icon} size={30}/></span><button className={`save-button ${saved ? 'is-saved' : ''}`} onClick={() => onToggleSaved(item.id)} aria-label={saved ? `Bỏ lưu ${item.title}` : `Lưu ${item.title}`} aria-pressed={saved}><Icon name="bookmark" size={17}/></button></div>
    <div className="tool-marketplace-body"><div className="tool-marketplace-meta"><span><i className="status-dot" />{item.availability === 'beta' ? 'Beta' : 'Sẵn sàng'}</span><span>{item.runtime === 'client' ? 'Local' : item.runtime}</span></div><h2><button className="card-title-link" onClick={() => onOpenTool(item.slug)}>{item.title}</button></h2><p>{item.summary}</p><div className="tool-marketplace-tags">{item.tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div><div className="tool-marketplace-footer"><span>{item.meta || item.category}</span><button className="tool-open-button" onClick={() => onOpenTool(item.slug)}>Mở tool <Icon name="arrow" size={16}/></button></div></div>
  </article>;
}

function CatalogCard({ item, saved, onToggleSaved, onOpenTool, featured = false, index = 0 }: { item: CatalogItem; saved: boolean; onToggleSaved: (id: string) => void; onOpenTool: (slug: string) => void; featured?: boolean; index?: number }) {
  const action = item.kind === 'tool' ? () => onOpenTool(item.slug) : undefined;
  return <article className={`catalog-card card-${item.kind} ${featured ? 'is-featured' : ''}`} style={{ '--card-index': index } as CSSProperties}><div className={`card-visual ${item.kind}`}><span className="icon-tile"><Icon name={item.icon} /></span>{item.kind === 'resource' && <><span className="resource-art" aria-hidden="true">{item.category === 'Typography' ? 'Aa' : item.category === 'Mockup' ? '◧' : 'CMYK'}</span><span className="visual-label">{item.category}</span></>}{item.kind === 'prompt' && <span className="prompt-visual-type">PROMPT<br />STUDY</span>}</div><div className="card-body"><div className="card-topline"><span className="card-kind">{item.kind === 'tool' ? 'CÔNG CỤ' : item.kind === 'resource' ? 'TÀI NGUYÊN' : item.kind === 'skill' ? 'SKILL' : 'PROMPT'}</span><button className={`save-button ${saved ? 'is-saved' : ''}`} onClick={() => onToggleSaved(item.id)} aria-label={saved ? `Bỏ lưu ${item.title}` : `Lưu ${item.title}`} aria-pressed={saved}><Icon name="bookmark" size={17} /></button></div><h3>{action ? <button className="card-title-link" onClick={action}>{item.title}</button> : item.title}</h3><p>{item.summary}</p><div className="card-footer"><span>{item.meta || item.category}</span><span className="tag-arrow"><Icon name="arrow" size={16} /></span></div></div></article>;
}

function ToolWorkspace({ tool, onBack }: { tool: ToolDefinition; onBack: () => void }) {
  const [value, setValue] = useState('');
  const [previewed, setPreviewed] = useState(false);
  const [fileName, setFileName] = useState('');
  const [type, setType] = useState(tool.id === 'barcode' ? 'EAN-13' : '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerFilePicker = () => fileInputRef.current?.click();
  const onDropzoneKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); triggerFilePicker(); } };
  const hasInput = tool.id === 'barcode' ? Boolean(value.trim()) : Boolean(fileName);
  return <div className="tool-page"><button className="back-link" onClick={onBack}><Icon name="arrow" size={16} /> Tất cả công cụ</button><div className="tool-heading"><div><p className="eyebrow">WORKSPACE · {tool.category.toUpperCase()}</p><h1>{tool.title}</h1><p>{tool.summary}</p></div><span className={`availability availability-${tool.availability}`}>{tool.availability === 'beta' ? 'Beta' : 'Sẵn sàng trên trình duyệt'}</span></div><div className="workspace-bar"><span><Icon name={tool.icon}/> {tool.title}</span><span>Input → Preview → Export</span></div><div className="tool-workspace"><section className="tool-panel input-panel"><div className="panel-heading"><div><p className="panel-kicker">01 · NHẬP</p><h2>{tool.id === 'barcode' ? 'Thông tin mã' : 'Bắt đầu với file của bạn'}</h2></div><span className="panel-number">{tool.id === 'barcode' ? 'TEXT' : 'FILE'}</span></div>{tool.id === 'barcode' ? <><label className="field-label" htmlFor="barcode-value">Nội dung mã</label><textarea id="barcode-value" value={value} onChange={event => { setValue(event.target.value); setPreviewed(false); }} placeholder="Nhập chuỗi hoặc mã sản phẩm..." rows={3} /><p className="field-help">Giữ số 0 đầu và nhập mỗi mã trên một dòng nếu cần.</p><label className="field-label" htmlFor="barcode-type">Loại mã</label><select id="barcode-type" value={type} onChange={event => setType(event.target.value)}><option>EAN-13</option><option>UPC-A</option><option>ITF-14</option><option>Code 128</option><option>GS1-128</option><option>QR Code</option></select></> : <><input ref={fileInputRef} id="tool-file-input" className="visually-hidden" type="file" accept="image/*,.pdf,.tif,.tiff" onChange={event => setFileName(event.target.files?.[0]?.name || '')} /><div className="dropzone" tabIndex={0} role="button" aria-label="Chọn hoặc kéo thả tệp vào đây" onClick={triggerFilePicker} onKeyDown={onDropzoneKeyDown}><Icon name="file" size={28} /><strong>{fileName || 'Kéo tệp vào đây'}</strong><span>{fileName ? 'Tệp đã sẵn sàng để xử lý' : 'hoặc chọn từ thiết bị của bạn'}</span><small>Kiểm soát file lớn và định dạng ở bước xử lý</small></div></>}<button className="primary-button panel-action" disabled={!hasInput} onClick={() => { if (tool.id === 'barcode') setPreviewed(true); else triggerFilePicker(); }}>{tool.id === 'barcode' ? 'Tạo bản xem trước' : 'Chọn file' } <Icon name="arrow" size={18} /></button></section><section className="tool-panel preview-panel"><div className="panel-heading"><div><p className="panel-kicker">02 · XEM TRƯỚC</p><h2>Kết quả hiển thị ở đây</h2></div><span className="preview-status">{previewed || fileName ? 'Đã có dữ liệu' : 'Đang chờ input'}</span></div><div className="preview-canvas">{tool.id === 'barcode' && value && previewed ? <div className="fake-barcode" aria-label={`Bản xem trước ${type}`}><div className="barcode-lines" /><strong>{value}</strong><small>{type} · preview</small></div> : <div className="preview-empty"><span className="icon-tile large"><Icon name={tool.icon} /></span><strong>{tool.id === 'barcode' ? 'Nhập mã để xem trước' : fileName ? 'Tệp đã nhận' : 'Khu vực xem trước'}</strong><span>{fileName || 'Output sẽ xuất hiện ở đây sau khi bạn hoàn tất bước đầu tiên.'}</span></div>}</div><div className="preview-actions"><button className="secondary-button" disabled={!hasInput}>Lưu preset</button><button className="secondary-button" disabled={!hasInput}>Xuất file</button></div></section></div><section className="tool-info-row"><div><p className="eyebrow">GỢI Ý</p><h2>{tool.id === 'barcode' ? 'Một mã rõ ràng bắt đầu từ dữ liệu đúng.' : 'Giữ mọi bước rõ ràng và có thể quay lại.'}</h2></div><p>Prototype này đã đặt sẵn ranh giới cho input, preview và export. Engine chuyên biệt sẽ được nối theo migration matrix sau khi baseline nguồn hoàn tất.</p></section></div>;
}

function PdfEditorWorkspace({ onBack }: { onBack: () => void }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const fallback = window.setTimeout(() => setLoaded(true), 1200);
    const onReady = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data === 'designforge-pdf-editor-ready') setLoaded(true);
    };
    window.addEventListener('message', onReady);
    return () => { window.clearTimeout(fallback); window.removeEventListener('message', onReady); };
  }, []);
  return <div className="pdf-editor-route">
    <div className="pdf-editor-route-bar">
      <button className="back-link" onClick={onBack}><Icon name="arrow" size={16} /> Tất cả công cụ</button>
      <div className="pdf-editor-route-title"><span>WORKSPACE · PDF</span><strong>PDF Editor</strong></div>
      <span className="pdf-editor-local"><i className="status-dot" /> Xử lý cục bộ</span>
    </div>
    <div className={`pdf-editor-frame-shell ${loaded ? 'is-loaded' : ''}`}>
      {!loaded && <div className="pdf-editor-loading" role="status"><span className="pdf-editor-loading-mark"><Icon name="file" size={24}/></span><strong>Đang mở PDF Editor</strong><small>Chuẩn bị công cụ chỉnh sửa trên thiết bị…</small></div>}
      <iframe className="pdf-editor-frame" src="/pdf-editor/index.html" title="PDF Editor — chỉnh sửa và xuất PDF" onLoad={() => setLoaded(true)} />
    </div>
  </div>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
