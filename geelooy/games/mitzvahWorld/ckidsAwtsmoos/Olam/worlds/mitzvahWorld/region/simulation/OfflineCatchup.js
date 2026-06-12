// B"H
/**
 * @file OfflineCatchup.js
 * @description Hours away become summary deltas, not a storm of missed frames.
 */
export function computeOfflineCatchup(snapshot = {}, now = Date.now()) {
  const savedAt = Number(snapshot.savedAt || now);
  const elapsedMs = Math.max(0, Number(now) - savedAt);
  const hours = elapsedMs / 3600000;
  return {
    version: "offline-catchup-v1",
    elapsedMs,
    hours,
    ecologyCycles: Math.floor(hours / 3),
    npcActivityCycles: Math.floor(hours * 4),
    wildlifeCycles: Math.floor(hours * 6),
    eventBudget: Math.min(48, Math.floor(hours * 2))
  };
}

export function applyOfflineCatchupSummary(snapshot = {}, catchup = {}) {
  return {
    version: "offline-catchup-summary-v1",
    from: snapshot.version || "unknown",
    changed: catchup.elapsedMs > 0,
    cycles: {
      ecology: catchup.ecologyCycles || 0,
      npc: catchup.npcActivityCycles || 0,
      wildlife: catchup.wildlifeCycles || 0
    }
  };
}
