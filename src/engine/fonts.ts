import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import { loadFont as loadBricolage } from '@remotion/google-fonts/BricolageGrotesque';
import { loadFont as loadMono } from '@remotion/google-fonts/RobotoMono';
import { loadFont as loadHand } from '@remotion/google-fonts/PatrickHand';
import { loadFont as loadVN } from '@remotion/google-fonts/BeVietnamPro';
import { STUDIO } from '../studio.config';

// Four faces, all with the Vietnamese subset (dấu tiếng Việt): a heavy display face for titles, a mono for on-screen
// readouts (timers, labels, chips), a handwriting face for chalk and notes, and Be Vietnam Pro for the burned-in
// captions, hooks and the book card. The Google faces load at render time (they need a connection); a local title
// face from studio.config.ts loads from public/ and works offline.

loadBricolage('normal', { weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext', 'vietnamese'] });
loadMono('normal', { weights: ['400', '700'], subsets: ['latin', 'latin-ext', 'vietnamese'] });
loadHand('normal', { weights: ['400'], subsets: ['latin', 'latin-ext', 'vietnamese'] });
loadVN('normal', { weights: ['500', '700', '800', '900'], subsets: ['latin', 'latin-ext', 'vietnamese'] });
if (STUDIO.titleFont) loadFont({ family: STUDIO.titleFont.family, url: staticFile(STUDIO.titleFont.file), weight: STUDIO.titleFont.weight });

export const FONT = {
  title: STUDIO.titleFont ? STUDIO.titleFont.family : 'Bricolage Grotesque',
  ui: 'Roboto Mono',
  hand: 'Patrick Hand',
  /** Captions, hooks, prices: the face TikTok viewers read at a glance. */
  vn: 'Be Vietnam Pro',
};
