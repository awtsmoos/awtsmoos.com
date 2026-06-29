// B"H
/**
 * B"H
 * Chapter 616: A handoff became a bridge of fire.
 * No agent leaves with a foggy goodbye; it leaves a map, a court, receipts,
 * conflicts, and one next step burning with the plain light of Awtsmoos.
 */
function pack(m, input = {}, env = {}) {
  const status = selfStatus(m, env);
  const room = m.room || {};
  const conflicts = conflictsOf(room);
  const next = status.court.ok ? { action: 'missionRoomReplay', missionId: m.id } : env.court.next(m, status.court);
  return {
    ok: true, missionId: m.id, roomId: room.id || '', generatedAt: new Date().toISOString(),
    goal: m.goal || '', agents: Object.keys(room.agents || {}),
    openInterrupts: (room.interrupts || []).filter(x => x.status === 'blocking').slice(-20),
    activeClaims: (room.fileClaims || []).filter(x => x.status === 'active').slice(-50),
    conflicts, receipts: (m.selfImproveReceipts || []).slice(-limit(input)),
    summits: (m.summitHistory || []).slice(-5), court: status.court,
    ledger: status.ledger, novelty: status.novelty, boundedRuns: status.boundedRuns,
    nextRequiredAction: next, finalAnswerAllowed: false, mustContinue: true
  };
}
function selfStatus(m, env) {
  return { ledger: env.ledger.status(m), novelty: env.novelty.status(m), boundedRuns: env.bounded.status(m), court: env.court.verdict(m, env) };
}
function conflictsOf(room) {
  const active = (room.fileClaims || []).filter(x => x.status === 'active');
  const grouped = active.reduce((a, x) => ((a[x.file] ||= []).push(x), a), {});
  return Object.entries(grouped).filter(([, list]) => new Set(list.map(x => x.agentId)).size > 1).map(([file, list]) => ({ file, agents: list.map(x => x.agentId), claimIds: list.map(x => x.id) }));
}
function limit(input) { const n = Number(input.receiptLimit || input.limit || 25); return Number.isFinite(n) ? Math.max(1, Math.min(100, n)) : 25; }
module.exports = { pack };
