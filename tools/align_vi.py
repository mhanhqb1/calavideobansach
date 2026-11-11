"""Word timings for a voice take that has none (Google Chirp, FPT.AI, a recording...): Whisper listens to the audio
on this machine (free, CPU), then its words are matched against the script, so the captions keep the script's exact
spelling and punctuation. Script words Whisper missed or heard differently (numbers read out in full, say) get times
interpolated between their matched neighbours.

    from align_vi import align
    words = align('public/<slug>/voice_raw.mp3', script_text)    # [{'w', 's', 'e', 'p'}, ...]

    python tools/align_vi.py <audio> "<script text>"             (test)

The model (default "small", about 500 MB) downloads once to library/whisper/ in the studio. WHISPER_MODEL=medium
for better accuracy (slower, about 1.5 GB).
"""
import difflib, os, pathlib, re, sys, unicodedata

STUDIO = pathlib.Path.cwd()


def _norm(w):
    return re.sub(r'[^\w]', '', unicodedata.normalize('NFC', w).lower())


def script_tokens(text):
    """The script as words with the punctuation after each one (same rules as voice_vi.py)."""
    out = []
    for tok in unicodedata.normalize('NFC', text).split():
        w = re.sub(r"^[^\w]+|[^\w']+$", '', tok)
        if w:
            out.append({'w': w, 'p': tok[len(tok.rstrip('.,!?;:…"”)')):]})
    return out


def load_model(model_name=None):
    from faster_whisper import WhisperModel

    model_name = model_name or os.environ.get('WHISPER_MODEL', 'small')
    root = STUDIO / 'library' / 'whisper'
    root.mkdir(parents=True, exist_ok=True)
    return WhisperModel(model_name, device='cpu', compute_type='int8', download_root=str(root))


def align(audio, text, model=None, quiet=False):
    model = model or load_model()
    # no initial_prompt: given the script itself, Whisper tends to skip the opening sentence as if already said
    segs, _ = model.transcribe(str(audio), language='vi', word_timestamps=True, vad_filter=False, beam_size=5, condition_on_previous_text=False)
    heard = []  # one entry per syllable Whisper heard
    for seg in segs:
        for w in seg.words or []:
            parts = [p for p in w.word.split() if _norm(p)]
            if not parts:
                continue
            total = sum(len(p) for p in parts)
            t = w.start
            for p in parts:
                d = (w.end - w.start) * len(p) / total
                heard.append({'n': _norm(p), 's': t, 'e': t + d})
                t += d
    words = script_tokens(text)
    if not heard:
        raise SystemExit('Whisper không nghe được từ nào trong file giọng.')

    a = [_norm(w['w']) for w in words]
    b = [h['n'] for h in heard]
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            words[blk.a + k]['s'] = heard[blk.b + k]['s']
            words[blk.a + k]['e'] = heard[blk.b + k]['e']

    # a short match far from where the script says it should be is a false match: drop it
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        if 0 < blk.size <= 2:
            for k in range(blk.size):
                words[blk.a + k].pop('s', None)
                words[blk.a + k].pop('e', None)

    # fill the gaps: spread unmatched words over the time between their matched neighbours, by length
    end_all = heard[-1]['e']
    i = 0
    while i < len(words):
        if 's' in words[i]:
            i += 1
            continue
        j = i
        while j < len(words) and 's' not in words[j]:
            j += 1
        t0 = words[i - 1]['e'] if i > 0 else heard[0]['s']
        t1 = words[j]['s'] if j < len(words) else end_all
        t1 = max(t1, t0 + 0.12 * (j - i))
        total = sum(len(w['w']) for w in words[i:j])
        t = t0
        for w in words[i:j]:
            d = (t1 - t0) * len(w['w']) / total
            w['s'], w['e'] = t, t + d
            t += d
        i = j
    matched = sum(blk.size for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks())
    if not quiet:
        print(f'Whisper: khớp {matched}/{len(words)} từ với kịch bản, phần còn lại nội suy')
    align.last_matched = (matched, len(words))
    return [{'w': w['w'], 's': round(w['s'], 3), 'e': round(w['e'], 3), 'p': w['p']} for w in words]


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    for w in align(sys.argv[1], sys.argv[2]):
        print(f"{w['w']}{w['p']}@{w['s']}-{w['e']}", end=' ')
    print()
