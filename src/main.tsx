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
import './styles.css';

type View = 'discover' | 'tools' | 'resources' | 'skills' | 'prompts' | 'saved';
type ToolState = { slug: string } | null;

const nav: { view: View; label: string; icon: IconName }[] = [
  { view: 'discover', label: 'Khám phá', icon: 'spark' },
  { view: 'tools', label: 'Công cụ', icon: 'sliders' },
  { view: 'resources', label: 'Tài nguyên', icon: 'layers' },
  { view: 'skills', label: 'Skill', icon: 'pen' },
  { view: 'prompts', label: 'Prompt', icon: 'scan' },
];

function getRoute(): { view: View; tool: ToolState } {
  const slug = window.location.hash.replace(/^#\/?/, '');
  if (slug.startsWith('tools/')) return { view: 'tools', tool: { slug: slug.slice(6) } };
  const view = ['discover', 'tools', 'resources', 'skills', 'prompts', 'saved'].includes(slug) ? slug as View : 'discover';
  return { view, tool: null };
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
        : <ToolWorkspace key={activeTool.id} tool={activeTool} onBack={() => go('tools')} />
        : <ViewPage view={route.view} query={query} setQuery={setQuery} savedIds={savedIds} toggleSaved={toggleSaved} onOpenTool={openTool} />}
    </main>
    <footer className="global-footer">
      <a href="#/" className="brand-lockup"><span className="brand-symbol"><Icon name="layers" size={22}/></span><strong>DesignForge<span className="brand-period">.</span></strong></a>
      <p>Không gian sáng tạo của bạn.</p>
      <div className="creator-credit"><span>by Hyper D²</span><a href="mailto:hieuphamdesdev@gmail.com">hieuphamdesdev@gmail.com</a></div>
    </footer>
  </div>;
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

function ViewPage({ view, query, setQuery, savedIds, toggleSaved, onOpenTool }: { view: View; query: string; setQuery: (value: string) => void; savedIds: string[]; toggleSaved: (id: string) => void; onOpenTool: (slug: string) => void }) {
  if (view === 'discover') return <DiscoverPage savedIds={savedIds} toggleSaved={toggleSaved} onOpenTool={onOpenTool} />;
  if (view === 'tools') return <ToolsMarketplacePage query={query} setQuery={setQuery} savedIds={savedIds} toggleSaved={toggleSaved} onOpenTool={onOpenTool} />;
  const source = view === 'resources' ? resources : view === 'skills' ? skills : view === 'prompts' ? allCatalog.filter(item => item.kind === 'prompt') : allCatalog.filter(item => savedIds.includes(item.id));
  const title = view === 'resources' ? 'Kho tài nguyên được chọn lọc' : view === 'skills' ? 'Skill để làm việc có hệ thống' : view === 'prompts' ? 'Prompt có thể tái sử dụng' : 'Những thứ bạn đã lưu';
  const intro = view === 'resources' ? 'Nguồn tham khảo, font, mockup và checklist giúp quyết định thiết kế nhanh hơn.' : view === 'skills' ? 'Quy trình và checklist ngắn, đọc được và dùng được trong từng dự án.' : view === 'prompts' ? 'Bắt đầu từ một cấu trúc tốt, sau đó tinh chỉnh theo sản phẩm và hình ảnh của bạn.' : 'Các mục được lưu trên thiết bị này. Chưa có đồng bộ tài khoản.';
  const filtered = source.filter(item => !query.trim() || [item.title, item.summary, item.category, ...item.tags].join(' ').toLocaleLowerCase('vi-VN').includes(query.toLocaleLowerCase('vi-VN')));
  return <div className="page-wrap"><div className="page-heading compact"><div><p className="eyebrow">{view === 'saved' ? 'BỘ SƯU TẬP CỦA BẠN' : 'DESIGNFORGE LIBRARY'}</p><h1>{title}</h1><p>{intro}</p></div><div className="heading-meta"><span>{filtered.length} mục</span></div></div><div className="catalog-toolbar"><label className="inline-search"><Icon name="search" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm trong danh mục này..." aria-label="Tìm trong danh mục" /></label><button className="filter-button"><Icon name="sliders" /> Bộ lọc</button></div>{filtered.length ? <div className={`catalog-grid layout-${view}`}>{filtered.map(item => <CatalogCard key={item.id} item={item} saved={savedIds.includes(item.id)} onToggleSaved={toggleSaved} onOpenTool={onOpenTool} />)}</div> : <div className="empty-state"><span className="icon-tile large"><Icon name={view === 'saved' ? 'bookmark' : 'search'} /></span><h2>{view === 'saved' ? 'Chưa có mục nào được lưu' : 'Không tìm thấy kết quả'}</h2><p>{view === 'saved' ? 'Bấm biểu tượng lưu trên một card để giữ lại cho lần sau.' : 'Thử xóa bớt từ khóa hoặc bỏ bộ lọc.'}</p></div>}</div>;
}

function DiscoverPage({ savedIds, toggleSaved, onOpenTool }: { savedIds: string[]; toggleSaved: (id: string) => void; onOpenTool: (slug: string) => void }) {
  return <div className="page-wrap discovery">
    <section className="discovery-intro"><div><p className="eyebrow">YOUR NEXT IDEA STARTS HERE</p><h1>Không gian cho<br/><span>mọi ý tưởng lớn.</span></h1></div><div className="intro-aside"><p>Khám phá công cụ, tài nguyên và kiến thức thiết kế. Chọn đúng thứ bạn cần, bắt đầu điều bạn muốn.</p><a href="#/tools" className="text-link">Mở hộp công cụ <Icon name="arrow"/></a></div></section>
    <section className="feature-gallery" aria-label="Bộ sưu tập nổi bật">
      <a className="gallery-cover cover-type" href="#/resources"><span className="gallery-label">THE DESIGN EDIT / 01</span><div className="type-art" aria-hidden="true">Aa<span>&amp;</span></div><div className="gallery-caption"><div><small>TYPOGRAPHY &amp; RESOURCES</small><h2>Chất liệu cho<br/>ý tưởng tiếp theo.</h2></div><span className="round-arrow"><Icon name="arrow"/></span></div></a>
      <a className="gallery-cover cover-lab" href="#/tools/image-filter"><span className="gallery-label">EXPERIMENT WITH TEXTURE</span><div className="halftone-art" aria-hidden="true"/><div className="gallery-caption"><div><small>IMAGE TOOLS</small><h2>Halftone Lab</h2></div><span className="round-arrow"><Icon name="arrow"/></span></div></a>
      <a className="gallery-cover cover-skill" href="#/skills"><span className="gallery-label">BUILD YOUR PROCESS</span><div className="grid-art" aria-hidden="true"><i/><i/><i/><i/></div><div className="gallery-caption"><div><small>SKILLS &amp; WORKFLOWS</small><h2>Thiết kế có hệ thống.</h2></div><span className="round-arrow"><Icon name="arrow"/></span></div></a>
    </section>
    <nav className="category-rail" aria-label="Khám phá theo nhu cầu">{nav.slice(1).map((item,i)=><a href={`#/${item.view}`} key={item.view}><Icon name={item.icon}/><span>{item.label}</span><small>{[tools.length,resources.length,skills.length,allCatalog.filter(x=>x.kind==='prompt').length][i]} mục</small><Icon name="arrow" size={16}/></a>)}</nav>
    <section className="tool-shelf"><div className="shelf-intro"><p className="eyebrow">LESS FRICTION. MORE CREATING.</p><h2>Công việc nhỏ.<br/>Tiến độ lớn.</h2><p>Bộ công cụ thiết kế, luôn trong tầm tay.</p><a className="text-link" href="#/tools">Tất cả công cụ <Icon name="arrow"/></a></div><div className="quick-tools">{tools.map(item=><button key={item.id} onClick={()=>onOpenTool(item.slug)}><span className="icon-tile"><Icon name={item.icon}/></span><span><strong>{item.title}</strong><small>{item.category}</small></span><Icon name="arrow" size={18}/></button>)}</div></section>
    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">CURATED FOR YOUR CREATIVE FLOW</p><h2>Thư viện cảm hứng</h2></div><a className="text-link" href="#/resources">Khám phá tài nguyên <Icon name="arrow"/></a></div><div className="resource-strip">{resources.slice(0,3).map((item,index)=><CatalogCard key={item.id} item={item} saved={savedIds.includes(item.id)} onToggleSaved={toggleSaved} onOpenTool={onOpenTool} featured index={index}/>)}</div></section>
    <section className="learning-strip"><div><p className="eyebrow">LEARN. APPLY. REPEAT.</p><h2>Mỗi dự án,<br/>một bước tiến.</h2><a className="text-link" href="#/skills">Khám phá skill <Icon name="arrow"/></a></div><div>{skills.map((item,i)=><a href="#/skills" key={item.id}><span>0{i+1}</span><div><h3>{item.title}</h3><p>{item.summary}</p></div><Icon name="arrow"/></a>)}</div></section>
    <footer className="site-footer"><a href="#/" className="brand-lockup"><strong>DesignForge.</strong></a><p>Không gian sáng tạo của bạn.</p><a href="#/saved">Thư viện đã lưu <Icon name="arrow" size={16}/></a></footer>
  </div>;
}

type ToolCollection = 'all' | 'barcode' | 'pdf' | 'image-filter' | 'prompt';

const toolCollections: { id: Exclude<ToolCollection, 'all'>; label: string; note: string; icon: IconName }[] = [
  { id: 'barcode', label: 'Barcode', note: 'Mã vạch & QR', icon: 'scan' },
  { id: 'pdf', label: 'PDF', note: 'Chuyển đổi & biên tập', icon: 'file' },
  { id: 'image-filter', label: 'Img Filter', note: 'Halftone & texture', icon: 'image' },
  { id: 'prompt', label: 'Prompt', note: 'Prompt có cấu trúc', icon: 'spark' },
];

function matchesToolCollection(item: ToolDefinition, collection: ToolCollection) {
  if (collection === 'all') return true;
  if (collection === 'barcode') return item.id === 'barcode';
  if (collection === 'pdf') return item.category === 'PDF';
  if (collection === 'image-filter') return item.id === 'image-filter';
  return item.id === 'prompt-builder';
}

function ToolsMarketplacePage({ query, setQuery, savedIds, toggleSaved, onOpenTool }: { query: string; setQuery: (value: string) => void; savedIds: string[]; toggleSaved: (id: string) => void; onOpenTool: (slug: string) => void }) {
  const [collection, setCollection] = useState<ToolCollection>('barcode');
  const [sort, setSort] = useState<'recommended' | 'alphabetical'>('recommended');
  const visibleTools = useMemo(() => {
    const needle = query.toLocaleLowerCase('vi-VN').trim();
    const result = tools.filter(item => matchesToolCollection(item, collection)).filter(item => !needle || [item.title, item.summary, item.category, ...item.tags].join(' ').toLocaleLowerCase('vi-VN').includes(needle));
    return sort === 'alphabetical' ? [...result].sort((a, b) => a.title.localeCompare(b.title, 'vi')) : result;
  }, [collection, query, sort]);

  const selectedCollectionLabel = collection === 'all' ? 'Tất cả công cụ' : toolCollections.find(item => item.id === collection)?.label;

  return <div className="tools-marketplace-page">
    <section className="marketplace-hero">
      <div>
        <p className="eyebrow">DESIGNFORGE / TOOL LIBRARY</p>
        <h1>Công cụ cho <span>nhịp làm việc.</span></h1>
        <p>Chọn một công cụ, đưa dữ liệu vào và tiếp tục thiết kế. Mọi module đều được gom theo tác vụ để tìm nhanh hơn.</p>
      </div>
      <div className="marketplace-hero-mark" aria-hidden="true"><span>DF</span><i /></div>
    </section>

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
                <div className="barcode-input-row is-ghost"><input value="" disabled tabIndex={-1} aria-hidden="true" readOnly /><div className="barcode-row-actions"><button className="barcode-row-button add" type="button" onClick={() => addValue(format.id)} disabled={values[format.id].length >= MAX_BARCODE_INPUTS} aria-label={`Thêm input cho ${format.title}`}>+</button>{values[format.id].length >= 2 && <button className="barcode-row-button remove" type="button" onClick={() => removeValue(format.id)} aria-label={`Bớt một input của ${format.title}`}>−</button>}</div></div>
              </div>
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
