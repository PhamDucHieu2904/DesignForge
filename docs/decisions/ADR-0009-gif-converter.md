# ADR-0009 — GIF converter chạy trên trình duyệt

Ngày: 16/09/2026. Đã triển khai local, chưa phát hành.

## Quyết định
- Thêm nhóm Gif converter dưới Img Filter, gồm hai catalog item có route riêng: images-to-gif và video-to-gif. Nhóm có deep link #/tools?collection=gif.
- React quản lý form và vòng đời tài nguyên; media.ts đọc File/Canvas/HTMLVideoElement; settings.ts chứa kiểm tra thuần; engine.ts mã hóa bằng gifenc (MIT); worker.ts chạy mã hóa ngoài main thread.
- Build worker riêng, chỉ tải khi người dùng tạo GIF. Main bundle không chứa gifenc. Mỗi lần truyền một frame và chờ worker trả lời, không giữ toàn bộ RGBA trong RAM.
- Worker được terminate khi hoàn tất, lỗi, hủy hoặc rời workspace. Object URL, ImageBitmap, video source và canvas được giải phóng.
- Không dùng server, CDN encoder hoặc FFmpeg tải động. Video hỗ trợ codec trình duyệt hiện tại đọc được; kiểm tra lỗi/timeout khi import và seek.
- Tối đa 80 ảnh, 20 MB/ảnh và 40 MP/ảnh; video tối đa 150 MB, đoạn 20 giây, 240 frame. Tổng pixel đầu ra giới hạn 40 triệu; cạnh dài 240–960 px, không phóng lớn ảnh nguồn.
- Giữ tỷ lệ ảnh đầu tiên, contain/cover, ghép alpha lên màu nền. Bảng màu 64/128/256; không có dithering. Lặp vô hạn hoặc một lần.
- Thời gian ảnh 20–10.000 ms; video dùng mốc seek xác định, làm tròn thời gian frame theo đơn vị 10 ms của GIF.
- Giao diện theo quyết định White Purple / Mona Sans của ADR-0006. Tra cứu UI/UX Pro Max về Progress Indicators, file import, label, focus và thao tác thay thế kéo thả. Không lấy palette/style gợi ý chung trái nhận diện đã chốt.

## Kiểm chứng
29 kiểm thử pass; GIF được giải mã độc lập bằng omggif để đối chiếu pixel, thời gian, số frame, kích thước và vòng lặp.
Browser QA Edge: import/reorder hai PNG, xuất và đọc lại GIF; tạo MP4 mẫu đỏ/xanh, cắt 0.2–1.8 giây ở 5 FPS, giải mã đủ 8 frame đúng màu đầu/cuối; lỗi đoạn vượt thời lượng, ảnh hỏng và hủy được xử lý.
Desktop 1440, tablet 768, mobile 390 không tràn ngang; không pageerror ở luồng hoàn chỉnh.
Build BASE_PATH=/DesignForge xác nhận đường dẫn worker, sau đó khôi phục build local.

## Giới hạn
GIF tối đa 256 màu, không âm thanh; alpha được ghép lên màu nền. Codec video phụ thuộc trình duyệt. Giới hạn pixel có thể yêu cầu giảm kích thước/FPS/số ảnh trước khi xuất. Chưa kiểm thử trên Safari/iOS.
