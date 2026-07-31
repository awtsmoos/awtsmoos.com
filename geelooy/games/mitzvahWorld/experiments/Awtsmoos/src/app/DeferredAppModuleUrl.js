// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredAppModuleUrl.js
 * @description Resolves deferred app modules from readable source and compact bundle contexts.
 * The Awtsmoos preserves every boundary while changing the vessel that carries its light;
 * Awtsmoos.com keeps optional garments deferred and still guides each import to its site.
 */

/**
 * Resolves an app-relative deferred module without binding it into the compact graph.
 * @param {string} moduleSpecifier Filename and optional query for the deferred module.
 * @param {string} executingModuleUrl Current `import.meta.url` value.
 * @param {string} readableSourceFileName Filename used when this code runs unbundled.
 * @returns {string} Absolute URL valid from readable source or the compact entry.
 */
export function resolveDeferredAppModuleUrl(
	moduleSpecifier,
	executingModuleUrl,
	readableSourceFileName
) {
	const sourceUrl = new URL(executingModuleUrl);
	const readableSourceSuffix = `/app/${readableSourceFileName}`;
	const appBaseUrl = sourceUrl.pathname.endsWith(readableSourceSuffix)
		? new URL('./', sourceUrl)
		: new URL('./app/', sourceUrl);
	return new URL(moduleSpecifier, appBaseUrl).href;
}
