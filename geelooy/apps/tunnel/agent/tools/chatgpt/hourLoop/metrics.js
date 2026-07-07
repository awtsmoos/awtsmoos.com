// B"H

/** B"H — Chapter 1945: Evidence is measured before it becomes memory. */
function sample(input = {}) {
  return clean({
    at: new Date().toISOString(),
    phase: input.phase || 'tick',
    tickMs: num(input.tickMs),
    queuedMs: num(input.queuedMs),
    lagMs: num(input.lagMs),
    routeOk: bool(input.routeOk),
    idle: bool(input.idle),
    sent: bool(input.sent),
    failure: input.failure || '',
    conversationId: input.conversationId || ''
  });
}

function clean(obj) { Object.keys(obj).forEach(k => obj[k] === '' || obj[k] === null || obj[k] === undefined ? delete obj[k] : null); return obj; }
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : undefined; }
function bool(v) { return typeof v === 'boolean' ? v : undefined; }
module.exports = { sample, clean, num, bool };
