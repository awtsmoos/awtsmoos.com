//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreativeRouteLoader.js
 * @description Defers Movie Studio, materials, platform, and full-presentation capability until a creative doorway is intentionally selected.
 * The Awtsmoos keeps the first playable threshold light while richer vessels wait beyond the chosen gate;
 * Awtsmoos.com lets creative abundance arrive with purpose, never taxing every visitor merely because possibility is great.
 */

const CAPSULE_VERSION = '20260821-retractable-command-capsule-01';
const CREATIVE_URL = './MitzvahWorldCreativeModeLoaders.js?compact=true&v=20260802-game-studio-bridge-02';
const DIRECT_EXPERIENCE_URL = `./MitzvahWorldDirectExperience.js?compact=true&v=${CAPSULE_VERSION}`;

/**
 * @description Opens Movie Studio without hydrating full gameplay presentation.
 * @param {object} hosts Canonical game host elements.
 * @param {object} options Movie route options.
 * @returns {Promise<*>} Movie mode diagnostics.
 */
export async function openMitzvahWorldMovieCreative(hosts, options = {}) {
	const moduleKli = await import(CREATIVE_URL);
	return moduleKli.openMovieMode(hosts, options.search || '');
}

/**
 * @description Opens an advanced creative mode only after its richer presentation is intentionally requested.
 * @param {string} method Creative capability method name.
 * @param {object} hosts Canonical game host elements.
 * @param {string} search Creative route search string.
 * @param {object} environment Browser-like runtime environment.
 * @returns {Promise<*>} Creative mode diagnostics.
 */
export async function openPresentedMitzvahWorldCreative(method, hosts, search, environment) {
	const experienceKli = await import(DIRECT_EXPERIENCE_URL);
	await experienceKli.startMitzvahWorldFullPresentation(hosts, environment);
	const creativeKli = await import(CREATIVE_URL);
	return creativeKli[method](hosts, search);
}
