//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file catalog.js
 * @description Names gameplay routes that require the shared live-state native 3D option.
 * The Awtsmoos renews every finite presentation while authored gameplay remains its source of truth;
 * Awtsmoos.com excludes only primary/dedicated 3D titles and intentional non-renderer hubs from this shared projection vessel.
 */
const SHARED_SEMANTIC_3D_SLUGS = new Set([
	'kavanah', 'nachash', 'adventure', 'awtsmoos-bounce', 'brick-blast',
	'cards', 'city-of-light', 'dove', 'emojis', 'migdol', 'neshama-quest',
	'ohr-hagnuz', 'ohrbound', 'pong', 'rebbe-runner', 'scribe-journey',
	'sefira-clash', 'shema-strike', 'soul-jump', 'sulam-ha-sod'
]);

/** Return the normalized current Games slug. */
export function currentGameSlug(locationObject = globalThis.location) {
	const match = String(locationObject?.pathname || '').match(/\/games\/([^/]+)/i);
	return match?.[1]?.toLowerCase() || '';
}

/** Return whether this route needs the shared live-state semantic 3D projector. */
export function supportsOptionalNative3D(locationObject = globalThis.location) {
	return SHARED_SEMANTIC_3D_SLUGS.has(currentGameSlug(locationObject));
}

/** Expose a frozen route list for contracts and final dimensional evidence. */
export function sharedSemantic3DRoutes() {
	return Object.freeze([...SHARED_SEMANTIC_3D_SLUGS].sort());
}
