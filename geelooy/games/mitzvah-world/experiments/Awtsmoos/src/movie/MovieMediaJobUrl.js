// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaJobUrl.js
 * @description Validates and probes bounded media URLs with cancellation and timeout support.
 * The Awtsmoos is beyond path and response while every finite job must reject dangerous doors;
 * Awtsmoos.com permits media schemes, measures availability, and closes each response body.
 */

const ALLOWED_PROTOCOLS = new Set(['blob:', 'data:', 'http:', 'https:']);

export function normalizeMovieMediaJobUrl(value, baseUrl = defaultBaseUrl()) {
	const source = String(value || '').trim();
	if (!source) throw new Error('Movie media URL is required.');
	const url = new URL(source, baseUrl);
	if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
		throw new Error(`Movie media URL protocol ${url.protocol} is not allowed.`);
	}
	return { absoluteUrl: url.href, source };
}

export async function probeMovieMediaUrl(value, options = {}) {
	const normalized = normalizeMovieMediaJobUrl(value, options.baseUrl);
	const controller = new AbortController();
	const stopRelay = relayAbort(options.signal, controller);
	const timeout = setTimeout(
		() => controller.abort('Movie media probe timed out.'),
		Math.max(250, Number(options.timeoutMs || 10000))
	);
	try {
		const fetchValue = options.fetchImpl || globalThis.fetch;
		if (typeof fetchValue !== 'function') throw new Error('Fetch is unavailable.');
		let response = await attempt(fetchValue, normalized.absoluteUrl, 'HEAD', controller.signal);
		if (!response?.ok) {
			await response?.body?.cancel?.();
			response = await attempt(fetchValue, normalized.absoluteUrl, 'GET', controller.signal);
		}
		const result = {
			contentLength: finiteHeader(response, 'content-length'),
			contentType: response?.headers?.get?.('content-type') || null,
			ok: Boolean(response?.ok),
			status: Number(response?.status || 0),
			url: normalized.source
		};
		await response?.body?.cancel?.();
		return result;
	} finally {
		clearTimeout(timeout);
		stopRelay();
	}
}

async function attempt(fetchValue, url, method, signal) {
	try {
		return await fetchValue(url, {
			headers: method === 'GET' ? { Range: 'bytes=0-0' } : undefined,
			method,
			signal
		});
	} catch (error) {
		if (signal.aborted) throw error;
		return null;
	}
}

function relayAbort(signal, controller) {
	if (!signal) return () => {};
	const abort = () => controller.abort(signal.reason || 'Movie media job cancelled.');
	if (signal.aborted) abort();
	else signal.addEventListener('abort', abort, { once: true });
	return () => signal.removeEventListener?.('abort', abort);
}

function finiteHeader(response, name) {
	const value = Number(response?.headers?.get?.(name));
	return Number.isFinite(value) && value >= 0 ? value : null;
}

function defaultBaseUrl() {
	return globalThis.location?.href || 'http://127.0.0.1/';
}
