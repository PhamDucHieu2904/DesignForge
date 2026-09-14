# DesignForge — Source audit và migration inventory

Snapshot đọc source: 12/09/2026. Không sửa các project nguồn. Chưa chạy functional baseline.

## 1. Nguồn

| Nguồn | Đường dẫn | Vai trò |
|---|---|---|
| Bộ skill | `D:/program project/ui-ux-pro-max-skill-main` | Kiến thức và quy trình thiết kế |
| Website tham chiếu | `D:/program project/HyperDesignDev` | Layout language, màu ấm, khung mềm |
| Công cụ nguồn | `D:/program project/barcode-generator` | Engine, tính năng, prompt và asset cần chuyển |
| Project đích | `D:/program project/DesignForge` | Repo DesignForge hiện tại; mã nguồn đã được chuyển về thư mục này |

## 2. HyperDesignDev

Files đã khảo sát: `package.json`, `app/page.tsx`, phần đầu `app/globals.css`, design master portfolio; đã liệt kê cấu trúc app/build/contracts.

- React 19.2.6, TypeScript 5.9.3, esbuild 0.28.0, Lucide; đây là phiên bản ghi trong source, không phải đề xuất pin cho DesignForge.
- Có scripts/preview, build, shared contracts và workers. Không cần kế thừa provider/backend của nguồn.
- CSS dùng paper/surface/ink/rose, khung bo 29 px, rail nhỏ, nhiều scene/layout.
- Có logic layout picker và drag-switch ở LeftRail; không chuyển sang DesignForge.
- Source có typography riêng Google Sans Flex/Designer, nhiều absolute positioning và viewport-locked shell.
- Portfolio master nhấn mạnh đọc được, không ép case study trong một màn hình, không bịa số liệu; giữ tinh thần này trong catalog/skill.

Đánh giá trên là đọc source, không phải báo cáo visual QA của toàn website đang chạy.

## 3. barcode-generator — cấu trúc và dependencies

- `index.html`: sidebar, các section công cụ, script tags và controls.
- `js/app.js`: section switching, barcode type switch, bootstrap mọi module và popup AI tool cũ.
- `js/barcode.js`: validation/render/export barcode và QR; `jsbarcode.js` có ở root nhưng HTML đang tham chiếu CDN, cần xác định bản thực dùng trong baseline.
- `js/pdf.js`: luồng ảnh→PDF, ghép PDF, dropzone/reorder và hướng dẫn.
- `js/edit-pdf-*.js`: document state, canvas, shapes, toolbar, dropzone, export, font detection, scan và thay chữ nâng cao.
- `js/image-filter.js`: halftone preview và SVG/PNG export.
- `js/prompt-generator.js`: renderer, template interpolation, field storage, copy/provider links.
- `js/prompt-templates.js`: registry 8 template.
- `js/guide-data.json`: hướng dẫn Combine, Merge và Edit PDF.
- CSS riêng cho barcode, PDF, prompt, image filter, global/responsive.

Dependencies nhìn thấy trong HTML/source:

| Thư viện/dịch vụ | Phiên bản nguồn hoặc hành vi | Việc kiểm tra khi port |
|---|---|---|
| JsBarcode | 3.11.6 từ CDN | Chuẩn mã/checksum/output; dependency package |
| qrcodejs | 1.0.0 từ CDN | QR encoding, export vector/raster |
| pdf-lib | 1.17.1 từ CDN | Copy pages, fonts, exports |
| @pdf-lib/fontkit | 1.1.1 từ CDN | Font embedding và tương thích |
| PDF.js | 2.16.105 + worker cùng version | Render/text layer, nâng version có kiểm thử |
| UTIF | 3.1.0 | TIFF decode và phạm vi định dạng |
| Tesseract.js | 7.0.0 tải động từ font detector | Worker/model, eng/vie, fallback eng |
| Google Fonts | Font matching/load và export fetch font | Quyền dùng, latency/offline/fallback |
| Gemini/Dola | URL mở provider trong prompt builder | Link phải kiểm tra lại lúc triển khai; không phải API tích hợp |

Không phát hiện fetch API tạo ảnh trong `edit-pdf-ai.js` qua khảo sát này; không dùng kết luận đó thay cho network audit toàn bộ luồng chạy. Những file ComfyUI/proxy ở root không tự động thuộc dependency ship.

## 4. Feature parity matrix

Trạng thái tất cả mục “Giữ” ở snapshot: **đã phát hiện trong source, chưa migrate, chưa kiểm chứng runtime**. “Giữ” biểu thị phạm vi cam kết, không phải tính năng đã nghiệm thu.

| ID | Capability | Nguồn chính | Đích | Phạm vi |
|---|---|---|---|---|
| BC-01 | EAN-13 | index, barcode.js | barcode | Giữ |
| BC-02 | UPC-A | index, barcode.js | barcode | Giữ |
| BC-03 | ITF-14 | index, barcode.js | barcode | Giữ |
| BC-04 | Code 128 | index, barcode.js | barcode | Giữ |
| BC-05 | GS1-128 | index, barcode.js | barcode | Giữ; test separator riêng |
| BC-06 | QR Code | index, barcode.js | qr-code | Giữ |
| BC-07 | Nhiều hàng input, thêm/xóa | barcode.js | shared barcode form | Giữ |
| BC-08 | Font, text size/margin, bar dimensions | index, barcode.js | properties | Giữ |
| BC-09 | Margin, màu, hiển thị số, QR size | index, barcode.js | properties | Giữ |
| BC-10 | SVG/PDF/PNG export | barcode.js | exporters | Giữ; matrix từng type cần runtime baseline |
| PR-01 | 8 prompt templates và bản gốc/ảnh | prompt-templates.js, assets/prompts | content/prompts | Giữ |
| PR-02 | Basic/advanced fields, options, defaults | prompt-generator.js | builder form | Giữ |
| PR-03 | Literal interpolation, legacy replacements | prompt-generator.js | prompt engine | Giữ |
| PR-04 | Sửa output, copy, character count | prompt-generator.js | output panel | Giữ |
| PR-05 | Field presets trên trình duyệt | prompt-generator.js | browser adapter | Giữ; không tự migrate cross-origin |
| PR-06 | Nhóm Juice/Coffee/Energy/Aloe vera | index, prompt registry | taxonomy | Giữ dữ liệu; nhóm trống xử lý rõ |
| PR-07 | Mở Gemini/Dola, fallback | prompt-generator.js | external provider links | Giữ; người dùng chủ động |
| IM-01 | Import/drop image, preview/reset | image-filter.js | image-filter | Giữ |
| IM-02 | Halftone circle/triangle/square/diamond | index, image-filter.js | halftone engine | Giữ |
| IM-03 | Color, min/max, spacing, contrast | image-filter.js | controls | Giữ |
| IM-04 | PPI, px/mm, artboard | image-filter.js | measurements | Giữ |
| IM-05 | Bỏ chấm vùng trắng/gần trắng | image-filter.js | sampling algorithm | Giữ theo baseline |
| IM-06 | PNG/SVG | image-filter.js | exporters | Giữ |
| PD-01 | Ảnh→PDF, nhiều file/reorder/xóa | pdf.js | images-to-pdf | Giữ |
| PD-02 | Fit/A4 portrait/landscape, quality modes | pdf.js, guide-data | images-to-pdf | Giữ |
| PD-03 | TIFF support qua util | utils.js, UTIF | image decoder | Giữ phạm vi decoder thực tế |
| PD-04 | Ghép PDF/reorder/compression | pdf.js | merge-pdf | Giữ |
| ED-01 | Import PDF, append PDF/ảnh | edit-pdf-dropzone.js | pdf-editor | Giữ |
| ED-02 | Chọn/xóa/reorder trang | state/dropzone/toolbar | page manager | Giữ |
| ED-03 | Thêm text/ảnh, style/font | canvas/toolbar | editor commands | Giữ |
| ED-04 | Shape, line, arrow, modifier keys | shapes/toolbar | editor commands | Giữ, thêm control hiện rõ |
| ED-05 | Zoom/pan | toolbar/canvas | viewport | Giữ |
| ED-06 | Paper resize/rotate/crop/apply-all | toolbar/export | page transforms | Giữ |
| ED-07 | Export PDF flatten/original | export/toolbar | exporters | Giữ; tên mode không chứng minh fidelity |
| ED-08 | Export image page/all | export/toolbar | exporters | Giữ |
| ED-09 | Add Image với hòa viền | guide-data/canvas/toolbar | image command | Giữ theo baseline |
| ED-10 | Text layer/OCR vùng chọn | font-detect/ai | text recognition | Giữ |
| ED-11 | Font matching/tùy chỉnh | font-detect/ai | font service | Giữ |
| ED-12 | Scan effects, thay chữ, mở lại object | scan-effects/ai | replacement tool | Giữ |
| HP-01 | Hướng dẫn Combine/Merge/Edit | guide-data.json | tool guides | Giữ nội dung, viết lại UI |
| EX-01 | AI Remove BG disabled | index.html | Không có | Loại theo yêu cầu |
| EX-02 | Popup focus stealing | app.js | Không có | Hành vi cũ không cần giữ |
| EX-03 | Comfy history/proxy workflows | root artifacts | Không ship mặc định | Chỉ đọc nếu audit xác nhận cần |

Undo/redo được đưa vào thiết kế mới để editor dùng an toàn; chưa khẳng định nguồn có đầy đủ command history.

## 5. Prompt inventory chính xác tại snapshot

| ID | Tên card nguồn | Category nguồn |
|---|---|---|
| juice-splash | Juice Splash | juice |
| premium-dark-splash | Premium Dark Splash | juice |
| frozen-fruit-macro | Frozen Fruit Macro | juice |
| dynamic-ingredient-splash | Dynamic Ingredient Splash | juice |
| natural-basket-lifestyle | Natural Basket Lifestyle | aloe-vera |
| bright-orange-platform | Bright Fruit Platform | juice |
| premium-fruit-beverage-hero | Orange Power Splash | juice |
| frozen-coconut-strawberry | Frozen Coconut Strawberry | juice |

Tổng: 8 template, 7 Juice và 1 Aloe vera. Coffee/Energy có navigation nhưng chưa thấy template trong registry hiện hành. Đếm dựa trên registry, không suy từ số section trong README.

Kiểm tra bổ sung trong lượt kế hoạch: registry parse được đủ 8 template, 8/8 thumbnail path tồn tại trên đĩa. Chưa kiểm chứng hình ảnh render hoặc mọi bản prompt gốc.

Khi chuyển: kiểm tra nội dung master, fields, `legacyReplacements`, placeholder, bản gốc trong assets và chất lượng thumbnail thực tế. Không đổi ID `bright-orange-platform` chỉ vì cardTitle khác.

## 6. Baseline bắt buộc trước khi port

Mỗi capability ghi: input fixture → options → output nguồn → expected behavior → vấn đề nguồn → output DesignForge → bằng chứng đối chiếu → trạng thái.

- Barcode: một mẫu hợp lệ, không hợp lệ và leading-zero cho mỗi loại phù hợp; GS1 test riêng.
- QR: URL, tiếng Việt và chuỗi dài.
- Prompt: đủ 8 mẫu với default và tùy chỉnh; slogan trống và literal characters.
- Halftone: ảnh trắng/đen/gradient, alpha, 4 shape, PPI và output dimensions.
- PDF: 1 trang, nhiều trang, nhiều kích thước, text/vector, ảnh scan, font Việt; rotate/crop và export modes.
- OCR: PDF có text layer, scan Anh, scan Việt, font không có, tải model lỗi.
- Network: phân biệt file xử lý tại máy với tải thư viện/font/model; ghi đúng thông tin privacy của tool.

Không cần scan/quét hết lịch sử Git hoặc nội dung Comfy lớn để lập inventory. Chỉ mở khi một dependency hoặc hành vi thực tế dẫn tới chúng.

## 7. Cập nhật triển khai Barcode — 14/09/2026

- Đã đọc lại `barcode-generator/js/barcode.js` trước khi port; source vẫn dùng JsBarcode 3.11.6, qrcodejs 1.0.0 và pdf-lib 1.17.1.
- DesignForge đã nối `jsbarcode@3.11.6`, `qrcode@1.5.4` và `pdf-lib@1.17.1`. QR package khác implementation cũ nhưng giữ QR error correction M và output SVG/PDF/PNG; file đầu ra đã được mở lại để kiểm chứng.
- BC-01 đến BC-07 và BC-10 đã có implementation client-side: check digit EAN/UPC/ITF, Code 128, GS1 FNC1/display value, QR thật, tối đa 20 input, thêm/xóa, SVG dàn dọc, PDF mỗi mã một trang, PNG mỗi mã một file.
- BC-08 và BC-09 chưa được đưa vào card compact vì lượt này chưa có UI properties tương ứng. Chưa đánh dấu toàn bộ P4A hoàn thành.
