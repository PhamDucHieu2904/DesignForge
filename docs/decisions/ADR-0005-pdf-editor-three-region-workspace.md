# ADR-0005 — PDF Editor dùng workspace ba vùng

Ngày: 14/09/2026  
Trạng thái: accepted

## Bối cảnh

Bản port đầu tiên giữ cấu trúc của công cụ nguồn: thư viện trang bên trái, một toolbar dài phía trên và canvas ở giữa. Cách bố trí này đưa đủ chức năng sang DesignForge nhưng vẫn mang cảm giác của ứng dụng cũ, làm canvas bị nén theo chiều dọc và không tạo được thứ bậc rõ giữa nội dung, công cụ và thuộc tính.

## Quyết định

- Tổ chức PDF Editor thành ba vùng độc lập trên desktop: thư viện tệp/trang bên trái, canvas co giãn ở giữa và inspector thuộc tính bên phải.
- Chuyển nguyên cụm điều khiển font, kiểu chữ, cỡ chữ, căn chỉnh, màu, viền và zoom vào inspector sau khi DOM sẵn sàng. Giữ nguyên toàn bộ ID để các event handler của engine cũ tiếp tục hoạt động.
- Thêm header trạng thái cho canvas và context động trong inspector theo trang/đối tượng đang chọn.
- Giữ nhóm thao tác trang ở thanh dưới canvas; giữ nhóm thêm chữ, ảnh, shape, line và Thay chữ nâng cao cạnh canvas.
- Dưới 980 px, xếp thư viện → inspector → canvas theo chiều dọc. Inspector không bị ẩn để người dùng vẫn truy cập được các điều khiển định dạng.

## Hệ quả

Canvas có không gian tập trung rõ hơn và các thuộc tính nằm đúng ngữ cảnh chỉnh sửa. Lớp bố cục mới chỉ điều phối DOM và trạng thái trình bày; logic import, chỉnh sửa, OCR cục bộ, thay chữ nâng cao và xuất file không đổi. Khi tách editor thành React module sau này, boundary ba vùng này là cấu trúc UI cần giữ.
