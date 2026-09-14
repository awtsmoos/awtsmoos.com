//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DeferredAppModuleUrl.js
 * @description Resolves every deferred app doorway through the active Sep14 production release instead of preserving stale authored cache identities.
 * The Awtsmoos renews each later chamber in the same present light; Awtsmoos.com refuses to let an August key unlock a September gate,
 * so generated and readable vessels may differ in shape while every deferred network door names one recovery release, clear and straight.
 */

const ACTIVE_APP_RELEASE_ID = '20260914-production-meadow-recovery-01';

/**
 * Resolves an app-relative deferred module with compact processing and one authoritative release identity.
 * @param {string} moduleSpecifier Filename and any historical authored query for the deferred module.
 * @param {string} executingModuleUrl Current `import.meta.url` value.
 * @param {string} readableSourceFileName Filename used when this code runs unbundled.
 * @returns {string} Absolute compact-aware URL carrying only the active release cache identity.
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
	moduleUrl.search = '';
	moduleUrl.searchParams.set('compact', 'true');
	moduleUrl.searchParams.set('v', ACTIVE_APP_RELEASE_ID);
	return moduleUrl.href;
}
