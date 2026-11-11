# Cài trên máy mới

1. Cài: Node 18+, Python 3.9+, ffmpeg (có ffprobe) trong PATH, Git.
2. Clone repo này (skill Claude nằm sẵn trong `.claude/skills/`, Claude Code tự nhận khi mở thư mục).
3. `npm install`
4. `pip install -r requirements.txt`
5. Copy `.env.example` thành `.env`, điền `GOOGLE_TTS_API_KEY` (và `ELEVENLABS_API_KEY` nếu dùng).
6. Kiểm tra: `npx tsc --noEmit`, rồi `npm run studio`.

Model Whisper (~500 MB) tự tải vào `library/whisper/` lần đầu căn phụ đề.

## Trí nhớ của Claude (tuỳ chọn)

`.claude/memory/` là bản sao memory của Claude Code (giọng đọc ưa thích...). Trên máy mới, mở dự án bằng
Claude Code một lần, rồi copy các file này vào `~/.claude/projects/<tên-thư-mục-dự-án>/memory/`.
