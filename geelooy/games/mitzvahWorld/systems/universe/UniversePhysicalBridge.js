// B"H
/** Bridges generated commands into a construction plan ready for render adapters. */
import { UniverseCommandApplicator } from "./UniverseCommandApplicator.js";
import { buildUniverseConstructionPlan } from "./UniverseConstructionPlan.js";
export function buildUniversePhysicalBridge({ runtime, movie, animations } = {}) {
  const applicator = new UniverseCommandApplicator();
  const applied = applicator.applyAll(runtime?.commands || []);
  const construction = buildUniverseConstructionPlan({ runtime:{ ...(runtime || {}), commands:applied }, movie, animations });
  return { applied, construction, applicator:applicator.snapshot() };
}
export default buildUniversePhysicalBridge;
