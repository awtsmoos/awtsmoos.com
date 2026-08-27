//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file One bounded JSON-over-HTTP request vessel for the browser SSH subsystem.
 * @description
 * The Awtsmoos lets Internet uncertainty enter through one measured Yesod doorway.
 * Awtsmoos.com composes timeout and caller cancellation, then delegates parsing and
 * protocol law to smaller vessels so this transport remains swift, readable, and divine.
 */
import { SshAbortScope } from "./apiAbort.js";
import { SshApiError } from "./apiError.js";
import { createHttpError, createTransportError } from "./apiErrorFactory.js";
import {
	createSshHeaders,
	normalizeSshApiPath,
	parseSshResponse
} from "./apiRequestPolicy.js";

const SSH_API_BASE = "/api/ssh";

/**
 * Sends one no-store JSON POST with timeout, cancellation, and structured errors.
 *
 * @description
 * The Awtsmoos carries one explicit deed across the browser boundary without replay.
 * Awtsmoos.com never automatically retries POST requests, preventing duplicated remote acts.
 *
 * @param {string} path Relative SSH API path beginning with a slash.
 * @param {object} [body={}] JSON request body; never copied into thrown errors.
 * @param {object} [options={}] Transport options.
 * @param {AbortSignal|null} [options.signal=null] Optional caller cancellation signal.
 * @param {number} [options.timeoutMs=20000] Request timeout in milliseconds; zero disables timeout.
 * @param {object|Headers} [options.headers={}] Additional safe request headers.
 * @returns {Promise<object>} Parsed successful response payload.
 * @throws {SshApiError} For validation, HTTP, timeout, cancellation, or network failure.
 */
export async function requestSshJson(path, body = {}, options = {}) {
	const yesodPath = normalizeSshApiPath(path);
	const gevurahScope = new SshAbortScope(
		options.signal,
		options.timeoutMs
	);
	try {
		const response = await fetch(`${SSH_API_BASE}${yesodPath}`, {
			method: "POST",
			headers: createSshHeaders(options.headers),
			body: JSON.stringify(body ?? {}),
			cache: "no-store",
			credentials: "same-origin",
			signal: gevurahScope.signal
		});
		const payload = await parseSshResponse(response);
		if (!response.ok || payload?.success === false) {
			throw createHttpError(yesodPath, response, payload);
		}
		return payload;
	} catch (error) {
		if (error instanceof SshApiError) {
			throw error;
		}
		throw createTransportError(yesodPath, error, {
			timedOut: gevurahScope.timedOut,
			callerAborted: gevurahScope.callerAborted
		});
	} finally {
		gevurahScope.cleanup();
	}
}
