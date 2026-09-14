# ADR-0001 — Chọn nền tảng prototype và ranh giới module

Ngày: 14/09/2026 · Trạng thái: accepted for prototype, production hosting còn mở.

## Bối cảnh

DesignForge bắt đầu từ repo trống. Master plan đề xuất Next.js App Router, nhưng source tham khảo HyperDesignDev là React/esbuild và không có yêu cầu backend trong P0. Bản đầu cần kiểm chứng visual flow nhanh, đồng thời giữ ranh giới để thay local repository bằng HTTP sau này.

## Quyết định

- Dùng React + TypeScript strict + esbuild cho prototype đầu tiên.
- Dùng hash route ổn định (`#/tools/barcode`, `#/resources`,...) trong prototype để không phụ thuộc server rewrite khi chạy static preview.
- Dữ liệu catalog nằm trong `src/data/catalog.ts`, truy cập qua `CatalogRepository` local; component không import metadata rời rạc từ route.
- Dùng token CSS semantic names; icon inline SVG cùng visual language.
- Dùng CSS responsive mobile-first, một bố cục duy nhất; không chuyển workspace/layout.
- Dựng Shell → catalog → tool workspace trước khi port engine legacy. Engine barcode/PDF/image/OCR sẽ là feature modules lazy-load ở các mốc sau.
- Giữ Next.js là lựa chọn cần đánh giá lại nếu P1/P5 yêu cầu SSR/metadata/CMS/HTTP caching. Không scaffold hai framework cùng lúc.

## Hệ quả

- Prototype chạy được với `npm run build` và static server, deep link hash không cần rewrite.
- Chưa có SSR, server metadata hoặc HTTP repository thật; đây là giới hạn có chủ đích của P1.
- Khi chuyển sang Next.js (nếu cần), domain types, catalog schema, repository contract và feature UI có thể giữ; composition/route adapter cần thay.

## Kiểm chứng

- `npm run check`: pass.
- `npm run build`: pass và sinh `dist/index.html`, `dist/assets/app.js`, `dist/assets/app.css`.
- `npm test`: 3 architecture tests pass.
- Local browser viewport 424 × 698: DOM mount, route navigation, search, save, barcode preview và console logs không lỗi.

## Việc phải rà lại ở P1/P5

- Test worker/PDF.js/font handling trong production chunk.
- Xác định hosting thực tế và có cần chuyển sang Next App Router hay không.
- Thêm route-level code splitting khi các tool engine được đưa vào.
