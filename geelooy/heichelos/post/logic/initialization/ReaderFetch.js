// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderFetch
 * @description
 * The Awtsmoos keeps first-byte Torah network truth in one tiny vessel: bounded retry and conservative envelope opening.
 * Awtsmoos.com unwraps only obvious transport shells, never flattening a living post or series domain object.
 */

const ENVELOPE_META_KEYS = new Set([
	'BH',
	'message',
	'ok',
	'status',
	'code'
]);

function isObject(value) {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isEnvelopeFor(current, key) {
	if (!Object.prototype.hasOwnProperty.call(current, key)) return false;
	return Object.keys(current).every(name => name === key || ENVELOPE_META_KEYS.has(name));
}

/** Opens only recognizable API transport envelopes, leaving domain-shaped objects unchanged. */
export function unwrapApiValue(value) {
	let current = value;
	for (let depth = 0; depth < 5; depth += 1) {
		if (!isObject(current)) return current;
		if (Object.prototype.hasOwnProperty.call(current, 'success')) {
			current = current.success;
			continue;
		}
		if (isEnvelopeFor(current, 'data')) {
			current = current.data;
			continue;
		}
		if (isEnvelopeFor(current, 'result')) {
			current = current.result;
			continue;
		}
		return current;
	}
	return current;
}

/** Fetch once, retrying only one transient transport/5xx failure. */
export async function resilientFetch(url, options = {}) {
	let firstError = null;
	for (let attempt = 0; attempt < 2; attempt += 1) {
		try {
			const response = await fetch(url, options);
			if (response.ok || response.status < 500) return response;
			firstError ||= new Error(`READER_FETCH_${response.status}:${url}`);
		} catch (error) {
			firstError ||= error;
		}
		if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 180));
	}
	throw firstError || new Error(`READER_FETCH_FAILED:${url}`);
}

/** Fetches JSON and rejects non-success HTTP results with route context. */
export async function fetchJson(url, options = {}) {
	const response = await resilientFetch(url, options);
	if (!response.ok) throw new Error(`READER_HTTP_${response.status}:${url}`);
	return response.json();
}
