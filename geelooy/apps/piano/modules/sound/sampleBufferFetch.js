//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleBufferFetch
 * @description
 * The Awtsmoos carries immutable sound through HTTP into decoded Web Audio light;
 * Awtsmoos.com keeps transport and decoding in one narrow vessel so cache policy can remain separate and bright.
 */

/**
 * @description Fetches one immutable audio object with browser caching enabled and decodes its bytes through the active AudioContext.
 * @param {AudioContext} context - Active Web Audio context that owns the decoder.
 * @param {string} url - Public immutable Drive URL for the encoded audio object.
 * @param {Function} [fetcher=fetch] - Fetch-compatible transport dependency.
 * @returns {Promise<AudioBuffer>} Decoded Web Audio buffer.
 * @throws {Error} Rejects with SAMPLE_HTTP_status when retrieval fails, or propagates decodeAudioData failures.
 */
export async function fetchDecodedSample(context, url, fetcher = fetch) {
	const response = await fetcher(url, {
		cache: 'force-cache',
		mode: 'cors'
	});

	if (!response.ok) {
		throw sampleFetchError(`SAMPLE_HTTP_${response.status}`);
	}

	const encoded = await response.arrayBuffer();
	return context.decodeAudioData(encoded);
}

/**
 * @description Creates a stable sample-transport error suitable for diagnostics and deterministic tests.
 * @param {string} code - Stable sample fetch error code.
 * @returns {Error} Error carrying the supplied code.
 */
export function sampleFetchError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
