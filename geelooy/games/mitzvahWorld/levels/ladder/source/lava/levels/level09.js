// B"H
/** @file level09.js @description Chapter 590: Split choice path. */
import { island, block, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l9_start_split_gate', -26, 1.3, 0, 9, 6.2);
const b1 = block('l9_upper_choice_a', -18, 1.5, 4.3, 4.8, 3.1);
const b2 = block('l9_lower_choice_a', -18, 1.5, -4.3, 4.8, 3.1);
const c = block('l9_choice_merge', -9.5, 1.72, 0, 5.2, 3.3);
const m1 = moving('l9_merge_mover_x', -1.5, 1.9, 0, 4, 2.7, 'x', 3.2, 0.5, 0.25);
const d1 = block('l9_upper_choice_b', 7, 2.06, 3.8, 4.5, 3);
const d2 = block('l9_lower_choice_b', 7, 2.06, -3.8, 4.5, 3);
const e = block('l9_final_merge_step', 15.5, 2.22, 0, 4.8, 3.2);
const f = island('l9_finish_tes_gate', 24.5, 2.34, 0, 8.8, 6.2);
export default level({ level: 9, title: 'Tes Split Choice', description: 'Two side choices manually converge through a moving bridge.', solid: [a,b1,b2,c,d1,d2,e,f], moving: [m1], coinPlacements: [[b1],[b2],[c],[m1],[d1],[d2],[e]], boxOn: e, doorOn: f });
