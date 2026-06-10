// B"H
/** @file level12.js @description Chapter 593: Lamed ladder turnback. */
import { island, block, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l12_start_lamed_base', -28, 1.38, 0, 9, 6);
const b = block('l12_rung_one', -21, 1.64, 3.8, 4.5, 2.9);
const c = block('l12_rung_two', -15, 1.9, 0.3, 4.2, 2.7);
const d = block('l12_rung_three', -9, 2.16, -3.5, 4.1, 2.7);
const m1 = moving('l12_turnback_mover', -1.8, 2.42, -1, 3.6, 2.5, 'x', 4.1, 0.55, 0.25);
const e = block('l12_return_north_rung', 6, 2.62, 3.4, 4, 2.7);
const f = block('l12_final_lamed_rung', 13.2, 2.82, 0, 4.2, 2.8);
const g = island('l12_finish_lamed_roof', 22, 2.98, 0, 8.4, 6);
export default level({ level: 12, title: 'Lamed Turnback Ladder', description: 'A hand-authored ladder route that bends back before the finish.', solid: [a,b,c,d,e,f,g], moving: [m1], coinPlacements: [[b],[c],[d],[m1],[e],[f]], boxOn: f, doorOn: g });
