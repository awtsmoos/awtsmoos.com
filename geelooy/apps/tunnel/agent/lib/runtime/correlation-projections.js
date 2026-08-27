// B"H
const Extract = require('./correlation-extract.js');
const Fields = require('./correlation-fields.js');

/** B"H — Each projection reveals only the identity needed by its receiving vessel. */
function correlationEnv(input = {}) {
	const scope = Extract.extractCorrelationScope(input);
	return Fields.clean({
		AWTSMOOS_TUNNEL_NAME: scope.tunnelName,
		AWTSMOOS_DEVICE_NAME: scope.deviceName,
		AWTSMOOS_PROJECT_ROOT: scope.projectRoot,
		AWTSMOOS_WORKSPACE_ID: scope.workspaceId,
		AWTSMOOS_AGENT_SESSION_ID: scope.agentSessionId,
		AWTSMOOS_LOGICAL_AGENT_ID: scope.logicalAgentId,
		AWTSMOOS_AGENT_NAME: scope.agentName,
		AWTSMOOS_CONVERSATION_ID: scope.conversationId,
		AWTSMOOS_CONVERSATION_NAME: scope.conversationName,
		AWTSMOOS_MISSION_ID: scope.missionId,
		AWTSMOOS_ROOM_ID: scope.roomId,
		AWTSMOOS_LEASE_ID: scope.leaseId,
		AWTSMOOS_TRACE_ID: scope.traceId,
		AWTSMOOS_SPAN_ID: scope.spanId,
		AWTSMOOS_NONCE: scope.nonce
	});
}

function correlationReceipt(input = {}) {
	const scope = Extract.extractCorrelationScope(input);
	return pick(scope, [
		'receiptId',
		'jobId',
		'workerId',
		'missionId',
		'roomId',
		'agentSessionId',
		'logicalAgentId',
		'conversationId',
		'conversationName',
		'leaseId',
		'traceId',
		'spanId',
		'source'
	]);
}

function correlationPreview(input = {}) {
	const scope = Extract.extractCorrelationScope(input);
	return pick(scope, [
		'tunnelName',
		'projectRoot',
		'workspaceId',
		'missionId',
		'roomId',
		'agentSessionId',
		'logicalAgentId',
		'conversationId',
		'actionId',
		'traceId',
		'source'
	]);
}

function correlationWorker(input = {}) {
	const scope = Extract.extractCorrelationScope(input);
	return pick(scope, [
		'workerId',
		'jobId',
		'receiptId',
		'missionId',
		'roomId',
		'agentSessionId',
		'logicalAgentId',
		'conversationId',
		'conversationName',
		'leaseId',
		'parentActionId',
		'traceId',
		'spanId',
		'causalParentId',
		'startedAt',
		'source'
	]);
}

function pick(scope, keys) {
	return Fields.clean(Object.fromEntries(keys.map(key => [key, scope[key]])));
}

module.exports = {
	correlationEnv,
	correlationPreview,
	correlationReceipt,
	correlationWorker,
	pick
};
