import React from 'react';
import { rnd } from '../anim';
import { DuskSky, Sun, Skyline } from '../kit';
import { S3 } from '../room';
import { Glow, Dust } from '../light';

// A street at dusk, side-on: the low sun down the far end, apartment blocks either side with lit windows and balconies,
// a café with an awning on the left, a street lamp and a parked moped. The pavement runs y 790 to 900, feet at about
// y 850; the road is below it. `low` lowers the camera for looking up at someone.

const Block: React.FC<{ x: number; w: number; top: number; c: string; seed: number; base?: number }> = ({ x, w, top, c, seed, base = 800 }) => {
  const win: React.ReactNode[] = [];
  const cols = Math.floor(w / 92);
  const rows = Math.floor((base - top - 130) / 104);
  for (let cc = 0; cc < cols; cc++) {
    for (let rr = 0; rr < rows; rr++) {
      const q = rnd(seed, cc * 17 + rr);
      const wx = x + 26 + cc * 92;
      const wy = top + 34 + rr * 104;
      win.push(
        <g key={`${cc}-${rr}`}>
          <rect x={wx} y={wy} width={52} height={70} fill={q > 0.46 ? (q > 0.88 ? '#9FC0FF' : '#FFC27A') : '#1C1826'} opacity={q > 0.46 ? 0.55 + q * 0.4 : 1} />
          <path d={`M ${wx + 26} ${wy} L ${wx + 26} ${wy + 70} M ${wx} ${wy + 30} L ${wx + 52} ${wy + 30}`} stroke={c} strokeWidth={4} />
          {rnd(seed + 1, cc * 17 + rr) > 0.62 ? <path d={`M ${wx - 8} ${wy + 76} L ${wx + 60} ${wy + 76} M ${wx - 4} ${wy + 76} L ${wx - 4} ${wy + 94} M ${wx + 56} ${wy + 76} L ${wx + 56} ${wy + 94} M ${wx - 8} ${wy + 94} L ${wx + 60} ${wy + 94}`} stroke="#14101C" strokeWidth={4} fill="none" /> : null}
        </g>,
      );
    }
  }
  return (
    <g>
      <rect x={x} y={top} width={w} height={base - top} fill={c} />
      <rect x={x} y={top} width={w} height={12} fill="#14101C" opacity={0.55} />
      {win}
    </g>
  );
};

export const Street: React.FC<{ t: number; id?: string; red?: number; low?: number; sunX?: number }> = ({ t, id = 'st', red = 0, low = 0, sunX = 1040 }) => (
  <g>
    <DuskSky id={`${id}sky`} horizonY={720} red={red} />
    <Sun x={sunX} y={610} r={140} t={t} red={red} />
    <g transform={`translate(0 ${low})`}>
      <Skyline y={760} seed={15} color="#5A4068" h={190} />
      <Skyline y={780} seed={27} color="#3E2E52" h={130} />
      <Block x={-420} w={1000} top={70} c="#3A2C44" seed={101} />
      <Block x={1420} w={920} top={120} c="#33283F" seed={131} />
      {/* the far end of the street narrows to the sun */}
      <path d="M 580 800 L 840 740 L 1180 740 L 1420 800 Z" fill="#3A2A3C" />
      {/* a café on the left: a lit window under a striped awning, a table outside */}
      <rect x={110} y={590} width={410} height={208} fill="#2A1E2C" />
      <rect x={136} y={622} width={250} height={170} fill="#FFC27A" opacity={0.75} />
      <path d="M 261 622 L 261 792" stroke="#2A1E2C" strokeWidth={8} />
      <rect x={410} y={640} width={84} height={158} fill="#1A1420" />
      <Glow x={262} y={690} r={280} o={0.42} />
      <path d="M 92 590 L 538 590 L 566 548 L 64 548 Z" fill="#8E3F46" />
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M ${92 + i * 64} 590 L ${64 + i * 72} 548 L ${100 + i * 72} 548 L ${124 + i * 64} 590 Z`} fill="#E9DCC6" opacity={0.75} />
      ))}
      {/* the pavement, the kerb, the road */}
      <rect x={-400} y={798} width={2720} height={110} fill="#463A4A" />
      {Array.from({ length: 34 }).map((_, i) => (
        <path key={i} d={`M ${-400 + i * 86} 798 L ${-420 + i * 92} 908`} stroke="#352B3A" strokeWidth={3} />
      ))}
      <rect x={-400} y={798} width={2720} height={3} fill={S3.warm} opacity={0.5} />
      <rect x={-400} y={906} width={2720} height={22} fill="#6A5C66" />
      <rect x={-400} y={928} width={2720} height={500} fill="#231D28" />
      <path d="M -400 1040 L 2320 1040" stroke="#D9CFA8" strokeWidth={8} strokeDasharray="110 90" opacity={0.5} />
      <ellipse cx={sunX} cy={1010} rx={520} ry={60} fill="#F29A6A" opacity={0.12} />
      {/* a plane tree and a bin */}
      <rect x={1608} y={500} width={30} height={330} fill="#241A22" />
      <g filter="url(#blur3)">
        {[[1560, 470, 120], [1680, 450, 130], [1620, 370, 140]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#22301F" />
        ))}
      </g>
      <rect x={560} y={740} width={58} height={92} rx={6} fill="#3E5244" />
      <ellipse cx={590} cy={836} rx={44} ry={8} fill="#000" opacity={0.35} />
      {/* the street lamp */}
      <path d="M 1370 850 L 1370 330 Q 1370 290 1320 290 L 1270 290" stroke="#14101C" strokeWidth={13} fill="none" />
      <rect x={1232} y={282} width={62} height={18} rx={8} fill="#14101C" />
      <circle cx={1262} cy={304} r={15} fill="#FFE2B0" />
    </g>
    <Glow x={1262} y={304 + low} r={260} o={0.62} />
    <Dust t={t} seed={111} x0={760} y0={420} w={560} h={380} n={26} />
    {red > 0 ? <rect x={-400} y={-400} width={2720} height={1900} fill="#16000A" opacity={0.4 * red} /> : null}
  </g>
);

/** A parked moped, side-on, x the middle, y the ground. Drawn in the street's dusk colours. */
export const Moped: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={118} ry={13} fill="#000" opacity={0.35} />
    {[-78, 78].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={-30} r={30} fill="#17131C" />
        <circle cx={cx} cy={-30} r={13} fill="#6A6470" />
      </g>
    ))}
    <path d="M -96 -66 Q -60 -96 -6 -82 L 26 -40 L 64 -40 L 58 -112 L 72 -112 L 90 -42 L 60 -18 L -60 -18 Q -96 -30 -96 -66 Z" fill="#B9403A" stroke="#1A1216" strokeWidth={4} strokeLinejoin="round" />
    <rect x={-74} y={-104} width={76} height={18} rx={9} fill="#1E1820" />
    <path d="M 38 -124 L 86 -130" stroke="#14101C" strokeWidth={9} strokeLinecap="round" />
    <circle cx={92} cy={-96} r={11} fill="#FFE2B0" />
    <path d="M -90 -68 Q -50 -94 -8 -80" stroke="#FFB46A" strokeWidth={3} fill="none" opacity={0.7} />
  </g>
);
