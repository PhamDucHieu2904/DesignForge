# ADR-0002 — Modern Creative Tech UI

Ngày: 14/09/2026

## Bối cảnh

Giao diện Warm Editorial Studio ban đầu không còn phù hợp định hướng sản phẩm. Người dùng yêu cầu làm mới toàn bộ UI, giữ nguyên route và chức năng hiện có, đồng thời tham khảo mật độ gallery/card của project Bitakon NFT Marketplace.

## Quyết định

DesignForge chuyển sang art direction **Modern Creative Tech**:

- Nền navy sâu, bề mặt glass có độ trong vừa phải và viền lạnh để tạo chiều sâu mà vẫn đọc được.
- Violet/cyan là accent chính; amber chỉ dùng cho trạng thái hoặc nhãn phụ.
- Typography IBM Plex Sans cho UI và JetBrains Mono cho metadata/eyebrow, có fallback hệ thống.
- Hero dùng gradient spotlight và grid line; catalog dùng card gallery với visual tile, hover lift nhẹ và focus rõ.
- Giữ nguyên hash routes, local saved adapter, search dialog và workspace input/preview. Refactor chỉ thay visual system, layout spacing và microcopy.
- Không đưa NFT, wallet, bid, seller hay marketplace semantics vào sản phẩm.

## Hệ quả

- `src/styles.css` là nguồn token và component styling mới; không tiếp tục dùng token Warm Editorial cũ.
- Cần browser QA lại ở 375, 768, 1024 và 1440 px sau khi cập nhật.
- Khi thêm module mới, dùng semantic tokens hiện tại và giữ icon SVG duy nhất.
