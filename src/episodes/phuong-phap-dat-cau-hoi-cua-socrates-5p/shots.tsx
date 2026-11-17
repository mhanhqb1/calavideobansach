import React from 'react';
import { ShotProps, BookInfo, SvgBook, Paper, Phone, LOOKS, Look } from '../../engine';
import ep from './episode.json';
import {
  HERO, SEP, MO, KHO, KHACH, BANHMI, LAOCONG, YELLOW, RED, GREEN,
  close, room, street, rule, quote, nameCard, title, bookShot, Pop, Mark,
  Sparkle, FocusRings, Glow, kf, clamp, easeOut, backOut, SCH, SchLabel, Schematic, DrawOn, FONT,
} from './kit';

// "6 câu hỏi giúp bạn không bị dắt mũi", about 5 minutes. Built from the kit; the one-off pictures (the temple,
// the six-question cards, the iceberg, the viral post, 6 or 9, the dominoes, the wrong lock) are drawn here.
// Socrates himself is never drawn: only his name, the temple and question marks.

const BOOK = ep.book as unknown as BookInfo;
const ME: Look = { ...LOOKS.mom, age: 0.5 };

// ---------- the six questions ----------
const QS = ['Ý bạn chính xác là gì?', 'Mình đang mặc định gì?', 'Dựa vào đâu?', 'Người kia thấy gì?', 'Rồi sau đó thì sao?', 'Hỏi đúng câu chưa?'];
const QL = [['Ý BẠN CHÍNH XÁC', 'LÀ GÌ?'], ['MÌNH ĐANG', 'MẶC ĐỊNH GÌ?'], ['DỰA VÀO ĐÂU?'], ['NGƯỜI KIA', 'THẤY GÌ?'], ['RỒI SAU ĐÓ', 'THÌ SAO?'], ['HỎI ĐÚNG', 'CÂU CHƯA?']];

const Push: React.FC<{ t: number; len: number; children: React.ReactNode; k?: number }> = ({ t, len, children, k = 0.06 }) => (
  <g transform={`translate(960 540) scale(${1 + k * easeOut(clamp(t / Math.max(1, len)))}) translate(-960 -540)`}>{children}</g>
);

/** A question mark drawn big, glowing. */
const QMark: React.FC<{ x: number; y: number; s?: number; t: number; color?: string; o?: number }> = ({ x, y, s = 1, t, color = YELLOW, o = 1 }) => {
  const k = backOut(clamp(t / 8));
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * k})`} opacity={o}>
      <text y={70} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={260} fill={color} stroke="#0B0816" strokeWidth={10} paintOrder="stroke">?</text>
    </g>
  );
};

/** Chapter card: six dots in a row, number n lit, then "CÂU n" and the question. n = 0: all six pop in. */
const sixQ = (n: number, label?: string): React.FC<ShotProps> => {
  const C: React.FC<ShotProps> = ({ t, len }) => (
    <Push t={t} len={len}>
      <Schematic t={t + 10 * n} id={`six${n}`} />
      <Glow x={960} y={520} r={520} o={0.25} />
      {QS.map((_, i) => {
        const x = 960 + (i - 2.5) * 128;
        const on = n === 0 ? clamp((t - 4 - i * 3) / 4) : i + 1 === n ? 1 : i + 1 < n ? 0.55 : 0.18;
        const s = n === 0 ? backOut(clamp((t - 4 - i * 3) / 6)) : i + 1 === n ? 1 + 0.15 * backOut(clamp((t - 2) / 6)) : 1;
        return (
          <g key={i} transform={`translate(${x} 300) scale(${s})`} opacity={Math.max(0.18, on)}>
            <circle r={50} fill={i + 1 === n || n === 0 ? YELLOW : '#2A3A54'} stroke="#0B0816" strokeWidth={6} />
            <text y={24} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={66} fill="#1B1406">{i + 1}</text>
          </g>
        );
      })}
      {n === 0 ? (
        <g opacity={clamp((t - 18) / 6)}><text x={960} y={620} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={96} fill={SCH.line}>{(label ?? 'SÁU CÂU HỎI').toLocaleUpperCase('vi')}</text></g>
      ) : (
        <g>
          <SchLabel x={960} y={500} t={t - 4} text={`CÂU ${n}`} size={64} color={SCH.live} />
          {QL[n - 1].map((ln, i) => (
            <g key={i} opacity={clamp((t - 8 - i * 4) / 5)}>
              <text x={960} y={640 + i * 104} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={88} fill={SCH.line}>{ln}</text>
            </g>
          ))}
        </g>
      )}
    </Push>
  );
  return C;
};

const wrapLines = (text: string, max: number) => {
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
    if ((cur + ' ' + w).trim().length > max) {
      out.push(cur.trim());
      cur = w;
    } else cur += ' ' + w;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};

/** The six questions as a checklist, the first `upTo` ticked and the newest one lit. */
const sixList = (upTo: number): React.FC<ShotProps> => {
  const L: React.FC<ShotProps> = ({ t, len }) => (
    <Push t={t} len={len} k={0.04}>
      <Schematic t={t + 70} id={`list${upTo}`} />
      <SchLabel x={960} y={190} t={t} text="HỎI NÓ ĐỦ 6 CÂU" size={52} color={SCH.live} />
      {QS.map((q, i) => {
        const fresh = i >= upTo - 2 && i < upTo;
        const done = i < upTo;
        const k = fresh ? clamp((t - 4 - (i - (upTo - 2)) * 14) / 6) : done ? 1 : 0;
        const y = 300 + i * 112;
        return (
          <g key={i} opacity={done ? 0.35 + 0.65 * k : 0.25}>
            <rect x={520} y={y - 46} width={880} height={92} rx={18} fill={fresh && k > 0 ? '#2A2410' : '#16223A'} stroke={fresh && k > 0 ? YELLOW : '#2A3A54'} strokeWidth={4} />
            <text x={572} y={y + 18} fontFamily={FONT.vn} fontWeight={900} fontSize={48} fill={YELLOW}>{i + 1}</text>
            <text x={628} y={y + 16} fontFamily={FONT.vn} fontWeight={800} fontSize={46} fill={SCH.line}>{q}</text>
            {done && k > 0.5 ? <path d={`M 1320 ${y} l 16 18 l 32 -36`} stroke={GREEN} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
          </g>
        );
      })}
    </Push>
  );
  return L;
};

/** A Greek temple drawing on: Athens. */
const temple = (label: string, sub?: string): React.FC<ShotProps> => {
  const T: React.FC<ShotProps> = ({ t, len }) => (
    <Push t={t} len={len}>
      <Schematic t={t + 40} id="temple" />
      <Glow x={960} y={440} r={560} o={0.3} />
      <DrawOn d="M 560 330 L 960 190 L 1360 330 Z" t={t} dur={10} color={SCH.line} width={8} />
      <DrawOn d="M 540 350 L 1380 350" t={t - 2} dur={8} color={SCH.line} width={10} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <DrawOn key={i} d={`M ${600 + i * 144} 370 L ${600 + i * 144} 660`} t={t - 4 - i * 1.5} dur={8} color={SCH.line} width={18} />
      ))}
      <DrawOn d="M 520 680 L 1400 680 M 490 712 L 1430 712" t={t - 12} dur={8} color={SCH.line} width={10} />
      {[0, 1, 2].map((i) => <QMark key={i} x={760 + i * 200} y={130 + (i % 2) * 40} s={0.32} t={t - 16 - i * 4} />)}
      <SchLabel x={960} y={810} t={t - 10} text={label} size={64} color={SCH.live} />
      {sub ? <SchLabel x={960} y={900} t={t - 16} text={sub} size={48} color={SCH.dim} /> : null}
    </Push>
  );
  return T;
};

/** One big question mark: the tool. */
const BigQ = (label: string): React.FC<ShotProps> => {
  const B: React.FC<ShotProps> = ({ t, len }) => (
    <Push t={t} len={len}>
      <Schematic t={t + 25} id="bigq" />
      <Glow x={960} y={460} r={480} o={0.45 * clamp(t / 10)} />
      <QMark x={960} y={400} s={1.6} t={t} />
      <SchLabel x={960} y={800} t={t - 10} text={label} size={64} color={SCH.line} />
    </Push>
  );
  return B;
};

/** The iceberg: 0 the tip labelled, 1 the hidden part lit and a ship, 2 "6 câu hỏi = phần nổi". */
const iceberg = (stage: 0 | 1 | 2): React.FC<ShotProps> => {
  const I: React.FC<ShotProps> = ({ t, len }) => {
    const bob = Math.sin(t * 0.12) * 6;
    const deep = stage === 1 ? clamp((t - 6) / 10) : 0;
    return (
      <Push t={t} len={len}>
        <rect x={-200} y={-200} width={2320} height={660} fill="#16243A" />
        <rect x={-200} y={460} width={2320} height={900} fill="#0C2A44" />
        <path d="M -200 460 Q 200 448 600 460 T 1400 460 T 2200 460" stroke="#7FB4D9" strokeWidth={4} fill="none" />
        <g transform={`translate(0 ${bob})`}>
          <path d="M 860 460 L 920 330 L 960 360 L 1010 290 L 1080 460 Z" fill="#E8F2FA" />
          <path d="M 700 470 L 620 640 L 680 860 L 960 980 L 1240 860 L 1310 650 L 1200 470 Z" fill="#5E8FB4" opacity={0.35 + 0.5 * deep} stroke="#9CC6E4" strokeWidth={3} />
        </g>
        {stage === 0 ? <SchLabel x={960} y={230} t={t - 4} text="ĐIỀU BẠN THẤY" size={52} color={SCH.line} /> : null}
        <SchLabel x={960} y={760} t={t - (stage === 0 ? 12 : 4)} text={stage === 2 ? 'TRONG SÁCH' : 'GIẢ ĐỊNH'} size={64} color={YELLOW} />
        {stage === 1 ? (
          <g transform={`translate(${kf(t, [[0, 1340], [len, 1180]])} 452)`}>
            <path d="M -110 0 L 110 0 L 80 40 L -80 40 Z" fill="#C9583A" />
            <rect x={-30} y={-60} width={60} height={60} fill="#E8E2D6" />
            <rect x={-6} y={-100} width={12} height={40} fill="#3A3A44" />
          </g>
        ) : null}
        {stage === 1 ? <SchLabel x={960} y={900} t={t - 14} text="LÁI CẢ CON TÀU" size={48} color={SCH.line} /> : null}
        {stage === 2 ? <SchLabel x={960} y={230} t={t - 2} text="6 CÂU HỎI = PHẦN NỔI" size={56} color={SCH.line} /> : null}
      </Push>
    );
  };
  return I;
};

/** A viral post on a phone-sized card; stage 1 the shares run up. */
const viralPost = (stage: 0 | 1): React.FC<ShotProps> => {
  const V: React.FC<ShotProps> = ({ t, len }) => {
    const shares = stage === 0 ? 1200 : Math.round(kf(t, [[0, 1200], [Math.max(10, len - 6), 9800]], easeOut));
    return (
      <Push t={t} len={len}>
        <Schematic t={t + 55} id="post" />
        <g transform={`translate(960 ${540 + (1 - backOut(clamp(t / 9))) * 120})`}>
          <rect x={-380} y={-380} width={760} height={760} rx={36} fill="#F6F2EA" stroke="#0B0816" strokeWidth={6} />
          <circle cx={-300} cy={-300} r={36} fill="#7E8DA6" />
          <rect x={-250} y={-322} width={260} height={22} rx={11} fill="#B9C2D0" />
          <rect x={-250} y={-290} width={160} height={18} rx={9} fill="#D5DAE2" />
          <text y={-150} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={60} fill={RED}>SỐC!!!</text>
          {['NƯỚC CHANH LÚC ĐÓI', 'CHỮA ĐƯỢC', 'MỌI BỆNH'].map((ln, i) => (
            <text key={i} y={-50 + i * 80} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={56} fill="#1B1420">{ln}</text>
          ))}
          <rect x={-380} y={250} width={760} height={4} fill="#D5DAE2" />
          <text x={-330} y={330} fontFamily={FONT.vn} fontWeight={800} fontSize={48} fill="#3A4A66">↗ {new Intl.NumberFormat('vi-VN').format(shares)} lượt chia sẻ</text>
        </g>
        {stage === 1 ? <Mark x={1300} y={900} t={t - 22} ok={false} s={1} /> : null}
      </Push>
    );
  };
  return V;
};

/** 6 or 9: a big numeral on the floor, one person each side. */
const sixNine = (stage: 0 | 1): React.FC<ShotProps> => {
  const N: React.FC<ShotProps> = ({ t, len }) => (
    <Push t={t} len={len}>
      <Schematic t={t + 80} id="sixnine" />
      <Glow x={960} y={600} r={420} o={0.3} />
      <ellipse cx={960} cy={720} rx={300} ry={70} fill="#16223A" stroke="#2A3A54" strokeWidth={4} />
      <text x={960} y={700} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={360} fill={YELLOW} stroke="#0B0816" strokeWidth={10} paintOrder="stroke" opacity={clamp(t / 6)}>6</text>
      <g transform="translate(620 560)">
        <circle r={42} fill="#F6EFE3" /><path d="M 0 42 L 0 170 M 0 80 L -50 140 M 0 80 L 50 140 M 0 170 L -40 260 M 0 170 L 40 260" stroke="#F6EFE3" strokeWidth={14} strokeLinecap="round" />
      </g>
      <g transform="translate(1300 560)">
        <circle r={42} fill="#F6EFE3" /><path d="M 0 42 L 0 170 M 0 80 L -50 140 M 0 80 L 50 140 M 0 170 L -40 260 M 0 170 L 40 260" stroke="#F6EFE3" strokeWidth={14} strokeLinecap="round" />
      </g>
      <Pop x={640} y={260} t={t - 8} text="SỐ 6!" color={YELLOW} size={60} />
      <Pop x={1280} y={260} t={t - 14} text="SỐ 9!" color="#7FD4FF" size={60} />
      {stage === 1 ? <><Mark x={640} y={130} t={t - 4} ok s={0.8} /><Mark x={1280} y={130} t={t - 10} ok s={0.8} /></> : null}
      {stage === 1 ? <SchLabel x={960} y={940} t={t - 14} text="CHỈ ĐỨNG Ở HAI PHÍA" size={52} color={SCH.line} /> : null}
    </Push>
  );
  return N;
};

/** Dominoes: 0 standing in a line, numbered; 1 the first pushed, the fall running down the line. */
const dominoes = (stage: 0 | 1): React.FC<ShotProps> => {
  const D: React.FC<ShotProps> = ({ t, len }) => (
    <Push t={t} len={len}>
      <Schematic t={t + 95} id="dom" />
      <line x1={500} y1={720} x2={1420} y2={720} stroke="#2A3A54" strokeWidth={6} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 585 + i * 150;
        const fall = stage === 1 ? clamp((t - 6 - i * 5) / 6) : 0;
        const lit = i === 2;
        return (
          <g key={i} transform={`translate(${x} 720) rotate(${fall * 62})`}>
            <rect x={-30} y={-240} width={60} height={240} rx={8} fill={lit ? YELLOW : '#F6EFE3'} stroke="#0B0816" strokeWidth={5} />
            <text y={-100} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={44} fill="#1B1406">{i + 1}</text>
          </g>
        );
      })}
      <SchLabel x={960} y={240} t={t - 4} text={stage === 0 ? 'MỖI QUYẾT ĐỊNH' : 'NHÌN THẤY QUÂN THỨ 3'} size={60} color={stage === 0 ? SCH.line : YELLOW} />
      {stage === 0 ? <SchLabel x={960} y={860} t={t - 10} text="LÀ MỘT QUÂN DOMINO" size={52} color={SCH.dim} /> : null}
    </Push>
  );
  return D;
};

/** The right key in the wrong lock. */
const KeyLock: React.FC<ShotProps> = ({ t, len }) => {
  const push = kf(t, [[0, 560], [14, 820]], easeOut);
  const jiggle = t > 14 ? Math.sin(t * 1.4) * 4 : 0;
  return (
    <Push t={t} len={len}>
      <Schematic t={t + 33} id="key" />
      <g transform="translate(1180 520)">
        <rect x={-130} y={-60} width={260} height={300} rx={36} fill="#3A4A66" stroke="#0B0816" strokeWidth={6} />
        <path d="M -90 -60 L -90 -150 A 90 90 0 0 1 90 -150 L 90 -60" stroke="#7E8DA6" strokeWidth={30} fill="none" />
        <rect x={-14} y={60} width={28} height={70} rx={8} fill="#0B0816" transform="rotate(90 0 95)" />
      </g>
      <g transform={`translate(${push} ${615 + jiggle}) rotate(${jiggle})`}>
        <circle cx={-170} cy={0} r={56} fill="none" stroke={YELLOW} strokeWidth={22} />
        <rect x={-120} y={-12} width={250} height={24} fill={YELLOW} />
        <rect x={60} y={10} width={18} height={30} fill={YELLOW} /><rect x={100} y={10} width={18} height={22} fill={YELLOW} />
      </g>
      <SchLabel x={960} y={240} t={t - 2} text="CHÌA ĐÚNG" size={60} color={YELLOW} />
      <SchLabel x={960} y={900} t={t - 12} text="NHƯNG SAI Ổ" size={60} color={RED} />
      <Mark x={1380} y={850} t={t - 18} ok={false} s={0.9} />
    </Push>
  );
};

/** Two people, a label over each: the two kinds. */
const TwoKinds: React.FC<ShotProps> = (p) => {
  const R = room({ set: 'office', cam: [960, 560, 1.12, 1.18], actors: [{ look: KHO, u: 0.35, w: 0.62, yaw: 0.3, faces: [[0, 'neutral']], does: 'shrug' }, { look: MO, u: 0.68, w: 0.62, yaw: -0.3, faces: [[0, 'neutral']], does: 'think', at: 8 }] });
  return (
    <g>
      <R {...p} />
      <Pop x={700} y={200} t={p.t - 6} text="KIỂU 1" size={60} />
      <Pop x={1220} y={200} t={p.t - 12} text="KIỂU 2" color={YELLOW} size={60} />
    </g>
  );
};

/** A countdown 3, 2, 1 in a ring. */
const Countdown: React.FC<ShotProps> = ({ t, len }) => {
  const n = Math.max(1, 3 - Math.floor(t / 22));
  const k = (t % 22) / 22;
  return (
    <Push t={t} len={len}>
      <Schematic t={t + 44} id="count" />
      <Glow x={960} y={520} r={420} o={0.35} />
      <circle cx={960} cy={520} r={230} fill="none" stroke="#2A3A54" strokeWidth={22} />
      <circle cx={960} cy={520} r={230} fill="none" stroke={YELLOW} strokeWidth={22} strokeDasharray={1445} strokeDashoffset={1445 * k} transform="rotate(-90 960 520)" />
      <text x={960} y={600} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={240} fill={SCH.line} transform={`translate(960 520) scale(${1 + 0.12 * (1 - backOut(clamp(k * 5)))}) translate(-960 -520)`}>{n}</text>
      <SchLabel x={960} y={880} t={t - 4} text="DỪNG LẠI BA GIÂY" size={60} color={SCH.line} />
    </Push>
  );
};

/** A card with hand-broken lines (no orphans), optional mark. */
const card = (label: string, lines: string[], o: { color?: string; ok?: boolean } = {}): React.FC<ShotProps> => {
  const size = Math.min(100, 980 / (Math.max(...lines.map((l) => l.length)) * 0.62));
  const y0 = 560 - ((lines.length - 1) * size * 1.1) / 2 + 30;
  const C: React.FC<ShotProps> = ({ t, len }) => (
    <Push t={t} len={len} k={0.07}>
      <Schematic t={t} id="card" />
      <Glow x={960} y={520} r={520} o={0.25} />
      <SchLabel x={960} y={y0 - size * 1.4} t={t} text={label} size={48} color={SCH.live} />
      {lines.map((ln, i) => (
        <g key={i} opacity={clamp((t - 4 - i * 4) / 5)} transform={`translate(0 ${(1 - easeOut(clamp((t - 4 - i * 4) / 8))) * 30})`}>
          <text x={960} y={y0 + i * size * 1.1} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={size} fill={o.color ?? (o.ok === false ? SCH.dim : SCH.line)}>{ln.toLocaleUpperCase('vi')}</text>
        </g>
      ))}
      <DrawOn d={`M 640 ${y0 + (lines.length - 1) * size * 1.1 + 40} L 1280 ${y0 + (lines.length - 1) * size * 1.1 + 40}`} t={t - 8 - lines.length * 4} dur={8} color={YELLOW} width={10} />
      {o.ok !== undefined ? <Mark x={1360} y={300} t={t - 10} ok={o.ok} s={1.1} /> : null}
    </Push>
  );
  return C;
};

/** A rule card with a mark over it. */
const markCard = (label: string, text: string, ok: boolean): React.FC<ShotProps> => {
  const R = rule({ label, text, color: ok ? undefined : SCH.dim });
  const M: React.FC<ShotProps> = (p) => (
    <g>
      <R {...p} />
      <Mark x={1360} y={300} t={p.t - 10} ok={ok} s={1.1} />
    </g>
  );
  return M;
};

const phoneIn = (text: string, on = 1, buzz = 0) => (t: number) => <Phone x={1280} y={kf(t, [[0, 1100], [8, 760]], easeOut)} w={190} rot={-6} on={on} caller={text} buzz={buzz} f={t} />;

// ======================================================================= the shots
// ---- 01 mở ----
export const S1 = close({ look: HERO, set: 'office', faces: [[0, 'neutral'], [20, 'worried']], tilt: [[0, 0], [24, 6]] });
export const S2 = close({ look: MO, set: 'street', faces: [[0, 'cool'], [16, 'smug']], yaw: -0.2, extra: (t) => <Sparkle x={1260} y={300} t={t - 10} s={1.4} /> });
export const S3 = close({ look: MO, set: 'study', faces: [[0, 'neutral'], [18, 'cool']], yaw: 0.25, extra: phoneIn('TIN SỐC!!!', 1, 1) });
export const S4 = room({ set: 'office', actors: [{ look: KHO, u: 0.36, w: 0.62, yaw: 0.4, faces: [[0, 'happy']], does: 'talk' }, { look: MO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'neutral']], does: 'shrug', at: 14 }], extra: (t) => <Pop x={720} y={240} t={t - 4} text="CHỐT NGAY ĐI!" size={52} /> });
export const S5 = room({ set: 'office', actors: [{ look: KHO, u: 0.36, w: 0.62, yaw: 0.4, faces: [[0, 'angry'], [30, 'neutral']], does: 'point' }, { look: MO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'cool']], does: 'talk', at: 12 }], extra: (t) => <Pop x={1180} y={240} t={t - 14} text="SAO ANH NGHĨ VẬY?" size={48} color={YELLOW} /> });
export const S109 = close({ look: KHO, set: 'office', faces: [[0, 'angry'], [12, 'neutral']], yaw: 0.25, extra: (t) => <FocusRings x={960} y={520} t={t - 8} r0={200} color="#FFE7B3" /> });
export const S6 = markCard('HỌ KHÔNG', 'Giỏi trả lời hơn bạn', false);
export const S7 = markCard('HỌ CHỈ', 'Giỏi hỏi hơn', true);
export const S8 = title({ lines: ['6 câu hỏi giúp bạn', 'không bị dắt mũi'], accent: '6 CÂU HỎI GIÚP BẠN' });
export const S9 = close({ look: HERO, set: 'study', faces: [[0, 'happy']], yaw: -0.2, extra: (t) => <Pop x={960} y={190} t={t - 4} text="CÁCH LUYỆN Ở CUỐI VIDEO" size={46} color={YELLOW} /> });

// ---- 02 Socrates ----
export const S10 = temple('ATHENS', 'HƠN 2.400 NĂM TRƯỚC');
export const S11 = markCard('ÔNG GIÀ ẤY', 'Không viết một cuốn sách nào', false);
export const S12 = street({ mopeds: [520], actors: [{ look: KHACH, x: 760, yaw: 0.4, faces: [[0, 'neutral'], [16, 'worried']] }, { look: BANHMI, x: 1000, yaw: 0, faces: [[0, 'neutral']], does: 'think', at: 10 }, { look: LAOCONG, x: 1220, yaw: -0.4, faces: [[0, 'oops']] }], extra: (t) => <><Pop x={700} y={220} t={t - 4} text="VÌ SAO?" color={YELLOW} /><Pop x={1000} y={160} t={t - 12} text="LÀ GÌ?" color={YELLOW} /><Pop x={1180} y={260} t={t - 20} text="CHẮC KHÔNG?" color={YELLOW} size={50} /></> });
export const S13 = close({ look: KHACH, set: 'street', faces: [[0, 'smug'], [14, 'oops'], [30, 'worried']], yaw: 0.2, tilt: [[0, 0], [14, -6], [30, 6]], extra: (t) => <Pop x={960} y={190} t={t - 18} text="Ờ... THÌ..." /> });
export const S14 = nameCard({ name: 'Socrates', role: 'triết gia Hy Lạp cổ đại', year: 'KHOẢNG 470 - 399 TCN' });
export const S15 = BigQ('CÔNG CỤ TƯ DUY');
export const S16 = close({ look: HERO, set: 'study', faces: [[0, 'neutral'], [10, 'happy']], yaw: 0.2, extra: (t) => <Sparkle x={1260} y={300} t={t - 10} s={1.4} /> });

// ---- 03 hai kiểu người ----
export const S17 = TwoKinds;
export const S18 = room({ set: 'office', actors: [{ look: KHO, u: 0.36, w: 0.62, yaw: 0.4, faces: [[0, 'smug']], does: 'point' }, { look: HERO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'happy']], does: 'nod', at: 8 }], extra: (t) => <Pop x={1200} y={250} t={t - 10} text="ĐÚNG ĐÚNG!" /> });
export const S19 = close({ look: MO, set: 'office', faces: [[0, 'neutral']], yaw: -0.25, tilt: [[0, 0], [20, 6]], extra: (t) => <><FocusRings x={960} y={520} t={t - 6} r0={200} color="#FFE7B3" /><Pop x={960} y={190} t={t - 10} text="KHOAN ĐÃ..." color={YELLOW} /></> });
export const S110 = close({ look: MO, set: 'office', faces: [[0, 'cool']], yaw: 0.2, extra: (t) => <QMark x={1290} y={300} s={0.55} t={t - 4} /> });
export const S20 = markCard('KIỂU 1', 'Sống bằng câu trả lời của người khác', false);
export const S21 = markCard('KIỂU 2', 'Tự tìm câu trả lời của mình', true);
export const S22 = sixQ(0);

// ---- 04 câu 1: ý bạn chính xác là gì ----
export const S23 = sixQ(1);
export const S24 = room({ set: 'office', actors: [{ look: SEP, u: 0.45, w: 0.36, yaw: 0.4, faces: [[0, 'smug']], does: 'point' }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'neutral'], [16, 'worried']] }], extra: (t) => <Pop x={860} y={170} t={t - 6} text="LÀM CHO CHUYÊN NGHIỆP HƠN!" size={40} /> });
export const S25 = close({ look: HERO, set: 'office', faces: [[0, 'oops']], yaw: 0.2, extra: (t) => <Pop x={960} y={190} t={t - 6} text="ĐỔI PHÔNG... ĐỔI MÀU..." size={48} /> });
export const S26 = room({ set: 'office', actors: [{ look: SEP, u: 0.45, w: 0.36, yaw: 0.4, faces: [[0, 'angry']] }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'tired']], does: 'slump' }], extra: (t) => <><Paper x={1180} y={830} w={150} rot={12} done={false} /><Pop x={760} y={200} t={t - 2} text="LÀM LẠI!" color={RED} size={64} /></> });
export const S27 = room({ set: 'office', actors: [{ look: SEP, u: 0.45, w: 0.36, yaw: 0.4, faces: [[0, 'neutral'], [26, 'happy']], does: 'nod', at: 26 }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'happy']], does: 'talk' }], extra: (t) => <Pop x={960} y={170} t={t - 8} text="ANH MUỐN SỬA CHỖ NÀO Ạ?" size={42} color={YELLOW} /> });
export const S28 = card('CỤ THỂ LÀ', ['Số liệu?', 'Bố cục?', 'Trình bày?']);
export const S29 = card('MỘT CÂU HỎI', ['Đỡ ba lần', 'làm lại'], { ok: true });
export const S30 = room({ set: 'office', cam: [960, 560, 1.1, 1.16], actors: [{ look: KHO, u: 0.35, w: 0.62, yaw: 0.4, faces: [[0, 'angry']], does: 'point' }, { look: MO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'angry']], does: 'point', at: 8 }], extra: (t) => <><Pop x={700} y={230} t={t - 4} text="ĐẸP LÀ ĐƯỢC!" /><Pop x={1220} y={230} t={t - 12} text="ĐÚNG SỐ CƠ!" color={YELLOW} /></> });

// ---- 05 câu 2: mặc định ----
export const S31 = sixQ(2);
export const S32 = close({ look: HERO, set: 'bedroom', faces: [[0, 'happy']], yaw: 0.25, extra: (t) => <>{phoneIn('ĐÃ GỬI 8:00')(t)}<Pop x={960} y={190} t={t - 8} text="ĐI CÀ PHÊ KHÔNG?" size={48} /></> });
export const S33 = close({ look: HERO, set: 'bedroom', faces: [[0, 'neutral'], [16, 'worried']], yaw: 0.25, dark: 0.45, extra: (t) => <>{phoneIn('21:00 · CHƯA XEM')(t)}<Pop x={960} y={190} t={t - 8} text="21:00 · VẪN IM LẶNG" size={48} /></> });
export const S34 = close({ look: HERO, set: 'bedroom', faces: [[0, 'angry']], yaw: -0.2, dark: 0.45, tilt: [[0, 0], [12, -6]], extra: (t) => <Pop x={960} y={190} t={t - 4} text="NÓ GIẬN MÌNH?" color={RED} /> });
export const S35 = close({ look: HERO, set: 'bedroom', faces: [[0, 'worried']], yaw: 0.2, dark: 0.5, extra: (t) => <Pop x={960} y={190} t={t - 2} text="COI THƯỜNG MÌNH?" color={RED} /> });
export const S36 = rule({ label: 'GIẢ ĐỊNH', text: 'Không trả lời nghĩa là giận?' });
export const S37 = close({ look: HERO, set: 'bedroom', faces: [[0, 'neutral']], yaw: 0.3, tilt: [[0, 0], [16, 8]], extra: (t) => <Pop x={960} y={190} t={t - 4} text="CHẮC KHÔNG?" color={YELLOW} size={64} /> });
export const S38 = close({ look: MO, set: 'office', faces: [[0, 'oops']], yaw: -0.25, extra: (t) => <>{phoneIn('', 0)(t)}<Pop x={960} y={190} t={t - 8} text="QUÊN SẠC PIN!" /></> });
export const S39 = iceberg(0);
export const S40 = iceberg(1);

// ---- 06 câu 3: dựa vào đâu ----
export const S41 = sixQ(3);
export const S42 = viralPost(0);
export const S43 = viralPost(1);
export const S44 = markCard('LƯỢT CHIA SẺ', 'Không phải bằng chứng', false);
export const S45 = close({ look: HERO, set: 'study', faces: [[0, 'neutral']], yaw: 0.25, tilt: [[0, 0], [14, 6]], extra: (t) => <Pop x={960} y={190} t={t - 4} text="AI NÓI ĐIỀU NÀY?" color={YELLOW} /> });
export const S46 = close({ look: HERO, set: 'study', faces: [[0, 'cool']], yaw: -0.2, extra: (t) => <Pop x={960} y={190} t={t - 2} text="NGHIÊN CỨU NÀO?" color={YELLOW} /> });
export const S47 = close({ look: HERO, set: 'study', faces: [[0, 'smug']], yaw: 0.15, extra: (t) => <Pop x={960} y={190} t={t - 2} text="AI ĐƯỢC LỢI?" color={YELLOW} size={64} /> });
export const S48 = markCard('NGƯỜI BỊ DẮT MŨI', 'Không phải kém thông minh', false);
export const S49 = rule({ label: 'HỌ CHỈ QUÊN HỎI', text: 'Dựa vào đâu?', color: YELLOW });

// ---- 07 câu 4: người kia thấy gì ----
export const S50 = sixQ(4);
export const S51 = close({ look: ME, set: 'kitchen', faces: [[0, 'worried']], yaw: 0.25, extra: (t) => <>{phoneIn('GỌI CON')(t)}<Pop x={900} y={190} t={t - 8} text="NHỚ MẶC ÁO ẤM NHA!" size={48} /></> });
export const S52 = close({ look: HERO, set: 'office', faces: [[0, 'tired'], [10, 'angry']], yaw: -0.2, extra: (t) => <>{phoneIn('MẸ (3)', 1, 1)(t)}<Pop x={900} y={190} t={t - 10} text="CON LỚN RỒI MÀ!" color={RED} /></> });
export const S53 = close({ look: ME, set: 'kitchen', faces: [[0, 'worried']], yaw: -0.25, dark: 0.35, extra: (t) => <Pop x={960} y={190} t={t - 4} text="TIN BÃO KHẨN CẤP" color={RED} size={52} /> });
export const S54 = close({ look: ME, set: 'kitchen', faces: [[0, 'worried'], [20, 'love']], yaw: 0.2, tilt: [[0, 0], [20, 8]], extra: (t) => <Pop x={960} y={190} t={t - 6} text="CON Ở XA..." size={52} /> });
export const S55 = sixNine(0);
export const S56 = sixNine(1);

// ---- 08 câu 5: rồi sau đó thì sao ----
export const S57 = sixQ(5);
export const S58 = room({ set: 'office', actors: [{ look: SEP, u: 0.45, w: 0.36, yaw: 0.4, faces: [[0, 'angry']], does: 'point' }, { look: MO, u: 0.3, w: 0.62, yaw: 0.3, faces: [[0, 'oops']] }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'worried']], does: 'slump' }] });
export const S59 = close({ look: HERO, set: 'office', faces: [[0, 'angry']], yaw: 0.2, dark: 0.4, extra: (t) => <Pop x={960} y={190} t={t - 4} text="MAI NGHỈ VIỆC!" color={RED} size={60} /> });
export const S60 = close({ look: HERO, set: 'bedroom', faces: [[0, 'neutral']], yaw: -0.25, tilt: [[0, 0], [16, 6]], extra: (t) => <Pop x={960} y={190} t={t - 4} text="NGHỈ RỒI THÌ SAO?" color={YELLOW} /> });
export const S61 = card('THÁNG SAU', ['Tiền nhà', 'lấy đâu ra?']);
export const S62 = room({ set: 'office', actors: [{ look: KHACH, u: 0.45, w: 0.36, yaw: 0.4, faces: [[0, 'neutral']], does: 'talk' }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'oops']] }], extra: (t) => <Pop x={820} y={190} t={t - 6} text="SAO BẠN NGHỈ CHỖ CŨ?" size={46} /> });
export const S63 = dominoes(0);
export const S64 = dominoes(1);
export const S65 = close({ look: HERO, set: 'office', faces: [[0, 'cool']], yaw: 0.2, extra: (t) => <Sparkle x={1260} y={300} t={t - 8} s={1.4} /> });

// ---- 09 câu 6: hỏi đúng câu ----
export const S66 = sixQ(6);
export const S67 = close({ look: HERO, set: 'study', faces: [[0, 'worried']], yaw: 0.25, extra: (t) => <Pop x={960} y={190} t={t - 4} text="LÀM SAO KIẾM THÊM TIỀN?" size={46} /> });
export const S68 = close({ look: HERO, set: 'study', faces: [[0, 'tired']], yaw: -0.2, dark: 0.55, extra: (t) => <Pop x={960} y={190} t={t - 4} text="23:00 · VẪN LÀM" size={52} /> });
export const S69 = close({ look: HERO, set: 'study', faces: [[0, 'shock']], yaw: 0.1, extra: (t) => <Pop x={960} y={190} t={t - 4} text="CUỐI THÁNG: HẾT SẠCH!" color={RED} size={48} /> });
export const S70 = rule({ label: 'CÂU HỎI ĐÚNG', text: 'Tiền của mình đang đi đâu?', color: YELLOW });
export const S71 = markCard('HỎI SAI CÂU', 'Giải bài toán không có thật', false);
export const S72 = KeyLock;

// ---- 10 cái bẫy ----
export const S73 = close({ look: HERO, set: 'office', faces: [[0, 'shock']], yaw: 0, dark: 0.55, push: 0.1 });
export const S74 = card('DÙNG SAI', ['Thành tra hỏi'], { color: RED });
export const S75 = room({ set: 'office', actors: [{ look: HERO, u: 0.35, w: 0.62, yaw: 0.4, faces: [[0, 'smug']], does: 'point' }, { look: MO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'worried']], does: 'slump', at: 10 }], extra: (t) => <Pop x={700} y={230} t={t - 8} text="THẤY CHƯA, SAI RỒI!" size={46} color={RED} /> });
export const S76 = close({ look: MO, set: 'office', faces: [[0, 'angry']], yaw: -0.3, extra: (t) => <Mark x={1360} y={300} t={t - 6} ok={false} s={1.1} /> });
export const S77 = markCard('HỎI KHÔNG PHẢI', 'Để thắng', false);
export const S78 = markCard('MÀ LÀ', 'Để cùng hiểu rõ hơn', true);
export const S79 = rule({ label: 'KHÁC NHAU Ở', text: 'Giọng nói' });
export const S80 = room({ set: 'office', actors: [{ look: HERO, u: 0.35, w: 0.62, yaw: 0.4, faces: [[0, 'happy']], does: 'talk' }, { look: MO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'neutral'], [14, 'happy']], does: 'nod', at: 14 }], extra: (t) => <><Pop x={720} y={190} t={t - 2} text="THẨM VẤN" color={RED} size={52} /><Pop x={1220} y={250} t={t - 14} text="TÒ MÒ" color={YELLOW} size={60} /></> });

// ---- 11 trích Socrates ----
export const S81 = temple('24 THẾ KỶ', 'MỘT CÂU NÓI');
export const S82 = quote({ text: 'Tôi chỉ biết một điều: tôi không biết gì cả.', by: 'câu nói gắn với Socrates' });
export const S83 = close({ look: HERO, set: 'study', faces: [[0, 'neutral'], [14, 'smug']], yaw: 0.2, extra: (t) => <Pop x={960} y={190} t={t - 6} text="KHIÊM TỐN?" /> });
export const S84 = rule({ label: 'VŨ KHÍ', text: 'Thừa nhận mình chưa biết' });
export const S85 = close({ look: KHO, set: 'office', faces: [[0, 'smug']], yaw: 0.25, extra: (t) => <><Pop x={900} y={190} t={t - 4} text="TÔI BIẾT HẾT RỒI" /><Mark x={1360} y={320} t={t - 16} ok={false} s={1} /></> });

// ---- 12 cách luyện 1 ----
export const S86 = title({ lines: ['Vậy luyện', 'thế nào?'], accent: 'THẾ NÀO?' });
export const S87 = rule({ label: 'CÁCH 1', text: 'Luật ba giây' });
export const S88 = close({ look: HERO, set: 'study', faces: [[0, 'shock'], [20, 'neutral']], yaw: 0.25, extra: phoneIn('TIN SỐC!!!', 1, 1) });
export const S89 = Countdown;
export const S90 = rule({ label: 'HỎI ĐÚNG MỘT CÂU', text: 'Dựa vào đâu?', color: YELLOW });
export const S91 = close({ look: HERO, set: 'study', faces: [[0, 'cool']], yaw: -0.2, extra: (t) => <><Sparkle x={1260} y={300} t={t - 6} s={1.3} /><Pop x={960} y={190} t={t - 8} text="THÀNH PHẢN XẠ" color={YELLOW} /></> });

// ---- 13 cách luyện 2 ----
export const S92 = card('CÁCH 2', ['Mười phút', 'mỗi tối']);
export const S93 = close({ look: HERO, set: 'study', faces: [[0, 'neutral']], yaw: 0.25, dark: 0.3, extra: (t) => <Paper x={1280} y={kf(t, [[0, 1100], [10, 780]], easeOut)} w={200} rot={-8} done={false} /> });
export const S94 = card('MÌNH TIN CHẮC', ['Mình không hợp', 'với việc này'], { color: SCH.dim });
export const S95 = close({ look: HERO, set: 'study', faces: [[0, 'neutral'], [10, 'cool']], yaw: 0.2, dark: 0.3, extra: (t) => <Pop x={960} y={190} t={t - 4} text="HỎI NÓ ĐỦ 6 CÂU" color={YELLOW} /> });
export const S111 = sixList(2);
export const S96 = sixList(4);
export const S97 = sixList(6);
export const S98 = close({ look: HERO, set: 'study', faces: [[0, 'shock'], [14, 'oops']], yaw: 0.2, tilt: [[0, -4], [8, 4], [16, -4], [24, 0]], extra: (t) => <Pop x={960} y={190} t={t - 6} text="LUNG LAY Ở CÂU 3!" color={YELLOW} size={52} /> });

// ---- 14 cách luyện 3 ----
export const S99 = card('CÁCH 3', ['Hỏi trước', 'khi cãi']);
export const S100 = room({ set: 'office', actors: [{ look: KHO, u: 0.36, w: 0.62, yaw: 0.4, faces: [[0, 'smug']], does: 'talk' }, { look: HERO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'neutral'], [14, 'angry']] }], extra: (t) => <Pop x={720} y={230} t={t - 4} text="LÀM VẬY LÀ SAI!" size={50} /> });
export const S101 = close({ look: HERO, set: 'office', faces: [[0, 'angry'], [12, 'cool']], yaw: -0.2, extra: (t) => <Mark x={1360} y={300} t={t - 4} ok={false} s={1} /> });
export const S102 = room({ set: 'office', actors: [{ look: KHO, u: 0.36, w: 0.62, yaw: 0.4, faces: [[0, 'neutral']], does: 'think', at: 16 }, { look: HERO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'happy']], does: 'talk' }], extra: (t) => <Pop x={960} y={170} t={t - 6} text="SAO BẠN LẠI NGHĨ VẬY?" size={42} color={YELLOW} /> });
export const S103 = room({ set: 'office', actors: [{ look: KHO, u: 0.36, w: 0.62, yaw: 0.4, faces: [[0, 'happy']], does: 'talk' }, { look: HERO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'happy']], does: 'nod', at: 8 }], extra: (t) => <Mark x={960} y={260} t={t - 10} ok s={1} /> });
export const S104 = close({ look: KHO, set: 'office', faces: [[0, 'neutral'], [12, 'oops']], yaw: 0.25, extra: (t) => <><FocusRings x={960} y={520} t={t - 10} r0={200} color="#FFE7B3" /><Pop x={960} y={190} t={t - 14} text="Ờ... CŨNG CHƯA CHẮC" size={48} /></> });
export const S105 = close({ look: HERO, set: 'office', faces: [[0, 'smug']], yaw: -0.2 });

// ---- 15 cuốn sách ----
export const S106 = iceberg(2);
export const S107 = bookShot(BOOK, 'ĐỂ LUYỆN KỸ HƠN');
const S108c = close({ look: HERO, set: 'study', faces: [[0, 'happy']], yaw: -0.2, extra: (t) => <Sparkle x={1300} y={420} t={t - 14} s={1.3} /> });
export const S108: React.FC<ShotProps> = (p) => (
  <g>
    <S108c {...p} />
    <SvgBook b={BOOK} x={1230} y={kf(p.t, [[0, 1200], [12, 760]], easeOut)} w={260} rot={8} />
  </g>
);
export const S112 = sixQ(0, 'Tự tập mỗi ngày');

// ---- 16 đúc kết (không có thẻ CTA) ----
export const S113 = close({ look: HERO, set: 'rooftop', faces: [[0, 'neutral'], [12, 'smug']], yaw: 0.15, push: 0.08 });
export const S114 = title({ lines: ['Không khôn nhờ', 'câu trả lời'], accent: 'CÂU TRẢ LỜI' });
export const S115 = title({ lines: ['Mà khôn nhờ', 'hỏi đúng câu'], accent: 'HỎI ĐÚNG CÂU' });

// ---- kéo bình luận: tò mò ở đầu, câu hỏi tự soi ở giữa, hỏi lại ở cuối ----
export const S116 = BigQ('CÂU THỨ 6');
export const S117 = close({ look: HERO, set: 'office', faces: [[0, 'neutral'], [12, 'smug']], yaw: 0.25, tilt: [[0, 0], [16, 6]], extra: (t) => <Pop x={960} y={190} t={t - 4} text="BẠN LÀ KIỂU NÀO?" color={YELLOW} size={60} /> });
export const S118 = close({ look: HERO, set: 'office', faces: [[0, 'smug']], yaw: -0.2, extra: (t) => <Pop x={960} y={190} t={t - 4} text="CUỐI VIDEO HỎI LẠI NHÉ" size={46} /> });
const S119r = room({ set: 'office', cam: [960, 560, 1.12, 1.18], actors: [{ look: KHO, u: 0.35, w: 0.62, yaw: 0.3, faces: [[0, 'happy']], does: 'nod' }, { look: MO, u: 0.68, w: 0.62, yaw: -0.3, faces: [[0, 'cool']], does: 'think', at: 8 }] });
export const S119: React.FC<ShotProps> = (p) => (
  <g>
    <S119r {...p} />
    <Pop x={700} y={200} t={p.t - 4} text="KIỂU 1?" size={60} />
    <Pop x={1220} y={200} t={p.t - 12} text="KIỂU 2?" color={YELLOW} size={60} />
  </g>
);
export const S120 = close({ look: HERO, set: 'bedroom', faces: [[0, 'neutral'], [16, 'oops']], yaw: 0.25, tilt: [[0, 0], [20, 8]], extra: (t) => <Pop x={960} y={190} t={t - 6} text="LẦN GẦN NHẤT BẠN TIN SAI?" size={44} color={YELLOW} /> });
const S121 = close({ look: HERO, set: 'study', faces: [[0, 'happy']], yaw: -0.2, extra: (t) => <>{phoneIn('BÌNH LUẬN')(t)}<Pop x={900} y={190} t={t - 4} text="KỂ MÌNH NGHE NHÉ" color={YELLOW} size={56} /></> });
export const S122 = street({ mopeds: [540], actors: [{ look: HERO, x: 800, yaw: 0.5, faces: [[0, 'happy']], does: 'talk' }, { look: MO, x: 1160, yaw: -0.4, faces: [[0, 'worried'], [18, 'happy']], does: 'think', at: 6 }], extra: (t) => <Pop x={1120} y={300} t={t - 10} text="SẮP QUYẾT ĐỊNH LỚN?" size={46} /> });
export const S123 = close({ look: MO, set: 'street', faces: [[0, 'neutral'], [14, 'oops']], yaw: 0.25, extra: (t) => <Pop x={960} y={190} t={t - 6} text="HỎI SAI MÀ KHÔNG BIẾT" size={50} color={RED} /> });
export const S124 = close({ look: HERO, set: 'study', faces: [[0, 'oops'], [30, 'happy']], yaw: -0.2, extra: (t) => <>{phoneIn('BÌNH LUẬN')(t - 28)}<Pop x={960} y={190} t={t - 2} hold={30} text="ĐÓ LÀ CHUYỆN GÌ?" color={YELLOW} size={56} /><Pop x={900} y={190} t={t - 32} text="KỂ MÌNH NGHE NHÉ" color={YELLOW} size={56} /></> });
