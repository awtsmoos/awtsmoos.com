// B"H
const DEBUG_MODES = new Set(['debug', 'full', 'audit', 'raw', 'standard']);
const CORRELATION_KEYS = ['type','id','tunnelName','requestedTunnelName','controlRequestId','clientRequestId','agentSessionId','logicalAgentId','projectRoot','nonce','vessel','routeReason','requestAction','actualAction','actionMismatch','jobId','stream','cwd','command','path','paths'];
const ESSENTIAL_KEYS = [
  'content','content64','returnedChars','totalChars','hasNextPage','nextOffsetChars','nextPagePayload',
  'items','entries','detailedItems','files','dirs','order','count','returnedCount','root','absolutePath','relativePath','path',
  'exists','isDirectory','isFile','size','mtimeMs','birthtimeMs','sha256','hash','bytes','written',
  'statusPayload','waitPayload','stdoutPagePayload','stderrPagePayload','outputPagePayload','outputPage',
  'results','result','errors','diagnostics','message','record','history','session','queue','receipts','phase','promptCount',
  'preview','url','viewUrl','proxyUrl','rawUrl','wsUrl','detectedServers','selectedServer','agentGuidance','nextSuggestedAction',
  'taskId','state','progress','resume','missionId','plan','evidence','chrome','targets','pages','activeTarget','currentUrl','currentTarget','browser','port','enabled','pid','version','webSocketDebuggerUrl'
];
function wantsDebug(payload = {}, result = {}) { const mode = String(payload.responseMode || payload.mode || result.responseMode || '').toLowerCase(); return DEBUG_MODES.has(mode) || payload.debug === true || payload.full === true || result.debug === true; }
function publicEnvelope(base = {}, payload = {}, result = {}) {
  if (wantsDebug(payload, result)) return base;
  return clean({ ...correlation(base), ...essentials(base), BH:base.BH, ok:base.ok !== false, action:base.action || base.actualAction || base.requestAction, status:base.status, pending:base.pending, running:base.running, done:base.done, error:base.error, summary:summary(base), next:next(base), receiptId:base.receiptId || base.receipt?.receiptId || base.actionId, workerId:base.workerId || base.receipt?.workerId, missionId:base.missionId || base.mission?.missionId, conversationId:base.conversationId, evidence:evidence(base), nextAction:actionPayload(base.nextAction || base.statusPayload || base.waitPayload), outputPage:pagePayload(base.stdoutPagePayload || base.outputPagePayload || base.nextPagePayload), debugRef:base.detailsRef || base.outputRef || base.actionId || base.receipt?.receiptId, responseShape:'simple-envelope-v10', previewRequired:false, responseFocus:{ ...(base.responseFocus || {}), previewRequired:false, reason:(base.responseFocus && base.responseFocus.reason) || 'simple_response_default' }, previewPolicy:{ ...(base.previewPolicy || {}), enabled:false, reason:(base.previewPolicy && base.previewPolicy.reason) || 'simple_response_default' } });
}
function correlation(base = {}) { const out = {}; for (const k of CORRELATION_KEYS) if (base[k] !== undefined) out[k] = base[k]; if (!out.type) out.type = 'TUNNEL_RESPONSE'; return out; }
function essentials(base = {}) { const out = {}; for (const k of ESSENTIAL_KEYS) if (base[k] !== undefined) out[k] = trimValue(base[k]); return out; }
function trimValue(v) { if (typeof v === 'string' && v.length > 50000) return v.slice(0,50000); if (Array.isArray(v)) return v.slice(0,500); return v; }
function summary(x = {}) { if (x.summary) return short(x.summary, 180); if (x.ok === false) return x.error ? `Failed: ${x.error}` : 'Failed.'; if (x.pending) return 'Accepted; still running.'; if (x.status === 'completed' || x.done) return 'Completed.'; if (x.status === 'running' || x.running) return 'Running.'; return 'Accepted.'; }
function next(x = {}) { if (typeof x.next === 'string') return short(x.next, 180); if (x.waitPayload) return 'Poll waitPayload/statusPayload; do not hold a gateway request open.'; if (x.stdoutPagePayload || x.outputPagePayload || x.nextPagePayload) return 'Fetch outputPage for details.'; if (x.mission?.next) return short(x.mission.next, 180); return x.ok === false ? 'Inspect the error, then retry narrowly.' : 'Continue with the next safe action.'; }
function evidence(x = {}) { const arr = Array.isArray(x.evidence) ? x.evidence : []; const out = arr.slice(0,4).map(v => short(typeof v === 'string' ? v : JSON.stringify(v), 120)); if (x.vessel) out.push(`vessel:${x.vessel}`); if (x.routeReason) out.push(`route:${x.routeReason}`); return out.slice(0,4); }
function actionPayload(p = null) { if (!p || typeof p !== 'object') return undefined; return clean({ action:p.action, jobId:p.jobId, taskId:p.taskId, conversationId:p.conversationId, waitTimeoutMs:p.waitTimeoutMs, pollIntervalMs:p.pollIntervalMs }); }
function pagePayload(p = null) { if (!p || typeof p !== 'object') return undefined; return clean({ action:p.action, jobId:p.jobId, taskId:p.taskId, stream:p.stream, offsetChars:p.offsetChars, maxChars:p.maxChars }); }
function short(s, n) { s=String(s||''); return s.length>n?`${s.slice(0,n)}…`:s; }
function clean(obj) { for (const k of Object.keys(obj)) if (obj[k] === undefined || obj[k] === '' || (Array.isArray(obj[k]) && !obj[k].length)) delete obj[k]; return obj; }
module.exports = { DEBUG_MODES, CORRELATION_KEYS, ESSENTIAL_KEYS, wantsDebug, publicEnvelope, correlation, essentials, clean };
