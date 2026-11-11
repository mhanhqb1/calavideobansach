// The studio's settings.
// Shots are always drawn in a 1920 x 1080 world. A classic episode (defineEpisode) renders at that size; a book
// affiliate episode (defineVerticalEpisode) renders 9:16 for TikTok / Shopee Video / Reels and shows each shot through
// a window inside the vertical frame.
export const STUDIO = {
  fps: 30,
  width: 1920,
  height: 1080,
  vertical: { width: 1080, height: 1920 },
  /**
   * A local display face for titles, as a file in public/ (your brand font, say). null uses Bricolage Grotesque
   * from Google Fonts. It must include Vietnamese glyphs. Example: { family: 'My Brand Font', file: 'fonts/MyBrandFont.woff2', weight: '200 700' }
   */
  titleFont: null as null | { family: string; file: string; weight: string },
  /** The channel name shown small on the book card and the cover frame (leave '' to hide). */
  channel: '',
};
