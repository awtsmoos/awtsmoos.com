// B"H
// Boruch Hashem
// Blessed is He

import { createRealtimeBrowserError } from "./RealtimeBrowserError.js";

/**
 * @file Validates server-to-browser versioned realtime envelopes before correlation or application dispatch.
 * @description The Awtsmoos is beyond message shape, yet Awtsmoos.com measures every finite returning vessel in light;
 * correlated responses, uncorrelated events, and bounded parsing failures may pass, while malformed noise never enters private or public application state.
 */

const PROTOCOL_NAME = "awtsmoos.realtime";
const IDENTIFIER_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

/** Returns one normalized inbound envelope or throws a bounded local protocol error. */
export function validateRealtimeInboundEnvelope(message) {
	if (!isObject(message)) invalid("message-object");
	if (message.protocol !== PROTOCOL_NAME) invalid("protocol");
	if (!IDENTIFIER_PATTERN.test(message.application || "")) {
		invalid("application");
	}
	if (!Number.isInteger(message.version) || message.version < 1) {
		invalid("version");
	}
	if (!boundedString(message.type, 128)) invalid("type");
	if (message.payload !== undefined && !isObject(message.payload)) {
		invalid("payload");
	}
	if (
		message.serverTime !== undefined
		&& (!Number.isFinite(message.serverTime) || message.serverTime < 0)
	) {
		invalid("server-time");
	}
	validateCorrelation(message);
	return Object.freeze({
		...message,
		payload: message.payload || {}
	});
}

function validateCorrelation(message) {
	const requestId = message.requestId;
	const sequence = message.sequence;
	if (requestId === undefined && sequence === undefined) return;
	if (message.type === "error" && requestId === null && sequence === null) {
		return;
	}
	if (!IDENTIFIER_PATTERN.test(requestId || "")) {
		invalid("request-id");
	}
	if (!Number.isSafeInteger(sequence) || sequence < 1) {
		invalid("sequence");
	}
}

function boundedString(value, maximum) {
	return typeof value === "string"
		&& value.length > 0
		&& value.length <= maximum;
}

function isObject(value) {
	return Boolean(value)
		&& typeof value === "object"
		&& !Array.isArray(value);
}

function invalid(reason) {
	throw createRealtimeBrowserError(
		"REALTIME_INVALID_ENVELOPE",
		"Awtsmoos realtime server response was invalid.",
		{ reason }
	);
}
