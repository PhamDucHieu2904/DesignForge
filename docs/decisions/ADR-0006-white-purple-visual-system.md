# ADR-0006 — White Purple visual system

Ngày: 14/09/2026

## Trạng thái

Đã chấp nhận.

## Bối cảnh

Một task song song đã xác nhận hướng nhận diện mới: nền trắng, tím làm accent, Mona Sans và letter spacing mặc định. Bản đang chạy chứa PDF Editor ba vùng cùng các engine Barcode/PDF mới hơn nên không thể chép đè nguyên project từ task kia.

## Quyết định

- Hợp nhất theme bằng semantic token và lớp override cuối stylesheet hiện tại.
- Dùng Mona Sans cho app shell và iframe PDF Editor.
- Áp cùng palette cho page rail, stage, property inspector, dialog và controls của PDF Editor; canvas trang PDF vẫn là bề mặt trung tính để đánh giá nội dung.
- Thêm footer toàn cục với credit `by Hyper D²` và email liên hệ đã được người dùng cung cấp.
- Giữ nguyên component tree, ID, event binding, engine export và responsive architecture hiện có.

## Hệ quả

Giao diện giữa catalog và PDF Editor thống nhất mà không làm mất các thay đổi chức năng từ hai task. Các rule dark cũ còn tồn tại phía trước trong stylesheet cho tới vòng dọn token, nhưng lớp semantic cuối file là nguồn giao diện có hiệu lực.
