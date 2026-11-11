"""Test voice without an ElevenLabs key: the offline Windows voice, written into voice.py's cache.

python tools/voice_windows.py <slug> [voice name]      (from the studio folder), then:
python <skill>/scripts/voice.py <slug>                 tightens the pauses, with no API call

Change the script and run this again before voice.py, or voice.py will see a new text and call the API.
"""
import hashlib, json, pathlib, re, subprocess, sys, tempfile

slug = sys.argv[1]
voice = sys.argv[2] if len(sys.argv) > 2 else 'Microsoft David Desktop'
studio = pathlib.Path.cwd()
ep = json.loads((studio / 'src' / 'episodes' / slug / 'episode.json').read_text(encoding='utf-8'))
text = ' '.join(b['text'].strip() for b in ep['script'])

public = studio / 'public' / slug
out = studio / 'out' / slug
public.mkdir(parents=True, exist_ok=True)
out.mkdir(parents=True, exist_ok=True)

PS = r'''
param($TextFile, $Wav, $Voice)
Add-Type -AssemblyName System.Speech
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(44100, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice($Voice)
$s.Rate = 1
$s.SetOutputToWaveFile($Wav, $fmt)
$script:rows = @()
$s.add_SpeakProgress({ param($o, $e) $script:rows += "$($e.AudioPosition.TotalSeconds)`t$($e.CharacterPosition)`t$($e.CharacterCount)" })
$s.Speak([IO.File]::ReadAllText($TextFile))
$s.Dispose()
$script:rows
'''
with tempfile.TemporaryDirectory() as tmp:
    tmp = pathlib.Path(tmp)
    (tmp / 'say.ps1').write_text(PS, encoding='utf-8')
    (tmp / 'text.txt').write_text(text, encoding='utf-8')
    wav = tmp / 'voice.wav'
    r = subprocess.run(['powershell', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', str(tmp / 'say.ps1'), str(tmp / 'text.txt'), str(wav), voice],
                       capture_output=True, text=True, check=True)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(wav), '-ar', '44100', '-b:a', '128k', str(public / 'voice_raw.mp3')], check=True)

rows = [l.split('\t') for l in r.stdout.splitlines() if l.count('\t') == 2]
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(public / 'voice_raw.mp3')], capture_output=True, text=True).stdout)
# SAPI reports AudioPosition as if the 44.1 kHz output ran at 16 kHz (checked against the take's silences with silencedetect)
POS_SCALE = 16000 / 44100
words = []
for i, (sec, pos, count) in enumerate(rows):
    pos, count = int(pos), int(count)
    raw = text[pos:pos + count]
    after = re.match(r'\S*', text[pos + count:]).group(0)  # the punctuation decides how long voice.py lets the pause run
    token = (raw + after).strip()
    w = re.sub(r"[^\w'.]+$", '', token).rstrip('.')
    p = token[len(w):]
    start = float(sec) * POS_SCALE
    end = float(rows[i + 1][0]) * POS_SCALE if i + 1 < len(rows) else dur
    # SAPI gives word starts only: estimate the end from the word's length, never past the next word
    words.append({'w': w, 's': round(start, 3), 'e': round(min(end, start + 0.06 * len(w) + 0.12), 3), 'p': p})

(out / 'words_raw.json').write_text(json.dumps(words, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
# the same signature voice.py computes, so it treats this take as its cache
V = {'id': 'TX3LPaxmHKxFdv7VOQHJ', 'model': 'eleven_multilingual_v2', 'settings': {'stability': 0.4, 'similarity_boost': 0.8, 'style': 0.35, 'use_speaker_boost': True}}
V.update(ep.get('voice', {}))
sig = hashlib.sha1(json.dumps([text, V], sort_keys=True).encode()).hexdigest()[:12]
(out / 'voice_meta.json').write_text(json.dumps({'sig': sig, 'chars': len(text)}), encoding='utf-8')
print(f'{voice}: {dur:.2f} s, {len(words)} words')
print(' '.join(f"{w['w']}{w['p']}@{w['s']}" for w in words))
