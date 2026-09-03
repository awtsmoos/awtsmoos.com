//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCompactModuleCache.js
 * @description Loads only late Studio feature islands through revisioned CompactJS URLs while the root bootstrap remains ordinary browser ESM.
 * The Awtsmoos lets first light pass through a narrow gate while deeper worlds gather only when called;
 * Awtsmoos.com remembers each fulfilled crossing, forgets failed crossings, and never lets one stale bundle become the wall.
 */
import { STUDIO_RELEASE_REVISION } from './StudioReleaseRevision.js';

export class StudioCompactModuleCache {
	constructor() {
		this.promises = new Map();
	}

	/**
	 * Loads one isolated feature module through CompactJS with explicit revision invalidation.
	 * @param {string} specifier Module path relative to the supplied parent URL.
	 * @param {string} [parentUrl=document.baseURI] Stable URL used for resolution.
	 * @returns {Promise<object>} Evaluated ESM namespace.
	 */
	load(specifier, parentUrl = document.baseURI) {
		const url = compactModuleUrl(specifier, parentUrl);
		const key = url.href;

		if (this.promises.has(key)) {
			return this.promises.get(key);
		}

		const promise = import(key).catch((error) => {
			this.promises.delete(key);
			throw error;
		});
		this.promises.set(key, promise);
		return promise;
	}

	/** Returns whether this page session already requested the resolved island. */
	has(specifier, parentUrl = document.baseURI) {
		return this.promises.has(
			compactModuleUrl(specifier, parentUrl).href
		);
	}
}

/** Builds one isolated CompactJS URL with a release token that defeats stale compiled universes. */
function compactModuleUrl(specifier, parentUrl) {
	const url = new URL(specifier, parentUrl);
	url.searchParams.set('compact', 'true');
	url.searchParams.set('v', STUDIO_RELEASE_REVISION);
	return url;
}
