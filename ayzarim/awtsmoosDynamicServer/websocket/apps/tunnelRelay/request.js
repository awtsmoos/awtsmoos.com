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
 * @file Routes requests through one account plus immutable route reference.
 * @description
 * The Awtsmoos renews route ID, friendly name, request, and answer as one deed.
 * Awtsmoos.com finds the socket by account and tunnel ID, then sends the canonical
 * display name to the agent so stable routing never degrades response readability.
 */
function sendTunnelRequest(context, accountId, routeReference, payload = {}, timeoutMs) {
	State.ensureStores(context);
	State.cleanup(context);
	const registrationKey = Id.registryKey(accountId, routeReference);
	if (!registrationKey) return invalidIdentity();
	const cleaned = cleanRelayPayload(payload);
	const waitMs = safeRelayWaitMs(cleaned.relayWaitMs || cleaned.httpSafeWaitMs);
	const retry = RetryRequest.describe(cleaned);
	const localRetry = RetryRequest.resolveLocal(context, retry, waitMs);
	if (localRetry?.handled) return localRetry.result;
	const totalTimeoutMs = boundedTimeout(timeoutMs || cleaned.timeoutMs);
	const plan = retry
		? RetryRequest.forwardPlan(cleaned, retry)
		: RequestPlan.ordinary(cleaned);
	const tunnel = context.tunnels.get(registrationKey);
	const canonicalName = tunnel?.tunnelName || routeReference;
	const expected = RequestReuse.createExpectation(
		plan,
		registrationKey,
		canonicalName,
		totalTimeoutMs
	);
	const prior = RequestReuse.priorResult(
		context,
		retry,
		plan,
		expected,
		waitMs
	);
	if (prior) return prior;
	if (!tunnel) {
		return RequestDispatch.missing(
			context,
			accountId,
			routeReference,
			cleaned,
			plan,
			expected
		);
	}
	return RequestDispatch.dispatch({
		context,
		accountId,
		tunnelName: canonicalName,
		routeReference,
		tunnel,
		payload: cleaned,
		plan,
		expected,
		totalTimeoutMs,
		waitMs,
		retry
	});
}

function invalidIdentity() {
	return Promise.resolve({
		ok: false,
		error: "invalid_tunnel_identity"
	});
}

module.exports = {
	handleTunnelProgress: ProgressHandler.handleTunnelProgress,
	handleTunnelResponse: ResponseHandler.handleTunnelResponse,
	sendTunnelRequest
};
