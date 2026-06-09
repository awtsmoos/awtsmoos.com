// B"H
/**
 * @file performanceCompiler.js
 * @description Chapter 496: Attaches performance hints and count summaries to
 * the compiled world, so future renderers can batch and cull deliberately.
 */
import { PERFORMANCE_MANIFEST } from './performanceManifest.js';
const count = value => value && typeof value === 'object' ? Object.keys(value).length : 0;
export function applyPerformanceManifest(n, profile = {}) {
  n.Performance = { manifest: PERFORMANCE_MANIFEST, activeProfile: profile.profile || 'mobile', activeDensity: profile.visualDensity || profile.profile || 'mobile', counts: { domem: count(n.Domem), trees: count(n.ProceduralTree), buildings: count(n.ProceduralBuilding), roads: count(n.ProceduralRoad), npc: count(n.InteractiveNpc) } };
  n.__performance = { profile: n.Performance.activeProfile, density: n.Performance.activeDensity, instancingGroups: PERFORMANCE_MANIFEST.instancingGroups.length, cullRadii: Object.keys(PERFORMANCE_MANIFEST.cullRadii).length, headroom: (n.__visualBudget?.limits?.maxDomem || 0) - count(n.Domem) };
  return n;
}
