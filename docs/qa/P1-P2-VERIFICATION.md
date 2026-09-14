# P1/P2 verification — 14/09/2026

Phạm vi: foundation và visual prototype, chưa phải functional parity với barcode-generator.

## Automated

| Check | Result |
|---|---|
| `npm run check` | Pass — TypeScript strict không còn lỗi |
| `npm run build` | Pass — static output gồm HTML, JS và CSS |
| `npm test` | Pass — 3 tests: content groups, Remove BG absence trong shipped source, barcode/QR registry |

## Browser verification

Preview: `http://127.0.0.1:4173/` · in-app browser · viewport được trả về `439 × 698` (document client width 424).

- App shell mount đúng, sidebar desktop logic chuyển thành menu button ở mobile.
- Trang Khám phá hiển thị hero, 4 tool cards, 3 resource cards và local-first note.
- Không có horizontal overflow: `scrollWidth = clientWidth = 424`.
- Hero link mở `#/tools`; danh mục hiển thị 6 tool records.
- Search dialog mở, có focus vào input, lọc `PDF` còn 3 kết quả. Query global không còn lọc ngầm trang nền.
- Chọn `Barcode & QR` mở `#/tools/barcode`; type select có EAN-13, UPC-A, ITF-14, Code 128, GS1-128, QR Code.
- Nhập `089123456789` bật CTA; bấm tạo preview hiển thị barcode preview và trạng thái đã có dữ liệu.
- Save/unsave cập nhật aria-pressed, nav count và trang `#/saved`; repository browser local giữ dữ liệu trong namespace.
- Console sau các luồng trên: không có warning/error.

## Chưa kiểm tra ở mốc này

- Desktop rộng 1024/1440 bằng screenshot render; chỉ có mobile viewport qua browser session.
- File picker thực tế và quyền đọc file (chưa upload fixture qua UI).
- Engine xuất barcode/PDF/halftone/OCR; các nút export hiện là boundary của prototype và chưa được đánh dấu parity.
- Visual regression screenshot ổn định ở CI.

## Kết luận mốc

P1 foundation đạt điều kiện kỹ thuật prototype. P2 visual prototype đạt điều kiện review lần đầu ở mobile và được phép tiếp tục sang catalog/engine, với các giới hạn trên được giữ trong backlog.
