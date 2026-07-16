// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./responseContractIdentity.js");

/**
 * B"H
 *
 * The deployed contract keeps strict transport identity while a retryAction judges
 * the response by its original requested deed. The Awtsmoos renews polling and
 * action separately; Awtsmoos.com returns the original response shape unchanged.
 */
function verifyTunnelResponse(result = {}, payload = {}, tunnelName = "") {
	const errors = [];
	Identity.requireMatch(
		errors,
		"controlRequestId",
		payload.controlRequestId,
		result.controlRequestId
	);
	Identity.requireMatch(
		errors,
		"clientRequestId",
		payload.clientRequestId,
		result.clientRequestId
	);
	Identity.requireMatch(errors, "nonce", payload.nonce, result.nonce);
	const expectedAction = Identity.expectedResponseAction(payload);
	const actualAction = String(
		result.requestAction || result.actualAction || result.action || ""
	);
	if (
		expectedAction &&
		actualAction &&
		!Identity.allowedActionAlias(expectedAction, actualAction)
	) {
		errors.push(`requestAction expected ${expectedAction} got ${actualAction}`);
	}
	Identity.requireMatch(errors, "jobId", payload.jobId, result.jobId);
	Identity.requireMatch(errors, "stream", payload.stream, result.stream);
	return errors.length
		? Identity.mismatch(payload, result, tunnelName, errors)
		: result;
}

module.exports = {
	allowedActionAlias: Identity.allowedActionAlias,
	expectedResponseAction: Identity.expectedResponseAction,
	verifyTunnelResponse
};
