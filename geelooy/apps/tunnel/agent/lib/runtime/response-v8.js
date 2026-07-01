// B"H
function compactTrust(input = {}) {
  const action = String(input.action || input.requestAction || input.actualAction || 'unknown');
  const out = {
    ok: input.ok !== false,
    action,
    summary: text(input.summary) || defaultSummary(input),
    next: text(input.next) || defaultNext(input),
    trust: plainTrust(input.trust),
    requestAction: text(input.requestAction) || action,
    actualAction: text(input.actualAction) || action
  };
  for (const key of [
    'status', 'running', 'error', 'message', 'jobId', 'workerId', 'receipt', 'worker',
    'mission', 'recovery', 'evidence', 'cost', 'warnings', 'mode',
    'syncOptIn', 'statusPayload', 'waitPayload', 'stdoutPagePayload',
    'stderrPagePayload', 'aiInstructions', 'command', 'cwd', 'shell',
    'timeoutMs', 'storage'
  ]) {
    if (input[key] !== undefined) out[key] = input[key];
  }
  out.responseProtocol = input.responseProtocol || 'response-v8-compact-trust';
  return clean(out);
}
function plainTrust(value) {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object') return text(value.plainEnglish) || text(value.summary) || 'Receipt and action identity were preserved.';
  return 'Receipt and action identity were preserved.';
}
function defaultSummary(input = {}) {
  if (input.ok === false) return input.error ? `Action failed: ${input.error}.` : 'Action failed.';
  return 'Action accepted.';
}
function defaultNext(input = {}) {
  if (input.nextAction) return `Call ${input.nextAction} next.`;
  return input.ok === false ? 'Inspect the error and retry with a narrower request.' : 'Continue with the next requested action.';
}
function text(value) {
  if (value === undefined || value === null) return '';
  const s = String(value).trim();
  return s;
}
function clean(obj) {
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined || obj[key] === '') delete obj[key];
  }
  return obj;
}
module.exports = { compactTrust };
