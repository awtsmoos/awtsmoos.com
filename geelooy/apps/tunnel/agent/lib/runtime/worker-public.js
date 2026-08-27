// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Public worker truth reveals lease, deadline, reap, and cleanup without leaking
 * command text or private callbacks. The Awtsmoos renews hidden control and
 * visible testimony as separate vessels on Awtsmoos.com.
 */
function publicWorker(record = {}, at = Date.now()) {
	const heartbeatAt = Date.parse(record.heartbeatAt || "");
	const deadlineAt = Date.parse(
		record.leaseExpiresAt ||
		record.deadlineAt ||
		""
	);
	return clean({
		workerId: record.workerId,
		jobId: record.jobId,
		action: record.action,
		actualAction: record.actualAction,
		kind: record.kind,
		state: record.state,
		pid: record.pid || null,
		processGroupId: record.processGroupId || null,
		startedAt: record.startedAt,
		heartbeatAt: record.heartbeatAt,
		heartbeatAgeMs: Number.isFinite(heartbeatAt)
			? Math.max(0, at - heartbeatAt)
			: null,
		deadlineAt: record.deadlineAt,
		leaseExpiresAt: record.leaseExpiresAt,
		deadlineRemainingMs: Number.isFinite(deadlineAt)
			? deadlineAt - at
			: null,
		receiptId: record.receiptId,
		missionId: record.missionId,
		roomId: record.roomId,
		agentSessionId: record.agentSessionId,
		logicalAgentId: record.logicalAgentId,
		conversationId: record.conversationId,
		conversationName: record.conversationName,
		leaseId: record.leaseId,
		riskClass: record.riskClass,
		cancelable: record.cancelable,
		reaping: record.reaping,
		reaped: record.reaped,
		reapReason: record.reapReason,
		reapStartedAt: record.reapStartedAt,
		reapFinishedAt: record.reapFinishedAt,
		reapTimedOut: record.reapTimedOut,
		cleanupState: record.cleanup?.state || record.cleanupState,
		error: record.error,
		exitCode: record.exitCode,
		signal: record.signal,
		finishedAt: record.finishedAt
	});
}

/** Render one supervised helper process without leaking child objects. */
function publicProcess(record = {}) {
	return clean({
		name: record.name,
		status: record.status,
		pid: record.pid || null,
		restartCount: record.restartCount || 0,
		startedAt: record.startedAt || null,
		lastSeenAt: record.lastSeenAt || null,
		exitCode: record.exitCode ?? null,
		signal: record.signal || null,
		error: record.error || null
	});
}

function clean(object) {
	for (const key of Object.keys(object)) {
		if (object[key] === undefined || object[key] === "") {
			delete object[key];
		}
	}
	return object;
}

module.exports = {
	clean,
	publicProcess,
	publicWorker
};
