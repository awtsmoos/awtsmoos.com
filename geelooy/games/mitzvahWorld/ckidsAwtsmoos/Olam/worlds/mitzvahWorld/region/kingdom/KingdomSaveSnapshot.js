// B"H
/**
 * @file KingdomSaveSnapshot.js
 * @description The sleeping kingdom is compressed memory, ready to awaken without frame debt.
 */
export function createKingdomSaveSnapshot(kernel = {}) {
  const clock = kernel.clock || {};
  return {
    version: "kingdom-save-snapshot-v1",
    savedAt: Date.now(),
    clock: { now: clock.now || 0, day: clock.day || 0, phase: clock.phase || "morning" },
    chunks: compactChunks(kernel.chunks?.chunks || []),
    events: (kernel.events?.recent || []).slice(-24),
    summary: kernel.summary || {}
  };
}

export function snapshotSummary(snapshot = {}) {
  return { version: snapshot.version, chunks: snapshot.chunks?.length || 0, events: snapshot.events?.length || 0, phase: snapshot.clock?.phase || "unknown" };
}

function compactChunks(chunks) {
  return chunks.map(c => ({ id: c.id, tier: c.tier, ecologyCells: c.ecologyCells, animals: c.animals, houses: c.houses, npcSchedules: c.npcSchedules }));
}
