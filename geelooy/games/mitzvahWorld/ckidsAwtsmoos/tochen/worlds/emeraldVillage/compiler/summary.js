// B"H
/** @file summary.js @description Chapter 362: The compile ledger proves what exists. */
import { countBucket } from './countBucket.js';
export function summarize(n, profile, properties) {
  n.__emeraldCompileSummary = { profile: profile.profile || 'balanced', seed: profile.seed, properties: properties.length, buildings: countBucket(n.ProceduralBuilding), outdoorNpc: countBucket(n.InteractiveNpc), roads: countBucket(n.ProceduralRoad), trees: countBucket(n.ProceduralTree), mazikim: countBucket(n.Mazik), domem: countBucket(n.Domem), visualEnrichment: Boolean(n.__visualEnrichment), visualBudget: n.__visualBudget || null, centralLevelGuide: Boolean(n.InteractiveNpc.central_level_guide?.hasLevelSelect) };
}
