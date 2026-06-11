// B"H
/**
 * @file level18.js
 * @description Chapter 638: Tzadi high switchbacks rise without illegal gaps.
 * The Awtsmoos refuses unfair fire: difficulty comes from timing and narrowness,
 * not from impossible jumps beyond the measured safety law.
 */
import { island, block, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l18_start_tzadi_high', -32, 1.5, 0, 8.6, 5.8);
const b = block('l18_switchback_one', -24, 1.82, 5.2, 3.8, 2.5);
const c = block('l18_switchback_two', -17, 2.14, -5.2, 3.6, 2.4);
const m1 = moving('l18_long_switch_ferry_hard', -9.8, 2.42, 0, 2.85, 1.95, 'z', 6.6, 0.78, 0.2);
const d = block('l18_switchback_three', -2.4, 2.68, 5, 3.5, 2.35);
const e = block('l18_switchback_four', 5, 2.94, -5, 3.35, 2.3);
const m2 = moving('l18_exit_switch_ferry_hard', 12.2, 3.12, 0, 2.75, 1.9, 'x', 5.6, 0.86, 0.5);
const f = block('l18_last_high_step', 19, 3.24, 1.5, 3.4, 2.3);
const g = island('l18_finish_tzadi_high', 27.5, 3.34, 0, 7.8, 5.4);
export default level({ level: 18, title: 'Tzadi High Switchbacks', description: 'High legal switchbacks with stronger timing and no impossible gaps.', solid: [a,b,c,d,e,f,g], moving: [m1,m2], coinPlacements: [[b],[c],[m1],[d],[e],[m2],[f]], boxOn: f, doorOn: g });
