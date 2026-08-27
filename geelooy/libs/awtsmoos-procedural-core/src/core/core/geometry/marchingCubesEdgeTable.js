// B"H
import { CHUNK_0 } from './edge_table/chunk_0.js';
import { CHUNK_1 } from './edge_table/chunk_1.js';
import { CHUNK_2 } from './edge_table/chunk_2.js';
import { CHUNK_3 } from './edge_table/chunk_3.js';
import { CHUNK_4 } from './edge_table/chunk_4.js';
import { CHUNK_5 } from './edge_table/chunk_5.js';
import { CHUNK_6 } from './edge_table/chunk_6.js';
import { CHUNK_7 } from './edge_table/chunk_7.js';

/**
 * @file marchingCubesEdgeTable.js
 * @brief This module, a divine librarian for the knowledge of boundaries,
 *        gathers the 8 fragmented scrolls of edge intersection data into a
 *        single, complete tome for the Marching Cubes algorithm.
 */

export const LOOKUP_EDGE_TABLE = [
  ...CHUNK_0,
  ...CHUNK_1,
  ...CHUNK_2,
  ...CHUNK_3,
  ...CHUNK_4,
  ...CHUNK_5,
  ...CHUNK_6,
  ...CHUNK_7
];