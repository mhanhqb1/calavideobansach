# Studio video affiliate bán sách (thị trường Việt Nam)

Dự án này làm video dọc 9:16 bán sách qua TikTok Shop / Shopee Video / Reels, bằng engine hoạt hình của skill
`what-if-animation` (Remotion + SVG). Quy trình đầy đủ: README.md. Tập mẫu: `src/episodes/dac-nhan-tam/`.

## Khác với skill what-if-animation gốc

- Tập mới dùng `defineVerticalEpisode` (src/engine/vertical.tsx), không dùng `defineEpisode`. Tạo bằng
  `python tools/new_book.py <slug> "<Tên sách>" "<Tác giả>"`.
- Mọi chữ trên màn hình và lời đọc bằng **tiếng Việt có dấu**. Chữ hiển thị dùng `FONT.vn` (Be Vietnam Pro);
  `FONT.ui`/`FONT.hand`/`FONT.title` cũng có bộ ký tự tiếng Việt. Viết hoa bằng `toLocaleUpperCase('vi')`.
- Có phụ đề karaoke burned-in (khác quy tắc "không caption" của thể loại What If): người xem TikTok hay tắt tiếng.
- Giọng: `python tools/voice_vi.py <slug>` (KHÔNG gọi thẳng voice.py của skill). `"tts": "edge"` mặc định, miễn phí; `"google"` (key GOOGLE_TTS_API_KEY; giọng Chirp3-HD được căn phụ đề bằng Whisper qua tools/align_vi.py); `"elevenlabs"`.
- Cảnh vẫn vẽ trong thế giới 1920 x 1080; mỗi cảnh trong episode.json có `"frame": {"x", "y", "zoom", "zoomTo", "pan"}`
  để chọn vùng 1080 x 1080 hiện trong khung dọc. Đặt hành động chính trong khoảng x 420-1500 (khi zoom 1).
- Cảnh cuối `"frame": "book"`: thẻ CTA do engine vẽ từ `episode.book`. Không vẽ tay.
- Đặt nhãn ngày/chữ trong cảnh ở gần x = 960, không ở góc (góc bị cắt khi khung dọc).
- Từ tiếng Việt lặp nhiều: cắt cảnh bằng `"at": "Ngày#2"` (lần xuất hiện thứ 2 sau điểm cắt trước).

## Quy tắc nội dung

- Không vẽ giỏ hàng, không ghi giá/giảm giá/số đã bán trong video: TikTok và Facebook tự hiện link sản phẩm.
- Mọi con số trong lời đọc có nguồn trong `science`. Không hứa kết quả chắc chắn từ việc đọc sách.
- Giữ dòng thông báo tiếp thị liên kết (`book.disclosure`) trừ khi người dùng yêu cầu bỏ.
- Nhân vật là cast riêng của studio (`LOOKS`), không vẽ chân dung tác giả thật hay nhân vật có bản quyền.

## Kiểm tra trước khi giao

`npx tsc --noEmit`, storyboard (`stills.mjs` + `board.py`) xem từng khung, rồi `master.py`. Giao file
`out/<slug>/<slug>-final.mp4` và `out/<slug>/cover.png` (composition `<Id>Cover`).

## Video dài (vài phút)

- Một tập duy nhất (không chia nhiều tập như what-if-series): mẫu ở `src/episodes/dac-nhan-tam-5p/`. `kit.tsx` có các khuôn
  cảnh (close, room, street, rule, quote, fact, nameCard, calendar, bookShot) để mỗi cảnh chỉ là một dòng cấu hình.
- `chapters` trong episode.json đổi hook theo chương. Giọng Chirp đọc từng đoạn `script` (giới hạn 5000 byte/lần gọi),
  Whisper căn từng đoạn; `voice_vi.py <slug> --realign` căn lại mà không gọi Google.
- Kiểm tra storyboard: chữ trên thẻ và bong bóng thoại phải nằm trong x 440-1480; nhân vật ở cảnh phòng đặt u ≤ 0.7.
- Render 5 phút mất khoảng 30 phút: chạy nền.
