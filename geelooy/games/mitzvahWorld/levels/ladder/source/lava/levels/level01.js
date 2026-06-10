// B"H
/** @file level01.js @description Chapter 607: A calm first crossing with eight wide islands. */
import { island, block } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l1_start_big_warm_island', -22, 1.2, 0, 10, 7);
const b = block('l1_low_step_one', -15, 1.24, 1.1, 7.2, 5.2);
const c = block('l1_low_step_two', -8, 1.28, -1.2, 7, 5);
const d = block('l1_low_step_three', -1, 1.32, 1.3, 6.8, 4.8);
const e = block('l1_low_step_four', 6, 1.36, -1.1, 6.6, 4.7);
const f = block('l1_low_step_five', 13, 1.4, 1, 6.4, 4.6);
const g = block('l1_last_learning_step', 20, 1.44, 0, 6.4, 4.6);
const h = island('l1_finish_learning_island', 28, 1.48, 0, 10, 7);
export default level({ level: 1, title: 'Aleph Lava Crossing', description: 'First hand-authored lava bridge: eight broad steps and no surprises.', solid: [a,b,c,d,e,f,g,h], coinPlacements: [[b],[c],[d],[e],[f],[g]], boxOn: g, doorOn: h });
