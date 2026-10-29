// B"H

/**
 * @file Projects bounded response evidence without discarding durable identity.
 * @description The Awtsmoos guards each result; Awtsmoos.com sends the deed,
 * not a thousand echoes of the guardian's telemetry and forgotten shadows.
 */
function trimValue(value, key) {
	if (key === 'queueStats' && value && typeof value === 'object' &&
		(value.connection || value.lanes)) return queueSummary(value);
	if (typeof value === 'string' && value.length > 10485760) return value.slice(0, 10485760);
	if (Array.isArray(value)) return value.slice(0, 500);
	return value;
}

/** Keeps high-level queue proof while reserving deep telemetry for debug mode. */
function queueSummary(value) {
	const connection = value.connection || {};
	const health = connection.fullHealth || {};
	const executor = value.filesystemExecutor || {};
	const workers = value.workers || {};
	return clean({
		inflight: value.inflight,
		queued: value.queued,
		maxInflight: value.maxInflight,
		maxQueue: value.maxQueue,
		executionStages: value.executionStages && {
			active: value.executionStages.active,
			waitingForConsumer: value.executionStages.waitingForConsumer
		},
		workers: { activeTotal: workers.activeTotal, healthy: workers.health?.ok },
		filesystemExecutor: { ready: executor.ready, busy: executor.busy, queued: executor.queued },
		connection: {
			connected: connection.connected,
			registered: connection.registered,
			state: health.state,
			transportHealthy: health.transportHealthy,
			executionHealthy: health.executionHealthy,
			mailboxHealthy: health.mailboxHealthy
		},
		eventLoopLagP90Ms: value.eventLoopLag?.p90Ms,
		circuitLevel: value.circuit?.level,
		alertLanes: Object.entries(value.lanes || {}).filter(([, lane]) =>
			lane.starved || (lane.healthState && lane.healthState !== 'healthy')
		).slice(0, 5).map(([name, lane]) => ({ name, state: lane.healthState }))
	});
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
		if (value[key] === undefined || value[key] === '' ||
			(Array.isArray(value[key]) && !value[key].length)) delete value[key];
	}
	return value;
}

module.exports = { actionPayload, clean, evidence, next, pagePayload, short, summary, trimValue };
