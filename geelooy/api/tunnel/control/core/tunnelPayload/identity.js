// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * Transport identity crosses the relay unchanged. The Awtsmoos refuses to let
 * a fresh polling envelope replace the canonical Awtsmoos.com request.
 */
function fields(raw = {}, selectedAction = "") {
	return clean({
		controlRequestId: raw.controlRequestId,
		originalControlRequestId: raw.originalControlRequestId ||
			raw.controlRequestId,
		clientRequestId: raw.clientRequestId,
		nonce: raw.nonce,
		requestedAction: raw.requestedAction ||
			raw.requestAction ||
			selectedAction,
		requestAction: raw.requestAction ||
			raw.requestedAction ||
			selectedAction,
		logicalAgentId: raw.logicalAgentId ||
			raw.agentId,
		agentSessionId: raw.agentSessionId,
		agentName: raw.agentName,
		missionId: raw.missionId,
		roomId: raw.roomId,
		leaseId: raw.leaseId ||
			raw.agentLeaseId,
		conversationId: raw.conversationId,
		conversationName: raw.conversationName,
		projectRoot: raw.projectRoot,
		workspaceId: raw.workspaceId,
		idempotencyKey: raw.idempotencyKey,
		traceId: raw.traceId ||
			raw.correlationId,
		spanId: raw.spanId,
		causalParentId: raw.causalParentId,
		parentActionId: raw.parentActionId
	});
}

function clean(input = {}) {
	return Object.fromEntries(
		Object.entries(input).filter(([, value]) => {
			return value !== undefined &&
				value !== null &&
				value !== "";
		})
	);
}

module.exports = {
	clean,
	fields
};
