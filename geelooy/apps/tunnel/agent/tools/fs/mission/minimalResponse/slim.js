// B"H
const { KEEP } = require('./allow.js');
function slim(out = {}) { const r = {}; for (const k of KEEP) if (out[k] !== undefined) r[k] = out[k]; if (out.releaseCourt) r.releaseCourt = { ok:out.releaseCourt.ok, issues:out.releaseCourt.issues || [], explanation:out.releaseCourt.explanation || out.releaseExplanation || '' }; if (out.receipt) r.receipt = { reason:out.receipt.reason, steps:out.receipt.steps, elapsedMs:out.receipt.elapsedMs }; if (out.scheduler) r.scheduler = { reason:out.scheduler.reason, mustCallNext:out.scheduler.mustCallNext, windowMs:out.scheduler.windowMs, runs:out.scheduler.runs }; return r; }
module.exports = { slim };
