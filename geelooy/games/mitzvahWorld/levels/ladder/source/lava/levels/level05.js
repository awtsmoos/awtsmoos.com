// B"H
/** @file level05.js @description Chapter 586: First rhythm course. */
import { island, block } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l5_start_rhythm_island', -23, 1.25, 0, 9, 6.4);
const b = block('l5_one_beat', -15, 1.42, 2.8, 5.1, 3.3);
const c = block('l5_two_beat', -8, 1.58, -2.6, 4.7, 3.1);
const d = block('l5_three_beat', -1, 1.74, 2.4, 4.4, 3);
const e = block('l5_four_beat', 6.4, 1.9, -2.2, 4.2, 2.9);
const f = block('l5_five_beat', 14, 2.04, 2, 4.1, 2.8);
const g = block('l5_last_beat', 21.5, 2.16, 0, 4.5, 3.1);
const h = island('l5_finish_heh_balcony', 30, 2.2, 0, 8.6, 6.2);
export default level({ level: 5, title: 'Hei Five Beats', description: 'A hand-paced rhythm line with rising lava pressure.', solid: [a,b,c,d,e,f,g,h], coinPlacements: [[b],[c],[d],[e],[f],[g]], boxOn: g, doorOn: h });
