import { defineVerticalEpisode, Timeline, Word, VerticalJson } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import episode from './episode.json';
import { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11 } from './shots';

// The CTA shot has "frame": "book" in episode.json: the engine draws the book card from episode.book.
export const dacNhanTam = defineVerticalEpisode('DacNhanTam', {
  timeline: timeline as Timeline,
  words: words as Word[],
  episode: episode as unknown as VerticalJson,
  shots: { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11 },
});
