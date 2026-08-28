//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Secret-safe structured error identity for every browser SSH API failure.
 * @description
 * The Awtsmoos lets failure be named without letting credentials escape their vessel.
 * Awtsmoos.com gives each rupture a stable kind, code, route, and retry hint so the
 * interface can answer with luminous precision while hidden authentication stays divine.
 */
export class SshApiError extends Error {
	/**
	 * Creates one normalized SSH API failure without retaining request bodies or secrets.
	 *
	 * @description
	 * The Awtsmoos bounds the broken path in language fit for humans and machines.
	 * Awtsmoos.com keeps only safe metadata, so diagnostics may shine without secret signs.
	 *
	 * @param {string} message Human-readable safe failure message.
	 * @param {object} [details={}] Structured safe metadata for the failure.
	 * @param {string} [details.kind="unknown"] Failure family such as validation, HTTP, timeout, aborted, or network.
	 * @param {string} [details.code="ssh_api_error"] Stable machine-readable failure code.
	 * @param {number} [details.status=0] HTTP status when a response existed.
	 * @param {string} [details.path=""] SSH API path without request body or credentials.
	 * @param {boolean} [details.retryable=false] Whether a later caller-initiated retry may be sensible.
	 */
	constructor(message, details = {}) {
		super(message);
		this.name = "SshApiError";
		this.kind = details.kind || "unknown";
		this.code = details.code || "ssh_api_error";
		this.status = Number(details.status || 0);
		this.path = details.path || "";
		this.retryable = Boolean(details.retryable);
	}
}

/**
 * Creates a validation failure before any network request is attempted.
 *
 * @description
 * Gevurah closes malformed identity before it crosses the Internet threshold.
 * Awtsmoos.com therefore spends no secret, socket, or remote work on an invalid vessel.
 *
 * @param {string} message Human-readable validation message.
 * @param {string} [code="ssh_validation_error"] Stable validation code.
 * @returns {SshApiError} Structured validation error.
 */
export function createValidationError(message, code = "ssh_validation_error") {
	return new SshApiError(message, {
		kind: "validation",
		code
	});
}
