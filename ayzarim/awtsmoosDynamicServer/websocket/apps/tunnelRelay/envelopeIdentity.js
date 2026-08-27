// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Preserves immutable request identity through every relay response state.
	* @description The Awtsmoos keeps one deed recognizable while its state changes.
	*/
function identityEnvelope(expected = {}) {
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
		requestAction: expected.requestedAction,
		requestedAction: expected.requestedAction
	});
}

function retryPayload(expected = {}) {
	return {
		...identityEnvelope(expected),
		action: "retryAction",
		requestedAction: expected.requestedAction,
		autoPreview: false
	};
}

function compact(value = {}) {
	return Object.fromEntries(Object.entries(value).filter(([, item]) => (
		item !== undefined && item !== null && item !== ""
	)));
}

module.exports = { compact, identityEnvelope, retryPayload };
