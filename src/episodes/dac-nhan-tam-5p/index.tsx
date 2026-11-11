import { defineVerticalEpisode, Timeline, Word, VerticalJson, ShotMap } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import episode from './episode.json';
import * as all from './shots';

// Every export of shots.tsx named S<number> is a shot. CTA has "frame": "book": the engine draws the book card.
const shots: ShotMap = Object.fromEntries(Object.entries(all).filter(([k]) => /^S\d+$/.test(k))) as ShotMap;

export const dacNhanTam5p = defineVerticalEpisode('DacNhanTam5p', {
  timeline: timeline as Timeline,
  words: words as Word[],
  episode: episode as unknown as VerticalJson,
  shots,
});
