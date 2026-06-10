// B"H
/** @file level10.js @description Chapter 591: First summit climb. */
import { island, block, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l10_start_yud_square', -27, 1.35, 0, 9, 6.2);
const b = block('l10_riser_one', -19, 1.62, 1.8, 4.7, 3);
const c = block('l10_riser_two', -12, 1.9, -2.4, 4.4, 2.9);
const d = block('l10_riser_three', -5, 2.18, 2.8, 4.2, 2.8);
const m1 = moving('l10_summit_ferry_a', 2.5, 2.4, 0, 3.6, 2.5, 'z', 3.5, 0.54, 0.1);
const e = block('l10_summit_rest', 10, 2.62, -2.6, 4.5, 3);
const m2 = moving('l10_summit_ferry_b', 17, 2.78, 0.8, 3.4, 2.4, 'x', 3.4, 0.56, 0.4);
const f = island('l10_finish_yud_summit', 25.5, 2.92, 0, 8.4, 6);
export default level({ level: 10, title: 'Yud Summit Climb', description: 'A manually stepped climb with two summit ferries.', solid: [a,b,c,d,e,f], moving: [m1,m2], coinPlacements: [[b],[c],[d],[m1],[e],[m2]], boxOn: e, doorOn: f });
