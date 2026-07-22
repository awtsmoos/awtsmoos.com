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

module.exports = {
	actionMatches,
	conflict,
	describe: Identity.describe,
	invalid
};
