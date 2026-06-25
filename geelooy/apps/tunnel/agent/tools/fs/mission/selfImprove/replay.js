// B"H
/**
 * B"H
 * Chapter 615: The room remembered its footsteps.
 * Awtsmoos made past pulses into present evidence, sorted sparks into a road,
 * and the agents saw that a transcript is also a lantern.
 */
function build(m, input = {}, env = {}) {
  const records = env.metadataRecords ? env.metadataRecords(m, input) : [];
  const timeline = [
    ...events(m), ...messages(m), ...receipts(m), ...summits(m), ...claims(m), ...records
  ].sort((a, b) => String(a.at || '').localeCompare(String(b.at || '')));
  return { ok: true, missionId: m.id, roomId: m.room?.id || '', count: timeline.length, timeline: timeline.slice(-limit(input)), sources: sourceCounts(timeline), finalAnswerAllowed: false, mustContinue: true };
}
function events(m) { return (m.events || []).map(x => ({ at: x.at, kind: 'mission_event', text: x.message || x.type || '', payload: x })); }
function messages(m) { return (m.room?.messages || []).map(x => ({ at: x.at, kind: 'room_message', agentId: x.fromAgent || x.agentId, text: x.body || x.message || x.text || '', payload: x })); }
function receipts(m) { return (m.selfImproveReceipts || []).map(x => ({ at: x.at, kind: 'self_improve_receipt', agentId: x.agentId, text: x.stage || x.action || '', payload: x })); }
function summits(m) { return (m.summitHistory || []).map(x => ({ at: x.at, kind: 'room_summit', text: x.status || 'summit', payload: x })); }
function claims(m) { return (m.room?.fileClaims || []).map(x => ({ at: x.at, kind: 'file_claim', agentId: x.agentId, text: x.file || '', payload: x })); }
function sourceCounts(list) { return list.reduce((a, x) => (a[x.kind] = (a[x.kind] || 0) + 1, a), {}); }
function limit(input) { const n = Number(input.limit || 200); return Number.isFinite(n) ? Math.max(1, Math.min(500, n)) : 200; }
module.exports = { build };
