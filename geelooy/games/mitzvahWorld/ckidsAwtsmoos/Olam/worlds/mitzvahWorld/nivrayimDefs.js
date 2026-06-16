/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE BOOK OF BLUEPRINTS — nivrayimDefs.js
 *   Level One now starts like a living starting zone: ground, buildings,
 *   landmarks, NPCs, objectives, then the player vessel last.
 * ════════════════════════════════════════════════════════════════════════
 * @module nivrayimDefs
 */

import { TIFERES_CHOSSID } from './data/nefashos/TiferesChossid.js';
import { LEVEL_ONE_VILLAGE_NIVRAYIM } from './data/levelOne/LevelOneVillage.js';

/**
 * @typedef {Object} NefeshDef
 * @property {string} id
 * @property {string} type
 * @property {number[]} position
 * @property {number[]} [rotation]
 * @property {number[]|number} [scale]
 * @property {Object} [props]
 */

export const NIVRAYIM_DEFS = [
  ...LEVEL_ONE_VILLAGE_NIVRAYIM,
  TIFERES_CHOSSID
];

export default NIVRAYIM_DEFS;
