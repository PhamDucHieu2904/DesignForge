# Gif converter
Theo ADR-0006: nền sáng, surface trắng, Mona Sans, accent tím và semantic tokens hiện hành.
Hai card đặt cạnh nhau trên desktop, một cột mobile; minh họa GIF bằng CSS và icon SVG cùng hệ.
Workspace: form bên trái, preview bên phải; mobile về một cột. Không có hero lớn.
Form có ba bước: nguồn, chuyển động, chất lượng. Nhãn/đơn vị luôn hiện; select nền trắng, caret tam giác.
Một CTA Tạo GIF, tiến độ theo frame thực, Hủy khi đang xử lý; lỗi đặt gần CTA, giữ tệp để thử lại.
Ảnh có thumbnail, thời gian mỗi frame và nút lên/xuống/xóa. Video có controls và start/end numeric.
Preview phân biệt nguồn với file GIF đã mã hóa; link tải chỉ xuất hiện sau khi tạo thành công, bị xóa khi thay đổi thiết lập.
