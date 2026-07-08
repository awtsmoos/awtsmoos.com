/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE MASTER MANIFEST OF SOULS — StructuresDefs.js
 *   ──────────────────────────────────────────────────
 *   Unified from the diverse neighborhoods of the Mitzvah World.
 * ════════════════════════════════════════════════════════════════════════
 */

import { HOLY_QUARTER } from './HolyQuarter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { RESIDENTIAL_DISTRICT } from './ResidentialDistrict.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { EMERALD_VOID_STRUCTURES } from './EmeraldVoidStreet.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export const GENERATED_TREE_GROVE = [
  { id: 'etz_chayim_west_1', type: 'tree', position: [-16, 0, 12], props: { height: 7.5, foliageRadius: 2.4, branchCount: 8 } },
  { id: 'etz_chayim_west_2', type: 'tree', position: [-24, 0, 22], props: { height: 6.5, foliageRadius: 2.1, branchCount: 7, leafColor: 0x3fa34d } },
  { id: 'etz_chayim_east_1', type: 'tree', position: [18, 0, 14], props: { height: 8.2, foliageRadius: 2.6, branchCount: 9 } },
  { id: 'etz_chayim_east_2', type: 'tree', position: [31, 0, 23], props: { height: 6.8, foliageRadius: 2.0, branchCount: 6, leafColor2: 0x78c96b } },
  { id: 'etz_chayim_north_1', type: 'tree', position: [-12, 0, -36], props: { height: 9, foliageRadius: 2.8, branchCount: 10 } },
  { id: 'etz_chayim_north_2', type: 'tree', position: [15, 0, -42], props: { height: 7.2, foliageRadius: 2.3, branchCount: 8 } },
  { id: 'etz_chayim_south_1', type: 'tree', position: [-10, 0, 35], props: { height: 7, foliageRadius: 2.2, branchCount: 7 } },
  { id: 'etz_chayim_south_2', type: 'tree', position: [10, 0, 38], props: { height: 8, foliageRadius: 2.5, branchCount: 9 } }
];

export const STRUCTURES_LIST = [
  ...HOLY_QUARTER,
  ...RESIDENTIAL_DISTRICT,
  ...EMERALD_VOID_STRUCTURES,
  ...GENERATED_TREE_GROVE,

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
