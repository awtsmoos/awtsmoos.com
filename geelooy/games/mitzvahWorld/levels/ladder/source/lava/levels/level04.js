// B"H
/** @file level04.js @description Chapter 610: Side islands with two rest pockets. */
import { island, block } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l4_start_low_haven', -25, 1.25, 0, 9, 6.2);
const b = block('l4_right_bank_a', -18, 1.38, 4, 5.6, 3.7);
const c = block('l4_right_bank_b', -11, 1.5, 4.3, 4.8, 3.4);
const d = island('l4_middle_rest_pocket', -3, 1.6, 0, 7.2, 5.2);
const e = block('l4_left_bank_a', 5, 1.72, -4.1, 4.8, 3.4);
const f = block('l4_left_bank_b', 13, 1.84, -3.8, 4.6, 3.2);
const g = block('l4_center_return_step', 20, 1.92, 0, 4.7, 3.3);
const h = island('l4_finish_daled_gate', 28, 2, 0, 8.8, 6.2);
export default level({ level: 4, title: 'Daled Side Banks', description: 'Hand-authored side-bank route with two rest pockets.', solid: [a,b,c,d,e,f,g,h], coinPlacements: [[b],[c],[d,1,0],[e],[f],[g]], boxOn: g, doorOn: h });
