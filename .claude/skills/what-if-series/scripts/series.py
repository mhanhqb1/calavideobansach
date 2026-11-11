#!/usr/bin/env python3
"""Run a What If series: many what-if-animation episodes, one film. Run from the studio folder.

python series.py <command> <slug> [--parts 2,3] [--force]     (SKILL.md lists the commands)
Files live in series/<slug>/ (series.json, guion.md, clips.json, plans/NN.json, chapters.json, youtube.md).
Each part is the episode <slug>-NN. Keys are read by name only and never printed.
"""
import argparse, json, os, pathlib, re, shutil, subprocess, sys, urllib.error, urllib.parse

WI = pathlib.Path(__file__).resolve().parents[2] / 'what-if-animation' / 'scripts'
sys.path.insert(0, str(WI))
STUDIO = pathlib.Path.cwd()
import wi  # noqa: E402  sets TEMP/TMP to the studio's drive before any child process starts
ENV = {**os.environ, 'PYTHONUTF8': '1', 'PYTHONIOENCODING': 'utf-8'}
CREDITS_PER_CHAR, CREDITS_PER_PART_SOUND = 0.42, 110  # measured on the first series: re-measure with `status`
NPX = 'npx.cmd' if os.name == 'nt' else 'npx'


def die(msg):
    raise SystemExit(f'series: {msg}')


def sdir(slug):
    return STUDIO / 'series' / slug


def out(slug):
    d = STUDIO / 'out' / f'series-{slug}'
    d.mkdir(parents=True, exist_ok=True)
    return d


def part(slug, n):
    return f'{slug}-{int(n):02d}'


def ep(slug, n):
    return STUDIO / 'src' / 'episodes' / part(slug, n)


def final(slug, n):
    return STUDIO / 'out' / part(slug, n) / f'{part(slug, n)}-final.mp4'


def load(p, default=None):
    p = pathlib.Path(p)
    if not p.exists():
        if default is not None:
            return default
        die(f'missing {p}')
    return json.loads(p.read_text(encoding='utf-8-sig'))  # -sig: files saved on Windows may start with a BOM


def save(p, data):
    pathlib.Path(p).write_text(json.dumps(data, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')


def config(slug):
    return load(sdir(slug) / 'series.json')


def script(slug):
    """[(n, name, spoken text)] from guion.md: '### ... 01: name', then a line 'TAG: text'."""
    tag = config(slug).get('script_tag', 'VOICE')
    parts, head = [], None
    for line in (sdir(slug) / 'guion.md').read_text(encoding='utf-8-sig').splitlines():
        m = re.match(r'#{2,4}\s.*?(\d+)\s*:\s*(.*)$', line)
        if m:
            head = (int(m.group(1)), m.group(2).strip())
        elif line.startswith(f'{tag}: ') and head:
            parts.append((head[0], head[1], line[len(tag) + 2:].strip()))
            head = None
    if not parts:
        die(f'no "{tag}: " lines under "### Part NN: name" headings in guion.md')
    return parts


def numbers(slug, a):
    all_ = [n for n, _, _ in script(slug)]
    return [int(x) for x in a.parts.split(',')] if a.parts else all_


def run(*cmd):
    return subprocess.run([str(c) for c in cmd], text=True, encoding='utf-8', errors='replace', capture_output=True, env=ENV)


def tool(name, *args):
    return run(sys.executable, WI / name, *args)


def tail(r, n=1):
    lines = [l for l in (r.stdout or '').strip().splitlines() if l.strip()]
    return ' | '.join(lines[-n:])


def seconds(p):
    r = run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p)
    return float(r.stdout.strip() or 0)


def stamp(t):
    return f'{int(t // 60)}:{int(t % 60):02d}'


# ---------------------------------------------------------------- script and voice
def cmd_count(a):
    total_w = total_c = 0
    bad = []
    for n, name, text in script(a.slug):
        w, c = len(text.split()), len(text)
        total_w += w
        total_c += c
        ok = 45 <= w <= 65
        if not ok:
            bad.append(n)
        print(f'{n:02d}  {w:3d} words  ~{w / 2.7:4.1f} s  {c:4d} chars  {"" if ok else "OUT OF 45-65  "}{name}')
    print(f'{total_w} words, about {total_w / 2.7 / 60:.1f} min before tightening, {total_c} chars')
    if bad:
        die(f'parts outside 45-65 words: {bad}')


def cmd_init(a):
    c = config(a.slug)
    for n, name, text in script(a.slug):
        p = ep(a.slug, n)
        p.mkdir(parents=True, exist_ok=True)
        f = p / 'episode.json'
        cur = load(f, {})
        spoken = ' '.join(b['text'].strip() for b in cur.get('script', []))
        if cur and spoken == text:
            continue
        if cur:
            print(f'{part(a.slug, n)}: script changed, updating (voices will re-record this part)')
        cur.update({'id': f"{c['id_prefix']}{n:02d}", 'slug': part(a.slug, n), 'topic': f"{c['topic']} ({n})", 'title': c['title'], 'voice': c['voice'], 'script': [{'beat': name, 'text': text}]})
        cur.setdefault('science', [])
        save(f, cur)
    common = STUDIO / 'src' / 'episodes' / f'{a.slug}-common.tsx'
    if not common.exists():
        common.write_text("import { LookDef } from '../engine';\n\n// The series' cast, power look, sets and props.\nexport const looks: Record<string, LookDef> = {};\n", encoding='utf-8')
    print('initialised', len(script(a.slug)), 'parts')


def cmd_voices(a):
    for n in numbers(a.slug, a):
        r = tool('voice.py', part(a.slug, n))
        lines = [l for l in r.stdout.splitlines() if re.match(r'ElevenLabs:|Tightened|Voice unchanged', l)]
        print(f'{n:02d}', ' | '.join(lines), flush=True)
        if r.returncode:
            die(f'voice failed on part {n}: {r.stderr.strip().splitlines()[-1] if r.stderr.strip() else ""}')


def voice_info(vid):
    from wi import api
    return json.loads(api(f'/v1/voices/{vid}'))


def cmd_voice_search(a):
    from wi import api
    q = {'language': a.lang, 'page_size': 15, 'sort': 'cloned_by_count'}
    if a.gender:
        q['gender'] = a.gender
    d = json.loads(api('/v1/shared-voices?' + urllib.parse.urlencode(q)))
    for v in d.get('voices', []):
        print(f"{v.get('voice_id')}  {v.get('name')}  [{v.get('locale') or v.get('accent')}, {v.get('age')}, {v.get('use_case')}]")


def cmd_preflight(a):
    problems = []
    for t in ('node', 'ffmpeg', 'ffprobe'):
        if not shutil.which(t):
            problems.append(f'{t} is not on the PATH')
    if not (STUDIO / 'src' / 'engine').exists():
        problems.append('run this from the studio folder (no src/engine here)')
    try:
        from wi import api, credits_used
        used, limit = credits_used()
        print(f'credits: {used} of {limit} used')
        json.loads(api('/v1/history?page_size=1'))
    except urllib.error.HTTPError as e:
        used = limit = None
        problems.append(f'the key was refused ({e.code}): {e.read().decode("utf-8", "ignore")[:200]}')
    except SystemExit as e:
        used = limit = None
        problems.append(str(e))
    if a.slug and (sdir(a.slug) / 'guion.md').exists():
        c = config(a.slug)
        parts = script(a.slug)
        chars = sum(len(t) for _, _, t in parts)
        cost = int(chars * CREDITS_PER_CHAR + len(parts) * CREDITS_PER_PART_SOUND)
        print(f'{len(parts)} parts, {chars} chars: about {cost} credits (voice {int(chars * CREDITS_PER_CHAR)}), about {len(parts) * 5.5 / 60:.1f} h of rendering')
        if used is not None and limit - used < cost:
            problems.append(f'about {cost} credits needed, {limit - used} left')
        try:
            v = voice_info(c['voice']['id'])
            langs = sorted({x.get('language') for x in (v.get('verified_languages') or [])})
            print(f"voice: {v.get('name')} ({v.get('category')}), verified languages: {', '.join(langs) or 'none listed'}")
        except urllib.error.HTTPError as e:
            problems.append(f'voice lookup failed ({e.code})')
    for p in problems:
        print('PROBLEM:', p)
    if problems:
        sys.exit(1)
    print('ready (text to speech itself is only tested by the first voice call)')


# ---------------------------------------------------------------- plans, timelines, registry
def cmd_apply(a):
    clips = load(sdir(a.slug) / 'clips.json', {})
    done = []
    for f in sorted((sdir(a.slug) / 'plans').glob('*.json')):
        n = int(f.stem)
        P = load(f)
        e = load(ep(a.slug, n) / 'episode.json')
        e['shots'] = [{'id': s[0], 'size': s[1], 'set': s[2], 'key': s[3], 'note': s[4]} for s in P['shots']]
        e['edit'] = [{'shot': s, **(c if isinstance(c, dict) else {'at': c})} for s, c in P['edit']]
        e['fx'] = P.get('fx', [])
        for k in ('cast', 'end', 'tail'):
            if k in P:
                e[k] = P[k]
        events = P.get('events', [])
        repeats = P.get('repeats', [])
        music = P.get('music')
        if events or music or repeats:
            used = {x[1] for x in events} | {r['clip'] for r in repeats} | ({music} if music else set())
            missing = sorted(used - set(clips))
            if missing:
                die(f'part {n} uses clips not in clips.json: {missing}')
            s = {'clips': {k: clips[k] for k in sorted(used)}, 'events': events, 'levels': P.get('levels', {'sfx_lu': -5, 'music_lu': -11})}
            if repeats:
                s['repeats'] = repeats
            if music:
                s['music'] = {'clip': music}
            e['sound'] = s
        save(ep(a.slug, n) / 'episode.json', e)
        done.append(n)
    print('applied', done)


def register(slug):
    """Add every part that has shots.tsx and timeline.json to the registry; a part without them would break the build."""
    c = config(slug)
    p = STUDIO / 'src' / 'episodes' / 'index.ts'
    s = p.read_text(encoding='utf-8')
    var_prefix = c['id_prefix'][0].lower() + c['id_prefix'][1:]
    added = []
    for n, _, _ in script(slug):
        d = ep(slug, n)
        if not ((d / 'shots.tsx').exists() and (d / 'timeline.json').exists()):
            continue
        var = f'{var_prefix}{n:02d}'
        if not (d / 'index.tsx').exists():
            (d / 'index.tsx').write_text(f"""import {{ defineEpisode, Timeline, ShotMap }} from '../../engine';
import {{ looks }} from '../{slug}-common';
import timeline from './timeline.json';
import * as shots from './shots';

export const {var} = defineEpisode('{c['id_prefix']}{n:02d}', {{
  timeline: timeline as Timeline,
  shots: shots as unknown as ShotMap,
  looks,
}});
""", encoding='utf-8')
        if f"from './{part(slug, n)}'" in s:
            continue
        s = s.replace('\nexport const EPISODES', f"import {{ {var} }} from './{part(slug, n)}';\n\nexport const EPISODES", 1) if '\n\nexport const EPISODES' not in s else s.replace('\n\nexport const EPISODES', f"\nimport {{ {var} }} from './{part(slug, n)}';\n\nexport const EPISODES", 1)
        s = re.sub(r'export const EPISODES = \[(.*?)\];', lambda m: f'export const EPISODES = [{m.group(1)}, {var}];', s, count=1, flags=re.S)
        added.append(n)
    p.write_text(s, encoding='utf-8')
    return added


def cmd_plan(a):
    for n in numbers(a.slug, a):
        if not load(ep(a.slug, n) / 'episode.json').get('edit'):
            continue
        r = tool('plan.py', part(a.slug, n))
        if r.returncode:
            die(f'plan failed on part {n}: {r.stderr.strip().splitlines()[-1] if r.stderr.strip() else r.stdout[-300:]}')
        pace = next((l for l in r.stdout.splitlines() if l.startswith('pace:')), '')
        print(f'{n:02d}', pace, flush=True)
    print('registered', register(a.slug))


def cmd_boards(a):
    for n in numbers(a.slug, a):
        if not (ep(a.slug, n) / 'timeline.json').exists():
            continue
        r = run('node', WI / 'stills.mjs', part(a.slug, n))
        if r.returncode:
            die(f'stills failed on part {n}: {r.stderr[-500:]}')
        b = tool('board.py', part(a.slug, n))
        print(f'{n:02d}', tail(b), flush=True)


# ---------------------------------------------------------------- sound
def cmd_sound(a):
    for n in numbers(a.slug, a):
        r = tool('sfx.py', part(a.slug, n))
        lines = [l for l in r.stdout.splitlines() if re.match(r'\d+ clips|ElevenLabs:', l)]
        print(f'{n:02d}', ' | '.join(lines), flush=True)
        if r.returncode:
            die(f'sound failed on part {n}: {r.stderr.strip().splitlines()[-1] if r.stderr.strip() else ""}')


def cmd_mix(a):
    for n in numbers(a.slug, a):
        r = tool('mixcheck.py', part(a.slug, n))
        print(f'== {n:02d}', next((l.split(' where')[0] for l in r.stdout.splitlines() if 'moments' in l), 'clear'))
        for l in r.stdout.splitlines():
            m = re.search(r'float64\((-?[\d.]+)\)', l)
            if m and float(m.group(1)) >= 3:
                print(l)


# ---------------------------------------------------------------- render and join
def cmd_join(a):
    parts = [final(a.slug, n) for n, _, _ in script(a.slug)]
    missing = [p.name for p in parts if not p.exists()]
    if missing:
        die(f'not joined, missing: {missing}')
    d = out(a.slug)
    lst = d / 'list.txt'
    lst.write_text(''.join(f"file '{p.as_posix()}'\n" for p in parts), encoding='utf-8')
    film = d / f'{a.slug}-full.mp4'
    r = run('ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', film)
    if r.returncode:
        die(f'join failed: {r.stderr[-400:]}')
    expect = sum(seconds(p) for p in parts)
    got = seconds(film)
    if abs(expect - got) > 1:
        die(f'the film is {got:.1f} s but its parts add to {expect:.1f} s')
    loud = run('ffmpeg', '-hide_banner', '-nostats', '-i', film, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-')
    m = re.search(r'I:\s+(-?[\d.]+) LUFS', loud.stderr or '')
    print(f'{film}\n{stamp(got)} ({got:.1f} s), {m.group(1) + " LUFS" if m else "loudness unknown"}')


def cmd_render(a):
    wi.clean_tmp()
    chosen = numbers(a.slug, a)
    failed = []
    for n in chosen:
        if final(a.slug, n).exists() and not a.force and not a.parts:
            print(f'{n:02d} already mastered', flush=True)
            continue
        r = tool('master.py', part(a.slug, n))
        if r.returncode:
            failed.append(n)
            print(f'{n:02d} FAILED', (r.stderr or r.stdout)[-600:], flush=True)
            continue
        rep = load(STUDIO / 'out' / part(a.slug, n) / 'report.json')
        print(f"{n:02d} {rep.get('seconds')} s, {rep.get('lufs')} LUFS, peak {rep.get('true_peak_dbtp')}", flush=True)
    if failed:
        die(f'failed parts: {failed}; re-run with --parts')
    cmd_join(a)


# ---------------------------------------------------------------- the YouTube package
def cmd_thumb(a):
    f = STUDIO / 'src' / 'thumbnails' / f'{a.component}.tsx'
    if not f.exists():
        die(f'missing {f}')
    root = STUDIO / 'src' / 'Root.tsx'
    s = root.read_text(encoding='utf-8')
    if f"id=\"{a.component}\"" not in s:
        s = s.replace("import { CastSheet } from './CastSheet';", f"import {{ CastSheet }} from './CastSheet';\nimport {{ {a.component} }} from './thumbnails/{a.component}';", 1)
        s = s.replace('      <Composition id="Cast"', f'      <Composition id="{a.component}" component={{{a.component}}} durationInFrames={{1}} {{...common}} />\n      <Composition id="Cast"', 1)
        root.write_text(s, encoding='utf-8')
    d = out(a.slug)
    v = (a.variant or '').lower()
    if v and v not in 'abc':
        die('--variant must be a, b or c')
    names = [f'thumbnail-{v}'] if v else []
    if v in ('', 'a'):
        names.append('thumbnail')  # variant A is also the default upload
    png = d / f'{names[0]}.png'
    r = run(NPX, 'remotion', 'still', 'src/index.ts', a.component, png, '--log=error')
    if r.returncode:
        die(f'thumbnail failed: {r.stderr[-600:]}')
    for n in names:
        if d / f'{n}.png' != png:
            shutil.copyfile(png, d / f'{n}.png')
        run('ffmpeg', '-y', '-v', 'error', '-i', png, '-vf', 'scale=1280:720', '-q:v', '2', d / f'{n}.jpg')
        run('ffmpeg', '-y', '-v', 'error', '-i', png, '-vf', 'scale=320:180', d / f'{n}-small.png')
        size = (d / f'{n}.jpg').stat().st_size
        print(f'{d / f"{n}.jpg"} ({size // 1024} KB){"  OVER 2 MB" if size > 2_000_000 else ""}')
    print(f'{d / f"{names[0]}-small.png"}: open this one and check it reads')
    smalls = [d / f'thumbnail-{x}-small.png' for x in 'abc']
    if all(p.exists() for p in smalls):
        # the three side by side at feed size, the way they'll be compared in the Suggested column
        sheet = d / 'thumbnails-compare.png'
        args = ['ffmpeg', '-y', '-v', 'error']
        for p in smalls:
            args += ['-i', p]
        args += ['-filter_complex', '[0][1][2]hstack=inputs=3,pad=iw+20:ih+20:10:10:color=0x0F0F0F[o]', '-map', '[o]', sheet]
        run(*args)
        print(f'{sheet}: all three at feed size, compare them here')


def cmd_chapters(a):
    starts, t = {}, 0.0
    for n, _, _ in script(a.slug):
        if not final(a.slug, n).exists():
            die(f'part {n} is not rendered yet')
        starts[n] = t
        t += seconds(final(a.slug, n))
    for n, title in load(sdir(a.slug) / 'chapters.json'):
        print(f'{stamp(starts[int(n)])} {title}')


def section(s, *names):
    m = re.search(r'^## (?:' + '|'.join(names) + r')\s*$(.*?)(?=^## |\Z)', s, flags=re.M | re.S)
    return m.group(1).strip() if m else None


def cmd_check(a):
    s = (sdir(a.slug) / 'youtube.md').read_text(encoding='utf-8-sig')
    problems = []
    title = section(s, 'Title', 'Título', 'Tiêu đề')
    desc = section(s, 'Description', 'Descripción', 'Mô tả')
    tags = section(s, 'Tags', 'Etiquetas')
    if not (title and desc and tags):
        die('youtube.md needs the sections Title, Description and Tags')
    title = title.split('###')[0].strip().splitlines()[0]
    print(f'title {len(title)}/100: {title}')
    if len(title) > 100:
        problems.append('title over 100 characters')
    elif len(title) > 70:
        print('  note: over 70 characters, search results will cut it off')
    print(f'description {len(desc)}/5000')
    if len(desc) > 5000:
        problems.append('description over 5000 characters')
    items = [t.strip() for t in tags.replace('\n', ' ').split(',') if t.strip()]
    cost = sum(len(t) + (2 if ' ' in t else 0) for t in items) + len(items) - 1
    print(f'tags {len(items)}, counting {cost}/500')
    if cost > 500:
        problems.append('tags over 500')
    st = [int(x) * 60 + int(y) for x, y in re.findall(r'^(\d+):(\d\d) ', desc, flags=re.M)]
    print(f'chapters {len(st)}')
    if st:
        gaps = [q - p for p, q in zip(st, st[1:])]
        if st[0] != 0:
            problems.append('the first chapter must start at 0:00')
        if len(st) < 3:
            problems.append('YouTube needs at least three chapters')
        if gaps and min(gaps) < 10:
            problems.append('a chapter is under 10 s')
        if any(g <= 0 for g in gaps):
            problems.append('chapters are out of order')
    jpg = out(a.slug) / 'thumbnail.jpg'
    if not jpg.exists():
        print('note: no thumbnail.jpg in the series output folder')
    variants = [x for x in 'abc' if (out(a.slug) / f'thumbnail-{x}.jpg').exists()]
    print(f'thumbnail variants {len(variants)}/3: {", ".join(variants) or "none"}')
    if len(variants) < 3:
        problems.append('make three thumbnails: thumb <slug> <Component> --variant a|b|c')
    alts = section(s, 'Title tests', 'Títulos a probar', 'Tiêu đề thử nghiệm')
    lines = [l.strip('- ').strip() for l in (alts or '').splitlines() if l.strip().startswith('-')]
    if len(lines) < 3:
        problems.append('youtube.md needs a "## Title tests" section with three titles, one per thumbnail')
    for l in lines:
        t = re.sub(r'^\[?[ABCabc]\]?[:.)]\s*', '', l)
        if len(t) > 70:
            print(f'  note: test title over 70 characters ({len(t)}): {t}')
    for p in problems:
        print('PROBLEM:', p)
    if problems:
        sys.exit(1)
    print('ok')


def cmd_status(a):
    print('part  words  voice    shots  board  sound  film')
    for n, _, text in script(a.slug):
        d = ep(a.slug, n)
        o = STUDIO / 'out' / part(a.slug, n)
        pub = STUDIO / 'public' / part(a.slug, n)
        words = load(d / 'words.json', [])
        v = f'{words[-1]["e"]:5.1f} s' if words else '   -   '
        yes = lambda b: 'yes' if b else '-'
        f = final(a.slug, n)
        print(f'{n:02d}   {len(text.split()):5d}  {v}  {yes((d / "shots.tsx").exists()):5s}  {yes((o / "storyboard.jpg").exists()):5s}  {yes((pub / "sfx.wav").exists()):5s}  {f"{seconds(f):.1f} s" if f.exists() else "-"}')
    try:
        from wi import credits_used
        used, limit = credits_used()
        print(f'account credits: {used} of {limit} used (the whole account, this is the figure to report)')
    except Exception as e:
        print('credits unavailable:', e)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('command', choices=['count', 'init', 'voices', 'voice-search', 'preflight', 'apply', 'plan', 'boards', 'sound', 'mix', 'join', 'render', 'thumb', 'chapters', 'check', 'status'])
    p.add_argument('slug', nargs='?')
    p.add_argument('component', nargs='?')
    p.add_argument('--parts')
    p.add_argument('--force', action='store_true')
    p.add_argument('--lang')
    p.add_argument('--gender')
    p.add_argument('--variant', help='thumb only: a, b or c (a is also saved as thumbnail.jpg)')
    a = p.parse_args()
    if a.command not in ('voice-search', 'preflight') and not a.slug:
        p.error('this command needs a slug')
    if a.command == 'voice-search' and not a.lang:
        p.error('voice-search needs --lang')
    if a.command == 'thumb' and not a.component:
        p.error('thumb needs a component name')
    globals()['cmd_' + a.command.replace('-', '_')](a)


if __name__ == '__main__':
    main()
