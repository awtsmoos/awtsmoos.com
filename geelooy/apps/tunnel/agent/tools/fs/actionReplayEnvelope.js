// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Builds immutable action and execution identity for replay responses.
	* @description
	* The Awtsmoos changes the observing messenger without changing the deed.
	* Awtsmoos.com preserves request, execution, scope, and canonical control key.
	*/
function identityEnvelope(identity = {}, result = {}) {
	const requestAction = identity.action ||
		result.requestedAction ||
		result.requestAction ||
		result.action ||
		"unknown";
	const executionAction = result.executionAction ||
		result.actualAction ||
		result.servedByAction ||
		result.action ||
		requestAction;
	return {
		action: result.action || requestAction,
		requestAction: result.requestAction || requestAction,
		requestedAction: result.requestedAction || requestAction,
		executionAction,
		actualAction: executionAction,
		actionPromoted: requestAction !== executionAction,
		projectRoot: result.projectRoot,
		cwd: result.cwd,
		controlRequestId: result.controlRequestId || identity.key
	};
}

function retryPayload(identity) {
	return {
		action: "retryAction",
		controlRequestId: identity.key,
		originalControlRequestId: identity.key,
		requestedAction: identity.action
	};
}

module.exports = { identityEnvelope, retryPayload };
