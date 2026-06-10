// B"H
/** @file level08.js @description Chapter 589: Crescent of crumbs. */
import { island, block, crumb, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l8_start_crescent_base', -25, 1.3, 0, 9, 6.1);
const b = block('l8_crescent_wide_one', -17, 1.48, -3.4, 5, 3.2);
const c = crumb('l8_crescent_crumb_a', -10.8, 1.62, -1.2);
const d = crumb('l8_crescent_crumb_b', -5.6, 1.76, 2.2);
const e = block('l8_crescent_wide_two', 1.2, 1.9, 4, 4.8, 3.1);
const m1 = moving('l8_crosswind_mover', 8.5, 2.05, 0.8, 3.6, 2.5, 'z', 3.6, 0.52, 0.1);
const f = block('l8_last_crescent_step', 16.5, 2.18, -2.8, 4.4, 3);
const g = island('l8_finish_ches_shelter', 25.5, 2.28, 0, 8.6, 6.2);
export default level({ level: 8, title: 'Ches Crescent Path', description: 'A handmade crescent with two tiny crumb jumps.', solid: [a,b,c,d,e,f,g], moving: [m1], coinPlacements: [[b],[c],[d],[e],[m1],[f]], boxOn: f, doorOn: g });
