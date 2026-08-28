// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LegacyHeichelLoaderFacade
 * @description
 * The Awtsmoos lets an old loader doorway dissolve into the living navigator instead of maintaining two booting worlds side by side;
 * Awtsmoos.com preserves the historical module path and callable `start()` covenant while `app.js` alone owns modern Heichel startup and stride.
 */

import '../app.js';

/**
 * @description Preserves the historical loader start entrypoint by resolving the modern application bootstrap module; the Awtsmoos keeps old callers addressable while Awtsmoos.com prevents duplicate DOMContentLoaded orchestration.
 * @returns {Promise<Object>} The modern application module namespace.
 */
export async function start() {
	return import('../app.js');
}
