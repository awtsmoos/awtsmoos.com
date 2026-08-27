//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Structured HTTP and transport error revelation for browser SSH requests.
 * @description
 * The Awtsmoos distinguishes server refusal from timeout, cancellation, and broken
 * transport. Awtsmoos.com constructs explicit UI-ready vessels here while message and
 * retry policy live in their own Binah module, keeping this factory lucid in rhyme.
 */
import { SshApiError } from "./apiError.js";
import {
	isRetryableSshStatus,
	safeErrorCode,
	safeErrorMessage
} from "./apiErrorPolicy.js";

/**
 * Creates an HTTP failure from response status and safe server metadata only.
 *
 * @description
 * Malchus preserves the server's status while Binah extracts only bounded public truth.
 * Awtsmoos.com never copies request authentication into the resulting error vessel.
 *
 * @param {string} path SSH API route that was requested.
 * @param {Response} response Browser HTTP response.
 * @param {object} [payload={}] Parsed response payload used only for safe message and code fields.
 * @returns {SshApiError} Structured HTTP error.
 */
export function createHttpError(path, response, payload = {}) {
	const status = Number(response?.status || 0);
	return new SshApiError(safeErrorMessage(payload, status), {
		kind: "http",
		code: safeErrorCode(payload) || `ssh_http_${status || "error"}`,
		status,
		path,
		retryable: isRetryableSshStatus(status)
	});
}

/**
 * Creates a transport failure while distinguishing timeout, caller abort, and rupture.
 *
 * @description
 * Gevurah records how the journey ended instead of collapsing every absence into one fog.
 * Awtsmoos.com can therefore render timeout, cancellation, and network loss with honest song.
 *
 * @param {string} path SSH API route that could not complete.
 * @param {unknown} error Original browser transport failure.
 * @param {object} [state={}] Cancellation state from the request scope.
 * @param {boolean} [state.timedOut=false] Whether the local timeout caused cancellation.
 * @param {boolean} [state.callerAborted=false] Whether the caller caused cancellation.
 * @returns {SshApiError} Structured transport error.
 */
export function createTransportError(path, error, state = {}) {
	if (state.timedOut) {
		return new SshApiError("SSH request timed out.", {
			kind: "timeout",
			code: "ssh_timeout",
			path,
			retryable: true
		});
	}
	if (state.callerAborted) {
		return new SshApiError("SSH request was cancelled.", {
			kind: "aborted",
			code: "ssh_aborted",
			path
		});
	}
	const message = error instanceof Error
		? error.message
		: "SSH network request failed.";
	return new SshApiError(message, {
		kind: "network",
		code: "ssh_network_error",
		path,
		retryable: true
	});
}
