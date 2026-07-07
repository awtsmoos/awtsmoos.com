// B"H
const Surface = require('./response-surface.js');

/**
 * B"H
 * Compact trust now means compact by default. Full worker, storage, queue,
 * command, and mission internals remain available through responseMode=debug.
 */
function compactTrust(input = {}, payload = {}) {
  const action = String(input.action || input.requestAction || input.actualAction || 'unknown');
  const full = clean({
    ok: input.ok !== false,
    action,
    summary: text(input.summary) || defaultSummary(input),
    next: text(input.next) || defaultNext(input),
    trust: plainTrust(input.trust),
    requestAction: text(input.requestAction) || action,
    actualAction: text(input.actualAction) || action,
    status: input.status,
    running: input.running,
    error: input.error,
    message: input.message,
    jobId: input.jobId,
    workerId: input.workerId,
    receipt: input.receipt,
    worker: input.worker,
    mission: input.mission,
    recovery: input.recovery,
    evidence: input.evidence,
    cost: input.cost,
    warnings: input.warnings,
    mode: input.mode,
    syncOptIn: input.syncOptIn,
    statusPayload: input.statusPayload,
    waitPayload: input.waitPayload,
    stdoutPagePayload: input.stdoutPagePayload,
    stderrPagePayload: input.stderrPagePayload,
    aiInstructions: input.aiInstructions,
    command: input.command,
    cwd: input.cwd,
    shell: input.shell,
    timeoutMs: input.timeoutMs,
    storage: input.storage,
    responseProtocol: input.responseProtocol || 'response-v8-compact-trust'
  });
  return Surface.wantsDebug(payload, input) ? full : Surface.publicEnvelope(full, payload, input);
}
function plainTrust(value) {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object') return text(value.plainEnglish) || text(value.summary) || 'Receipt and action identity were preserved.';
  return 'Receipt and action identity were preserved.';
}
function defaultSummary(input = {}) {
  if (input.ok === false) return input.error ? `Action failed: ${input.error}.` : 'Action failed.';
  if (input.status === 'running') return 'Started in isolated worker.';
  if (input.status === 'completed') return 'Command completed.';
  return 'Action accepted.';
}
function defaultNext(input = {}) {
  if (input.nextAction) return `Call ${input.nextAction} next.`;
  if (input.waitPayload) return 'Poll waitPayload or statusPayload.';
  return input.ok === false ? 'Inspect the error and retry with a narrower request.' : 'Continue with the next requested action.';
}
function text(value) { return value === undefined || value === null ? '' : String(value).trim(); }
function clean(obj) { for (const key of Object.keys(obj)) if (obj[key] === undefined || obj[key] === '') delete obj[key]; return obj; }
module.exports = { compactTrust };
