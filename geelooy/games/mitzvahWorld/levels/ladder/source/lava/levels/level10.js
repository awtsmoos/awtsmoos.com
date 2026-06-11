// B"H
/**
 * @file level10.js
 * @description Chapter 635: Yud becomes a measured summit exam.
 * The Awtsmoos raises Tes into summit discipline without leaping beyond Kaf:
 * harder than level nine, but still the first step of the middle ascent.
 */
import { island, block, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l10_start_yud_square', -27.2, 1.35, 0, 8.9, 6.1);
const b = block('l10_riser_one_measured', -19.4, 1.62, 2.25, 4.6, 3);
const c = block('l10_riser_two_measured', -12, 1.88, -2.65, 4.3, 2.85);
const d = block('l10_riser_three_measured', -4.7, 2.14, 2.8, 4.1, 2.75);
const m1 = moving('l10_summit_ferry_a_measured', 2.7, 2.38, -0.2, 3.4, 2.35, 'z', 3.9, 0.58, 0.1);
const e = block('l10_summit_rest_measured', 10.1, 2.6, -2.7, 4.1, 2.75);
const m2 = moving('l10_summit_ferry_b_measured', 17.3, 2.78, 0.9, 3.3, 2.3, 'x', 3.9, 0.6, 0.4);
const f = island('l10_finish_yud_summit', 25.6, 2.92, 0, 8.3, 5.9);
export default level({ level: 10, title: 'Yud Summit Exam', description: 'A measured summit exam: harder than Tes, gentler than Kaf.', solid: [a,b,c,d,e,f], moving: [m1,m2], coinPlacements: [[b],[c],[d],[m1],[e],[m2]], boxOn: e, doorOn: f });
