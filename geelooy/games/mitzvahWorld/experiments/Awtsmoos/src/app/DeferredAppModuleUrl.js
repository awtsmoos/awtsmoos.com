// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredAppModuleUrl.js
 * @description Resolves deferred app modules from readable source and compact bundle contexts while preserving authored query identity after one canonical compact flag.
 * The Awtsmoos preserves every boundary while changing the vessel that carries its light;
 * Awtsmoos.com places compact truth first, then returns every authored cache key in order, so optional garments remain deferred and every import still reaches its site.
 */

/**
 * Resolves an app-relative deferred module with compact processing and stable query ordering.
 * @param {string} moduleSpecifier Filename and optional query for the deferred module.
 * @param {string} executingModuleUrl Current `import.meta.url` value.
 * @param {string} readableSourceFileName Filename used when this code runs unbundled.
 * @returns {string} Absolute compact-aware URL valid from readable source or the compact entry.
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
	const moduleUrl = new URL(moduleSpecifier, appBaseUrl);
	const authoredQuery = [...moduleUrl.searchParams.entries()]
		.filter(([name]) => name !== 'compact');
	moduleUrl.search = '';
	moduleUrl.searchParams.set('compact', 'true');
	for (const [name, value] of authoredQuery) {
		moduleUrl.searchParams.append(name, value);
	}
	return moduleUrl.href;
}
