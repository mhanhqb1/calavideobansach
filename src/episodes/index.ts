// The registry: add each new episode here (one import, one entry). tools/new_book.py does it for you.
import { copyPaste } from './copy-paste';
import { dacNhanTam } from './dac-nhan-tam';
import { dacNhanTam5p } from './dac-nhan-tam-5p';

export const EPISODES = [copyPaste, dacNhanTam, dacNhanTam5p];
