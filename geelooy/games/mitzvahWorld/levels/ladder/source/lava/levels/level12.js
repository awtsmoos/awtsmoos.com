// B"H
/**
 * @file level12.js
 * @description Chapter 622: Lamed turns back with sharper teeth.
 * The Awtsmoos bends the ladder into longer offsets and a stronger mover while
 * preserving reachable feet and clear readable platforms.
 */
import { island, block, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l12_start_lamed_base', -29, 1.38, 0, 8.6, 5.8);
const b = block('l12_rung_one_sharp', -21.3, 1.68, 4.8, 4, 2.5);
const c = block('l12_rung_two_sharp', -14.4, 1.98, -0.8, 3.8, 2.4);
const d = block('l12_rung_three_sharp', -7.5, 2.28, -5.1, 3.6, 2.4);
const m1 = moving('l12_turnback_mover_sharp', 0.4, 2.58, -0.6, 3, 2.1, 'x', 5.6, 0.66, 0.25);
const e = block('l12_return_north_rung_sharp', 8.3, 2.82, 4.8, 3.5, 2.3);
const f = block('l12_final_lamed_rung_sharp', 16, 3.04, -0.8, 3.5, 2.3);
const g = island('l12_finish_lamed_roof', 25, 3.18, 0, 8, 5.5);
export default level({ level: 12, title: 'Lamed Turnback Teeth', description: 'A sharper turnback ladder with longer offsets after Kaf.', solid: [a,b,c,d,e,f,g], moving: [m1], coinPlacements: [[b],[c],[d],[m1],[e],[f]], boxOn: f, doorOn: g });
