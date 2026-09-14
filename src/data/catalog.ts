import type { CatalogItem, ToolDefinition } from '../domain/types';

export const tools: ToolDefinition[] = [
  { id: 'barcode', slug: 'barcode', kind: 'tool', title: 'Barcode & QR', summary: 'Tạo mã chuẩn, xem trước và xuất file cho quy trình in ấn.', category: 'Mã & in ấn', tags: ['EAN-13', 'UPC-A', 'QR', 'SVG', 'PNG'], icon: 'scan', runtime: 'client', availability: 'ready', meta: '6 chuẩn mã', capabilities: ['EAN-13', 'UPC-A', 'ITF-14', 'Code 128', 'GS1-128', 'QR Code'], inputFormats: ['Chuỗi văn bản'], outputFormats: ['SVG', 'PDF', 'PNG'] },
  { id: 'images-to-pdf', slug: 'images-to-pdf', kind: 'tool', title: 'Ảnh thành PDF', summary: 'Gom nhiều ảnh thành PDF, đổi thứ tự và chọn kích thước giấy.', category: 'PDF', tags: ['A4', 'JPG', 'PNG', 'TIFF'], icon: 'file', runtime: 'client', availability: 'ready', meta: 'Nhiều ảnh', capabilities: ['Import ảnh', 'Reorder', 'A4 dọc/ngang'] },
  { id: 'merge-pdf', slug: 'merge-pdf', kind: 'tool', title: 'Ghép PDF', summary: 'Sắp xếp, gộp và kiểm tra các trang PDF trong một luồng gọn.', category: 'PDF', tags: ['PDF', 'Sắp xếp', 'Nén'], icon: 'layers', runtime: 'client', availability: 'ready', meta: 'Theo thứ tự', capabilities: ['Merge pages', 'Reorder', 'Quality modes'] },
  { id: 'pdf-editor', slug: 'pdf-editor', kind: 'tool', title: 'PDF Editor', summary: 'Thêm chữ, ảnh, shape, line và tinh chỉnh trang PDF.', category: 'PDF', tags: ['Text', 'Shape', 'Crop', 'Rotate'], icon: 'pen', runtime: 'client', availability: 'beta', meta: 'Editor nâng cao', capabilities: ['Text', 'Image', 'Shape', 'Crop', 'Rotate'] },
  { id: 'image-filter', slug: 'image-filter', kind: 'tool', title: 'Halftone Lab', summary: 'Biến ảnh thành hiệu ứng halftone với kiểm soát kích thước hạt.', category: 'Hình ảnh', tags: ['Halftone', 'SVG', 'PNG', 'PPI'], icon: 'image', runtime: 'client', availability: 'ready', meta: '4 kiểu hạt', capabilities: ['4 dot shapes', 'PPI', 'PNG', 'SVG'] },
  { id: 'prompt-builder', slug: 'prompt-builder', kind: 'tool', title: 'Prompt Builder', summary: 'Điền thông tin theo mẫu và tạo prompt hình ảnh có cấu trúc.', category: 'Prompt', tags: ['Juice', 'Product', 'Commercial'], icon: 'spark', runtime: 'client', availability: 'ready', meta: '8 template', capabilities: ['8 templates', 'Advanced fields', 'Copy output'] },
];

export const resources: CatalogItem[] = [
  { id: 'r-01', slug: 'type-foundry', kind: 'resource', title: 'Type Foundry', summary: 'Danh sách foundry và nguồn typeface để bắt đầu một hệ chữ có chủ đích.', category: 'Typography', tags: ['Font', 'Branding'], icon: 'pen', meta: 'Đang biên tập' },
  { id: 'r-02', slug: 'print-ready-checklist', kind: 'resource', title: 'Print-ready checklist', summary: 'Các bước rà file trước khi gửi in: màu, bleed, font và kích thước.', category: 'In ấn', tags: ['Print', 'Preflight'], icon: 'file', meta: 'Checklist' },
  { id: 'r-03', slug: 'mockup-shelf', kind: 'resource', title: 'Mockup Shelf', summary: 'Kho mockup có chọn lọc cho bao bì, poster và bộ nhận diện.', category: 'Mockup', tags: ['Packaging', 'Branding'], icon: 'layers', meta: 'Nguồn đang xác minh' },
  { id: 'r-04', slug: 'palette-notes', kind: 'resource', title: 'Palette Notes', summary: 'Cách xây palette có ngữ nghĩa và kiểm tra contrast khi bàn giao UI.', category: 'UI/UX', tags: ['Color', 'Accessibility'], icon: 'spark', meta: 'Bài đọc' },
];

export const skills: CatalogItem[] = [
  { id: 's-01', slug: 'ui-preflight', kind: 'skill', title: 'UI Preflight', summary: 'Rà hierarchy, focus, responsive và trạng thái trước khi bàn giao.', category: 'UI/UX', tags: ['Review', 'Accessibility'], icon: 'sliders', meta: '6 bước' },
  { id: 's-02', slug: 'brand-foundations', kind: 'skill', title: 'Brand Foundations', summary: 'Từ định vị, giọng nói đến token để một thương hiệu nhất quán.', category: 'Brand', tags: ['Identity', 'Tokens'], icon: 'layers', meta: 'Quy trình' },
  { id: 's-03', slug: 'editorial-layout', kind: 'skill', title: 'Editorial Layout', summary: 'Dùng lưới, nhịp chữ và khoảng thở để làm nội dung dễ đọc hơn.', category: 'Graphic design', tags: ['Grid', 'Typography'], icon: 'pen', meta: 'Hướng dẫn' },
];

export const prompts: CatalogItem[] = [
  { id: 'p-01', slug: 'juice-splash', kind: 'prompt', title: 'Juice Splash', summary: 'Key visual đồ uống commercial với splash, đá lạnh và sản phẩm trung tâm.', category: 'Product image', tags: ['Juice', 'CGI', 'Summer'], icon: 'spark', meta: 'Template' },
  { id: 'p-02', slug: 'premium-dark-splash', kind: 'prompt', title: 'Premium Dark Splash', summary: 'Một hướng ánh sáng tối, giàu tương phản cho visual đồ uống cao cấp.', category: 'Product image', tags: ['Dark', 'Premium'], icon: 'spark', meta: 'Template' },
  { id: 'p-03', slug: 'frozen-fruit-macro', kind: 'prompt', title: 'Frozen Fruit Macro', summary: 'Macro trái cây trong đá, giữ cấu trúc prompt để tạo series nhất quán.', category: 'Product image', tags: ['Macro', 'Fruit'], icon: 'spark', meta: 'Template' },
];

export const allCatalog = [...tools, ...resources, ...skills, ...prompts];
