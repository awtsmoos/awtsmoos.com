// B"H
/**
 * @file level19.js
 * @description Chapter 626: Kuf becomes the narrow crown before the end.
 * The Awtsmoos sharpens the penultimate crown beyond Tzadi: more sweep, thinner
 * chips, and a longer final read while keeping every gap under the safety law.
 */
import { island, block, crumb, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l19_start_kuf_crown', -35, 1.5, 0, 8.2, 5.4);
const b = block('l19_crown_left_slab_hard', -27, 1.86, -5.8, 3.1, 2.05);
const c = crumb('l19_crown_chip_one_hard', -20.2, 2.16, -1.8);
const m1 = moving('l19_crown_sweep_one_hard', -13.2, 2.48, 3.2, 2.55, 1.85, 'z', 6.4, 0.82, 0.1);
const d = crumb('l19_crown_chip_two_hard', -5.9, 2.78, -4.4);
const e = block('l19_crown_center_slab_hard', 1.6, 3.06, 4.9, 3, 2);
const m2 = moving('l19_crown_sweep_two_hard', 9.2, 3.32, 0, 2.5, 1.85, 'x', 6.2, 0.86, 0.45);
const f = crumb('l19_crown_chip_three_hard', 16.8, 3.54, -4.2);
const g = moving('l19_crown_last_sweep_hard', 24.2, 3.72, 2.1, 2.5, 1.85, 'z', 5.8, 0.88, 0.7);
const h = island('l19_finish_kuf_crown', 33.5, 3.88, 0, 7.4, 5.1);
export default level({ level: 19, title: 'Kuf Narrow Crown Trial', description: 'The penultimate crown: tight chips, three sweeps, and fierce timing.', solid: [a,b,c,d,e,f,h], moving: [m1,m2,g], coinPlacements: [[b],[c],[m1],[d],[e],[m2],[f],[g]], boxOn: f, doorOn: h });
