// B"H
/** Bridges generated commands into a construction plan ready for render adapters. */
import { UniverseCommandApplicator } from "./UniverseCommandApplicator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { buildUniverseConstructionPlan } from "./UniverseConstructionPlan.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function buildUniversePhysicalBridge({ runtime, movie, animations } = {}) {
  const applicator = new UniverseCommandApplicator();
  const applied = applicator.applyAll(runtime?.commands || []);
  const construction = buildUniverseConstructionPlan({ runtime:{ ...(runtime || {}), commands:applied }, movie, animations });
  return { applied, construction, applicator:applicator.snapshot() };
}
export default buildUniversePhysicalBridge;
