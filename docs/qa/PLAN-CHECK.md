# Kiểm tra tài liệu kế hoạch — 12/09/2026

- Kiểm tra 7 file Markdown: các liên kết nội bộ hiện có đều trỏ tới file tồn tại.
- Không có ký tự zero-width space trong tài liệu.
- Registry prompt nguồn parse được: 8 template; phân bố {'juice': 7, 'aloe-vera': 1}.
- 8/8 đường dẫn thumbnail trong registry tồn tại trên đĩa; chưa visual QA thumbnail.

| Cặp màu đề xuất | Contrast | Ngưỡng |
|---|---:|---:|
| Text/canvas | 14.61:1 | 4.5:1 |
| Secondary/canvas | 5.72:1 | 4.5:1 |
| White/brand | 6.53:1 | 4.5:1 |
| White/hover | 8.58:1 | 4.5:1 |
| Brand/soft | 5.28:1 | 4.5:1 |
| Sage text/soft | 7.11:1 | 4.5:1 |
| Control border/surface | 3.94:1 | 3:1 |

Các phép đo là màu solid ở palette đề xuất, chưa thay thế kiểm tra trên UI render thật với hover/opacity/background thực tế.
Chưa có ứng dụng để chạy build/E2E hoặc kiểm chứng barcode/PDF/OCR. Không có test chức năng nguồn được tuyên bố đã pass.
