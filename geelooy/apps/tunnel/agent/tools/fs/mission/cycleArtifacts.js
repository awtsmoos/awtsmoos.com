// B"H

const REQUIRED = ['inspection', 'plan', 'verification', 'selfCritique', 'nextIdeas'];

function ensure(m) { m.innovationCycles ||= []; return m.innovationCycles; }
function record(m, input = {}) {
  const cycle = { id: input.id || input.cycleId || `cycle_${String(ensure(m).length + 1).padStart(3, '0')}`, startedAt: input.startedAt || new Date().toISOString(), endedAt: input.endedAt || new Date().toISOString(), inspection: text(input.inspection), plan: text(input.plan), implemented: arr(input.implemented), verification: text(input.verification || input.tests || input.proof), selfCritique: text(input.selfCritique || input.critique), nextIdeas: arr(input.nextIdeas || input.ideas), productiveMs: ms(input), family: input.family || 'general' };
  cycle.complete = missing(cycle).length === 0;
  ensure(m).push(cycle);
  return cycle;
}
function text(v) { return String(v || '').trim(); }
function arr(v) { if (Array.isArray(v)) return v.map(String).filter(Boolean); if (typeof v === 'string' && v.trim()) return v.split(/\n|,/).map(x => x.trim()).filter(Boolean); return []; }
function ms(input) {
  const explicit = Number(input.productiveMs || input.durationMs || 0);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const start = Date.parse(input.startedAt || '');
  const end = Date.parse(input.endedAt || '');
  return Number.isFinite(start) && Number.isFinite(end) && end > start ? end - start : 1;
}
function missing(cycle) {
  const miss = [];
  if (!cycle.inspection) miss.push('inspection');
  if (!cycle.plan) miss.push('plan');
  if (!cycle.verification) miss.push('verification');
  if (!cycle.selfCritique) miss.push('selfCritique');
  if (!cycle.nextIdeas.length) miss.push('nextIdeas');
  return miss;
}
function completeCycles(m) { return ensure(m).filter(c => c.complete); }
function productiveMs(m) { return completeCycles(m).reduce((sum, c) => sum + Number(c.productiveMs || 0), 0); }
function status(m) { return { total: ensure(m).length, complete: completeCycles(m).length, productiveMs: productiveMs(m), latest: ensure(m).at(-1) || null, requiredFields: REQUIRED }; }

/**
 * B"H
 * Chapter 550: Minutes stopped lying. Only inspection, plan, proof, critique,
 * and new ideas count as living time in the mission clock.
 */
module.exports = { ensure, record, missing, completeCycles, productiveMs, status, REQUIRED };
