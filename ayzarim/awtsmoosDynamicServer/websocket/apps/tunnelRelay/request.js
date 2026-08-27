// B"H
// Boruch Hashem
// Blessed is He

const Id = require(
	"../../../../../geelooy/api/tunnel/control/core/tunnelSecurity/identifiers.js"
);
const Canonical = require("./canonicalRequest.js");
const Normalizers = require("./normalizers.js");
const ProgressHandler = require("./progressHandler.js");
const RequestAckHandler = require("./requestAckHandler.js");
const RequestDispatch = require("./requestDispatch.js");
const RequestPlan = require("./requestPlan.js");
const RequestReuse = require("./requestReuse.js");
const ResponseHandler = require("./responseHandler.js");
const RetryRequest = require("./retryRequest.js");
const State = require("./state.js");

/**
 * @file Routes one account-scoped canonical operation through the relay.
 * @description
 * The Awtsmoos renews route, request, waiters, and response as one deed.
 * Awtsmoos.com claims durable identity before dispatch and treats every retry as
 * observation of that deed rather than permission to create a new socket request.
 */
async function sendTunnelRequest(
	context,
	accountId,
	routeReference,
	payload = {},
	timeoutMs
) {
	State.ensureStores(context);
	State.cleanup(context);
	const registrationKey = Id.registryKey(accountId, routeReference);
	if (!registrationKey) return invalidIdentity();
	const cleaned = Normalizers.cleanRelayPayload(payload);
	const waitMs = Normalizers.safeRelayWaitMs(
		cleaned.relayWaitMs || cleaned.httpSafeWaitMs
	);
	const totalTimeoutMs = Normalizers.boundedTimeout(
		timeoutMs || cleaned.timeoutMs
	);
	const retry = RetryRequest.describe(cleaned);
	if (retry && !retry.controlRequestId) return RetryRequest.invalid(retry);
	const plan = retry
		? observationPlan(cleaned, retry)
		: RequestPlan.ordinary(cleaned);
	const tunnel = context.tunnels.get(registrationKey);
	const canonicalName = tunnel?.tunnelName || routeReference;
	const expected = RequestReuse.createExpectation(
		plan,
		registrationKey,
		canonicalName,
		totalTimeoutMs,
		routeReference
	);
	return await Canonical.run({
		context,
		id: plan.transportId,
		expected,
		retry,
		waitMs,
		recoverableOriginal: plan.recoverableOriginal === true,
		producer: () => tunnel
			? RequestDispatch.dispatch({
				context,
				accountId,
				tunnelName: canonicalName,
				tunnel,
				payload: cleaned,
				plan,
				expected,
				totalTimeoutMs,
				waitMs
			})
			: RequestDispatch.missing(
				context,
				accountId,
				routeReference,
				cleaned,
				plan,
				expected
			)
	});
}

function observationPlan(payload, retry) {
	const original = RetryRequest.originalPayload(payload, retry);
	return {
		transportId: retry.controlRequestId,
		expectationId: retry.controlRequestId,
		expectationPayload: {
			...payload,
			action: retry.requestedAction,
			controlRequestId: retry.controlRequestId
		},
		tunnelPayload: original || payload,
		recoverableOriginal: Boolean(original)
	};
}

function invalidIdentity() {
	return {
		ok: false,
		error: "invalid_tunnel_identity"
	};
}

module.exports = {
	handleTunnelProgress: ProgressHandler.handleTunnelProgress,
	handleTunnelRequestAck: RequestAckHandler.handleTunnelRequestAck,
	handleTunnelResponse: ResponseHandler.handleTunnelResponse,
	observationPlan,
	sendTunnelRequest
};
