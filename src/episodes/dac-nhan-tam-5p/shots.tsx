import React from 'react';
import { ShotProps, BookInfo, SvgBook, PlantIcon, Paper } from '../../engine';
import ep from './episode.json';
import {
  HERO, SEP, MO, KHO, BAOVE, BANHMI, LAOCONG, KHACH, THUCTAP, HANGXOM, BUUDIEN, YELLOW, RED,
  close, room, street, rule, quote, fact, nameCard, title, bookShot, calendar, Pop, Mark,
  Sparkle, FocusRings, Glow, kf, clamp, easeOut, backOut, SCH, SchLabel, Schematic, FONT,
} from './kit';

// "30 ngày sống theo Đắc Nhân Tâm", about 5 minutes, 121 shots. Most shots are built from the kit; the few
// one-off pictures (Lincoln's letter, the fishing hook, the steel works sign) are drawn here.

const BOOK = ep.book as unknown as BookInfo;

// ---------- one-off pictures ----------
/** Lincoln's letter: handwriting drawing on, then (stage 1) a red stamp, (stage 2) aged among old papers. */
const letter = (stage: 0 | 1 | 2): React.FC<ShotProps> => {
  const L: React.FC<ShotProps> = ({ t, len }) => {
    const age = stage === 2 ? 1 : 0;
    const write = stage === 0 ? clamp(t / Math.max(20, len - 6)) : 1;
    return (
      <g transform={`translate(960 560) scale(${kf(t, [[0, 1], [len, 1.06]])}) translate(-960 -560)`}>
        <rect x={-100} y={-100} width={2120} height={1280} fill={age ? '#2A2018' : '#3A2C22'} />
        <Glow x={960} y={500} r={700} o={0.4} />
        {age ? [0, 1, 2].map((i) => <rect key={i} x={560 + i * 30} y={180 + i * 20} width={780} height={820} fill="#CDBB95" transform={`rotate(${-8 + i * 7} 960 600)`} opacity={0.8} />) : null}
        <g transform="rotate(-3 960 560)">
          <rect x={600} y={140} width={720} height={860} fill={age ? '#E2CFA4' : '#F2E8D2'} />
          <text x={660} y={240} fontFamily={FONT.hand} fontSize={52} fill="#2A2238" opacity={clamp(write * 5)}>Gửi tướng Meade,</text>
          {Array.from({ length: 9 }).map((_, i) => {
            const k = clamp(write * 10 - 1 - i);
            const w = 520 - (i % 3) * 60;
            return k > 0 ? <path key={i} d={`M 660 ${310 + i * 62} q 40 -14 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0`} stroke="#2A2238" strokeWidth={5} fill="none" strokeDasharray={w} strokeDashoffset={w * (1 - k)} /> : null;
          })}
          <text x={1180} y={930} textAnchor="end" fontFamily={FONT.hand} fontSize={52} fill="#2A2238" opacity={clamp(write * 10 - 9)}>A. Lincoln</text>
        </g>
        {stage >= 1 ? (
          <g transform={`translate(960 560) rotate(-14) scale(${stage === 1 ? 1 + 0.6 * (1 - backOut(clamp((t - 6) / 7))) : 1})`} opacity={stage === 1 ? clamp((t - 6) / 3) : 0.55}>
            <rect x={-330} y={-80} width={660} height={160} rx={14} fill="none" stroke={RED} strokeWidth={14} />
            <text y={40} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={110} fill={RED}>KHÔNG GỬI</text>
          </g>
        ) : null}
        {stage === 2 ? <SchLabel x={960} y={110} t={t - 4} text="TÌM THẤY SAU KHI ÔNG MẤT" size={44} color="#FFE7B3" /> : null}
      </g>
    );
  };
  return L;
};

/** The fishing lesson: 0 strawberries and cream, 1 strawberries on the hook (no), 2 a worm on the hook and a fish (yes). */
const fishing = (stage: 0 | 1 | 2): React.FC<ShotProps> => {
  const F: React.FC<ShotProps> = ({ t }) => {
    const bob = Math.sin(t * 0.25) * 10;
    const Straw = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M 0 -40 Q 40 -40 34 4 Q 26 40 0 54 Q -26 40 -34 4 Q -40 -40 0 -40 Z" fill="#E0413A" />
        <path d="M -18 -42 L 0 -56 L 18 -42 L 6 -36 L 0 -46 L -6 -36 Z" fill="#4E9A4A" />
        {[[-12, -10], [10, -6], [-4, 12], [14, 20], [-16, 22]].map(([a, b], i) => <ellipse key={i} cx={a} cy={b} rx={2.5} ry={4} fill="#FFE27A" />)}
      </g>
    );
    return (
      <g>
        <Schematic t={t + 30} id={`fish${stage}`} />
        {stage === 0 ? (
          <g transform={`translate(960 600) scale(${backOut(clamp(t / 9))})`}>
            <path d="M -260 0 Q -240 200 0 210 Q 240 200 260 0 Z" fill="#E8E2D6" />
            <ellipse cx={0} cy={0} rx={260} ry={60} fill="#F7F3EA" />
            <Straw x={-110} y={-30} s={1.6} />
            <Straw x={20} y={-50} s={1.8} />
            <Straw x={140} y={-20} s={1.5} />
            <ellipse cx={20} cy={-10} rx={130} ry={40} fill="#FFFFFF" opacity={0.9} />
            <SchLabel x={0} y={330} t={t - 8} text="CARNEGIE THÍCH" size={52} color={SCH.live} />
          </g>
        ) : (
          <g>
            <path d={`M 960 0 L 960 ${470 + bob}`} stroke="#E8E2D6" strokeWidth={4} />
            <path d={`M 960 ${470 + bob} L 960 ${560 + bob} Q 960 ${620 + bob} 910 ${610 + bob} Q 880 ${600 + bob} 890 ${570 + bob}`} stroke="#C9CED8" strokeWidth={10} fill="none" strokeLinecap="round" />
            {stage === 1 ? <Straw x={935} y={575 + bob} s={1.2} /> : (
              <path d={`M 900 ${560 + bob} q 20 -30 40 0 t 40 0 t 30 20`} stroke="#D98A7A" strokeWidth={22} fill="none" strokeLinecap="round" />
            )}
            {/* water and a fish */}
            <rect x={-100} y={700} width={2120} height={500} fill="#1E4A6A" opacity={0.6} />
            <g transform={`translate(${stage === 2 ? kf(t, [[0, 1400], [20, 1080]], easeOut) : 1500} ${790 + Math.sin(t * 0.3) * 8}) scale(${stage === 2 ? -1 : 1} 1)`}>
              <ellipse cx={0} cy={0} rx={110} ry={56} fill="#E9A24A" />
              <path d="M 100 0 L 170 -50 L 170 50 Z" fill="#E9A24A" />
              <circle cx={-60} cy={-12} r={10} fill="#1A1420" />
            </g>
            <Mark x={1250} y={420} t={t - 8} ok={stage === 2} s={1.2} />
            <SchLabel x={960} y={1000} t={t - 4} text={stage === 1 ? 'MÓC DÂU TÂY?' : 'CÁ THÍCH GIUN'} size={52} color={SCH.line} />
          </g>
        )}
      </g>
    );
  };
  return F;
};

/** The steel works sign: a factory and the railroad president's name on it. */
const SteelWorks: React.FC<ShotProps> = ({ t }) => (
  <g>
    <Schematic t={t + 50} id="steel" />
    <Glow x={960} y={480} r={520} o={0.3} />
    <PlantIcon x={960} y={430} kind="factory" on={1} t={t} s={2.6} />
    <g transform={`translate(960 700) scale(${backOut(clamp((t - 6) / 8))})`}>
      <rect x={-560} y={-70} width={1120} height={130} rx={10} fill="#0B0816" stroke={YELLOW} strokeWidth={6} />
      <text y={22} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={58} fill={YELLOW}>EDGAR THOMSON STEEL WORKS</text>
    </g>
    <SchLabel x={960} y={860} t={t - 16} text="TÊN CHỦ TỊCH CÔNG TY ĐƯỜNG SẮT" size={44} color={SCH.dim} />
  </g>
);

/** A rule card with a mark over it: what it is not (or is). */
const markCard = (label: string, text: string, ok: boolean): React.FC<ShotProps> => {
  const R = rule({ label, text, color: ok ? undefined : SCH.dim });
  const M: React.FC<ShotProps> = (p) => (
    <g>
      <R {...p} />
      <Mark x={1360} y={330} t={p.t - 10} ok={ok} s={1.2} />
    </g>
  );
  return M;
};

const salary = (v: number) => '$' + new Intl.NumberFormat('en-US').format(Math.round(v));

// ======================================================================= the shots
// ---- 01 hook ----
export const S1 = close({ look: HERO, set: 'office', faces: [[0, 'neutral'], [16, 'smug']], tilt: [[0, 0], [20, 6]] });
export const S2 = bookShot(BOOK, 'VIẾT TỪ NĂM 1936');
export const S3 = room({ set: 'office', cam: [960, 560, 1.15, 1.22], actors: [{ look: MO, u: 0.4, w: 0.62, yaw: 0.4, faces: [[0, 'oops']], does: 'shrug' }, { look: HERO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'happy']], does: 'nod' }], extra: (t) => <Paper x={760} y={830} w={150} rot={-14} done={false} /> });
export const S4 = street({ mopeds: [520, 760], actors: [{ look: HERO, x: 820, yaw: 0.5, faces: [[0, 'happy']], does: 'wave' }, { look: BAOVE, x: 1180, yaw: -0.4, faces: [[0, 'neutral'], [10, 'happy']] }], extra: (t) => <Pop x={820} y={330} t={t - 6} text="CHÀO BÁC TƯ!" /> });
export const S5 = room({ set: 'office', cam: [960, 560, 1.1, 1.16], actors: [{ look: MO, u: 0.35, w: 0.62, yaw: 0.4, faces: [[0, 'angry']], does: 'point' }, { look: HERO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'cool']], does: 'shrug', at: 8 }] });
export const S6 = close({ look: HERO, set: 'office', faces: [[0, 'cool']], yaw: -0.2 });
export const S7 = calendar(0, 29);
export const S8 = title({ lines: ['30 ngày sống theo', 'Đắc Nhân Tâm'], accent: 'ĐẮC NHÂN TÂM' });

// ---- 02 ngày 1: không chỉ trích ----
export const S9 = calendar(0, 0);
export const S10 = rule({ label: 'PHẦN 1 · NGUYÊN TẮC 1', text: 'Không chỉ trích, không oán trách, không than phiền' });
export const S11 = room({ set: 'office', day: 1, actors: [{ look: SEP, u: 0.47, w: 0.36, yaw: 0.45, faces: [[0, 'smug']], does: 'point' }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'neutral'], [8, 'worried']] }] });
export const S12 = close({ look: HERO, set: 'office', faces: [[0, 'angry'], [10, 'shock'], [28, 'neutral']], yaw: -0.3, tilt: [[0, -4], [10, 4], [28, 0]] });
export const S13 = room({ set: 'office', actors: [{ look: MO, u: 0.4, w: 0.62, yaw: 0.5, faces: [[0, 'oops']], walkFrom: 300 }, { look: HERO, u: 0.72, w: 0.6, yaw: -0.5, faces: [[0, 'neutral']] }], extra: (t) => <Pop x={700} y={260} t={t - 16} text="XIN LỖI, TẮC ĐƯỜNG!" size={48} /> });
export const S14 = close({ look: HERO, set: 'office', faces: [[0, 'neutral']], yaw: 0.1, push: 0.08 });
export const S15 = close({ look: HERO, set: 'office', faces: [[0, 'worried'], [16, 'tired']], yaw: 0.3, tilt: [[0, 0], [20, -8]] });
export const S16 = quote({ text: 'Chỉ trích chỉ khiến người ta phòng thủ, và tìm cách bào chữa cho mình.', by: 'ý trong Đắc Nhân Tâm' });

// ---- 03 Lincoln ----
export const S17 = bookShot(BOOK, 'CHUYỆN THẬT TRONG SÁCH');
export const S18 = nameCard({ name: 'Gettysburg', role: 'trận đánh, nội chiến Mỹ', year: '1863' });
export const S19 = letter(0);
export const S20 = letter(1);
export const S21 = letter(2);
export const S22 = quote({ text: 'Một lời trách nặng chẳng sửa được gì, chỉ làm mất đi một người.', by: 'bài học của Lincoln' });

// ---- 04 ngày 3: khen thật lòng ----
export const S23 = calendar(1, 2);
export const S24 = rule({ label: 'PHẦN 1 · NGUYÊN TẮC 2', text: 'Khen thật lòng và chân thành' });
export const S25 = room({ set: 'office', actors: [{ look: SEP, u: 0.5, w: 0.36, yaw: 0.2, faces: [[0, 'smug']] }, { look: MO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'happy']], does: 'bow' }], extra: (t) => <Mark x={1360} y={300} t={t - 14} ok={false} s={1.1} /> });
export const S26 = close({ look: HERO, set: 'office', faces: [[0, 'happy']], extra: (t) => <Mark x={1360} y={300} t={t - 6} ok s={1.1} /> });
export const S27 = street({ mopeds: [480, 700, 1420], actors: [{ look: HERO, x: 820, yaw: 0.5, faces: [[0, 'happy']], does: 'talk' }, { look: BAOVE, x: 1160, yaw: -0.4, faces: [[0, 'neutral'], [18, 'happy']] }], extra: (t) => <Pop x={820} y={330} t={t - 10} text="XE XẾP ĐẸP QUÁ BÁC ƠI!" size={46} /> });
export const S28 = close({ look: BAOVE, set: 'street', faces: [[0, 'happy']], yaw: -0.2, tilt: [[0, 0], [10, 6], [20, 0]], extra: (t) => <Sparkle x={1280} y={300} t={t - 4} s={1.4} /> });
export const S29 = street({ mopeds: [560, 1000, 1240], actors: [{ look: BAOVE, x: 780, yaw: 0.4, faces: [[0, 'happy']], does: 'point' }, { look: HERO, x: 1160, yaw: -0.4, faces: [[0, 'shock'], [12, 'happy']], does: 'cheer', at: 12 }], extra: (t) => <Pop x={1000} y={680} t={t - 4} text="CHỖ MÁT NHẤT" color={YELLOW} size={44} /> });

// ---- 05 Schwab ----
export const S30 = nameCard({ name: 'Charles Schwab', role: 'nhà quản lý ngành thép Mỹ', year: '1921' });
export const S31 = fact({ top: 'LƯƠNG MỖI NĂM', to: 1000000, fmt: salary, bottom: 'HƠN MỘT TRIỆU ĐÔ' });
export const S32 = markCard('BÍ QUYẾT CỦA ÔNG?', 'Giỏi luyện thép nhất', false);
export const S33 = quote({ text: 'Khen ngợi thật hào phóng, và rất ngại chê bai.', by: 'Charles Schwab' });
export const S34 = room({ set: 'office', actors: [{ look: SEP, u: 0.45, w: 0.36, yaw: 0.4, faces: [[0, 'happy']], does: 'clap' }, { look: MO, u: 0.7, w: 0.6, yaw: -0.4, faces: [[0, 'happy']], does: 'cheer', at: 8 }] });
export const S35 = close({ look: MO, set: 'office', faces: [[0, 'worried']], yaw: 0.3, dark: 0.45, tilt: [[0, 0], [20, 8]] });

// ---- 06 khơi dậy mong muốn ----
export const S36 = rule({ label: 'PHẦN 1 · NGUYÊN TẮC 3', text: 'Khơi dậy mong muốn ở người khác' });
export const S37 = fishing(0);
export const S38 = fishing(1);
export const S39 = fishing(2);
export const S40 = room({ set: 'office', cam: [960, 560, 1.12, 1.2], actors: [{ look: HERO, u: 0.35, w: 0.62, yaw: 0.4, faces: [[0, 'happy']], does: 'talk' }, { look: MO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'neutral'], [14, 'happy']], does: 'nod', at: 14 }] });

// ---- 07 ngày 7: quan tâm, mỉm cười ----
export const S41 = calendar(5, 6);
export const S42 = rule({ label: 'PHẦN 2', text: 'Cách khiến người khác quý mến mình' });
export const S43 = close({ look: HERO, set: 'street', faces: [[0, 'neutral'], [12, 'happy']], extra: (t) => <Sparkle x={1250} y={320} t={t - 12} s={1.5} /> });
export const S44 = room({ set: 'shop', actors: [{ look: BANHMI, u: 0.42, w: 0.38, yaw: 0.3, faces: [[0, 'neutral'], [16, 'happy']] }, { look: HERO, u: 0.62, w: 0.6, yaw: -0.5, faces: [[0, 'happy']], does: 'talk' }] });
export const S45 = close({ look: BANHMI, set: 'shop', faces: [[0, 'happy']], yaw: 0.25, tilt: [[0, 0], [8, 5], [16, -3], [24, 4]] });
export const S46 = room({ set: 'shop', cam: [1000, 540, 1.15, 1.2], actors: [{ look: BANHMI, u: 0.42, w: 0.38, yaw: 0.3, faces: [[0, 'happy']], does: 'talk' }, { look: HERO, u: 0.62, w: 0.6, yaw: -0.5, faces: [[0, 'happy']], does: 'nod' }] });
export const S47 = room({ set: 'shop', actors: [{ look: BANHMI, u: 0.42, w: 0.38, yaw: 0.3, faces: [[0, 'happy']], does: 'wave' }, { look: HERO, u: 0.62, w: 0.6, yaw: -0.3, faces: [[0, 'happy']] }], extra: (t) => <Pop x={860} y={240} t={t - 14} text="NÓI CHUYỆN VỚI EM VUI GHÊ!" size={44} color={YELLOW} /> });

// ---- 08 ngày 10: nhớ tên ----
export const S48 = calendar(8, 9);
export const S49 = close({ look: HERO, set: 'office', faces: [[0, 'neutral']], yaw: 0.35, tilt: [[0, 0], [16, 8]] });
export const S50 = quote({ text: 'Tên của một người là âm thanh ngọt ngào và quan trọng nhất với chính họ.', by: 'Dale Carnegie' });
export const S51 = nameCard({ name: 'Andrew Carnegie', role: 'vua thép nước Mỹ', year: 'THẾ KỶ 19' });
export const S52 = SteelWorks;
export const S53 = room({ set: 'office', actors: [{ look: LAOCONG, u: 0.36, w: 0.62, yaw: 0.4, faces: [[0, 'neutral']] }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.4, faces: [[0, 'happy']], does: 'wave' }], extra: (t) => <Pop x={1240} y={240} t={t - 8} text="CHÀO CHỊ LAN!" /> });
export const S54 = close({ look: LAOCONG, set: 'office', faces: [[0, 'shock'], [12, 'happy']], yaw: 0.25, extra: (t) => <Sparkle x={1260} y={300} t={t - 12} s={1.4} /> });

// ---- 09 ngày 14: lắng nghe ----
export const S55 = calendar(12, 13);
export const S56 = rule({ label: 'PHẦN 2 · LẮNG NGHE', text: 'Khuyến khích người khác nói về chính họ' });
export const S57 = room({ set: 'office', actors: [{ look: KHACH, u: 0.5, w: 0.36, yaw: 0.2, faces: [[0, 'angry']] }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'neutral']] }] });
export const S58 = close({ look: HERO, set: 'office', faces: [[0, 'neutral']], yaw: -0.25, extra: (t) => <Mark x={1360} y={300} t={t - 6} ok={false} s={1.1} /> });
export const S59 = room({ set: 'office', cam: [1000, 520, 1.25, 1.3], actors: [{ look: KHACH, u: 0.5, w: 0.36, yaw: 0.3, faces: [[0, 'neutral'], [14, 'happy']] }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'happy']], does: 'talk' }] });
export const S60 = room({ set: 'office', actors: [{ look: KHACH, u: 0.5, w: 0.36, yaw: 0.3, faces: [[0, 'happy']], does: 'talk' }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'happy']], does: 'nod', at: 8 }], extra: (t) => <Pop x={960} y={160} t={t - 6} text="1 TIẾNG SAU..." color={YELLOW} /> });
export const S61 = room({ set: 'office', actors: [{ look: KHACH, u: 0.5, w: 0.36, yaw: 0.2, faces: [[0, 'happy']], does: 'point' }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'happy']], does: 'cheer', at: 12 }], extra: (t) => <Mark x={960} y={300} t={t - 8} ok s={1.1} /> });
export const S62 = close({ look: HERO, set: 'office', faces: [[0, 'smug']], yaw: 0.2 });

// ---- 10 ngày 16: làm người khác thấy mình quan trọng ----
export const S63 = calendar(14, 15);
export const S64 = rule({ label: 'PHẦN 2 · LUẬT CUỐI', text: 'Làm người khác thấy mình quan trọng' });
export const S65 = room({ set: 'shop', actors: [{ look: BUUDIEN, u: 0.45, w: 0.38, yaw: 0.2, faces: [[0, 'tired']], does: 'slump' }] });
export const S66 = room({ set: 'shop', actors: [{ look: BUUDIEN, u: 0.45, w: 0.38, yaw: 0.3, faces: [[0, 'tired']] }, { look: KHO, u: 0.62, w: 0.6, yaw: -0.5, faces: [[0, 'happy']], does: 'talk' }], extra: (t) => <Pop x={1220} y={230} t={t - 8} text="TÓC ANH ĐẸP THẬT!" /> });
export const S67 = close({ look: BUUDIEN, set: 'shop', faces: [[0, 'tired'], [10, 'shock'], [16, 'happy']], yaw: 0.25, tilt: [[0, 10], [10, 0]], extra: (t) => <Sparkle x={1250} y={290} t={t - 16} s={1.5} /> });
export const S68 = room({ set: 'shop', actors: [{ look: BUUDIEN, u: 0.45, w: 0.38, yaw: 0.3, faces: [[0, 'happy']], does: 'cheer' }, { look: KHO, u: 0.62, w: 0.6, yaw: 0.6, faces: [[0, 'happy']] }], extra: (t) => <><Sparkle x={860} y={300} t={t - 6} s={1.3} /><Sparkle x={1040} y={260} t={t - 10} s={1.0} /></> });

// ---- 11 ngày 18: tránh tranh cãi ----
export const S69 = calendar(16, 17);
export const S70 = rule({ label: 'PHẦN 3', text: 'Thuyết phục người khác' });
export const S71 = quote({ text: 'Cách duy nhất để thắng một cuộc tranh cãi là tránh nó.', by: 'Dale Carnegie' });
export const S72 = room({ set: 'office', cam: [960, 560, 1.1, 1.16], actors: [{ look: HERO, u: 0.35, w: 0.62, yaw: 0.4, faces: [[0, 'smug']], does: 'cheer' }, { look: MO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'worried']], does: 'slump' }] });
export const S73 = room({ set: 'office', actors: [{ look: SEP, u: 0.38, w: 0.36, yaw: 0.3, faces: [[0, 'angry']] }, { look: KHO, u: 0.6, w: 0.36, yaw: -0.2, faces: [[0, 'angry']] }, { look: HERO, u: 0.7, w: 0.64, yaw: -0.5, faces: [[0, 'neutral']], does: 'talk' }], extra: (t) => <Pop x={1240} y={250} t={t - 14} text="CÓ THỂ TÔI SAI..." /> });
export const S74 = room({ set: 'office', actors: [{ look: SEP, u: 0.38, w: 0.36, yaw: 0.3, faces: [[0, 'happy']], does: 'nod' }, { look: KHO, u: 0.6, w: 0.36, yaw: -0.2, faces: [[0, 'neutral'], [8, 'happy']], does: 'nod', at: 6 }, { look: HERO, u: 0.7, w: 0.64, yaw: -0.5, faces: [[0, 'happy']] }] });

// ---- 12 ngày 19: khiến người khác nói vâng ----
export const S75 = calendar(17, 18);
export const S76 = rule({ label: 'PHẦN 3 · NÓI VÂNG', text: 'Để người khác nói vâng ngay từ đầu' });
export const S77 = markCard('ĐỪNG MỞ ĐẦU BẰNG', 'Điểm bất đồng', false);
export const S78 = markCard('HÃY BẮT ĐẦU BẰNG', 'Điều cả hai cùng đồng ý', true);
export const S79 = room({ set: 'office', actors: [{ look: KHACH, u: 0.5, w: 0.36, yaw: 0.2, faces: [[0, 'neutral']] }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'happy']], does: 'talk' }] });
export const S80 = close({ look: KHACH, set: 'office', faces: [[0, 'neutral']], yaw: 0.25, tilt: [[0, 0], [4, 8], [9, 0]], extra: (t) => <Pop x={960} y={200} t={t - 2} text="VÂNG" color={YELLOW} size={70} /> });
export const S81 = room({ set: 'office', cam: [1000, 520, 1.2, 1.26], actors: [{ look: KHACH, u: 0.5, w: 0.36, yaw: 0.3, faces: [[0, 'neutral']] }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'neutral']], does: 'talk' }] });
export const S82 = close({ look: KHACH, set: 'office', faces: [[0, 'neutral'], [6, 'happy']], yaw: 0.2, tilt: [[0, 0], [4, 8], [9, 0]], extra: (t) => <Pop x={960} y={200} t={t - 2} text="VÂNG" color={YELLOW} size={70} /> });
export const S83 = room({ set: 'office', actors: [{ look: KHACH, u: 0.5, w: 0.36, yaw: 0.3, faces: [[0, 'happy']], does: 'nod' }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'smug']] }], extra: (t) => <><Pop x={760} y={200} t={t - 2} text="VÂNG" color={YELLOW} /><Pop x={1000} y={160} t={t - 8} text="VÂNG" color={YELLOW} /><Pop x={1220} y={220} t={t - 14} text="VÂNG!" color={YELLOW} /></> });
export const S84 = nameCard({ name: 'Socrates', role: 'triết gia Hy Lạp cổ đại', year: 'CÁCH CỦA' });

// ---- 13 ngày 21: nhận lỗi, để họ nghĩ ra ý tưởng ----
export const S85 = calendar(19, 20);
export const S86 = close({ look: HERO, set: 'office', faces: [[0, 'oops']], yaw: 0.2, extra: (t) => <Mark x={1360} y={300} t={t - 4} ok={false} s={1} /> });
export const S87 = room({ set: 'office', actors: [{ look: SEP, u: 0.47, w: 0.36, yaw: 0.3, faces: [[0, 'angry']] }, { look: HERO, u: 0.72, w: 0.62, yaw: -0.5, faces: [[0, 'worried']], does: 'bow', at: 6 }], extra: (t) => <Pop x={1180} y={250} t={t - 10} text="LỖI CỦA EM Ạ" /> });
export const S88 = close({ look: SEP, set: 'office', faces: [[0, 'angry'], [12, 'neutral'], [20, 'happy']], yaw: 0.3, tilt: [[0, -4], [20, 6]] });
export const S89 = room({ set: 'office', cam: [960, 560, 1.1, 1.16], actors: [{ look: HERO, u: 0.35, w: 0.62, yaw: 0.4, faces: [[0, 'happy']], does: 'talk' }, { look: MO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'neutral']], does: 'think', at: 10 }], extra: (t) => <Pop x={700} y={250} t={t - 12} text="THEO ANH THÌ SAO?" size={48} /> });
export const S90 = close({ look: MO, set: 'office', faces: [[0, 'neutral'], [8, 'happy']], yaw: -0.25, extra: (t) => <FocusRings x={960} y={520} t={t - 8} r0={200} color="#FFE7B3" /> });

// ---- 14 ngày 23: góc độ của người kia ----
export const S91 = calendar(21, 22);
export const S92 = rule({ label: 'PHẦN 3 · GÓC NHÌN', text: 'Nhìn mọi việc từ góc độ của người kia' });
export const S93 = close({ look: HERO, set: 'bedroom', faces: [[0, 'tired'], [10, 'angry']], yaw: 0.2, dark: 0.45, extra: (t) => <><Pop x={560} y={260} t={t - 2} text="BÙM! BÙM!" color={RED} /><Pop x={1380} y={380} t={t - 8} text="BÙM!" color={RED} /></> });
export const S94 = room({ set: 'study', actors: [{ look: HANGXOM, u: 0.38, w: 0.55, yaw: 0.4, faces: [[0, 'neutral']] }, { look: HERO, u: 0.68, w: 0.6, yaw: -0.4, faces: [[0, 'happy']], does: 'talk', at: 10 }], extra: (t) => <Pop x={1200} y={250} t={t - 24} text="NHÀ MÌNH CÓ CHUYỆN VUI À?" size={44} /> });
export const S95 = close({ look: HANGXOM, set: 'study', faces: [[0, 'oops'], [16, 'happy']], yaw: 0.25, extra: (t) => <Pop x={960} y={190} t={t - 10} text="XIN LỖI NHÉ!" /> });
export const S96 = close({ look: HERO, set: 'study', faces: [[0, 'neutral']], yaw: -0.3, tilt: [[0, 0], [20, 6]] });
export const S97 = rule({ label: 'BÀI HỌC', text: 'Hiểu lý do của họ là cầm chìa khoá' });

// ---- 15 ngày 25: giúp người khác thay đổi ----
export const S98 = calendar(23, 24);
export const S99 = rule({ label: 'PHẦN 4', text: 'Giúp người khác thay đổi mà không tự ái' });
export const S100 = room({ set: 'office', actors: [{ look: THUCTAP, u: 0.36, w: 0.62, yaw: 0.4, faces: [[0, 'worried']], walkFrom: 300 }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.4, faces: [[0, 'happy']], does: 'wave', at: 10 }] });
export const S101 = close({ look: THUCTAP, set: 'office', faces: [[0, 'shock'], [10, 'happy']], yaw: 0.25, extra: (t) => <Pop x={960} y={190} t={t - 4} text="LÀM TỐT LẮM!" color={YELLOW} /> });
export const S102 = room({ set: 'office', cam: [960, 560, 1.1, 1.16], actors: [{ look: THUCTAP, u: 0.35, w: 0.62, yaw: 0.4, faces: [[0, 'neutral']], does: 'think', at: 8 }, { look: HERO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'happy']], does: 'point' }], extra: () => <Paper x={960} y={820} w={160} rot={6} done grade="?" /> });
export const S103 = close({ look: HERO, set: 'office', faces: [[0, 'oops'], [12, 'happy']], yaw: -0.2, extra: (t) => <Pop x={960} y={190} t={t - 6} text="HỒI ĐẦU ANH CŨNG SAI" size={50} /> });
export const S104 = room({ set: 'office', cam: [960, 560, 1.1, 1.16], actors: [{ look: THUCTAP, u: 0.35, w: 0.62, yaw: 0.4, faces: [[0, 'neutral'], [16, 'happy']], does: 'nod', at: 16 }, { look: HERO, u: 0.68, w: 0.62, yaw: -0.4, faces: [[0, 'happy']], does: 'talk' }], extra: (t) => <Pop x={1240} y={250} t={t - 8} text="EM THỬ CÁCH NÀY XEM?" size={46} /> });
export const S105 = close({ look: THUCTAP, set: 'office', faces: [[0, 'happy'], [10, 'love']], yaw: 0.2, extra: (t) => <><Sparkle x={700} y={300} t={t - 8} s={1.3} /><Sparkle x={1260} y={260} t={t - 12} s={1.1} /></> });
export const S106 = room({ set: 'office', actors: [{ look: THUCTAP, u: 0.45, w: 0.36, yaw: 0.3, faces: [[0, 'happy']], does: 'cheer' }, { look: HERO, u: 0.7, w: 0.62, yaw: -0.5, faces: [[0, 'happy']], does: 'clap', at: 6 }], extra: (t) => <Mark x={1360} y={300} t={t - 10} ok s={1} /> });

// ---- 16 cú chuyển: cái bẫy ----
export const S107 = close({ look: HERO, set: 'office', faces: [[0, 'shock']], yaw: 0, dark: 0.55, push: 0.1 });
export const S108 = room({ set: 'office', veil: 0.6, actors: [{ look: SEP, u: 0.4, w: 0.36, yaw: 0.3, faces: [[0, 'neutral'], [16, 'angry']] }, { look: MO, u: 0.6, w: 0.36, yaw: -0.2, faces: [[0, 'neutral'], [20, 'angry']] }, { look: HERO, u: 0.7, w: 0.64, yaw: -0.5, faces: [[0, 'smug']], does: 'talk' }] });
export const S109 = quote({ text: 'Lời khen giả dối là nịnh hót, và nịnh hót sớm muộn cũng lộ.', by: 'ý trong Đắc Nhân Tâm' });
export const S110 = bookShot(BOOK, 'KHÔNG DẠY BẠN DIỄN');
export const S111 = street({ mopeds: [560], actors: [{ look: BAOVE, x: 780, yaw: 0.4, faces: [[0, 'happy']], does: 'wave' }, { look: HERO, x: 990, yaw: 0, faces: [[0, 'happy']] }, { look: BANHMI, x: 1190, yaw: -0.4, faces: [[0, 'happy']], does: 'wave', at: 8 }] });
export const S112 = close({ look: HERO, set: 'street', faces: [[0, 'worried'], [16, 'smug']], yaw: 0.2 });

// ---- 17 ngày 30 ----
export const S113 = calendar(28, 29);
export const S114 = close({ look: HERO, set: 'office', faces: [[0, 'neutral']], yaw: 0.1, push: 0.05 });
export const S115 = room({ set: 'office', actors: [{ look: SEP, u: 0.36, w: 0.36, yaw: 0.3, faces: [[0, 'happy']], does: 'clap' }, { look: KHO, u: 0.6, w: 0.36, yaw: -0.2, faces: [[0, 'happy']], does: 'cheer', at: 6 }, { look: MO, u: 0.3, w: 0.64, yaw: 0.4, faces: [[0, 'happy']], does: 'cheer', at: 10 }, { look: HERO, u: 0.72, w: 0.64, yaw: -0.4, faces: [[0, 'happy']] }] });
export const S116 = fact({ top: 'RA ĐỜI NĂM', to: 1936, fmt: (v) => String(Math.round(v)), color: SCH.live, dur: 18 });
export const S117 = fact({ top: 'ĐÃ BÁN HƠN', to: 30000000, bottom: 'BẢN TRÊN THẾ GIỚI' });
export const S118 = fact({ top: 'TỔNG CỘNG', to: 30, bottom: 'NGUYÊN TẮC', dur: 14 });

// ---- 18 CTA ----
export const S119 = bookShot(BOOK, 'VÀ NHỮNG CÂU CHUYỆN THẬT');
export const S120: React.FC<ShotProps> = (p) => {
  const C = S120c;
  return (
    <g>
      <C {...p} />
      <SvgBook b={BOOK} x={1210} y={kf(p.t, [[0, 1200], [12, 760]], easeOut)} w={260} rot={8} />
    </g>
  );
};
const S120c = close({ look: HERO, set: 'study', faces: [[0, 'happy']], yaw: -0.2 });

