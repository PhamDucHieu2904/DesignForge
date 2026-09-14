# DesignForge — Master plan

Phiên bản 1.0 · 12/09/2026 · Trạng thái: đề xuất triển khai dựa trên khảo sát mã nguồn.

**Đích đến:** một website công cụ và tri thức thiết kế đẹp, lịch sự, dễ sử dụng hằng ngày; có kiến trúc đủ rõ để mở rộng danh mục và tích hợp backend mà không phải xây lại toàn bộ frontend.

Tài liệu này là chuẩn thực hiện xuyên suốt. Các con số về kích thước, hiệu năng và lịch trình bên dưới là mục tiêu thiết kế/nghiệm thu, chưa phải kết quả đo của một ứng dụng đã xây dựng.

## 1. Yêu cầu gốc và cách chuyển thành quyết định

| Yêu cầu | Quyết định thực hiện | Bằng chứng hoàn thành cần có |
|---|---|---|
| Học và áp dụng bộ skill trong thư mục được chỉ định | Đọc định nghĩa các skill, lập bản đồ áp dụng, tra cứu dữ liệu đúng ngữ cảnh; lưu quy chuẩn vào repo | Skill application, design master, checklist từng mốc |
| Website tổng hợp công cụ, kho tàng, skill cho thiết kế | Kiến trúc nội dung gồm Tools, Resources, Skills, Prompts, Collections | Các nhóm có route, schema và UX riêng |
| Đẹp, chỉn chu, lịch sự | Art direction creative-tech với gallery bất đối xứng; typography rõ; ảnh có chủ đích; component nhất quán | Duyệt màn hình thật ở desktop/mobile; chấm chất lượng thị giác |
| Tham khảo UI | Bitakon cung cấp nhịp gallery/card, dark canvas và gradient accent; HyperDesignDev chỉ giữ lại nguyên tắc điều hướng rõ | Bảng đối chiếu nguồn → DesignForge, xem design master |
| Không có chức năng đổi layout | Một hệ bố cục responsive ổn định, không workspace switcher | Không có control/route/state đổi layout |
| Chuyển toàn bộ công cụ từ barcode-generator, trừ AI Remove BG | Lập feature parity theo từng nhóm, chuyển engine và nội dung, thiết kế lại UI | Ma trận chuyển đổi và kiểm thử từng đầu ra |
| Dễ mở rộng, bảo trì | Module theo chức năng, registry, schema, adapter, engine độc lập | Thêm thử một module mới không sửa shell |
| Frontend/chức năng trước, backend sau | Dữ liệu cục bộ qua repository; schema và API contract chuẩn bị sớm | Thay local adapter bằng mock HTTP không đổi UI |

**Ưu tiên khi có xung đột:** đúng nghiệp vụ → dữ liệu/đầu ra đúng → dễ hiểu và dễ đọc → nhất quán và đẹp → hiệu năng → hiệu ứng trang trí.

## 2. Căn cứ khảo sát và giới hạn

- DesignForge hiện chỉ có thư mục Git, chưa có framework hay ứng dụng để giữ tương thích.
- HyperDesignDev dùng React, TypeScript, Lucide và build bằng esbuild; thư mục `app` không đồng nghĩa dự án đó là Next.js. Đây là nguồn tham khảo hình thức, không phải nền tảng phải sao chép.
- barcode-generator là HTML/CSS/JavaScript với nhiều hàm/global state, thư viện tải từ CDN, các section được bật/tắt trong một trang.
- Đã xác định 6 loại barcode/QR; 3 luồng PDF chính cùng editor nâng cao; Image Filter halftone; 8 template prompt.
- AI Remove BG đang disabled trong HTML và bị loại khỏi DesignForge theo yêu cầu.
- PDF có OCR bằng Tesseract.js và tải font ngoài. Tên `edit-pdf-ai.js` không đủ để kết luận chức năng phải có API AI trả phí hoặc backend.
- Đây là khảo sát source, chưa chạy toàn bộ UI hoặc kiểm chứng chất lượng file xuất. Giai đoạn P0/P4 phải làm baseline thực nghiệm trước khi tuyên bố tương đương.

Danh mục nguồn và tính năng chi tiết ở [SOURCE-AUDIT.md](SOURCE-AUDIT.md).

## 3. Định vị sản phẩm

DesignForge là nơi người làm thiết kế mở mỗi ngày để tìm đúng tài nguyên, dùng công cụ nhanh và tái sử dụng kiến thức.

Ba nhu cầu chính:

1. **Làm ngay:** tạo mã, xử lý PDF, tạo halftone, dựng prompt rồi xuất kết quả.
2. **Tìm đúng:** tìm tài nguyên theo mục đích, loại file, phần mềm, giấy phép hoặc lĩnh vực.
3. **Tích lũy:** đọc skill/quy trình, lưu mục hữu ích, nhóm thành bộ sưu tập để dùng lại.

Đối tượng ưu tiên: graphic designer, người làm bao bì/in ấn, branding, visual/content designer. Cấu trúc cho phép bổ sung UI/UX, motion, 3D và các mảng khác sau này.

Ngôn ngữ giao diện mặc định: tiếng Việt. Giữ tên định dạng và thuật ngữ quen thuộc như SVG, PDF, QR, Halftone. Sửa nhãn “Promt” thành “Prompt” trong UI mới; không đổi ID nguồn một cách tùy tiện.

Thông điệp gợi ý: **“Công cụ tốt. Tài nguyên đúng. Thiết kế tốt hơn.”** Đây là nội dung đề xuất, có thể tinh chỉnh khi thiết kế hero.

## 4. Phạm vi theo phiên bản

### 4.1. Bản frontend hoàn chỉnh đầu tiên — V1

- Shell, điều hướng, tìm kiếm, danh mục và detail pages.
- Catalog tài nguyên và skill theo schema; dữ liệu được biên tập trong repo.
- Toàn bộ công cụ nguồn được đưa vào lộ trình chuyển đổi, ngoài AI Remove BG.
- 8 prompt template cùng thumbnail, bản gốc, field, giá trị mặc định và hành vi dựng prompt.
- Saved và Recently used lưu trên thiết bị, có xóa và giải thích giới hạn lưu trữ.
- Collections biên tập từ dữ liệu cục bộ; bộ sưu tập riêng do người dùng tạo có thể làm ở V1.1.
- Hướng dẫn ngắn, ví dụ đầu vào, empty/loading/error/success cho từng công cụ.
- Responsive và keyboard access; editor phức tạp có thiết kế tablet/mobile riêng.
- Loading theo route/chức năng, kiểm soát file lớn, xử lý lỗi và xuất file đúng.
- Repository abstraction, runtime validation, contract mẫu cho backend tương lai.

### 4.2. V1.1 — mở rộng sau khi nền tảng ổn định

- Collections cá nhân cục bộ, import/export thiết lập có version.
- Thêm công cụ mới theo nhu cầu thực tế: màu sắc, kích thước, typography, utilities cho in ấn; chưa tự tính là tính năng cam kết V1.
- Dark mode nếu có nhu cầu; token sẵn đường mở rộng nhưng không làm toggle khi chưa thiết kế/kiểm tra đầy đủ.
- Tìm kiếm nâng cao, preset theo lĩnh vực, cải thiện thao tác mobile cho editor.
- PWA/offline có chọn lọc nếu lợi ích được xác nhận; không hứa offline cho mọi font/OCR ngay từ đầu.

### 4.3. V2 — backend và quản trị

- Tài khoản, đồng bộ Saved/Collections/Presets.
- CMS/admin quản trị tài nguyên, prompt và skill.
- Draft/review/publish, quyền editor/admin, audit log.
- Lưu file hoặc xử lý server khi có nghiệp vụ cần; job queue cho tác vụ nặng.
- Theo dõi link hỏng và trạng thái nguồn; thống kê dựa trên dữ liệu thật.
- Search server khi số lượng nội dung hoặc yêu cầu quyền truy cập vượt khả năng client.

### 4.4. Ngoài phạm vi hiện tại

- AI Remove Background, kể cả card “sắp có”, đường dẫn ẩn hoặc dependency đi kèm.
- Trình đổi bố cục, cửa sổ kéo thả, desktop/terminal giả lập, widget hệ thống của HyperDesignDev.
- Thanh toán, marketplace mua bán, cộng đồng, comment/rating và hệ thống team phức tạp.
- API tạo ảnh tích hợp trực tiếp; mở nhà cung cấp ngoài từ prompt không đồng nghĩa có tích hợp API.
- Triển khai production/backend thật trong lượt lập kế hoạch này.

## 5. Kiến trúc thông tin và điều hướng

### 5.1. Sitemap đề xuất

```text
/                          Khám phá
/tools                      Tất cả công cụ
/tools/barcode              Barcode, preset bằng ?type=ean13
/tools/qr-code              QR Code
/tools/images-to-pdf        Ảnh thành PDF
/tools/merge-pdf            Ghép PDF
/tools/pdf-editor           Trình chỉnh sửa PDF
/tools/image-filter         Halftone
/resources                  Kho tài nguyên
/resources/[slug]           Chi tiết tài nguyên
/skills                     Thư viện skill và quy trình
/skills/[slug]              Chi tiết / hướng dẫn áp dụng
/prompts                    Thư viện prompt
/prompts/[slug]             Dựng và chỉnh prompt
/collections                Bộ sưu tập biên tập
/collections/[slug]         Nội dung bộ sưu tập
/saved                      Các mục đã lưu trên thiết bị
/search?q=...               Kết quả tìm kiếm toàn cục
/about                      Giới thiệu và cách sử dụng
```

Trang QR có thể dùng chung engine/lớp UI với barcode. Tách route để người dùng tìm và chia sẻ đúng công cụ; không nhân đôi logic.

### 5.2. Sidebar

- Nhận diện DesignForge ở đầu.
- Nhóm khám phá: Khám phá, Công cụ, Tài nguyên, Skill, Prompt.
- Nhóm thư viện: Bộ sưu tập, Đã lưu.
- Khu vực trợ giúp và phiên bản ở cuối, gọn, không dashboard số liệu giả.
- Active item dùng nền nhạt + chữ/icon rõ; không dùng một chấm màu làm dấu hiệu duy nhất.
- Không liệt kê hàng chục công cụ trực tiếp vào sidebar. Các nhóm con nằm trong trang danh mục và tìm kiếm.

### 5.3. Taxonomy

Tách **loại nội dung** khỏi **chủ đề** và **khả năng thực thi**:

| Trục | Ví dụ | Tác dụng |
|---|---|---|
| Content kind | tool, resource, skill, prompt | Chọn card/detail renderer |
| Discipline | branding, packaging, graphic, UI/UX, motion, 3D | Lọc theo ngành |
| Category | barcode, PDF, image, font, mockup | Điều hướng nghiệp vụ |
| Tags | SVG, print, social, beginner | Tìm và liên kết chéo |
| Runtime | client, external, server | Biết công cụ chạy ở đâu |
| Publication | draft, published, archived | Quản lý nội dung |
| Availability | ready, beta, unavailable | Trạng thái sử dụng thực tế |
| License | nguồn và điều kiện cụ thể; unknown khi chưa rõ | Hiển thị quyền sử dụng tài nguyên |

Không tạo category mới chỉ vì có một tag mới. Định nghĩa ID ổn định, label có thể dịch, thứ tự hiển thị nằm trong dữ liệu cấu hình.

## 6. Các hành trình người dùng

### 6.1. Tìm và dùng công cụ

1. Gõ “mã vạch”, “EAN”, “ghép PDF” hoặc chọn Công cụ.
2. Xem tên, tác dụng, định dạng hỗ trợ và trạng thái.
3. Mở workspace; có ví dụ và hướng dẫn ngay trước input.
4. Nhập/thả file; UI phản hồi và giữ input khi lỗi.
5. Xem trước kết quả; tùy chọn nâng cao được nhóm gọn.
6. Xuất file; thông báo hoàn thành và tên file rõ.
7. Gợi ý công cụ liên quan có ích ở cuối, không cản thao tác chính.

### 6.2. Tìm tài nguyên

1. Tìm theo từ khóa hoặc chuyên ngành.
2. Lọc loại tài nguyên, định dạng/phần mềm và điều kiện sử dụng.
3. Xem preview, mô tả, nguồn, giấy phép và ngày kiểm tra.
4. Lưu hoặc mở nguồn gốc; nhãn CTA phân biệt “Mở nguồn” và “Tải file”.
5. Quay lại giữ filter/query và vị trí trang hợp lý.

### 6.3. Áp dụng skill

1. Chọn skill theo mục đích, ví dụ “kiểm tra bố cục trước khi xuất”.
2. Xem khi nào dùng, đầu vào, bước làm, ví dụ và checklist.
3. Mở công cụ/prompt liên quan.
4. Copy hoặc tải tài liệu khi nội dung và giấy phép cho phép.

“Skill” có hai loại cần phân biệt trong dữ liệu: kiến thức/quy trình cho designer và gói hướng dẫn cho AI/công cụ. Website không tự chạy mã hoặc cài skill chỉ vì người dùng mở một trang skill.

### 6.4. Dựng prompt

1. Duyệt thumbnail và nhóm mẫu; tìm theo phong cách/sản phẩm.
2. Chọn mẫu → trang chi tiết có preview và form riêng.
3. Điền phần cơ bản, mở tùy chỉnh nâng cao khi cần.
4. Dựng prompt bằng template engine cục bộ.
5. Chỉnh kết quả, copy, hoặc chủ động mở nhà cung cấp ngoài.
6. Nếu clipboard hoặc popup bị chặn, vẫn có ô văn bản và link mở thủ công.

## 7. Hướng thiết kế giao diện

**Art direction đã chốt: Modern Creative Tech.** Nền navy sâu, card glass, violet/cyan gradient và hierarchy rõ để sản phẩm có năng lượng công nghệ nhưng vẫn đọc lâu thoải mái.

Đặc điểm:

- Navy canvas cho nền, surface tối trong suốt cho nội dung; chữ trắng xanh với secondary text đủ contrast.
- Terracotta làm màu nhận diện; sage chỉ là màu phụ khi cần phân nhóm.
- Bo góc vừa phải, viền mảnh; bóng nhẹ chỉ để phân tầng.
- Typography sans rõ và hỗ trợ tiếng Việt; một display treatment tiết chế ở hero.
- Card tài nguyên có ảnh thật; card công cụ dùng icon và mô tả ngắn.
- Hero vừa đủ định vị, tìm kiếm xuất hiện sớm; không chiếm toàn bộ màn hình đầu.
- Trang danh mục đều đặn, editor rộng rãi; không ép mọi màn hình thành cùng một lưới card.

Chi tiết màu, khoảng cách, font, trạng thái và responsive nằm trong [design master](../design-system/designforge/MASTER.md). Đây là nguồn duy nhất cho quy chuẩn thị giác.

### 7.1. Khung desktop tham chiếu

```text
┌────────────────┬──────────────────────────────────────────────────┐
│ DesignForge    │ Breadcrumb / Tên trang        Tìm kiếm    Đã lưu │
│                ├──────────────────────────────────────────────────┤
│ Khám phá       │ Tiêu đề + lời dẫn ngắn                           │
│ Công cụ        │ Search nổi bật trên trang Khám phá               │
│ Tài nguyên     │                                                  │
│ Skill          │ Nhóm nội dung / Filter / Số kết quả               │
│ Prompt         │                                                  │
│                │ Nội dung chính theo loại trang                   │
│ Bộ sưu tập     │ Card công cụ / preview tài nguyên / bài đọc       │
│ Đã lưu         │                                                  │
│                │                                                  │
│ Trợ giúp       │ Footer ngắn và công cụ liên quan khi phù hợp      │
└────────────────┴──────────────────────────────────────────────────┘
```

Không trùng hai ô search nổi bật: trên trang Khám phá, header dùng nút mở search nhỏ; trang con dùng search gọn trong header.

### 7.2. Trang Khám phá

Thứ tự đề xuất:

1. Hero thấp: định vị + search + gợi ý truy vấn.
2. Truy cập nhanh nhóm công cụ.
3. Công cụ hữu ích: 4–6 mục chọn lọc theo biên tập, không gắn nhãn “phổ biến” nếu chưa có dữ liệu.
4. Tài nguyên nổi bật: 4–8 mục có thumbnail thống nhất.
5. Bộ sưu tập theo công việc: thiết kế bao bì, poster đồ uống, chuẩn bị file in.
6. Skill/prompt mới cập nhật.
7. Recently used xuất hiện khi thiết bị đã có lịch sử; không để khoảng trống giả khi lần đầu vào.

Không bịa số lượng người dùng, lượt tải hoặc danh mục hàng nghìn mục để làm trang trông đông.

### 7.3. Trang danh mục

- Tiêu đề, mô tả một câu, search theo phạm vi và filters.
- Filter chips có nhãn rõ; hỗ trợ xóa từng filter và xóa tất cả.
- Query/filter/sort/page phản ánh trên URL.
- Sort mặc định “Đề xuất”; thêm mới cập nhật và A–Z khi có dữ liệu tương ứng.
- Số kết quả dựa vào danh sách thật.
- Không thêm nút chọn grid/list trong V1 để giữ một bố cục cố định.
- Empty state nói rõ không có dữ liệu hay không có kết quả phù hợp.

### 7.4. Trang chi tiết tài nguyên/skill

- Breadcrumb, title, mô tả, metadata và CTA có thứ bậc.
- Nội dung đọc tối đa khoảng 65–75 ký tự mỗi dòng.
- Preview lớn nhưng không đẩy CTA và thông tin nguồn quá xa.
- Metadata: loại, chủ đề, định dạng, nguồn, tác giả nếu có, giấy phép, cập nhật.
- Skill thêm: dùng khi nào, yêu cầu trước khi dùng, quy trình, ví dụ, checklist và công cụ liên quan.
- Nếu chưa xác minh giấy phép, hiển thị “Chưa xác minh”; không gán nhãn miễn phí thương mại.

### 7.5. Workspace công cụ

Mẫu chung: header → vùng nhập/điều khiển → preview → export → hướng dẫn liên quan.

- Desktop: controls 280–336 px; preview chiếm phần còn lại.
- Barcode: input dạng hàng, preview dạng danh sách; advanced properties gom accordion.
- Halftone: controls bên trái, canvas bên phải, thông tin kích thước và export rõ.
- PDF editor: page list + canvas + properties, chỉ đủ ba vùng ở màn hình rộng; inspector thành drawer khi thiếu chỗ.
- Mobile: ưu tiên input và preview theo luồng dọc hoặc tab Nhập/Xem trước; CTA xuất không che bàn phím.
- Loading/error của một công cụ nằm trong workspace đó; shell và điều hướng vẫn hoạt động.

## 8. Danh mục chuyển đổi chức năng

### 8.1. Barcode và QR

Giữ EAN-13, UPC-A, ITF-14, Code 128, GS1-128, QR Code. Cùng engine hỗ trợ type, validation, properties và export.

Yêu cầu:

- Input luôn là chuỗi để giữ số 0 đầu; không dùng kiểu number cho mã sản phẩm.
- Gợi ý độ dài và ví dụ theo từng loại.
- Kiểm tra checksum và định dạng; không silently sửa dữ liệu sai nếu người dùng chưa được báo.
- GS1-128 có test riêng cho ký tự phân tách/FNC1 và cấu trúc dữ liệu; chỉ nhìn mã hiển thị chưa đủ chứng minh đúng.
- Nhiều mã cùng lúc, thêm/xóa hàng, báo lỗi theo hàng.
- Font, cỡ chữ, text margin, bar height/width, margin, hiển thị số, màu vạch/nền và QR size.
- Xuất SVG/PDF/PNG; xác minh cụ thể khả năng từng loại ở baseline, nhất là QR vector và batch export.
- Preview và export dùng cùng dữ liệu đã validate; không có hai bản thuật toán tính kích thước khác nhau.
- Tùy chọn ảnh hưởng khả năng quét cần giải thích tại chỗ; không tự tuyên bố “đạt chuẩn in” chỉ từ preview.

### 8.2. Prompt library và builder

- Chuyển đủ 8 template, mapping ID cũ → ID mới nếu cần.
- Giữ bản prompt gốc, template có placeholder, ảnh, alt text và thứ tự field.
- Giữ advanced fields, options, default và placeholder khi slogan/mô tả chưa nhập.
- Giữ khả năng chỉnh output và copy; lưu field theo template trên thiết bị.
- Nhóm nguồn có Juice, Coffee, Energy, Aloe vera; snapshot chỉ có nội dung Juice/Aloe vera. Nhóm trống không được gắn số lượng giả.
- Bổ sung search/tag ở UI mới, giữ nguyên nghĩa và nội dung prompt khi migration.
- Link Gemini/Dola là hành động mở bên ngoài sau khi người dùng bấm; không tự gửi input hoặc giả vờ đã tạo ảnh.
- Khi chuyển domain, localStorage cũ không tự chuyển theo. Nếu cần giữ preset cũ, làm luồng export/import rõ ràng ở công việc riêng.

### 8.3. Image Filter — Halftone

- Import file/click/drop; trạng thái chưa có ảnh và ảnh lỗi.
- Giữ dot shapes: circle, triangle, square, diamond.
- Giữ màu, min/max dot size, spacing, contrast, PPI, quy đổi px/mm và artboard.
- Giữ xử lý vùng trắng/gần trắng theo baseline nguồn.
- Preview, reset, xuất PNG và SVG.
- Ràng buộc min ≤ max, PPI hợp lệ; phân biệt kích thước pixel và kích thước vật lý.
- Preview chất lượng thấp có thể dùng khi kéo slider; xuất phải dùng độ phân giải đích và cùng thuật toán.
- SVG nhiều dot cần giới hạn/ước lượng kích thước; không để một ảnh lớn treo tab.

### 8.4. Ảnh thành PDF

- Import nhiều ảnh; PNG/JPEG/WebP và TIFF theo khả năng decoder thực tế.
- Thumbnail, xóa ảnh, đổi thứ tự bằng kéo thả và nút lên/xuống.
- Fit to image, A4 dọc/ngang; chất lượng None/Medium/Strong.
- Giữ thứ tự và hướng ảnh; EXIF rotation cần fixture.
- Export PDF với tiến độ và lỗi file cụ thể.
- Ghi rõ thiết lập nén làm thay đổi chất lượng; không gọi đây là chuyển đổi CMYK hoặc PDF/X.

### 8.5. Ghép PDF

- Import nhiều PDF, hiển thị tên/số trang/kích thước file khi đọc được.
- Sắp xếp, xóa, ghép theo thứ tự.
- Chế độ không nén và các mức nén từ nguồn, đối chiếu hành vi thật.
- Nếu nén làm raster hóa trang, ghi rõ mất text/vector và kiểm tra DPI.
- PDF khóa, hỏng, quá lớn phải có thông báo và lối xử lý.
- Không mặc định giữ được bookmark, form field, chữ ký hoặc metadata nếu chưa kiểm thử.

### 8.6. PDF editor — lõi

- Mở PDF, thêm PDF/ảnh vào tài liệu đang làm.
- Page list, chọn/xóa/đổi thứ tự trang.
- Thêm text, ảnh, shape, line và arrow.
- Chỉnh style, font, kích thước, màu; giữ các biến thể shape từ nguồn.
- Zoom/pan có nút hiển thị; shortcut là bổ sung.
- Crop, rotate 90°, resize paper; tùy chọn áp dụng mọi trang có mô tả phạm vi rõ.
- Xuất PDF theo mode nguồn và xuất ảnh trang hiện tại/toàn bộ.
- State lựa chọn, undo/redo và mô hình tọa độ là phần nền cần làm trước khi port thao tác phức tạp.
- Kiểm tra crop/rotation/zoom không làm lệch vị trí object trong file xuất.

### 8.7. PDF editor — nhận diện và thay chữ nâng cao

Đây vẫn thuộc cam kết chuyển đổi, không bị loại chung với AI Remove BG.

- Đọc text layer trước, OCR khi cần; nguồn dùng Tesseract với eng/vie và fallback eng.
- Chọn vùng, nhận diện font tương đồng, phân tích scan, nhập chữ thay thế.
- Giữ blur/sharpen/noise/contrast/JPEG và các điều chỉnh scan khác theo source parity.
- Giữ tính năng mở lại và chỉnh object đã tạo; nhập tay khi OCR thất bại.
- Tách OCR/font matching/scan effects thành service cục bộ có lazy-load, progress, cancel và lỗi riêng.
- Cần kiểm chứng thời gian tải model, network/font dependencies, chất lượng tiếng Việt và tài liệu scan trước khi đánh dấu ready.
- Nếu chưa đạt chất lượng ở lần ra mắt thử nghiệm, ghi rõ beta/giới hạn và tiếp tục backlog. Không tuyên bố V1 full migration đã xong khi capability này còn thiếu.

**Thứ tự port:** barcode/QR → prompt → halftone → ảnh thành PDF/ghép PDF → PDF editor lõi → OCR/scan nâng cao.

## 9. Kiến trúc frontend đề xuất

### 9.1. Stack và lý do

Đây là stack **đề xuất cho repo trống**, không phải stack đã được cài đặt:

| Thành phần | Đề xuất | Vai trò và giới hạn |
|---|---|---|
| Framework | Next.js App Router + React + TypeScript strict | Trang catalog/detail có đường dẫn và metadata; công cụ tương tác chạy client |
| UI | Tailwind CSS + primitive shadcn/ui phù hợp | Tự thiết kế visual layer; không dùng nguyên theme mặc định |
| Icons | Lucide | Một bộ icon nhất quán |
| Schema | Runtime schema, đề xuất Zod | Validate content, preset, boundary dữ liệu |
| State | React state/reducer; store cục bộ cho editor nếu cần | Không dựng global store cho mọi input |
| Remote state | TanStack Query khi thực sự có HTTP tương tác | Chưa cần chỉ để đọc JSON tĩnh |
| Processing | Engine TypeScript + Workers nơi phù hợp | PDF, image, OCR tách khỏi UI |
| Tests | Vitest/Testing Library và Playwright | Engine, flow, keyboard, screenshot và output |
| Package management | Một package manager + lockfile | Chốt phiên bản tương thích trong P1 |

Next.js cho phép tách phần render server và phần tương tác client; browser APIs và editor phải nằm trong client boundary. Không đưa toàn bộ catalog vào client bundle chỉ vì công cụ cần canvas. [Tài liệu Next.js](https://nextjs.org/docs/app/getting-started/server-and-client-components)

shadcn/ui cung cấp component code có thể sở hữu và tùy biến trong repo; DesignForge vẫn cần token và diện mạo riêng. [Tài liệu shadcn/ui](https://ui.shadcn.com/docs)

P1 phải kiểm chứng một spike gồm route công cụ dùng canvas/PDF worker và một detail page từ content. Nếu môi trường triển khai chỉ cho static SPA hoặc Next không có lợi ích thực tế, ghi ADR chuyển sang React + Vite + router trước khi xây đại trà. Domain/engine/repository giữ nguyên; không duy trì hai framework đồng thời.

Không chọn backend provider/database theo HyperDesignDev một cách mặc định. Khả năng hosting và nghiệp vụ backend được quyết định sau.

### 9.2. Cấu trúc thư mục đích

```text
src/
  app/                       Route, layouts, metadata, loading/error boundaries
  components/
    ui/                      Button, Input, Dialog, Select, primitives
    layout/                  AppShell, Sidebar, Header, Container
    catalog/                 Card, FilterBar, SearchField, Metadata
    tool-workspace/           ToolHeader, Dropzone, PreviewFrame, ExportActions
  features/
    catalog/                 Types, selectors, use cases
    search/                  Index adapter, ranking, query parser
    resources/               Resource detail và filters
    skills/                  Skill renderer
    prompts/                 Template engine, form, storage mapping
    saved/                   Saved repository, UI
    collections/             Collection detail, item ordering
    tools/
      registry/              Serializable metadata + code loader map riêng
      barcode/               schema, engine, UI, exports, tests
      qr-code/               Dùng chung core phù hợp
      image-filter/          schema, engine, worker, UI, tests
      images-to-pdf/
      merge-pdf/
      pdf-editor/            document model, commands, canvas, export, OCR
  contracts/                 Boundary schemas, DTO, error contracts
  repositories/              Interface theo domain
  adapters/
    local/                   File content, in-memory
    browser/                 localStorage/IndexedDB wrappers
    http/                    Contract fixtures trước, production sau
  lib/                       Hàm dùng chung thật sự, không business logic lẫn lộn
  styles/tokens/             primitives, semantic, components
  config/                    Navigation, flags, environment validation
content/
  resources/
  skills/
  prompts/
  collections/
public/
  images/
  fonts/
  workers/                   Chỉ khi thư viện/runtime yêu cầu vị trí này
tests/
  fixtures/
  e2e/
docs/
  decisions/
  qa/
design-system/designforge/
```

Khởi đầu một ứng dụng có module rõ; chưa cần microfrontend, nhiều package hay monorepo phức tạp. Chỉ tách package khi đã có consumer hoặc vòng đời độc lập thật.

### 9.3. Luật phụ thuộc

```text
Route/UI → Feature use case → Domain/engine
                     ↓
               Repository interface
                     ↑
        Local / Browser / HTTP adapter
```

- Domain/engine không import React, `document`, localStorage hoặc HTTP.
- UI gọi use case/controller; không tự phát minh logic nghiệp vụ trong event handler.
- Adapter chịu trách nhiệm I/O và map dữ liệu sang domain model.
- Shared components không import một tool cụ thể.
- Một tool không truy cập state nội bộ của tool khác.
- Dùng data flow và state tối thiểu; danh sách lọc là dữ liệu suy ra, không lưu nhiều bản sao dễ lệch. [Thinking in React](https://react.dev/learn/thinking-in-react)

### 9.4. Tool registry

Metadata có các trường: `id`, `slug`, `name`, `summary`, `categoryIds`, `tags`, `iconKey`, `runtime`, `availability`, `capabilities`, `inputFormats`, `outputFormats`, `relatedIds`, `schemaVersion`.

Tách hai lớp:

1. **Catalog metadata:** JSON-serializable để sau này lấy từ API/CMS.
2. **Implementation registry:** map ID → dynamic import trong source code, có type checking.

Backend chỉ bật/tắt hoặc cấu hình capability đã có trong mã được kiểm soát. Không cho metadata cung cấp URL JavaScript để thực thi tùy ý.

Không ép mọi công cụ vào một giant form renderer. Dùng common ToolShell và mỗi tool có UI/engine riêng theo nghiệp vụ.

### 9.5. Quy trình thêm công cụ mới

1. Tạo module và schema input/output.
2. Viết engine độc lập; định nghĩa lỗi/cancel/progress nếu cần.
3. Đăng ký metadata và loader.
4. Dùng ToolShell, form và preview phù hợp.
5. Thêm guide, ví dụ và related items.
6. Thêm fixture có output đúng, test flow cần thiết.
7. Registry tự đưa công cụ vào catalog/search; không chỉnh thủ công nhiều mảng ở nhiều trang.
8. Chạy checklist về accessibility, performance và file export.

Mục tiêu kiểm chứng: thêm một tool mẫu trong P1 mà không sửa sidebar, home renderer hoặc shared components.

## 10. Dữ liệu, tìm kiếm và lưu trên thiết bị

### 10.1. Content model

Base entity: `id`, `slug`, `kind`, `title`, `summary`, `categoryIds`, `tags`, `locale`, `publicationStatus`, `createdAt`, `updatedAt`, `schemaVersion`.

Các phần mở rộng:

- Resource: preview assets, canonical source URL, author, license, file formats, software, external download URL, verifiedAt.
- Skill: audience, prerequisites, steps, examples, checklist, references, relatedToolIds, skillFormat.
- Prompt: original source path, template body, field definitions, defaults, category, thumbnails, templateVersion.
- Collection: title, description, cover, ordered item references và curation notes.
- Asset: ID/path, width, height, alt, attribution/license khi có.

Giữ ID bất biến khi đổi tên; slug đổi thì có redirect mapping. Không tham chiếu chéo bằng tên hiển thị.

### 10.2. Search V1

- Index metadata của tool/resource/skill/prompt/collection; không index toàn bộ prompt body mặc định.
- Chuẩn hóa chữ hoa/thường và dấu tiếng Việt; giữ bản gốc để hiển thị.
- Alias: mã vạch/barcode, gộp/ghép/merge PDF, nửa tông/halftone theo từ điển biên tập.
- Xếp hạng: exact title → prefix/title tokens → tags/alias → summary.
- Search toàn cục phân nhóm loại kết quả; search danh mục giới hạn đúng scope.
- Filter trong cùng một trục dùng OR; khác trục dùng AND; mô tả rõ và kiểm thử.
- URL encode đúng; Back/Forward khôi phục query/filter/page.
- `/` hoặc Ctrl/Cmd+K là shortcut phụ, không cướp focus khi đang gõ trong form/editor.
- Kết quả cập nhật không làm giật focus; có thông báo số lượng cho screen reader ở mức phù hợp.
- Catalog nhỏ dùng index cục bộ; benchmark với 1.000 bản ghi giả rõ nhãn trong test, không đem vào nội dung production.

### 10.3. Browser persistence

- Saved/Recent: ID + timestamp và schemaVersion trong storage có namespace.
- Preset prompt/tool: dữ liệu có kiểm tra kiểu và migration version.
- Blob/tài liệu lớn không vào localStorage; chỉ dùng IndexedDB nếu sau này có yêu cầu lưu bản nháp file.
- Storage đầy, bị chặn hoặc JSON hỏng không làm ứng dụng crash; chuyển in-memory và báo giới hạn khi liên quan.
- Không lưu file người dùng hoặc prompt nhạy cảm vào analytics/log.
- Có “Xóa lịch sử” và “Xóa dữ liệu trên thiết bị”; thao tác phá hủy nhiều dữ liệu có xác nhận.
- Nói đúng “Đã lưu trên thiết bị này”, chưa dùng “đồng bộ” khi chưa có backend.

## 11. Chuẩn bị backend từ đầu

### 11.1. Những gì làm ngay

- Interface repository: CatalogRepository, PromptRepository, SavedRepository, CollectionRepository.
- Async boundary kể cả adapter local để hỗ trợ loading/error/cancellation.
- DTO tách khỏi UI props và domain model.
- Error contract có code, message, fieldErrors tùy trường hợp và retryable.
- Pagination/filter/sort contract thống nhất; không truyền tên bảng DB ra component.
- Các mock HTTP fixture mô phỏng loading, empty, timeout, validation error và retry.
- Client không có credential/server secret; environment config được validate.

### 11.2. API dự kiến — hợp đồng sơ bộ, chưa triển khai

| Nhóm | Endpoint minh họa | Vòng đời |
|---|---|---|
| Catalog | GET /api/v1/catalog?kind=&q=&category=&cursor= | V2 public content |
| Resource/skill | GET /api/v1/resources/:id; GET /api/v1/skills/:id | V2 public |
| Prompt | GET /api/v1/prompts/:id | V2 content; dựng prompt vẫn có thể client |
| Saved | GET /api/v1/me/saved; PUT/DELETE /api/v1/me/saved/:id | V2 auth |
| Collections | GET/POST /api/v1/me/collections | V2 auth |
| Upload | POST /api/v1/uploads | Chỉ khi cần lưu/xử lý file |
| Jobs | POST /api/v1/jobs; GET /api/v1/jobs/:id | Chỉ khi có server processing |
| Admin | /api/v1/admin/... | RBAC và audit ở server |

Cursor là opaque; response có `items`, `nextCursor`, `total` tùy khả năng cung cấp. Error response ổn định; tránh UI parse message để xác định loại lỗi.

### 11.3. Hướng kiến trúc backend tương lai

Khởi đầu modular backend: content, user library, assets, jobs và admin. Lựa chọn SQL/object storage/queue dựa vào hosting và nghiệp vụ ở V2; không dựng microservices trước khi cần.

- DB lưu nội dung có cấu trúc, quan hệ, quyền và trạng thái.
- Object storage lưu asset/file; DB không nhét blob lớn.
- Job queue chỉ cho tác vụ bất đồng bộ đủ nặng.
- Authorization phải ở server, kiểm tra quyền từng object; ẩn nút admin ở frontend không phải bảo vệ.
- Upload có giới hạn kích thước/định dạng, TTL và quyền truy cập.
- Nếu server đọc URL bên ngoài cần phòng SSRF; nếu render nội dung biên tập cần kiểm soát HTML/Markdown.
- External AI keys và request signing chỉ ở server nếu sau này bổ sung nhà cung cấp.

### 11.4. Lộ trình nối backend

1. Chốt contract và test dùng local/mock adapter.
2. Có staging API triển khai theo contract.
3. Thêm HTTP adapter; map DTO và error.
4. Chạy cùng bộ contract tests cho local và HTTP.
5. Chuyển bằng config ở composition root, không sửa từng component.
6. Thêm auth và server-side permissions khi có user data.
7. Đưa saved/preset cục bộ lên tài khoản qua luồng người dùng chủ động; xử lý trùng/xung đột, không ghi đè âm thầm.

“Sẵn sàng backend” nghĩa là có ranh giới đã kiểm chứng; không có nghĩa mọi thay đổi nghiệp vụ tương lai đều không cần sửa frontend.

## 12. Kế hoạch chuyển mã nguồn và tài sản

1. Chụp snapshot danh mục file cần chuyển, hash hoặc commit nguồn nếu có; không copy cả repo.
2. Chạy baseline trên nguồn: input, cấu hình, screenshot, file output, network requests và lỗi đã biết.
3. Lập mapping source function → engine/service/UI mới.
4. Đưa prompt/template/thumbnail cần thiết vào cấu trúc content/assets có kiểm tra tham chiếu.
5. Trích engine, viết characterization tests với input/output đã ghi nhận.
6. Thiết kế UI mới dựa trên component system, nối engine và kiểm tra luồng thật.
7. So sánh kết quả; nếu sửa bug nguồn thì ghi rõ khác biệt có chủ đích.
8. Loại global state, inline handler, CDN script tag và phụ thuộc thứ tự nạp khỏi code mới.
9. Pin dependency sau kiểm tra API/security/worker compatibility; không nâng tất cả thư viện cùng lúc với port logic nếu khó truy vết lỗi.
10. Chỉ đánh dấu migrated khi file xuất được mở/giải mã và kiểm thử quan trọng đã đạt.

Không copy `.git`, `node_modules`, `dist`, lịch sử ComfyUI, proxy/workflow thử nghiệm hoặc logo của sản phẩm cũ vào bản ship. Các file đó chỉ được dùng làm nguồn đọc khi cần hiểu dependency.

Không sao chép global CSS của barcode-generator vào shell. Nếu phải dùng bridge tạm cho editor phức tạp, cô lập rõ, có owner, deadline gỡ và không coi đó là kiến trúc kết thúc.

## 13. Hiệu năng, file lớn và vòng đời xử lý

- Trang Khám phá không tải PDF.js, OCR model, font matcher hoặc engine halftone.
- Chỉ tải module khi người dùng mở công cụ; chỉ tải OCR khi gọi nhận diện.
- Phần tính toán thích hợp chạy worker; DOM/canvas UI vẫn ở boundary tương ứng. Worker giao tiếp qua message, không truy cập DOM trực tiếp. [MDN Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- Xử lý nhiều trang tuần tự hoặc concurrency có giới hạn, không render tất cả trang PDF lớn cùng lúc.
- Có cancellation token/request ID; kết quả cũ không ghi đè thao tác mới.
- Thu hồi ObjectURL, dispose document/worker, bỏ canvas buffer khi đóng tool.
- Không dùng base64 cho mọi bước nếu Blob/ArrayBuffer phù hợp hơn.
- Preview có thể giảm kích thước; export chạy từ bản dữ liệu đủ chất lượng.

**Ngân sách ban đầu để đo và điều chỉnh:**

| Mục tiêu | Ngưỡng đề xuất | Cách kiểm chứng |
|---|---|---|
| Core shell JS | ≤ 200 KB gzip, không tính tool lazy chunks | Bundle report production |
| Web Vitals | LCP ≤ 2,5 s; INP ≤ 200 ms; CLS ≤ 0,1 | Lab ở V1; field p75 khi đủ traffic |
| Search catalog | Phản hồi ≤ 150 ms với 1.000 metadata items trên máy test ghi rõ cấu hình | Benchmark repeatable |
| Click feedback | Hiển thị trạng thái trong khoảng 100 ms | Trace/quan sát thao tác |
| Image preview | Giữ tương tác mượt bằng debounce và preview thấp hơn khi cần | Ảnh lớn + thao tác slider liên tục |
| Memory | Không tăng liên tục sau 5 vòng mở/xử lý/đóng cùng bộ fixture | DevTools profile có ghi chú |

Giới hạn thăm dò: 25 MB/ảnh, 24 megapixel; 100 MB/tổng PDF, 200 trang. Đây là ngưỡng để thử nghiệm trong P4, chưa công bố là mức hỗ trợ. Thiết bị yếu có thể cần mức thấp hơn. Lỗi giới hạn phải xuất hiện trước khi cấp phát bộ nhớ lớn.

## 14. Chất lượng giao diện và accessibility

- Nội dung chính 16 px, line-height 1,5–1,65; metadata 13–14 px có kiểm soát.
- Contrast mục tiêu: text thường ≥ 4,5:1; chữ lớn và thành phần UI mang thông tin ≥ 3:1.
- Nút quan trọng có vùng bấm 44×44 CSS px theo chuẩn thiết kế nội bộ.
- Focus nhìn thấy, không bị header/dialog che; skip link và heading đúng thứ bậc.
- Mọi drag có nút/keyboard alternative; không bắt người dùng nhớ Ctrl/Shift để biết tính năng tồn tại.
- Dialog giữ focus và trả về trigger; Escape khi an toàn; form lỗi có label/helper/error gắn đúng field.
- Reduced motion giảm animation, không cắt mất feedback trạng thái.
- Trang đọc/catalog không scroll ngang ở 320 px; canvas được pan trong vùng có hướng dẫn.
- Kiểm tra zoom 200%, reflow tương đương 320 CSS px, text dài tiếng Việt, ký tự có dấu.
- Thử header/menu khi bàn phím mobile mở và màn hình landscape.
- PDF editor mobile được nghiệm thu theo khả năng thao tác thật; nếu capability nào còn giới hạn phải có fallback hữu ích và ghi rõ, không im lặng ẩn toàn bộ chức năng.

## 15. Chiến lược kiểm thử

### 15.1. Engine và dữ liệu

| Module | Ca quan trọng |
|---|---|
| Barcode | Độ dài, checksum, số 0 đầu, nhiều dòng lỗi độc lập, GS1 separators, QR UTF-8 |
| Prompt | 8 template, placeholder lặp, $&, dấu ngoặc, HTML giữ literal, field trống, default và legacy replacements |
| Halftone | 4 shape, trắng gần ngưỡng, min/max, px↔mm↔PPI, kích thước PNG/SVG và parity preview/export |
| PDF image/merge | Thứ tự trang, A4 orientation, ảnh EXIF, TIFF, PDF hỏng/khóa, compression fidelity |
| PDF editor | Crop/rotate/zoom transforms, undo/redo, object state, export flatten/original, font và Unicode |
| OCR | Text layer fallback, OCR eng/vie, model/font tải lỗi, manual fallback và cancellation |
| Catalog | ID/slug uniqueness, relation integrity, search aliases, filter semantics, schema validation |
| Persistence | Storage hỏng/đầy/bị chặn, preset version migration, ID đã bị xóa |

### 15.2. Kiểm chứng đầu ra

- Barcode/QR: decode độc lập khi có decoder phù hợp; test fixtures chuẩn; kiểm tra thêm in/quét thực tế trước khi quảng bá dùng cho sản xuất.
- PDF: reopen bằng parser khác/reader, đối chiếu số trang, kích thước, text layer và render ảnh mẫu.
- SVG: XML hợp lệ, viewBox/kích thước đúng, mở ở browser và phần mềm thiết kế mục tiêu ở mốc nghiệm thu.
- PNG: kích thước pixel, alpha và nội dung; không chỉ test download event.
- Prompt: so sánh với kết quả nguồn trên cùng input; giữ nguyên trường hợp placeholder chưa điền có chủ đích.

### 15.3. End-to-end và visual QA

- Tìm → mở tool → nhập → preview → export.
- Filter → detail → Back giữ đúng trạng thái.
- Save → refresh → còn dữ liệu; storage unavailable vẫn dùng được tool.
- Prompt → generate → edit → copy; clipboard failure fallback.
- PDF import → reorder → edit → export → reopen.
- Keyboard-only qua navigation, filter, dialog, upload và export.
- Screenshot 375/768/1024/1440/1920 px; 320 px để kiểm tra reflow.
- Browser matrix: Chrome/Edge, Firefox, Safari/WebKit; đánh dấu pending nếu chưa có môi trường xác minh.

### 15.4. Definition of Done cho mỗi feature

- Luồng chính chạy thật; không có nút trang trí giả chức năng.
- Input/output và các trường hợp lỗi thiết yếu đúng.
- Responsive và trạng thái tương tác đầy đủ.
- Engine/data boundary đúng kiến trúc.
- Không có lỗi console chưa giải thích hoặc rò rỉ tài nguyên rõ rệt.
- Hướng dẫn, metadata và trạng thái capability đúng thực tế.
- Kiểm tra phù hợp đã chạy, có kết quả ghi ở `docs/qa/`.
- Cập nhật progress và parity matrix.

## 16. Lộ trình triển khai theo mốc

Các ước lượng là ngày công tập trung để so sánh khối lượng, không phải lịch cam kết. PDF editor/OCR có độ bất định cao; chỉ chốt lịch sau baseline/spike. Không cắt kiểm thử file export để giữ một deadline chưa được xác nhận.

| Mốc | Kết quả | Phụ thuộc | Ước lượng |
|---|---|---|---|
| P0 | Baseline và quyết định thiết kế | Master plan | 1–2 ngày |
| P1 | Nền tảng kỹ thuật và design primitives | P0 | 2–3 ngày |
| P2 | Shell và ba màn hình mẫu được tinh chỉnh | P1 | 3–5 ngày |
| P3 | Catalog/resource/skill/prompt structure, search, saved | P2 | 3–5 ngày |
| P4A | Barcode/QR + prompt + halftone | P1/P2, baseline từng tool | 4–7 ngày |
| P4B | Ảnh→PDF và ghép PDF | P4A shared patterns | 2–4 ngày |
| P4C | PDF editor lõi | PDF spike, model tọa độ | 5–9 ngày |
| P4D | OCR/font/scan nâng cao | P4C | 3–6 ngày |
| P5 | QA tổng thể và kiểm chứng thay adapter | Các mốc trên | 3–5 ngày |
| P6 | Frontend release candidate và tài liệu vận hành | P5 | 1–2 ngày |

Tổng ước lượng thô nếu làm tuần tự: **27–48 ngày công**. Có thể giảm sau khi xác minh mức tái sử dụng engine; có thể tăng nếu PDF/export có lỗi nền. V2 backend được ước lượng riêng.

### P0 — Baseline và khóa phạm vi

- [ ] Ghi snapshot/commit/hash nguồn và kiểm tra nội dung thay đổi từ ngày lập master.
- [ ] Chạy source app, ghi screenshot và output cho từng nhóm công cụ.
- [ ] Kiểm tra đủ 8 prompt và thumbnail/bản gốc; ghi tài sản thiếu.
- [ ] Phân biệt capability hoạt động, lỗi có sẵn, phụ thuộc mạng và chưa xác minh.
- [ ] Kiểm tra OCR eng/vie, font loading, PDF output modes.
- [ ] Chốt hướng art direction từ master bằng một moodboard và mẫu UI có nội dung thật.
- [ ] Chốt stack sau spike nhỏ và xác định ràng buộc hosting nếu đã biết.

**Điều kiện qua mốc:** có parity matrix và fixtures đủ để biết đang giữ/sửa điều gì; không chỉ dựa vào tên file.

### P1 — Foundation

- [ ] Scaffold, strict types, alias, lint/format, scripts build/test/check.
- [ ] Token ba lớp, font/icon và accessibility primitives.
- [ ] Route skeleton, error/loading/not-found.
- [ ] Schemas, repositories và local adapters.
- [ ] Tool registry + loader map tách biệt.
- [ ] Dependency spike PDF.js/fontkit/TIFF/OCR với worker path đúng production.
- [ ] Thử một module nhỏ để kiểm chứng cách mở rộng.

**Điều kiện qua mốc:** production build chạy, refresh deep link không 404 ngoài ý muốn, heavy library không ở home bundle, module mẫu không buộc sửa shell.

### P2 — Visual foundation và prototype chất lượng cao

- [ ] AppShell/sidebar/header/mobile navigation.
- [ ] Khám phá có nội dung thật, đủ hierarchy và nhịp thở.
- [ ] Một trang danh mục tài nguyên.
- [ ] Một workspace Barcode đại diện cho form/preview/export.
- [ ] Một màn hình mobile tương ứng cho cả ba dạng.
- [ ] Rà typography tiếng Việt, contrast, card alignment, spacing và focus.
- [ ] Tinh chỉnh trước khi nhân thành toàn bộ màn hình.

**Điều kiện qua mốc:** ba loại màn hình cùng một hệ thiết kế, không còn lệch hướng rõ rệt; có screenshot và ghi quyết định. Đây là điểm review thị giác quan trọng nhất.

### P3 — Nền tảng nội dung và khám phá

- [ ] Catalog components và schema content.
- [ ] Resources/Skills/Prompts/Collections index/detail.
- [ ] Search/filters/sort/pagination theo URL.
- [ ] Saved/Recent qua storage adapter.
- [ ] Dữ liệu mẫu có nguồn thật; draft không hiển thị như nội dung hoàn chỉnh.
- [ ] Guides, empty/error/loading, liên kết chéo.
- [ ] Metadata, heading, canonical và sitemap cho nội dung public.

**Điều kiện qua mốc:** nhập thêm nội dung qua dữ liệu mà không sửa component; mọi card dẫn đến detail/tool/source đúng.

### P4A — Công cụ nhẹ và nội dung prompt

- [ ] Port barcode/QR và validation từng chuẩn.
- [ ] 8 templates, literal-safe interpolation và output editing/copy.
- [ ] Halftone đủ 4 shape và PNG/SVG.
- [ ] Đo preview/export và input lớn.
- [ ] Chạy parity với fixtures nguồn.

**Điều kiện qua mốc:** xuất file/chuỗi thật đúng, không chỉ có UI tương tự.

### P4B — PDF conversion

- [ ] Images to PDF, reorder và quality modes.
- [ ] Merge PDF, compression behavior và giải thích chất lượng.
- [ ] Progress/cancel, file errors và memory cleanup.
- [ ] Reopen và render file xuất.

**Điều kiện qua mốc:** thứ tự, kích thước trang, hình ảnh/text/vector đáp ứng phạm vi đã công bố.

### P4C — Editor lõi

- [ ] Document model, tọa độ trang và command history.
- [ ] Page manager, canvas/selection/inspector.
- [ ] Text/image/shapes/lines, zoom/pan.
- [ ] Crop/rotate/resize/apply-all.
- [ ] Export PDF/image và undo/redo.
- [ ] Thiết kế tablet/mobile cùng keyboard alternatives.

**Điều kiện qua mốc:** transform và export nhất quán; không mất object/trang khi thay đổi thao tác hoặc mode.

### P4D — OCR và scan

- [ ] Tesseract/font service lazy-load.
- [ ] Vùng chọn → nhận diện → font/scan suggestion → chỉnh tay → thay chữ.
- [ ] Mở lại object và khôi phục thông số.
- [ ] Cancel/error/manual fallback.
- [ ] Kiểm tra ảnh scan Việt/Anh, độ mờ và font khác nhau.

**Điều kiện qua mốc:** đáp ứng baseline hoặc ghi khác biệt rõ; không có phụ thuộc ComfyUI/local proxy không chủ đích.

### P5 — Hardening

- [ ] Visual audit và accessibility.
- [ ] Regression toàn bộ migrated capability.
- [ ] Bundle/network/memory budgets.
- [ ] Content integrity và license/source metadata.
- [ ] Demo thay local repository bằng mock HTTP, gồm lỗi và latency.
- [ ] Rà không có AI Remove BG trong UI, registry, route hoặc dependency ship.
- [ ] Responsive/browser matrix với các mục pending được nêu cụ thể.

**Điều kiện qua mốc:** không còn lỗi chặn luồng chính, file xuất sai hoặc mất dữ liệu có thể tái hiện.

### P6 — Release candidate frontend

- [ ] README chạy/build/test.
- [ ] Hướng dẫn thêm tool/resource/skill/prompt.
- [ ] Dependency và source manifest.
- [ ] QA report và known limitations.
- [ ] Backend contracts và backlog V2.
- [ ] Preview production build kiểm tra deep links/assets/worker paths.
- [ ] Đưa bản preview để review trước bước xuất bản theo yêu cầu triển khai riêng.

**Điều kiện hoàn thành V1:** tất cả capability cam kết đã đạt, hoặc có thay đổi phạm vi được người dùng chấp nhận rõ ràng; không dùng nhãn “xong” để che phần editor khó còn thiếu.

## 17. Rủi ro và cách kiểm soát

| Rủi ro | Ảnh hưởng | Cách giảm |
|---|---|---|
| Chỉ làm landing đẹp, tool bên trong chắp vá | Chất lượng không đồng nhất | P2 review cả catalog và workspace trước khi nhân rộng |
| Code nguồn phụ thuộc global state/DOM ID | Port gây lỗi chéo | Engine extraction, scope lifecycle, characterization tests |
| PDF export lệch hình/text/font | Sai đầu ra chuyên môn | Fixtures + reopen + render so sánh |
| OCR/scan bị bỏ vì phức tạp | Không đủ yêu cầu chuyển toàn bộ | Mốc P4D riêng, parity matrix không cho đóng sớm |
| Font/CDN tải lỗi hoặc không phù hợp quyền dùng | Tool không ổn định | Asset/dependency audit, package/local font có quyền, fallback rõ |
| Công cụ mới kéo bundle trang chủ phình | Web chậm | Loader map, lazy chunks và bundle budgets |
| Ảnh/PDF lớn làm treo tab | Mất công việc | Worker, limits, progress/cancel, bounded memory |
| Mỗi trang tự gọi API/storage | Backend khó tích hợp | Repository/interface từ P1, mock HTTP contract ở P5 |
| Catalog lớn nhưng taxonomy tùy tiện | Khó tìm | IDs, schema, controlled tags và search tests |
| Scope nở sang AI/auth/community sớm | Trễ V1 | Đưa vào V2/backlog, giữ yêu cầu gốc làm ưu tiên |
| Nguồn cũ tiếp tục được chỉnh sửa | Bỏ sót bản mới | Snapshot và delta audit trước từng đợt migration |

## 18. Quản trị tiến độ và quyết định

- `docs/PROGRESS.md` ghi mốc hiện tại, hoàn thành, kiểm thử, chặn và bước tiếp theo.
- `docs/SOURCE-AUDIT.md` giữ danh mục nguồn; khi triển khai bổ sung cột target/status/evidence.
- `design-system/designforge/MASTER.md` là nguồn quy chuẩn giao diện; override trang chỉ ghi khác biệt có lý do.
- `docs/decisions/ADR-xxxx-*.md` ghi quyết định stack, document model, storage và backend contracts khi được chốt.
- `docs/qa/` giữ báo cáo test, screenshot và output comparison; không nhét file người dùng nhạy cảm vào fixture.
- Mỗi mốc báo: đã thay đổi gì, kết quả thực tế, còn giới hạn nào và việc tiếp theo.

Quyết định có thể dùng để bắt đầu: UI tiếng Việt, light mode ấm, một layout ổn định, ưu tiên browser processing, catalog cục bộ qua adapter.

Quyết định còn mở nhưng chưa chặn kế hoạch: logo cuối cùng, bộ ảnh thương hiệu, danh sách tài nguyên/skill biên tập đầu tiên, hosting/domain, quyền người dùng và lưu file ở V2.

## 19. Trình tự hành động ngay sau master plan

1. Baseline nguồn với file mẫu thật và xác nhận phạm vi PDF/OCR.
2. Spike stack/worker và dựng token + shell.
3. Hoàn thiện ba màn hình đại diện: Khám phá, Kho tài nguyên, Barcode workspace, kèm mobile.
4. Review độ đẹp/dễ dùng, cập nhật design master.
5. Nhân rộng catalog và chuyển engine theo thứ tự đã định.

Không bắt đầu bằng việc bê toàn bộ HTML/CSS cũ vào DesignForge. Chất lượng đích được tạo từ design system, kiến trúc module và bằng chứng chức năng tương đương.

## Cập nhật cấu trúc UI theo phản hồi

Bố cục header ngang và gallery thay cho sidebar/hero prototype. Quy tắc hiện hành nằm trong design-system/designforge/MASTER.md, mục Bố cục gallery. Route, catalog và repository giữ nguyên.
