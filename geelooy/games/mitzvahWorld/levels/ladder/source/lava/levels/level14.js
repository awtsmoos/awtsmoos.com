// B"H
/** @file level14.js @description Chapter 595: Nun alternating balconies. */
import { island, block, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l14_start_nun_gallery', -30, 1.4, 0, 9, 6);
const b = block('l14_balcony_left_one', -22, 1.66, 4.7, 4.2, 2.8);
const c = block('l14_balcony_right_one', -15, 1.92, -4.7, 4.1, 2.8);
const m1 = moving('l14_middle_lift_bridge', -7.8, 2.18, 0, 3.4, 2.4, 'z', 4.4, 0.56, 0.15);
const d = block('l14_balcony_left_two', 0, 2.38, 4.3, 4, 2.7);
const e = block('l14_balcony_right_two', 7.4, 2.58, -4.3, 3.9, 2.7);
const m2 = moving('l14_exit_lift_bridge', 15, 2.76, 0, 3.3, 2.3, 'x', 3.8, 0.6, 0.6);
const f = island('l14_finish_nun_gallery', 23.5, 2.92, 0, 8.2, 5.8);
export default level({ level: 14, title: 'Nun Alternating Balconies', description: 'Balcony-to-balcony manual route with two moving corrections.', solid: [a,b,c,d,e,f], moving: [m1,m2], coinPlacements: [[b],[c],[m1],[d],[e],[m2]], boxOn: e, doorOn: f });
