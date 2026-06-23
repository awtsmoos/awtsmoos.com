// B"H
/** @file TreeAuthorityRuntimePolicy.js @description One authoritative tree law: no duplicate blob forests, no hidden old generator resurrection. */
import { masterRealismPolicy } from '../realism/MasterRealismPolicy.js';
export const AUTHORITATIVE_TREE_SOURCE = '/libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js';
export function treeAuthorityRuntimePolicy(budget = globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__) {
  const p = masterRealismPolicy(budget);
  return {
    source: AUTHORITATIVE_TREE_SOURCE,
    density: p.villages?.density ?? p.animals?.density ?? 1,
    allowed: ['VillageHeroTree', 'AdvancedTreeOnly', 'procedural-core-treeGenerator'],
    forbiddenShapes: ['sphere-on-stick', 'circle-leaf-plane-only', 'duplicate-old-canopy'],
    drawCallLaw: 'instanced-trunks-and-leaf-clusters-by-biome',
    lod: { near:'branch-leaf-clusters', mid:'merged-crowns', far:'impostor-or-statistical', horizon:'forest-density-field' },
    auditMarker: 'awtsmoos-authoritative-tree-only'
  };
}
export default treeAuthorityRuntimePolicy;
