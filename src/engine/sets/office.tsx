import React from 'react';
import { makeRoom, Box, S3 } from '../room';
import { RoomShell, BackWindow, Pendant, pendantLight, WallLight, FloorShadow, FloorPlant, WallClock } from '../furnish';
import { Glow, LightVeil, Dust } from '../light';
import { rnd } from '../anim';

// An office at dusk, built with the room kit: a big window on the back wall, a sales chart beside it, a binder shelf on
// the right, filing cabinets on the left, two pendants. The boss stands behind the desk at about w 0.36
// (stand(OFFICE, 0.5, 0.36)); draw <OfficeDesk /> after her so it hides her legs. Desk top is v 0.72.

export const OFFICE = makeRoom({ x: 960, y: 500 }, { x0: 500, x1: 1420, y0: 330, y1: 745 }, 3.4);
const O = { wall: '#3C4058', side: '#30334A', floor: '#2C2630', cab: '#515468', cabDark: '#3D4052', wood: '#6B4B42', woodDark: '#4E362F', top: '#8A6452' };
export const OFFICE_TOP = 0.72;

export const Office: React.FC<{ t: number; id?: string; veil?: number }> = ({ t, id = 'off', veil = 0.46 }) => {
  const R = OFFICE;
  const { P } = R;
  const binders: React.ReactNode[] = [];
  [0.28, 0.44, 0.6, 0.76].forEach((v, si) => {
    for (let k = 0; k < 11; k++) {
      const p = P(0.775 + k * 0.018, v, 0.1);
      const h = 54 + rnd(si + 5, k) * 26;
      binders.push(<rect key={`b${si}-${k}`} x={p.x} y={p.y - h} width={15} height={h} fill={['#8A4A4A', '#4A6A8A', '#B9A06A', '#5A7A5A', '#6A5A8A'][(k + si) % 5]} />);
    }
  });
  return (
    <g>
      <RoomShell r={R} id={id} floor="boards" wall={O.wall} side={O.side} floorC={O.floor} lines="#211C24" />
      <BackWindow r={R} id={`${id}w`} t={t} x0={770} x1={1150} y0={368} y1={590} sun={{ x: 960, y: 580 }} cols={3} curtains={false} />
      {/* the sales chart on the back wall: a rising red line */}
      <rect x={545} y={398} width={190} height={138} fill="#D9D0BE" stroke="#1A1620" strokeWidth={5} />
      <path d="M 562 516 L 600 494 L 636 502 L 672 456 L 716 418" stroke="#B9403A" strokeWidth={6} fill="none" strokeLinejoin="round" />
      <path d="M 562 420 L 562 520 L 720 520" stroke="#3A3440" strokeWidth={3} fill="none" />
      <WallClock x={1240} y={410} r={26} t={t} />
      {/* filing cabinets, back left */}
      <FloorShadow r={R} u={[0.01, 0.17]} w={[0, 0.11]} />
      <Box r={R} u={[0.01, 0.09]} v={[0.42, 1]} w={[0, 0.1]} front={O.cab} side={O.cabDark} top="#62657A" />
      <Box r={R} u={[0.095, 0.175]} v={[0.42, 1]} w={[0, 0.1]} front={O.cab} side={O.cabDark} top="#62657A" />
      {[0.01, 0.095].map((u, i) =>
        [0.5, 0.65, 0.8].map((v, j) => {
          const p = P(u + 0.04, v, 0.1);
          return <rect key={`dr${i}${j}`} x={p.x - 13} y={p.y} width={26} height={7} rx={3} fill="#C9B48A" />;
        }),
      )}
      {/* binder shelf, back right */}
      <FloorShadow r={R} u={[0.76, 0.99]} w={[0, 0.11]} />
      <Box r={R} u={[0.76, 0.99]} v={[0.14, 1]} w={[0, 0.1]} front="#3A2C2A" side={O.woodDark} top={O.wood} />
      {binders}
      {[0.28, 0.44, 0.6, 0.76].map((v, i) => {
        const a = P(0.76, v, 0.1);
        const b = P(0.99, v, 0.1);
        return <path key={`sl${i}`} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={O.wood} strokeWidth={7} />;
      })}
      {/* a cabinet along the left wall, a plant on the right */}
      <FloorShadow r={R} u={[0, 0.09]} w={[0.22, 0.56]} />
      <Box r={R} u={[0, 0.09]} v={[0.55, 1]} w={[0.22, 0.56]} front={O.wood} side={O.woodDark} top={O.top} />
      <FloorPlant r={R} u={0.93} w={0.42} size={1.1} />
      <FloorPlant r={R} u={0.06} w={0.72} size={1.25} />
      <WallLight r={R} u={0} v={0.34} w={0.68} />
      <Pendant r={R} u={0.34} w={0.42} v={0.2} t={t} />
      <Pendant r={R} u={0.66} w={0.42} v={0.2} t={t + 9} />
      <LightVeil id={`${id}veil`} lights={[[960, 470, 360], pendantLight(R, 0.34, 0.42, 0.2), pendantLight(R, 0.66, 0.42, 0.2), [P(0, 0.34, 0.68).x, P(0, 0.34, 0.68).y, 260], [980, 880, 460]]} o={veil} />
      {[0.34, 0.66].map((u) => {
        const [x, y] = pendantLight(R, u, 0.42, 0.2);
        return <Glow key={u} x={x} y={y - 34} r={240} o={0.3} />;
      })}
      <Dust t={t} seed={71} x0={760} y0={400} w={400} h={400} n={30} />
    </g>
  );
};

/** The boss's desk, drawn after whoever stands behind it: a monitor, a stack of paper, a mug, a desk lamp, a nameplate. */
export const OfficeDesk: React.FC = () => {
  const R = OFFICE;
  const T = OFFICE_TOP;
  const m = R.P(0.4, T - 0.02, 0.5);
  const st = R.P(0.6, T - 0.02, 0.52);
  const lamp = R.P(0.66, T - 0.02, 0.48);
  const plate = R.P(0.5, T - 0.02, 0.56);
  return (
    <g>
      <FloorShadow r={R} u={[0.27, 0.73]} w={[0.42, 0.61]} o={0.45} />
      <Box r={R} u={[0.29, 0.34]} v={[T, 1]} w={[0.44, 0.58]} front={O.woodDark} side="#3A2824" />
      <Box r={R} u={[0.66, 0.71]} v={[T, 1]} w={[0.44, 0.58]} front={O.woodDark} side="#3A2824" />
      <Box r={R} u={[0.34, 0.66]} v={[T + 0.02, 0.86]} w={[0.48, 0.5]} front="#3A2824" />
      <Box r={R} u={[0.27, 0.73]} v={[T - 0.025, T]} w={[0.42, 0.6]} front={O.wood} top={O.top} side={O.woodDark} rim />
      {/* monitor from behind, its light spilling */}
      <rect x={m.x - 66} y={m.y - 96} width={132} height={82} rx={6} fill="#1A1A24" />
      <path d={`M ${m.x - 66} ${m.y - 96} L ${m.x + 66} ${m.y - 96}`} stroke="#9FC0FF" strokeWidth={3} opacity={0.75} />
      <rect x={m.x - 8} y={m.y - 16} width={16} height={16} fill="#14141C" />
      <ellipse cx={m.x} cy={m.y} rx={36} ry={7} fill="#14141C" />
      <Glow x={m.x} y={m.y - 56} r={130} kind="cool" o={0.3} />
      {[0, 1, 2, 3].map((k) => (
        <rect key={k} x={st.x - 44 + k * 2} y={st.y - 8 - k * 7} width={88} height={7} fill={k % 2 ? '#E8E0D0' : '#D6CDB9'} />
      ))}
      <path d={`M ${lamp.x} ${lamp.y} L ${lamp.x + 8} ${lamp.y - 78} L ${lamp.x - 30} ${lamp.y - 112}`} stroke="#1A1620" strokeWidth={6} fill="none" />
      <path d={`M ${lamp.x - 56} ${lamp.y - 92} L ${lamp.x - 22} ${lamp.y - 124} L ${lamp.x - 6} ${lamp.y - 100} Z`} fill="#B9403A" />
      <Glow x={lamp.x - 36} y={lamp.y - 86} r={120} o={0.5} />
      <rect x={plate.x - 52} y={plate.y - 22} width={104} height={24} fill="#1E1824" />
      <path d={`M ${plate.x - 52} ${plate.y - 22} L ${plate.x + 52} ${plate.y - 22}`} stroke={S3.warm} strokeWidth={2.5} opacity={0.6} />
    </g>
  );
};
