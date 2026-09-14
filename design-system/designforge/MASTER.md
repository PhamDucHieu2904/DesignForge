# DesignForge — Design system master

Ngày: 14/09/2026 · v2.1 · White Purple creative system.

## 1. Tính cách và nguyên tắc

**Modern Creative Tech sáng:** nền trắng và lavender rất nhạt, chữ tím đen dễ đọc, tím làm điểm nhấn, bề mặt sạch và nhịp card kiểu creative marketplace.

Ưu tiên: nội dung đọc được → điều hướng rõ → thao tác chính nổi bật → nhất quán → chi tiết trang trí.

Tỷ lệ cảm giác: 65% nền sáng và khoảng thở, 25% content/card surface, 10% tím accent. Đây là định hướng thị giác, không phải công thức CSS cứng.

Một giao diện cố định, responsive theo kích thước màn hình. Không có đổi layout, đổi wallpaper, dock hệ điều hành, cửa sổ kéo thả hoặc widget giả lập.

## 2. Căn cứ từ nguồn

| Đặc điểm nguồn tham khảo | Cách dùng trong DesignForge |
|---|---|
| Gallery/card rhythm và header nổi của Bitakon | Lấy mật độ visual, nhịp card và cảm giác gallery; không lấy NFT, wallet hay marketplace semantics |
| Khung nội dung bo mềm | AppShell và card bo 16–24 px; dùng surface trắng, viền tím xám nhẹ và bóng mềm |
| Rail bên trái | Header ngang có nhãn rõ, active underline và focus ring |
| Hero giàu hình ảnh | Hero có mảng lavender, hình học tiết chế và CTA tím chính |
| Nhiều layout và hiệu ứng wallpaper | Không chuyển sang DesignForge |
| `overflow: hidden` trên toàn trang, bố cục absolute | Trang catalog/bài đọc cuộn tự nhiên; chỉ workspace canvas có vùng cuộn riêng |
| Google Sans Flex/Designer assets | Không tự copy font; chọn font có quyền sử dụng, hỗ trợ tiếng Việt và kiểm chứng ở prototype |

Tra cứu skill thực tế:

- Các truy vấn skill trước được giữ làm dữ liệu tham khảo cho layering, contrast, CTA và grid; dark/neon không còn là theme sản phẩm.
- Bitakon chỉ còn là visual reference cho card density và gallery rhythm; DesignForge dùng nhận diện trắng tím riêng và không chuyển NFT commerce semantics.

Màu và kích thước dưới đây là lựa chọn có chủ đích của dự án từ brief + nguồn, không được trình bày như output nguyên bản của skill.

## 3. Palette white purple

| Semantic token | Màu đề xuất | Vai trò |
|---|---|---|
| `canvas` | `#F8F7FC` | Nền website |
| `surface` | `#FFFFFF` | Card và panel |
| `surface-hover` | `#F4F1FA` | Hover card/control |
| `text` | `#211A2D` | Nội dung chính |
| `text-secondary` | `#625A70` | Nội dung phụ |
| `text-tertiary` | `#786F87` | Metadata/placeholder |
| `border` | `rgba(83,56,123,.14)` | Viền mặc định |
| `border-strong` | `rgba(83,56,123,.28)` | Viền control/focus |
| `accent` | `#7C45D6` | CTA/active/brand |
| `accent-strong` | `#6632BD` | CTA hover/pressed |
| `cyan` | `#9A68DF` | Secondary accent cùng họ tím |
| `amber` | `#F59E0B` | Beta/warning |
| `success` | `#2DD4BF` | Sẵn sàng/thành công |
| `focus` | `#6D3CC3` | Focus ring |

Đo từng cặp dùng thực tế, gồm opacity, hover, focus và ảnh nền. Divider trang trí không thay cho biên điều khiển. Không dùng text-secondary với opacity thấp thêm một lần.

Không tô màu mỗi card một màu đậm. Nhận diện danh mục dùng icon, label và accent phụ tiết chế.

## 4. Typography

- Toàn bộ UI dùng **Mona Sans**, fallback `Segoe UI, Arial, sans-serif`.
- Giữ letter spacing mặc định của font trên heading, label, metadata, nút và nội dung. Không dùng tracking rộng để giả cảm giác kỹ thuật.
- Phân cấp kỹ thuật bằng weight, cỡ chữ, màu và khoảng cách; không đổi sang font mono cho metadata.
- Tránh body light 300 và chuỗi uppercase dài trên tiếng Việt.

| Style | Desktop | Mobile | Weight / line-height |
|---|---|---|---|
| Hero | 44–52 px | 30–36 px | 600 / 1,15–1,2 |
| Page title | 30–36 px | 26–30 px | 600 / 1,25 |
| Section | 22–26 px | 20–24 px | 600 / 1,3 |
| Card title | 18 px | 17–18 px | 600 / 1,35 |
| Body | 16 px | 16 px | 400 / 1,6 |
| Label/button | 14–16 px | 14–16 px | 500–600 / 1,4 |
| Metadata | 13–14 px | 13–14 px | 400–500 / 1,5 |

Hiện thực bằng rem/clamp để hỗ trợ scale. Body width 65–75ch; prompt textarea wrap được nhưng giữ whitespace có ý nghĩa.

Kiểm tra chuỗi: “Thư viện thiết kế”, “Chỉnh sửa kích thước”, “Nguyễn — Đặng — Trường”, URL dài, ID có gạch nối, mô tả 3 dòng và tên file dài.

## 5. Grid, spacing và radius

Spacing primitives: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px. Không dùng khoảng cách ngẫu nhiên để chữa cục bộ một trang.

| Thành phần | Quy tắc |
|---|---|
| Navigation | Header ngang 88 px, menu mở dọc trên mobile; không sidebar |
| Header | Khoảng 64–72 px, đủ search và breadcrumb |
| Catalog max width | Khoảng 1280–1360 px bên trong content area |
| Reading max width | 720–800 px, text vẫn theo ch |
| Content gutter | 16 px mobile, 24 px tablet, 32–40 px desktop |
| Card gap | 16–24 px |
| Section gap | 40–56 px |
| Card padding | 20–24 px |
| Control height | 44–48 px; compact desktop có hit area đủ |
| Button/input radius | 10–12 px |
| Card radius | 16–20 px |
| Major surface radius | 20–24 px |
| Chip | Pill khi đúng ngữ nghĩa, không áp cho mọi panel |

Breakpoint khởi điểm: 640, 768, 1024, 1280, 1536 px. Số cột phụ thuộc chiều rộng content sau sidebar: card dùng min width khoảng 260 px, tránh ép 4 cột chỉ vì viewport đạt 1280 px.

Mobile dưới 760 px: header/menu mở dọc, content full width. Tablet: drawer navigation khi sidebar làm chật workspace. Không chỉ thu nhỏ desktop nguyên xi.

Trang đọc/catalog dùng document scroll. Canvas editor có thể có page list và canvas scrolling riêng nhưng phải có ranh giới, keyboard access và clear focus.

## 6. Component language

### Button

- Primary: brand đậm, on-brand sáng, dùng cho hành động chính.
- Secondary: surface và viền control; đủ tương phản.
- Ghost: thao tác phụ; hover không dịch bố cục.
- Destructive: màu danger và copy rõ hành động.
- Loading: giữ width, có progress/label khi cần; chặn submit lặp trong lúc chạy.
- Disabled: semantics đúng và nguyên nhân gần hành động nếu không rõ.

### Card

- ToolCard: icon tile → title → một đến hai dòng mô tả → format/runtime khi hữu ích.
- ResourceCard: thumbnail có aspect ratio ổn định → title → metadata ngắn → Save.
- SkillCard: title → đầu ra người học đạt được → tags/level có dữ liệu thật.
- PromptCard: thumbnail ưu tiên poster 4:5 trong thư viện prompt → title → nhóm mẫu → CTA.
- CollectionCard: cover 16:10 hoặc montage đơn giản → tiêu đề theo nhu cầu → số item thật.
- Card title là link, nút Saved độc lập; tránh nút lồng trong link toàn card.
- Card title ưu tiên wrap 2–3 dòng; không cắt mất tên công cụ để giữ mọi card cùng chiều cao giả tạo.

### Form

- Label luôn nhìn thấy; helper text giải thích đơn vị và giới hạn.
- Gom “Cơ bản”, “Nâng cao”, “Xuất file”.
- Lỗi tại field, giữ input; form nhiều lỗi có error summary khi submit.
- Slider đi kèm numeric input cho chỉnh chính xác.
- Barcode input dùng text/inputMode phù hợp, không mất số 0 đầu.
- Upload hỗ trợ click, drop, keyboard; show file count/size và lỗi từng file.

### Preview

- Nền trung tính để đánh giá nội dung, không áp brand tint lên ảnh/barcode.
- Checkerboard chỉ khi cần biểu thị alpha.
- Toolbar có zoom/fit/reset và label/tooltips đúng.
- Nội dung canvas có mô tả văn bản thay thế và controls HTML.
- Thông số kích thước/đơn vị hiển thị gần export.

### Empty/loading/error

- Empty lần đầu: giải thích công dụng và một CTA bắt đầu.
- No result: giữ query/filter, gợi ý xóa hoặc thử từ khác.
- Loading: skeleton cho layout dữ liệu; progress cho xử lý file; không bịa % khi không có tiến độ thật.
- Error: nguyên nhân hiểu được, hành động retry/chỉnh input, giữ dữ liệu khi an toàn.
- Success: phản hồi ngắn có tên file/kết quả; không bật modal toàn màn hình cho copy thành công.

## 7. Motion và elevation

- Feedback màu/opacity: 120–160 ms.
- Dropdown/popover: 160–200 ms; đóng nhanh hơn mở.
- Drawer/dialog: khoảng 200–240 ms tùy khoảng di chuyển.
- Ưu tiên opacity/transform; không animate kích thước để làm trang giật.
- Không stagger hàng chục card mỗi lần lọc; nội dung phải dùng ngay.
- Reduced motion: loại di chuyển không thiết yếu, giữ feedback rõ.
- Shadow card nhẹ; modal cần phân tầng rõ; không glow quanh mọi input.

Layer tokens: base 0, sticky 10, dropdown 20, overlay 40, dialog 50, toast 60. Portals nhất quán để không bị cắt bởi overflow của panel.

## 8. Token architecture

```text
Primitive: màu/kích thước nguyên thủy
    ↓
Semantic: canvas, surface, text, primary, danger, focus
    ↓
Component: button-bg, input-border, card-radius, sidebar-active-bg
```

Token source đặt trong `src/styles/tokens/`. Components chỉ dùng semantic/component tokens; không rải raw hex. Không duy trì song song JSON/CSS handwritten khác nhau; nếu có cả hai, một nguồn sinh ra nguồn còn lại.

Page overrides chỉ cần khi workspace có nhu cầu khác (PDF editor density, prompt poster ratio). Override không được thay font/màu nhận diện tùy tiện.

## 9. Microcopy

- “Tạo mã”, “Xem trước”, “Xuất SVG”, “Ghép PDF”, “Sao chép prompt”.
- “Đã lưu trên thiết bị này” khi không có backend.
- “Mở Gemini” thay vì “Tạo ảnh bằng AI” nếu chỉ mở link.
- “Chưa có kết quả phù hợp” kèm cách bỏ filter.
- “Không đọc được tệp này. Hãy thử PDF khác.” thay lỗi kỹ thuật không giải thích.
- Nội dung giao diện không phô bày module, adapter, schema hoặc backend contracts.

## 10. Quality gate thị giác

Chấm mỗi mục 0–2: 0 chưa đạt, 1 đạt cơ bản, 2 chỉn chu. Tổng mục tiêu ≥ 17/20 và không có mục 0. Điểm số là công cụ review nội bộ, không thay usability testing.

1. Nhận diện riêng, có tính liên tục giữa các trang.
2. Hierarchy: trong vài giây biết trang để làm gì và bấm ở đâu.
3. Typography tiếng Việt sạch, không lỗi dấu hoặc nhịp dòng.
4. Khoảng cách và alignment nhất quán.
5. Màu/contrast dùng được lâu.
6. Thumbnail, icon và placeholder có chủ đích.
7. Trạng thái hover/focus/loading/error đầy đủ.
8. Mobile thật sự dễ dùng.
9. Nội dung thật, CTA hoạt động và không có số liệu giả.
10. Workspace sâu được chăm chút ngang trang Khám phá.

P2 lưu screenshot trước/sau tinh chỉnh ở desktop và mobile; chỉ nhân rộng khi đạt gate. Mọi nhận xét “đẹp” phải dựa trên giao diện render thực tế, không chỉ CSS/source.

## Bố cục gallery — thay thế cấu trúc prototype trước

Trang chủ: intro hai cột → gallery bất đối xứng (cover lớn + hai cover nhỏ) → dải danh mục → tool shelf 6 công cụ → resource gallery → skill list → footer. Công cụ dùng card ngang, resource dùng cover, skill dùng hàng, prompt dùng poster. Workspace dùng thanh tiêu đề chung, inspector 340 px và canvas co giãn. Mobile xếp dọc. Không còn sidebar hay hero abstract DF.
