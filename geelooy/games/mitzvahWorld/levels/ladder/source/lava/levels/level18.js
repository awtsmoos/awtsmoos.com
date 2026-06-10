// B"H
/** @file level18.js @description Chapter 599: Tzadi high switchbacks. */
import { island, block, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l18_start_tzadi_high', -32, 1.5, 0, 8.6, 5.8);
const b = block('l18_switchback_one', -24, 1.82, 5.2, 3.8, 2.5);
const c = block('l18_switchback_two', -17, 2.14, -5.2, 3.6, 2.4);
const m1 = moving('l18_long_switch_ferry', -9.8, 2.42, 0, 3, 2.1, 'z', 6, 0.58, 0.2);
const d = block('l18_switchback_three', -2.4, 2.68, 5, 3.5, 2.4);
const e = block('l18_switchback_four', 5, 2.94, -5, 3.4, 2.4);
const m2 = moving('l18_exit_switch_ferry', 12.2, 3.12, 0, 2.9, 2, 'x', 4.8, 0.66, 0.5);
const f = block('l18_last_high_step', 19, 3.24, 1.5, 3.5, 2.4);
const g = island('l18_finish_tzadi_high', 27.5, 3.34, 0, 8, 5.5);
export default level({ level: 18, title: 'Tzadi High Switchbacks', description: 'High manual switchbacks over a wide lava basin.', solid: [a,b,c,d,e,f,g], moving: [m1,m2], coinPlacements: [[b],[c],[m1],[d],[e],[m2],[f]], boxOn: f, doorOn: g });
