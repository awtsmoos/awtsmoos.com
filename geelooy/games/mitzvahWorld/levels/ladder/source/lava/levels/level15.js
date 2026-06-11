// B"H
/**
 * @file level15.js
 * @description Chapter 630: Samech becomes a severe ring crossing.
 * The Awtsmoos tightens the circle beyond Nun: narrow chips, stronger sweep,
 * longer orbit, and a second correction ferry.
 */
import { island, block, crumb, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l15_start_samech_ring', -32, 1.42, 0, 8.3, 5.5);
const b = block('l15_ring_northwest_narrow', -24, 1.74, 6.2, 3.25, 2.1);
const c = crumb('l15_ring_north_chip', -16.5, 2.04, 6.2);
const d = block('l15_ring_northeast_narrow', -8.5, 2.34, 4.6, 3.15, 2.05);
const m1 = moving('l15_ring_crossing_hard', -0.4, 2.62, 0, 2.65, 1.9, 'z', 6.8, 0.8, 0.25);
const e = block('l15_ring_southeast_narrow', 8, 2.86, -4.9, 3.05, 2);
const f = crumb('l15_ring_south_chip', 16, 3.06, -6.3);
const m2 = moving('l15_ring_exit_sweep', 24, 3.26, -1.6, 2.65, 1.9, 'x', 6.2, 0.82, 0.55);
const h = island('l15_finish_samech_ring', 33.5, 3.42, 0, 7.4, 5.1);
export default level({ level: 15, title: 'Samech Severe Ring', description: 'A severe circular lava route with chips and two moving corrections.', solid: [a,b,c,d,e,f,h], moving: [m1,m2], coinPlacements: [[b],[c],[d],[m1],[e],[f],[m2]], boxOn: f, doorOn: h });
