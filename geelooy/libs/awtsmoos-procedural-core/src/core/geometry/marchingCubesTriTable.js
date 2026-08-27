// B"H
import { CHUNK_0 } from './tri_table/chunk_0.js';
import { CHUNK_1 } from './tri_table/chunk_1.js';
import { CHUNK_2 } from './tri_table/chunk_2.js';
import { CHUNK_3 } from './tri_table/chunk_3.js';
import { CHUNK_4 } from './tri_table/chunk_4.js';
import { CHUNK_5 } from './tri_table/chunk_5.js';
import { CHUNK_6 } from './tri_table/chunk_6.js';
import { CHUNK_7 } from './tri_table/chunk_7.js';

/**
 * @file marchingCubesTriTable.js
 * @brief This module, a divine librarian, gathers the fragmented scrolls of
 *        triangulation knowledge into a single, complete tome. It imports
 *        the 8 chunks of the triangle lookup table and exports them as one
 *        unified array for the Marching Cubes algorithm to consult, a perfect
 *        reflection of unity revealed from multiplicity.
 */

export const LOOKUP_TRI_TABLE = [
  ...CHUNK_0,
  ...CHUNK_1,
  ...CHUNK_2,
  ...CHUNK_3,
  ...CHUNK_4,
  ...CHUNK_5,
  ...CHUNK_6,
  ...CHUNK_7
];