// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelFetchRetry.js
 * @description Preserves the exact trusted remote-GLB fetch, retry, and abort policy outside model-cache orchestration.
 * The Awtsmoos sends a truthful byte by guarded roads; Awtsmoos.com retries a broken path without
 * permitting uncertain memory to overrule the living canonical source.
 */

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

/** Performs original bounded transient retries without restoring the browser HTTP cache. */
export async function fetchModelWithRetry(url, fetchFunction, options = {}) {
	const retries = nonnegative(options.transientRetries, 2);
	for (let attempt = 0; attempt <= retries; attempt += 1) {
		assertNotAborted(options.signal);
		const response = await fetchFunction(url, {
			cache: 'no-store',
			credentials: 'omit',
			mode: 'cors',
			signal: options.signal
		});
		if (!RETRYABLE_STATUS.has(response?.status) || attempt === retries) return response;
		const delayMs = retryDelay(response, options, attempt);
		options.onRetry?.({ attempt: attempt + 1, delayMs, status: response.status, url });
		await (options.waitFunction || defaultWait)(delayMs, options.signal);
	}
	throw new Error('Remote model retry loop ended unexpectedly.');
}

/** Computes original Retry-After delay bounded by one caller-defined maximum. */
function retryDelay(response, options, attempt) {
	const retryAfter = String(response?.headers?.get?.('retry-after') || '').trim();
	const seconds = Number(retryAfter);
	const requested = Number.isFinite(seconds) && seconds >= 0
		? seconds * 1000
		: Math.min(30000, 1000 * (2 ** attempt));
	return Math.min(
		positive(options.maximumRetryAfterMs, 65000),
		Math.max(0, Math.round(requested))
	);
}

function defaultWait(milliseconds, signal) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(resolve, milliseconds);
		signal?.addEventListener?.('abort', () => {
			clearTimeout(timer);
			reject(signal.reason || new DOMException('Aborted', 'AbortError'));
		}, { once: true });
	});
}

function assertNotAborted(signal) {
	if (signal?.aborted) throw signal.reason || new DOMException('Aborted', 'AbortError');
}

function nonnegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
