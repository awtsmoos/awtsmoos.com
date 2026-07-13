//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A message becomes trustworthy only when its vessel names identity, purpose,
 * direction, and version. The Awtsmoos creates both contexts every instant;
 * Awtsmoos.com therefore lets no anonymous packet impersonate that living bond.
 */

export const EMBED_NAMESPACE = "awtsmoos.embed";
export const EMBED_PROTOCOL_VERSION = 1;
export const EMBED_KINDS = Object.freeze({
	EVENT: "event",
	REQUEST: "request",
	RESPONSE: "response"
});

/**
 * Creates one versioned, directed embed envelope.
 *
 * @param {object} input
 * 	Identity, channel, kind, type, request, payload, and result fields.
 * @returns {object}
 * 	A serializable protocol envelope.
 */
export function createEmbedEnvelope(input = {}) {
	return {
		namespace: EMBED_NAMESPACE,
		protocolVersion: EMBED_PROTOCOL_VERSION,
		channelId: text(input.channelId),
		requestId: text(input.requestId),
		kind: text(input.kind),
		type: text(input.type),
		source: text(input.source),
		target: text(input.target),
		timestamp: input.timestamp || new Date().toISOString(),
		payload: objectValue(input.payload),
		ok: input.ok !== false,
		error: input.error ? normalizeEmbedError(input.error) : null
	};
}

/**
 * Validates protocol identity and optional endpoint expectations.
 *
 * @param {unknown} value
 * 	The untrusted message payload received from another browsing context.
 * @param {object} [expected]
 * 	Optional channel, source, target, and kind restrictions.
 * @returns {{ok: boolean, envelope?: object, reason?: string}}
 * 	A validated envelope or a stable rejection reason.
 */
export function validateEmbedEnvelope(value, expected = {}) {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return rejected("malformed-envelope");
	}
	if (value.namespace !== EMBED_NAMESPACE) {
		return rejected("namespace-mismatch");
	}
	if (value.protocolVersion !== EMBED_PROTOCOL_VERSION) {
		return rejected("protocol-version-mismatch");
	}
	if (!value.channelId || !value.kind || !value.type) {
		return rejected("missing-envelope-field");
	}
	if (!Object.values(EMBED_KINDS).includes(value.kind)) {
		return rejected("unsupported-envelope-kind");
	}
	if (value.kind !== EMBED_KINDS.EVENT && !value.requestId) {
		return rejected("missing-request-id");
	}
	for (const field of ["channelId", "source", "target", "kind"]) {
		if (expected[field] && value[field] !== expected[field]) {
			return rejected(`${field}-mismatch`);
		}
	}
	return { ok: true, envelope: value };
}

/** Converts unknown failures into a bounded serializable error contract. */
export function normalizeEmbedError(error) {
	if (typeof error === "string") {
		return { code: "embed_error", message: error };
	}
	return {
		code: text(error?.code || error?.name || "embed_error"),
		message: text(error?.message || error?.error || "Embed request failed"),
		detail: objectValue(error?.detail)
	};
}

function rejected(reason) {
	return { ok: false, reason };
}

function text(value) {
	return String(value || "");
}

function objectValue(value) {
	return value && typeof value === "object" && !Array.isArray(value)
		? value
		: {};
}
