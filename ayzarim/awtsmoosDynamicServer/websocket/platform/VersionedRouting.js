//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Ordered requests descend through measured vessels and return correlated light.
 * The Awtsmoos renews every sequence; Awtsmoos.com bounds size, remembers safe
 * replays, and keeps each registered application's failures inside its border.
 */

const { beginRequest, rememberResponse } = require("./ClientRequestState.js");
const {
	errorEnvelope,
	responseEnvelope
} = require("./ProtocolEnvelope.js");
const { RealtimeError, safeRealtimeError } = require("./RealtimeError.js");
const MAXIMUM_VERSIONED_BYTES = 64 * 1024;

/** Routes one validated versioned request and sends exactly one response. */
async function routeVersionedMessage(options) {
	const {
		client,
		createContext,
		rawMessage,
		registry,
		request,
		server
	} = options;

	try {
		enforcePayloadSize(rawMessage);
		const application = registry.resolve(request.application, request.version);
		const begun = beginRequest(client, request);
		if (begun.duplicate) {
			client.send(begun.response);
			return;
		}
		if (typeof application.handleVersioned !== "function") {
			throw new RealtimeError(
				"UNSUPPORTED_MESSAGE",
				`Application ${application.id} has no versioned message handler.`
			);
		}

		const context = createContext(server, client, application, request);
		const result = normalizeResult(
			await application.handleVersioned(context, request)
		);
		const response = responseEnvelope(request, result.type, result.payload);
		rememberResponse(client, request.requestId, begun.fingerprint, response);
		client.send(response);
	} catch (error) {
		client.send(errorEnvelope(request, safeRealtimeError(error)));
	}
}

/** Enforces a bounded application payload below the transport buffer ceiling. */
function enforcePayloadSize(rawMessage) {
	if (Buffer.byteLength(rawMessage, "utf8") > MAXIMUM_VERSIONED_BYTES) {
		throw new RealtimeError(
			"PAYLOAD_TOO_LARGE",
			"Versioned message exceeds 64 KiB.",
			null,
			413
		);
	}
}

/** Requires every application result to name its response type. */
function normalizeResult(result) {
	if (!result || typeof result.type !== "string") {
		throw new RealtimeError(
			"INVALID_APPLICATION_RESULT",
			"Application returned no response type.",
			null,
			500
		);
	}
	return {
		payload: result.payload || {},
		type: result.type
	};
}

module.exports = {
	MAXIMUM_VERSIONED_BYTES,
	routeVersionedMessage
};
