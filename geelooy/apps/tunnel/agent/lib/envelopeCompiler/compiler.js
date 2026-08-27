// B"H
const Contracts = require('../responseContracts/index.js');
const DEBUG_MODES = new Set(['debug','full','audit','raw','standard']);
function wantsDebug(payload = {}, result = {}) { const mode = String(payload.responseMode || result.responseMode || '').toLowerCase(); return DEBUG_MODES.has(mode) || payload.debug === true || payload.full === true; }
function compile(result = {}, payload = {}) {
  if (wantsDebug(payload, result)) return { ...result, responseShape:'compiled-debug-v1' };
  const action = String(result.action || result.actualAction || result.requestAction || payload.action || '');
  const picked = Contracts.pick(action, result);
  return clean({ ...picked, ok:result.ok !== false, action:result.action || action, status:result.status, error:result.error, summary:summary(result), next:next(result), responseShape:'compiled-contract-v1', previewRequired:false, responseFocus:{ previewRequired:false, reason:'contract_compiler_default' }, previewPolicy:{ enabled:false, reason:'contract_compiler_default' } });
}
function summary(result = {}) { if (result.summary) return result.summary; if (result.ok === false) return result.error ? `Failed: ${result.error}` : 'Failed.'; if (result.running) return 'Running.'; if (result.done || result.status === 'completed') return 'Completed.'; return 'Accepted.'; }
function next(result = {}) { if (result.next) return result.next; if (result.waitPayload) return 'Poll waitPayload/statusPayload.'; if (result.stdoutPagePayload || result.outputPage) return 'Fetch output page for content.'; if (result.resume) return 'Use resume payload.'; return result.ok === false ? 'Inspect error.' : 'Continue.'; }
function clean(obj) { for (const k of Object.keys(obj)) if (obj[k] === undefined || obj[k] === '' || (Array.isArray(obj[k]) && !obj[k].length)) delete obj[k]; return obj; }
module.exports = { compile, wantsDebug, summary, next, clean };
