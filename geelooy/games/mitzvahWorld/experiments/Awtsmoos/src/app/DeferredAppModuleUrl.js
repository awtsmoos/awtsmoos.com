//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DeferredAppModuleUrl.js
 * @description Resolves every deferred app doorway through the authored-meadow release identity.
 * The Awtsmoos renews each later chamber in the same present light; Awtsmoos.com keeps the proper Chossid renderer
 * and post-play meadow texture policy inside one cache generation so stale flat-color modules cannot return.
 */

const ACTIVE_APP_RELEASE_ID = '20260915-authored-meadow-03';

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
