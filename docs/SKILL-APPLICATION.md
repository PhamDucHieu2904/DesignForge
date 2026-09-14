# DesignForge — Áp dụng bộ skill thiết kế xuyên suốt

Ngày: 12/09/2026.

## 1. Nguồn và mức đã đọc

Nguồn người dùng yêu cầu: `D:/program project/ui-ux-pro-max-skill-main`.

Đã đọc định nghĩa 7 skill trong `.claude/skills/`: `ui-ux-pro-max`, `design`, `brand`, `design-system`, `ui-styling`, `banner-design`, `slides`; đọc quick reference UI/UX, pro rules và token architecture liên quan. Đã kiểm kê các dataset, stack guidance và chạy search thực tế.

Đã đối chiếu skill được cài trong `C:/Users/thietke06.VINUT/.codex/skills/ui-ux-pro-max/SKILL.md` với workflow nguồn được yêu cầu.

“Học skill” ở project này được thực hiện bằng quy chuẩn có lưu trữ và tra cứu theo nhiệm vụ. Không khẳng định đã đọc từng hàng của mọi CSV, chạy mọi script hoặc ghi nhớ vĩnh viễn toàn bộ dữ liệu. Các bản trong `cli/assets` và `src` có phần nội dung đóng gói trùng; không xem đó là hàng chục skill độc lập cần áp dụng đồng thời.

## 2. Bản đồ 7 skill

| Skill | Điều đã tiếp nhận | Cách áp dụng DesignForge |
|---|---|---|
| ui-ux-pro-max | Chọn pattern/style theo sản phẩm; accessibility, interaction, responsive, performance, typography, navigation | Nền tảng cho mọi màn hình và review |
| design | Điều phối brand, tokens, UI, logo, banner, icon và tài sản thiết kế | Chọn đúng nhánh khi cần, không tạo asset AI ngoài phạm vi |
| brand | Identity, voice, messaging, asset consistency | Nhận diện ấm/lịch sự, copy rõ, naming và nguồn asset |
| design-system | Primitive → semantic → component; states/variants/specs | Token dùng chung, component contract và page overrides |
| ui-styling | Component composition, accessible primitives, responsive và theme | Triển khai UI bằng stack được chốt; tùy biến sâu diện mạo |
| banner-design | Safe zone, hierarchy, một CTA, typography/brand có kiểm chứng | Hero/collection cover nếu phát sinh; không mặc định workflow banner cho cả website |
| slides | Narrative/layout/copy cho trình bày | Dùng nếu sau này cần deck giới thiệu/hướng dẫn; chưa tạo deck trong V1 |

Hướng dẫn dành riêng native mobile không áp nguyên đơn vị pt/dp sang website. DesignForge dùng CSS px và semantic HTML; target 44 px là chuẩn thiết kế nội bộ.

## 3. Dataset đã kiểm kê

Đếm hàng bằng CSV parser ở `src/ui-ux-pro-max/data` tại snapshot:

| Dataset | Số bản ghi |
|---|---:|
| styles.csv | 88 |
| products.csv | 192 |
| colors.csv | 192 |
| typography.csv | 74 |
| ux-guidelines.csv | 119 |
| ui-reasoning.csv | 192 |
| icons.csv | 105 |
| motion.csv | 17 |
| charts.csv | 25 |
| landing.csv | 34 |
| react-performance.csv | 44 |
| app-interface.csv | 32 |
| google-fonts.csv | 1934 |

Có 22 file stack guidance. Phần mô tả skill ghi 79 searchable styles/50 active; CSV hiện có 88 hàng tổng, có thể gồm trạng thái/loại khác. Không đồng nhất số hàng tổng với số style được search hoặc đang active.

Không cần đưa cả kho CSV/script vào production bundle hoặc tự công bố tất cả thành nội dung của website. Bộ skill phục vụ quá trình xây sản phẩm; thư viện skill cho người dùng cần biên tập thành nội dung phù hợp, có nguồn và quyền sử dụng.

## 4. Search đã chạy và quyết định

| Query | Kết quả đã kiểm tra | Quyết định |
|---|---|---|
| `creative resource directory elegant --design-system -p DesignForge` | Marketplace/Directory, Flat Design, palette xanh, typography editorial | Dùng search-first/category/featured và hierarchy; không lấy màu xanh, seller CTA, carousel tự chạy |
| `design resource hub creative tools modern dark neon bento --design-system` | Glassmorphism, hero/features, Plus Jakarta Sans | Dùng layering, spotlight, search-first CTA; thay typography thực thi bằng IBM Plex Sans + JetBrains Mono để hợp product-tech |
| `creative developer tool directory dark modern bento grid marketplace --design-system` | Brutalism/code-dark | Giữ tinh thần kỹ thuật, grid rõ và metadata mono; không lấy góc vuông cực đoan hay marketplace semantics |

Không persist nguyên output gợi ý chung rồi coi đó là nhận diện đã chốt. Design master là phần tổng hợp có chủ đích và ghi rõ nguồn/quyết định.

## 5. Workflow áp dụng mỗi lần làm UI

1. Đọc master/progress và xác định page/feature đang làm.
2. Nêu mục tiêu người dùng, input/action/output và trạng thái lỗi.
3. Nếu trang thuộc hệ đã chốt, dùng design master; không tạo style mới cho từng route.
4. Tra đúng domain cho điểm cần giải quyết: focus dialog, drag alternative, error summary, label overflow, data density.
5. Chỉ dùng stack search khi đã chốt framework hoặc audit code có framework thật. Repo hiện trống nên kế hoạch chỉ đề xuất stack.
6. Kiểm tra kết quả phù hợp; nếu lạc chủ đề, retry một lần với query hẹp hơn. Không chép máy móc số/màu từ kết quả.
7. Làm component/state/responsive, render thật.
8. Kiểm tra keyboard, contrast, reduced-motion và output nghiệp vụ.
9. Ghi quyết định đáng kể vào design master/ADR và tiến độ.

Lệnh tham chiếu, thay runtime Python theo máy:

```powershell
& '<python-executable>' 'D:\program project\ui-ux-pro-max-skill-main\src\ui-ux-pro-max\scripts\search.py' 'error summary validation' --domain ux
```

Không cài gói hoặc chạy script tạo ảnh/đồng bộ brand chỉ vì skill có ví dụ. Chỉ chạy công cụ phù hợp công việc đã được yêu cầu.

## 6. Cách duy trì qua nhiều phiên

- `AGENTS.md` hướng người thực hiện đọc lại tài liệu dự án.
- `design-system/designforge/MASTER.md` ghi quyết định thị giác; dữ liệu source để tra cứu sâu.
- `docs/MASTER-PLAN.md` ghi scope/architecture/gates, tránh thêm tính năng do hứng thú nhất thời.
- `docs/PROGRESS.md` ghi đã làm và chưa làm, không reset kế hoạch theo từng task.
- Khi nguồn skill được cập nhật, đánh giá phần thay đổi trước khi sửa chuẩn dự án. Không tự regenerate/ghi đè master đã được tinh chỉnh.
- Khi chuyển máy, cập nhật đường dẫn nguồn hoặc cài bản skill tương ứng; project docs vẫn giữ đủ nguyên tắc nền để tiếp tục.
