"""Tạo khung một tập video affiliate sách mới (khung dọc 9:16) và đăng ký nó vào studio.

    python tools/new_book.py <slug> "<Tên sách>" "<Tác giả>"      (chạy từ thư mục studio)
    ví dụ: python tools/new_book.py nha-gia-kim "Nhà Giả Kim" "Paulo Coelho"

Tạo src/episodes/<slug>/ với episode.json (mẫu kịch bản theo công thức), shots.tsx (2 cảnh mẫu), index.tsx,
words.json và timeline.json tạm, rồi thêm tập vào src/episodes/index.ts. Bước tiếp theo xem README.md.
"""
import json, pathlib, re, sys

sys.stdout.reconfigure(encoding='utf-8')
STUDIO = pathlib.Path.cwd()
if len(sys.argv) < 3:
    raise SystemExit(__doc__)
slug, title = sys.argv[1], sys.argv[2]
author = sys.argv[3] if len(sys.argv) > 3 else ''
if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', slug):
    raise SystemExit('slug chỉ gồm chữ thường không dấu, số và gạch ngang: nha-gia-kim')
d = STUDIO / 'src' / 'episodes' / slug
if d.exists():
    raise SystemExit(f'{d} đã tồn tại')
pascal = ''.join(p.capitalize() for p in slug.split('-'))
camel = pascal[0].lower() + pascal[1:]
if pascal[0].isdigit():
    pascal, camel = 'Ep' + pascal, 'ep' + pascal

ep = {
    'id': pascal, 'slug': slug, 'format': 'vertical',
    'topic': 'Điều gì xảy ra nếu ...?',
    'title': ['DÒNG HOOK 1', 'DÒNG HOOK 2?'],
    'hook': ['DÒNG HOOK 1', 'DÒNG HOOK 2?'],
    'accent': 'TỪ NHẤN',
    'book': {
        'title': title, 'author': author,
        '_cover': f'Đặt ảnh bìa ở public/{slug}/cover.jpg rồi đổi khóa "_cover" thành "cover": "{slug}/cover.jpg"',
        'badge': 'Bán chạy', 'platform': 'tiktok',
    },
    'tts': 'google',
    'voice': {'google': 'vi-VN-Chirp3-HD-Sadaltager', 'speed': 1.1, 'edge': 'vi-VN-HoaiMyNeural', 'rate': '+12%', 'id': 'TX3LPaxmHKxFdv7VOQHJ', 'model': 'eleven_turbo_v2_5'},
    'script': [
        {'beat': '1 hook (0-3 s): Điều gì xảy ra nếu...', 'text': 'Điều gì xảy ra nếu ...?'},
        {'beat': '2 demo 1 (nhỏ, đời thường)', 'text': '...'},
        {'beat': '3 demo 2 (lan rộng)', 'text': '...'},
        {'beat': '4 demo 3 (bất ngờ)', 'text': '...'},
        {'beat': '5 cú chuyển: đây là ý trong sách + 1 con số thật có nguồn', 'text': f'Đây là ... trong {title}.'},
        {'beat': '6 CTA', 'text': 'Bấm giỏ hàng vàng bên dưới nhé.'},
    ],
    'science': [{'claim': '', 'working': '', 'source': ''}],
    'cast': ['pipWork'],
    'shots': [
        {'id': 'S1', 'size': 'close-up', 'set': 'office (blurred)', 'key': 20, 'note': 'hook', 'frame': {'x': 960, 'y': 560, 'zoom': 1.0, 'zoomTo': 1.08}},
        {'id': 'S2', 'size': 'schematic', 'set': 'schematic', 'key': 30, 'note': 'cuốn sách hiện lên', 'frame': {'x': 960, 'y': 540}},
        {'id': 'CTA', 'size': 'end card', 'set': 'book card', 'key': 40, 'note': 'bìa sách, lời kêu gọi xem link', 'frame': 'book'},
    ],
    'edit': [{'shot': 'S1', 'at': 'f:0'}, {'shot': 'S2', 'at': 's:3'}, {'shot': 'CTA', 'at': 's:6'}],
    'fx': [{'at': 'CTA', 'kind': 'flash', 'color': '#FFD43B', 'o': 0.5}],
    'tail': 1.6,
    'end': 's:10',
}
d.mkdir(parents=True)
(d / 'episode.json').write_text(json.dumps(ep, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
(d / 'words.json').write_text('[]\n', encoding='utf-8')
tl = {'slug': slug, 'title': ' '.join(ep['title']), 'fps': 30, 'total': 300,
      'segments': [{'shot': 'S1', 'a': 0, 'b': 90, 't0': 0, 't1': 90}, {'shot': 'S2', 'a': 90, 'b': 180, 't0': 0, 't1': 90}, {'shot': 'CTA', 'a': 180, 'b': 300, 't0': 0, 't1': 120}],
      'shots': [{'id': 'S1', 'size': 'close-up', 'key': 20, 'len': 90, 'first': 0}, {'id': 'S2', 'size': 'schematic', 'key': 30, 'len': 90, 'first': 90}, {'id': 'CTA', 'size': 'end card', 'key': 40, 'len': 120, 'first': 180}],
      'fx': [], 'audio': {}}
(d / 'timeline.json').write_text(json.dumps(tl, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
(d / 'shots.tsx').write_text("""import React from 'react';
import { Close, Office, Schematic, SchLabel, SvgBook, BookInfo, Glow, LOOKS, kf, clamp, easeOut, ShotProps } from '../../engine';
import ep from './episode.json';

// Mỗi cảnh là hàm thuần của đồng hồ riêng t, vẽ trong thế giới 1920 x 1080. Khung dọc nhìn qua cửa sổ vuông
// 1080 px quanh "frame" của cảnh trong episode.json. Xem tập mẫu dac-nhan-tam/shots.tsx để có thêm ví dụ.

const HERO = LOOKS.pipWork;
const BOOK = ep.book as unknown as BookInfo;

// ---------- S1: close-up, hook ----------
export const S1: React.FC<ShotProps> = ({ t }) => (
  <Close t={t} look={HERO} faces={[[0, 'neutral'], [14, 'smug']]} yaw={0.15} sc={3.4} tilt={kf(t, [[0, 0], [16, 6]])}
    bg={<g transform="translate(-640 -400) scale(1.75)"><Office t={t} id="s1" /></g>} />
);

// ---------- S2: schematic, the book rises ----------
export const S2: React.FC<ShotProps> = ({ t }) => {
  const rise = easeOut(clamp(t / 12));
  return (
    <g>
      <Schematic t={t} id="s2" />
      <Glow x={960} y={430} r={460} o={0.35 * rise} />
      <g transform={`translate(0 ${(1 - rise) * 160})`} opacity={rise}>
        <SvgBook b={BOOK} x={960} y={420} w={320} />
      </g>
      <SchLabel x={960} y={800} t={t - 14} text={BOOK.title.toLocaleUpperCase('vi')} size={64} />
    </g>
  );
};
""", encoding='utf-8')
(d / 'index.tsx').write_text(f"""import {{ defineVerticalEpisode, Timeline, Word, VerticalJson }} from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import episode from './episode.json';
import {{ S1, S2 }} from './shots';

// Cảnh có "frame": "book" trong episode.json (CTA) do engine tự vẽ từ episode.book.
export const {camel} = defineVerticalEpisode('{pascal}', {{
  timeline: timeline as Timeline,
  words: words as Word[],
  episode: episode as unknown as VerticalJson,
  shots: {{ S1, S2 }},
}});
""", encoding='utf-8')

reg = STUDIO / 'src' / 'episodes' / 'index.ts'
s = reg.read_text(encoding='utf-8')
s = s.replace('\nexport const EPISODES = [', f"import {{ {camel} }} from './{slug}';\n\nexport const EPISODES = [", 1).replace("\n\nimport {", "\nimport {", 1)
s = re.sub(r'export const EPISODES = \[(.*)\];', lambda m: f'export const EPISODES = [{m.group(1)}, {camel}];', s)
reg.write_text(s, encoding='utf-8')
(STUDIO / 'public' / slug).mkdir(parents=True, exist_ok=True)
print(f'Đã tạo src/episodes/{slug}/ (composition {pascal}, {pascal}Board, {pascal}Cover) và đăng ký vào src/episodes/index.ts')
print(f'Tiếp theo: sửa kịch bản trong episode.json, đặt bìa vào public/{slug}/cover.jpg, rồi: python tools/voice_vi.py {slug}')
