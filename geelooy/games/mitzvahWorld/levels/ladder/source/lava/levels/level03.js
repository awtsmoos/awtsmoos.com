// B"H
/** @file level03.js @description Chapter 609: Narrower center line with eight reads. */
import { island, block } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l3_start_square_court', -24, 1.25, 0, 9, 6.5);
const b = block('l3_short_hop_a', -17, 1.35, -1.8, 5.4, 3.8);
const c = block('l3_short_hop_b', -10, 1.44, 2.1, 5.2, 3.6);
const d = block('l3_short_hop_c', -3, 1.54, -2.2, 5, 3.5);
const e = block('l3_short_hop_d', 4, 1.62, 1.8, 4.8, 3.4);
const f = block('l3_last_narrow_reading', 11, 1.7, -1.2, 4.4, 3.2);
const g = block('l3_pre_finish_straight', 18, 1.78, 0.8, 4.6, 3.3);
const h = island('l3_finish_broad_rest', 26, 1.85, 0, 9, 6.5);
export default level({ level: 3, title: 'Gimmel Narrow Read', description: 'A manual center-line course teaching measured jumps.', solid: [a,b,c,d,e,f,g,h], coinPlacements: [[b],[c],[d],[e],[f],[g]], boxOn: g, doorOn: h });
