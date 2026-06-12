// B"H
/**
 * @file SimulationTierModel.js
 * @description Five veils of life: full nearby, summarized afar, dormant beyond sight.
 */
import { distanceToBubble, tierForDistance } from "./InterestBubble.js";

export const SIMULATION_TIERS = Object.freeze({
  0: { name: "immediate", updateMs: 16, fidelity: "full" },
  1: { name: "nearby", updateMs: 250, fidelity: "simple" },
  2: { name: "visible", updateMs: 1000, fidelity: "impostor" },
  3: { name: "offscreen", updateMs: 5000, fidelity: "summary" },
  4: { name: "dormant", updateMs: 60000, fidelity: "snapshot" }
});

export function assignChunkTiers(chunkMap, bubble) {
  const chunks = (chunkMap.chunks || []).map(c => ({ ...c, tier: tierForDistance(bubble, distanceToBubble(bubble, c.x * chunkMap.chunkSize, c.z * chunkMap.chunkSize)) }));
  return { ...chunkMap, chunks, summary: { ...chunkMap.summary, ...tierSummary(chunks), activeChunks: chunks.filter(c => c.tier <= 1).length } };
}

export function tierSummary(chunks = []) {
  const tiers = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const c of chunks) tiers[c.tier ?? 4]++;
  return { tiers };
}

export function tierPolicy(tier) { return SIMULATION_TIERS[tier] || SIMULATION_TIERS[4]; }
