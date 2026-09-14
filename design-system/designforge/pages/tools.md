# Tools page override — Barcode cards

Ngày chốt: 14/09/2026. Nguồn chuẩn thị giác: `Artboard 3.png` và các thumbnail do người dùng cung cấp.

- Vùng kết quả Barcode dùng cùng mật độ ToolCard marketplace: 3 cột desktop, 2 cột tablet, 1 cột mobile.
- Không thêm hero, intro hoặc metadata block riêng giữa toolbar và card grid.
- Cấu trúc card cố định: thumbnail trắng → title + mô tả một dòng → khung Input → footer format + Download.
- Khung Input khởi đầu với một input hoạt động và một input chờ bị disabled, hiển thị mờ. Bấm `+` kích hoạt một input mới và sinh input chờ kế tiếp. Nút `−` chỉ xuất hiện từ hai input hoạt động và xóa input cuối.
- Nút cộng/trừ có accessible name, focus rõ và không làm dịch layout. Input số dùng `inputMode="numeric"` nhưng giữ kiểu text để không mất số 0 đầu.
- Footer có SVG, PDF, PNG. Nhãn CTA luôn phản ánh lựa chọn hiện tại: `Download as SVG/PDF/PNG`.
- Mỗi chuẩn mã dùng đúng thumbnail riêng trong `src/assets/`; không dùng một ảnh EAN thay cho mọi chuẩn.
- Download giữ semantics của nguồn cũ: SVG dàn nhiều mã theo chiều dọc trên một artboard; PDF mỗi mã một trang; PNG mỗi mã một file.
