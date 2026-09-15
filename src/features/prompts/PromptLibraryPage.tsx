import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../components/Icon';
import templateData from './templates.json';
import { createPromptValues, getMissingPromptFields, renderPrompt } from './engine';
import { promptDraftRepository } from './repository';
import type { PromptTemplate, PromptValues } from './types';
import './prompts.css';

const templates = templateData as PromptTemplate[];

type PromptCategoryId = 'beverage' | 'food' | 'beauty';

type PromptCategory = {
  id: PromptCategoryId;
  label: string;
  description: string;
  subcategories: Array<{ id: string; label: string }>;
};

const promptCategories: PromptCategory[] = [
  {
    id: 'beverage',
    label: 'Poster nước giải khát',
    description: 'Nước trái cây, cà phê, tăng lực và thức uống thiên nhiên.',
    subcategories: [
      { id: 'all', label: 'Tất cả' },
      { id: 'juice', label: 'Juice' },
      { id: 'coffee', label: 'Coffee' },
      { id: 'energy', label: 'Tăng lực' },
      { id: 'aloe-vera', label: 'Aloe vera' },
    ],
  },
  {
    id: 'food',
    label: 'Poster thực phẩm',
    description: 'Món ăn, bánh ngọt và sản phẩm thực phẩm đóng gói.',
    subcategories: [
      { id: 'all', label: 'Tất cả' },
      { id: 'fast-food', label: 'Đồ ăn nhanh' },
      { id: 'dessert', label: 'Bánh & tráng miệng' },
      { id: 'packaged-food', label: 'Thực phẩm đóng gói' },
    ],
  },
  {
    id: 'beauty',
    label: 'Poster sản phẩm làm đẹp',
    description: 'Skincare, mỹ phẩm và sản phẩm chăm sóc cá nhân.',
    subcategories: [
      { id: 'all', label: 'Tất cả' },
      { id: 'skincare', label: 'Skincare' },
      { id: 'makeup', label: 'Mỹ phẩm' },
      { id: 'personal-care', label: 'Chăm sóc cá nhân' },
    ],
  },
];

const promptTemplateTaxonomy: Record<string, { category: PromptCategoryId; subcategory: string }> = {
  'juice-splash': { category: 'beverage', subcategory: 'juice' },
  'premium-dark-splash': { category: 'beverage', subcategory: 'juice' },
  'frozen-fruit-macro': { category: 'beverage', subcategory: 'juice' },
  'dynamic-ingredient-splash': { category: 'beverage', subcategory: 'juice' },
  'natural-basket-lifestyle': { category: 'beverage', subcategory: 'aloe-vera' },
  'bright-orange-platform': { category: 'beverage', subcategory: 'juice' },
  'premium-fruit-beverage-hero': { category: 'beverage', subcategory: 'energy' },
  'frozen-coconut-strawberry': { category: 'beverage', subcategory: 'juice' },
};

function imageUrl(template: PromptTemplate) {
  return template.thumbnail.replace(/^\/?assets\//, 'assets/');
}

export function PromptLibraryPage({ query, setQuery, savedIds, toggleSaved }: { query: string; setQuery: (value: string) => void; savedIds: string[]; toggleSaved: (id: string) => void }) {
  const [active, setActive] = useState<PromptTemplate | null>(null);
  const [categoryId, setCategoryId] = useState<PromptCategoryId>('beverage');
  const [subcategoryId, setSubcategoryId] = useState('all');
  const activeCategory = promptCategories.find(category => category.id === categoryId) ?? promptCategories[0];
  const needle = query.trim().toLocaleLowerCase('vi-VN');
  const categoryTemplates = useMemo(() => templates.filter(template => promptTemplateTaxonomy[template.id]?.category === categoryId), [categoryId]);
  const filtered = useMemo(() => categoryTemplates.filter(template => {
    const taxonomy = promptTemplateTaxonomy[template.id];
    if (subcategoryId !== 'all' && taxonomy?.subcategory !== subcategoryId) return false;
    return !needle || [template.cardTitle, template.title, template.caption, ...template.fields.map(field => `${field.label} ${field.value}`)].join(' ').toLocaleLowerCase('vi-VN').includes(needle);
  }), [categoryTemplates, needle, subcategoryId]);

  const chooseCategory = (nextCategory: PromptCategoryId) => {
    setCategoryId(nextCategory);
    setSubcategoryId('all');
    setQuery('');
  };

  return <div className="page-wrap prompt-library-page">
    <div className="prompt-library-layout">
      <aside className="prompt-category-sidebar" aria-label="Phân loại prompt">
        <div className="prompt-category-sidebar-head"><p>THƯ VIỆN PROMPT</p><h1>Chọn chủ đề</h1></div>
        <nav>{promptCategories.map(category => {
          const count = templates.filter(template => promptTemplateTaxonomy[template.id]?.category === category.id).length;
          return <button key={category.id} type="button" className={category.id === categoryId ? 'is-active' : ''} onClick={() => chooseCategory(category.id)} aria-current={category.id === categoryId ? 'page' : undefined}>
            <span><strong>{category.label}</strong><small>{category.description}</small></span><em>{count}</em>
          </button>;
        })}</nav>
      </aside>
      <main className="prompt-library-content">
        <div className="prompt-subcategory-bar">
          <div><p>PHÂN LOẠI</p><h2>{activeCategory.label}</h2></div>
          <nav aria-label={`Nhóm con của ${activeCategory.label}`}>{activeCategory.subcategories.map(subcategory => {
            const count = subcategory.id === 'all'
              ? categoryTemplates.length
              : categoryTemplates.filter(template => promptTemplateTaxonomy[template.id]?.subcategory === subcategory.id).length;
            return <button key={subcategory.id} type="button" className={subcategory.id === subcategoryId ? 'is-active' : ''} onClick={() => setSubcategoryId(subcategory.id)} aria-pressed={subcategory.id === subcategoryId}>{subcategory.label}<span>{count}</span></button>;
          })}</nav>
        </div>
        <div className="catalog-toolbar prompt-library-toolbar">
          <label className="inline-search"><Icon name="search" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm tên mẫu, phong cách hoặc nguyên liệu..." aria-label="Tìm trong thư viện prompt" /></label>
          <p><strong>{filtered.length}</strong> mẫu phù hợp</p>
        </div>
        {filtered.length ? <div className="prompt-card-grid">{filtered.map(template => {
      const saveId = `prompt-${template.id}`;
      const saved = savedIds.includes(saveId);
      return <article className="prompt-template-card" key={template.id}>
        <button className="prompt-card-open" type="button" onClick={() => setActive(template)} aria-label={`Mở mẫu ${template.cardTitle}`}>
          <img src={imageUrl(template)} alt={template.thumbnailAlt} width="640" height="480" loading="lazy" />
          <span className="prompt-card-overlay"><span><small>{template.caption}</small><strong>{template.cardTitle}</strong></span><span className="round-arrow"><Icon name="arrow" /></span></span>
        </button>
        <div className="prompt-card-meta"><span>{template.fields.length} trường có thể chỉnh</span><button type="button" className={`prompt-save-button ${saved ? 'is-saved' : ''}`} onClick={() => toggleSaved(saveId)} aria-label={saved ? `Bỏ lưu ${template.cardTitle}` : `Lưu ${template.cardTitle}`} aria-pressed={saved}><Icon name="bookmark" size={17}/>{saved ? 'Đã lưu' : 'Lưu mẫu'}</button></div>
      </article>;
        })}</div> : <div className="empty-state prompt-library-empty"><span className="icon-tile large"><Icon name={needle ? 'search' : 'spark'} /></span><h2>{needle ? 'Không tìm thấy prompt' : `Chưa có mẫu ${activeCategory.label.toLocaleLowerCase('vi-VN')}`}</h2><p>{needle ? 'Thử tên sản phẩm, nguyên liệu hoặc phong cách ngắn hơn.' : 'Các mẫu thuộc nhóm này sẽ được bổ sung dần. Bạn có thể chọn một chủ đề khác để tiếp tục.'}</p></div>}
      </main>
    </div>
    {active && <PromptEditor template={active} onClose={() => setActive(null)} />}
  </div>;
}

function PromptEditor({ template, onClose }: { template: PromptTemplate; onClose: () => void }) {
  const [values, setValues] = useState<PromptValues>(() => promptDraftRepository.read(template));
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return; }
      if (event.key !== 'Tab') return;
      const dialog = closeRef.current?.closest('.prompt-editor-dialog');
      const focusable = dialog ? Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary')) : [];
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', handleKeys);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', handleKeys); };
  }, [onClose]);
  useEffect(() => promptDraftRepository.write(template.id, values), [template.id, values]);

  const update = (key: string, value: string) => { setValues(current => ({ ...current, [key]: value })); setErrors([]); setCopied(false); };
  const generate = () => {
    const missing = getMissingPromptFields(template, values);
    setErrors(missing);
    if (missing.length) return;
    setOutput(renderPrompt(template, values));
    requestAnimationFrame(() => outputRef.current?.focus());
  };
  const reset = () => { promptDraftRepository.clear(template.id); setValues(createPromptValues(template)); setOutput(''); setErrors([]); setCopied(false); };
  const copy = async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); setCopied(true); }
    catch { outputRef.current?.select(); document.execCommand('copy'); setCopied(true); }
  };
  const primary = template.fields.filter(field => !field.advanced);
  const advanced = template.fields.filter(field => field.advanced);

  return <div className="prompt-dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="prompt-editor-dialog" role="dialog" aria-modal="true" aria-labelledby="prompt-editor-title">
      <header className="prompt-editor-header"><div><p>{template.caption}</p><h2 id="prompt-editor-title">{template.cardTitle}</h2></div><button ref={closeRef} className="icon-button" type="button" onClick={onClose} aria-label="Đóng trình tạo prompt"><Icon name="close" /></button></header>
      <div className="prompt-editor-body">
        <form className="prompt-editor-form" onSubmit={event => { event.preventDefault(); generate(); }}>
          <img className="prompt-editor-thumb" src={imageUrl(template)} alt={template.thumbnailAlt} width="640" height="360" />
          <p className="prompt-editor-description">{template.title}</p>
          {errors.length > 0 && <div className="prompt-error" role="alert"><strong>Hãy điền các trường bắt buộc:</strong> {errors.join(', ')}</div>}
          <fieldset><legend>Thông tin chính</legend><div className="prompt-fields">{primary.map(field => <PromptFieldControl key={field.key} field={field} value={values[field.key] ?? ''} onChange={value => update(field.key, value)} />)}</div></fieldset>
          {advanced.length > 0 && <details className="prompt-advanced"><summary>{template.advancedLabel || 'Tùy chỉnh nâng cao'}<span>{advanced.length} mục</span></summary><div className="prompt-fields">{advanced.map(field => <PromptFieldControl key={field.key} field={field} value={values[field.key] ?? ''} onChange={value => update(field.key, value)} />)}</div></details>}
          <div className="prompt-form-actions"><button className="prompt-reset" type="button" onClick={reset}>Đặt lại</button><button className="prompt-generate" type="submit"><Icon name="spark" size={18}/> Tạo prompt</button></div>
        </form>
        <section className="prompt-output-panel" aria-label="Prompt hoàn chỉnh">
          <div className="prompt-output-head"><div><span>KẾT QUẢ</span><h3>Prompt hoàn chỉnh</h3></div><span>{output.length.toLocaleString('vi-VN')} ký tự</span></div>
          {output ? <><textarea ref={outputRef} value={output} onChange={event => { setOutput(event.target.value); setCopied(false); }} aria-label="Nội dung prompt hoàn chỉnh"/><div className="prompt-output-actions"><button type="button" className="prompt-copy" onClick={copy}><Icon name={copied ? 'spark' : 'scan'} size={18}/>{copied ? 'Đã sao chép' : 'Sao chép prompt'}</button><a href="https://gemini.google.com/app" target="_blank" rel="noreferrer" onClick={() => void copy()}>Mở Gemini <Icon name="external" size={15}/></a><a href="https://www.dola.com/chat/create-image" target="_blank" rel="noreferrer" onClick={() => void copy()}>Mở Dola <Icon name="external" size={15}/></a></div></> : <div className="prompt-output-empty"><span className="icon-tile large"><Icon name="spark" /></span><h3>Prompt sẽ xuất hiện ở đây</h3><p>Điền thông tin ở bên trái và bấm “Tạo prompt”. Bạn vẫn có thể sửa nội dung trước khi sao chép.</p></div>}
        </section>
      </div>
    </section>
  </div>;
}

function PromptFieldControl({ field, value, onChange }: { field: PromptTemplate['fields'][number]; value: string; onChange: (value: string) => void }) {
  const id = `prompt-field-${field.key}`;
  return <label className="prompt-field" htmlFor={id}><span>{field.label}{field.optional && <small>Tùy chọn</small>}</span>{field.options ? <select id={id} value={value} onChange={event => onChange(event.target.value)}>{field.options.map(option => <option key={option}>{option}</option>)}</select> : <textarea id={id} rows={value.length > 70 ? 3 : 1} value={value} placeholder={field.placeholder} required={!field.optional} onChange={event => onChange(event.target.value)} />}</label>;
}
