import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { clamp, lerp, backOut, easeOut, easeInOut } from './anim';
import { KitDefs } from './kit';
import { SetDefs } from './light';
import { FONT } from './fonts';
import { STUDIO } from '../studio.config';
import { Timeline, ShotMap, ShotProps, LookDef, EpisodeDef, segAt, clockAt, lookRuns, fxAt } from './episode';
import { BookInfo, BookCTA, BookObject, PALETTE } from './book';

// The 9:16 frame for book affiliate videos (TikTok, Shopee Video, Reels). Shots are still drawn in the 1920 x 1080
// world; each one is seen through a square window in the middle of the vertical frame, framed per shot from
// episode.json ("frame": {"x": 900, "zoom": 1.1}). Around it: the hook on top (the 3-second promise), burned-in
// karaoke captions (most viewers watch muted), a small book chip, and a full-frame end card with the price and the
// call to action (a shot with "frame": "book").
//
//   0 ..  140   TikTok's top bar: nothing important
// 150 ..  400   the hook, two lines
// 410 .. 1490   the scene window (1080 x 1080)
// 1360.. 1500   captions, over the bottom of the scene
// 1510.. 1580   the book chip
// 1600.. 1920   TikTok's caption and buttons: nothing important

export const VW = 1080;
export const VH = 1920;
export const SCENE = { y: 410, size: 1080 };

export type Word = { w: string; s: number; e: number; p?: string };
/** How a shot sits in the window: centre x, y in the 1920 x 1080 world, zoom (1 = 1080 px of the world across),
 * pan: [x at the shot's start, x at its end]. "wide" shows the whole 16:9 picture letterboxed. "book" is the end card. */
export type Framing = { x?: number; y?: number; zoom?: number; pan?: [number, number]; zoomTo?: number } | 'wide' | 'book' | 'full';
type ShotJson = { id: string; key?: number; frame?: unknown };
/** The parts of episode.json the vertical frame reads. */
export type VerticalJson = {
  hook?: string[] | string;
  accent?: string;
  book?: BookInfo;
  shots: ShotJson[];
  captions?: { maxWords?: number; y?: number; size?: number; upper?: boolean; color?: string } | false;
  cover?: { shot?: string; t?: number; text?: string[] };
  /** For long videos: the hook changes from a shot on, e.g. [{"from": "S12", "hook": ["PHẦN 2", "ĐƯỢC NGƯỜI KHÁC QUÝ"], "accent": "PHẦN 2"}]. */
  chapters?: { from: string; hook: string[]; accent?: string }[];
  theme?: { bg?: string; bg2?: string; accent?: string };
};

const framingOf = (ep: VerticalJson, id: string): Framing => (ep.shots.find((s) => s.id === id)?.frame as Framing) ?? {};
const isFull = (fr: Framing) => fr === 'book' || fr === 'full';

// ---------------------------------------------------------------- the scene window
const viewBox = (fr: Framing, t: number, len: number) => {
  if (fr === 'wide') return { vb: '0 0 1920 1080', h: 608 };
  const o = typeof fr === 'object' ? fr : {};
  const p = len > 0 ? easeInOut(clamp(t / len)) : 0;
  const zoom = lerp(o.zoom ?? 1, o.zoomTo ?? o.zoom ?? 1, p);
  const size = 1080 / zoom;
  const cx = o.pan ? lerp(o.pan[0], o.pan[1], p) : o.x ?? 960;
  const cy = o.y ?? 540;
  const x = clamp(cx - size / 2, 0, Math.max(0, 1920 - size));
  const y = size <= 1080 ? clamp(cy - size / 2, 0, 1080 - size) : cy - size / 2;
  return { vb: `${x.toFixed(1)} ${y.toFixed(1)} ${size.toFixed(1)} ${size.toFixed(1)}`, h: 1080 };
};

const SceneWindow: React.FC<{ fr: Framing; t: number; len: number; f: number; children: React.ReactNode; overlay?: React.ReactNode; grade?: string; dx?: number; dy?: number }> = ({ fr, t, len, children, overlay, grade, dx = 0, dy = 0 }) => {
  const { vb, h } = viewBox(fr, t, len);
  const top = SCENE.y + (SCENE.size - h) / 2;
  return (
    <div style={{ position: 'absolute', left: 0, top, width: VW, height: h, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${dx}px, ${dy}px) scale(${dx || dy ? 1.03 : 1})`, filter: grade }}>
        <svg width={VW} height={h} viewBox={vb} preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
          <KitDefs />
          <SetDefs />
          {children}
          {overlay}
        </svg>
      </div>
      {/* soft edges so the window melts into the frame, and a vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 70, background: `linear-gradient(${PALETTE.bg}, rgba(0,0,0,0))` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, background: `linear-gradient(rgba(0,0,0,0), ${PALETTE.bg})` }} />
    </div>
  );
};

// ---------------------------------------------------------------- the hook
/** The hook on top: two lines in the caption face, one accent word in yellow, popping in on the first frames. */
export const Hook: React.FC<{ f: number; lines: string[]; accent?: string; size?: number; top?: number }> = ({ f, lines, accent, size = 70, top = 150 }) => {
  const acc = accent?.toLocaleUpperCase('vi');
  return (
    <div style={{ position: 'absolute', top, left: 40, right: 40, height: 250, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: FONT.vn, fontWeight: 900, textAlign: 'center' }}>
      {lines.map((ln, i) => {
        const s = backOut(clamp((f - i * 4) / 8));
        const up = ln.toLocaleUpperCase('vi');
        const fs = Math.min(size, 940 / (up.length * 0.72)); // one line each, never a third
        return (
          <div key={i} style={{ transform: `scale(${s})`, fontSize: fs, lineHeight: 1.12, color: '#FFFFFF', textShadow: '0 5px 0 #000, 0 0 18px rgba(0,0,0,0.6)', WebkitTextStroke: '3px #000' }}>
            {acc && up.includes(acc)
              ? up.split(acc).map((part, j, all) => (
                  <React.Fragment key={j}>
                    {part}
                    {j < all.length - 1 ? <span style={{ color: PALETTE.cart }}>{acc}</span> : null}
                  </React.Fragment>
                ))
              : up}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- captions
type Chunk = { words: Word[]; a: number; b: number };
/** Words into caption chunks: a break at punctuation or after maxWords syllables. Times in seconds. */
export const chunkWords = (words: Word[], maxWords = 5): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({ words: cur, a: cur[0].s, b: cur[cur.length - 1].e });
    cur = [];
  };
  for (const w of words) {
    cur.push(w);
    if (/[.,!?:;…]/.test(w.p ?? '') || cur.length >= maxWords) flush();
  }
  flush();
  for (let i = 0; i < out.length; i++) {
    const next = out[i + 1];
    out[i].b = next ? Math.min(next.a, out[i].b + 0.6) : out[i].b + 0.6;
  }
  return out;
};

/** Burned-in captions, TikTok style: big, outlined, the word being spoken in yellow. */
export const Captions: React.FC<{ f: number; fps: number; chunks: Chunk[]; y?: number; size?: number; upper?: boolean; color?: string }> = ({ f, fps, chunks, y = 1430, size = 76, upper = true, color = PALETTE.cart }) => {
  const sec = f / fps;
  const c = chunks.find((k) => sec >= k.a - 0.05 && sec < k.b);
  if (!c) return null;
  const pop = backOut(clamp((sec - c.a + 0.05) * fps / 5));
  const fix = (s: string) => (upper ? s.toLocaleUpperCase('vi') : s);
  return (
    // anchored by its bottom edge: a second line grows upward, never into the book chip below
    <div style={{ position: 'absolute', left: 50, right: 50, bottom: VH - (y + size * 0.6), display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
      <div style={{ transform: `scale(${0.9 + 0.1 * pop})`, textAlign: 'center', fontFamily: FONT.vn, fontWeight: 900, fontSize: size, lineHeight: 1.15, WebkitTextStroke: `${Math.round(size / 7)}px #000`, paintOrder: 'stroke fill', textShadow: '0 6px 10px rgba(0,0,0,0.55)' }}>
        {c.words.map((w, i) => {
          const on = sec >= w.s - 0.03 && (i === c.words.length - 1 || sec < c.words[i + 1].s - 0.03);
          return (
            <span key={i} style={{ color: on ? color : '#FFFFFF', display: 'inline-block', transform: on ? 'scale(1.08)' : undefined, margin: '0 0.12em' }}>
              {fix(w.w + (w.p ?? '').replace(/[,.;:…]/g, ''))}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- the book chip
/** A small chip under the scene: the cover and the title. It reminds the viewer which book this is all through. */
export const BookChip: React.FC<{ f: number; b: BookInfo; y?: number }> = ({ f, b, y = 1515 }) => {
  const s = easeOut(clamp((f - 20) / 10));
  return (
    <div style={{ position: 'absolute', top: y, left: 40, display: 'flex', alignItems: 'center', gap: 18, padding: '10px 30px 10px 12px', borderRadius: 60, background: 'rgba(10,8,24,0.78)', border: '2px solid rgba(255,255,255,0.15)', opacity: s, transform: `translateX(${(1 - s) * -40}px)`, fontFamily: FONT.vn, color: '#FFF' }}>
      <div style={{ transform: 'scale(1)', width: 52, height: 75, overflow: 'hidden', borderRadius: 4 }}>
        <BookObject b={b} w={52} style={{ boxShadow: 'none' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>{b.title}</div>
        {b.author ? <div style={{ fontSize: 24, color: PALETTE.dim }}>{b.author}</div> : null}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- the episode
export type VerticalProps = {
  timeline: Timeline;
  shots: ShotMap;
  episode: VerticalJson;
  words?: Word[];
  looks?: Record<string, LookDef>;
  /** Custom full-frame shots (1080 x 1920), for shots with "frame": "full". */
  fullFrames?: Record<string, React.FC<ShotProps>>;
};

const background = (ep: VerticalJson) => `radial-gradient(circle at 50% 45%, ${ep.theme?.bg2 ?? PALETTE.bg2} 0%, ${ep.theme?.bg ?? PALETTE.bg} 75%)`;
const hookLines = (ep: VerticalJson) => (Array.isArray(ep.hook) ? ep.hook : ep.hook ? [ep.hook] : []);
/** The hook on screen at frame f, and the frame it started (so a new chapter's hook pops in). */
const hookAt = (ep: VerticalJson, tl: Timeline, f: number) => {
  let cur = { lines: hookLines(ep), accent: ep.accent, from: 0 };
  for (const c of ep.chapters ?? []) {
    const seg = tl.segments.find((s) => s.shot === c.from);
    if (seg && seg.a <= f && seg.a >= cur.from) cur = { lines: c.hook, accent: c.accent, from: seg.a };
  }
  return cur;
};

const ShotView: React.FC<{ p: VerticalProps; id: string; t: number; len: number; f: number; look?: { def?: LookDef; lv: number; prog: number; n: number }; dx?: number; dy?: number }> = ({ p, id, t, len, f, look, dx, dy }) => {
  const fr = framingOf(p.episode, id);
  if (fr === 'book') return p.episode.book ? <BookCTA t={t} len={len} book={p.episode.book} /> : null;
  if (fr === 'full') {
    const Full = p.fullFrames?.[id];
    return Full ? <Full t={t} len={len} f={f} /> : null;
  }
  const Shot = p.shots[id];
  const def = look?.def;
  const lv = look?.lv ?? 0;
  return (
    <SceneWindow
      fr={fr}
      t={t}
      len={len}
      f={f}
      dx={dx}
      dy={dy}
      grade={def?.grade && lv > 0 ? def.grade(lv) : undefined}
      overlay={def?.Overlay && look ? <g opacity={lv}><def.Overlay f={f} lv={lv} p={look.prog} n={look.n} /></g> : null}
    >
      {Shot ? <Shot t={t} len={len} f={f} /> : null}
    </SceneWindow>
  );
};

export const VerticalEpisode: React.FC<VerticalProps> = (p) => {
  const f = useCurrentFrame();
  const tl = p.timeline;
  const ep = p.episode;
  const seg = segAt(tl, f);
  const info = tl.shots.find((s) => s.id === seg.shot);
  const full = isFull(framingOf(ep, seg.shot));
  const run = lookRuns(tl).find((r) => f >= r.a && f < r.b);
  const def = run && p.looks ? p.looks[run.look] : undefined;
  const lv = run ? Math.min(clamp((f - run.a + 1) / 2), clamp((run.b - f) / 2)) : 0;
  const jitter = def?.jitter && lv > 0 ? Math.sin(f * 13.7) * def.jitter * lv : 0;
  const { flash, x, y } = fxAt(tl, f);
  const chunks = React.useMemo(() => chunkWords(p.words ?? [], ep.captions ? ep.captions.maxWords : 5), [p.words, ep.captions]);
  const cap = ep.captions === false ? null : ep.captions ?? {};
  const A = tl.audio;
  return (
    <AbsoluteFill style={{ background: background(ep) }}>
      <ShotView p={p} id={seg.shot} t={clockAt(seg, f)} len={info?.len ?? seg.b - seg.a} f={f} look={run ? { def, lv, prog: clamp((f - run.a) / (run.b - run.a)), n: run.n } : undefined} dx={x + jitter} dy={y} />
      {!full ? (() => { const h = hookAt(ep, tl, f); return <Hook f={f - h.from} lines={h.lines} accent={h.accent} />; })() : null}
      {!full && ep.book ? <BookChip f={f} b={ep.book} /> : null}
      {!full && cap ? <Captions f={f} fps={tl.fps} chunks={chunks} y={cap.y} size={cap.size} upper={cap.upper} color={cap.color} /> : null}
      {flash ? <AbsoluteFill style={{ backgroundColor: flash.color, opacity: flash.o }} /> : null}
      {A.voice ? <Audio src={staticFile(A.voice)} volume={A.voiceVol ?? 1} /> : null}
      {A.sfx ? <Audio src={staticFile(A.sfx)} volume={A.sfxVol ?? 1} /> : null}
      {A.music ? <Audio src={staticFile(A.music)} volume={A.musicVol ?? 1} /> : null}
    </AbsoluteFill>
  );
};

/** The storyboard in the vertical frame: frame i is shot i at its key frame, with the hook, no captions, no audio. */
export const VerticalBoard: React.FC<VerticalProps> = (p) => {
  const f = useCurrentFrame();
  const info = p.timeline.shots[Math.min(f, p.timeline.shots.length - 1)];
  const full = isFull(framingOf(p.episode, info.id));
  return (
    <AbsoluteFill style={{ background: background(p.episode) }}>
      <ShotView p={p} id={info.id} t={info.key} len={info.len} f={info.first + info.key} />
      {!full ? (() => { const h = hookAt(p.episode, p.timeline, info.first); return <Hook f={60} lines={h.lines} accent={h.accent} />; })() : null}
      {!full && p.episode.book ? <BookChip f={60} b={p.episode.book} /> : null}
    </AbsoluteFill>
  );
};

/** The cover frame (TikTok cover / Shopee thumbnail): one shot behind, the hook big, the book in front. */
export const VerticalCover: React.FC<VerticalProps> = (p) => {
  const ep = p.episode;
  const sid = ep.cover?.shot ?? p.timeline.shots.find((s) => !isFull(framingOf(ep, s.id)))?.id ?? p.timeline.shots[0]?.id;
  const info = p.timeline.shots.find((s) => s.id === sid);
  const lines = ep.cover?.text ?? hookLines(ep);
  return (
    <AbsoluteFill style={{ background: background(ep) }}>
      {info ? <ShotView p={p} id={info.id} t={ep.cover?.t ?? info.key} len={info.len} f={info.first + (ep.cover?.t ?? info.key)} /> : null}
      <AbsoluteFill style={{ background: 'linear-gradient(rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%)' }} />
      <Hook f={60} lines={lines} accent={ep.accent} size={92} top={190} />
      {ep.book ? (
        <div style={{ position: 'absolute', left: 560, top: 1150, transform: 'rotate(6deg)' }}>
          <BookObject b={ep.book} w={400} />
        </div>
      ) : null}
      {STUDIO.channel ? <div style={{ position: 'absolute', left: 60, bottom: 120, fontFamily: FONT.vn, fontSize: 40, fontWeight: 800, color: '#FFF' }}>{STUDIO.channel}</div> : null}
    </AbsoluteFill>
  );
};

/** Bundle a vertical episode for the registry: the film, its storyboard, its cover. */
export const defineVerticalEpisode = (id: string, p: VerticalProps): EpisodeDef => ({
  id,
  total: p.timeline.total,
  shotCount: p.timeline.shots.length,
  width: STUDIO.vertical.width,
  height: STUDIO.vertical.height,
  Main: () => <VerticalEpisode {...p} />,
  Board: () => <VerticalBoard {...p} />,
  Cover: () => <VerticalCover {...p} />,
});
