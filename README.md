# Studio video affiliate bán sách (TikTok / Shopee Video / Reels)

Video dọc 9:16, 20-40 giây: hoạt hình nhân vật que kể một ý hay trong sách theo kiểu "Điều gì xảy ra nếu...",
phụ đề karaoke tiếng Việt, kết bằng thẻ sách có bìa thật và lời kêu gọi xem link. Video không vẽ giỏ hàng và
không ghi giá: TikTok và Facebook tự hiện link sản phẩm / giỏ hàng. Mọi khung hình vẽ bằng code
(Remotion + SVG). Tập mẫu: `src/episodes/dac-nhan-tam/`.

## Bố cục khung dọc (1080 x 1920)

| Vùng | Nội dung |
|---|---|
| 0-140 | Thanh trên của TikTok: để trống |
| 150-400 | Hook 2 dòng (`hook`, `accent` = từ tô vàng) |
| 410-1490 | Cửa sổ cảnh 1080 x 1080, nhìn vào thế giới 1920 x 1080 theo `frame` của từng cảnh |
| ~1430 | Phụ đề karaoke (từ đang đọc tô vàng) |
| 1515 | Chip sách nhỏ (bìa + tên sách) |
| 1600-1920 | Chữ mô tả và nút của TikTok: để trống |

Cảnh cuối có `"frame": "book"` là thẻ CTA toàn màn hình, engine tự vẽ từ `book` trong episode.json.

## Làm một tập mới

```bash
# 1. Tạo khung tập (tự đăng ký vào studio)
python tools/new_book.py nha-gia-kim "Nhà Giả Kim" "Paulo Coelho"

# 2. Sửa src/episodes/nha-gia-kim/episode.json: hook, script, science (nguồn cho mọi con số), book (tên, tác giả,
#    platform). Đặt ảnh bìa vào public/nha-gia-kim/cover.jpg và ghi "cover": "nha-gia-kim/cover.jpg".

# 3. Giọng đọc ("tts": "edge" hoặc "google" miễn phí trong hạn mức, "elevenlabs" tốn credit)
python tools/voice_vi.py nha-gia-kim

# 4. Viết shots + edit trong episode.json (cắt theo từ: "at": "Ngày", "Ngày#2"...), rồi dựng timeline
python .claude/skills/what-if-animation/scripts/plan.py nha-gia-kim

# 5. Vẽ cảnh trong shots.tsx, kiểm tra storyboard
npx tsc --noEmit
node .claude/skills/what-if-animation/scripts/stills.mjs nha-gia-kim
python .claude/skills/what-if-animation/scripts/board.py nha-gia-kim     # -> out/nha-gia-kim/storyboard.jpg

# 6. Render + chuẩn âm lượng -14 LUFS, và ảnh bìa video
python .claude/skills/what-if-animation/scripts/master.py nha-gia-kim   # -> out/nha-gia-kim/nha-gia-kim-final.mp4
npx remotion still src/index.ts NhaGiaKimCover out/nha-gia-kim/cover.png
```

Xem trực tiếp: `npm run studio` (http://localhost:3430).

## Công thức kịch bản (25-40 giây, 60-100 âm tiết)

1. **Hook 0-3 s**: "Điều gì xảy ra nếu..." lấy từ ý chính của sách. Câu hỏi phải là một hình ảnh.
2. **3 ví dụ tăng dần**: nhỏ, lan rộng, bất ngờ (Ngày 1 / Ngày 7 / Ngày 30...).
3. **Cú chuyển**: "Đây là ... trong [tên sách]" + một con số thật, có nguồn trong `science`.
4. **CTA**: lời đọc nhắc xem link/giỏ hàng mà nền tảng hiện sẵn ("Bấm giỏ hàng bên dưới nhé").

## Trường `book` trong episode.json

| Trường | Ý nghĩa |
|---|---|
| `title`, `author` | Tên sách, tác giả |
| `cover` | Ảnh bìa trong `public/` (dọc, khoảng 2:3). Bỏ trống thì vẽ bìa tạm |
| `badge` | Nhãn đỏ trên bìa: "Bán chạy", "Sách kinh điển" |
| `platform` | `tiktok` / `facebook` / `shopee` / `lazada` / `other`: đổi chữ nút CTA |
| `cta`, `sub` | Ghi đè chữ nút và dòng dưới nút |
| `disclosure` | Dòng thông báo tiếp thị liên kết (mặc định có). `false` để ẩn |

## Giọng đọc

- Edge TTS: `vi-VN-HoaiMyNeural` (nữ) hoặc `vi-VN-NamMinhNeural` (nam), chỉnh `rate`. Nếu báo lỗi 403:
  `pip install -U edge-tts`.
- Google Cloud TTS: `"tts": "google"`, `voice.google` = tên giọng (`python tools/voice_vi.py --list-google` để xem,
  `--sample-google <giọng>` để nghe thử), `voice.speed` = tốc độ. Key đặt trong `.env`: `GOOGLE_TTS_API_KEY=...`.
  Giọng Chirp3-HD (tự nhiên nhất) không trả mốc thời gian: studio tự căn phụ đề bằng Whisper chạy trên máy
  (`pip install faster-whisper`, lần đầu tải model khoảng 500 MB vào library/whisper/).
- ElevenLabs: `"tts": "elevenlabs"`, `voice.model` phải là `eleven_turbo_v2_5`, `eleven_flash_v2_5` hoặc `eleven_v3`
  (model mặc định `eleven_multilingual_v2` không có tiếng Việt). Key đặt trong `.env`: `ELEVENLABS_API_KEY=...`.

## Lưu ý khi đăng

- Giữ dòng thông báo "Video có gắn link tiếp thị liên kết" và nhãn quảng cáo của nền tảng.
- Ảnh bìa: dùng ảnh trong trang sản phẩm affiliate (nhà bán thường cho phép dùng để quảng bá).
- Không hứa kết quả chắc chắn ("đọc xong sẽ giàu"). Kịch bản "Điều gì xảy ra nếu" là giả định, con số phải có nguồn.

Các tập cũ (series tiếng Tây Ban Nha) nằm trong `_archive/`, không còn được build.
