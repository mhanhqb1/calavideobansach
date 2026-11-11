import React from 'react';
import {
  Hero, poseAt, faceAt, kf, clamp, easeOut, backOut, camT, LOOKS, stand,
  Office, OfficeDesk, OFFICE, Study, Schematic, SCH, SchLabel, CountUp, DrawOn,
  WallCalendar, PaperStack, Paper, Sparkle, FocusRings, Glow, FONT,
  Close, SvgBook, BookInfo, ShotProps,
} from '../../engine';
import ep from './episode.json';

// "Điều gì xảy ra nếu 30 ngày liền, bạn không chê trách bất kỳ ai?" Mười một cảnh trên văn phòng, góc học tập và
// bảng sơ đồ, rồi thẻ sách (CTA, do engine vẽ). Mỗi cảnh là hàm thuần của đồng hồ riêng t. Cảnh vẽ trong thế giới
// 1920 x 1080; khung dọc nhìn qua một cửa sổ vuông 1080 px quanh x = 960 (sửa "frame" trong episode.json).

const HERO = LOOKS.pipWork;
const SEP = LOOKS.jefa;
const MO = LOOKS.mo;
const KHO = LOOKS.suit;
const BOOK = ep.book as BookInfo;
const YELLOW = '#FFD43B';

/** A day tag at the top of the window: "NGÀY 7". */
const DayTag: React.FC<{ t: number; n: number }> = ({ t, n }) => {
  if (t < 0) return null;
  const s = backOut(clamp(t / 6));
  const w = 300 + String(n).length * 48;
  return (
    <g transform={`translate(960 120) scale(${s})`}>
      <rect x={-w / 2} y={-58} width={w} height={116} rx={58} fill={YELLOW} stroke="#1B1406" strokeWidth={6} />
      <text y={26} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={72} fill="#1B1406">
        NGÀY {n}
      </text>
    </g>
  );
};

const officeBg = (t: number, id: string) => (
  <g transform="translate(-640 -400) scale(1.75)">
    <Office t={t} id={id} />
  </g>
);

// ---------- S1: close-up, hook: bạn, nhìn thẳng, mỉm cười như vừa nghĩ ra một thử thách ----------
export const S1: React.FC<ShotProps> = ({ t }) => (
  <g>
    <Close t={t} look={HERO} bg={officeBg(t + 40, 's1')} faces={[[0, 'neutral'], [14, 'smug']]} yaw={0.15} sc={3.4} tilt={kf(t, [[0, 0], [16, 6]])} />
    <Glow x={960} y={420} r={520} o={0.25} />
  </g>
);

// ---------- S2: insert, a wall calendar: 30 days crossing off fast ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const crossed = Math.floor(kf(t, [[2, 0], [Math.max(3, len - 4), 30]], easeOut));
  return (
    <g transform={camT(960, kf(t, [[0, 560], [len, 540]]), kf(t, [[0, 1.0], [len, 1.08]]))}>
      <Study t={t + 20} id="s2" veil={0.5} />
      <rect x={-200} y={-200} width={2320} height={1480} fill="#07040C" opacity={0.35} />
      <WallCalendar x={960} y={130} w={620} crossed={crossed} drawing={0.5} rot={-2} />
    </g>
  );
};

// ---------- S3: wide, the office: the boss gets something wrong (she points at the falling chart) ----------
const SEP_POS = stand(OFFICE, 0.47, 0.36);
const HERO_POS = stand(OFFICE, 0.74, 0.62);
export const S3: React.FC<ShotProps> = ({ t, len }) => {
  const sep = poseAt(t, [
    { f: 0, p: { ...SEP_POS, yaw: 0.45, armR: { a: 14, b: -6 }, tilt: -2 } },
    { f: 6, p: { armR: { a: 96, b: 4 }, tilt: 6 }, ease: easeOut },
    { f: 10, p: { armR: { a: 90, b: 2 }, tilt: 4 } },
  ]);
  const hero = poseAt(t, [{ f: 0, p: { ...HERO_POS, yaw: -0.55, look: -0.7 } }, { f: 10, p: { headTilt: 8 } }]);
  return (
    <g transform={camT(kf(t, [[0, 1010], [len, 1000]]), 560, kf(t, [[0, 0.95], [len, 1.0]]))}>
      <Office t={t} id="s3" veil={0.3} />
      <Hero look={SEP} pose={{ ...sep, handR: 'point', ...faceAt(t, [[0, 'smug']]) }} shadow={0} rimId="rimR" />
      <OfficeDesk />
      <Paper x={880} y={720} w={120} rot={-8} done grade="F" />
      <Hero look={HERO} pose={{ ...hero, ...faceAt(t, [[0, 'neutral'], [9, 'worried']]) }} shadow={0.7} rimId="rimL" />
      <DayTag t={t} n={1} />
    </g>
  );
};

// ---------- S4: close-up, you almost say it (angry, mouth open), then you stop ----------
export const S4: React.FC<ShotProps> = ({ t }) => (
  <Close t={t} look={HERO} bg={officeBg(t + 90, 's4')} faces={[[0, 'angry'], [8, 'shock'], [26, 'neutral']]} yaw={-0.3} sc={3.5} tilt={kf(t, [[0, -4], [8, 4], [26, 0]])} />
);

// ---------- S5: two-shot, you ask her opinion: she's surprised, then she smiles ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const sep = poseAt(t, [
    { f: 0, p: { ...SEP_POS, yaw: 0.4, armR: { a: 20, b: -6 }, armL: { a: 14, b: -6 } } },
    { f: 8, p: { headTilt: -6, armL: { a: 40, b: 30 } }, ease: easeOut },
  ]);
  const hero = poseAt(t, [
    { f: 0, p: { ...HERO_POS, yaw: -0.5, armR: { a: 10, b: -8 }, armL: { a: 10, b: -8 } } },
    { f: 4, p: { armL: { a: 52, b: 20 }, tilt: -4 }, ease: easeOut },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 1080], [len, 1070]]), 520, kf(t, [[0, 1.45], [len, 1.55]]))}>
      <Office t={t + 30} id="s5" veil={0.3} />
      <Hero look={SEP} pose={{ ...sep, ...faceAt(t, [[0, 'shock'], [10, 'happy']]) }} shadow={0} rimId="rimR" />
      <OfficeDesk />
      <Hero look={HERO} pose={{ ...hero, ...faceAt(t, [[0, 'happy']]) }} shadow={0.7} rimId="rimL" />
      <Sparkle x={SEP_POS.x + 40} y={SEP_POS.y - 230 * SEP_POS.scale} t={t - 10} s={1.2} />
    </g>
  );
};

// ---------- S6: medium, day 7: you praise Mo at his desk; he lights up ----------
const MO_POS = stand(OFFICE, 0.5, 0.4);
const HERO6 = stand(OFFICE, 0.76, 0.58);
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const hero = poseAt(t, [
    { f: 0, p: { ...HERO6, yaw: -0.5, armL: { a: 10, b: -8 }, armR: { a: 10, b: -8 } } },
    { f: 5, p: { armL: { a: 120, b: 10 }, armR: { a: 40, b: 10 }, squash: -0.03 }, ease: easeOut },
    { f: 10, p: { armL: { a: 110, b: 14 }, squash: 0 } },
  ]);
  const mo = poseAt(t, [
    { f: 0, p: { ...MO_POS, yaw: 0.4, armL: { a: 10, b: -8 }, armR: { a: 10, b: -8 } } },
    { f: 9, p: { armL: { a: 150, b: 10 }, armR: { a: 150, b: 10 }, squash: -0.05 }, ease: easeOut },
    { f: 13, p: { armL: { a: 142, b: 16 }, armR: { a: 142, b: 16 }, squash: 0 } },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 1000], [len, 1010]]), 540, kf(t, [[0, 1.0], [len, 1.08]]))}>
      <Office t={t + 60} id="s6" veil={0.32} />
      <Hero look={MO} pose={{ ...mo, ...faceAt(t, [[0, 'neutral'], [8, 'happy']]) }} shadow={0} rimId="rimR" />
      <OfficeDesk />
      <Hero look={HERO} pose={{ ...hero, ...faceAt(t, [[0, 'happy']]) }} shadow={0.7} rimId="rimL" />
      <Sparkle x={MO_POS.x - 60} y={MO_POS.y - 260 * MO_POS.scale} t={t - 8} s={1.4} />
      <Sparkle x={MO_POS.x + 80} y={MO_POS.y - 200 * MO_POS.scale} t={t - 12} s={1.0} />
      <DayTag t={t} n={7} />
    </g>
  );
};

// ---------- S7: medium, colleagues start helping: Mo drops a finished stack on your desk ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => {
  const moX = kf(t, [[0, 640], [12, 820]], easeOut);
  const mo = poseAt(t, [
    { f: 0, p: { x: moX, y: HERO6.y, scale: HERO6.scale, yaw: 0.6, armL: { a: 70, b: 40 }, armR: { a: 70, b: 40 } } },
    { f: 12, p: { armL: { a: 50, b: 20 }, armR: { a: 50, b: 20 } } },
    { f: 16, p: { armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 } } },
  ]);
  const stackOn = t >= 13;
  const stackY = kf(t, [[11, 650], [14, 690]], easeOut);
  const hero = poseAt(t, [{ f: 0, p: { ...HERO6, x: HERO6.x + 40, yaw: -0.5 } }, { f: 15, p: { headTilt: -6 } }]);
  return (
    <g transform={camT(kf(t, [[0, 1010], [len, 1000]]), 560, kf(t, [[0, 1.25], [len, 1.3]]))}>
      <Office t={t + 90} id="s7" veil={0.3} />
      <OfficeDesk />
      <Hero look={MO} pose={{ ...mo, x: moX, ...faceAt(t, [[0, 'happy']]) }} shadow={0.6} rimId="rimR" />
      {stackOn ? <PaperStack x={1010} y={stackY} n={6} w={150} /> : <PaperStack x={moX + 70} y={HERO6.y - 30} n={6} w={150} />}
      <Hero look={HERO} pose={{ ...hero, ...faceAt(t, [[0, 'shock'], [16, 'happy']]) }} shadow={0.7} rimId="rimL" />
      <Sparkle x={1010} y={stackY - 90} t={t - 14} s={1.2} />
    </g>
  );
};

// ---------- S8: close-up, day 30: the hardest person in the office, arms crossed, scowling ----------
export const S8: React.FC<ShotProps> = ({ t }) => (
  <g>
    <Close t={t} look={KHO} bg={officeBg(t + 120, 's8')} faces={[[0, 'angry']]} yaw={0.3} sc={3.3} tilt={-4} dark={0.38} />
    <DayTag t={t} n={30} />
  </g>
);

// ---------- S9: the same close-up: he softens, nods, listens ----------
export const S9: React.FC<ShotProps> = ({ t }) => (
  <g>
    <Close t={t} look={KHO} bg={officeBg(t + 150, 's9')} faces={[[0, 'neutral'], [12, 'happy']]} yaw={0.2} sc={3.4} tilt={kf(t, [[0, 0], [8, 7], [14, 0], [20, 6]])} push={0.06} />
    <FocusRings x={960} y={520} t={t - 12} r0={200} color="#FFE7B3" />
  </g>
);

// ---------- S10: schematic: the book, and its first principle drawn on ----------
export const S10: React.FC<ShotProps> = ({ t }) => {
  const rise = easeOut(clamp(t / 12));
  return (
    <g>
      <Schematic t={t} id="s10" />
      <Glow x={960} y={430} r={460} o={0.35 * rise} />
      <g transform={`translate(0 ${(1 - rise) * 160})`} opacity={rise}>
        <SvgBook b={BOOK} x={960} y={400} w={300} rot={-4 + 4 * rise} />
      </g>
      <SchLabel x={960} y={760} t={t - 14} text="NGUYÊN TẮC SỐ 1" size={60} color={SCH.live} />
      <g opacity={clamp((t - 20) / 6)}>
        <text x={960} y={880} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={92} fill={SCH.line}>
          KHÔNG CHỈ TRÍCH
        </text>
      </g>
      <DrawOn d="M 640 910 L 1280 910" t={t - 24} dur={8} color={YELLOW} width={10} />
    </g>
  );
};

// ---------- S11: schematic: 1936, then 30 million copies counting up ----------
export const S11: React.FC<ShotProps> = ({ t }) => (
  <g>
    <Schematic t={t + 40} id="s11" />
    <SchLabel x={960} y={300} t={t} text="XUẤT BẢN NĂM" size={52} color={SCH.dim} />
    <CountUp x={960} y={450} t={t} to={1936} dur={20} size={150} format={(v) => String(Math.round(v))} />
    <SchLabel x={960} y={650} t={t - 32} text="ĐÃ BÁN HƠN" size={52} color={SCH.dim} />
    <CountUp x={960} y={810} t={t - 32} to={30000000} dur={30} size={130} color={YELLOW} format={(v) => new Intl.NumberFormat('vi-VN').format(Math.round(v))} />
    <SchLabel x={960} y={910} t={t - 58} text="BẢN TRÊN THẾ GIỚI" size={52} color={SCH.line} />
  </g>
);

