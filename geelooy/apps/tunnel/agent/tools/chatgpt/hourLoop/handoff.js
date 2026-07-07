// B"H
const C = require('./constants.js');

/** B"H — Chapter 1943: Carry no mountain, only the next stone. */
function build(input = {}) {
  const packet = trim({
    missionId: input.missionId || '',
    conversationId: input.conversationId || '',
    objective: short(input.objective || input.goal || 'continue verified work', 240),
    evidence: list(input.evidence, 3, 220),
    touchedFiles: list(input.touchedFiles || input.files, 8, 140),
    nextAction: input.nextAction || input.next || null,
    emergencyExit: list(input.emergencyExit || input.emergency || [], 8, 80),
    receipts: list(input.receipts || input.receiptRefs, 6, 120),
    at: new Date().toISOString()
  });
  return enforce(packet);
}

function enforce(packet) {
  let text = JSON.stringify(packet);
  if (Buffer.byteLength(text) <= C.HANDOFF_MAX_BYTES) return packet;
  packet.evidence = list(packet.evidence, 2, 120);
  packet.touchedFiles = list(packet.touchedFiles, 4, 80);
  packet.receipts = list(packet.receipts, 3, 80);
  text = JSON.stringify(packet);
  if (Buffer.byteLength(text) <= C.HANDOFF_MAX_BYTES) return packet;
  packet.objective = short(packet.objective, 120);
  return packet;
}

function list(value, max, chars) {
  const arr = Array.isArray(value) ? value : value ? [value] : [];
  return arr.slice(0, max).map(v => short(typeof v === 'string' ? v : JSON.stringify(v), chars));
}
function short(value, max) { const s = String(value || ''); return s.length > max ? `${s.slice(0, max)}…` : s; }
function trim(obj) { Object.keys(obj).forEach(k => { if (obj[k] == null || obj[k] === '' || (Array.isArray(obj[k]) && !obj[k].length)) delete obj[k]; }); return obj; }
module.exports = { build, enforce, list, short, trim };
