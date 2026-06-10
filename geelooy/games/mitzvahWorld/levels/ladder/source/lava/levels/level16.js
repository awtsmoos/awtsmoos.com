// B"H
/** @file level16.js @description Chapter 597: Ayin double timing. */
import { island, block, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l16_start_ayin_watch', -31, 1.45, 0, 8.8, 5.8);
const b = block('l16_timing_anchor_one', -23, 1.72, -2.8, 3.9, 2.6);
const m1 = moving('l16_fast_west_east', -16, 1.98, 0, 3.1, 2.2, 'x', 4.8, 0.72, 0.1);
const c = block('l16_timing_anchor_two', -8.8, 2.22, 3, 3.8, 2.5);
const m2 = moving('l16_slow_north_south', -1.8, 2.46, 0, 3.2, 2.2, 'z', 5, 0.44, 0.4);
const d = block('l16_timing_anchor_three', 5.4, 2.66, -3, 3.7, 2.5);
const m3 = moving('l16_final_fast_ferry', 12.5, 2.84, 0.8, 3, 2.1, 'x', 4.2, 0.68, 0.7);
const e = island('l16_finish_ayin_watch', 21, 3, 0, 8, 5.6);
export default level({ level: 16, title: 'Ayin Double Timing', description: 'Manual timing test with fast and slow moving ferries.', solid: [a,b,c,d,e], moving: [m1,m2,m3], coinPlacements: [[b],[m1],[c],[m2],[d],[m3]], boxOn: d, doorOn: e });
