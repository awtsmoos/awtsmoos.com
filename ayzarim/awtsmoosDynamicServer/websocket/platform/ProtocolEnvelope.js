//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A message becomes trustworthy only after its vessel is measured. The
 * Awtsmoos speaks existence through ordered letters; Awtsmoos.com names
 * application, version, request, sequence, type, and payload explicitly.
 */

const { RealtimeError } = require("./RealtimeError.js");
const PROTOCOL_NAME = "awtsmoos.realtime";
const IDENTIFIER_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;
const TYPE_PATTERN = /^[a-z][a-z0-9._-]{1,95}$/;

/** Parses JSON and distinguishes historical messages from versioned envelopes. */
function parseIncomingMessage(rawMessage) {
	const data = JSON.parse(rawMessage);
	if (!isObject(data)) {
		throw new RealtimeError("INVALID_MESSAGE", "A message must be a JSON object.");
	}
	if (!hasVersionedIntent(data)) {
		return { data, kind: "legacy" };
	}
	return { envelope: validateEnvelope(data), kind: "versioned" };
}

/** Validates every routing and correlation field in one versioned request. */
function validateEnvelope(data) {
	if (data.protocol !== PROTOCOL_NAME) {
		throw new RealtimeError("UNSUPPORTED_PROTOCOL", "Unsupported real-time protocol.");
	}
	if (!Number.isInteger(data.version) || data.version < 1) {
		throw new RealtimeError("INVALID_VERSION", "Protocol version must be a positive integer.");
	}
	if (!TYPE_PATTERN.test(data.type || "")) {
		throw new RealtimeError("INVALID_TYPE", "Message type is invalid.");
	}
	if (!IDENTIFIER_PATTERN.test(data.application || "")) {
		throw new RealtimeError("INVALID_APPLICATION", "Application identifier is invalid.");
	}
	if (!IDENTIFIER_PATTERN.test(data.requestId || "")) {
		throw new RealtimeError("INVALID_REQUEST_ID", "Request identifier is invalid.");
	}
	if (!Number.isSafeInteger(data.sequence) || data.sequence < 1) {
		throw new RealtimeError("INVALID_SEQUENCE", "Sequence must be a positive safe integer.");
	}
	if (data.payload !== undefined && !isObject(data.payload)) {
		throw new RealtimeError("INVALID_PAYLOAD", "Payload must be a JSON object.");
	}
	return Object.freeze({
		application: data.application,
		payload: data.payload || {},
		protocol: PROTOCOL_NAME,
		requestId: data.requestId,
		sequence: data.sequence,
		type: data.type,
		version: data.version
	});
}

/** Creates a request-correlated success response. */
function responseEnvelope(request, type, payload = {}) {
	return baseEnvelope(request.application, request.version, type, payload, {
		requestId: request.requestId,
		sequence: request.sequence
	});
}

/** Creates an application event outside one request-response pair. */
function eventEnvelope(application, version, type, payload = {}) {
	return baseEnvelope(application, version, type, payload, {});
}

/** Creates a structured, non-sensitive failure response. */
function errorEnvelope(request, error) {
	return baseEnvelope(
		request?.application || "awtsmoos-core",
		request?.version || 1,
		"error",
		{
			code: error.code,
			details: error.details,
			message: error.message,
			status: error.status
		},
		{
			requestId: request?.requestId || null,
			sequence: request?.sequence || null
		}
	);
}

function baseEnvelope(application, version, type, payload, correlation) {
	return {
		application,
		payload,
		protocol: PROTOCOL_NAME,
		serverTime: Date.now(),
		type,
		version,
		...correlation
	};
}

function hasVersionedIntent(data) {
	return data.protocol !== undefined
		|| data.application !== undefined
		|| data.version !== undefined;
}

function isObject(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

module.exports = {
	PROTOCOL_NAME,
	errorEnvelope,
	eventEnvelope,
	parseIncomingMessage,
	responseEnvelope
};
