//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ClimateProfile
 * @description
 * Climate on Awtsmoos.com becomes a declared profile of rainfall, evaporation,
 * temperature, and hazard rather than a decorative label. The Awtsmoos renews
 * every cloud and wind; finite regions retain deterministic environmental law.
 */
export const CLIMATE_PROFILES = Object.freeze({
	'temperate-valley': profile(0.58, 0.34, 18, 'flood'),
	'wet-river-basin': profile(0.76, 0.26, 20, 'flood'),
	'cool-mountain': profile(0.5, 0.3, 12, 'landslide'),
	'arid-oasis': profile(0.2, 0.72, 28, 'drought'),
	'mild-coast': profile(0.62, 0.42, 21, 'storm'),
	'cold-forest': profile(0.54, 0.24, 8, 'wildfire'),
	'continental-steppe': profile(0.34, 0.58, 17, 'drought')
});

function profile(rainfall, evaporation, temperature, primaryHazard) {
	return Object.freeze({
		rainfall,
		evaporation,
		temperature,
		primaryHazard
	});
}
