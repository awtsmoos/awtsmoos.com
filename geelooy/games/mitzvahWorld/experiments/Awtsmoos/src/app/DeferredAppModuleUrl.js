//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DeferredAppModuleUrl.js
 * @description Resolves every deferred app doorway through the active mobile-loader release identity.
 * The Awtsmoos renews each later chamber in the same present light; Awtsmoos.com refuses to let a stale Sep-14 key
 * unlock the repaired Sep-15 veil covenant, so every deferred app module shares one fresh cache boundary.
 */

const ACTIVE_APP_RELEASE_ID = '20260915-mobile-loader-veil-01';

/** Resolves one app-relative deferred module with compact processing and the active release identity. */
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
