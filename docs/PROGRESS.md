# DesignForge — Tiến độ

Cập nhật: 15/09/2026.

Thư mục làm việc hiện tại: `D:/program project/DesignForge`.

## Hiện tại

**P1 foundation và P2 visual prototype đã triển khai. Chưa đạt functional parity với barcode-generator, chưa dựng backend, chưa deploy.**

## GitHub Pages

Đã bổ sung workflow `.github/workflows/deploy-pages.yml` để kiểm tra, build và phát hành `dist` từ nhánh `main`. Build script hỗ trợ `BASE_PATH=/DesignForge`, sửa đường dẫn asset, thumbnail và PDF Editor cho project site, đồng thời tạo `.nojekyll`. URL mục tiêu: `https://phamduchieu2904.github.io/DesignForge/`.

## Gọn hóa trang Công cụ

Đã bỏ hero giới thiệu lớn và hình tròn DF ở đầu `#/tools` theo phản hồi giao diện. Sidebar nhóm công cụ, thanh tìm kiếm/sắp xếp và toàn bộ card/engine Barcode vẫn giữ nguyên; nội dung chính được đưa lên ngay sau header để giảm khoảng trống và tăng mật độ thao tác.

Đã gỡ Prompt Builder khỏi catalog công cụ và sidebar bộ lọc vì thư viện Prompt đã có route riêng tại `#/prompts`. Tám prompt template và trình tạo prompt vẫn giữ nguyên ở page đó.

## Prompt Library migration

Đã chuyển đủ 8 template và thumbnail từ `D:/program project/barcode-generator` sang route `#/prompts`. Trang mới có tìm kiếm trên tên, mô tả và field; card dùng thumbnail thật; trình chỉnh sửa chia trường chính/nâng cao, tự lưu bản nháp trên thiết bị, kiểm tra trường bắt buộc, tạo prompt bằng engine thuần, cho sửa kết quả, đếm ký tự và sao chép. Link Gemini/Dola chỉ mở khi người dùng chủ động và không gọi API AI từ DesignForge.

Đã bỏ khối giới thiệu lớn ở đầu trang và tổ chức lại thư viện theo hai tầng. Sidebar trái gồm Poster nước giải khát, Poster thực phẩm và Poster sản phẩm làm đẹp; thanh nhóm con phía trên đổi theo chủ đề đang chọn. Tám mẫu nguồn hiện có được gắn taxonomy vào Juice, Tăng lực và Aloe vera. Các nhóm chưa có dữ liệu dùng trạng thái trống theo ngữ cảnh, không dựng prompt giả, trong khi tìm kiếm, lưu mẫu và trình chỉnh sửa vẫn giữ nguyên.

Kiểm chứng lượt phân loại: `npm run check`, `npm test` (24/24) và `npm run build` pass. Browser QA tại `#/prompts` xác nhận 8 mẫu ở Nước giải khát, Juice lọc còn 6 mẫu, các nhóm trống đổi đúng tab/ngữ cảnh, modal Juice Splash vẫn mở được, viewport hẹp không tràn ngang và không có console warning/error.

Files chính: `src/features/prompts/templates.json`, `types.ts`, `engine.ts`, `repository.ts`, `PromptLibraryPage.tsx`, `prompts.css`, `src/assets/prompts/*`, `tests/prompt-engine.test.mjs`, `docs/decisions/ADR-0008-prompt-library-migration.md`.

Kiểm chứng: `npm run check`, `npm test` (23/23) và `npm run build` pass. Browser QA xác nhận đủ 8 card/8 thumbnail ở desktop 1440px, modal 1180px nằm trọn viewport, tạo được prompt 20.963 ký tự từ Juice Splash, output có thể sửa, provider link đúng nguồn, không có console warning/error và không tràn ngang. Ở viewport 375px, card về một cột rộng 324px, modal phủ đúng viewport và dùng một luồng cuộn để tránh vùng form bị co hoặc cuộn lồng nhau.

## Đã hoàn thành

- [x] Kiểm tra workspace đích và cấu trúc hai project nguồn.
- [x] Đọc định nghĩa 7 skill của bộ nguồn và hướng dẫn UI/token liên quan.
- [x] Kiểm kê dataset, chạy design-system search và style search phù hợp.
- [x] Xác định art direction đề xuất: Warm Editorial Studio.
- [x] Lập feature inventory, phát hiện 8 prompt templates và dependency OCR/font.
- [x] Loại AI Remove BG khỏi phạm vi triển khai.
- [x] Viết master plan, design system, source audit và skill application.
- [x] Ghi working agreement vào AGENTS.md để duy trì xuyên suốt.
- [x] Chốt ADR prototype: React + TypeScript strict + esbuild, hash routes, local repository, token CSS.
- [x] Dựng package/build/dev scripts và app shell responsive.
- [x] Dựng catalog schema/repository, navigation, search dialog, Saved local adapter và tool registry ban đầu.
- [x] Dựng màn hình Khám phá, danh mục và workspace Barcode prototype.
- [x] Browser QA viewport mobile: route, search, save, preview, no horizontal overflow, no console warnings.
- [x] Đồng bộ đường dẫn tài liệu và launcher sau khi chuyển toàn bộ project về thư mục `D:/program project/DesignForge`.
- [x] Refactor toàn bộ visual system sang hướng Modern Creative Tech: navy canvas, violet/cyan gradients, glass cards, responsive marketplace rhythm và giữ nguyên route/chức năng hiện có.
- [x] Kiểm chứng sau refactor: `npm run check`, `npm run build`, `npm test` pass; browser preview mobile không có horizontal overflow và không có console error; đã kiểm tra catalog, search overlay và Barcode preview.

## Kiểm chứng ở lượt kế hoạch

- Các nhận định về nguồn dựa trên đọc file, tìm kiếm code và registry; chưa dựa trên chạy toàn bộ công cụ.
- Đã phân biệt stack nguồn HyperDesignDev với stack đề xuất cho repo mới.
- Đã tham khảo tài liệu chính thức Next.js, React, shadcn/ui và MDN Workers để xác định ranh giới kiến trúc.
- Đã kiểm tra liên kết nội bộ của 7 tài liệu ban đầu, parse đủ 8 prompt và xác nhận 8/8 thumbnail tồn tại. Các cặp màu chủ đạo đạt ngưỡng tương phản đề xuất; xem [QA kế hoạch](qa/PLAN-CHECK.md). Ảnh chưa visual QA riêng; UI prototype đã được browser QA.
- `npm run check`, `npm run build` và `npm test` pass sau khi dựng prototype; bằng chứng chi tiết ở [P1/P2 verification](qa/P1-P2-VERIFICATION.md).

## Các mốc chưa thực hiện

| Mốc | Trạng thái |
|---|---|
| P0 Baseline runtime và quyết định stack | Đã chốt phần nền tảng; baseline legacy engine còn lại |
| P1 Foundation | Hoàn thành prototype, xem ADR |
| P2 Visual prototype | Đã refactor sang Modern Creative Tech; cần browser QA desktop/mobile sau vòng đổi mới |
| P3 Catalog/content/search/saved | Chưa bắt đầu |
| P4A Barcode/prompt/halftone | Đang thực hiện: Barcode core/export đã nối; properties, prompt và halftone còn lại |
| P4B PDF conversion | Chưa bắt đầu |
| P4C PDF editor lõi | Chưa bắt đầu |
| P4D OCR/scan | Chưa bắt đầu |
| P5 Hardening/adapter contract | Chưa bắt đầu |
| P6 Frontend release candidate | Chưa bắt đầu |
| V2 Backend | Hoãn đúng phạm vi |

## Bước triển khai tiếp theo

1. Bổ sung bộ điều khiển kích thước, màu, nền và quiet-zone cho Barcode (BC-08/BC-09), kèm fixture đối chiếu nguồn.
2. Hoàn thiện danh mục resources/skills/prompts và route detail từ registry.
3. Thêm halftone engine sau khi chốt worker/file limits.
4. Baseline rồi migrate các capability PDF/OCR theo inventory, không lược bỏ tính năng khó.

## Những điều chưa chốt

- Next.js vẫn là lựa chọn cần đánh giá cho metadata/CMS/backend; prototype hiện chạy React + esbuild theo [ADR-0001](decisions/ADR-0001-foundation-spike.md).
- Logo và font cuối cùng; kiểm tra quyền dùng, glyph tiếng Việt.
- Dataset tài nguyên/skill biên tập đầu tiên ngoài prompt/công cụ nguồn.
- Hosting/domain, mô hình tài khoản/quyền và lưu file cho backend.
- Fidelity/giới hạn thực tế của QR export, PDF compression/editor/OCR.

Không có blocker cần xin thêm thông tin để hoàn thành master plan. Các quyết định còn mở được đặt đúng mốc, không giả vờ đã hoàn thành.

## Vòng sửa bố cục theo phản hồi

Đã thay App shell và DiscoverPage: header ngang, gallery ba khối, category rail, tool shelf, resource gallery, skill list, footer. Card riêng theo kind; workspace inspector/canvas chung một khung. Files: src/main.tsx, src/styles.css, design master. Check/build/test pass (3 tests). Browser QA: gallery desktop 1440px, mobile 375px và 424px; không tràn ngang ở 375px. Barcode preview và search đã kiểm tra lại. Chức năng engine/export vẫn ở mức prototype cũ; không tuyên bố functional parity.

## Vòng sửa trang Công cụ theo reference marketplace

Đã thay riêng route `#/tools` bằng bố cục catalog kiểu marketplace: sidebar danh mục theo thứ tự Barcode, PDF, Img Filter, Prompt; thanh search/sort; lưới ToolCard 3→2→1 cột với visual module, trạng thái, tags, save và CTA mở workspace. Card giữ ngữ nghĩa công cụ của DesignForge, không dùng NFT/wallet/usage giả. Files: `src/main.tsx`, `src/styles.css`.

Đã kiểm tra: `npm run check`, `npm run build`, `npm test` đều pass; browser preview xác nhận filter PDF, tìm Barcode, mở Barcode workspace và tạo preview với dữ liệu nhập. Preview hiện chạy tại `http://127.0.0.1:4173`. Known limit: tool engine/export vẫn là prototype đã ghi ở các mốc trước; vòng này chỉ đổi catalog UI và điều hướng tới workspace hiện có.

## Vòng inline Barcode theo form mới

Đã chuyển nhóm Barcode trên `#/tools` từ card có CTA “Mở tool” sang studio hiển thị trực tiếp, đồng thời đặt Barcode làm nhóm mở mặc định vì đây là module đầu tiên trong rail. Studio gồm 6 thẻ độc lập theo thứ tự EAN 13, UPC-A, ITF-14, Code 128, GS1-128 và QR Code; mỗi thẻ có thumbnail trung tính, input có thể thêm dòng, hướng dẫn ngắn, tự tính check digit cho EAN/UPC/ITF khi đủ dữ liệu và nút tải SVG. Không còn khung preview workspace trong luồng này. Engine thuần dữ liệu được tách tại `src/features/barcode/engine.ts` để UI và backend tương lai có thể dùng chung boundary.

Files: `src/main.tsx`, `src/styles.css`, `src/features/barcode/engine.ts`, `docs/decisions/ADR-0003-inline-barcode-studio.md`.

Đã kiểm tra: `npm run check`, `npm run build`, `npm test` pass; browser QA xác nhận 6 thẻ, 6 input, không có `.preview-canvas`, EAN `893850597412` sinh check digit `5`, nút tải SVG được bật và console không có warning/error. Preview tiếp tục chạy tại `http://127.0.0.1:4173`.

Known limit: QR và các chuẩn tuyến tính ngoài EAN/UPC đang dùng renderer SVG client-side tối giản để giữ prototype nhẹ; cần nối engine nguồn đã kiểm chứng ở mốc P4 trước khi tuyên bố parity nghiệp vụ in ấn.

## Hiệu chỉnh Barcode theo Artboard 3

Đã bỏ hoàn toàn header “Barcode Studio” và thiết kế card hai cột trước đó. Các chuẩn Barcode hiện dùng đúng mật độ card marketplace: 3 cột desktop, 2 cột tablet, 1 cột mobile. Mỗi card giữ cấu trúc theo artboard người dùng cung cấp: thumbnail trắng bằng ảnh `barcode.png`, hàng title + mô tả, khung Input có sẵn hai dòng và nút thêm, footer chọn SVG + Download màu xanh. Không thay đổi engine/download đã nối ở vòng trước.

Files: `src/main.tsx`, `src/styles.css`, `src/assets/barcode-ean13.png`, `scripts/build.mjs`, `scripts/dev.mjs`, `docs/qa/barcode-layout-desktop.png`, `docs/decisions/ADR-0003-inline-barcode-studio.md`.

Kiểm chứng: TypeScript check/build/test pass; chụp browser headless tại 1440×900 xác nhận ba card trên một hàng và asset barcode được tải đúng; browser 424px xác nhận card một cột, không tràn ngang, thứ tự focus theo Input 1 → thêm dòng → Input 2 → định dạng → Download.

## Barcode progressive input + export parity

Đã thay trạng thái hai input tĩnh bằng progressive rows: mặc định một input hoạt động và một input chờ disabled; `+` kích hoạt ô chờ, tự focus và tạo ô chờ kế tiếp; `−` xuất hiện từ hai input và xóa ô cuối. Giới hạn 20 dòng giữ theo nguồn cũ. Dropdown có SVG/PDF/PNG và đổi CTA theo mode.

Đã bỏ renderer mô phỏng. `src/features/barcode/engine.ts` port validation, check digit và GS1 parsing từ source; `src/features/barcode/exporter.ts` dùng JsBarcode 3.11.6, QR encoder và pdf-lib. SVG nhiều mã được dàn dọc trên một artboard, PDF mỗi mã một trang, PNG mỗi mã một file như web cũ. Sáu thumbnail riêng đã được đưa vào `src/assets/` và build pipeline.

Kiểm chứng: `npm run check`, `npm run build`, `npm test` pass 6/6. Browser QA xác nhận add 1→2→3, remove 3→2, ghost input disabled, minus ẩn/hiện đúng, nhãn CTA đổi SVG/PDF/PNG, EAN/Code128/GS1/QR tạo file không có console error. Đã mở lại `barcodes.pdf` (1 trang), parse SVG một mã và SVG hai mã (2 nested SVG), đọc PNG hợp lệ 460×236. Ảnh QA desktop cập nhật tại `docs/qa/barcode-layout-desktop.png`.

## PDF conversion inline theo Artboard 4

Đã chuyển Ảnh thành PDF và Ghép PDF thành card thao tác trực tiếp trong nhóm PDF; PDF Editor vẫn mở route riêng `#/tools/pdf-editor`. Hai card hỗ trợ chọn/kéo nhiều file, danh sách có thứ tự, nút lên/xuống, kéo thả đổi thứ tự, xóa/thêm file và feedback nội tuyến.

Engine tại `src/features/pdf/exporter.ts` port hành vi từ `barcode-generator/js/pdf.js`: Fit to Image, A4 dọc/ngang; High/Medium/Compact; ảnh JPG/PNG/WebP/BMP/GIF/TIFF; ghép toàn bộ trang PDF theo thứ tự. Dùng pdf-lib 1.17.1 và UTIF 3.1.0, chạy trong browser.

Kiểm chứng: `npm run check`, `npm run build`, `npm test` pass 9/9. Browser QA ở 1440×900 xác nhận ba card đúng Artboard 4, hai file ảnh/PDF được nhận, reorder `image-a → image-b` thành `image-b → image-a`, cả `combined.pdf` và `merged.pdf` được tạo, console không có lỗi. Test mở lại PDF xác nhận hai ảnh tạo đúng hai trang theo kích thước ảnh, merge 1+2 thành 3 trang và mức Compact đổi trang 200×300 thành 80×120.

## PDF Editor — refactor workspace ba vùng

Đã thay đổi cấu trúc UI thực sự thay vì chỉ đổi màu: thư viện tệp/trang ở trái, canvas co giãn ở giữa và inspector thuộc tính ở phải. Cụm font, kiểu chữ, cỡ chữ, căn chỉnh, màu, viền và zoom được chuyển khỏi đầu canvas vào inspector nhưng giữ nguyên ID/event binding. Header canvas và context inspector cập nhật theo trang/đối tượng đang chọn; thanh đáy tiếp tục chứa tác vụ cấp trang.

Responsive giữ đầy đủ thuộc tính: dưới 980 px xếp thư viện → inspector → canvas, dưới 680 px inspector thành một cột. Phím tắt hiển thị đã đối chiếu với engine thật. Files chính: `src/pdf-editor/index.html`, `src/pdf-editor/standalone.css`, `src/pdf-editor/js/editor-layout.js`, `design-system/designforge/pages/pdf-editor.md`, `docs/decisions/ADR-0005-pdf-editor-three-region-workspace.md`.

Kiểm chứng: `npm run check`, `npm run build`, `npm test` pass 11/11, gồm test kiến trúc xác nhận thứ tự ba vùng, toolbar được reparent vào inspector và inspector không bị ẩn ở breakpoint responsive. Dev preview tiếp tục tại `http://127.0.0.1:4173/#/tools/pdf-editor`.

## Hợp nhất task “Cập nhật giao diện trắng tím”

Đã đối chiếu task song song và hợp nhất có chọn lọc vào bản đang chạy tại `D:/program project/DesignForge`: Mona Sans, nền trắng/lavender, accent tím, letter spacing mặc định và footer `by Hyper D²` cùng email liên hệ. Không chép đè source cũ nên PDF Editor ba vùng, Barcode progressive export và PDF conversion vẫn được giữ nguyên.

Đã mở rộng theme sang stylesheet độc lập của PDF Editor: page rail, stage header, canvas workspace, property inspector, toolbar, dialog và control cùng dùng semantic palette trắng tím; PDF page/canvas nội dung vẫn giữ nền trung tính. Quyết định được ghi tại `docs/decisions/ADR-0006-white-purple-visual-system.md`.

Kiểm chứng sau hợp nhất: `npm run check`, `npm run build`, `npm test` pass 11/11; preview local trả HTTP 200. In-app browser đọc được route PDF Editor, iframe editor và footer mới. Việc chụp screenshot tự động bị lỗi ở lớp điều khiển browser nên chưa lưu thêm ảnh QA cho vòng này.

## Sửa PDF Editor bị treo ở màn hình trắng

Đã xác định `MutationObserver` trong `src/pdf-editor/js/editor-layout.js` tự ghi lại cùng các text node đang quan sát, tạo vòng lặp mutation liên tục và khóa main thread của iframe. Đã đổi sang cập nhật có điều kiện, thêm test hồi quy, tải các vendor script bằng `defer`, lazy-load Tesseract khi OCR thực sự được gọi và tự host Mona Sans để lần mở editor không phụ thuộc Google Fonts.

Route shell hiện nhận tín hiệu `designforge-pdf-editor-ready` từ iframe, có loading state ngắn và fallback 1,2 giây. Kiểm chứng cuối: check/build pass, 13/13 test pass; browser QA xác nhận loading biến mất, page rail, canvas, inspector và toàn bộ control hiển thị đầy đủ tại `#/tools/pdf-editor`.

## Xác nhận thư mục project canonical

Đã xác nhận `D:\program project\DesignForge` là repo source/build đang chạy thực tế. `D:\Vinut-TK\Documents\ChatGPT\DesignForge` được đánh dấu là mirror lịch sử; README, AGENTS và launcher ở mirror đều trỏ về repo canonical để tránh sửa hoặc chạy nhầm project.

## Color Halftone từ app cũ

Đã đưa chức năng Color Halftone từ `D:/program project/barcode-generator` vào route `#/tools/image-filter`. Workspace mới giữ quy trình local: nhập ảnh, chọn hình hạt Circle/Triangle/Square/Diamond, màu halftone, kích thước hạt tối thiểu/tối đa, spacing, contrast và PPI; xem kết quả trên canvas rồi xuất PNG hoặc SVG. Ảnh nguồn được giới hạn cạnh lớn nhất 2200px trước khi lấy mẫu để tránh khóa trình duyệt.

Engine thuần tại `src/features/image-filter/engine.ts` tách khỏi React và DOM, dùng chung dot list cho preview PNG và SVG export. Quyết định boundary được ghi tại `docs/decisions/ADR-0007-color-halftone-engine.md`; test kiến trúc xác nhận route, engine và stylesheet tồn tại.

Kiểm chứng: `npm run check`, `npm run build`, `npm test` pass; browser QA route local xác nhận heading Color Halftone, import/dropzone, các điều khiển hình hạt, PPI và trạng thái export disabled khi chưa có ảnh. Known limit: chưa upload file mẫu qua browser QA trong vòng này, nên chưa xác nhận trực quan từng dạng hạt bằng fixture người dùng.

## Refactor UI workspace Color Halftone

Đã dùng skill UI UX promax để chỉnh lại route `#/tools/image-filter` thành workspace tập trung hơn: bỏ cụm hero/heading lớn `IMAGE STUDY / HALFTONE LAB`, bỏ dropdown Effect disabled không có tác dụng, gom sidebar thành các nhóm ảnh đầu vào, hiệu ứng, thông số hạt và export. Vùng preview có toolbar/meta riêng, empty state gọn hơn và canvas mặc định được ẩn khi chưa có ảnh để không còn mảng vuông trắng lạ ở giữa khung preview.

Chức năng xử lý ảnh không đổi: import/drop ảnh, chọn Circle/Triangle/Square/Diamond, đổi màu, chỉnh min/max/spacing/contrast/PPI, reset, export PNG và SVG vẫn dùng cùng engine hiện tại. Test kiến trúc đã được bổ sung để khóa việc không đưa header cũ, effect disabled và canvas empty quay lại.

Kiểm chứng: `npm run check`, `npm test` pass 18/18, `npm run build` pass sau khi chạy với quyền ghi `dist` trong repo canonical. Browser QA route local xác nhận tree render chỉ còn back link, sidebar điều khiển và khu vực preview mới; không còn node `.image-filter-heading` trong UI.

### Làm thoáng thông tin ảnh trong sidebar

Đã bỏ ba ô viền riêng của `Input pixels`, `Input size` và `PPI`. Ba thuộc tính giờ hiển thị thành ba dòng text trong danh sách thông tin phẳng, tránh cắt chữ ở sidebar hẹp; PPI vẫn là ô nhập inline để giữ nguyên khả năng chỉnh thông số.

### Cố định nút thêm/xóa input Barcode

Đã tách nút `+`/`−` khỏi input ghost cuối danh sách và neo cụm thao tác vào góc dưới phải của khung Input. Khi thêm nhiều mã, danh sách input có thể cuộn nhưng vị trí nút không thay đổi; chức năng thêm, xóa và tự focus input vẫn giữ nguyên.

### Làm gọn inspector PDF Editor

Đã chuyển toolbar thuộc tính của PDF Editor về đúng vị trí phía trên canvas thay vì nhét trong inspector phải. Các control phông chữ, kiểu chữ, cỡ chữ, màu, viền và thu phóng được làm compact theo mật độ app cũ nhưng vẫn dùng theme trắng tím; ô zoom thu nhỏ lại, select/input dùng nền trắng và label rõ hơn. Khung import PDF bên trái dùng nền lavender cùng canvas thay cho mảng xám tối. Inspector phải được dọn lại thành khu vực thông tin trang gọn, bỏ cụm phím tắt/local note thừa để dành chỗ cho nội dung sau này.

### Căn lại toolbar PDF Editor

Đã đưa nhóm `Màu nền`, `Viền`, `Thu phóng` lên vùng trống bên phải của hàng thuộc tính trên canvas, giữ nguyên toàn bộ ID và event cũ. Thanh thao tác cuối canvas (`Tất cả`, khổ giấy, xoay, cắt trang) được căn giữa trên desktop và tự trả về căn trái khi màn hình hẹp để không gây tràn ngang.

Kiểm chứng: `npm run check`, `npm test`, `npm run build`.

## Cover Promt Library trên homepage

Đã thay card `Thiết kế có hệ thống.` bằng card `Promt Library`, dùng thumbnail `src/assets/promt-library.webp` do người dùng cung cấp. Card giữ form glass caption giống Image Filter Lab nhưng dùng panel đen bán trong suốt opacity 20%, blur 10px để thumbnail sáng và rõ hơn; subtitle là `Promt poster tùm lum tùm la sẽ update dần thêm` và link trực tiếp tới `#/prompts`.

## Rút gọn hero trang Khám phá

Đã bỏ eyebrow `YOUR NEXT IDEA STARTS HERE`, đoạn mô tả khám phá và CTA mở công cụ khỏi hero homepage. Tiêu đề được thay thành một dòng gọn: `Ở đây có chút công cụ cho des mới`. Desktop giữ một hàng; mobile cho phép tự xuống dòng để không tràn ngang. Các gallery, category rail và tool shelf bên dưới vẫn giữ nguyên.

Kiểm chứng: browser QA tại `#/` đọc đúng heading mới và không còn các chuỗi cũ; `npm run check`, `npm run build`, `npm test` pass 15/15.

## Hero homepage theo Artboard 2

Đã cập nhật headline thành `Ở đây có chút công cụ cho designer mới nhú`, tô riêng cụm `designer mới nhú` bằng accent tím. Thêm đoạn giới thiệu cá nhân hai dòng theo artboard và đẩy toàn bộ cụm intro lên gần header hơn bằng spacing riêng cho trang Khám phá; gallery phía dưới giữ nguyên cấu trúc.

Kiểm chứng: browser QA route `#/` xác nhận title, màu accent, đoạn giới thiệu và khoảng cách mới; `npm run check`, `npm run build`, `npm test` pass 16/16.

## Cover Barcode Generator trên homepage

Đã thay cover lớn đầu tiên trong gallery bằng ảnh `src/assets/barcode-background.webp` do người dùng cung cấp. Card hiển thị `Barcode Generator`, dòng `Cần thêm code khác, cần bổ sung thêm chức năng thì liên hệ`, overlay tối để giữ khả năng đọc chữ và link trực tiếp tới `#/tools`, nơi nhóm Barcode đang hoạt động.

Build pipeline đã copy asset vào `dist/assets`; browser QA xác nhận ảnh, nội dung và accessible link `Mở Barcode Generator`. `npm run check`, `npm run build`, `npm test` pass 17/17.

Đã bỏ hai nhãn trang trí `BARCODE / QR TOOLS` và `DESIGNFORGE TOOL` khỏi cover theo feedback; title, mô tả, ảnh nền và liên kết Barcode vẫn giữ nguyên. Test homepage được cập nhật để ngăn hai nhãn này quay lại.

Đã sửa vị trí caption sau khi bỏ label: cụm `Barcode Generator` và mô tả được neo xuống đáy cover bằng `margin-top:auto`, khớp vị trí trong Artboard 2. Browser QA xác nhận caption nằm dưới ảnh, không còn nhảy lên đầu card.

## Cover Image Filter Lab trên homepage

Đã thay card Halftone Lab bằng thumbnail `src/assets/image-filter-lab-thumb.webp` do người dùng cung cấp. Card mới hiển thị `Image Filter Lab`, subtitle `Công cụ chuyển ảnh thành các hiệu ứng (Phù hợp in Flexo)`, caption neo đáy theo artboard và link tới marketplace với nhóm Img Filter được chọn sẵn.

Build pipeline đã copy thumbnail vào `dist/assets`; browser QA xác nhận ảnh, title, subtitle và accessible link `Mở Image Filter Lab`. `npm run check`, `npm run build`, `npm test` pass 18/18.

Đã thêm glass caption panel cho card Image Filter theo feedback: nền trắng bán trong suốt, bo góc, blur hậu cảnh, viền/shadow nhẹ; title, subtitle và icon mũi tên được đặt trên panel ở đáy card. Browser QA xác nhận khả năng đọc chữ được cải thiện và không đổi nhóm Img Filter.

Đã cân lại glass caption panel theo mẫu mới: panel thấp hơn, nền trắng giảm về opacity 60%, blur tăng lên để hậu cảnh mờ rõ hơn và icon mũi tên được canh giữa theo chiều dọc. Thumbnail `src/assets/image-filter-lab-thumb.webp` đã được thay bằng file mới từ `D:\Vinut-TK\Downloads\Image Filter Lab Thumb.webp`; `npm run check`, `npm run build`, `npm test` pass 18/18.

### Điều hướng Image Filter Lab về danh sách công cụ

Thẻ Image Filter Lab trên homepage giờ mở `#/tools?collection=image-filter`, giữ người dùng ở marketplace và tự chọn tab Img Filter để hiển thị Halftone Lab. Route parser nhận query collection hợp lệ, còn đường dẫn `#/tools/image-filter` vẫn giữ cho workspace Color Halftone chuyên biệt.

## Gộp footer homepage

Đã bỏ footer riêng của DiscoverPage để tránh lặp với footer global. Footer cuối trang hiện giữ thương hiệu, tagline và credit creator; `by Hyper D²` cùng email `hieuphamdesdev@gmail.com` nằm trên một hàng, cỡ chữ credit tăng lên 14px và cỡ chữ footer mobile tăng lên 15px.

Kiểm chứng: browser QA tại `#/` chỉ còn một footer, credit và email vẫn hiển thị đầy đủ; `npm run check`, `npm run build`, `npm test` pass 16/16.
