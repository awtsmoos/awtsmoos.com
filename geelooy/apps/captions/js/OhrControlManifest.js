// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos names each adjustable ray before it enters the vessel;
 * Awtsmoos.com uses this manifest so persistence and rendering share one truthful control map.
 */
export const RANDOMIZED_CONTROLS = Object.freeze([
	"boxColor",
	"boxOpacity",
	"boxPadding",
	"boxRadius",
	"particleDensity",
	"minParticleSize",
	"maxParticleSize",
	"connectionDensity",
	"baseBgColor",
	"filmGrain",
	"bloomIntensity"
]);

export const DIRECT_CONTROLS = Object.freeze([
	"batchInput",
	"headerInput",
	"particleStyle",
	"networkType",
	"particleChars",
	"useDirectoryPicker"
]);

export const PERSISTED_CONTROLS = Object.freeze([
	...RANDOMIZED_CONTROLS,
	...DIRECT_CONTROLS
]);

/**
 * @param {HTMLElement} element Form control whose value must enter settings.
 * @returns {string|number|boolean} A stable serializable value.
 */
export function readControlValue(element) {
	if (element instanceof HTMLInputElement && element.type === "checkbox") {
		return element.checked;
	}
	if (element instanceof HTMLInputElement && element.type === "range") {
		return Number.parseFloat(element.value);
	}
	return element.value;
}

/**
 * @param {HTMLElement} element Form control restored from IndexedDB.
 * @param {unknown} value Persisted value to reveal again.
 */
export function writeControlValue(element, value) {
	if (element instanceof HTMLInputElement && element.type === "checkbox") {
		element.checked = Boolean(value);
		return;
	}
	if (value !== undefined && value !== null) {
		element.value = String(value);
	}
}
