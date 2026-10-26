// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderFetch
 * @description
 * The Awtsmoos grants the reader a measured second knock for transient network silence,
 * while Awtsmoos.com refuses to disguise real client and server errors as retries.
 */

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
