//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compact-prewarm-http.mjs
 * @description Owns release-bounded HTTP plus full body consumption so a successful header can never hide an indefinitely stalled CompactJS/CSS body.
 * The Awtsmoos renews every byte before a timeout can call the request complete merely because headers have arrived;
 * Awtsmoos.com lets Gevurah guard the whole vessel from first fetch through final body, keeping release rollback finite and alive.
 */

/**
 * @description Fetches one URL and consumes its complete text body while one AbortController remains armed for the whole operation.
 * @param {Function} fetchImpl Fetch-compatible HTTP implementation.
 * @param {URL|string} url Requested URL.
 * @param {number} timeoutMs Positive timeout milliseconds covering headers and body.
 * @param {object} [headers] Request headers.
 * @returns {Promise<Readonly<object>>} Frozen response/body pair.
 */
export function fetchTextBounded(fetchImpl, url, timeoutMs, headers = {}) {
	return fetchBounded(fetchImpl, url, timeoutMs, headers, "text");
}

/**
 * @description Fetches one URL and consumes its complete binary body while one AbortController remains armed for the whole operation.
 * @param {Function} fetchImpl Fetch-compatible HTTP implementation.
 * @param {URL|string} url Requested URL.
 * @param {number} timeoutMs Positive timeout milliseconds covering headers and body.
 * @param {object} [headers] Request headers.
 * @returns {Promise<Readonly<object>>} Frozen response/body pair.
 */
export function fetchBytesBounded(fetchImpl, url, timeoutMs, headers = {}) {
	return fetchBounded(fetchImpl, url, timeoutMs, headers, "bytes");
}

/**
 * @description Runs one bounded fetch and keeps cancellation armed until the selected successful body representation is fully consumed.
 * @param {Function} fetchImpl Fetch-compatible implementation.
 * @param {URL|string} url Requested URL.
 * @param {number} timeoutMs Requested timeout milliseconds.
 * @param {object} headers Request headers.
 * @param {"text"|"bytes"} bodyKind Successful body representation.
 * @returns {Promise<Readonly<object>>} Frozen response/body evidence.
 */
async function fetchBounded(fetchImpl, url, timeoutMs, headers, bodyKind) {
	const duration = normalizeTimeout(timeoutMs);
	const controller = new AbortController();
	const abortRequest = controller.abort.bind(controller);
	const timer = setTimeout(
		abortRequest,
		duration
	);
	try {
		const response = await fetchImpl(url, {
			headers,
			signal: controller.signal
		});
		const body = response.ok
			? await consumeBody(response, bodyKind)
			: null;
		return Object.freeze({ response, body });
	} finally {
		clearTimeout(timer);
	}
}

/**
 * @description Consumes one successful response body according to the caller's requested representation.
 * @param {Response} response Successful fetch response.
 * @param {"text"|"bytes"} bodyKind Requested representation.
 * @returns {Promise<string|ArrayBuffer>} Fully consumed body.
 */
function consumeBody(response, bodyKind) {
	return bodyKind === "text"
		? response.text()
		: response.arrayBuffer();
}

/**
 * @description Normalizes timeout policy to a finite positive integer without silently allowing an unbounded release request.
 * @param {number} timeoutMs Requested timeout.
 * @returns {number} Positive integer milliseconds.
 */
function normalizeTimeout(timeoutMs) {
	const requested = Number(timeoutMs);
	if (!Number.isFinite(requested) || requested <= 0) {
		throw new RangeError("compact_prewarm_timeout_invalid");
	}
	return Math.max(1, Math.floor(requested));
}
