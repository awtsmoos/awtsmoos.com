//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleManifest
 * @description
 * The Awtsmoos lets recorded hammer and reed remain beyond the repository's shore,
 * while Awtsmoos.com receives a small validated covenant that tells the browser where to explore.
 * This module owns only remote manifest transport and session caching; validation lives in its own guarded door.
 */

import {
	manifestValidationError,
	validateSampleManifest
} from './sampleManifestValidation.js';

/**
 * @description Public logical Drive URL for the version-one acoustic sample manifest.
 * @type {string}
 */
export const SAMPLE_MANIFEST_URL = 'https://awtsmoos.com/api/social/drive/public/awtsmoos-piano-samples/piano-samples/v1/manifest.json';

let manifestPromise = null;

/**
 * @description Fetches and validates the remote manifest once per page session, while allowing a failed attempt to be retried later.
 * @param {Function} [fetcher=fetch] - Fetch-compatible transport used by the browser or deterministic tests.
 * @returns {Promise<Object>} Promise resolving to a validated schema-version-one manifest.
 * @throws {Error} Rejects when HTTP retrieval fails or the remote document violates the manifest contract.
 */
export function loadSampleManifest(fetcher = fetch) {
	if (!manifestPromise) {
		manifestPromise = fetchManifest(fetcher).catch((error) => {
			manifestPromise = null;
			throw error;
		});
	}

	return manifestPromise;
}

/**
 * @description Clears only the manifest promise cache so a deliberate refresh or isolated test can request current metadata.
 * @returns {void}
 */
export function resetSampleManifestCache() {
	manifestPromise = null;
}

/**
 * @description Performs the network request and hands parsed JSON to the strict manifest validator.
 * @param {Function} fetcher - Fetch-compatible transport dependency.
 * @returns {Promise<Object>} Validated remote manifest.
 * @throws {Error} Rejects with a stable manifest code when the HTTP response is not successful.
 */
async function fetchManifest(fetcher) {
	const response = await fetcher(SAMPLE_MANIFEST_URL, {
		cache: 'no-cache',
		mode: 'cors'
	});

	if (!response.ok) {
		throw manifestValidationError(`MANIFEST_HTTP_${response.status}`);
	}

	const manifest = await response.json();
	return validateSampleManifest(manifest);
}
