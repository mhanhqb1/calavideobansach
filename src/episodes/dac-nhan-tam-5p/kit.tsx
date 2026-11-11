import React from 'react';
import {
  Hero, Look, Pose, Expr, LOOKS, LEG_LEN, poseAt, faceAt, kf, clamp, easeOut, backOut, camT, stand, hipY, walkPose, Close,
  Office, OfficeDesk, OFFICE, Shop, Checkout, SHOP, Kitchen, KitchenIsland, KITCHEN, Study, STUDY, Bedroom, BEDROOM,
  Street, Moped, Stairwell, Rooftop, Schematic, SCH, SchLabel, CountUp, DrawOn, WallCalendar, Sparkle, FocusRings, Glow,
  SvgBook, BookInfo, FONT, ShotProps,
} from '../../engine';

// The shot kit for "30 ngày sống theo Đắc Nhân Tâm": a handful of parametric shots (a close-up, people in a room, on
// the street, cards on the schematic) so each of the film's ~110 shots is a few lines in shots.tsx. Everything is
// drawn in the 1920 x 1080 world; the vertical frame shows a 1080 px square around x 960, so keep the action in
// x 420..1500.

export const YELLOW = '#FFD43B';
export const RED = '#FF5A4A';
export const GREEN = '#5BE08A';

// ---------- the cast ----------
export const HERO = LOOKS.pipWork;
export const SEP = LOOKS.jefa; // the boss
export const MO = LOOKS.mo; // a colleague
export const KHO = LOOKS.suit; // the hardest person / the client
export const BAOVE: Look = { ...LOOKS.policia, jacket: '#4A5A6A', jacketShade: '#3A4856', limb: '#4A5A6A', accent: '#C9B24A', hair: '#2A221E', skin: '#D9A97F', skinShade: '#C08F68', hand: '#D9A97F', age: 0.6 };
export const BANHMI: Look = { ...LOOKS.cajera, jacket: '#C8573A', jacketShade: '#A8452C', limb: '#C8573A', accent: '#F2E3C6' };
export const LAOCONG: Look = { ...LOOKS.mom, jacket: '#3E7A5E', jacketShade: '#30624A', accent: '#E9C46A', hair: '#2A1C18', age: 0.45 };
export const KHACH: Look = { ...LOOKS.suit, jacket: '#5A4234', jacketShade: '#46332A', limb: '#5A4234', accent: '#2E4A6A', hair: '#B9B4AC', age: 0.6 };
export const THUCTAP: Look = { ...LOOKS.pipWork, jacket: '#6A8AA8', jacketShade: '#56728E', limb: '#6A8AA8', accent: '#F2EDE2', hair: '#3A2620', skin: '#E8C8A8', skinShade: '#D2B08E', hand: '#E8C8A8' };
export const HANGXOM: Look = { ...LOOKS.mo, jacket: '#7A4A6A', jacketShade: '#603A54', accent: '#E9C46A' };
export const BUUDIEN: Look = { ...LOOKS.pipWork, jacket: '#2F5E8A', jacketShade: '#244A6E', limb: '#2F5E8A', accent: '#E8C25A', hair: '#1E1A1A', skin: '#D8A77F', skinShade: '#C08F68', hand: '#D8A77F', extra: 'cap' };

// ---------- gestures: pose keys from the shot's start ----------
type Key = { f: number; p: Partial<Pose>; ease?: (t: number) => number };
export type Gesture = 'stand' | 'talk' | 'cheer' | 'point' | 'shrug' | 'nod' | 'wave' | 'hold' | 'think' | 'slump' | 'clap' | 'bow';
export const gesture = (g: Gesture, at = 4): Key[] => {
  switch (g) {
    case 'talk':
      return [{ f: at, p: { armR: { a: 46, b: 40 }, tilt: 2 }, ease: easeOut }, { f: at + 10, p: { armR: { a: 36, b: 30 } } }, { f: at + 20, p: { armR: { a: 48, b: 44 } } }];
    case 'cheer':
      return [{ f: at, p: { squash: 0.05 } }, { f: at + 5, p: { armL: { a: 150, b: 10 }, armR: { a: 150, b: 10 }, squash: -0.05 }, ease: easeOut }, { f: at + 9, p: { armL: { a: 140, b: 16 }, armR: { a: 140, b: 16 }, squash: 0 } }];
    case 'point':
      return [{ f: at, p: { armR: { a: 92, b: 2 }, tilt: 4 }, ease: easeOut }, { f: at + 4, p: { armR: { a: 86, b: 0 } } }];
    case 'shrug':
      return [{ f: at, p: { armL: { a: 36, b: 70 }, armR: { a: 36, b: 70 }, headTilt: 8 }, ease: easeOut }];
    case 'nod':
      return [{ f: at, p: { headTilt: 8 } }, { f: at + 5, p: { headTilt: -2 } }, { f: at + 10, p: { headTilt: 8 } }, { f: at + 15, p: { headTilt: 0 } }];
    case 'wave':
      return [{ f: at, p: { armR: { a: 140, b: 20 } }, ease: easeOut }, { f: at + 4, p: { armR: { a: 130, b: 40 } } }, { f: at + 8, p: { armR: { a: 145, b: 15 } } }, { f: at + 12, p: { armR: { a: 130, b: 40 } } }];
    case 'hold':
      return [{ f: at, p: { armL: { a: 50, b: 50 }, armR: { a: 50, b: 50 } }, ease: easeOut }];
    case 'think':
      return [{ f: at, p: { armR: { a: 30, b: 120 }, headTilt: 10, look: 0.6 }, ease: easeOut }];
    case 'slump':
      return [{ f: at, p: { tilt: 6, headTilt: 14, armL: { a: 4, b: -2 }, armR: { a: 4, b: -2 }, squash: 0.03 }, ease: easeOut }];
    case 'clap':
      return [{ f: at, p: { armL: { a: 60, b: 70 }, armR: { a: 60, b: 70 } } }, { f: at + 3, p: { armL: { a: 54, b: 86 }, armR: { a: 54, b: 86 } } }, { f: at + 6, p: { armL: { a: 60, b: 70 }, armR: { a: 60, b: 70 } } }, { f: at + 9, p: { armL: { a: 54, b: 86 }, armR: { a: 54, b: 86 } } }];
    case 'bow':
      return [{ f: at, p: { tilt: 14, headTilt: 10 }, ease: easeOut }, { f: at + 10, p: { tilt: 0, headTilt: 0 } }];
    default:
      return [];
  }
};

// ---------- backgrounds for close-ups ----------
export type SetName = 'office' | 'shop' | 'kitchen' | 'study' | 'bedroom' | 'street' | 'stairwell' | 'rooftop';
export const SetBg: React.FC<{ set: SetName; t: number; id: string }> = ({ set, t, id }) => {
  switch (set) {
    case 'office': return <Office t={t} id={id} />;
    case 'shop': return <Shop t={t} id={id} />;
    case 'kitchen': return <Kitchen t={t} id={id} />;
    case 'study': return <Study t={t} id={id} />;
    case 'bedroom': return <Bedroom t={t} id={id} />;
    case 'street': return <Street t={t} id={id} />;
    case 'stairwell': return <Stairwell t={t} id={id} />;
    case 'rooftop': return <Rooftop t={t} />;
  }
};

/** A talking close-up on a blurred set. */
export const close = (o: { look: Look; set: SetName; faces: [number, Expr][]; yaw?: number; tilt?: [number, number][]; sc?: number; day?: number; extra?: (t: number) => React.ReactNode; dark?: number; push?: number; blink?: number }): React.FC<ShotProps> => {
  const C: React.FC<ShotProps> = ({ t }) => (
    <g>
      <Close t={t} look={o.look} faces={o.faces} yaw={o.yaw ?? 0.2} sc={o.sc ?? 3.4} dark={o.dark} push={o.push ?? 0.06} blink={o.blink}
        tilt={o.tilt ? kf(t, o.tilt) : 0}
        bg={<g transform="translate(-640 -400) scale(1.75)"><SetBg set={o.set} t={t + 40} id={`c${o.set}`} /></g>} />
      {o.extra ? o.extra(t) : null}
      {o.day ? <DayTag t={t} n={o.day} /> : null}
    </g>
  );
  return C;
};

// ---------- people in a room ----------
export type Actor = { look: Look; u: number; w: number; yaw?: number; faces?: [number, Expr][]; does?: Gesture; at?: number; keys?: Key[]; hand?: 'point' | 'open'; scale?: number; walkFrom?: number };
type RoomName = 'office' | 'shop' | 'kitchen' | 'study' | 'bedroom';
const ROOMS = {
  office: { R: OFFICE, Set: Office, Front: OfficeDesk, cut: 0.42 },
  shop: { R: SHOP, Set: Shop, Front: Checkout, cut: 0.42 },
  kitchen: { R: KITCHEN, Set: Kitchen, Front: KitchenIsland, cut: 0.45 },
  study: { R: STUDY, Set: Study, Front: null, cut: 0 },
  bedroom: { R: BEDROOM, Set: Bedroom, Front: null, cut: 0 },
} as const;

const actorPose = (R: typeof OFFICE, a: Actor, t: number): Pose => {
  const p = stand(R, a.u, a.w);
  const sc = p.scale * (a.scale ?? 1);
  const ground = p.y + LEG_LEN * p.scale; // the floor under this spot
  const y = ground - LEG_LEN * sc;
  if (a.walkFrom !== undefined && t < 18) {
    const x = kf(t, [[0, a.walkFrom], [18, p.x]], easeOut);
    return walkPose(x, t * 0.55, ground, sc, {}, a.walkFrom < p.x ? 1 : -1);
  }
  return poseAt(t, [{ f: 0, p: { x: p.x, y, scale: sc, yaw: a.yaw ?? 0 } }, ...(a.does ? gesture(a.does, a.at ?? 4) : []), ...(a.keys ?? [])]);
};

/** People in a room: the set, those behind the furniture, the furniture, those in front, extras, a day tag. */
export const room = (o: { set: RoomName; actors: Actor[]; cam?: [number, number, number, number]; day?: number; veil?: number; extra?: (t: number, len: number) => React.ReactNode; under?: (t: number, len: number) => React.ReactNode }): React.FC<ShotProps> => {
  const { R, Set, Front, cut } = ROOMS[o.set];
  const S: React.FC<ShotProps> = ({ t, len }) => {
    const [cx, cy, s0, s1] = o.cam ?? [960, 560, 1.22, 1.28];
    const draw = (a: Actor, i: number) => {
      const pose = actorPose(R, a, t);
      return <Hero key={i} look={a.look} pose={{ ...pose, ...faceAt(t, a.faces ?? [[0, 'neutral']]), handR: a.hand ?? (a.does === 'point' ? 'point' : 'open') }} shadow={0.6} rimId={pose.x > 960 ? 'rimL' : 'rimR'} />;
    };
    const sorted = o.actors.map((a, i) => ({ a, i })).sort((p, q) => p.a.w - q.a.w);
    return (
      <g transform={camT(cx, cy, kf(t, [[0, s0], [len, s1]]))}>
        <Set t={t + 40} id={`r${o.set}`} veil={o.veil} />
        {o.under ? o.under(t, len) : null}
        {sorted.filter(({ a }) => a.w < cut).map(({ a, i }) => draw(a, i))}
        {Front ? <Front /> : null}
        {sorted.filter(({ a }) => a.w >= cut).map(({ a, i }) => draw(a, i))}
      </g>
    );
  };
  return (props) => (
    <g>
      <S {...props} />
      {o.extra ? o.extra(props.t, props.len) : null}
      {o.day ? <DayTag t={props.t} n={o.day} /> : null}
    </g>
  );
};

// ---------- the street ----------
export const GROUND = 850;
export type StreetActor = { look: Look; x: number; scale?: number; yaw?: number; faces?: [number, Expr][]; does?: Gesture; at?: number; walk?: [number, number]; keys?: Key[] };
export const street = (o: { actors: StreetActor[]; cam?: [number, number, number, number]; mopeds?: number[]; day?: number; extra?: (t: number, len: number) => React.ReactNode }): React.FC<ShotProps> => {
  const S: React.FC<ShotProps> = ({ t, len }) => {
    const [cx, cy, s0, s1] = o.cam ?? [1000, 640, 1.45, 1.5];
    return (
      <g>
        <g transform={camT(cx, cy, kf(t, [[0, s0], [len, s1]]))}>
          <Street t={t + 30} id="st5" />
          {(o.mopeds ?? []).map((x, i) => <Moped key={i} x={x} y={GROUND + 10} s={0.95} />)}
          {o.actors.map((a, i) => {
            const sc = a.scale ?? 0.9;
            let pose: Pose;
            if (a.walk) {
              const x = kf(t, [[0, a.walk[0]], [len, a.walk[1]]]);
              pose = walkPose(x, t * 0.5, GROUND, sc, {}, a.walk[1] > a.walk[0] ? 1 : -1);
            } else {
              pose = poseAt(t, [{ f: 0, p: { x: a.x, y: hipY(GROUND, sc), scale: sc, yaw: a.yaw ?? 0 } }, ...(a.does ? gesture(a.does, a.at ?? 4) : []), ...(a.keys ?? [])]);
            }
            return <Hero key={i} look={a.look} pose={{ ...pose, ...faceAt(t, a.faces ?? [[0, 'neutral']]), handR: a.does === 'point' ? 'point' : 'open' }} shadow={0.7} rimId="rimR" />;
          })}
        </g>
        {o.extra ? o.extra(t, len) : null}
        {o.day ? <DayTag t={t} n={o.day} /> : null}
      </g>
    );
  };
  return S;
};

// ---------- overlays ----------
/** A day tag at the top of the window: "NGÀY 7". */
export const DayTag: React.FC<{ t: number; n: number; y?: number }> = ({ t, n, y = 120 }) => {
  if (t < 0) return null;
  const s = backOut(clamp(t / 6));
  const w = 300 + String(n).length * 48;
  return (
    <g transform={`translate(960 ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-58} width={w} height={116} rx={58} fill={YELLOW} stroke="#1B1406" strokeWidth={6} />
      <text y={26} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={72} fill="#1B1406">NGÀY {n}</text>
    </g>
  );
};

/** A word bubble that pops above someone: a short spoken line or a sound. */
export const Pop: React.FC<{ x: number; y: number; t: number; text: string; color?: string; size?: number; hold?: number }> = ({ x, y, t, text, color = '#FFFFFF', size = 56, hold = 999 }) => {
  if (t < 0 || t > hold) return null;
  const s = backOut(clamp(t / 6));
  const w = Math.max(160, text.length * size * 0.58 + 70);
  const cx = Math.min(1480 - w / 2, Math.max(440 + w / 2, x));
  return (
    <g transform={`translate(${cx} ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.8} fill="#0B0816" opacity={0.85} stroke={color} strokeWidth={4} />
      <text y={size * 0.28} textAnchor="middle" fontFamily={FONT.vn} fontWeight={800} fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

/** A check or a cross mark drawing on. */
export const Mark: React.FC<{ x: number; y: number; t: number; ok: boolean; s?: number }> = ({ x, y, t, ok, s = 1 }) => {
  const m = clamp(t / 6);
  if (m <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={70} fill="#0B0816" opacity={0.8} stroke={ok ? GREEN : RED} strokeWidth={8} />
      {ok ? (
        <path d="M -34 2 L -10 28 L 36 -26" stroke={GREEN} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={120} strokeDashoffset={120 * (1 - m)} />
      ) : (
        <path d="M -30 -30 L 30 30 M 30 -30 L -30 30" stroke={RED} strokeWidth={16} strokeLinecap="round" strokeDasharray={170} strokeDashoffset={170 * (1 - m)} />
      )}
    </g>
  );
};

// ---------- cards on the schematic ----------
/** A slow push-in over the shot, so a card held for 4-5 s still moves. */
const Push: React.FC<{ t: number; len: number; children: React.ReactNode; k?: number }> = ({ t, len, children, k = 0.07 }) => (
  <g transform={`translate(960 540) scale(${1 + k * easeOut(clamp(t / Math.max(1, len)))}) translate(-960 -540)`}>{children}</g>
);
const wrap = (text: string, max: number) => {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      lines.push(cur.trim());
      cur = w;
    } else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
};

/** A principle card: "PHẦN 1 · NGUYÊN TẮC 2", then the rule, big, line by line, underlined. */
export const rule = (o: { label: string; text: string; size?: number; color?: string }): React.FC<ShotProps> => {
  const lines = wrap(o.text.toLocaleUpperCase('vi'), 14);
  const size = o.size ?? Math.min(lines.length > 3 ? 78 : 90, 980 / (Math.max(...lines.map((l) => l.length)) * 0.62));
  const y0 = 560 - ((lines.length - 1) * size * 1.1) / 2 + 30;
  const R: React.FC<ShotProps> = ({ t, len }) => (
    <Push t={t} len={len}>
      <Schematic t={t} id="rule" />
      <Glow x={960} y={520} r={520} o={0.25} />
      <SchLabel x={960} y={y0 - size * 1.2} t={t} text={o.label} size={48} color={SCH.live} />
      {lines.map((ln, i) => (
        <g key={i} opacity={clamp((t - 4 - i * 4) / 5)} transform={`translate(0 ${(1 - easeOut(clamp((t - 4 - i * 4) / 8))) * 30})`}>
          <text x={960} y={y0 + i * size * 1.1} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={size} fill={o.color ?? SCH.line}>{ln}</text>
        </g>
      ))}
      <DrawOn d={`M 640 ${y0 + (lines.length - 1) * size * 1.1 + 40} L 1280 ${y0 + (lines.length - 1) * size * 1.1 + 40}`} t={t - 8 - lines.length * 4} dur={8} color={YELLOW} width={10} />
    </Push>
  );
  return R;
};

/** A quote card: big quotation marks, the line, who said it. */
export const quote = (o: { text: string; by: string }): React.FC<ShotProps> => {
  const lines = wrap(o.text, 22);
  const size = lines.length > 3 ? 70 : 80;
  const y0 = 540 - ((lines.length - 1) * size * 1.2) / 2;
  const Q: React.FC<ShotProps> = ({ t, len }) => (
    <Push t={t} len={len}>
      <Schematic t={t + 20} id="quote" />
      <text x={520} y={y0 - 60} fontFamily={FONT.title} fontWeight={800} fontSize={260} fill={YELLOW} opacity={0.85 * clamp(t / 6)}>“</text>
      {lines.map((ln, i) => (
        <text key={i} x={960} y={y0 + i * size * 1.2} textAnchor="middle" fontFamily={FONT.vn} fontWeight={800} fontSize={size} fill={SCH.line} opacity={clamp((t - 3 - i * 3) / 5)}>{ln}</text>
      ))}
      <SchLabel x={960} y={y0 + lines.length * size * 1.2 + 50} t={t - 6 - lines.length * 3} text={`— ${o.by}`} size={44} color={SCH.dim} />
    </Push>
  );
  return Q;
};

/** A fact card: a label, a number counting up, a label under it. */
export const fact = (o: { top: string; to: number; fmt?: (v: number) => string; bottom?: string; color?: string; dur?: number }): React.FC<ShotProps> => {
  const F: React.FC<ShotProps> = ({ t, len }) => (
    <Push t={t} len={len}>
      <Schematic t={t + 60} id="fact" />
      <Glow x={960} y={520} r={460} o={0.22} />
      <SchLabel x={960} y={380} t={t} text={o.top} size={56} color={SCH.dim} />
      <CountUp x={960} y={590} t={t - 3} to={o.to} dur={o.dur ?? 24} size={140} color={o.color ?? YELLOW} format={o.fmt ?? ((v) => new Intl.NumberFormat('vi-VN').format(Math.round(v)))} />
      {o.bottom ? <SchLabel x={960} y={720} t={t - 16} text={o.bottom} size={56} color={SCH.line} /> : null}
    </Push>
  );
  return F;
};

/** A name card for a real person in the book's stories (text only: we don't draw real people). */
export const nameCard = (o: { name: string; role: string; year: string }): React.FC<ShotProps> => {
  const N: React.FC<ShotProps> = ({ t, len }) => (
    <Push t={t} len={len}>
      <Schematic t={t + 90} id="name" />
      <SchLabel x={960} y={360} t={t} text={o.year} size={64} color={SCH.live} />
      <g opacity={clamp((t - 4) / 6)}>
        <text x={960} y={560} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={Math.min(120, 960 / (o.name.length * 0.8))} fill={SCH.line}>{o.name.toLocaleUpperCase('vi')}</text>
      </g>
      <DrawOn d="M 560 610 L 1360 610" t={t - 8} dur={8} color={YELLOW} width={8} />
      <SchLabel x={960} y={700} t={t - 12} text={o.role.toLocaleUpperCase('vi')} size={48} color={SCH.dim} />
    </Push>
  );
  return N;
};

/** Two lines of big text on the schematic, for a title beat. */
export const title = (o: { lines: string[]; accent?: string }): React.FC<ShotProps> => {
  const T: React.FC<ShotProps> = ({ t }) => (
    <g>
      <Rooftop t={t + 60} />
      <rect x={-200} y={-200} width={2320} height={1480} fill="#07040C" opacity={0.35} />
      {o.lines.map((ln, i) => {
        const s = backOut(clamp((t - i * 6) / 9));
        const up = ln.toLocaleUpperCase('vi');
        return (
          <text key={i} transform={`translate(960 ${450 + i * 150}) scale(${s})`} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={Math.min(110, 980 / (up.length * 0.62))} fill={o.accent && up.includes(o.accent) ? YELLOW : '#FFFFFF'} stroke="#0B0816" strokeWidth={14} paintOrder="stroke">{up}</text>
        );
      })}
    </g>
  );
  return T;
};

/** The book, rising on the schematic, with an optional label under it. */
export const bookShot = (b: BookInfo, label?: string): React.FC<ShotProps> => {
  const B: React.FC<ShotProps> = ({ t }) => {
    const rise = easeOut(clamp(t / 12));
    return (
      <g>
        <Schematic t={t} id="book" />
        <Glow x={960} y={430} r={480} o={0.35 * rise} />
        <g transform={`translate(0 ${(1 - rise) * 160})`} opacity={rise}>
          <SvgBook b={b} x={960} y={430} w={330} rot={-4 + 4 * rise} />
        </g>
        {label ? <SchLabel x={960} y={850} t={t - 12} text={label} size={56} color={SCH.live} /> : null}
      </g>
    );
  };
  return B;
};

/** A wall calendar insert, crossing off up to `to` days, with the day tag. */
export const calendar = (from: number, to: number): React.FC<ShotProps> => {
  const C: React.FC<ShotProps> = ({ t, len }) => {
    const crossed = Math.floor(kf(t, [[2, from], [Math.max(3, Math.min(len - 4, 24)), to]], easeOut));
    return (
      <g>
        <g transform={camT(960, kf(t, [[0, 560], [len, 540]]), kf(t, [[0, 1.0], [len, 1.06]]))}>
          <Study t={t + 20} id="cal" veil={0.5} />
          <rect x={-200} y={-200} width={2320} height={1480} fill="#07040C" opacity={0.35} />
          <WallCalendar x={960} y={200} w={560} crossed={crossed} drawing={0.5} rot={-2} />
        </g>
        <DayTag t={t - 6} n={to + 1 > 30 ? 30 : to + 1} y={130} />
      </g>
    );
  };
  return C;
};

export { Sparkle, FocusRings, Glow, kf, clamp, easeOut, backOut, SCH, SchLabel, DrawOn, Schematic, FONT };
