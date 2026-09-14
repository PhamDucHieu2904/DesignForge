# ADR-0003 — Inline barcode studio trên trang Công cụ

Ngày: 14/09/2026  
Trạng thái: accepted

## Bối cảnh

Trang `#/tools` đang dùng một ToolCard và yêu cầu người dùng bấm “Mở tool” để chuyển sang workspace chung. Form tham chiếu mới muốn người dùng nhìn thấy các chuẩn mã ngay trong trang, chọn đúng thẻ, nhập dữ liệu và tải file mà không phải chuyển ngữ cảnh.

## Quyết định

- Khi chọn nhóm Barcode, render một studio inline với 6 thẻ chuẩn mã: EAN 13, UPC-A, ITF-14, Code 128, GS1-128 và QR Code.
- Giữ đúng mật độ của ToolCard marketplace: lưới 3 cột desktop, 2 cột tablet và 1 cột mobile; không đặt thêm hero/intro riêng bên trong vùng kết quả Barcode.
- Cấu trúc thẻ theo artboard được duyệt: thumbnail trắng → title + mô tả một dòng → khung Input progressive → footer định dạng + Download. Mỗi chuẩn dùng thumbnail riêng do người dùng cung cấp trong `src/assets/`.
- Mỗi thẻ tự quản lý input và trạng thái xuất; file được tạo ở browser qua feature exporter.
- Logic chuẩn hóa dữ liệu, check digit và renderer SVG đặt ngoài React tại `src/features/barcode/engine.ts`.
- EAN-13, UPC-A và ITF-14 tự thêm check digit khi đủ số cơ sở. Dùng `jsbarcode@3.11.6`, `qrcode@1.5.4` và `pdf-lib@1.17.1`; giữ options và cách dàn/xuất của `barcode-generator/js/barcode.js` cho BC-01 đến BC-07 và BC-10.
- Input dùng progressive rows: một ô hoạt động + một ô chờ disabled; `+` kích hoạt ô tiếp theo, `−` xóa ô hoạt động cuối và chỉ xuất hiện khi có ít nhất hai ô.
- Dropdown xuất có SVG/PDF/PNG và CTA đổi nhãn theo định dạng đang chọn.
- Các nhóm PDF, Img Filter và Prompt vẫn dùng ToolCard/CTA cũ cho tới khi từng module có form inline phù hợp.

## Hệ quả

UI có ít chuyển cảnh hơn và phù hợp form mới; thêm chuẩn mã sau này chỉ cần mở rộng registry metadata và engine boundary. Download chạy hoàn toàn client-side, chưa lưu dữ liệu lên backend. Logic validation/check digit/GS1 nằm trong engine thuần; JsBarcode/QR/canvas/pdf-lib nằm trong exporter để React không sở hữu logic file.
