// B"H
function activeClaims(room) { return (room.claims || []).filter(x => x.status === 'active'); }

/**
 * B"H — The scheduler chooses a next breath, not a final curtain.
 * Interrupts outrank claims, claims outrank queued futures, and when all looks
 * quiet the room is asked to discover rather than declare itself done.
 */
function nextHighestWork(room) {
  const interrupt = (room.interrupts || []).find(x => x.status === 'blocking');
  if (interrupt) return { kind: 'interrupt', priority: 100, item: interrupt };
  const claim = activeClaims(room)[0];
  if (claim) return { kind: 'claim', priority: 80, item: claim };
  const runtime = Object.values(room.agentRuntime || {}).find(r => r.futureQueue?.length);
  if (runtime) return { kind: 'futureQueue', priority: 60, item: runtime.futureQueue[0] };
  return { kind: 'discover', priority: 10, item: { action: 'missionRoomDiscoverAgents' } };
}
module.exports = { activeClaims, nextHighestWork };
