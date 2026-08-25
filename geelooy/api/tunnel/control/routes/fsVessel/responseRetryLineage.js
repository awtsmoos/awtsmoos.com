// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reconstructs original durable identity without confusing control and client witnesses.
 * @description
 * The Awtsmoos keeps one deed one deed even when transport wraps it again; Awtsmoos.com
 * remembers the retry garment for audit, restores only identity that the original request
 * actually declared, and never turns a control witness into a client witness by disguise.
 *
 * Control identity is Netzach: the durable deed persists through another request envelope.
 * Client identity is Hod: independent testimony is required only when it truly crossed the
 * boundary. Their unity is useful precisely because their distinctions remain real and clear.
 */
function correlationPayload(payload = {}) {
	if (payload.action !== "retryAction") {
		return payload;
	}
	const source = retrySource(payload);
	return {
		...payload,
		retryWrapperControlRequestId: payload.controlRequestId,
		retryWrapperClientRequestId: payload.clientRequestId,
		controlRequestId: originalControlRequestId(payload, source),
		clientRequestId: originalClientRequestId(payload, source),
		nonce: first(source.nonce, payload.nonce),
		jobId: first(source.jobId, payload.jobId),
		stream: first(source.stream, payload.stream)
	};
}

/**
 * Resolves the durable control identity underneath a retry wrapper.
 *
 * @param {object} payload Retry wrapper payload.
 * @param {object} source Parsed inner retry source.
 * @returns {*} First declared original control witness.
 */
function originalControlRequestId(payload = {}, source = {}) {
	return first(
		payload.originalControlRequestId,
		source.originalControlRequestId,
		source.controlRequestId,
		payload.controlRequestId
	);
}

/**
 * Resolves only explicit original client testimony.
 *
 * @param {object} payload Retry wrapper payload.
 * @param {object} source Parsed inner retry source.
 * @returns {*} Explicit original client witness, or undefined when none existed.
 */
function originalClientRequestId(payload = {}, source = {}) {
	return first(
		payload.originalClientRequestId,
		source.originalClientRequestId,
		source.clientRequestId
	);
}

function expectedResponseAction(payload = {}) {
	if (payload.action !== "retryAction") {
		return String(payload.action || "");
	}
	const source = retrySource(payload);
	return text(
		payload.requestedAction ||
		payload.originalRequestedAction ||
		source.requestedAction ||
		source.originalRequestedAction
	);
}

function retrySource(payload = {}) {
	return asObject(payload.params) || asObject(payload.retryPayload) || {};
}

function asObject(value) {
	if (value && typeof value === "object" && !Array.isArray(value)) {
		return value;
	}
	if (typeof value !== "string" || !value.trim().startsWith("{")) {
		return null;
	}
	try {
		return JSON.parse(value);
	} catch (_error) {
		return null;
	}
}

function first(...values) {
	return values.find((value) => {
		return value !== undefined && value !== null && value !== "";
	});
}

function text(value) {
	return String(value || "");
}

module.exports = {
	correlationPayload,
	expectedResponseAction,
	originalClientRequestId,
	originalControlRequestId,
	retrySource
};
