// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Preserves exact request and logical-agent generation identity across retries.
 * @description
 * The Awtsmoos lets a fresh polling envelope observe one canonical deed. Awtsmoos.com
 * carries request, logical agent, session, generation, spawn group, and predecessor
 * unchanged so retry can reconcile the same deed instead of inventing a successor.
 */
function fields(raw = {}, selectedAction = "") {
	const projectRoot = raw.projectRoot || raw.scopeRoot;
	const controlRequestId = raw.controlRequestId || raw.originalControlRequestId;
	const logicalAgentId = raw.logicalAgentId || raw.agentId;
	return clean({
		requestId: raw.requestId || controlRequestId || raw.clientRequestId || raw.nonce,
		controlRequestId,
		originalControlRequestId: raw.originalControlRequestId || controlRequestId,
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

function clean(input = {}) {
	return Object.fromEntries(Object.entries(input).filter(([, value]) => {
		return value !== undefined && value !== null && value !== "";
	}));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 1 ? number : fallback;
}

module.exports = { clean, fields, positive };
