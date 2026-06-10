// B"H
/** @file level06.js @description Chapter 611: First moving bridge, safely introduced with eight surfaces. */
import { island, block, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l6_start_stable_teacher', -25, 1.25, 0, 9, 6.5);
const b = block('l6_static_before_motion', -18, 1.42, 2.5, 5.2, 3.4);
const c = block('l6_static_second_anchor', -11, 1.55, -2.5, 5, 3.2);
const m1 = moving('l6_first_moving_bridge_z', -4, 1.65, 0, 4.2, 2.8, 'z', 2.4, 0.42, 0);
const d = block('l6_after_motion_rest', 4, 1.78, 2.2, 5.2, 3.5);
const e = block('l6_final_static_read', 11, 1.92, -1.8, 4.8, 3.2);
const f = block('l6_pre_finish_anchor', 18, 2, 1.2, 4.8, 3.2);
const g = island('l6_finish_vav_landing', 26, 2.08, 0, 9, 6.3);
export default level({ level: 6, title: 'Vav First Motion', description: 'Manual first moving platform with safe anchors before and after.', solid: [a,b,c,d,e,f,g], moving: [m1], coinPlacements: [[b],[c],[m1],[d],[e],[f]], boxOn: f, doorOn: g });
