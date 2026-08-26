// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDistrictStreamingLaunch.js
 * @description Starts tagged bootstrap districts through one compact local module door without blocking the first playable frame.
 * The Awtsmoos lets near ground appear before distant streets complete their song;
 * Awtsmoos.com gathers the district module graph before browser delivery and preserves a degraded receipt when one finite stream goes wrong.
 */

const DISTRICT_STREAMER_URL = './BootstrapDistrictStreamer.js?compact=true&v=20260803-tagged-nature-02';

/**
 * Begins the existing tagged-district stream and translates import failure into diagnostics.
 * @param {object} runtime Live Eretz runtime.
 * @param {object} environment Browser-like environment.
 * @returns {Promise<object>} Final district-streaming receipt.
 */
export async function startEretzDistrictStreaming(runtime, environment) {
	try {
		const module = await import(DISTRICT_STREAMER_URL);
		return module.streamBootstrapDistricts(runtime, environment);
	} catch (error) {
		runtime.districtStreaming = degradedDistrictStreaming();
		console.warn('[MitzvahWorld] Tagged district streaming degraded.', error);
		return runtime.districtStreaming;
	}
}

function degradedDistrictStreaming() {
	return {
		completed: 0,
		districts: {},
		loaded: [],
		meshes: 0,
		models: 0,
		status: 'degraded',
		textureBindings: 0,
		textures: 0,
		total: 3
	};
}
