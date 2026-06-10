// B"H
/** @file level15.js @description Chapter 596: Samech circle route. */
import { island, block, crumb, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l15_start_samech_ring', -29, 1.42, 0, 9, 6);
const b = block('l15_ring_northwest', -21, 1.68, 4.8, 4, 2.7);
const c = crumb('l15_ring_north', -14.8, 1.9, 5.1);
const d = block('l15_ring_northeast', -8, 2.12, 3.4, 3.9, 2.6);
const m1 = moving('l15_ring_crossing', -1, 2.34, 0, 3.2, 2.3, 'z', 5.2, 0.58, 0.25);
const e = block('l15_ring_southeast', 6.5, 2.54, -3.7, 3.8, 2.6);
const f = crumb('l15_ring_south', 13.2, 2.72, -5.1);
const g = block('l15_ring_exit', 20, 2.9, -1.6, 4, 2.7);
const h = island('l15_finish_samech_ring', 28, 3.02, 0, 8.2, 5.8);
export default level({ level: 15, title: 'Samech Ring Crossing', description: 'A circular hand-authored route around the lava center.', solid: [a,b,c,d,e,f,g,h], moving: [m1], coinPlacements: [[b],[c],[d],[m1],[e],[f],[g]], boxOn: g, doorOn: h });
