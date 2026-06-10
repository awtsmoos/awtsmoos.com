// B"H
/** @file level13.js @description Chapter 594: Mem river stones. */
import { island, block, crumb, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l13_start_mem_bank', -29, 1.4, 0, 9, 6);
const b = crumb('l13_river_stone_a', -22, 1.62, -2.8);
const c = crumb('l13_river_stone_b', -16.4, 1.82, 1.8);
const d = block('l13_flat_midstone', -9.8, 2.04, 4.2, 4.1, 2.8);
const m1 = moving('l13_slow_river_ferry', -2.4, 2.24, 0.2, 3.4, 2.4, 'z', 4.2, 0.5, 0.3);
const e = crumb('l13_river_stone_c', 5.2, 2.44, -3.8);
const f = block('l13_right_bank_wide', 12.8, 2.62, 1.8, 4.4, 2.9);
const m2 = moving('l13_last_small_ferry', 20, 2.78, 0, 3.2, 2.2, 'x', 3.4, 0.58, 0.55);
const g = island('l13_finish_mem_bank', 28, 2.9, 0, 8.2, 5.8);
export default level({ level: 13, title: 'Mem River Stones', description: 'Manual stepping-stone course over a broad lava river.', solid: [a,b,c,d,e,f,g], moving: [m1,m2], coinPlacements: [[b],[c],[d],[m1],[e],[f],[m2]], boxOn: f, doorOn: g });
