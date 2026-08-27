// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines hard lifetime, count, and byte limits for detached sessions.
 * @description
 * The Awtsmoos grants continuation through measured vessels. Awtsmoos.com refuses
 * oversized or excessive encrypted sessions before browser closure, using durable
 * backpressure instead of silently dropping accepted agent work after its Send.
 */
export function detachedSessionConfiguration(options = {}) {
	return {
		ttlMs: bounded(options.ttlMs, 600000, 60000, 86400000),
		maxEntries: bounded(options.maxEntries, 10000, 1, 10000),
		maxSessionBytes: bounded(options.maxSessionBytes, 131072, 4096, 1048576)
	};
}

export function validateDetachedSession(conversationId, session, configuration) {
	if (typeof conversationId !== "string" || conversationId.trim() === "") {
		throw codedError("detached_session_conversation_id_required");
	}
	if (!session || typeof session !== "object" || Array.isArray(session)) {
		throw codedError("detached_session_payload_required");
	}
	const bytes = Buffer.byteLength(JSON.stringify(session), "utf8");
	if (bytes > configuration.maxSessionBytes) {
		throw codedError("detached_session_payload_too_large", {
			bytes,
			maxSessionBytes: configuration.maxSessionBytes
		});
	}
	return bytes;
}

export function codedError(code, details = {}) {
	const error = new Error(code);
	error.code = code;
	Object.assign(error, details);
	return error;
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value);
	const selected = Number.isFinite(number) ? number : fallback;
	return Math.min(maximum, Math.max(minimum, selected));
}
