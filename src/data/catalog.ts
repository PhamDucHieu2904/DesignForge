import type { CatalogItem, ToolDefinition } from '../domain/types';

export const tools: ToolDefinition[] = [
  { id: 'barcode', slug: 'barcode', kind: 'tool', title: 'Barcode & QR', summary: 'Tạo mã chuẩn, xem trước và xuất file cho quy trình in ấn.', category: 'Mã & in ấn', tags: ['EAN-13', 'UPC-A', 'QR', 'SVG', 'PNG'], icon: 'scan', runtime: 'client', availability: 'ready', meta: '6 chuẩn mã', capabilities: ['EAN-13', 'UPC-A', 'ITF-14', 'Code 128', 'GS1-128', 'QR Code'], inputFormats: ['Chuỗi văn bản'], outputFormats: ['SVG', 'PDF', 'PNG'] },
  { id: 'images-to-pdf', slug: 'images-to-pdf', kind: 'tool', title: 'Ảnh thành PDF', summary: 'Gom nhiều ảnh thành PDF, đổi thứ tự và chọn kích thước giấy.', category: 'PDF', tags: ['A4', 'JPG', 'PNG', 'TIFF'], icon: 'file', runtime: 'client', availability: 'ready', meta: 'Nhiều ảnh', capabilities: ['Import ảnh', 'Reorder', 'A4 dọc/ngang'] },
  { id: 'merge-pdf', slug: 'merge-pdf', kind: 'tool', title: 'Ghép PDF', summary: 'Sắp xếp, gộp và kiểm tra các trang PDF trong một luồng gọn.', category: 'PDF', tags: ['PDF', 'Sắp xếp', 'Nén'], icon: 'layers', runtime: 'client', availability: 'ready', meta: 'Theo thứ tự', capabilities: ['Merge pages', 'Reorder', 'Quality modes'] },
  { id: 'pdf-editor', slug: 'pdf-editor', kind: 'tool', title: 'PDF Editor', summary: 'Thêm chữ, ảnh, shape, line và tinh chỉnh trang PDF.', category: 'PDF', tags: ['Text', 'Shape', 'Crop', 'Rotate'], icon: 'pen', runtime: 'client', availability: 'beta', meta: 'Editor nâng cao', capabilities: ['Text', 'Image', 'Shape', 'Crop', 'Rotate'] },
  { id: 'image-filter', slug: 'image-filter', kind: 'tool', title: 'Halftone Lab', summary: 'Biến ảnh thành hiệu ứng halftone với kiểm soát kích thước hạt.', category: 'Hình ảnh', tags: ['Halftone', 'SVG', 'PNG', 'PPI'], icon: 'image', runtime: 'client', availability: 'ready', meta: '4 kiểu hạt', capabilities: ['4 dot shapes', 'PPI', 'PNG', 'SVG'] },
  { id: 'images-to-gif', slug: 'images-to-gif', kind: 'tool', title: 'Ảnh thành GIF', summary: 'Ghép nhiều ảnh, sắp xếp thứ tự và chỉnh thời gian từng khung hình.', category: 'GIF', tags: ['Ảnh động', 'JPG', 'PNG', 'WebP'], icon: 'image', runtime: 'client', availability: 'ready', meta: 'Tối đa 80 ảnh', capabilities: ['Sắp xếp ảnh', 'Thời gian mỗi ảnh', 'Xem trước', 'Xuất GIF'], inputFormats: ['JPG', 'PNG', 'WebP', 'BMP'], outputFormats: ['GIF'] },
  { id: 'video-to-gif', slug: 'video-to-gif', kind: 'tool', title: 'Video thành GIF', summary: 'Cắt một đoạn video ngắn, chọn FPS và chuyển thành GIF.', category: 'GIF', tags: ['Video', 'MP4', 'WebM', 'Ảnh động'], icon: 'film', runtime: 'client', availability: 'ready', meta: 'Đoạn tối đa 20 giây', capabilities: ['Cắt đoạn', 'FPS', 'Xem trước', 'Xuất GIF'], inputFormats: ['Video trình duyệt hỗ trợ'], outputFormats: ['GIF'] },
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
  { id: 'prompt-juice-splash', slug: 'juice-splash', kind: 'prompt', title: 'Juice Splash', summary: 'Poster nước trái cây với splash và không khí mùa hè.', category: 'Product image', tags: ['Juice', 'CGI', 'Summer'], icon: 'spark', meta: '10 trường' },
  { id: 'prompt-premium-dark-splash', slug: 'premium-dark-splash', kind: 'prompt', title: 'Premium Dark Splash', summary: 'Poster đồ uống cao cấp với pedestal, nền tối và splash.', category: 'Product image', tags: ['Dark', 'Premium', 'Splash'], icon: 'spark', meta: '12 trường' },
  { id: 'prompt-frozen-fruit-macro', slug: 'frozen-fruit-macro', kind: 'prompt', title: 'Frozen Fruit Macro', summary: 'Macro sản phẩm giữa những khối đá chứa trái cây.', category: 'Product image', tags: ['Macro', 'Fruit', 'Ice'], icon: 'spark', meta: '7 trường' },
  { id: 'prompt-dynamic-ingredient-splash', slug: 'dynamic-ingredient-splash', kind: 'prompt', title: 'Dynamic Ingredient Splash', summary: 'Hero sản phẩm với nguyên liệu và splash chuyển động.', category: 'Product image', tags: ['Ingredient', 'Splash', 'Hero'], icon: 'spark', meta: '13 trường' },
  { id: 'prompt-natural-basket-lifestyle', slug: 'natural-basket-lifestyle', kind: 'prompt', title: 'Natural Basket Lifestyle', summary: 'Bối cảnh lifestyle ngoài trời với giỏ mây và nguyên liệu tự nhiên.', category: 'Product image', tags: ['Lifestyle', 'Natural', 'Basket'], icon: 'spark', meta: '1 trường' },
  { id: 'prompt-bright-orange-platform', slug: 'bright-orange-platform', kind: 'prompt', title: 'Bright Fruit Platform', summary: 'Trái cây và sản phẩm trên platform acrylic bóng.', category: 'Product image', tags: ['Fruit', 'Platform', 'Bright'], icon: 'spark', meta: '5 trường' },
  { id: 'prompt-premium-fruit-beverage-hero', slug: 'premium-fruit-beverage-hero', kind: 'prompt', title: 'Orange Power Splash', summary: 'Key visual đồ uống trái cây với splash đóng băng chuyển động.', category: 'Product image', tags: ['Orange', 'Beverage', 'Splash'], icon: 'spark', meta: '5 trường' },
  { id: 'prompt-frozen-coconut-strawberry', slug: 'frozen-coconut-strawberry', kind: 'prompt', title: 'Frozen Coconut Strawberry', summary: 'Lon sữa dừa dâu tây giữa đá lạnh và trái cây tươi.', category: 'Product image', tags: ['Coconut', 'Strawberry', 'Ice'], icon: 'spark', meta: '2 trường' },
];

export const allCatalog = [...tools, ...resources, ...skills, ...prompts];
