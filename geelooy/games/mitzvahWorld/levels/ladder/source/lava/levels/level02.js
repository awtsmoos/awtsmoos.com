// B"H
/** @file level02.js @description Chapter 608: Gentle zigzag training with eight landings. */
import { island, block } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l2_start_wide_stone', -23, 1.2, 0, 9.5, 6.8);
const b = block('l2_left_green_breath', -16, 1.28, 3.2, 6.5, 4.6);
const c = block('l2_right_return_step', -9, 1.36, -3.1, 6.2, 4.4);
const d = block('l2_center_confidence_step', -2, 1.44, 0.2, 6, 4.2);
const e = block('l2_left_final_step', 5, 1.52, 3.1, 5.6, 4.1);
const f = block('l2_right_final_step', 12, 1.58, -2.8, 5.4, 4);
const g = block('l2_last_straight_step', 19, 1.64, 0, 5.5, 4);
const h = island('l2_finish_safe_plaza', 27, 1.7, 0, 9, 6.4);
export default level({ level: 2, title: 'Beis Gentle Zigzag', description: 'A hand-laid zigzag where every landing is forgiving.', solid: [a,b,c,d,e,f,g,h], coinPlacements: [[b,0.7,0],[c,-0.6,0],[d],[e],[f],[g]], boxOn: g, doorOn: h });
