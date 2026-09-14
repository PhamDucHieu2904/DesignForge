# PDF Editor — page override

Áp dụng cùng palette, typography và interaction tokens trong `../MASTER.md`.

## Bố cục

- Desktop: ba vùng theo thứ tự **Tệp & trang (272 px) → Canvas (co giãn) → Thuộc tính (304 px)**.
- Canvas là vùng ưu tiên thị giác. Không đặt toolbar định dạng dài phía trên canvas.
- Inspector gom thuộc tính theo nhóm: chữ & căn chỉnh; màu, viền & tỷ lệ; phím tắt.
- Thanh đáy canvas chỉ chứa tác vụ cấp trang: phạm vi áp dụng, khổ giấy, xoay và cắt.
- Thanh nổi cạnh canvas chỉ chứa tác vụ tạo đối tượng: chữ, ảnh, shape, line và Thay chữ nâng cao.

## Responsive

- Dưới 980 px: xếp Tệp & trang → Thuộc tính → Canvas. Inspector chuyển thành khối ngang hai phần trên tablet.
- Dưới 680 px: inspector trở về một cột. Không ẩn điều khiển định dạng.
- Vùng upload, nút thao tác và control quan trọng giữ target tối thiểu 44 px khi dùng cảm ứng.

## Trạng thái

- Header canvas luôn cho biết chưa chọn trang hoặc `Trang N / tổng`.
- Inspector cho biết đang chỉnh trang hay đối tượng; control không phù hợp dùng trạng thái `disabled` thật.
- Empty state giải thích bước tiếp theo và không giả lập nội dung PDF.
