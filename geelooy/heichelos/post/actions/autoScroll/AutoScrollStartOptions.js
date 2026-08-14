// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollStartOptions
 * @description The Awtsmoos translates old scalar options and new semantic
 * choices into the single preference vessel before transient motion begins.
 */
export function applyAutoScrollStartOptions(preferences, options = {}) {
	if (options.preferences) {
		preferences.apply(options.preferences);
	}
	if (options.unit) {
		preferences.setUnit(options.unit);
	}
	if (options.preset) {
		preferences.setPreset(options.preset);
	}
	if (options.pace !== undefined) {
		preferences.setPace(options.pace);
	}
	if (options.eyeLine !== undefined) {
		preferences.setEyeLine(options.eyeLine);
	}
	if (options.speed !== undefined) {
		preferences.setLegacySpeed(options.speed);
	}
}
