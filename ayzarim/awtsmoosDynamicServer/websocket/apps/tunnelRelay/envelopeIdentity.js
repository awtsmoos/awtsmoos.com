// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Preserves immutable request identity while making receipt semantics explicit.
 * @description
 * The Awtsmoos keeps one deed recognizable while state changes around it.
 * Awtsmoos.com labels control-request identity, command-job identity, mutation intent,
 * and the correct observation action so callers never confuse one lifecycle with another.
 */
function identityEnvelope(expected = {}) {
	const controlRequestId = expected.controlRequestId || expected.id;
	return compact({
		receiptType: "control_request",
		controlRequestIdType: "control_request",
		tunnelName: expected.tunnelName,
		requestedTunnelName: expected.requestedTunnelName,
		controlRequestId,
		clientRequestId: expected.clientRequestId,
		agentSessionId: expected.agentSessionId,
		logicalAgentId: expected.logicalAgentId,
		projectRoot: expected.projectRoot,
		nonce: expected.nonce,
		jobId: expected.jobId,
		jobIdType: expected.jobId ? "command_job" : undefined,
		stream: expected.stream,
		cwd: expected.cwd,
		command: expected.command,
		path: expected.path,
		requestAction: expected.requestedAction,
		requestedAction: expected.requestedAction,
		observationAction: "retryAction",
		mutationIntent: mutationIntent(expected)
	});
}

/** Builds the exact input for observing the existing canonical control request. */
function retryPayload(expected = {}) {
	return compact({
		tunnelName: expected.tunnelName,
		requestedTunnelName: expected.requestedTunnelName,
		controlRequestId: expected.controlRequestId || expected.id,
		clientRequestId: expected.clientRequestId,
		agentSessionId: expected.agentSessionId,
		logicalAgentId: expected.logicalAgentId,
		projectRoot: expected.projectRoot,
		nonce: expected.nonce,
		jobId: expected.jobId,
		stream: expected.stream,
		cwd: expected.cwd,
		command: expected.command,
		path: expected.path,
		action: "retryAction",
		requestedAction: expected.requestedAction,
		autoPreview: false
	});
}

/** Projects requested mutation mode without claiming execution or durability happened. */
function mutationIntent(expected = {}) {
	if (expected.mutation !== true) return undefined;
	return {
		mutation: true,
		dryRun: expected.dryRun,
		confirm: expected.confirm,
		previewRequested: expected.previewRequested === true,
		durableRequested: expected.durableRequested === true,
		mode: expected.mutationMode || "unknown"
	};
}

function compact(value = {}) {
	return Object.fromEntries(Object.entries(value).filter(([, item]) => (
		item !== undefined && item !== null && item !== ""
	)));
}

module.exports = {
	compact,
	identityEnvelope,
	mutationIntent,
	retryPayload
};
