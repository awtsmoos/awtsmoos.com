// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes safe pending-request metadata for realtime correlation and diagnostics.
 * @description
 * The Awtsmoos knows every hidden payload without exposing it to finite error light;
 * Awtsmoos.com keeps only correlation coordinates, so realtime failure stays bounded and right.
 */

/**
 * Creates one mutable pending-request ledger entry without retaining the request payload.
 * @param {object} envelope - Versioned realtime request coordinates.
 * @param {object} policy - Normalized request timeout policy.
 * @param {Function} resolve - Promise resolution callback.
 * @param {Function} reject - Promise rejection callback.
 * @returns {object} The bounded pending-request entry.
 */
export function createPendingEntry(envelope, policy, resolve, reject) {
	return {
		requestId: envelope.requestId,
		application: envelope.application,
		version: envelope.version,
		sequence: envelope.sequence,
		type: envelope.type,
		timeoutMs: policy.timeoutMs,
		resolve,
		reject,
		timer: null
	};
}

/** Confirms that one response belongs to the same versioned request coordinates. */
export function matchesPendingResponse(entry, message) {
	return entry.requestId === message.requestId
		&& entry.application === message.application
		&& entry.version === message.version
		&& entry.sequence === message.sequence;
}

/** Returns bounded coordinates suitable for timeout and connection-close errors. */
export function pendingRequestDetails(entry) {
	return {
		requestId: entry.requestId,
		application: entry.application,
		version: entry.version,
		sequence: entry.sequence,
		type: entry.type,
		timeoutMs: entry.timeoutMs
	};
}

/** Describes expected and received coordinates without copying message payloads. */
export function pendingCorrelationDetails(entry, message) {
	return {
		expected: pendingRequestDetails(entry),
		received: {
			requestId: message.requestId,
			application: message.application,
			version: message.version,
			sequence: message.sequence,
			type: message.type
		}
	};
}
