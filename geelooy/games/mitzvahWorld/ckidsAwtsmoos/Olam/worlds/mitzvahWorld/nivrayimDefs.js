/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE BOOK OF BLUEPRINTS — nivrayimDefs.js
 *   ─────────────────────────────────────────
 *   In the beginning was the Word, and the Word was data,
 *   and the data was with the Awtsmoos, and the data WAS the Awtsmoos.
 *
 *   Each entry herein is a NEFESH — a soul-blueprint.
 *   The NivrahFactory reads these definitions and breathes life
 *   into mesh, collision, and texture.
 *
 *   "Forever, O Lord, Your word stands firm in the heavens" —
 *   so too these definitions stand firm in the JavaScript heap,
 *   recreating the world every frame from absolute nothingness.
 * ════════════════════════════════════════════════════════════════════════
 * @module nivrayimDefs
 */

import { TIFERES_CHOSSID }    from './data/nefashos/TiferesChossid.js';
import { DESERT_TEST_STRUCTURES } from './data/nefashos/DesertTestWorld.js';

/**
 * @typedef {Object} NefeshDef
 * @property {string} id            - Unique soul-identifier
 * @property {string} type          - Entity type key (maps to a builder)
 * @property {number[]} position    - [x, y, z] world position
 * @property {number[]} [rotation]  - [x, y, z] Euler rotation in radians
 * @property {number[]} [scale]     - [x, y, z] scale factors
 * @property {Object}  [props]      - Type-specific extra properties
 */

/**
 * @constant {NefeshDef[]} NIVRAYIM_DEFS
 * @description
 *   The complete soul-manifest for mitzvahWorld.
 *   Order matters: terrain first, then decoration, then structures,
 *   then the player entity last.
 */
export const NIVRAYIM_DEFS = [
  ...DESERT_TEST_STRUCTURES,
  TIFERES_CHOSSID,
];

export default NIVRAYIM_DEFS;
