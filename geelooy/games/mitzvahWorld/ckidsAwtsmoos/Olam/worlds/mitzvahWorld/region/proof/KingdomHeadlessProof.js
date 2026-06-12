// B"H
/**
 * @file KingdomHeadlessProof.js
 * @description Proof without ornament: the kingdom breathes as data before it wears a body.
 */
import { buildKingdomGardenKernel } from "../kingdom/KingdomGardenKernel.js";

export function runKingdomHeadlessProof(data = {}) {
  const kingdom = buildKingdomGardenKernel(data);
  const s = kingdom.summary || {};
  return {
    ok: Boolean(s.ok && s.chunks > 0 && s.proof?.failed === 0),
    version: "kingdom-headless-proof-v1",
    summary: s,
    required: {
      chunks: s.chunks > 0,
      budget: Boolean(s.budget?.mode),
      spatial: (s.spatial?.buckets || 0) > 0,
      proof: s.proof?.failed === 0,
      snapshot: Boolean(s.snapshot?.version)
    }
  };
}
