// B"H
/**
 * @file level17.js
 * @description Chapter 634: Pei becomes the broken bridge of small vessels.
 * The Awtsmoos fractures the bridge beyond Ayin while leaving room for Tzadi to
 * rise higher: tighter chips, two stronger ferries, and a measured finish.
 */
import { island, block, crumb, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l17_start_pei_broken_bridge', -33.4, 1.45, 0, 8.1, 5.35);
const b = block('l17_broken_slab_one_narrow', -25.2, 1.8, 3.5, 3.15, 2.1);
const c = crumb('l17_broken_chip_one_tight', -18.2, 2.08, -2.9);
const d = crumb('l17_broken_chip_two_tight', -11.2, 2.38, 3.9);
const m1 = moving('l17_missing_span_ferry_hard', -3.9, 2.68, -0.4, 2.6, 1.9, 'z', 6.2, 0.83, 0.15);
const e = crumb('l17_broken_chip_three_tight', 3.6, 2.94, -4.8);
const f = block('l17_broken_slab_two_narrow', 11.3, 3.16, 2.8, 3.1, 2.05);
const m2 = moving('l17_final_missing_span_hard', 19.1, 3.36, -0.2, 2.6, 1.9, 'x', 6.1, 0.84, 0.5);
const g = island('l17_finish_pei_bridge', 28.7, 3.52, 0, 7.5, 5.15);
export default level({ level: 17, title: 'Pei Broken Vessels', description: 'A fractured bridge with tiny chips and stronger ferries.', solid: [a,b,c,d,e,f,g], moving: [m1,m2], coinPlacements: [[b],[c],[d],[m1],[e],[f],[m2]], boxOn: f, doorOn: g });
