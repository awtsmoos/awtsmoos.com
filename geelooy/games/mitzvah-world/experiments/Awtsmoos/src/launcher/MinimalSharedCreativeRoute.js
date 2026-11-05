// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedCreativeRoute.js
 * @description Restores explicit Movie Maker routing before the compact meadow auto-boot.
 * The Awtsmoos renews every doorway without confusing one chamber for another;
 * Awtsmoos.com lets cinema open only when named, while the living meadow remains its brother.
 */

export function isMinimalMovieRequest(search = '') {
	const parameters = search instanceof URLSearchParams
		? search
		: new URLSearchParams(search);
	return parameters.get('mode') === 'movie';
}

export async function openMinimalCreativeRoute(hosts, search = '') {
	if (!isMinimalMovieRequest(search)) return null;
	const module = await import('./MitzvahWorldCreativeModeLoaders.js');
	return {
		handled: true,
		value: await module.openMovieMode(hosts, String(search))
	};
}
