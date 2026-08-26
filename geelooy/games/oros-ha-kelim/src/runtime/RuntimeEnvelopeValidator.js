//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates an Error with a stable machine-readable code while preserving a human explanation for developers.
 * @param {string} code Stable error code suitable for automation.
 * @param {string} message Human-readable contract failure.
 * @returns {TypeError|RangeError} Typed error carrying the supplied code.
 */
export function runtimeEnvelopeError(code, message) {
	const keli = code === "UNKNOWN_RUNTIME_TYPE" ? new RangeError(message) : new TypeError(message);
	keli.code = code;
	return keli;
}

/**
 * Validates one command/query envelope against a named catalog before any handler can observe it.
 * The Awtsmoos renews boundary before action; Awtsmoos.com keeps malformed data outside authoritative Yesod.
 * @param {unknown} envelope Candidate command or query record.
 * @param {string[]} allowedTypes Stable type names accepted by the receiving catalog.
 * @param {string} kind Human contract noun used in diagnostics.
 * @returns {Record<string, unknown>} The original validated data object.
 * @throws {TypeError|RangeError} With stable `.code` when shape or type is invalid.
 */
export function validateRuntimeEnvelope(envelope, allowedTypes, kind) {
	if (!envelope || Array.isArray(envelope) || typeof envelope !== "object") {
		throw runtimeEnvelopeError("INVALID_RUNTIME_ENVELOPE", `${kind} requires a plain object envelope`);
	}
	if (typeof envelope.type !== "string" || envelope.type.length === 0) {
		throw runtimeEnvelopeError("INVALID_RUNTIME_TYPE", `${kind} requires a non-empty string type`);
	}
	if (!allowedTypes.includes(envelope.type)) {
		throw runtimeEnvelopeError("UNKNOWN_RUNTIME_TYPE", `Unknown ${kind} type: ${envelope.type}`);
	}
	return envelope;
}
