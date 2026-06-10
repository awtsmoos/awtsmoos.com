// B"H
/** @file level07.js @description Chapter 612: Two moving rhythms with static anchors. */
import { island, block, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l7_start_blue_court', -25, 1.25, 0, 9, 6.2);
const b = block('l7_left_static_ledge', -18, 1.44, 3.5, 5, 3.2);
const c = block('l7_pre_ferry_anchor', -12, 1.54, 0, 4.8, 3);
const m1 = moving('l7_horizontal_ferry', -6, 1.62, 0, 4.3, 2.7, 'x', 2.6, 0.45, 0.2);
const d = block('l7_center_rest', 1.5, 1.76, -3.1, 5.2, 3.3);
const m2 = moving('l7_vertical_ferry', 8.5, 1.94, 0, 4, 2.6, 'z', 3.1, 0.48, 0.45);
const e = block('l7_right_static_ledge', 16, 2.08, 3, 4.7, 3.1);
const f = island('l7_finish_zayin_court', 25, 2.18, 0, 8.8, 6.2);
export default level({ level: 7, title: 'Zayin Double Ferry', description: 'Two hand-placed moving ferries with rest landings.', solid: [a,b,c,d,e,f], moving: [m1,m2], coinPlacements: [[b],[c],[m1],[d],[m2],[e]], boxOn: e, doorOn: f });
