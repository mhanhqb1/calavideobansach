"""Giọng đọc tiếng Việt cho một tập: Edge TTS (miễn phí), Google Cloud TTS hoặc ElevenLabs, chọn theo tập.

    python tools/voice_vi.py <slug> [--force]          (chạy từ thư mục studio)
    python tools/voice_vi.py <slug> --realign          giọng Chirp: căn lại phụ đề từ file đã lưu, không gọi Google
    python tools/voice_vi.py --list-google             liệt kê giọng tiếng Việt của Google Cloud
    python tools/voice_vi.py --sample-google <giọng>   nghe thử một giọng Google -> out/google-<giọng>.mp3

episode.json:
  "tts": "edge" | "google" | "elevenlabs"   (mặc định "edge")
  "voice": {
    "google": "vi-VN-Neural2-A", "speed": 1.1, "gpitch": 0,   giọng, tốc độ (0.25-4), cao độ (-20..20) của Google.
                                       Cần GOOGLE_TTS_API_KEY trong .env. Giọng Chirp3-HD không trả mốc thời gian:
                                       phụ đề được căn bằng Whisper trên máy (tools/align_vi.py, cần faster-whisper).
    "edge": "vi-VN-HoaiMyNeural",      giọng Edge: vi-VN-HoaiMyNeural (nữ) hoặc vi-VN-NamMinhNeural (nam)
    "rate": "+10%", "pitch": "+0Hz",   tốc độ, cao độ của Edge
    "id": "...", "model": "eleven_turbo_v2_5"   giọng và model ElevenLabs (model phải hỗ trợ tiếng Việt:
                                       eleven_turbo_v2_5, eleven_flash_v2_5 hoặc eleven_v3; KHÔNG dùng eleven_multilingual_v2)
  }

Edge: tạo public/<slug>/voice_raw.mp3 và out/<slug>/words_raw.json (mốc thời gian từng từ), ghi chữ ký giống hệt
voice.py, rồi gọi voice.py của skill để cắt các khoảng lặng (không gọi API ElevenLabs, không tốn credit).
ElevenLabs: gọi thẳng voice.py của skill (tốn credit, in ra số credit đã dùng).
Kết quả như nhau: public/<slug>/voice.wav và src/episodes/<slug>/words.json cho plan.py.
"""
import asyncio, base64, hashlib, json, os, pathlib, re, subprocess, sys, unicodedata, urllib.error, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')
STUDIO = pathlib.Path.cwd()
SKILL = STUDIO / '.claude' / 'skills' / 'what-if-animation' / 'scripts'
if not (STUDIO / 'src' / 'episodes').exists():
    raise SystemExit('Chạy lệnh này từ thư mục studio (có src/episodes và package.json).')



def env_key(name):
    """A key by name only: from the environment or the nearest .env above the studio. Never printed."""
    if os.environ.get(name):
        return os.environ[name]
    for d in [STUDIO, *STUDIO.parents]:
        p = d / '.env'
        if p.exists():
            raw = p.read_bytes()
            utf16 = raw[:2] in (bytes([0xFF, 0xFE]), bytes([0xFE, 0xFF]))  # Windows PowerShell's `>` writes UTF-16
            txt = raw.decode('utf-16', errors='ignore') if utf16 else raw.decode('utf-8-sig', errors='ignore')
            for line in txt.splitlines():
                if line.strip().startswith(name + '='):
                    return line.split('=', 1)[1].strip().strip('"').strip("'")
    raise SystemExit(f'Thiếu {name}: thêm dòng {name}=... vào file .env của studio.')


def google_api(path, body=None):
    url = f'https://texttospeech.googleapis.com{path}{"&" if "?" in path else "?"}key={env_key("GOOGLE_TTS_API_KEY")}'
    req = urllib.request.Request(url, headers={'Content-Type': 'application/json'})
    if body is not None:
        req.data = json.dumps(body).encode()
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        msg = e.read().decode('utf-8', errors='ignore')
        try:
            msg = json.loads(msg)['error']['message']
        except Exception:
            pass
        raise SystemExit(f'Google TTS lỗi {e.code}: {msg}')


if len(sys.argv) > 1 and sys.argv[1] == '--list-google':
    vs = json.loads(google_api('/v1/voices?languageCode=vi-VN'))['voices']
    for v in sorted(vs, key=lambda v: v['name']):
        print(f"{v['name']:32} {v['ssmlGender']:7} {'(phụ đề căn bằng Whisper)' if 'Chirp' in v['name'] else ''}")
    raise SystemExit(0)
if len(sys.argv) > 2 and sys.argv[1] == '--sample-google':
    name = sys.argv[2]
    res = json.loads(google_api('/v1/text:synthesize', {'input': {'text': 'Xin chào, đây là giọng đọc thử cho video giới thiệu sách. Bấm giỏ hàng vàng bên dưới nhé!'},
                                                        'voice': {'languageCode': 'vi-VN', 'name': name}, 'audioConfig': {'audioEncoding': 'MP3', 'speakingRate': 1.1}}))
    (STUDIO / 'out').mkdir(exist_ok=True)
    f = STUDIO / 'out' / f'google-{name}.mp3'
    f.write_bytes(base64.b64decode(res['audioContent']))
    print(f)
    raise SystemExit(0)

slug = sys.argv[1]
force = '--force' in sys.argv
ep_path = STUDIO / 'src' / 'episodes' / slug / 'episode.json'
ep = json.loads(ep_path.read_text(encoding='utf-8'))
tts = ep.get('tts', 'edge')
public = STUDIO / 'public' / slug
out = STUDIO / 'out' / slug
public.mkdir(parents=True, exist_ok=True)
out.mkdir(parents=True, exist_ok=True)
meta_p = out / 'voice_meta.json'
meta = json.loads(meta_p.read_text(encoding='utf-8')) if meta_p.exists() else {}

# The same text and signature voice.py computes, so it treats an Edge take as its cache.
text = ' '.join(b['text'].strip() for b in ep['script'])
V = {'id': 'TX3LPaxmHKxFdv7VOQHJ', 'model': 'eleven_multilingual_v2', 'settings': {'stability': 0.4, 'similarity_boost': 0.8, 'style': 0.35, 'use_speaker_boost': True}}
V.update(ep.get('voice', {}))
sig = hashlib.sha1(json.dumps([text, V], sort_keys=True).encode()).hexdigest()[:12]


def run_voice_py(extra=()):
    subprocess.run([sys.executable, str(SKILL / 'voice.py'), slug, *extra], cwd=STUDIO, check=True)


if tts == 'elevenlabs':
    if V['model'] == 'eleven_multilingual_v2':
        raise SystemExit('ElevenLabs: eleven_multilingual_v2 không hỗ trợ tiếng Việt. Đặt "voice": {"model": "eleven_turbo_v2_5"} (hoặc eleven_flash_v2_5, eleven_v3) trong episode.json.')
    # An Edge take with the same text would look like voice.py's cache: force a fresh ElevenLabs call then.
    run_voice_py(['--force'] if force or meta.get('tts') == 'edge' else [])
    meta = json.loads(meta_p.read_text(encoding='utf-8'))
    meta['tts'] = 'elevenlabs'
    meta_p.write_text(json.dumps(meta), encoding='utf-8')
    raise SystemExit(0)

if tts == 'google':
    raw_mp3 = public / 'voice_raw.mp3'
    raw_words = out / 'words_raw.json'
    gname = V.get('google', 'vi-VN-Neural2-A')
    speed = float(V.get('speed', 1.1))
    gpitch = float(V.get('gpitch', 0))
    if force or '--realign' in sys.argv or meta.get('tts') != 'google' or meta.get('sig') != sig or not raw_mp3.exists() or not raw_words.exists():
        src = unicodedata.normalize('NFC', text)
        toks = src.split()
        if 'Chirp' in gname:
            # Chirp HD voices return no timepoints: plain text in, one request per script beat (a request takes at
            # most 5000 bytes), the beats joined with a short pause; then Whisper on this machine finds each word.
            sys.path.insert(0, str(STUDIO / 'tools'))
            from align_vi import align, load_model
            import numpy as np
            SR = 44100
            gap = float(V.get('beat_gap', 0.35))
            model = load_model()
            pcm, words, t0, matched, total = [], [], 0.0, 0, 0
            beats = [unicodedata.normalize('NFC', b['text'].strip()) for b in ep['script'] if b['text'].strip()]
            for k, beat in enumerate(beats):
                body = {'input': {'text': beat}, 'voice': {'languageCode': 'vi-VN', 'name': gname},
                        'audioConfig': {'audioEncoding': 'MP3', 'speakingRate': speed, 'sampleRateHertz': SR}}
                part = out / f'beat_{k:02d}.mp3'
                if not ('--realign' in sys.argv and part.exists()):  # --realign: re-run Whisper on the saved beats, no API call
                    res = json.loads(google_api('/v1/text:synthesize', body))
                    part.write_bytes(base64.b64decode(res['audioContent']))
                x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', str(part), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout, dtype=np.float32)
                for w in align(part, beat, model=model, quiet=True):
                    words.append({**w, 's': round(w['s'] + t0, 3), 'e': round(w['e'] + t0, 3)})
                m, n = align.last_matched
                matched, total = matched + m, total + n
                pcm += [x, np.zeros(int(gap * SR), dtype=np.float32)]
                t0 += len(x) / SR + gap
                print(f'  đoạn {k + 1}/{len(beats)}: {len(x) / SR:.1f} s, khớp {m}/{n} từ')
            y = np.concatenate(pcm)
            subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-b:a', '192k', str(raw_mp3)], input=y.tobytes(), check=True)
            raw_words.write_text(json.dumps(words, indent=1, ensure_ascii=False) + chr(10), encoding='utf-8')
            meta_p.write_text(json.dumps({'sig': sig, 'chars': len(text), 'tts': 'google', 'voice': gname, 'speed': speed}), encoding='utf-8')
            print(f'Google TTS {gname} (x{speed}): {len(text)} ký tự, {len(beats)} đoạn, {t0:.1f} s. Whisper khớp {matched}/{total} từ.')
            run_voice_py()
            raise SystemExit(0)
        esc = lambda s: s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        # a mark before every word, and one at the end: Google returns when each mark is reached
        ssml = '<speak>' + ' '.join(f'<mark name="w{i}"/>{esc(t)}' for i, t in enumerate(toks)) + '<mark name="end"/></speak>'
        body = {'input': {'ssml': ssml}, 'voice': {'languageCode': 'vi-VN', 'name': gname},
                'audioConfig': {'audioEncoding': 'MP3', 'speakingRate': speed, 'pitch': gpitch, 'sampleRateHertz': 44100},
                'enableTimePointing': ['SSML_MARK']}
        res = json.loads(google_api('/v1beta1/text:synthesize', body))
        raw_mp3.write_bytes(base64.b64decode(res['audioContent']))
        tp = {t['markName']: t['timeSeconds'] for t in res.get('timepoints', [])}
        if not tp:
            raise SystemExit(f'Giọng {gname} không trả về mốc thời gian (giọng Chirp không hỗ trợ SSML mark). Chọn giọng Standard, Wavenet hoặc Neural2.')
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(raw_mp3)], capture_output=True, text=True).stdout)
        words = []
        for i, tok in enumerate(toks):
            w = re.sub(r"^[^\w]+|[^\w']+$", '', tok)
            if not w or f'w{i}' not in tp:
                continue
            s = tp[f'w{i}']
            nxt = next((tp[f'w{j}'] for j in range(i + 1, len(toks)) if f'w{j}' in tp), tp.get('end', dur))
            # marks give word starts only: estimate the end from the syllable's length, never past the next word
            e = min(nxt, s + 0.06 * len(w) + 0.14)
            words.append({'w': w, 's': round(s, 3), 'e': round(e, 3), 'p': tok[len(tok.rstrip('.,!?;:…"”)')):]})
        raw_words.write_text(json.dumps(words, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
        meta_p.write_text(json.dumps({'sig': sig, 'chars': len(text), 'tts': 'google', 'voice': gname, 'speed': speed}), encoding='utf-8')
        print(f'Google TTS {gname} (x{speed}): {len(words)} từ, khoảng {len(ssml)} ký tự gửi đi (tính vào hạn mức miễn phí)')
    else:
        print('Giọng Google không đổi từ lần trước: dùng lại.')
    run_voice_py()
    raise SystemExit(0)

if tts != 'edge':
    raise SystemExit(f'"tts" phải là "edge", "google" hoặc "elevenlabs", không phải "{tts}"')

# ---------------------------------------------------------------- Edge TTS
import edge_tts  # noqa: E402  (pip install -U edge-tts)

voice = V.get('edge', 'vi-VN-HoaiMyNeural')
rate = V.get('rate', '+10%')
pitch = V.get('pitch', '+0Hz')
raw_mp3 = public / 'voice_raw.mp3'
raw_words = out / 'words_raw.json'

if force or meta.get('tts') != 'edge' or meta.get('sig') != sig or not raw_mp3.exists() or not raw_words.exists():
    src = unicodedata.normalize('NFC', text)

    async def synth():
        bounds = []
        com = edge_tts.Communicate(src, voice, rate=rate, pitch=pitch, boundary='WordBoundary')
        with open(raw_mp3, 'wb') as fh:
            async for ch in com.stream():
                if ch['type'] == 'audio':
                    fh.write(ch['data'])
                elif ch['type'] == 'WordBoundary':
                    bounds.append((ch['offset'] / 1e7, (ch['offset'] + ch['duration']) / 1e7, unicodedata.normalize('NFC', ch['text'])))
        return bounds

    try:
        bounds = asyncio.run(synth())
    except Exception as e:  # most often an old edge-tts after Microsoft changes its token
        raise SystemExit(f'Edge TTS lỗi: {e}\nThử: pip install -U edge-tts')
    if not bounds:
        raise SystemExit('Edge TTS không trả về mốc thời gian từ nào.')

    # Map each boundary back onto the script, to pick up the punctuation after it (voice.py's pauses depend on it).
    words, pos = [], 0
    low = src.lower()
    for s, e, btxt in bounds:
        i = src.find(btxt, pos)
        if i < 0:
            i = low.find(btxt.lower(), pos)
        if i >= 0:
            after = src[i + len(btxt):]
            pos = i + len(btxt)
        else:
            after = ''
        tail = re.match(r'[^\w\s]*', after).group(0)
        toks = btxt.split()
        total = sum(len(t) for t in toks) or 1
        t0 = s
        for k, tok in enumerate(toks):
            share = (e - s) * len(tok) / total
            w = re.sub(r"^[^\w]+|[^\w']+$", '', tok)
            p = tok[len(tok.rstrip('.,!?;:…"”)')):] if k < len(toks) - 1 else tail
            if w:
                words.append({'w': w, 's': round(t0, 3), 'e': round(t0 + share, 3), 'p': p})
            t0 += share
    raw_words.write_text(json.dumps(words, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
    meta_p.write_text(json.dumps({'sig': sig, 'chars': len(text), 'tts': 'edge', 'voice': voice, 'rate': rate}), encoding='utf-8')
    print(f'Edge TTS {voice} ({rate}): {len(words)} từ, miễn phí')
else:
    print('Giọng Edge không đổi từ lần trước: dùng lại.')

run_voice_py()
