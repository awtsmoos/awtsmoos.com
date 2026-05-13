/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE MASTER MANIFEST OF SOULS — StructuresDefs.js
 *   ──────────────────────────────────────────────────
 *   Unified from the diverse neighborhoods of the Mitzvah World.
 * ════════════════════════════════════════════════════════════════════════
 */

import { HOLY_QUARTER } from './HolyQuarter.js';
import { RESIDENTIAL_DISTRICT } from './ResidentialDistrict.js';

export const STRUCTURES_LIST = [
  ...HOLY_QUARTER,
  ...RESIDENTIAL_DISTRICT,
  
  // ── Global Infrastructure ──
  {
    id: 'main_terrain',
    type: 'terrain',
    position: [0, -0.05, 0],
    props: { width: 400, depth: 400 }
  },
  {
    id: 'central_grass',
    type: 'grassPatch',
    position: [0, 0, 0],
    props: { count: 1200, radius: 80 }
  }
];

export default STRUCTURES_LIST;
