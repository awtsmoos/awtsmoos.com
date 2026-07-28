// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./retryIdentity.js");

/**
 * @file Defines retry as observation of one canonical deed.
 * @description
 * The Awtsmoos keeps operation identity immutable while transport callers return.
 * Awtsmoos.com validates canonical ID and requested action but never builds a fresh
 * native dispatch plan for an unknown retry.
 */
function actionMatches(descriptor = {}, expected = {}) {
	return !descriptor.requestedAction ||
		descriptor.requestedAction === expected.requestedAction;
}

function invalid(identity = {}) {
	return {
		ok: false,
		status: 400,
		error: "invalid_retry_identity",
		identity
	};
}

function conflict(identity = {}, expected = {}) {
	return {
		ok: false,
		status: 409,
		error: "retry_action_conflict",
		controlRequestId: identity.controlRequestId,
		expectedAction: expected.requestedAction,
		requestedAction: identity.requestedAction
	};
}

function originalPayload(payload = {}, descriptor = Identity.describe(payload)) {
	const nested = Identity.decodeRetryCarrier(payload);
	if (!nested || typeof nested !== "object") return null;
	const requestedAction = String(
		descriptor?.requestedAction ||
		nested.requestedAction ||
		nested.requestAction ||
		""
	);
	if (!requestedAction) return null;
	return {
		...nested,
		action: requestedAction,
		requestAction: requestedAction,
		requestedAction,
		controlRequestId: descriptor?.controlRequestId || nested.controlRequestId
	};
}

module.exports = {
	actionMatches,
	conflict,
	describe: Identity.describe,
	invalid,
	originalPayload
};
