// B"H
/** @file summary.js @description Compile ledger counts approved tree bucket. */
import { countBucket } from './countBucket.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function summarize(n, profile, properties) { n.__emeraldCompileSummary = { profile: profile.profile || 'balanced', seed: profile.seed, properties: properties.length, buildings: countBucket(n.ProceduralBuilding), outdoorNpc: countBucket(n.InteractiveNpc), roads: countBucket(n.ProceduralRoad), trees: countBucket(n.VillageHeroTree), mazikim: countBucket(n.Mazik), domem: countBucket(n.Domem), visualEnrichment: Boolean(n.__visualEnrichment), visualBudget: n.__visualBudget || null, centralLevelGuide: Boolean(n.InteractiveNpc.central_level_guide?.hasLevelSelect) }; }
