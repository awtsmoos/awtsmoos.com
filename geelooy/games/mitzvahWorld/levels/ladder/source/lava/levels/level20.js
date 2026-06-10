// B"H
/** @file level20.js @description Chapter 601: Reish final crossing. */
import { island, block, crumb, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l20_start_reish_final_court', -34, 1.55, 0, 8.5, 5.7);
const b = block('l20_final_west_slab', -26, 1.9, 4.8, 3.4, 2.3);
const m1 = moving('l20_final_first_sweep', -19, 2.18, 0, 2.8, 2, 'z', 5.8, 0.72, 0.05);
const c = crumb('l20_final_chip_one', -12.2, 2.46, -4.2);
const d = block('l20_final_center_rest', -5.5, 2.74, 0, 3.6, 2.4);
const m2 = moving('l20_final_second_sweep', 1.2, 3.02, 4, 2.8, 2, 'x', 5.4, 0.76, 0.33);
const e = crumb('l20_final_chip_two', 8, 3.24, -3.8);
const f = moving('l20_final_last_ferry', 14.8, 3.42, 0, 2.7, 2, 'z', 5.6, 0.78, 0.65);
const g = block('l20_final_exit_slab', 21.6, 3.58, 3.2, 3.3, 2.3);
const h = island('l20_finish_reish_victory', 30, 3.7, 0, 8, 5.5);
export default level({ level: 20, title: 'Reish Final Crossing', description: 'The final handmade lava crossing: tight chips, fast ferries, and a victory island.', solid: [a,b,c,d,e,g,h], moving: [m1,m2,f], coinPlacements: [[b],[m1],[c],[d],[m2],[e],[f],[g]], boxOn: g, doorOn: h });
