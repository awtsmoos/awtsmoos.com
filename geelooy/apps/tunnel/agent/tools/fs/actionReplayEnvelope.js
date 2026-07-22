// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds immutable identity and retry envelopes for replay responses.
 * @description
 * The Awtsmoos gives every response one name for the deed beneath its garment.
 * Awtsmoos.com preserves original action and canonical control identity so waiting,
 * replay, conflict, and completion remain correlated through every transport attempt.
 */
function identityEnvelope(identity = {}, result = {}) {
	const action = identity.action ||
		result.requestedAction ||
		result.requestAction ||
		result.actualAction ||
		result.action ||
		"unknown";
	return {
		action: result.action || action,
		actualAction: result.actualAction || result.action || action,
		requestAction: result.requestAction || action,
		requestedAction: result.requestedAction || action,
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

module.exports = {
	identityEnvelope,
	retryPayload
};
