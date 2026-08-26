// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Preserves deed identity without confusing retry transport with original truth.
 * @description
 * The Awtsmoos lets one deed travel through many messengers; Awtsmoos.com therefore
 * names the outer retry receipt as transport while preserving an original deed only
 * when an explicit original witness was actually carried into this normalization step.
 * Ordinary requests retain one canonical identity because their transport is the deed.
 */
function fields(raw = {}, selectedAction = "") {
	const projectRoot = raw.projectRoot || raw.scopeRoot;
	const retrying = isRetry(raw, selectedAction);
	const controlRequestId = raw.controlRequestId || raw.originalControlRequestId;
	const originalControlRequestId = retrying
		? raw.originalControlRequestId
		: (raw.originalControlRequestId || controlRequestId);
	const logicalAgentId = raw.logicalAgentId || raw.agentId;

	return clean({
		requestId: raw.requestId || controlRequestId || raw.clientRequestId || raw.nonce,
		controlRequestId,
		originalControlRequestId,
		clientRequestId: raw.clientRequestId,
		nonce: raw.nonce,
		requestedAction: raw.requestedAction || raw.requestAction || selectedAction,
		requestAction: raw.requestAction || raw.requestedAction || selectedAction,
		logicalAgentId,
		agentSessionId: raw.agentSessionId,
		generation: positive(raw.generation || raw.agentGeneration, 1),
		spawnGroupId: raw.spawnGroupId,
		parentAgentId: raw.parentAgentId,
		predecessorAgentId: raw.predecessorAgentId,
		agentName: raw.agentName,
		missionId: raw.missionId,
		roomId: raw.roomId,
		leaseId: raw.leaseId || raw.agentLeaseId,
		conversationId: raw.conversationId,
		conversationName: raw.conversationName,
		projectRoot,
		scopeRoot: projectRoot,
		workspaceId: raw.workspaceId,
		idempotencyKey: raw.idempotencyKey,
		traceId: raw.traceId || raw.correlationId,
		spanId: raw.spanId,
		causalParentId: raw.causalParentId,
		parentActionId: raw.parentActionId
	});
}

/**
 * Returns whether this identity belongs to a retry observation envelope.
 * @param {object} raw Raw normalized request carrier.
 * @param {string} selectedAction Selected public action.
 * @returns {boolean} True only for retryAction.
 */
function isRetry(raw = {}, selectedAction = "") {
	return String(raw.action || selectedAction || "") === "retryAction";
}

/** Removes absent values without mutating valid numeric or boolean testimony. */
function clean(input = {}) {
	return Object.fromEntries(Object.entries(input).filter(([, value]) => {
		return value !== undefined && value !== null && value !== "";
	}));
}

/** Normalizes one positive generation number with a trusted fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 1 ? number : fallback;
}

module.exports = {
	clean,
	fields,
	isRetry,
	positive
};
