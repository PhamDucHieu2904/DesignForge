# ADR-0004 — PDF conversion inline, editor route riêng

Ngày: 14/09/2026  
Trạng thái: accepted

## Bối cảnh

Hai tác vụ Ảnh thành PDF và Ghép PDF là thao tác ngắn, phù hợp xử lý ngay trên trang marketplace. PDF Editor có nhiều trạng thái canvas, layer và toolbar nên cần một route làm việc riêng.

## Quyết định

- Render `images-to-pdf` và `merge-pdf` thành hai card inline trong nhóm PDF; giữ `pdf-editor` là ToolCard điều hướng tới `#/tools/pdf-editor`.
- Port hành vi từ `barcode-generator/js/pdf.js`: nhiều file, thay đổi thứ tự, xóa/thêm file, Fit/A4 dọc/A4 ngang, ba mức chất lượng, ghép trang theo thứ tự và xử lý hoàn toàn ở client.
- Tách xử lý file vào `src/features/pdf/exporter.ts`; React chỉ quản lý input và trạng thái tương tác.
- Dùng `pdf-lib@1.17.1` như source và `utif@3.1.0` để giữ đầu vào TIFF.

## Hệ quả

Hai luồng chuyển đổi không cần mở workspace trung gian. Editor vẫn có URL độc lập để tiếp tục port canvas/editor ở milestone riêng. Các file chỉ được xử lý trong browser và không được gửi tới backend.
