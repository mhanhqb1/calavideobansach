import React from 'react';
import { makeRoom, Box, S3 } from '../room';
import { RoomShell, BackWindow, Pendant, pendantLight, FloorShadow } from '../furnish';
import { Glow, LightVeil, Dust } from '../light';
import { rnd } from '../anim';
import { FONT } from '../fonts';

// A corner supermarket at dusk, built with the room kit: glass doors on the back wall with the low sun in them, packed
// shelves either side, an aisle along the left wall, two pendants over the till. The cashier stands behind the
// checkout at about w 0.38 (stand(SHOP, 0.42, 0.38)); draw <Checkout /> after her. Customers stand at w 0.7 or nearer.

export const SHOP = makeRoom({ x: 960, y: 470 }, { x0: 440, x1: 1480, y0: 300, y1: 740 }, 3.4);
const S = { wall: '#3D4658', side: '#323A4A', floor: '#2F2D35', metal: '#4E5462', metalDark: '#393E4A' };
const GOODS = ['#C9583F', '#E2B04A', '#4F8FA6', '#7FAF6A', '#D97A9A', '#E8DFCC', '#8A6AA6', '#D98A3A'];

/** A shelf unit against the back wall: four shelves of packets, tins and bottles. */
const Shelves: React.FC<{ u0: number; u1: number; seed: number }> = ({ u0, u1, seed }) => {
  const R = SHOP;
  const levels = [0.3, 0.47, 0.64, 0.81];
  return (
    <g>
      <FloorShadow r={R} u={[u0, u1]} w={[0, 0.11]} />
      <Box r={R} u={[u0, u1]} v={[0.12, 1]} w={[0, 0.1]} front={S.metalDark} side={S.metal} top={S.metal} />
      {levels.map((v, si) => {
        const a = R.P(u0, v, 0.1);
        const b = R.P(u1, v, 0.1);
        const items: React.ReactNode[] = [];
        let x = a.x + 6;
        let k = 0;
        while (x < b.x - 22) {
          const w = 16 + rnd(seed, si * 31 + k) * 20;
          const h = 34 + rnd(seed + 1, si * 31 + k) * 34;
          items.push(<rect key={k} x={x} y={a.y - h} width={w} height={h} rx={2} fill={GOODS[Math.floor(rnd(seed + 2, si * 31 + k) * GOODS.length)]} />);
          items.push(<rect key={`l${k}`} x={x + 2} y={a.y - h * 0.62} width={w - 4} height={h * 0.26} fill="#FFFFFF" opacity={0.22} />);
          x += w + 3;
          k++;
        }
        return (
          <g key={si}>
            {items}
            <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke="#6A7080" strokeWidth={7} />
          </g>
        );
      })}
    </g>
  );
};

export const Shop: React.FC<{ t: number; id?: string; veil?: number }> = ({ t, id = 'shop', veil = 0.44 }) => {
  const R = SHOP;
  const { P } = R;
  return (
    <g>
      <RoomShell r={R} id={id} floor="tiles" wall={S.wall} side={S.side} floorC={S.floor} lines="#232129" />
      <BackWindow r={R} id={`${id}w`} t={t} x0={810} x1={1110} y0={350} y1={610} sun={{ x: 960, y: 600 }} cols={2} curtains={false} />
      <Shelves u0={0.02} u1={0.32} seed={81} />
      <Shelves u0={0.68} u1={0.98} seed={91} />
      {/* an aisle along the left wall and a chiller glowing on the right wall */}
      <FloorShadow r={R} u={[0, 0.08]} w={[0.2, 0.6]} />
      <Box r={R} u={[0, 0.08]} v={[0.42, 1]} w={[0.2, 0.6]} front={S.metalDark} side={S.metal} top={S.metal} />
      {Array.from({ length: 14 }).map((_, i) => {
        const p = P(0.08, 0.5 + (i % 3) * 0.16, 0.22 + (i % 5) * 0.075);
        return <rect key={`a${i}`} x={p.x - 8} y={p.y - 28} width={16} height={30} fill={GOODS[(i * 3) % GOODS.length]} opacity={0.9} />;
      })}
      <FloorShadow r={R} u={[0.92, 1]} w={[0.2, 0.62]} />
      <Box r={R} u={[0.92, 1]} v={[0.22, 1]} w={[0.2, 0.62]} front="#5A6474" side="#7FA6C0" top="#6A7484" />
      {(() => {
        const c = P(0.92, 0.5, 0.4);
        return <Glow x={c.x} y={c.y} r={260} kind="cool" o={0.32} />;
      })()}
      {/* a hanging till sign */}
      {(() => {
        const p = P(0.42, 0.24, 0.32);
        return (
          <g>
            <path d={`M ${p.x - 56} ${p.y - 110} L ${p.x - 56} ${p.y} M ${p.x + 56} ${p.y - 110} L ${p.x + 56} ${p.y}`} stroke="#1A1820" strokeWidth={4} />
            <rect x={p.x - 74} y={p.y - 4} width={148} height={56} rx={6} fill="#1E2430" stroke={S3.warm} strokeWidth={2} />
            <text x={p.x} y={p.y + 36} textAnchor="middle" fontFamily={FONT.ui} fontSize={32} fill="#F2C14E" letterSpacing={3}>QUẦY 3</text>
          </g>
        );
      })()}
      <Pendant r={R} u={0.3} w={0.42} v={0.2} t={t} />
      <Pendant r={R} u={0.62} w={0.42} v={0.2} t={t + 7} />
      <LightVeil id={`${id}veil`} lights={[[960, 480, 300], pendantLight(R, 0.3, 0.42, 0.2), pendantLight(R, 0.62, 0.42, 0.2), [1560, 560, 240], [860, 860, 440]]} o={veil} />
      {[0.3, 0.62].map((u) => {
        const [x, y] = pendantLight(R, u, 0.42, 0.2);
        return <Glow key={u} x={x} y={y - 34} r={240} o={0.3} />;
      })}
      <Dust t={t} seed={83} x0={760} y0={380} w={420} h={400} n={26} />
    </g>
  );
};

/** The till, drawn after the cashier: a counter, a moving belt (`belt` is the shot clock), a little till on a post, shopping. */
export const Checkout: React.FC<{ belt?: number }> = ({ belt = 0 }) => {
  const R = SHOP;
  const T = 0.72;
  const a = R.P(0.22, T - 0.02, 0.46);
  const b = R.P(0.66, T - 0.02, 0.46);
  const a2 = R.P(0.22, T - 0.02, 0.58);
  const b2 = R.P(0.66, T - 0.02, 0.58);
  const till = R.P(0.3, T - 0.02, 0.48);
  return (
    <g>
      <FloorShadow r={R} u={[0.2, 0.68]} w={[0.44, 0.62]} o={0.45} />
      <Box r={R} u={[0.22, 0.66]} v={[T, 1]} w={[0.45, 0.6]} front="#596273" side="#454D5C" />
      {[0.33, 0.44, 0.55].map((u) => {
        const p = R.P(u, T + 0.02, 0.6);
        const q = R.P(u, 0.98, 0.6);
        return <path key={u} d={`M ${p.x} ${p.y} L ${q.x} ${q.y}`} stroke="#454D5C" strokeWidth={4} />;
      })}
      <Box r={R} u={[0.2, 0.68]} v={[T - 0.02, T]} w={[0.44, 0.61]} front="#7A8494" top="#2A2C34" side="#596273" rim />
      {/* the belt's moving seams */}
      {Array.from({ length: 12 }).map((_, i) => {
        const k = ((i + belt * 0.08) % 12) / 12;
        return <path key={i} d={`M ${a.x + (b.x - a.x) * k} ${a.y} L ${a2.x + (b2.x - a2.x) * k} ${a2.y}`} stroke="#3C3F4A" strokeWidth={3} />;
      })}
      {/* shopping on the belt */}
      <rect x={1040} y={b.y - 56} width={46} height={72} rx={4} fill="#C9583F" />
      <rect x={1040} y={b.y - 30} width={46} height={22} fill="#F6EFE3" opacity={0.7} />
      <rect x={1100} y={b.y - 24} width={60} height={40} rx={3} fill="#E2B04A" />
      <ellipse cx={1190} cy={b.y + 6} rx={24} ry={14} fill="#E08A3A" />
      {/* the till on its post */}
      <path d={`M ${till.x} ${till.y} L ${till.x} ${till.y - 40}`} stroke="#1E1E26" strokeWidth={10} />
      <rect x={till.x - 54} y={till.y - 96} width={108} height={62} rx={6} fill="#1E1E26" />
      <rect x={till.x - 46} y={till.y - 88} width={92} height={46} rx={3} fill="#3FA68A" opacity={0.85} />
      <Glow x={till.x} y={till.y - 66} r={90} kind="cool" o={0.28} />
    </g>
  );
};
