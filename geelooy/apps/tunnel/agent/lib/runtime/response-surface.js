// B"H
const DEBUG_MODES = new Set(['debug', 'full', 'audit', 'raw', 'standard']);
const CORRELATION_KEYS = [
	'type','id','tunnelName','requestedTunnelName','controlRequestId','clientRequestId',
	'agentSessionId','logicalAgentId','agentName','projectRoot','workspaceId','nonce',
	'conversationId','conversationName','missionId','roomId','leaseId','parentActionId',
	'traceId','spanId','causalParentId','correlationId','actionId','vessel','routeReason',
	'requestAction','actualAction','actionMismatch','requestedAction','requestedActionRaw',
	'jobId','workerId','receiptId','stream','cwd','command','path','paths'
];
const ESSENTIAL_KEYS = [
	'content','content64','returnedChars','totalChars','hasNextPage','nextOffsetChars','nextPagePayload',
	'items','entries','detailedItems','files','dirs','order','count','returnedCount','root','absolutePath',
	'relativePath','path','exists','isDirectory','isFile','size','mtimeMs','birthtimeMs','sha256','hash',
	'bytes','written','statusPayload','waitPayload','stdoutPagePayload','stderrPagePayload','outputPagePayload',
	'outputPage','results','result','errors','diagnostics','message','record','history','session','queue',
	'queueStats','queuedMs','longLivedConnection','advisoryOvertime','retryAfterMs','retryable',
	'receipts','receipt','worker','workers','mission','cost','recovery','cleanup','phase','promptCount',
	'preview','url','viewUrl','proxyUrl','rawUrl','wsUrl','detectedServers','selectedServer','agentGuidance',
	'nextSuggestedAction','taskId','state','progress','resume','plan','evidence','chrome','targets',
	'pages','activeTarget','currentUrl','currentTarget','browser','port','enabled','pid','processGroupId',
	'version','webSocketDebuggerUrl','responseShape','responseMode','responseProtocol','storage','trust','warnings','mode',
	'syncOptIn','aiInstructions','shell','timeoutMs','stdout','stderr','stdoutBytes','stderrBytes','exitCode',
	'signal','durationMs','resourceUsage','orphanReason','reconciliationAt','health','stats','lane','priority'
];

/**
 * B"H — Compact responses keep lineage, ownership, receipts, queue proof, and
 * control payloads needed to continue. Debug mode reveals the unabridged vessel.
 */
function wantsDebug(payload = {}, result = {}) {
	const mode = String(payload.responseMode || payload.mode || result.responseMode || '').toLowerCase();
	return DEBUG_MODES.has(mode) || payload.debug === true || payload.full === true || result.debug === true;
}

function publicEnvelope(base = {}, payload = {}, result = {}) {
	if (wantsDebug(payload, result)) return base;
	return clean({
		...correlation(base),
		...essentials(base),
		BH: base.BH,
		ok: base.ok !== false,
		action: base.action || base.actualAction || base.requestAction,
		status: base.status,
		pending: base.pending,
		running: base.running,
		done: base.done,
		error: base.error,
		summary: summary(base),
		next: next(base),
		receiptId: base.receiptId || base.receipt?.receiptId || base.actionId,
		workerId: base.workerId || base.receipt?.workerId,
		missionId: base.missionId || base.mission?.missionId,
		conversationId: base.conversationId,
		evidence: evidence(base),
		nextAction: actionPayload(base.nextAction || base.statusPayload || base.waitPayload),
		outputPage: pagePayload(base.stdoutPagePayload || base.outputPagePayload || base.nextPagePayload),
		debugRef: base.detailsRef || base.outputRef || base.actionId || base.receipt?.receiptId,
		responseShape: base.responseShape || 'simple-envelope-v10',
		previewRequired: false,
		responseFocus: { ...(base.responseFocus || {}), previewRequired: false, reason: base.responseFocus?.reason || 'simple_response_default' },
		previewPolicy: { ...(base.previewPolicy || {}), enabled: false, reason: base.previewPolicy?.reason || 'simple_response_default' }
	});
}

function correlation(base = {}) {
	const out = {};
	for (const key of CORRELATION_KEYS) if (base[key] !== undefined) out[key] = base[key];
	if (!out.type) out.type = 'TUNNEL_RESPONSE';
	return out;
}
function essentials(base = {}) {
	const out = {};
	for (const key of ESSENTIAL_KEYS) if (base[key] !== undefined) out[key] = trimValue(base[key]);
	return out;
}
function trimValue(value) {
	if (typeof value === 'string' && value.length > 50000) return value.slice(0, 50000);
	if (Array.isArray(value)) return value.slice(0, 500);
	return value;
}
function summary(value = {}) {
	if (value.summary) return short(value.summary, 180);
	if (value.ok === false) return value.error ? `Failed: ${value.error}` : 'Failed.';
	if (value.pending) return 'Accepted; still running.';
	if (value.status === 'completed' || value.done) return 'Completed.';
	if (value.status === 'running' || value.running) return 'Running.';
	return 'Accepted.';
}
function next(value = {}) {
	if (typeof value.next === 'string') return short(value.next, 180);
	if (value.waitPayload) return 'Poll waitPayload/statusPayload; do not hold a gateway request open.';
	if (value.stdoutPagePayload || value.outputPagePayload || value.nextPagePayload) return 'Fetch outputPage for details.';
	if (value.mission?.next) return short(value.mission.next, 180);
	return value.ok === false ? 'Inspect the error, then retry narrowly.' : 'Continue with the next safe action.';
}
function evidence(value = {}) {
	const items = Array.isArray(value.evidence) ? value.evidence : [];
	const out = items.slice(0, 4).map(item => short(typeof item === 'string' ? item : JSON.stringify(item), 120));
	if (value.vessel) out.push(`vessel:${value.vessel}`);
	if (value.routeReason) out.push(`route:${value.routeReason}`);
	return out.slice(0, 4);
}
function actionPayload(value = null) {
	if (!value || typeof value !== 'object') return undefined;
	return clean({ action: value.action, jobId: value.jobId, taskId: value.taskId, conversationId: value.conversationId, waitTimeoutMs: value.waitTimeoutMs, pollIntervalMs: value.pollIntervalMs });
}
function pagePayload(value = null) {
	if (!value || typeof value !== 'object') return undefined;
	return clean({ action: value.action, jobId: value.jobId, taskId: value.taskId, stream: value.stream, offsetChars: value.offsetChars, maxChars: value.maxChars });
}
function short(value, length) { const text = String(value || ''); return text.length > length ? `${text.slice(0, length)}…` : text; }
function clean(value) {
	for (const key of Object.keys(value)) if (value[key] === undefined || value[key] === '' || (Array.isArray(value[key]) && !value[key].length)) delete value[key];
	return value;
}

module.exports = { DEBUG_MODES, CORRELATION_KEYS, ESSENTIAL_KEYS, wantsDebug, publicEnvelope, correlation, essentials, clean };
