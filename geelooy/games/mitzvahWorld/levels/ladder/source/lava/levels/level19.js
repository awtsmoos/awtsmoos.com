// B"H
/** @file level19.js @description Chapter 600: Kuf narrow crown. */
import { island, block, crumb, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l19_start_kuf_crown', -33, 1.5, 0, 8.5, 5.7);
const b = block('l19_crown_left_slab', -25, 1.82, -4.8, 3.5, 2.3);
const c = crumb('l19_crown_chip_one', -19.5, 2.08, -1.3);
const m1 = moving('l19_crown_sweep_one', -13.5, 2.34, 2.6, 2.8, 2, 'z', 5.5, 0.68, 0.1);
const d = crumb('l19_crown_chip_two', -7.4, 2.58, -3.2);
const e = block('l19_crown_center_slab', -1, 2.82, 3.8, 3.4, 2.3);
const m2 = moving('l19_crown_sweep_two', 6, 3.04, 0, 2.7, 2, 'x', 5.2, 0.7, 0.45);
const f = crumb('l19_crown_chip_three', 13, 3.2, -2.8);
const g = block('l19_crown_exit_slab', 20, 3.34, 1.6, 3.4, 2.3);
const h = island('l19_finish_kuf_crown', 28.5, 3.46, 0, 7.8, 5.4);
export default level({ level: 19, title: 'Kuf Narrow Crown', description: 'A tight hand-authored crown course with tiny chips.', solid: [a,b,c,d,e,f,g,h], moving: [m1,m2], coinPlacements: [[b],[c],[m1],[d],[e],[m2],[f],[g]], boxOn: g, doorOn: h });
