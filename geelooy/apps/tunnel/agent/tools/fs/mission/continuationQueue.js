// B"H

const DEFAULT_ITEMS = [
  ['finalization-guard', 'P1', 'runtime', 'Prove missionFinalize blocks early endings.'],
  ['cycle-artifacts', 'P1', 'artifacts', 'Record productive cycles with plan, proof, critique, and next ideas.'],
  ['negative-tests', 'P1', 'tests', 'Prove report is not final and early final attempts route back to work.'],
  ['readback-proof', 'P2', 'verification', 'Read or verify touched files after changes.']
];
const BLOCKING = new Set(['P0', 'P1']);

function ensure(m) {
  m.continuationQueue ||= [];
  if (!m.continuationQueue.length) for (const item of DEFAULT_ITEMS) add(m, seed(item));
  return m.continuationQueue;
}
function seed([id, severity, family, title]) {
  return { id, severity, family, title, status: 'open', required: BLOCKING.has(severity), createdAt: new Date().toISOString() };
}
function add(m, input = {}) {
  ensureNoSeed(m);
  const item = { id: input.id || `debt_${Date.now().toString(36)}_${m.continuationQueue.length + 1}`, severity: input.severity || 'P2', family: input.family || 'general', title: input.title || input.need || 'Continue hardening', status: input.status || 'open', required: input.required ?? BLOCKING.has(input.severity || 'P2'), createdAt: input.createdAt || new Date().toISOString(), proof: input.proof || '' };
  const existing = m.continuationQueue.find(x => x.id === item.id);
  if (existing) Object.assign(existing, item);
  else m.continuationQueue.push(item);
  return item;
}
function ensureNoSeed(m) { m.continuationQueue ||= []; }
function complete(m, input = {}) {
  ensure(m);
  const id = input.queueId || input.id || input.debtId || input.title || '';
  const item = m.continuationQueue.find(x => x.id === id || x.title === id) || next(m);
  if (!item) return null;
  item.status = 'done';
  item.completedAt = new Date().toISOString();
  item.proof = input.proof || item.proof || '';
  return item;
}
function open(m) { return ensure(m).filter(x => x.status !== 'done' && x.status !== 'dismissed'); }
function requiredOpen(m) { return open(m).filter(x => x.required || BLOCKING.has(x.severity)); }
function next(m) { return requiredOpen(m)[0] || open(m)[0] || null; }
function status(m) { const o = open(m), req = requiredOpen(m); return { total: ensure(m).length, open: o.length, requiredOpen: req.length, next: next(m), items: m.continuationQueue }; }

/**
 * B"H
 * Chapter 549: The ending grew a queue of unfinished sparks.
 * If an agent wants to leave, the queue points to the next concrete debt and
 * says: sweet one, not yet; this thread still asks to be woven.
 */
module.exports = { ensure, add, complete, open, requiredOpen, next, status };
