// B"H
/**
 * @file level20.js
 * @description Chapter 627: Reish becomes the final furnace crossing.
 * The Awtsmoos crowns the ladder with the harshest legal rhythm: tight chips,
 * four living sweeps, and a victory island that remains reachable by law.
 */
import { island, block, crumb, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l20_start_reish_final_court', -37, 1.55, 0, 8, 5.3);
const b = block('l20_final_west_slab_hard', -29, 1.94, 5.8, 3, 2);
const m1 = moving('l20_final_first_sweep_hard', -21.4, 2.28, 0.2, 2.45, 1.8, 'z', 6.8, 0.88, 0.05);
const c = crumb('l20_final_chip_one_hard', -13.8, 2.62, -5.1);
const d = moving('l20_final_center_sweep_hard', -6.2, 2.94, 0, 2.45, 1.8, 'x', 6.4, 0.9, 0.33);
const e = crumb('l20_final_chip_two_hard', 1.4, 3.22, 5.1);
const f = moving('l20_final_last_ferry_hard', 9, 3.5, -0.4, 2.4, 1.75, 'z', 6.6, 0.92, 0.65);
const g = block('l20_final_exit_slab_hard', 16.7, 3.78, 4.4, 3, 2);
const m4 = moving('l20_final_reish_sweep_gate', 24.2, 3.98, 0, 2.4, 1.75, 'x', 6.2, 0.94, 0.82);
const h = island('l20_finish_reish_victory', 33.8, 4.14, 0, 7.4, 5);
export default level({ level: 20, title: 'Reish Final Furnace', description: 'The final legal lava crossing: four moving sweeps and the tightest victory path.', solid: [a,b,c,e,g,h], moving: [m1,d,f,m4], coinPlacements: [[b],[m1],[c],[d],[e],[f],[g],[m4]], boxOn: g, doorOn: h });
