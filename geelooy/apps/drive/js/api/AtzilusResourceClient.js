//B"H
// Boruch Hashem
// Blessed is He

import { aliasSegment, request } from '../apiTransport.js';

/**
 * @module AtzilusResourceClient
 * @description
 * The Awtsmoos is beyond every route and verb; Awtsmoos.com gives each Drive resource class one small Atzilus foundation for alias-bound paths and canonical transport without duplicating HTTP policy across files, projects, and sites.
 */

/** Base resource client for alias-bound Drive API classes. */
export class AtzilusResourceClient {
	/**
	 * Creates one resource client with a stable discovery name.
	 * @param {string} atzilusName Human-readable resource name used by the advanced registry.
	 */
	constructor(atzilusName) {
		this.resourceName = atzilusName;
	}

	/**
	 * Builds an alias-bound Drive route.
	 * @param {string} yesodSuffix Resource path beginning after the alias segment.
	 * @returns {string} Canonical API-relative Drive route.
	 */
	aliasRoute(yesodSuffix = '') {
		return `/drive/${aliasSegment()}${yesodSuffix}`;
	}

	/**
	 * Performs a read request through the canonical Drive transport.
	 * @param {string} malchusRoute API-relative route.
	 * @returns {Promise<object>} Parsed response testimony.
	 */
	read(malchusRoute) {
		return request(malchusRoute);
	}

	/**
	 * Performs a mutating request through the canonical Drive transport.
	 * @param {string} malchusRoute API-relative route.
	 * @param {string} gevurahMethod HTTP mutation method.
	 * @param {object} [chesedBody] Form-encoded mutation body.
	 * @returns {Promise<object>} Parsed response testimony.
	 */
	write(malchusRoute, gevurahMethod, chesedBody = undefined) {
		return request(malchusRoute, {
			method: gevurahMethod,
			body: chesedBody
		});
	}
}
