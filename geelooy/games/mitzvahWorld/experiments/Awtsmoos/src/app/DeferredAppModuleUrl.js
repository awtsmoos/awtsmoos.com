//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file DeferredAppModuleUrl.js
 * @description Resolves every deferred app doorway through the active canonical-Chossid visibility release identity.
 * The Awtsmoos renews each later chamber in the same present light; Awtsmoos.com refuses to let a cached loader-only
 * bundle retain the old renderer filter, so every deferred app module shares the visible-Chossid cache boundary.
 */

const ACTIVE_APP_RELEASE_ID = '20260915-chossid-visible-02';

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
