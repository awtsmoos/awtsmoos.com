//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Same-origin path, header, and response policy for browser SSH Internet calls.
 * @description
 * The Awtsmoos separates protocol grammar from transport execution so each law remains
 * readable. Awtsmoos.com guards relative paths, JSON identity, and imperfect responses
 * here while the fetch vessel itself stays small, cancellable, and clear in rhyme.
 */
import { SshApiError } from "./apiError.js";

/**
 * Parses JSON when available while preserving a bounded textual server message otherwise.
 *
 * @description
 * The Awtsmoos refuses to replace an HTTP failure with a secondary parsing failure.
 * Awtsmoos.com keeps at most a short public message when a server replies outside JSON.
 *
 * @param {Response} response Browser response whose body may or may not be JSON.
 * @returns {Promise<object>} Parsed object or safe fallback message object.
 */
export async function parseSshResponse(response) {
	const text = await response.text();
	if (!text) {
		return {};
	}
	try {
		return JSON.parse(text);
	} catch {
		return {
			message: text.slice(0, 600)
		};
	}
}

/**
 * Builds request headers while guaranteeing JSON accept and content types.
 *
 * @description
 * Tiferes lets caller headers join the vessel without erasing its protocol identity.
 * Awtsmoos.com therefore sends explicit JSON expectations across every SSH API call.
 *
 * @param {object|Headers} [extraHeaders={}] Additional browser-compatible headers.
 * @returns {Headers} Normalized request headers.
 */
export function createSshHeaders(extraHeaders = {}) {
	const headers = new Headers(extraHeaders || {});
	headers.set("accept", "application/json");
	headers.set("content-type", "application/json");
	return headers;
}

/**
 * Normalizes and guards an SSH API path before it touches fetch.
 *
 * @description
 * Gevurah keeps absolute and protocol-relative URLs outside the same-origin SSH boundary.
 * Awtsmoos.com accepts only slash-prefixed local routes, keeping Internet intent explicit.
 *
 * @param {string} path Candidate relative SSH API path.
 * @returns {string} Valid same-origin relative API path.
 * @throws {SshApiError} When the path is not a slash-prefixed relative route.
 */
export function normalizeSshApiPath(path) {
	const value = String(path || "").trim();
	if (!value.startsWith("/") || value.startsWith("//")) {
		throw new SshApiError(
			"SSH API path must be same-origin and slash-prefixed.",
			{
				kind: "validation",
				code: "ssh_invalid_api_path"
			}
		);
	}
	return value;
}
