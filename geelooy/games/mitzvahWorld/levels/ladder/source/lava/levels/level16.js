// B"H
/**
 * @file level16.js
 * @description Chapter 624: Ayin becomes triple timing over narrow anchors.
 * The Awtsmoos demands three different rhythms, but every platform remains a
 * deliberate safe vessel, never random cruelty.
 */
import { island, block, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l16_start_ayin_watch', -32, 1.45, 0, 8.4, 5.6);
const b = block('l16_timing_anchor_one_narrow', -24, 1.76, -3.6, 3.4, 2.25);
const m1 = moving('l16_fast_west_east_harder', -16.6, 2.04, 0.4, 2.8, 2, 'x', 5.8, 0.82, 0.1);
const c = block('l16_timing_anchor_two_narrow', -8.8, 2.34, 4.2, 3.3, 2.2);
const m2 = moving('l16_slow_north_south_long', -0.8, 2.62, -0.2, 2.9, 2, 'z', 6.1, 0.55, 0.4);
const d = block('l16_timing_anchor_three_narrow', 7.2, 2.88, -4.3, 3.2, 2.15);
const m3 = moving('l16_final_fast_ferry_harder', 15.2, 3.1, 0.9, 2.7, 1.95, 'x', 5.8, 0.84, 0.7);
const e = island('l16_finish_ayin_watch', 24.2, 3.26, 0, 7.8, 5.3);
export default level({ level: 16, title: 'Ayin Triple Timing', description: 'A harder timing exam with three rhythms and narrow anchors.', solid: [a,b,c,d,e], moving: [m1,m2,m3], coinPlacements: [[b],[m1],[c],[m2],[d],[m3]], boxOn: d, doorOn: e });
