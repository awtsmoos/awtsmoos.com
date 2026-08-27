// B"H

/** B"H — Small response projections preserve control while bounding public text. */
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
	if (value.stdoutPagePayload || value.outputPagePayload || value.nextPagePayload) {
		return 'Fetch outputPage for details.';
	}
	if (value.mission?.next) return short(value.mission.next, 180);
	return value.ok === false
		? 'Inspect the error, then retry narrowly.'
		: 'Continue with the next safe action.';
}

function evidence(value = {}) {
	const items = Array.isArray(value.evidence) ? value.evidence : [];
	const out = items.slice(0, 4).map(item => short(
		typeof item === 'string' ? item : JSON.stringify(item),
		120
	));
	if (value.vessel) out.push(`vessel:${value.vessel}`);
	if (value.routeReason) out.push(`route:${value.routeReason}`);
	return out.slice(0, 4);
}

function actionPayload(value = null) {
	if (!value || typeof value !== 'object') return undefined;
	return clean({
		action: value.action,
		jobId: value.jobId,
		taskId: value.taskId,
		conversationId: value.conversationId,
		waitTimeoutMs: value.waitTimeoutMs,
		pollIntervalMs: value.pollIntervalMs
	});
}

function pagePayload(value = null) {
	if (!value || typeof value !== 'object') return undefined;
	return clean({
		action: value.action,
		jobId: value.jobId,
		taskId: value.taskId,
		stream: value.stream,
		offsetChars: value.offsetChars,
		maxChars: value.maxChars
	});
}

function short(value, length) {
	const text = String(value || '');
	return text.length > length ? `${text.slice(0, length)}…` : text;
}

function clean(value) {
	for (const key of Object.keys(value)) {
		if (value[key] === undefined ||
			value[key] === '' ||
			(Array.isArray(value[key]) && !value[key].length)) {
			delete value[key];
		}
	}
	return value;
}

module.exports = {
	actionPayload,
	clean,
	evidence,
	next,
	pagePayload,
	short,
	summary,
	trimValue
};
