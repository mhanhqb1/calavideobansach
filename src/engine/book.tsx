import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from 'remotion';
import { clamp, backOut, easeOut, easeInOut } from './anim';
import { FONT } from './fonts';
import { STUDIO } from '../studio.config';

// The product side of a book affiliate video: the book's data (from episode.json "book"), its cover (the real image
// from the shop page, or a drawn stand-in), and the end card with the call to action. No price and no cart in the
// picture: TikTok and Facebook show the product link and cart themselves.

export type BookInfo = {
  title: string;
  author?: string;
  /** The cover image in public/, e.g. "dac-nhan-tam/cover.jpg" (portrait, about 2:3). Leave out to draw a stand-in. */
  cover?: string;
  /** A small label above the cover: "BÁN CHẠY", "SÁCH KINH ĐIỂN"... */
  badge?: string;
  /** tiktok | facebook | shopee | lazada | other: picks the default call to action. */
  platform?: string;
  /** Overrides the call to action text on the button. */
  cta?: string;
  /** One line under the button. */
  sub?: string;
  /** The affiliate disclosure. Default: "Video có gắn link tiếp thị liên kết". false hides it. */
  disclosure?: string | false;
  /** The stand-in cover's colour. */
  color?: string;
};

export const PALETTE = {
  bg: '#0F0E22',
  bg2: '#2A1640',
  cart: '#FFD43B', // TikTok Shop's yellow cart
  cartInk: '#1B1406',
  sale: '#FF3B5C',
  text: '#FFFFFF',
  dim: '#C9C3E0',
};


const CTA_DEFAULT: Record<string, { cta: string; sub: string }> = {
  tiktok: { cta: 'LINK SÁCH Ở NGAY BÊN DƯỚI', sub: 'Đọc thử vài trang, bạn sẽ hiểu' },
  facebook: { cta: 'LINK SÁCH Ở NGAY BÊN DƯỚI', sub: 'Đọc thử vài trang, bạn sẽ hiểu' },
  shopee: { cta: 'BẤM VÀO SẢN PHẨM BÊN DƯỚI', sub: 'Đọc thử vài trang, bạn sẽ hiểu' },
  lazada: { cta: 'LINK MUA Ở BÌNH LUẬN GHIM', sub: 'Mua trên Lazada' },
  other: { cta: 'LINK MUA Ở BÌNH LUẬN GHIM', sub: 'Hoặc xem link trong bio' },
};
export const ctaText = (b: BookInfo) => {
  const d = CTA_DEFAULT[b.platform ?? 'tiktok'] ?? CTA_DEFAULT.other;
  return { cta: b.cta ?? d.cta, sub: b.sub ?? d.sub };
};

/** The yellow cart. */
export const CartIcon: React.FC<{ size?: number; color?: string }> = ({ size = 56, color = PALETTE.cartInk }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M 4 8 L 10 8 L 15 30 L 38 30 L 43 14 L 13 14" fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={18} cy={38} r={3.6} fill={color} />
    <circle cx={35} cy={38} r={3.6} fill={color} />
  </svg>
);

/** A drawn cover when there's no image yet: a coloured board, the title and author in the caption face. */
const DrawnCover: React.FC<{ b: BookInfo; w: number; h: number }> = ({ b, w, h }) => (
  <div style={{ width: w, height: h, background: `linear-gradient(160deg, ${b.color ?? '#C8432B'} 0%, #2A1220 120%)`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: w * 0.09, boxSizing: 'border-box', color: '#FFF6E6', fontFamily: FONT.vn }}>
    <div style={{ fontSize: w * 0.05, letterSpacing: 4, opacity: 0.8, fontWeight: 700 }}>{(b.author ?? '').toLocaleUpperCase('vi')}</div>
    <div style={{ fontSize: w * (b.title.length > 18 ? 0.11 : 0.15), lineHeight: 1.05, fontWeight: 900 }}>{b.title.toLocaleUpperCase('vi')}</div>
    <div style={{ height: 6, width: '40%', background: '#FFD43B' }} />
  </div>
);

/** The book as an object: cover, page edges on the right, a shadow, an optional shine sweep (0..1). */
export const BookObject: React.FC<{ b: BookInfo; w: number; shine?: number; style?: React.CSSProperties }> = ({ b, w, shine = -1, style }) => {
  const h = Math.round(w * 1.45);
  const th = Math.round(w * 0.06); // page block thickness
  return (
    <div style={{ position: 'relative', width: w + th, height: h, ...style }}>
      <div style={{ position: 'absolute', left: w - 4, top: th * 0.6, width: th + 4, height: h - th * 1.2, background: 'repeating-linear-gradient(90deg, #F4EEE2 0 3px, #D8D0C0 3px 5px)', borderRadius: '0 6px 6px 0' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'hidden', borderRadius: 6, boxShadow: '0 40px 80px rgba(0,0,0,0.55), 0 8px 18px rgba(0,0,0,0.4)' }}>
        {b.cover ? <Img src={staticFile(b.cover)} style={{ width: w, height: h, objectFit: 'cover' }} /> : <DrawnCover b={b} w={w} h={h} />}
        {/* the spine's crease */}
        <div style={{ position: 'absolute', left: w * 0.035, top: 0, width: w * 0.02, height: h, background: 'linear-gradient(90deg, rgba(0,0,0,0.25), rgba(255,255,255,0.18), rgba(0,0,0,0))' }} />
        {shine >= 0 && shine <= 1 ? (
          <div style={{ position: 'absolute', top: -h * 0.2, left: -w + shine * w * 2.6, width: w * 0.35, height: h * 1.4, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.45), rgba(255,255,255,0))' }} />
        ) : null}
      </div>
    </div>
  );
};

/** The cover inside a 16:9 shot (SVG): a character can hold it, it can sit on a desk. Waits for the image to load. */
export const SvgBook: React.FC<{ b: BookInfo; x: number; y: number; w: number; rot?: number }> = ({ b, x, y, w, rot = 0 }) => {
  const h = w * 1.45;
  const [handle] = useState(() => (b.cover ? delayRender(`cover ${b.cover}`) : null));
  useEffect(() => {
    if (!b.cover || handle === null) return;
    const im = new Image();
    im.onload = () => continueRender(handle);
    im.onerror = () => continueRender(handle);
    im.src = staticFile(b.cover);
  }, [b.cover, handle]);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={4} fill="#000" opacity={0.35} />
      <rect x={w / 2 - 2} y={-h / 2 + 5} width={w * 0.06} height={h - 10} fill="#EEE6D6" />
      {b.cover ? (
        <image href={staticFile(b.cover)} x={-w / 2} y={-h / 2} width={w} height={h} preserveAspectRatio="xMidYMid slice" />
      ) : (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={3} fill={b.color ?? '#C8432B'} />
          <text y={-h * 0.05} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={w * 0.14} fill="#FFF6E6">
            {b.title.toLocaleUpperCase('vi').split(' ').slice(0, 2).join(' ')}
          </text>
          <text y={h * 0.1} textAnchor="middle" fontFamily={FONT.vn} fontWeight={900} fontSize={w * 0.14} fill="#FFF6E6">
            {b.title.toLocaleUpperCase('vi').split(' ').slice(2, 4).join(' ')}
          </text>
          <rect x={-w * 0.2} y={h * 0.3} width={w * 0.4} height={5} fill="#FFD43B" />
        </g>
      )}
    </g>
  );
};

/** The end card, full 1080 x 1920: badge, cover, title, a call to action pointing at the platform's own product link
 * (TikTok and Facebook show the cart themselves, so no cart and no price here), the disclosure. */
export const BookCTA: React.FC<{ t: number; len: number; book: BookInfo }> = ({ t, book: b }) => {
  const k = (d: number, dur = 9) => backOut(clamp((t - d) / dur));
  const { cta, sub } = ctaText(b);
  const pulse = 1 + 0.04 * Math.max(0, Math.sin((t - 14) * 0.32));
  const bob = Math.sin(t * 0.3) * 14;
  const coverW = 540;
  const float = Math.sin(t * 0.12) * 8;
  const titleSize = b.title.length > 28 ? 62 : 76;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, ${PALETTE.bg2} 0%, ${PALETTE.bg} 70%)`, fontFamily: FONT.vn, color: PALETTE.text }}>
      {/* a warm spotlight behind the book */}
      <div style={{ position: 'absolute', left: 540 - 560, top: 660 - 560, width: 1120, height: 1120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,190,90,0.38) 0%, rgba(255,150,60,0) 65%)', opacity: easeOut(clamp(t / 12)) }} />
      {b.disclosure !== false ? (
        <div style={{ position: 'absolute', top: 96, width: '100%', textAlign: 'center', fontSize: 30, color: PALETTE.dim, fontWeight: 500 }}>{b.disclosure ?? 'Video có gắn link tiếp thị liên kết'}</div>
      ) : null}
      {b.badge ? (
        <div style={{ position: 'absolute', top: 160, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ transform: `scale(${k(4, 7)})`, background: PALETTE.sale, padding: '12px 34px', borderRadius: 40, fontSize: 40, fontWeight: 900, letterSpacing: 2 }}>{b.badge.toLocaleUpperCase('vi')}</div>
        </div>
      ) : null}
      <div style={{ position: 'absolute', top: 260, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `translateY(${(1 - easeOut(clamp(t / 12))) * 500 + float}px) rotate(${-6 + 3 * easeInOut(clamp(t / 20))}deg) scale(${0.85 + 0.15 * k(0, 12)})` }}>
          <BookObject b={b} w={coverW} shine={(t - 14) / 16} />
        </div>
      </div>
      <div style={{ position: 'absolute', top: 1090, width: '100%', padding: '0 70px', boxSizing: 'border-box', textAlign: 'center', opacity: clamp((t - 6) / 6), transform: `translateY(${(1 - easeOut(clamp((t - 6) / 10))) * 40}px)` }}>
        <div style={{ fontSize: titleSize, fontWeight: 900, lineHeight: 1.1 }}>{b.title}</div>
        {b.author ? <div style={{ fontSize: 42, fontWeight: 500, color: PALETTE.dim, marginTop: 12 }}>{b.author}</div> : null}
      </div>
      <div style={{ position: 'absolute', top: 1330, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${k(12, 8) * pulse})`, background: PALETTE.cart, color: PALETTE.cartInk, padding: '30px 56px', borderRadius: 90, fontSize: cta.length > 24 ? 48 : 54, fontWeight: 900, boxShadow: '0 14px 0 #B8901A, 0 24px 50px rgba(0,0,0,0.45)' }}>
          {cta}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 1500, width: '100%', textAlign: 'center', fontSize: 38, fontWeight: 700, color: PALETTE.text, opacity: clamp((t - 16) / 6) }}>{sub}</div>
      {/* the arrow to the platform's own product link below the video */}
      <svg width={120} height={120} viewBox="0 0 120 120" style={{ position: 'absolute', left: 480, top: 1560 + bob, opacity: clamp((t - 18) / 6) }}>
        <path d="M 60 10 L 60 90 M 26 58 L 60 92 L 94 58" stroke={PALETTE.cart} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      {STUDIO.channel ? <div style={{ position: 'absolute', bottom: 40, right: 50, fontSize: 30, color: PALETTE.dim, opacity: 0.8 }}>{STUDIO.channel}</div> : null}
    </AbsoluteFill>
  );
};
