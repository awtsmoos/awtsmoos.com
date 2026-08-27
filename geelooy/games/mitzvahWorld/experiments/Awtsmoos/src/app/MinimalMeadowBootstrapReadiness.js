// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapReadiness.js
 * @description Awaits the real bootstrap minimap before essential gameplay is declared ready.
 * The Awtsmoos lets six mechanics awaken quickly yet refuses a mapless readiness crown;
 * Awtsmoos.com records the awaited garment and names the gate if its vessel cannot be found.
 */

/**
 * Resolves the bootstrap essential receipt only after the real minimap mounts.
 *
 * @param {object} bootstrap Bootstrap feature handle.
 * @param {object} [timeline] Shared boot timeline.
 * @returns {Promise<Readonly<object>>} Complete essential readiness receipt.
 */
export async function awaitMinimalMeadowBootstrapReadiness(
	bootstrap,
	timeline = null
) {
	timeline?.mark?.('bootstrap-minimap-wait');
	const essential = await Promise.resolve(
		bootstrap?.readyPromise || bootstrap?.essential
	);
	if (!essential?.minimap || !essential?.ready) {
		timeline?.mark?.('bootstrap-minimap-failed');
		throw minimapUnavailableError(bootstrap);
	}
	timeline?.mark?.('bootstrap-minimap-ready');
	return essential;
}

function minimapUnavailableError(bootstrap) {
	const error = new Error(
		'Essential gameplay could not mount the bootstrap minimap.'
	);
	error.name = 'MinimalMeadowBootstrapMinimapUnavailable';
	error.code = 'MINIMAL_MEADOW_MINIMAP_UNAVAILABLE';
	error.details = Object.freeze({
		diagnostics: bootstrap?.diagnostics?.() || null,
		missing: Object.freeze(['minimap'])
	});
	return error;
}
