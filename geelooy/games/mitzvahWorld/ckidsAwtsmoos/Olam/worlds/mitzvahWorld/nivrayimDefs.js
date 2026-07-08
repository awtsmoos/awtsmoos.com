/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE BOOK OF BLUEPRINTS — nivrayimDefs.js
 *   Budgeted Level One still reveals village life, but no stale module cache
 *   may keep the world trapped in yesterday's unmeasured density.
 * ════════════════════════════════════════════════════════════════════════
 * @module nivrayimDefs
 */

import { TIFERES_CHOSSID } from './data/nefashos/TiferesChossid.js';
import { LEVEL_ONE_VILLAGE_NIVRAYIM } from './data/levelOne/LevelOneVillage.js?v=budgeted-village-20260707-bh1';

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
