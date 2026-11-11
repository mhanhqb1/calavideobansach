import React from 'react';
import { Hero, Look, Pose, basePose, Expr, LEG_LEN, HEAD, faceAt } from './rig';
import { clamp, backOut } from './anim';
import { FONT } from './fonts';

// Staging helpers every book episode reuses (kept from the earlier series): a character from a partial pose, feet on
// the ground, a talking close-up, a big pop-in word.

/** A character from a partial pose. */
export const A: React.FC<{ look: Look; p: Partial<Pose>; rim?: string; shadow?: number }> = ({ look, p, rim = 'rimR', shadow = 0.6 }) => (
  <Hero look={look} pose={{ ...basePose, ...p }} rimId={rim} shadow={shadow} />
);

/** Hip height for feet on the ground at y. */
export const hipY = (ground: number, scale: number) => ground - LEG_LEN * scale;

/** A pose whose head sits at (x, y) at scale sc: for close-ups. */
export const bigHead = (x: number, y: number, sc: number, yaw: number, extra: Partial<Pose> = {}): Pose => ({
  ...basePose, x, y: y - HEAD.y * sc, scale: sc, yaw, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...extra,
});

/** A talking close-up: a blurred set behind, a head filling the frame, faces swapping through blinks. */
export const Close: React.FC<{ t: number; look: Look; bg: React.ReactNode; faces: [number, Expr][]; yaw?: number; sc?: number; rim?: string; look2?: number; x?: number; y?: number; tilt?: number; dark?: number; push?: number; blink?: number }> = ({ t, look, bg, faces, yaw = 0.25, sc = 3.6, rim = 'rimR', look2 = 0, x = 960, y = 590, tilt = 0, dark = 0.28, push = 0.04, blink }) => (
  <g>
    <g filter="url(#blur16)">{bg}</g>
    <rect x={-100} y={-100} width={2120} height={1280} fill="#07040C" opacity={dark} />
    <g transform={`translate(${x} ${y}) scale(${1 + push * clamp(t / 40)}) translate(${-x} ${-y})`}>
      <Hero look={look} pose={bigHead(x, y, sc, yaw, { ...faceAt(t, faces), ...(blink === undefined ? {} : { blink }), look: look2, headTilt: tilt })} shadow={0} rimId={rim} />
    </g>
  </g>
);

/** A word in the title face, popping in, for the few moments a shot needs one inside the picture. */
export const BigWord: React.FC<{ x: number; y: number; t: number; text: string; size?: number; color?: string; r?: number }> = ({ x, y, t, text, size = 120, color = '#FFF3DC', r = 0 }) =>
  t < 0 ? null : (
    <text transform={`translate(${x} ${y}) rotate(${r}) scale(${backOut(clamp(t / 7))})`} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={size} fill={color} stroke="#1A1230" strokeWidth={size / 10} paintOrder="stroke">
      {text}
    </text>
  );
