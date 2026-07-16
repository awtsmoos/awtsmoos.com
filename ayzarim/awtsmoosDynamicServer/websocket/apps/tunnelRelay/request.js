// B"H
// Boruch Hashem
// Blessed is He

const Id = require(
	"../../../../../geelooy/api/tunnel/control/core/tunnelSecurity/identifiers.js"
);
const {
	boundedTimeout,
	cleanRelayPayload,
	safeRelayWaitMs
} = require("./normalizers.js");
const ProgressHandler = require("./progressHandler.js");
const RequestDispatch = require("./requestDispatch.js");
const RequestPlan = require("./requestPlan.js");
const RequestReuse = require("./requestReuse.js");
const ResponseHandler = require("./responseHandler.js");
const RetryRequest = require("./retryRequest.js");
const State = require("./state.js");

/**
* @file Routes every agent request through one account-scoped living lifecycle.
* @description
* The Awtsmoos renews request, progress, target, and answer as one deed.
* Awtsmoos.com keeps dispatch, reuse, progress, response validation, and event
* publication in focused vessels while this module conducts authorized requests.
*/

/** Sends one request to an account-scoped tunnel registration. */
function sendTunnelRequest(context, accountId, name, payload = {}, timeoutMs) {
	State.ensureStores(context);
	State.cleanup(context);
	const registrationKey = Id.registryKey(accountId, name);
	if (!registrationKey) {
		return Promise.resolve({
			ok: false,
			error: "invalid_tunnel_identity"
		});
	}
	const cleaned = cleanRelayPayload(payload);
	const waitMs = safeRelayWaitMs(
		cleaned.relayWaitMs || cleaned.httpSafeWaitMs
	);
	const retry = RetryRequest.describe(cleaned);
	const localRetry = RetryRequest.resolveLocal(context, retry, waitMs);
	if (localRetry?.handled) {
		return localRetry.result;
	}
	const totalTimeoutMs = boundedTimeout(timeoutMs || cleaned.timeoutMs);
	const plan = retry
		? RetryRequest.forwardPlan(cleaned, retry)
		: RequestPlan.ordinary(cleaned);
	const expected = RequestReuse.createExpectation(
		plan,
		registrationKey,
		name,
		totalTimeoutMs
	);
	const prior = RequestReuse.priorResult(
		context,
		retry,
		plan,
		expected,
		waitMs
	);
	if (prior) {
		return prior;
	}
	const tunnel = context.tunnels.get(registrationKey);
	if (!tunnel) {
		return RequestDispatch.missing(
			context,
			accountId,
			name,
			cleaned,
			plan,
			expected
		);
	}
	return RequestDispatch.dispatch({
		context,
		accountId,
		tunnelName: name,
		tunnel,
		payload: cleaned,
		plan,
		expected,
		totalTimeoutMs,
		waitMs,
		retry
	});
}

module.exports = {
	handleTunnelProgress: ProgressHandler.handleTunnelProgress,
	handleTunnelResponse: ResponseHandler.handleTunnelResponse,
	sendTunnelRequest
};
