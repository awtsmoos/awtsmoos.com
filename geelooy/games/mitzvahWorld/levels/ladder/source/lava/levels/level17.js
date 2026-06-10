// B"H
/** @file level17.js @description Chapter 598: Pei broken bridge. */
import { island, block, crumb, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l17_start_pei_broken_bridge', -31, 1.45, 0, 8.8, 5.8);
const b = block('l17_broken_slab_one', -23.5, 1.74, 2.4, 3.8, 2.5);
const c = crumb('l17_broken_chip_one', -18, 1.98, -1.3);
const d = crumb('l17_broken_chip_two', -12.8, 2.18, 2.7);
const m1 = moving('l17_missing_span_ferry', -6.6, 2.4, 0, 3.1, 2.2, 'z', 4.8, 0.62, 0.15);
const e = crumb('l17_broken_chip_three', 0.4, 2.6, -3.2);
const f = block('l17_broken_slab_two', 7.4, 2.78, 1.8, 3.8, 2.5);
const m2 = moving('l17_final_missing_span', 14.5, 2.96, 0, 3, 2.1, 'x', 4, 0.64, 0.5);
const g = island('l17_finish_pei_bridge', 23, 3.1, 0, 8, 5.6);
export default level({ level: 17, title: 'Pei Broken Bridge', description: 'A hand-authored broken bridge with small chips and ferries.', solid: [a,b,c,d,e,f,g], moving: [m1,m2], coinPlacements: [[b],[c],[d],[m1],[e],[f],[m2]], boxOn: f, doorOn: g });
