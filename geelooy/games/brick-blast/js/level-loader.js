// B"H

/**
 * This module is the Divine Librarian. It gathers the sacred texts from the many
 * chapter-scrolls in the /levels/ directory and compiles them into a single,
 * ordered chronicle of all worlds known to exist.
 */

import { levels as levels1to10 } from './levels/01-10.js';
import { levels as levels11to20 } from './levels/11-20.js';
import { levels as levels21to30 } from './levels/21-30.js';
import { levels as levels31to40 } from './levels/31-40.js';
import { levels as levels41to50 } from './levels/41-50.js';
import { levels as levels51to60 } from './levels/51-60.js';


/**
 * @typedef {Object} Level
 * @property {number} id - The unique identifier, the name by which the Creator knows this world.
 * @property {string} name - The name given to this world for mortals to comprehend.
 * @property {boolean} [static] - If true, new rows of bricks do not appear each turn.
 * @property {Array<Array<number|null>>} layout - The divine blueprint, the very structure of this world's beginning.
 */

/**
 * The complete, ordered collection of all level blueprints.
 * @type {Level[]}
 */
export const LEVELS = [
    ...levels1to10,
    ...levels11to20,
    ...levels21to30,
    ...levels31to40,
    ...levels41to50,
    ...levels51to60,
].sort((a, b) => a.id - b.id);
