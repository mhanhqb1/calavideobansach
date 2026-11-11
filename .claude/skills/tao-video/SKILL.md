---
name: tao-video
description: Tạo trọn một video affiliate bán sách dọc 9:16 (TikTok / Shopee Video / Reels) từ một dòng lệnh "tên sách + tác giả + số phút". Tự tìm tư liệu sách, viết kịch bản tiếng Việt, đọc giọng, vẽ cảnh, kiểm tra storyboard, render và soạn gói đăng bài. Dùng khi người dùng gõ /tao-video, hoặc nói "làm video sách X", "tạo video về cuốn X dài N phút".
argument-hint: <Tên sách> + <Tác giả> + <số phút>
---

# /tao-video: một lệnh ra một video sách

Đầu vào: `$ARGUMENTS`, dạng `Tên sách + Tác giả + số phút`. Ví dụ: `/tao-video Nhà Giả Kim + Paulo Coelho + 3`.

Làm hết các bước dưới đây mà không dừng hỏi, trừ khi thiếu tên sách. Tuân thủ CLAUDE.md của dự án (nội dung,
phụ đề, khung dọc, CTA). Chạy mọi lệnh từ thư mục gốc của studio.

## 0. Đọc đầu vào

- Tách theo `+` (hoặc `|`, `,` nếu không có `+`). Phần thứ 3 là số phút, chấp nhận `3`, `3p`, `3 phút`, `30s`
  (= 0.5 phút). Thiếu tác giả thì tự tìm. Thiếu thời lượng thì mặc định **0.5 phút** (video ngắn).
- Slug: tên sách bỏ dấu, chữ thường, nối bằng `-` (đ → d). Video từ 1 phút trở lên thêm hậu tố `-<N>p`
  (`nha-gia-kim-3p`). Nếu `src/episodes/<slug>` đã có thì thêm `-2`, `-3`...
- Chọn khuôn:
  - **Ngắn** (dưới 1 phút): mẫu `src/episodes/dac-nhan-tam/`, 25-40 s, công thức 4 nhịp trong README.md.
  - **Dài** (từ 1 phút): mẫu `src/episodes/dac-nhan-tam-5p/` (kit.tsx, chapters, nhiều đoạn script).
- Định lượng (đo từ tập 5 phút: 1055 từ, 121 cảnh, 4:57 ở tốc độ 1.05): khoảng **210 từ/phút** lời đọc và
  **24 cảnh/phút** (mỗi cảnh 2-3 s). Tập ngắn: 60-100 âm tiết, 4-8 cảnh.

Báo người dùng một dòng: slug, khuôn, độ dài mục tiêu, rồi làm tiếp.

## 1. Tư liệu sách

Dùng WebSearch tìm: năm xuất bản, số bản bán, cấu trúc chương, 3-8 ý chính, câu chuyện có thật hoặc giai thoại
trong sách, câu trích ngắn. Mỗi con số hay sự kiện sẽ đọc lên phải có một mục trong `science`
(`claim`, `working`, `source`). Không tìm được nguồn thì không dùng con số đó. Không hứa kết quả chắc chắn.

## 2. Tạo khung tập

```bash
python tools/new_book.py <slug> "<Tên sách>" "<Tác giả>"
```

Khuôn dài: chép `src/episodes/dac-nhan-tam-5p/kit.tsx` vào tập mới, thay `index.tsx` bằng bản của tập 5p (lọc
mọi export `S<số>` thành cảnh), đổi tên biến và id cho khớp (`new_book.py` đã in tên composition). Đọc kỹ
kit.tsx để biết các khuôn cảnh: `close`, `room`, `street`, `rule`, `quote`, `fact`, `nameCard`, `title`,
`bookShot`, `calendar`, cùng `Pop`, `Mark`, `Sparkle`, các nhân vật (`HERO`, `SEP`, `MO`, `KHO`...).

Ảnh bìa: nếu `public/<slug>/cover.jpg` (hoặc .png, .webp) đã có thì ghi `"cover": "<slug>/cover.<đuôi>"` trong
`book`. Chưa có thì để engine vẽ bìa tạm, đặt `book.color` hợp với bìa thật, và nhắc người dùng ở cuối.

## 3. Kịch bản (episode.json)

- `topic`, `title`, `hook` (2 dòng IN HOA, mỗi dòng tối đa khoảng 18 ký tự), `accent` (một cụm trong hook).
- `tts: "google"`, `voice: {"google": "vi-VN-Chirp3-HD-Sadaltager", "speed": 1.1}`. Tốc độ chỉ trong 1.05-1.1,
  trừ khi người dùng yêu cầu khác. Video dài dùng 1.05.
- `script`: tập ngắn theo công thức trong README.md. Tập dài chia 12-20 đoạn `{"beat", "text"}`, mỗi đoạn dưới
  5000 byte UTF-8 (khoảng 900 từ, thực tế nên giữ 40-90 từ). Mạch truyện như tập 5p: hook "Điều gì xảy ra nếu..."
  thành một hình ảnh, rồi các phần / chương của sách xen chuyện thật, một cú chuyển (cái bẫy, cách hiểu sai),
  con số có nguồn, CTA.
- CTA cuối nhắc xem link hoặc giỏ hàng bên dưới. Không ghi giá, giảm giá, số đã bán của shop. Giữ
  `book.disclosure` mặc định.
- Tập dài thêm `captions: {"maxWords": 5}`, `gaps` như tập 5p, `chapters` (đổi hook theo từng phần, `from` là
  id cảnh), `cover: {"shot", "t", "text"}`, `tail: 2.0`.
- Viết bản đọc vào `series/<slug>/guion.md` (đoạn, lời, cảnh dự kiến) để người dùng dò lại.

## 4. Giọng đọc

```bash
python tools/voice_vi.py <slug>
```

Lỗi key Google: báo người dùng điền `GOOGLE_TTS_API_KEY` trong `.env` (xem SETUP.md). Không tự chuyển sang
giọng khác. Sửa chữ sau khi đã đọc mà phụ đề lệch: `python tools/voice_vi.py <slug> --realign`.

## 5. Shot list và timeline

Viết `shots` (id, size, note, `frame`) và `edit` (cắt theo từ: `"at": "Ngày"`, `"Ngày#2"`). Cảnh cuối
`"id": "CTA", "frame": "book"`. Thêm `fx` flash ở CTA. Rồi:

```bash
python .claude/skills/what-if-animation/scripts/plan.py <slug>
```

Đọc nhịp plan.py in ra: không cảnh nào dưới 1.2 s hay trên 4 s (tập dài) / 5 s (tập ngắn). Sửa `edit` rồi chạy lại.

## 6. Vẽ cảnh (shots.tsx)

- Tập dài: mỗi cảnh một dòng từ kit, như tập 5p. Chỉ vẽ tay vài hình đặc trưng của sách (2-4 cảnh).
- Hành động chính trong x 420-1500. Chữ trên thẻ và bong bóng thoại trong x 440-1480. Nhân vật cảnh phòng có
  u ≤ 0.7. Nhãn ngày / chữ đặt gần x = 960.
- Nhân vật là cast của studio (`LOOKS` và các biến thể trong kit). Không vẽ chân dung tác giả thật hay nhân
  vật có bản quyền. Nhân vật lịch sử chỉ dùng `nameCard` (tên + vai trò), không vẽ mặt.
- Chữ tiếng Việt có dấu, `FONT.vn`, viết hoa bằng `toLocaleUpperCase('vi')`.

```bash
npx tsc --noEmit
```

## 7. Storyboard: tự kiểm tra trước khi render

```bash
node .claude/skills/what-if-animation/scripts/stills.mjs <slug>
python .claude/skills/what-if-animation/scripts/board.py <slug>
```

Mở `out/<slug>/storyboard.jpg` bằng Read (tập dài: xem từng ảnh trong `out/<slug>/board/` theo lô). Kiểm tra: chữ
bị cắt mép, chữ đè nhau, nhân vật ra ngoài khung, cảnh trống, sai dấu tiếng Việt, cảnh không khớp lời. Sửa rồi
render lại riêng cảnh hỏng: `node .../stills.mjs <slug> S12 S40`. Lặp đến khi sạch.

## 8. Render

```bash
python .claude/skills/what-if-animation/scripts/master.py <slug>
npx remotion still src/index.ts <Id>Cover out/<slug>/cover.png
```

Video từ 1 phút trở lên: chạy master.py nền (`run_in_background`), khoảng 6 phút render cho mỗi phút video. Trong
lúc chờ thì làm bước 9. Xong, đọc `out/<slug>/report.json`: loudness khoảng -14 LUFS, true peak dưới -1 dBTP.

## 9. Gói đăng bài

Viết `series/<slug>/dang-bai.md` theo mẫu `series/dac-nhan-tam-5p/dang-bai.md`: 3 tiêu đề thử (tò mò / chuyện
thật / lợi ích) và đề xuất một cái, mô tả kèm mốc thời gian chương (tập dài, lấy từ timeline.json), hashtag, dòng
"Video có gắn link tiếp thị liên kết".

## 10. Báo cáo

Câu đầu: video đã xong chưa, dài bao nhiêu. Sau đó: đường dẫn `out/<slug>/<slug>-final.mp4`, `cover.png`,
`series/<slug>/dang-bai.md`; con số nào đã dùng và nguồn; việc người dùng còn phải làm (ảnh bìa thật nếu đang
dùng bìa tạm, rồi chạy lại bước 8). Không commit git trừ khi người dùng yêu cầu.
