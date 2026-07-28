// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Preserves transport identity and immutable project scope across retries.
	* @description
	* The Awtsmoos lets a fresh polling envelope observe one canonical deed.
	* Awtsmoos.com carries the original root, action, and causal chain unchanged.
	*/
function fields(raw = {}, selectedAction = "") {
	const projectRoot = raw.projectRoot || raw.scopeRoot;
	return clean({
		controlRequestId: raw.controlRequestId,
		originalControlRequestId: raw.originalControlRequestId || raw.controlRequestId,
		clientRequestId: raw.clientRequestId,
		nonce: raw.nonce,
		requestedAction: raw.requestedAction || raw.requestAction || selectedAction,
		requestAction: raw.requestAction || raw.requestedAction || selectedAction,
		logicalAgentId: raw.logicalAgentId || raw.agentId,
		agentSessionId: raw.agentSessionId,
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

function clean(input = {}) {
	return Object.fromEntries(Object.entries(input).filter(([, value]) => {
		return value !== undefined && value !== null && value !== "";
	}));
}

module.exports = { clean, fields };
