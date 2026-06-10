// B"H
/** @file level11.js @description Chapter 592: Kaf teaches offset landing discipline. */
import { island, block, crumb, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l11_start_kaf_anvil', -28, 1.35, 0, 9, 6.1);
const b = block('l11_high_left_anvil', -20, 1.58, 4.5, 4.7, 3);
const c = crumb('l11_tiny_center_spark', -13.2, 1.78, 0.6);
const d = block('l11_low_right_anvil', -6.5, 2, -4.1, 4.6, 3);
const m1 = moving('l11_cross_mover_south', 1.5, 2.18, -0.7, 3.5, 2.4, 'z', 3.9, 0.58, 0.2);
const e = crumb('l11_tiny_north_spark', 8.2, 2.36, 3.6);
const f = block('l11_final_anvil_read', 15.2, 2.54, -1.5, 4.3, 2.8);
const g = island('l11_finish_kaf_seat', 24, 2.66, 0, 8.4, 6);
export default level({ level: 11, title: 'Kaf Offset Anvils', description: 'Manual late-beginner course with crumb landings and one cross mover.', solid: [a,b,c,d,e,f,g], moving: [m1], coinPlacements: [[b],[c],[d],[m1],[e],[f]], boxOn: f, doorOn: g });
